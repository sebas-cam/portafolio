import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CONTACT_EMAIL, FORMSPREE_ID, SOCIAL, ui, type Lang } from "@/content/site";
import { seo } from "@/lib/seo";
import { PageHero, Section } from "@/components/site/chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) =>
    seo(params.lang, "/contact", params.lang === "es" ? "Contacto" : "Contact",
      params.lang === "es" ? "Escríbeme para roles full-time o proyectos freelance." : "Get in touch for full-time roles or freelance projects."),
  component: Page,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(2000),
});
type F = z.infer<typeof schema>;

const field = "w-full border-b border-input bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-ash focus:border-ember";

function Page() {
  const { lang } = Route.useParams() as { lang: Lang };
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: F) => {
    if (!FORMSPREE_ID) {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Hello from ${d.name}`)}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})`)}`;
      return;
    }
    try {
      const r = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
      setState(r.ok ? "sent" : "error");
    } catch { setState("error"); }
  };

  return (
    <>
      <PageHero eyebrow="/ 05" title={ui.contactTitle[lang]} sub={ui.contactSub[lang]} />
      <Section className="border-t-0 pt-0">
        <div className="grid gap-16 md:grid-cols-12">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 md:col-span-7" noValidate>
            <input {...register("name")} placeholder={ui.form.name[lang]} className={field} aria-invalid={!!errors.name} />
            <input {...register("email")} type="email" placeholder={ui.form.email[lang]} className={field} aria-invalid={!!errors.email} />
            <textarea {...register("message")} rows={5} placeholder={ui.form.message[lang]} className={`${field} resize-none`} aria-invalid={!!errors.message} />
            {(errors.name || errors.email || errors.message) && <p className="text-sm text-destructive">{ui.form.invalid[lang]}</p>}
            <Button type="submit" disabled={isSubmitting} className="h-auto self-start px-8 py-4 font-mono text-xs uppercase">{ui.form.send[lang]}</Button>
            {state === "sent" && <p className="text-ember">{ui.form.sent[lang]}</p>}
            {state === "error" && <p className="text-destructive">{ui.form.error[lang]}</p>}
          </form>
          <div className="flex flex-col gap-6 md:col-span-4 md:col-start-9">
            <div><p className="eyebrow">{ui.email[lang]}</p><a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 block break-all text-lg hover:text-ember">{CONTACT_EMAIL}</a></div>
            <div><p className="eyebrow">GitHub</p><a href={SOCIAL.github} target="_blank" rel="noreferrer" className="mt-2 block text-lg hover:text-ember">GitHub ↗</a></div>
            <div><p className="eyebrow">LinkedIn</p><a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="mt-2 block text-lg hover:text-ember">LinkedIn ↗</a></div>
            <div><p className="eyebrow">X / Twitter</p><a href={SOCIAL.x} target="_blank" rel="noreferrer" className="mt-2 block text-lg hover:text-ember">Building in public ↗</a></div>
            <div><p className="eyebrow">CV</p><a href="/cv-sebastian-campos.pdf" download className="mt-2 block text-lg hover:text-ember">{ui.cv[lang]} ↓</a></div>
            <div><p className="eyebrow">{ui.location[lang]}</p><p className="mt-2 text-lg">{ui.locationValue[lang]}</p></div>
          </div>
        </div>
      </Section>
    </>
  );
}
