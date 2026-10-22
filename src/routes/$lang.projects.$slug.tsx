import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ImageIcon, Play } from "lucide-react";
import { groomie, projects, SLUGS, ui, type Lang, type Slug } from "@/content/site";
import { seo } from "@/lib/seo";
import { Section } from "@/components/site/chrome";
import { AsciiBackdrop } from "@/components/site/visuals";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/$lang/projects/$slug")({
  beforeLoad: ({ params }) => { if (!SLUGS.includes(params.slug as Slug)) throw notFound(); },
  head: ({ params }) => {
    const l = params.lang === "es" ? "es" : "en";
    if (!SLUGS.includes(params.slug as Slug)) return { meta: [{ title: "Sebastian Campos — Unavailable" }, { name: "robots", content: "noindex" }] };
    const p = projects[params.slug as Slug];
    return seo(l, `/projects/${params.slug}`, `${p.name} — ${p.tagline[l]}`, p.summary[l]);
  }, component: Page,
});
function Page() {
  const { lang, slug } = Route.useParams() as { lang: Lang; slug: Slug };
  const p = projects[slug];
  const isGroomie = slug === "groomie";
  const nodes = [groomie.architecture[lang], "Evolution API (self-hosted, Baileys)", "n8n AI agent (OpenAI)", "Groomie HTTP API (Next.js)", "MongoDB (per-tenant) + Redis (session/handoff)", "Ably (real-time)", lang === "es" ? "Panel del dueño" : "Owner dashboard"];
  return <>
    <section className="relative overflow-hidden px-5 pb-16 pt-32 md:px-10 md:pt-40"><AsciiBackdrop className="opacity-60" /><div className="relative mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center gap-4"><span className="eyebrow">{p.year}</span>{isGroomie && <span className="border border-border px-2 py-1 font-mono text-xs uppercase text-ember">{lang === "es" ? "En producción" : "In production"}</span>}</div>
      <h1 className="display break-words text-5xl sm:text-6xl md:text-8xl">{p.name}</h1>
      <p className="mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground">{p.tagline[lang]}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="outline" className="h-auto bg-transparent px-5 py-3 font-mono text-xs uppercase"><a href={p.url} target="_blank" rel="noreferrer">{ui.visit[lang]}<ArrowUpRight /></a></Button><Button asChild variant="ghost" className="h-auto px-5 py-3 font-mono text-xs uppercase"><Link to="/$lang" params={{ lang }} hash="selected-work"><ArrowLeft />{ui.back[lang]}</Link></Button></div>
    </div></section>
    {isGroomie && <>
      <Section label={ui.problem[lang]}><p className="max-w-4xl text-xl leading-relaxed md:text-2xl">{groomie.problem[lang]}</p></Section>
      <Section label={ui.solution[lang]}><p className="max-w-4xl text-xl leading-relaxed md:text-2xl">{groomie.solution[lang]}</p></Section>
      <Section label={ui.features[lang]}><ul className="divide-y divide-border">{groomie.features.map((f, i) => <li key={i} className="flex gap-5 py-5"><span className="eyebrow pt-1">0{i + 1}</span><span className="max-w-3xl text-lg leading-relaxed">{f[lang]}</span></li>)}</ul></Section>
      <Section label={ui.decisions[lang]}><div className="grid gap-4 md:grid-cols-2">{groomie.decisions.map((d, i) => <article key={i} className="border border-border bg-card p-6"><h3 className="text-xl font-bold leading-snug">{d.title[lang]}</h3><p className="mt-4 leading-relaxed text-muted-foreground">{d.body[lang]}</p></article>)}</div></Section>
      <Section label={ui.availability[lang]}><p className="max-w-4xl text-xl leading-relaxed">{groomie.availability[lang]}</p></Section>
      <Section label={ui.architecture[lang]}><ol className="font-mono text-xs leading-relaxed sm:text-sm">{nodes.map((node, i) => <li key={node} className="flex flex-col items-start"><span className="max-w-full break-words border border-border px-4 py-3">{node}</span>{i < nodes.length - 1 && <span aria-hidden className="py-2 pl-5 text-ember">│<br />▼</span>}</li>)}</ol></Section>
      <Section label={ui.stack[lang]}><ul className="flex flex-wrap gap-2">{groomie.stack.map(s => <li key={s} className="border border-border px-3 py-2 font-mono text-xs">{s}</li>)}</ul></Section>
      <Section label={ui.role2[lang]}><p className="max-w-3xl text-xl leading-relaxed">{groomie.role[lang]}</p></Section>
      <Section label={ui.results[lang]}><p className="max-w-3xl text-xl leading-relaxed">{groomie.results[lang]}</p></Section>
      <Section label={ui.media[lang]}><div className="grid gap-5 md:grid-cols-3">{groomie.media.map((m, i) => <figure key={i}><div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 border border-dashed border-border text-ash"><ImageIcon size={24} strokeWidth={1} /><span className="font-mono text-xs">{ui.pendingImage[lang]}</span></div><figcaption className="mt-3 text-sm text-muted-foreground">0{i + 1} / {m[lang]}</figcaption></figure>)}</div><figure className="mt-8"><div className="flex aspect-video max-h-96 flex-col items-center justify-center gap-4 border border-dashed border-border text-ash"><Play size={28} strokeWidth={1} /><span className="font-mono text-xs">{ui.pendingVideo[lang]}</span></div><figcaption className="mt-3 text-sm text-muted-foreground">{ui.video[lang]}</figcaption></figure></Section>
    </>}
  </>;
}
