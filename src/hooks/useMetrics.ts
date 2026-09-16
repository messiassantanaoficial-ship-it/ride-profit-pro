import { useMemo } from "react";
import { useProfile, useRows, type Row } from "./useData";
import { dailyEquivalent, daysInRange, safeDiv, sum } from "@/lib/finance";
import { modalityGroup } from "@/lib/domain";

export type Range = { from: string; to: string };

const inRange = (date: string | null | undefined, range: Range) =>
  !!date && date >= range.from && date <= range.to;

export function useMetrics(range: Range) {
  const rides = useRows("rides");
  const fixed = useRows("fixed_expenses");
  const variable = useRows("variable_expenses");
  const fuel = useRows("fuel_logs");
  const maintenance = useRows("maintenances");
  const profile = useProfile();

  const loading =
    rides.isLoading || fixed.isLoading || variable.isLoading || fuel.isLoading || maintenance.isLoading;

  const data = useMemo(() => {
    const allRides = (rides.data ?? []) as Row[];
    const allVariable = (variable.data ?? []) as Row[];
    const allFuel = (fuel.data ?? []) as Row[];
    const allMaintenance = (maintenance.data ?? []) as Row[];
    const activeFixed = ((fixed.data ?? []) as Row[]).filter((row) => row.active);

    const periodRides = allRides.filter((r) => inRange(r.ride_date, range));
    const periodVariable = allVariable.filter((r) => inRange(r.expense_date, range) && !r.is_personal);
    const personalExpenses = allVariable.filter((r) => inRange(r.expense_date, range) && r.is_personal);
    const periodFuel = allFuel.filter((r) => inRange(r.fuel_date, range));
    const periodMaintenance = allMaintenance.filter((r) => inRange(r.service_date, range));

    const days = daysInRange(range);
    const fixedDaily = sum(activeFixed, (r) => dailyEquivalent(Number(r.amount), r.periodicity, r.custom_days));
    const fixedTotal = fixedDaily * days;

    const gross = sum(periodRides, (r) => Number(r.gross));
    const fees = sum(periodRides, (r) => Number(r.fee));
    const net = gross - fees;
    const variableTotal = sum(periodVariable, (r) => Number(r.amount));
    const maintenanceTotal = sum(periodMaintenance, (r) => Number(r.amount));
    const fuelTotal = sum(periodFuel, (r) => Number(r.total_amount));
    const expensesTotal = variableTotal + fixedTotal;
    const profit = gross - fees - variableTotal - fixedTotal;

    const km = sum(periodRides, (r) => Number(r.distance_km));
    const minutes = sum(periodRides, (r) => Number(r.duration_min));
    const ridesCount = periodRides.length;

    const byGroup = new Map<
      string,
      { gross: number; fees: number; net: number; count: number; km: number; minutes: number }
    >();
    for (const ride of periodRides) {
      const key = modalityGroup(ride.modality);
      const current = byGroup.get(key) ?? { gross: 0, fees: 0, net: 0, count: 0, km: 0, minutes: 0 };
      current.gross += Number(ride.gross) || 0;
      current.fees += Number(ride.fee) || 0;
      current.net += (Number(ride.gross) || 0) - (Number(ride.fee) || 0);
      current.count += 1;
      current.km += Number(ride.distance_km) || 0;
      current.minutes += Number(ride.duration_min) || 0;
      byGroup.set(key, current);
    }

    const modalityRows = Array.from(byGroup.entries())
      .map(([name, value]) => {
        const share = safeDiv(value.gross, gross) * 100;
        const cost = expensesTotal * (safeDiv(value.gross, gross) || 0);
        return {
          name,
          ...value,
          share,
          cost,
          profit: value.net - cost,
          avgRide: safeDiv(value.gross, value.count),
          perKm: safeDiv(value.net, value.km),
        };
      })
      .sort((a, b) => b.gross - a.gross);

    const liters = sum(periodFuel, (r) => Number(r.liters));
    const workedDays = new Set(periodRides.map((r) => r.ride_date)).size || 0;
    const goal = Number(profile.data?.revenue_goal ?? 0);
    const monthlyFixed = fixedDaily * 30;

    return {
      gross,
      fees,
      net,
      variableTotal,
      fixedTotal,
      fixedDaily,
      monthlyFixed,
      expensesTotal,
      profit,
      personalTotal: sum(personalExpenses, (r) => Number(r.amount)),
      maintenanceTotal,
      fuelTotal,
      liters,
      fuelPerLiter: safeDiv(fuelTotal, liters),
      km,
      hours: minutes / 60,
      ridesCount,
      days,
      workedDays,
      avgRide: safeDiv(gross, ridesCount),
      perKm: safeDiv(net, km),
      perHour: safeDiv(net, minutes / 60),
      costPerKm: safeDiv(expensesTotal, km),
      costPerDay: safeDiv(expensesTotal, workedDays || days),
      breakEvenDaily: safeDiv(expensesTotal, days),
      breakEvenMonthly: monthlyFixed,
      projection: safeDiv(gross, days) * 30,
      goal,
      goalPct: safeDiv(gross, goal) * 100,
      goalRemaining: Math.max(0, goal - gross),
      modalityRows,
      periodRides,
      periodVariable,
      periodFuel,
      periodMaintenance,
      activeFixed,
    };
  }, [rides.data, fixed.data, variable.data, fuel.data, maintenance.data, profile.data, range]);

  return { ...data, loading, profile: profile.data ?? null };
}
