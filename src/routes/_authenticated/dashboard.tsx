import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Car,
  CircleDollarSign,
  Gauge,
  Receipt,
  Route as RouteIcon,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { PeriodFilter } from "@/components/app/PeriodFilter";
import { StatCard } from "@/components/app/StatCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMetrics } from "@/hooks/useMetrics";
import { useProfile } from "@/hooks/useData";
import { brl, num, pct, periodRange, previousRange, safeDiv, todayISO, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Motorista Pro" },
      { name: "description", content: "Faturamento, taxas, despesas, metas e lucro estimado do período." },
      { property: "og:title", content: "Dashboard — Motorista Pro" },
      { property: "og:description", content: "Acompanhe faturamento, despesas e lucro estimado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const [custom, setCustom] = useState({ from: todayISO(), to: todayISO() });

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const prev = useMemo(() => previousRange(range), [range]);
  const metrics = useMetrics(range);
  const previous = useMetrics(prev);

  useEffect(() => {
    if (profile.data && profile.data.onboarded === false) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profile.data, navigate]);

  const variation = safeDiv(metrics.gross - previous.gross, previous.gross) * 100;

  const chartData = metrics.modalityRows.map((row) => ({
    name: row.name,
    Bruto: Number(row.gross.toFixed(2)),
    Líquido: Number(row.net.toFixed(2)),
  }));

  const expenseData = [
    { name: "Taxas de aplicativos", value: Number(metrics.fees.toFixed(2)) },
    { name: "Despesas variáveis", value: Number(metrics.variableTotal.toFixed(2)) },
    { name: "Taxas e despesas fixas", value: Number(metrics.fixedTotal.toFixed(2)) },
  ].filter((item) => item.value > 0);

  return (
    <>
      <PageHeader
        title={`Olá, ${(profile.data?.full_name as string) || "motorista"}`}
        subtitle="Visão geral do seu faturamento, custos e lucro estimado."
        actions={
          <Button asChild>
            <Link to="/corridas">Registrar corrida</Link>
          </Button>
        }
      />

      <PeriodFilter value={period} onChange={setPeriod} custom={custom} onCustomChange={setCustom} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento bruto" value={brl(metrics.gross)} icon={CircleDollarSign} />
        <StatCard label="Taxas descontadas" value={brl(metrics.fees)} icon={Receipt} tone="negative" />
        <StatCard
          label="Total de despesas"
          value={brl(metrics.expensesTotal)}
          hint={`Variáveis ${brl(metrics.variableTotal)} · Fixas ${brl(metrics.fixedTotal)}`}
          icon={Wallet}
          tone="negative"
        />
        <StatCard
          label="Lucro estimado"
          value={brl(metrics.profit)}
          hint="Estimativa com base nos dados registrados"
          icon={TrendingUp}
          tone={metrics.profit >= 0 ? "positive" : "negative"}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Corridas" value={num(metrics.ridesCount, 0)} icon={Car} />
        <StatCard label="Quilômetros rodados" value={`${num(metrics.km)} km`} icon={RouteIcon} />
        <StatCard label="Valor médio por corrida" value={brl(metrics.avgRide)} />
        <StatCard label="Ganho médio por hora" value={brl(metrics.perHour)} icon={Gauge} />
        <StatCard label="Custo médio por km" value={brl(metrics.costPerKm)} />
        <StatCard label="Ganho médio por km" value={brl(metrics.perKm)} />
        <StatCard
          label="Mínimo diário para cobrir custos"
          value={brl(metrics.breakEvenDaily)}
          hint="Ponto de equilíbrio no período"
        />
        <StatCard label="Projeção mensal" value={brl(metrics.projection)} hint="Com base no ritmo atual" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Faturamento por modalidade</h2>
          {chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => brl(value)} />
                  <Legend />
                  <Bar dataKey="Bruto" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Líquido" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Composição dos custos</h2>
          {expenseData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {expenseData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => brl(value)} />
                  <Legend verticalAlign="bottom" height={48} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-gold" />
            <h2 className="font-display text-base font-semibold">Meta de faturamento</h2>
          </div>
          {metrics.goal > 0 ? (
            <div className="mt-4 space-y-3">
              <Progress value={Math.min(100, metrics.goalPct)} />
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {brl(metrics.gross)} de {brl(metrics.goal)}
                </span>
                <span className="font-medium">{pct(metrics.goalPct)} concluído</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Faltam <strong className="text-foreground">{brl(metrics.goalRemaining)}</strong> para atingir a meta.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Defina sua meta em <Link to="/metas" className="text-primary underline-offset-4 hover:underline">Metas</Link>.
            </p>
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Comparação com o período anterior</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Compare label="Faturamento bruto" current={metrics.gross} previous={previous.gross} />
            <Compare label="Despesas" current={metrics.expensesTotal} previous={previous.expensesTotal} invert />
            <Compare label="Lucro estimado" current={metrics.profit} previous={previous.profit} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Variação do faturamento: {variation >= 0 ? "+" : ""}
            {num(variation, 1)}% em relação ao período anterior.
          </p>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        O lucro apresentado é uma estimativa calculada a partir dos dados que você registrou.
      </p>
    </>
  );
}

function Compare({
  label,
  current,
  previous,
  invert = false,
}: {
  label: string;
  current: number;
  previous: number;
  invert?: boolean;
}) {
  const diff = current - previous;
  const good = invert ? diff <= 0 : diff >= 0;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <strong>{brl(current)}</strong>
        <span className={good ? "text-success" : "text-destructive"}>
          {diff >= 0 ? "+" : ""}
          {brl(diff)}
        </span>
      </span>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="mt-4 flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      Sem dados no período selecionado.
    </div>
  );
}
