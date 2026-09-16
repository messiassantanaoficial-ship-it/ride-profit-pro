export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(value) ? value : 0,
  );

export const num = (value: number, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0,
  );

export const pct = (value: number) => `${num(Number.isFinite(value) ? value : 0, 0)}%`;

export const toNumber = (value: unknown) => {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export const formatDateBR = (iso?: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d ? `${d}/${m}/${y}` : iso;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type PeriodKey = "hoje" | "semana" | "mes" | "personalizado";

export function periodRange(key: PeriodKey, custom?: { from: string; to: string }) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (key === "hoje") return { from: iso(today), to: iso(today) };
  if (key === "semana") {
    const day = (today.getDay() + 6) % 7; // segunda = 0
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    return { from: iso(start), to: iso(today) };
  }
  if (key === "mes") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: iso(start), to: iso(today) };
  }
  return { from: custom?.from ?? iso(today), to: custom?.to ?? iso(today) };
}

export function previousRange(range: { from: string; to: string }) {
  const from = new Date(`${range.from}T12:00:00`);
  const to = new Date(`${range.to}T12:00:00`);
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
  return { from: addDaysISO(range.from, -days), to: addDaysISO(range.from, -1) };
}

export function daysInRange(range: { from: string; to: string }) {
  const from = new Date(`${range.from}T12:00:00`);
  const to = new Date(`${range.to}T12:00:00`);
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
}

/** Converte um valor periódico para o custo diário equivalente. */
export function dailyEquivalent(amount: number, periodicity: string, customDays?: number | null) {
  switch (periodicity) {
    case "Diária":
      return amount;
    case "Semanal":
      return amount / 7;
    case "Quinzenal":
      return amount / 15;
    case "Mensal":
      return amount / 30;
    case "Anual":
      return amount / 365;
    case "Personalizada":
      return customDays && customDays > 0 ? amount / customDays : 0;
    default:
      return 0;
  }
}

export const equivalents = (amount: number, periodicity: string, customDays?: number | null) => {
  const daily = dailyEquivalent(amount, periodicity, customDays);
  return { daily, weekly: daily * 7, monthly: daily * 30, yearly: daily * 365 };
};

export function sum<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((acc, row) => acc + (pick(row) || 0), 0);
}

export const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);
