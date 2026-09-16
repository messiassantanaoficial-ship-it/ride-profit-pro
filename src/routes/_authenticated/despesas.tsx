import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Field, SelectField } from "@/components/app/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { MODALITY_GROUPS, PAYMENT_METHODS, VARIABLE_CATEGORIES } from "@/lib/domain";
import { brl, formatDateBR, sum, todayISO, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas variáveis — Motorista Pro" },
      { name: "description", content: "Combustível, pedágio, lavagem, alimentação e outras despesas do dia a dia." },
      { property: "og:title", content: "Despesas variáveis" },
      { property: "og:description", content: "Separe despesas profissionais e pessoais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VariableExpensesPage,
});

const empty = () => ({
  expense_date: todayISO(),
  category: "Combustível",
  description: "",
  amount: "",
  payment_method: "",
  odometer: "",
  modality: "",
  is_personal: false,
  notes: "",
});

function VariableExpensesPage() {
  const expenses = useRows("variable_expenses");
  const save = useSaveRow("variable_expenses");
  const remove = useDeleteRow("variable_expenses");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(empty());
  const [filter, setFilter] = useState("Todas");

  const all = (expenses.data ?? []) as Row[];
  const rows = all.filter((row) => (filter === "Todas" ? true : row.category === filter));
  const professional = sum(all.filter((r) => !r.is_personal), (r) => Number(r.amount));
  const personal = sum(all.filter((r) => r.is_personal), (r) => Number(r.amount));

  function submit() {
    save.mutate(
      {
        id: form.id,
        expense_date: form.expense_date || todayISO(),
        category: form.category,
        description: form.description || null,
        amount: toNumber(form.amount),
        payment_method: form.payment_method || null,
        odometer: form.odometer ? toNumber(form.odometer) : null,
        modality: form.modality || null,
        is_personal: form.is_personal,
        notes: form.notes || null,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <>
      <PageHeader
        title="Despesas variáveis"
        subtitle="Gastos que mudam conforme o trabalho. As despesas pessoais não entram no cálculo do lucro profissional."
        actions={
          <Button
            onClick={() => {
              setForm(empty());
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Nova despesa
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Despesas profissionais" value={brl(professional)} tone="negative" />
        <StatCard label="Despesas pessoais" value={brl(personal)} hint="Fora do cálculo do lucro" />
        <StatCard label="Registros" value={String(all.length)} />
      </section>

      <section className="surface-card p-4">
        <SelectField
          label="Filtrar por categoria"
          value={filter}
          onChange={setFilter}
          options={["Todas", ...VARIABLE_CATEGORIES]}
        />
      </section>

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma despesa registrada.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{formatDateBR(row.expense_date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.description ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.is_personal ? "outline" : "default"}>
                      {row.is_personal ? "Pessoal" : "Profissional"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{brl(Number(row.amount))}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setForm({ ...row, amount: String(row.amount), odometer: row.odometer ?? "" });
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
            <DialogTitle>{form.id ? "Editar despesa" : "Nova despesa"}</DialogTitle>
            <DialogDescription>Registre o gasto e indique se ele é profissional ou pessoal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data">
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              />
            </Field>
            <SelectField
              label="Categoria"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={VARIABLE_CATEGORIES}
            />
            <Field label="Valor (R$)">
              <Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <SelectField
              label="Forma de pagamento"
              value={form.payment_method}
              onChange={(value) => setForm({ ...form, payment_method: value })}
              options={PAYMENT_METHODS}
            />
            <Field label="Quilometragem">
              <Input inputMode="decimal" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            </Field>
            <SelectField
              label="Modalidade relacionada (opcional)"
              value={form.modality}
              onChange={(value) => setForm({ ...form, modality: value })}
              options={MODALITY_GROUPS}
            />
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
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={form.is_personal}
                onCheckedChange={(checked) => setForm({ ...form, is_personal: checked })}
              />
              <span className="text-sm">Despesa pessoal (não entra no lucro profissional)</span>
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
