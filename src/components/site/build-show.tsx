import { useCallback, useEffect, useRef, useState } from "react";
import { build, type BuildZone, type Lang } from "@/content/site";

/**
 * "Building live" intro.
 * The page is fully server-rendered (SEO intact). An inline script in <head> adds
 * `html.build-armed`, which covers every [data-build] zone with a skeleton layer.
 * Scripted "agents" then sweep each layer away so the page looks like it is being
 * painted in real time. There are no real agents: it is a timeline.
 */

type Mode = "show" | "scroll" | "done";
type Phase = "idle" | "intro" | "running" | "finished";
type Agent = { n: number; zone: BuildZone | null; start: number; dur: number };
type Line = { id: number; text: string; kind: "info" | "start" | "done" };

// Presentation timeline in seconds. Overlapping agents run in parallel.
const PLAN: Agent[] = [
  { n: 1, zone: "nav", start: 0.8, dur: 3 },
  { n: 2, zone: "hero-title", start: 2, dur: 6 },
  { n: 3, zone: "hero-copy", start: 4.5, dur: 5.5 },
  { n: 4, zone: "metrics", start: 7.5, dur: 4.5 },
  { n: 5, zone: "projects", start: 11, dur: 8.5 },
  { n: 6, zone: "how", start: 16.5, dur: 5 },
  { n: 7, zone: "experience", start: 20.5, dur: 6 },
  { n: 8, zone: "clients", start: 25.5, dur: 5 },
  { n: 9, zone: "stack", start: 29.5, dur: 6 },
  { n: 10, zone: "services", start: 34.5, dur: 5 },
  { n: 11, zone: "education", start: 38.5, dur: 4.5 },
  { n: 12, zone: "contact", start: 42, dur: 5 },
  { n: 13, zone: "footer", start: 45.5, dur: 3.5 },
  { n: 14, zone: null, start: 47, dur: 6 },
];
const TOTAL = 54;
const SCROLL_DUR = 1.8;
const SEEN_KEY = "build-seen";

const pad = (n: number) => String(n).padStart(2, "0");
const tag = (n: number) => `agent-${pad(n)}`;
const zoneEl = (z: BuildZone | null) =>
  z ? document.querySelector<HTMLElement>(`[data-build="${z}"]`) : null;
const html = () => document.documentElement;

export function BuildShow({ lang }: { lang: Lang }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sel, setSel] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [hideDock, setHideDock] = useState(false);

  const timers = useRef<number[]>([]);
  const lineId = useRef(0);
  const t0 = useRef(0);
  const follow = useRef(true);
  const running = useRef<Map<number, number>>(new Map()); // agent n -> started at (ms)
  const doneSet = useRef<Set<number>>(new Set());
  const raf = useRef(0);
  const io = useRef<IntersectionObserver | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const log = useCallback((text: string, kind: Line["kind"] = "info") => {
    setLines((ls) => [...ls.slice(-7), { id: ++lineId.current, text, kind }]);
  }, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Arm on mount: only if the inline head script decided this visit should build.
  useEffect(() => {
    if (!html().classList.contains("build-armed")) return;
    html().classList.add("build-live");
    for (const a of PLAN) {
      const el = zoneEl(a.zone);
      if (el) {
        el.dataset["buildState"] = "queued";
        el.dataset["buildLabel"] = `${tag(a.n)} · ${build.queued[langRef.current]}`;
      }
    }
    setPhase("intro");
    return () => {
      teardown();
    };
  }, []);

  // Lock page scroll while the terminal prompt is open.
  useEffect(() => {
    if (phase !== "intro") return;
    const prev = html().style.overflow;
    html().style.overflow = "hidden";
    return () => {
      html().style.overflow = prev;
    };
  }, [phase]);

  function teardown() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(raf.current);
    io.current?.disconnect();
    html().classList.remove("build-armed", "build-live");
  }

  const startAgent = (a: Agent, durS: number) => {
    if (running.current.has(a.n) || doneSet.current.has(a.n)) return;
    const L = langRef.current;
    running.current.set(a.n, performance.now());
    setActive([...running.current.keys()]);
    const what = a.zone ? build.zones[a.zone][L] : build.qa[L];
    log(`${tag(a.n)} → ${what}`, "start");
    const el = zoneEl(a.zone);
    if (el) {
      el.style.setProperty("--build-dur", `${durS}s`);
      el.dataset["buildLabel"] = `${tag(a.n)} ▸ ${build.painting[L]} ${what}`;
      el.dataset["buildState"] = "building";
    }
    later(() => endAgent(a, durS), durS * 1000);
  };

  const endAgent = (a: Agent, durS: number) => {
    running.current.delete(a.n);
    doneSet.current.add(a.n);
    setActive([...running.current.keys()]);
    const el = zoneEl(a.zone);
    if (el) el.dataset["buildState"] = "done";
    const what = a.zone ? build.zones[a.zone][langRef.current] : "QA";
    log(`✓ ${tag(a.n)} ${what} (${durS.toFixed(1)}s)`, "done");
  };

  const finish = useCallback(
    (skipped: boolean) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      cancelAnimationFrame(raf.current);
      io.current?.disconnect();
      running.current.clear();
      setActive([]);
      document.querySelectorAll<HTMLElement>("[data-build]").forEach((el) => {
        el.dataset["buildState"] = "done";
      });
      const secs = t0.current ? Math.round((performance.now() - t0.current) / 1000) : 0;
      if (t0.current)
        log(
          `✻ ${build.done[langRef.current]} · ${secs}s · 14 ${build.agents[langRef.current]}`,
          "done",
        );
      setPhase("finished");
      // Let the last sweeps fade, then drop the covering CSS entirely.
      window.setTimeout(() => html().classList.remove("build-armed", "build-live"), 700);
      window.setTimeout(() => setHideDock(true), t0.current ? 3500 : 0);
    },
    [log],
  );

  const choose = useCallback(
    (mode: Mode) => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage blocked: fine */
      }
      if (mode === "done") {
        finish(true);
        return;
      }
      t0.current = performance.now();
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setPhase("running");
      log(build.boot[langRef.current]);
      if (mode === "show") runShow();
      else runScroll();
    },
    // runShow/runScroll only touch refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finish, log],
  );

  function runShow() {
    follow.current = true;
    const stopFollow = () => {
      follow.current = false;
    };
    window.addEventListener("wheel", stopFollow, { once: true, passive: true });
    window.addEventListener("touchstart", stopFollow, { once: true, passive: true });
    for (const a of PLAN) later(() => startAgent(a, a.dur), a.start * 1000);
    later(() => finish(false), TOTAL * 1000);
    // Camera: keep the sweep edge of the newest running agent in view.
    const tick = () => {
      if (follow.current) {
        const newest = [...running.current.entries()]
          .map(([n, at]) => ({ a: PLAN[n - 1]!, at }))
          .filter((x) => x.a.zone && x.a.zone !== "nav")
          .sort((x, y) => y.at - x.at)[0];
        const el = newest && zoneEl(newest.a.zone);
        if (el) {
          const p = Math.min(1, (performance.now() - newest.at) / (newest.a.dur * 1000));
          const r = el.getBoundingClientRect();
          const target = Math.max(
            0,
            window.scrollY + r.top + r.height * p - window.innerHeight * 0.55,
          );
          const y = window.scrollY + (target - window.scrollY) * 0.06;
          if (Math.abs(target - window.scrollY) > 1)
            window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        }
      }
      setElapsed((performance.now() - t0.current) / 1000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function runScroll() {
    let nextFree = 0; // stagger agents that enter view at the same time
    const qa = PLAN[PLAN.length - 1]!;
    const zoned = PLAN.filter((a) => a.zone);
    io.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const a = zoned.find((x) => x.zone === (e.target as HTMLElement).dataset["build"]);
          if (!a) continue;
          io.current?.unobserve(e.target);
          const now = performance.now();
          const wait = Math.max(0, nextFree - now);
          nextFree = now + wait + 350;
          later(() => startAgent(a, SCROLL_DUR), wait);
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.05 },
    );
    zoned.forEach((a) => {
      const el = zoneEl(a.zone);
      if (el) io.current!.observe(el);
    });
    const tick = () => {
      setElapsed((performance.now() - t0.current) / 1000);
      if (
        zoned.every((a) => doneSet.current.has(a.n)) &&
        !running.current.has(qa.n) &&
        !doneSet.current.has(qa.n)
      ) {
        startAgent(qa, 2.5);
        later(() => finish(false), 3000);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  // Keyboard: arrows / 1-3 / Enter in the prompt, Esc skips at any point.
  useEffect(() => {
    if (phase !== "intro" && phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish(true);
        return;
      }
      if (phase === "running") {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(e.key))
          follow.current = false;
        return;
      }
      const n = build.options.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => (s + 1) % n);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => (s - 1 + n) % n);
      } else if (/^[1-3]$/.test(e.key)) choose(build.options[Number(e.key) - 1]!.id);
      else if (e.key === "Enter") {
        e.preventDefault();
        choose(build.options[sel]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, sel, choose, finish]);

  if (phase === "idle") return null;

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="build-prompt"
          className="build-term w-full max-w-xl border border-border bg-card font-mono text-sm shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-ash/60" />
            <span className="size-2.5 rounded-full bg-ash/60" />
            <span className="size-2.5 rounded-full bg-ember" />
            <span className="ml-2 text-xs text-muted-foreground">{build.cwd}</span>
          </div>
          <div className="space-y-5 p-5 md:p-6">
            <div className="border border-ember/50 px-4 py-3">
              <p>
                <span className="text-ember">✻</span> {build.welcome[lang]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{build.meta}</p>
            </div>
            <p id="build-prompt" className="leading-relaxed">
              <span className="text-ember">&gt;</span> {build.prompt[lang]}
            </p>
            <ul className="space-y-1" role="listbox" aria-activedescendant={`build-opt-${sel}`}>
              {build.options.map((o, i) => (
                <li key={o.id} id={`build-opt-${i}`} role="option" aria-selected={sel === i}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => choose(o.id)}
                    className={`flex w-full items-baseline gap-3 px-2 py-1.5 text-left transition-colors ${sel === i ? "bg-ember/10 text-foreground" : "text-muted-foreground"}`}
                  >
                    <span className={sel === i ? "text-ember" : "opacity-0"}>❯</span>
                    <span>
                      {i + 1}. {o.label[lang]}
                    </span>
                    <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                      {o.hint[lang]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{build.keys[lang]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hideDock) return null;

  const total = phase === "finished" ? 14 : doneSet.current.size;
  return (
    <aside
      aria-live="polite"
      className={`build-term fixed bottom-4 right-4 z-[60] w-[min(26rem,calc(100vw-2rem))] border border-border bg-card/95 font-mono text-xs shadow-2xl backdrop-blur transition-opacity duration-500 ${phase === "finished" ? "opacity-90" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span>
          <span className={phase === "running" ? "build-spin text-ember" : "text-ember"}>✻</span>{" "}
          {phase === "running" ? build.building[lang] : build.done[lang]} · {total}/14{" "}
          {build.agents[lang]}
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span>
            {pad(Math.floor(elapsed / 60))}:{pad(Math.floor(elapsed % 60))}
          </span>
          {phase === "running" && (
            <button
              type="button"
              onClick={() => finish(true)}
              className="border border-border px-2 py-0.5 hover:text-foreground"
            >
              {build.skip[lang]} ⎋
            </button>
          )}
        </span>
      </div>
      <div className="h-px bg-border">
        <div
          className="h-px bg-ember transition-[width] duration-300"
          style={{ width: `${(total / 14) * 100}%` }}
        />
      </div>
      <ol className="space-y-1 px-3 py-2.5">
        {lines.map((l) => (
          <li
            key={l.id}
            className={`build-line truncate ${l.kind === "done" ? "text-foreground" : l.kind === "start" ? "text-muted-foreground" : "text-ash"}`}
          >
            {l.kind === "start" ? <span className="text-ember">● </span> : null}
            {l.text}
          </li>
        ))}
      </ol>
      {active.length > 0 && (
        <p className="border-t border-border px-3 py-2 text-muted-foreground">
          {active.map(tag).join(" · ")}
        </p>
      )}
    </aside>
  );
}
