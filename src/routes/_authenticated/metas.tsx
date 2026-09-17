import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Field, SelectField } from "@/components/app/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteRow, useRows, useSaveRow, type Row } from "@/hooks/useData";
import { useMetrics } from "@/hooks/useMetrics";
import { GOAL_PERIODS, GOAL_SCOPES, GOAL_TYPES, modalityGroup } from "@/lib/domain";
import { brl, num, pct, periodRange, safeDiv, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Motorista Pro" },
      { name: "description", content: "Metas de faturamento, lucro, corridas e quilômetros por modalidade." },
      { property: "og:title", content: "Metas financeiras" },
      { property: "og:description", content: "Acompanhe quanto falta para bater suas metas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GoalsPage,
});

const empty = () => ({ scope: "Geral", period: "Mensal", goal_type: "Faturamento", target: "", active: true });

function GoalsPage() {
  const goals = useRows("goals");
  const save = useSaveRow("goals");
  const remove = useDeleteRow("goals");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(empty());

  const daily = useMetrics(useMemo(() => periodRange("hoje"), []));
  const weekly = useMetrics(useMemo(() => periodRange("semana"), []));
  const monthly = useMetrics(useMemo(() => periodRange("mes"), []));

  const rows = (goals.data ?? []) as Row[];

  function achieved(goal: Row) {
    const metrics = goal.period === "Diária" ? daily : goal.period === "Semanal" ? weekly : monthly;
    const rides = metrics.periodRides.filter(
      (ride: Row) => goal.scope === "Geral" || modalityGroup(ride.modality) === goal.scope,
    );
    const gross = rides.reduce((acc: number, ride: Row) => acc + Number(ride.gross || 0), 0);
    const fees = rides.reduce((acc: number, ride: Row) => acc + Number(ride.fee || 0), 0);
    const share = safeDiv(gross, metrics.gross);
    switch (goal.goal_type) {
      case "Lucro":
        return gross - fees - metrics.expensesTotal * share;
      case "Corridas":
        return rides.length;
      case "Quilômetros":
        return rides.reduce((acc: number, ride: Row) => acc + Number(ride.distance_km || 0), 0);
      default:
        return gross;
    }
  }

  const isMoney = (type: string) => type === "Faturamento" || type === "Lucro";

  return (
    <>
      <PageHeader
        title="Metas"
        subtitle="Defina metas por período e por modalidade e acompanhe o quanto já foi alcançado."
        actions={
          <Button
            onClick={() => {
              setForm(empty());
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Nova meta
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento hoje" value={brl(daily.gross)} />
        <StatCard label="Faturamento da semana" value={brl(weekly.gross)} />
        <StatCard label="Faturamento do mês" value={brl(monthly.gross)} />
        <StatCard label="Dias trabalhados no mês" value={String(monthly.workedDays)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {rows.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground lg:col-span-2">
            Nenhuma meta cadastrada. Crie sua primeira meta para acompanhar o progresso.
          </div>
        ) : null}
        {rows.map((goal) => {
          const value = achieved(goal);
          const target = Number(goal.target);
          const percent = safeDiv(value, target) * 100;
          const format = (input: number) => (isMoney(goal.goal_type) ? brl(input) : num(input, 0));
          return (
            <article key={goal.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold">
                    {goal.goal_type} · {goal.period}
                  </h2>
                  <Badge variant="secondary" className="mt-1">
                    {goal.scope}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" aria-label="Excluir meta" onClick={() => remove.mutate(goal.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <Progress className="mt-4" value={Math.min(100, percent)} />
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {format(value)} de {format(target)}
                </span>
                <span className="font-medium">{pct(percent)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Faltam <strong className="text-foreground">{format(Math.max(0, target - value))}</strong>.
              </p>
            </article>
          );
        })}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova meta</DialogTitle>
            <DialogDescription>Você pode criar metas diferentes para cada modalidade.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Modalidade"
              value={form.scope}
              onChange={(value) => setForm({ ...form, scope: value })}
              options={GOAL_SCOPES}
            />
            <SelectField
              label="Período"
              value={form.period}
              onChange={(value) => setForm({ ...form, period: value })}
              options={GOAL_PERIODS}
            />
            <SelectField
              label="Tipo de meta"
              value={form.goal_type}
              onChange={(value) => setForm({ ...form, goal_type: value })}
              options={GOAL_TYPES}
            />
            <Field label="Valor da meta">
              <Input inputMode="decimal" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                save.mutate(
                  {
                    scope: form.scope,
                    period: form.period,
                    goal_type: form.goal_type,
                    target: toNumber(form.target),
                    active: true,
                  },
                  { onSuccess: () => setOpen(false) },
                )
              }
              disabled={save.isPending}
            >
              Salvar meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
