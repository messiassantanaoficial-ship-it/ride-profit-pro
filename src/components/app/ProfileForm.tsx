import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, SelectField } from "@/components/app/Field";
import { useProfile, useSaveProfile, type Row } from "@/hooks/useData";
import { APPS, BRAZIL_STATES, DRIVER_TYPES, MODALITIES } from "@/lib/domain";
import { toNumber } from "@/lib/finance";
import { cn } from "@/lib/utils";

const blank = {
  full_name: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  driver_type: "",
  modalities: [] as string[],
  apps: [] as string[],
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_plate: "",
  odometer: "",
  revenue_goal: "",
  work_days: "26",
  fixed_expenses_estimate: "",
};

export function ProfileForm({ submitLabel, onSaved }: { submitLabel: string; onSaved?: () => void }) {
  const profile = useProfile();
  const save = useSaveProfile();
  const [form, setForm] = useState<Row>({ ...blank });

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      ...blank,
      ...profile.data,
      vehicle_year: profile.data.vehicle_year ?? "",
      odometer: profile.data.odometer ?? "",
      revenue_goal: profile.data.revenue_goal ?? "",
      work_days: profile.data.work_days ?? 26,
      fixed_expenses_estimate: profile.data.fixed_expenses_estimate ?? "",
      modalities: profile.data.modalities ?? [],
      apps: profile.data.apps ?? [],
    });
  }, [profile.data]);

  function toggle(key: "modalities" | "apps", value: string) {
    const list: string[] = form[key] ?? [];
    setForm({
      ...form,
      [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    });
  }

  function submit() {
    save.mutate(
      {
        full_name: form.full_name,
        phone: form.phone || null,
        email: form.email || null,
        city: form.city || null,
        state: form.state || null,
        driver_type: form.driver_type || null,
        modalities: form.modalities ?? [],
        apps: form.apps ?? [],
        vehicle_brand: form.vehicle_brand || null,
        vehicle_model: form.vehicle_model || null,
        vehicle_year: form.vehicle_year ? Math.round(toNumber(form.vehicle_year)) : null,
        vehicle_plate: form.vehicle_plate || null,
        odometer: toNumber(form.odometer),
        revenue_goal: toNumber(form.revenue_goal),
        work_days: Math.round(toNumber(form.work_days)) || 26,
        fixed_expenses_estimate: toNumber(form.fixed_expenses_estimate),
        onboarded: true,
      },
      { onSuccess: () => onSaved?.() },
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Dados pessoais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Cidade">
            <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <SelectField
            label="Estado"
            value={form.state ?? ""}
            onChange={(value) => setForm({ ...form, state: value })}
            options={BRAZIL_STATES}
          />
          <SelectField
            label="Tipo de motorista"
            value={form.driver_type ?? ""}
            onChange={(value) => setForm({ ...form, driver_type: value })}
            options={DRIVER_TYPES}
          />
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Como você trabalha</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione quantas opções quiser. Nada é bloqueado: isso só personaliza sugestões e filtros.
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Modalidades</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODALITIES.map((modality) => (
            <Chip
              key={modality}
              label={modality}
              active={(form.modalities ?? []).includes(modality)}
              onClick={() => toggle("modalities", modality)}
            />
          ))}
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Aplicativos</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {APPS.map((app) => (
            <Chip key={app} label={app} active={(form.apps ?? []).includes(app)} onClick={() => toggle("apps", app)} />
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Veículo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Marca">
            <Input value={form.vehicle_brand ?? ""} onChange={(e) => setForm({ ...form, vehicle_brand: e.target.value })} />
          </Field>
          <Field label="Modelo">
            <Input value={form.vehicle_model ?? ""} onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })} />
          </Field>
          <Field label="Ano">
            <Input inputMode="numeric" value={form.vehicle_year} onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })} />
          </Field>
          <Field label="Placa (opcional)">
            <Input value={form.vehicle_plate ?? ""} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })} />
          </Field>
          <Field label="Quilometragem atual">
            <Input inputMode="decimal" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          </Field>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Metas e custos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Meta de faturamento (mensal)">
            <Input inputMode="decimal" value={form.revenue_goal} onChange={(e) => setForm({ ...form, revenue_goal: e.target.value })} />
          </Field>
          <Field label="Dias trabalhados por mês">
            <Input inputMode="numeric" value={form.work_days} onChange={(e) => setForm({ ...form, work_days: e.target.value })} />
          </Field>
          <Field label="Despesas fixas aproximadas">
            <Input
              inputMode="decimal"
              value={form.fixed_expenses_estimate}
              onChange={(e) => setForm({ ...form, fixed_expenses_estimate: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={save.isPending} size="lg">
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      <Badge
        variant={active ? "default" : "outline"}
        className={cn("cursor-pointer px-3 py-1.5 text-sm font-normal", active && "shadow-sm")}
      >
        {label}
      </Badge>
    </button>
  );
}
