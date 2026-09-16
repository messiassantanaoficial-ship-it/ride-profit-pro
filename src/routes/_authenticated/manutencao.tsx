import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Field, SelectField } from "@/components/app/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { MAINTENANCE_TYPES } from "@/lib/domain";
import { brl, formatDateBR, num, safeDiv, sum, todayISO, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/manutencao")({
  head: () => ({
    meta: [
      { title: "Manutenção — Motorista Pro" },
      { name: "description", content: "Histórico de manutenções, próximas revisões e custo por quilômetro." },
      { property: "og:title", content: "Controle de manutenção" },
      { property: "og:description", content: "Registre serviços, valores e próximas revisões do veículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaintenancePage,
});

const empty = () => ({
  service_date: todayISO(),
  odometer: "",
  service_type: "Revisão geral",
  amount: "",
  provider: "",
  description: "",
  next_service_date: "",
  next_service_km: "",
  notes: "",
});

function MaintenancePage() {
  const maintenance = useRows("maintenances");
  const rides = useRows("rides");
  const save = useSaveRow("maintenances");
  const remove = useDeleteRow("maintenances");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(empty());

  const rows = (maintenance.data ?? []) as Row[];
  const total = sum(rows, (r) => Number(r.amount));
  const km = sum((rides.data ?? []) as Row[], (r) => Number(r.distance_km));
  const months = new Set(rows.map((r) => String(r.service_date).slice(0, 7))).size || 1;
  const upcoming = rows
    .filter((r) => r.next_service_date && r.next_service_date >= todayISO())
    .sort((a, b) => String(a.next_service_date).localeCompare(String(b.next_service_date)));

  function submit() {
    save.mutate(
      {
        id: form.id,
        service_date: form.service_date || todayISO(),
        odometer: form.odometer ? toNumber(form.odometer) : null,
        service_type: form.service_type,
        amount: toNumber(form.amount),
        provider: form.provider || null,
        description: form.description || null,
        next_service_date: form.next_service_date || null,
        next_service_km: form.next_service_km ? toNumber(form.next_service_km) : null,
        notes: form.notes || null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <>
      <PageHeader
        title="Manutenção"
        subtitle="Mantenha o histórico do veículo e antecipe as próximas revisões."
        actions={
          <Button
            onClick={() => {
              setForm(empty());
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Nova manutenção
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total gasto" value={brl(total)} />
        <StatCard label="Custo por mês" value={brl(safeDiv(total, months))} />
        <StatCard label="Custo por km" value={brl(safeDiv(total, km))} hint={`${num(km)} km registrados`} />
        <StatCard label="Próximas revisões" value={String(upcoming.length)} tone="gold" />
      </section>

      {upcoming.length ? (
        <section className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Próximas revisões</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {upcoming.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{row.service_type}</span>
                <Badge variant="outline">
                  {formatDateBR(row.next_service_date)}
                  {row.next_service_km ? ` · ${num(Number(row.next_service_km), 0)} km` : ""}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Próxima revisão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma manutenção registrada.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{formatDateBR(row.service_date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.service_type}</Badge>
                  </TableCell>
                  <TableCell>{row.provider ?? "—"}</TableCell>
                  <TableCell className="text-right">{row.odometer ? num(Number(row.odometer), 0) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{brl(Number(row.amount))}</TableCell>
                  <TableCell>{formatDateBR(row.next_service_date)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setForm({
                          ...row,
                          amount: String(row.amount),
                          odometer: row.odometer ?? "",
                          next_service_date: row.next_service_date ?? "",
                          next_service_km: row.next_service_km ?? "",
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
            <DialogTitle>{form.id ? "Editar manutenção" : "Nova manutenção"}</DialogTitle>
            <DialogDescription>Guarde o histórico e programe a próxima revisão.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data">
              <Input
                type="date"
                value={form.service_date}
                onChange={(e) => setForm({ ...form, service_date: e.target.value })}
              />
            </Field>
            <Field label="Quilometragem">
              <Input inputMode="decimal" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            </Field>
            <SelectField
              label="Tipo de manutenção"
              value={form.service_type}
              onChange={(value) => setForm({ ...form, service_type: value })}
              options={MAINTENANCE_TYPES}
            />
            <Field label="Valor (R$)">
              <Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="Oficina ou fornecedor">
              <Input value={form.provider ?? ""} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <Field label="Próxima revisão (data)">
              <Input
                type="date"
                value={form.next_service_date}
                onChange={(e) => setForm({ ...form, next_service_date: e.target.value })}
              />
            </Field>
            <Field label="Próxima revisão (km)">
              <Input
                inputMode="decimal"
                value={form.next_service_km}
                onChange={(e) => setForm({ ...form, next_service_km: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição">
                <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
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
