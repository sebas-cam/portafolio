import { createFileRoute } from "@tanstack/react-router";
import { ui, type Lang } from "@/content/site";
import { seo } from "@/lib/seo";
import { PageHero, Section } from "@/components/site/chrome";
import { ProjectList } from "@/components/site/blocks";

export const Route = createFileRoute("/$lang/projects/")({
  head: ({ params }) =>
    seo(params.lang, "/projects", params.lang === "es" ? "Proyectos" : "Projects",
      params.lang === "es" ? "Kompry, Groomie y MenuCraft: productos SaaS centrados en WhatsApp." : "Kompry, Groomie and MenuCraft: WhatsApp-first SaaS products."),
  component: Page,
});

function Page() {
  const { lang } = Route.useParams() as { lang: Lang };
  return (
    <>
      <PageHero eyebrow="/ 03" title={ui.nav.projects[lang]} sub={ui.featured[lang]} />
      <Section className="border-t-0 pt-0"><ProjectList lang={lang} /></Section>
    </>
  );
}
