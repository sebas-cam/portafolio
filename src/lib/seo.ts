import shareImage from "@/assets/portfolio-og.asset.json";
import spanishShareImage from "@/assets/portfolio-og-es.asset.json";
export const SITE = "https://sebascodes.dev";
export function seo(lang: string, path: string, title: string, description: string, exactTitle = false) {
  const full = exactTitle ? title : `${title} — Sebastian Campos`;
  const image = `https://ascii-cv-showcase.lovable.app${lang === "es" ? spanishShareImage.url : shareImage.url}`;
  return {
    meta: [
      { title: full }, { name: "description", content: description },
      { property: "og:title", content: full }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:locale", content: lang === "es" ? "es_PE" : "en_US" },
      { property: "og:image", content: image }, { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/${lang}${path}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en${path}` },
      { rel: "alternate", hrefLang: "es", href: `${SITE}/es${path}` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE}/en${path}` },
    ],
  };
}
