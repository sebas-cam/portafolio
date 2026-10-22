import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { CONTACT_EMAIL, SOCIAL, ui, type Lang } from "@/content/site";
import { Button } from "@/components/ui/button";

const links = ["projects", "about", "services", "contact"] as const;

export function Navbar({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const other: Lang = lang === "en" ? "es" : "en";
  const swapped = pathname.replace(/^\/(en|es)/, `/${other}`);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-10">
        <Link to="/$lang" params={{ lang }} className="font-mono text-xs uppercase tracking-[0.2em]">
          Sebas<span className="text-ember">/</span>codes
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((k) => (
            <Link key={k} to={`/$lang/${k}`} params={{ lang }} className="eyebrow transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {ui.nav[k][lang]}
            </Link>
          ))}
          <Link to={swapped} className="eyebrow border border-border px-2 py-1 hover:text-foreground">{other}</Link>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={ui.menu[lang]} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </nav>
      {open && (
        <div className="flex flex-col gap-5 border-t border-border bg-background px-5 py-6 md:hidden">
          {links.map((k) => (
            <Link key={k} to={`/$lang/${k}`} params={{ lang }} onClick={() => setOpen(false)} className="display text-3xl">
              {ui.nav[k][lang]}
            </Link>
          ))}
          <Link to={swapped} onClick={() => setOpen(false)} className="eyebrow">{other === "es" ? "Español" : "English"}</Link>
        </div>
      )}
    </header>
  );
}

export function SideLabel({ lang }: { lang: Lang }) {
  return (
    <div aria-hidden className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <span className="eyebrow block -rotate-180 [writing-mode:vertical-rl]">{ui.sideLabel[lang]}</span>
    </div>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <span className="eyebrow">© {new Date().getFullYear()} Sebastian Campos Marcenal</span>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <a className="eyebrow hover:text-foreground" href={`mailto:${CONTACT_EMAIL}`}>{ui.email[lang]}</a>
          <a className="eyebrow hover:text-foreground" href={SOCIAL.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="eyebrow hover:text-foreground" href={SOCIAL.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="eyebrow hover:text-foreground" href={SOCIAL.x} target="_blank" rel="noreferrer">X</a>
          <a className="eyebrow hover:text-foreground" href="/cv-sebastian-campos.pdf" download>{ui.cv[lang]}</a>
        </div>
      </div>
    </footer>
  );
}

export function Section({ label, children, className = "", id }: { label?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl scroll-mt-14 border-t border-border px-5 py-16 md:px-10 md:py-20 ${className}`}>
      {label && <p className="eyebrow mb-10">{label}</p>}
      {children}
    </section>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:px-10 md:pt-44">
      <p className="eyebrow mb-6">{eyebrow}</p>
      <h1 className="display text-4xl leading-tight sm:text-5xl md:text-7xl">{title}</h1>
      {sub && <p className="mt-8 max-w-xl text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}
