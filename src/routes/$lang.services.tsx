import { createFileRoute } from "@tanstack/react-router";
import { ui, type Lang } from "@/content/site";
import { seo } from "@/lib/seo";
import { PageHero, Section } from "@/components/site/chrome";
import { ContactCta, ServiceGrid } from "@/components/site/blocks";
import { SlatsVoid } from "@/components/site/visuals";

export const Route = createFileRoute("/$lang/services")({
  head: ({ params }) =>
    seo(params.lang, "/services", params.lang === "es" ? "Servicios" : "Services",
      params.lang === "es" ? "Web apps full stack, automatización con WhatsApp e IA, MVPs SaaS y performance." : "Full stack web apps, WhatsApp & AI automation, SaaS MVPs and performance work."),
  component: Page,
});

function Page() {
  const { lang } = Route.useParams() as { lang: Lang };
  const steps = ui.steps.map(s => s[lang]);
  return (
    <>
      <PageHero eyebrow="/ 04" title={ui.nav.services[lang]} sub={ui.contactSub[lang]} />
      <Section className="border-t-0 pt-0"><ServiceGrid lang={lang} /></Section>
      <Section label={ui.process[lang]}>
        <div className="h-32"><SlatsVoid count={36} /></div>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => <li key={s}><span className="eyebrow">0{i + 1}</span><p className="display mt-3 text-2xl">{s}</p></li>)}
        </ol>
      </Section>
      <Section><ContactCta lang={lang} /></Section>
    </>
  );
}
