import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Download } from "lucide-react";
import { numbers, ui, type Lang } from "@/content/site";
import { seo } from "@/lib/seo";
import { Section } from "@/components/site/chrome";
import { AsciiBackdrop, SlatsVoid } from "@/components/site/visuals";
import { ClientWork, ContactCta, EducationList, ExperienceList, HowIBuild, ProjectList, ServiceGrid, StackGroups } from "@/components/site/blocks";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => { const l = params.lang === "es" ? "es" : "en"; return seo(l, "", ui.metaTitle[l], ui.metaDescription[l], true); },
  component: Home,
});
function Home() {
  const { lang } = Route.useParams() as { lang: Lang };
  return <>
    <section className="relative overflow-hidden px-5 pb-14 pt-28 md:px-10 md:pt-36">
      <AsciiBackdrop />
      <div className="relative mx-auto max-w-7xl">
        <p className="eyebrow mb-6">{ui.name[lang]} — Lima, PE</p>
        <h1 className="display max-w-5xl text-4xl leading-[1.06] sm:text-5xl lg:text-7xl">{ui.heroLine[lang]}</h1>
        <div className="mt-8 grid gap-8 md:grid-cols-12"><div className="md:col-span-7"><p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{ui.heroSub[lang]}</p><p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">{ui.markets[lang]}</p></div>
          <div className="flex flex-wrap items-end gap-3 md:col-span-5 md:justify-end">
            <Button asChild className="h-auto px-5 py-4 font-mono text-xs uppercase"><a href="#selected-work">{ui.ctaWork[lang]}<ArrowDown /></a></Button>
            <Button asChild variant="outline" className="h-auto bg-transparent px-5 py-4 font-mono text-xs uppercase"><a href="/cv-sebastian-campos.pdf" download>{ui.cv[lang]}<Download /></a></Button>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-y-8 md:grid-cols-4 border-t border-border pt-6">{numbers.map(n => <div key={n.value} className="pr-3"><div className="display text-3xl md:text-5xl">{n.value}</div><p className="mt-3 font-mono text-[10px] uppercase leading-relaxed text-muted-foreground md:text-xs">{n.label[lang]}</p>{n.detail && <p className="mt-2 hidden font-mono text-[10px] text-muted-foreground sm:block">{n.detail}</p>}</div>)}</div>
      </div>
    </section>
    <Section id="selected-work" label={ui.featured[lang]}><ProjectList lang={lang} /></Section>
    <Section label={ui.how[lang]}><HowIBuild lang={lang} /></Section>
    <Section label={ui.experience[lang]}><ExperienceList lang={lang} /></Section>
    <Section label={ui.clients[lang]}><ClientWork lang={lang} /></Section>
    <Section label={ui.stack[lang]}><div className="mb-10 h-24 md:h-32"><SlatsVoid /></div><StackGroups lang={lang} /></Section>
    <Section label={ui.whatIDo[lang]}><ServiceGrid lang={lang} /></Section>
    <Section label={ui.education[lang]}><EducationList lang={lang} /></Section>
    <Section><ContactCta lang={lang} /></Section>
  </>;
}
