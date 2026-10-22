import { createFileRoute, redirect } from "@tanstack/react-router";
import { ui } from "@/content/site";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/$lang", params: { lang: "en" } }); },
  head: () => seo("en", "", ui.metaTitle.en, ui.metaDescription.en, true),
});
