import { createFileRoute } from "@tanstack/react-router";
import { ui, type Lang } from "@/content/site";
import { seo } from "@/lib/seo";
import { PageHero, Section } from "@/components/site/chrome";
import { ClientWork, EducationList, ExperienceList, HowIBuild, StackGroups } from "@/components/site/blocks";
export const Route = createFileRoute("/$lang/about")({
  head: ({ params }) => { const l = params.lang === "es" ? "es" : "en"; return seo(l, "/about", ui.nav.about[l], ui.aboutIntro[l]); },
  component: Page,
});
function Page() {
  const { lang } = Route.useParams() as { lang: Lang };
  return <><PageHero eyebrow="/ 02" title={ui.nav.about[lang]} sub={ui.aboutIntro[lang]} />
    <Section label={ui.how[lang]}><HowIBuild lang={lang} /></Section>
    <Section label={ui.experience[lang]}><ExperienceList lang={lang} /></Section>
    <Section label={ui.clients[lang]}><ClientWork lang={lang} /></Section>
    <Section label={ui.stack[lang]}><StackGroups lang={lang} /></Section>
    <Section label={ui.education[lang]}><EducationList lang={lang} /></Section></>;
}
