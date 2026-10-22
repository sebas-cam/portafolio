import { createFileRoute } from "@tanstack/react-router";
import { LANGS, SLUGS } from "@/content/site";
import { SITE } from "@/lib/seo";

const paths = ["", "/projects", ...SLUGS.map((s) => `/projects/${s}`), "/about", "/services", "/contact"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = paths.flatMap((p) =>
          LANGS.map((l) => `<url><loc>${SITE}/${l}${p}</loc>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${SITE}/${a}${p}"/>`).join("")}</url>`),
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
