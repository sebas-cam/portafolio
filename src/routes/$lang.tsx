import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { isLang, type Lang } from "@/content/site";
import { Footer, Navbar, SideLabel } from "@/components/site/chrome";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams() as { lang: Lang };
  return (
    <div lang={lang} className="min-h-screen">
      <Navbar lang={lang} />
      <SideLabel lang={lang} />
      <main>
        <Outlet />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
