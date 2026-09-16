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
import { useDeleteRow, useProfile, useRows, useSaveRow, type Row } from "@/hooks/useData";
import {
  APP_SUGGESTIONS,
  FIXED_EXPENSE_CATEGORIES,
  PERIODICITIES,
  TAXI_SUGGESTIONS,
} from "@/lib/domain";
import { brl, dailyEquivalent, equivalents, sum, toNumber } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/taxas")({
  head: () => ({
    meta: [
      { title: "Minhas taxas e despesas fixas — Motorista Pro" },
      {
        name: "description",
        content: "Cadastre taxas de ponto, associação, aplicativos, seguro e parcelas com conversão automática.",
      },
      { property: "og:title", content: "Minhas taxas e despesas fixas" },
      { property: "og:description", content: "Quanto cada taxa representa por dia, semana, mês e ano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FixedExpensesPage,
});

const emptyExpense = () => ({
  name: "",
  category: "Outras taxas",
  amount: "",
  periodicity: "Mensal",
  custom_days: "",
  due_day: "",
  description: "",
  active: true,
});

function FixedExpensesPage() {
  const expenses = useRows("fixed_expenses");
  const profile = useProfile();
  const save = useSaveRow("fixed_expenses");
  const remove = useDeleteRow("fixed_expenses");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(emptyExpense());

  const rows = (expenses.data ?? []) as Row[];
  const active = rows.filter((row) => row.active);
  const daily = sum(active, (row) => dailyEquivalent(Number(row.amount), row.periodicity, row.custom_days));

  const driverType = String(profile.data?.driver_type ?? "");
  const apps = (profile.data?.apps ?? []) as string[];
  const suggestions = [
    ...(driverType.toLowerCase().includes("táxi") || driverType === "Taxista" ? TAXI_SUGGESTIONS : []),
    ...(apps.length || driverType.toLowerCase().includes("uber") || driverType.includes("99")
      ? APP_SUGGESTIONS
      : []),
  ].filter((item, index, list) => list.findIndex((other) => other.name === item.name) === index);

  function openNew(preset?: { name: string; category: string }) {
    setForm({ ...emptyExpense(), ...(preset ?? {}) });
    setOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return;
    save.mutate(
      {
        id: form.id,
        name: form.name.trim(),
        category: form.category,
        amount: toNumber(form.amount),
        periodicity: form.periodicity,
        custom_days: form.periodicity === "Personalizada" ? Math.round(toNumber(form.custom_days)) : null,
        due_day: form.due_day ? Math.round(toNumber(form.due_day)) : null,
        description: form.description || null,
        active: form.active,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <>
      <PageHeader
        title="Minhas taxas e despesas fixas"
        subtitle="Todos os nomes são editáveis: use a denominação usada na sua cidade, associação ou cooperativa."
        actions={
          <Button onClick={() => openNew()}>
            <Plus className="size-4" /> Nova taxa ou despesa
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Custo diário" value={brl(daily)} />
        <StatCard label="Custo semanal" value={brl(daily * 7)} />
        <StatCard label="Custo mensal" value={brl(daily * 30)} />
        <StatCard label="Custo anual" value={brl(daily * 365)} />
      </section>

      {suggestions.length ? (
        <section className="surface-card p-5">
          <h2 className="font-display text-base font-semibold">Sugestões para o seu perfil</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque em uma sugestão para cadastrar. Você pode alterar o nome e o valor livremente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button key={suggestion.name} variant="outline" size="sm" onClick={() => openNew(suggestion)}>
                {suggestion.name}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Periodicidade</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Por dia</TableHead>
              <TableHead className="text-right">Por mês</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma taxa cadastrada ainda.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const eq = equivalents(Number(row.amount), row.periodicity, row.custom_days);
                return (
                  <TableRow key={row.id} className={row.active ? "" : "opacity-60"}>
                    <TableCell className="font-medium">
                      {row.name}
                      {row.due_day ? (
                        <span className="block text-xs text-muted-foreground">Vence dia {row.due_day}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.category}</Badge>
                    </TableCell>
                    <TableCell>{row.periodicity}</TableCell>
                    <TableCell className="text-right">{brl(Number(row.amount))}</TableCell>
                    <TableCell className="text-right">{brl(eq.daily)}</TableCell>
                    <TableCell className="text-right">{brl(eq.monthly)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={row.active}
                        onCheckedChange={(checked) => save.mutate({ id: row.id, active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => {
                          setForm({ ...row, amount: String(row.amount), custom_days: row.custom_days ?? "", due_day: row.due_day ?? "" });
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
                );
              })
            )}
          </TableBody>
        </Table>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar taxa ou despesa" : "Nova taxa ou despesa"}</DialogTitle>
            <DialogDescription>
              O valor é convertido automaticamente para custo diário, semanal, mensal e anual.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nome" hint="Ex.: mensalidade da praça, taxa da associação, contribuição do ponto.">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
            </div>
            <SelectField
              label="Categoria"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={FIXED_EXPENSE_CATEGORIES}
            />
            <Field label="Valor (R$)">
              <Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <SelectField
              label="Periodicidade"
              value={form.periodicity}
              onChange={(value) => setForm({ ...form, periodicity: value })}
              options={PERIODICITIES}
            />
            {form.periodicity === "Personalizada" ? (
              <Field label="A cada quantos dias?">
                <Input
                  inputMode="numeric"
                  value={form.custom_days}
                  onChange={(e) => setForm({ ...form, custom_days: e.target.value })}
                />
              </Field>
            ) : (
              <Field label="Dia de vencimento (opcional)">
                <Input
                  inputMode="numeric"
                  value={form.due_day}
                  onChange={(e) => setForm({ ...form, due_day: e.target.value })}
                />
              </Field>
            )}
            <div className="sm:col-span-2">
              <Field label="Descrição">
                <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <span className="text-sm">Taxa ativa (entra no cálculo do lucro)</span>
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
