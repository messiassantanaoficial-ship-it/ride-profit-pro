import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { PeriodFilter } from "@/components/app/PeriodFilter";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMetrics } from "@/hooks/useMetrics";
import type { Row } from "@/hooks/useData";
import { brl, formatDateBR, num, periodRange, todayISO, type PeriodKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Motorista Pro" },
      { name: "description", content: "Resumos por período, modalidade, despesas, combustível e manutenção." },
      { property: "og:title", content: "Relatórios" },
      { property: "og:description", content: "Resultados detalhados do período escolhido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const [custom, setCustom] = useState({ from: todayISO(), to: todayISO() });
  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const metrics = useMetrics(range);

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle={`Período de ${formatDateBR(range.from)} a ${formatDateBR(range.to)}.`}
        actions={
          <Button variant="outline" onClick={() => toast.info("A exportação em PDF, Excel e CSV chega em breve.")}>
            <Download className="size-4" /> Exportar
          </Button>
        }
      />
      <PeriodFilter value={period} onChange={setPeriod} custom={custom} onCustomChange={setCustom} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento bruto" value={brl(metrics.gross)} />
        <StatCard label="Taxas de aplicativos" value={brl(metrics.fees)} tone="negative" />
        <StatCard label="Total de despesas" value={brl(metrics.expensesTotal)} tone="negative" />
        <StatCard
          label="Lucro estimado"
          value={brl(metrics.profit)}
          tone={metrics.profit >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Combustível" value={brl(metrics.fuelTotal)} hint={`${num(metrics.liters, 1)} litros`} />
        <StatCard label="Manutenção" value={brl(metrics.maintenanceTotal)} />
        <StatCard label="Quilômetros" value={`${num(metrics.km)} km`} />
        <StatCard label="Custo por km" value={brl(metrics.costPerKm)} />
      </section>

      <Tabs defaultValue="modalidade" className="surface-card p-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="modalidade">Modalidades</TabsTrigger>
          <TabsTrigger value="corridas">Corridas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="combustivel">Combustível</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="fixas">Taxas fixas</TabsTrigger>
        </TabsList>

        <TabsContent value="modalidade" className="overflow-x-auto">
          <SimpleTable
            head={["Modalidade", "Bruto", "Taxas", "Líquido", "Corridas", "Lucro estimado"]}
            rows={metrics.modalityRows.map((row) => [
              row.name,
              brl(row.gross),
              brl(row.fees),
              brl(row.net),
              String(row.count),
              brl(row.profit),
            ])}
          />
        </TabsContent>

        <TabsContent value="corridas" className="overflow-x-auto">
          <SimpleTable
            head={["Data", "Modalidade", "Bruto", "Taxa", "Líquido", "KM"]}
            rows={(metrics.periodRides as Row[]).map((row) => [
              formatDateBR(row.ride_date),
              String(row.modality),
              brl(Number(row.gross)),
              brl(Number(row.fee)),
              brl(Number(row.net)),
              num(Number(row.distance_km)),
            ])}
          />
        </TabsContent>

        <TabsContent value="despesas" className="overflow-x-auto">
          <SimpleTable
            head={["Data", "Categoria", "Descrição", "Valor"]}
            rows={(metrics.periodVariable as Row[]).map((row) => [
              formatDateBR(row.expense_date),
              String(row.category),
              String(row.description ?? "—"),
              brl(Number(row.amount)),
            ])}
          />
        </TabsContent>

        <TabsContent value="combustivel" className="overflow-x-auto">
          <SimpleTable
            head={["Data", "Posto", "Litros", "R$/litro", "Total"]}
            rows={(metrics.periodFuel as Row[]).map((row) => [
              formatDateBR(row.fuel_date),
              String(row.station ?? "—"),
              num(Number(row.liters), 2),
              brl(Number(row.price_per_liter)),
              brl(Number(row.total_amount)),
            ])}
          />
        </TabsContent>

        <TabsContent value="manutencao" className="overflow-x-auto">
          <SimpleTable
            head={["Data", "Tipo", "Oficina", "Valor"]}
            rows={(metrics.periodMaintenance as Row[]).map((row) => [
              formatDateBR(row.service_date),
              String(row.service_type),
              String(row.provider ?? "—"),
              brl(Number(row.amount)),
            ])}
          />
        </TabsContent>

        <TabsContent value="fixas" className="overflow-x-auto">
          <SimpleTable
            head={["Nome", "Categoria", "Periodicidade", "Valor"]}
            rows={(metrics.activeFixed as Row[]).map((row) => [
              String(row.name),
              String(row.category),
              String(row.periodicity),
              brl(Number(row.amount)),
            ])}
          />
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        A exportação em PDF, Excel e CSV já está prevista na estrutura e será liberada em uma próxima atualização.
      </p>
    </>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((label, index) => (
            <TableHead key={label} className={index === 0 ? "" : "text-right"}>
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={head.length} className="py-8 text-center text-sm text-muted-foreground">
              Sem registros no período.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={cellIndex === 0 ? "font-medium" : "text-right"}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
