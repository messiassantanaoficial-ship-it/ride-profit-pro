import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileForm } from "@/components/app/ProfileForm";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Cadastro inicial — Motorista Pro" },
      { name: "description", content: "Complete seu cadastro para personalizar o painel e as sugestões de taxas." },
      { property: "og:title", content: "Cadastro inicial" },
      { property: "og:description", content: "Poucos dados para começar a controlar seus resultados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title="Vamos configurar seu perfil"
        subtitle="Leva menos de dois minutos. Você pode alterar tudo depois em Perfil e configurações."
      />
      <ProfileForm submitLabel="Concluir cadastro" onSaved={() => navigate({ to: "/dashboard" })} />
    </>
  );
}
