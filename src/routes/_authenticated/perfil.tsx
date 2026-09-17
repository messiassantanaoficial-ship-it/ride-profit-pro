import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileForm } from "@/components/app/ProfileForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e configurações — Motorista Pro" },
      { name: "description", content: "Atualize seus dados, modalidades, veículo e metas." },
      { property: "og:title", content: "Perfil e configurações" },
      { property: "og:description", content: "Altere seus dados pessoais, veículo e metas quando quiser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Perfil e configurações"
        subtitle="Seus dados podem ser alterados a qualquer momento."
        actions={
          <Button asChild variant="outline">
            <Link to="/taxas">Minhas taxas e despesas fixas</Link>
          </Button>
        }
      />
      <ProfileForm submitLabel="Salvar alterações" />
    </>
  );
}
