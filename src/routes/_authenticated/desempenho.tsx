import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/app/PageHeader";
import { PeriodFilter } from "@/components/app/PeriodFilter";
import { StatCard } from "@/components/app/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMetrics } from "@/hooks/useMetrics";
import { brl, num, pct, periodRange, todayISO, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho por modalidade — Motorista Pro" },
      {
        name: "description",
        content: "Compare quanto você ganha em táxi, Uber, Uber Táxi, 99 e corridas particulares.",
      },
      { property: "og:title", content: "Desempenho por modalidade" },
      { property: "og:description", content: "Resultados separados por atividade no mesmo período." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformancePage,
});

function PerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const [custom, setCustom] = useState({ from: todayISO(), to: todayISO() });
  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const metrics = useMetrics(range);

  const chartData = metrics.modalityRows.map((row) => ({
    name: row.name,
    Bruto: Number(row.gross.toFixed(2)),
    Líquido: Number(row.net.toFixed(2)),
    Lucro: Number(row.profit.toFixed(2)),
  }));

  return (
    <>
      <PageHeader
        title="Desempenho por modalidade"
        subtitle="Cada atividade com resultado separado, sem misturar táxi, aplicativos e particulares."
      />
      <PeriodFilter value={period} onChange={setPeriod} custom={custom} onCustomChange={setCustom} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.modalityRows.slice(0, 4).map((row) => (
          <StatCard
            key={row.name}
            label={row.name}
            value={brl(row.gross)}
            hint={`${row.count} corridas · ${pct(row.share)} do faturamento`}
          />
        ))}
        {metrics.modalityRows.length === 0 ? (
          <StatCard label="Sem corridas" value={brl(0)} hint="Registre corridas para ver a comparação" />
        ) : null}
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Comparativo</h2>
        {chartData.length ? (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => brl(value)} />
                <Legend />
                <Bar dataKey="Bruto" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Líquido" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Lucro" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Sem dados no período selecionado.</p>
        )}
      </section>

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Taxas</TableHead>
              <TableHead className="text-right">Líquido</TableHead>
              <TableHead className="text-right">Corridas</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Médio/corrida</TableHead>
              <TableHead className="text-right">Ganho/km</TableHead>
              <TableHead className="text-right">Custo estimado</TableHead>
              <TableHead className="text-right">Lucro estimado</TableHead>
              <TableHead className="text-right">Participação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.modalityRows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{brl(row.gross)}</TableCell>
                <TableCell className="text-right text-destructive">{brl(row.fees)}</TableCell>
                <TableCell className="text-right">{brl(row.net)}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">{num(row.km)}</TableCell>
                <TableCell className="text-right">{brl(row.avgRide)}</TableCell>
                <TableCell className="text-right">{brl(row.perKm)}</TableCell>
                <TableCell className="text-right">{brl(row.cost)}</TableCell>
                <TableCell className={`text-right font-medium ${row.profit >= 0 ? "text-success" : "text-destructive"}`}>
                  {brl(row.profit)}
                </TableCell>
                <TableCell className="text-right">{pct(row.share)}</TableCell>
              </TableRow>
            ))}
            {metrics.modalityRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma corrida no período.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <p className="text-xs text-muted-foreground">
        O custo estimado de cada modalidade é rateado conforme a participação dela no faturamento do período.
      </p>
    </>
  );
}
