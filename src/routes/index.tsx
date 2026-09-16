import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Car,
  Fuel,
  LineChart,
  Receipt,
  ShieldCheck,
  Target,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/domain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Motorista Pro — controle de corridas, taxas e lucro" },
      {
        name: "description",
        content:
          "Sistema de gestão para taxistas e motoristas de aplicativo: corridas, taxas fixas, despesas, combustível, metas e lucro estimado.",
      },
      { property: "og:title", content: "Motorista Pro — gestão para motoristas profissionais" },
      {
        property: "og:description",
        content: "Saiba quanto você ganha em cada modalidade e qual é o seu lucro real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Car, title: "Registro de corridas", text: "Valor bruto, taxa do aplicativo e líquido em cada corrida." },
  { icon: BarChart3, title: "Desempenho por modalidade", text: "Táxi, Uber, Uber Táxi, 99 e particulares separados." },
  { icon: Receipt, title: "Minhas taxas e despesas fixas", text: "Ponto, associação, seguro, parcelas e aluguel." },
  { icon: Fuel, title: "Combustível e consumo", text: "Preço por litro, consumo médio e custo por quilômetro." },
  { icon: Wrench, title: "Manutenção", text: "Histórico, próximas revisões e custo por mês." },
  { icon: Target, title: "Metas e lucro", text: "Meta diária, ponto de equilíbrio e projeção mensal." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-display text-lg font-semibold">{APP_NAME}</span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="brand-gradient">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 text-primary-foreground sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-gold">
              <ShieldCheck className="size-3.5" /> Feito para motoristas profissionais
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
              Saiba exatamente quanto você ganha — e quanto sobra
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              Táxi, Uber, Uber Táxi, 99 e corridas particulares no mesmo lugar. Corridas, taxas, despesas,
              combustível, manutenção e metas com o lucro calculado automaticamente.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/auth">Começar agora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10"
              >
                <Link to="/auth">Já tenho conta</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <LineChart className="size-4 text-gold" /> Resumo do mês
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Faturamento bruto", "R$ 9.480,00"],
                ["Taxas de aplicativos", "R$ 1.870,00"],
                ["Despesas", "R$ 2.640,00"],
                ["Lucro estimado", "R$ 4.970,00"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/60">Exemplo ilustrativo. Seus números aparecem após o cadastro.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Tudo o que o motorista precisa controlar</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="surface-card p-5">
              <feature.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        {APP_NAME} — nome comercial provisório. Os valores de lucro são estimativas baseadas nos dados registrados.
      </footer>
    </main>
  );
}
