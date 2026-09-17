import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos para Motoristas — Motorista Pro" },
      { name: "description", content: "Uniformes, crachás, adesivos, placas com QR Code Pix e acessórios." },
      { property: "og:title", content: "Produtos para Motoristas" },
      { property: "og:description", content: "Vitrine de produtos para motoristas profissionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

const PRODUCTS = [
  { name: "Camisa branca de taxista", price: "A partir de R$ 69,90", tag: "Uniforme" },
  { name: "Camisa social personalizada", price: "A partir de R$ 89,90", tag: "Uniforme" },
  { name: "Kit de uniformes (3 peças)", price: "A partir de R$ 239,00", tag: "Kit" },
  { name: "Crachá profissional", price: "A partir de R$ 29,90", tag: "Identificação" },
  { name: "Placa com QR Code Pix", price: "A partir de R$ 39,90", tag: "Pagamento" },
  { name: "Adesivos personalizados", price: "A partir de R$ 24,90", tag: "Personalização" },
  { name: "Suporte veicular para celular", price: "A partir de R$ 49,90", tag: "Acessório" },
  { name: "Kit de higienização do veículo", price: "A partir de R$ 59,90", tag: "Acessório" },
];

function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Produtos para Motoristas"
        subtitle="Vitrine de itens úteis para o trabalho. Os pedidos são finalizados fora do aplicativo."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((product) => (
          <article key={product.name} className="surface-card flex flex-col overflow-hidden">
            <div className="brand-gradient flex h-32 items-center justify-center text-primary-foreground">
              <span className="font-display text-sm opacity-80">{product.tag}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-base font-semibold">{product.name}</h2>
              <Badge variant="secondary" className="mt-2 w-fit">
                {product.price}
              </Badge>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Produto para motoristas profissionais, com opção de personalização.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  Ver produto
                </Button>
                <Button size="sm">Comprar</Button>
                <Button size="sm" variant="ghost">
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <p className="text-xs text-muted-foreground">
        Os botões serão conectados à loja, ao marketplace ou ao WhatsApp assim que os links forem definidos.
      </p>
    </>
  );
}
