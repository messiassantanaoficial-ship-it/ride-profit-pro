import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Field, SelectField } from "@/components/app/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteRow, useRows, useSaveRow, type Row } from "@/hooks/useData";
import { FUEL_TYPES, PAYMENT_METHODS } from "@/lib/domain";
import { brl, formatDateBR, num, safeDiv, sum, todayISO, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/combustivel")({
  head: () => ({
    meta: [
      { title: "Combustível — Motorista Pro" },
      { name: "description", content: "Abastecimentos, preço médio por litro, consumo e custo por quilômetro." },
      { property: "og:title", content: "Controle de combustível" },
      { property: "og:description", content: "Consumo médio e custo de combustível por quilômetro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FuelPage,
});

const empty = () => ({
  fuel_date: todayISO(),
  station: "",
  fuel_type: "Gasolina",
  liters: "",
  total_amount: "",
  odometer: "",
  payment_method: "",
  notes: "",
});

function FuelPage() {
  const fuel = useRows("fuel_logs");
  const rides = useRows("rides");
  const save = useSaveRow("fuel_logs");
  const remove = useDeleteRow("fuel_logs");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(empty());

  const rows = (fuel.data ?? []) as Row[];
  const totalSpent = sum(rows, (r) => Number(r.total_amount));
  const totalLiters = sum(rows, (r) => Number(r.liters));
  const odometers = rows.map((r) => Number(r.odometer)).filter((value) => value > 0);
  const kmByOdometer = odometers.length > 1 ? Math.max(...odometers) - Math.min(...odometers) : 0;
  const kmByRides = sum((rides.data ?? []) as Row[], (r) => Number(r.distance_km));
  const km = kmByOdometer || kmByRides;

  function submit() {
    const liters = toNumber(form.liters);
    const total = toNumber(form.total_amount);
    save.mutate(
      {
        id: form.id,
        fuel_date: form.fuel_date || todayISO(),
        station: form.station || null,
        fuel_type: form.fuel_type,
        liters,
        total_amount: total,
        price_per_liter: safeDiv(total, liters),
        odometer: form.odometer ? toNumber(form.odometer) : null,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <>
      <PageHeader
        title="Combustível"
        subtitle="Acompanhe gasto, consumo médio e custo de combustível por quilômetro."
        actions={
          <Button
            onClick={() => {
              setForm(empty());
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Novo abastecimento
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total gasto" value={brl(totalSpent)} />
        <StatCard label="Preço médio por litro" value={brl(safeDiv(totalSpent, totalLiters))} />
        <StatCard label="Consumo médio" value={`${num(safeDiv(km, totalLiters), 2)} km/l`} hint={`${num(km)} km considerados`} />
        <StatCard label="Custo por km" value={brl(safeDiv(totalSpent, km))} />
      </section>

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Posto</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead className="text-right">Litros</TableHead>
              <TableHead className="text-right">R$/litro</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum abastecimento registrado.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{formatDateBR(row.fuel_date)}</TableCell>
                  <TableCell>{row.station ?? "—"}</TableCell>
                  <TableCell>{row.fuel_type}</TableCell>
                  <TableCell className="text-right">{num(Number(row.liters), 2)}</TableCell>
                  <TableCell className="text-right">{brl(Number(row.price_per_liter))}</TableCell>
                  <TableCell className="text-right font-medium">{brl(Number(row.total_amount))}</TableCell>
                  <TableCell className="text-right">{row.odometer ? num(Number(row.odometer), 0) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setForm({
                          ...row,
                          liters: String(row.liters),
                          total_amount: String(row.total_amount),
                          odometer: row.odometer ?? "",
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(row.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar abastecimento" : "Novo abastecimento"}</DialogTitle>
            <DialogDescription>O preço por litro é calculado automaticamente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data">
              <Input type="date" value={form.fuel_date} onChange={(e) => setForm({ ...form, fuel_date: e.target.value })} />
            </Field>
            <Field label="Posto">
              <Input value={form.station ?? ""} onChange={(e) => setForm({ ...form, station: e.target.value })} />
            </Field>
            <SelectField
              label="Tipo de combustível"
              value={form.fuel_type}
              onChange={(value) => setForm({ ...form, fuel_type: value })}
              options={FUEL_TYPES}
            />
            <Field label="Litros">
              <Input inputMode="decimal" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} />
            </Field>
            <Field label="Valor total (R$)">
              <Input
                inputMode="decimal"
                value={form.total_amount}
                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
              />
            </Field>
            <Field label="Preço por litro">
              <Input value={brl(safeDiv(toNumber(form.total_amount), toNumber(form.liters)))} readOnly className="bg-muted" />
            </Field>
            <Field label="Quilometragem no abastecimento">
              <Input inputMode="decimal" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            </Field>
            <SelectField
              label="Forma de pagamento"
              value={form.payment_method}
              onChange={(value) => setForm({ ...form, payment_method: value })}
              options={PAYMENT_METHODS}
            />
            <div className="sm:col-span-2">
              <Field label="Observações">
                <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
