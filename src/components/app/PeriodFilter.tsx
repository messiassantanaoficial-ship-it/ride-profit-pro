import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PeriodKey } from "@/lib/finance";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mês" },
  { key: "personalizado", label: "Personalizado" },
];

export function PeriodFilter({
  value,
  onChange,
  custom,
  onCustomChange,
}: {
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
  custom: { from: string; to: string };
  onCustomChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {OPTIONS.map((option) => (
          <Button
            key={option.key}
            size="sm"
            variant={value === option.key ? "default" : "ghost"}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {value === "personalizado" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-auto"
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
          />
          <span className="text-muted-foreground">até</span>
          <Input
            type="date"
            className="w-auto"
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
