import { useMemo, useState } from "react";
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
import { APPS, MODALITIES, PAYMENT_METHODS } from "@/lib/domain";
import { brl, formatDateBR, num, safeDiv, sum, todayISO, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/corridas")({
  head: () => ({
    meta: [
      { title: "Corridas — Motorista Pro" },
      { name: "description", content: "Registre corridas com valor bruto, taxa do aplicativo e valor líquido." },
      { property: "og:title", content: "Corridas — Motorista Pro" },
      { property: "og:description", content: "Controle cada corrida por modalidade e aplicativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RidesPage,
});

const emptyRide = () => ({
  ride_date: todayISO(),
  ride_time: "",
  modality: "Táxi tradicional",
  source_app: "",
  gross: "",
  fee: "",
  distance_km: "",
  duration_min: "",
  payment_method: "",
  origin: "",
  destination: "",
  notes: "",
});

function RidesPage() {
  const rides = useRows("rides");
  const customModalities = useRows("custom_modalities");
  const save = useSaveRow("rides");
  const remove = useDeleteRow("rides");
  const saveModality = useSaveRow("custom_modalities");
  const removeModality = useDeleteRow("custom_modalities");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(emptyRide());
  const [newModality, setNewModality] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    modality: "Todas",
    app: "Todos",
    payment: "Todas",
    fee: "Todas",
  });

  const modalityOptions = useMemo(
    () => [...MODALITIES, ...((customModalities.data ?? []) as Row[]).map((m) => m.name as string)],
    [customModalities.data],
  );

  const rows = ((rides.data ?? []) as Row[]).filter((ride) => {
    if (filters.from && ride.ride_date < filters.from) return false;
    if (filters.to && ride.ride_date > filters.to) return false;
    if (filters.modality !== "Todas" && ride.modality !== filters.modality) return false;
    if (filters.app !== "Todos" && (ride.source_app ?? "") !== filters.app) return false;
    if (filters.payment !== "Todas" && (ride.payment_method ?? "") !== filters.payment) return false;
    if (filters.fee === "Com taxa" && Number(ride.fee) <= 0) return false;
    if (filters.fee === "Sem taxa" && Number(ride.fee) > 0) return false;
    return true;
  });

  const gross = sum(rows, (r) => Number(r.gross));
  const fees = sum(rows, (r) => Number(r.fee));
  const km = sum(rows, (r) => Number(r.distance_km));
  const minutes = sum(rows, (r) => Number(r.duration_min));

  function edit(ride: Row) {
    setForm({ ...ride, ride_time: ride.ride_time ?? "" });
    setOpen(true);
  }

  function submit() {
    save.mutate(
      {
        id: form.id,
        ride_date: form.ride_date || todayISO(),
        ride_time: form.ride_time || null,
        modality: form.modality,
        source_app: form.source_app || null,
        gross: toNumber(form.gross),
        fee: toNumber(form.fee),
        distance_km: toNumber(form.distance_km),
        duration_min: Math.round(toNumber(form.duration_min)),
        payment_method: form.payment_method || null,
        origin: form.origin || null,
        destination: form.destination || null,
        notes: form.notes || null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  const liquid = toNumber(form.gross) - toNumber(form.fee);

  return (
    <>
      <PageHeader
        title="Corridas"
        subtitle="Cada corrida com valor bruto, taxa e valor líquido calculado automaticamente."
        actions={
          <Button
            onClick={() => {
              setForm(emptyRide());
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Nova corrida
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento bruto" value={brl(gross)} />
        <StatCard label="Taxas descontadas" value={brl(fees)} tone="negative" />
        <StatCard label="Valor líquido" value={brl(gross - fees)} tone="positive" />
        <StatCard
          label="Médias"
          value={brl(safeDiv(gross, rows.length))}
          hint={`${num(km)} km · ${brl(safeDiv(gross - fees, km))}/km · ${brl(safeDiv(gross - fees, minutes / 60))}/h`}
        />
      </section>

      <section className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Field label="De">
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </Field>
        <Field label="Até">
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </Field>
        <SelectField
          label="Modalidade"
          value={filters.modality}
          onChange={(value) => setFilters({ ...filters, modality: value })}
          options={["Todas", ...modalityOptions]}
        />
        <SelectField
          label="Aplicativo"
          value={filters.app}
          onChange={(value) => setFilters({ ...filters, app: value })}
          options={["Todos", ...APPS]}
        />
        <SelectField
          label="Pagamento"
          value={filters.payment}
          onChange={(value) => setFilters({ ...filters, payment: value })}
          options={["Todas", ...PAYMENT_METHODS]}
        />
        <SelectField
          label="Taxa"
          value={filters.fee}
          onChange={(value) => setFilters({ ...filters, fee: value })}
          options={["Todas", "Com taxa", "Sem taxa"]}
        />
      </section>

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Aplicativo</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Taxa</TableHead>
              <TableHead className="text-right">Líquido</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma corrida registrada com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateBR(ride.ride_date)}
                    {ride.ride_time ? (
                      <span className="block text-xs text-muted-foreground">{String(ride.ride_time).slice(0, 5)}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ride.modality}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ride.source_app ?? "—"}</TableCell>
                  <TableCell className="text-right">{brl(Number(ride.gross))}</TableCell>
                  <TableCell className="text-right text-destructive">{brl(Number(ride.fee))}</TableCell>
                  <TableCell className="text-right font-medium">{brl(Number(ride.net))}</TableCell>
                  <TableCell className="text-right">{num(Number(ride.distance_km))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => edit(ride)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate(ride.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Modalidades personalizadas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie modalidades próprias, como convênios e clientes fixos.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="Nome da modalidade"
            value={newModality}
            onChange={(e) => setNewModality(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (!newModality.trim()) return;
              saveModality.mutate({ name: newModality.trim() }, { onSuccess: () => setNewModality("") });
            }}
          >
            Adicionar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {((customModalities.data ?? []) as Row[]).map((modality) => (
            <Badge key={modality.id} variant="outline" className="gap-2 py-1.5">
              {modality.name}
              <button onClick={() => removeModality.mutate(modality.id)} aria-label="Excluir modalidade">
                <Trash2 className="size-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar corrida" : "Nova corrida"}</DialogTitle>
            <DialogDescription>O valor líquido é calculado automaticamente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data">
              <Input type="date" value={form.ride_date} onChange={(e) => setForm({ ...form, ride_date: e.target.value })} />
            </Field>
            <Field label="Horário">
              <Input type="time" value={form.ride_time} onChange={(e) => setForm({ ...form, ride_time: e.target.value })} />
            </Field>
            <SelectField
              label="Modalidade"
              value={form.modality}
              onChange={(value) => setForm({ ...form, modality: value })}
              options={modalityOptions}
            />
            <SelectField
              label="Aplicativo ou origem"
              value={form.source_app}
              onChange={(value) => setForm({ ...form, source_app: value })}
              options={APPS}
            />
            <Field label="Valor bruto (R$)">
              <Input inputMode="decimal" value={form.gross} onChange={(e) => setForm({ ...form, gross: e.target.value })} />
            </Field>
            <Field label="Taxa descontada (R$)">
              <Input inputMode="decimal" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            </Field>
            <Field label="Valor líquido">
              <Input value={brl(liquid)} readOnly className="bg-muted" />
            </Field>
            <SelectField
              label="Forma de pagamento"
              value={form.payment_method}
              onChange={(value) => setForm({ ...form, payment_method: value })}
              options={PAYMENT_METHODS}
            />
            <Field label="Distância (km)">
              <Input
                inputMode="decimal"
                value={form.distance_km}
                onChange={(e) => setForm({ ...form, distance_km: e.target.value })}
              />
            </Field>
            <Field label="Tempo (minutos)">
              <Input
                inputMode="numeric"
                value={form.duration_min}
                onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
              />
            </Field>
            <Field label="Origem (opcional)">
              <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            </Field>
            <Field label="Destino (opcional)">
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Observações">
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              Salvar corrida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
