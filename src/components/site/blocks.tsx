import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { clientWork, education, experience, howIBuild, selectedProjects, services, stackGroups, ui, type Lang } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "./visuals";

export function ProjectList({ lang }: { lang: Lang }) {
  return <div className="grid gap-5 md:grid-cols-2">
    {selectedProjects.map((p, i) => <Reveal key={p.name} className="flex h-full flex-col border border-border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="eyebrow">/0{i + 1}{p.year ? ` — ${p.year}` : ""}</span><span className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-ember">{p.status[lang]}</span></div>
      <h3 className="display mt-8 text-4xl md:text-5xl">{p.name}</h3>
      <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">{p.tagline[lang]}</p>
      {p.detail && <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">{p.detail[lang]}</p>}
      {p.stack.length > 0 && <ul className="mt-6 flex flex-wrap gap-2">{p.stack.map(s => <li key={s} className="border border-border px-2 py-1 font-mono text-xs text-muted-foreground">{s}</li>)}</ul>}
      {(p.url || p.caseSlug) && <div className="mt-auto flex flex-wrap gap-5 pt-8">
        {p.url && <Button asChild variant="link" className="h-auto p-0 font-mono text-xs uppercase"><a href={p.url} target="_blank" rel="noreferrer">{ui.visit[lang]}<ArrowUpRight /></a></Button>}
        {p.caseSlug && <Button asChild variant="link" className="h-auto p-0 font-mono text-xs uppercase"><Link to="/$lang/projects/$slug" params={{ lang, slug: p.caseSlug }}>{ui.viewCase[lang]}<ArrowUpRight /></Link></Button>}
      </div>}
    </Reveal>)}
  </div>;
}
export function ServiceGrid({ lang }: { lang: Lang }) {
  return <div className="grid gap-px bg-border md:grid-cols-2">{services.map((s, i) => <div key={i} className="bg-background p-8 md:p-10"><span className="eyebrow">/0{i + 1}</span><h3 className="display mt-6 text-2xl md:text-3xl">{s.title[lang]}</h3><p className="mt-4 max-w-md text-muted-foreground">{s.body[lang]}</p></div>)}</div>;
}
export function HowIBuild({ lang }: { lang: Lang }) {
  return <><p className="max-w-3xl text-xl leading-relaxed text-muted-foreground">{ui.howIntro[lang]}</p><div className="mt-12 grid gap-8 md:grid-cols-3">{howIBuild.map((h, i) => <div key={i} className="border-t border-border pt-6"><span className="eyebrow">/0{i + 1}</span><h3 className="display mt-5 text-2xl leading-tight">{h.title[lang]}</h3><p className="mt-4 leading-relaxed text-muted-foreground">{h.body[lang]}</p></div>)}</div></>;
}
export function ExperienceList({ lang }: { lang: Lang }) {
  return <div className="divide-y divide-border">{experience.map((e, i) => <Reveal key={i} className="grid gap-3 py-8 md:grid-cols-12"><span className="eyebrow leading-relaxed md:col-span-3">{e.period[lang]}</span><div className="md:col-span-9"><h3 className="display text-2xl leading-tight md:text-3xl">{e.role[lang]}</h3><p className="mt-3 font-mono text-xs uppercase text-ember">{e.org[lang]}</p><p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">{e.body[lang]}</p></div></Reveal>)}</div>;
}
export function ClientWork({ lang }: { lang: Lang }) {
  return <div className="grid gap-x-10 md:grid-cols-2">{clientWork.map(c => <div key={c.name} className="border-t border-border py-6"><h3 className="display text-2xl">{c.name}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{c.body[lang]}</p></div>)}</div>;
}
export function StackGroups({ lang }: { lang: Lang }) {
  return <dl className="divide-y divide-border">{stackGroups.map((g, i) => <div key={i} className="grid gap-4 py-6 md:grid-cols-12"><dt className="eyebrow leading-relaxed md:col-span-3">{g.title[lang]}</dt><dd className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm md:col-span-9">{g.items.map(s => <span key={s}>{s}</span>)}</dd></div>)}</dl>;
}
export function EducationList({ lang }: { lang: Lang }) {
  return <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{education.map((e, i) => <div key={i} className="border-t border-border pt-5"><h3 className="text-lg font-medium">{e.title[lang]}</h3><p className="mt-3 text-sm text-muted-foreground">{e.detail[lang]}</p></div>)}</div>;
}
export function ContactCta({ lang }: { lang: Lang }) {
  return <div><h2 className="display break-words text-4xl leading-tight sm:text-5xl md:text-7xl">{ui.contactTitle[lang]}</h2><p className="mt-6 text-muted-foreground">{ui.contactSub[lang]}</p><Button asChild variant="outline" className="mt-10 h-auto border-foreground bg-transparent px-6 py-4 font-mono text-xs uppercase hover:bg-foreground hover:text-background"><Link to="/$lang/contact" params={{ lang }}>{ui.ctaContact[lang]}<ArrowUpRight /></Link></Button></div>;
}
