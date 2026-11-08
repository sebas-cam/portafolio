import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Pause, Play, RotateCcw } from "lucide-react";
import { build, type Lang } from "@/content/site";
import { BuildEngine, type BuildState } from "./build-engine";

/**
 * Full-screen Claude Code-style prompt, then a HUD over the live build.
 * The head script in __root.tsx sets <html data-build="pending"> before paint.
 */

type Mode = (typeof build.modes)[number]["id"];
const SEEN = "build-seen";
const AUTO = "build-auto";
const SWARM = "build-swarm";
const DOTS = ["#e8894a", "#f0b45a", "#d4553a", "#f1e7d0", "#8f8476"];

const store = {
  get: (s: Storage | undefined, k: string) => {
    try {
      return s?.getItem(k) ?? null;
    } catch {
      return null;
    }
  },
  set: (s: Storage | undefined, k: string, v: string | null) => {
    try {
      if (v === null) s?.removeItem(k);
      else s?.setItem(k, v);
    } catch {
      /* blocked */
    }
  },
};
const ss = () => (typeof window === "undefined" ? undefined : window.sessionStorage);
const ls = () => (typeof window === "undefined" ? undefined : window.localStorage);

export function BuildShow({ lang }: { lang: Lang }) {
  const [stage, setStage] = useState<"off" | "intro" | "build">("off");
  const [hud, setHud] = useState<BuildState | null>(null);
  const [swarm, setSwarm] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<BuildEngine | null>(null);
  const pendingMode = useRef<Exclude<Mode, "done"> | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.dataset["build"]) return;
    html.dataset["buildLive"] = "";
    const auto = store.get(ss(), AUTO) as Mode | null;
    store.set(ss(), AUTO, null);
    setSwarm(store.get(ls(), SWARM) !== "0");
    if (auto === "show" || auto === "scroll") {
      pendingMode.current = auto;
      setStage("build");
    } else setStage("intro");
    return () => {
      engine.current?.destroy();
      engine.current = null;
      delete html.dataset["buildLive"];
      delete html.dataset["build"];
    };
  }, []);

  // Start the engine once its canvas is mounted.
  useEffect(() => {
    if (stage !== "build" || engine.current || !canvas.current) return;
    const e = new BuildEngine(canvas.current, lang, setHud);
    e.setSwarm(store.get(ls(), SWARM) !== "0");
    engine.current = e;
    if (pendingMode.current) void e.start(pendingMode.current);
  }, [stage, lang]);

  const launch = useCallback(
    (mode: Mode, l: Lang) => {
      store.set(ss(), SEEN, "1");
      if (l !== lang) {
        if (mode !== "done") store.set(ss(), AUTO, mode);
        window.location.href = `/${l}`;
        return;
      }
      if (mode === "done") {
        delete document.documentElement.dataset["build"];
        setStage("off");
        return;
      }
      pendingMode.current = mode;
      setStage("build");
    },
    [lang],
  );

  const toggleSwarm = () => {
    const on = !swarm;
    setSwarm(on);
    engine.current?.setSwarm(on);
    store.set(ls(), SWARM, on ? "1" : "0");
  };

  // Esc skips the running build.
  useEffect(() => {
    if (stage !== "build") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") engine.current?.skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  if (stage === "off") return null;
  if (stage === "intro") return <Terminal lang={lang} onLaunch={launch} />;

  return (
    <>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] h-full w-full"
      />
      {hud && (
        <Hud
          lang={lang}
          s={hud}
          swarm={swarm}
          onSkip={() => engine.current?.skip()}
          onPause={() => engine.current?.togglePause()}
          onReplay={() => engine.current?.replay()}
          onSwarm={toggleSwarm}
        />
      )}
    </>
  );
}

// ── HUD ─────────────────────────────────────────────────────────
function Hud({
  lang,
  s,
  swarm,
  onSkip,
  onPause,
  onReplay,
  onSwarm,
}: {
  lang: Lang;
  s: BuildState;
  swarm: boolean;
  onSkip: () => void;
  onPause: () => void;
  onReplay: () => void;
  onSwarm: () => void;
}) {
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setFlip((f) => !f), 1700);
    return () => clearInterval(id);
  }, []);
  const text = s.done
    ? `${build.builtBy[lang]} ${s.secs.toFixed(1)} s`
    : s.mode === "scroll"
      ? `${build.manual[lang]} · ${s.section + 1} ${build.of[lang]} ${s.total}`
      : flip
        ? `${s.section + 1} ${build.of[lang]} ${s.total} ${build.sections[lang]}`
        : `14 ${build.agents[lang]}: ${build.phases[s.phase][lang]}`;
  const btn =
    "flex h-10 items-center justify-center rounded-full border border-border bg-card/90 px-4 font-sans text-xs text-foreground backdrop-blur transition-colors hover:bg-secondary";
  return (
    <>
      <div
        className="fixed inset-x-0 bottom-5 z-[80] flex justify-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-10 items-center gap-3 rounded-full border border-border bg-card/90 px-4 font-mono text-[11px] text-foreground shadow-2xl backdrop-blur">
          <span className="flex -space-x-0.5">
            {DOTS.map((c) => (
              <span key={c} className="size-1.5 rounded-full" style={{ background: c }} />
            ))}
          </span>
          <span className="whitespace-nowrap">{text}</span>
          {!s.done && (
            <span className="hidden items-center gap-1 sm:flex" aria-hidden>
              {Array.from({ length: s.total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i < s.section ? "w-1.5 bg-foreground" : i === s.section ? "w-5 bg-foreground/80" : "w-1.5 bg-foreground/20"}`}
                />
              ))}
            </span>
          )}
        </div>
        {!s.done && (
          <>
            <button
              type="button"
              onClick={onPause}
              aria-label={s.paused ? build.resume[lang] : build.pause[lang]}
              className={`${btn} w-10 px-0`}
            >
              {s.paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button type="button" onClick={onSkip} className={btn}>
              {build.skip[lang]}
            </button>
          </>
        )}
      </div>
      <div className="fixed bottom-5 right-5 z-[80] hidden gap-2 md:flex">
        <button
          type="button"
          onClick={onSwarm}
          aria-label={build.swarm[lang]}
          title={build.swarm[lang]}
          className={`${btn} w-10 px-0`}
        >
          {swarm ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        {s.done && (
          <button
            type="button"
            onClick={onReplay}
            aria-label={build.replay[lang]}
            title={build.replay[lang]}
            className={`${btn} w-10 px-0`}
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </>
  );
}

// ── Terminal ────────────────────────────────────────────────────
type Line = { kind: "cmd" | "out" | "ask" | "reply"; text: string };

function Terminal({ lang, onLaunch }: { lang: Lang; onLaunch: (m: Mode, l: Lang) => void }) {
  const script: Line[] = [
    ...build.cmds.flatMap((c) => [
      { kind: "cmd" as const, text: c.cmd },
      { kind: "out" as const, text: c.out[lang] },
    ]),
    { kind: "ask", text: build.ask[lang] },
    { kind: "reply", text: build.reply[lang] },
  ];
  const [shown, setShown] = useState(0); // lines fully visible
  const [chars, setChars] = useState(0); // chars typed of the current line
  const [step, setStep] = useState<0 | 1>(0);
  const [sel, setSel] = useState(0);
  const mode = useRef<Mode>("show");
  const typing = shown < script.length;
  const langOpts = [...build.langs].sort((a) => (a.id === lang ? -1 : 1));

  // Type user commands char by char; outputs appear at once.
  useEffect(() => {
    if (!typing) return;
    const line = script[shown]!;
    const typed = line.kind === "cmd" || line.kind === "ask";
    if (typed && chars < line.text.length) {
      const id = window.setTimeout(() => setChars((c) => c + 1), 28);
      return () => clearTimeout(id);
    }
    const id = window.setTimeout(
      () => {
        setShown((s) => s + 1);
        setChars(0);
      },
      typed ? 260 : 380,
    );
    return () => clearTimeout(id);
  });

  const choose = useCallback(
    (i: number) => {
      if (step === 0) {
        const m = build.modes[i]!.id;
        if (m === "done") {
          onLaunch("done", lang);
          return;
        }
        mode.current = m;
        setStep(1);
        setSel(0);
      } else onLaunch(mode.current, langOpts[i]!.id);
    },
    [step, lang, onLaunch, langOpts],
  );

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const n = step === 0 ? build.modes.length : langOpts.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onLaunch("done", lang);
        return;
      }
      if (typing) {
        if (e.key === "Enter") {
          e.preventDefault();
          setShown(script.length);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => (s + 1) % n);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => (s - 1 + n) % n);
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(sel);
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) choose(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const opts =
    step === 0
      ? build.modes.map((m) => ({ label: m.label[lang], desc: m.desc[lang] }))
      : langOpts.map((l) => ({ label: l.label, desc: l.desc[lang] }));
  const [m1, ...mRest] =
    build.model[lang].split(" with ").length > 1
      ? build.model[lang].split(" with ")
      : build.model[lang].split(" con ");
  const joiner = lang === "en" ? " with " : " con ";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Claude Code"
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-background px-5 py-6 font-mono text-[13px] leading-relaxed text-foreground md:px-8 md:py-8 md:text-[15px]"
    >
      <header className="flex items-start gap-4">
        <PixelLogo />
        <div>
          <p className="font-medium">{build.app}</p>
          <p className="text-muted-foreground">
            <span className="text-ember">{m1}</span>
            {mRest.length ? joiner + mRest.join(joiner) : ""}
          </p>
          <p className="text-muted-foreground">{build.cwd}</p>
        </div>
      </header>

      <div className="mt-8 space-y-3">
        {script.slice(0, shown + (typing ? 1 : 0)).map((l, i) => {
          const live = i === shown && typing && (l.kind === "cmd" || l.kind === "ask");
          const text = live ? l.text.slice(0, chars) : l.text;
          if (l.kind === "cmd" || l.kind === "ask")
            return (
              <p key={i} className="bg-secondary px-2 py-0.5">
                <span className="text-muted-foreground">&gt;</span> {text}
                {live && <span className="build-caret">▌</span>}
              </p>
            );
          if (l.kind === "out") {
            const [a, b] = l.text.split("Opus 5.5");
            return (
              <p key={i} className="-mt-2 pl-3 text-muted-foreground">
                ↳ {a}
                {b !== undefined && (
                  <>
                    <span className="text-ember">Opus 5.5</span>
                    {b}
                  </>
                )}
              </p>
            );
          }
          return (
            <p key={i} className="build-line">
              <span className="text-ember">●</span> {text}
            </p>
          );
        })}
      </div>

      {!typing && (
        <div className="build-line mt-5 border-t border-border pt-5">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
            {build.tabs.map((t, i) => (
              <span
                key={i}
                className={
                  i === step ? "font-medium text-foreground" : i < step ? "text-ember" : ""
                }
              >
                {i < step || i === 2 ? "✓" : "☐"} {t[lang]}
              </span>
            ))}
          </div>
          <p className="mt-5 font-medium">{step === 0 ? build.q1[lang] : build.q2[lang]}</p>
          <ul className="mt-4 space-y-1" role="listbox">
            {opts.map((o, i) => (
              <li key={i} role="option" aria-selected={sel === i}>
                <button
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => choose(i)}
                  className={`grid w-full grid-cols-[1.5rem_1fr] px-2 py-2 text-left transition-colors ${sel === i ? "bg-ember/10" : ""}`}
                >
                  <span className={sel === i ? "text-ember" : "text-transparent"}>&gt;</span>
                  <span>
                    <span className={sel === i ? "text-ember" : ""}>
                      {i + 1}. {o.label}
                    </span>
                    <span className="block max-w-3xl text-muted-foreground">{o.desc}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-muted-foreground">{build.keys[lang]}</p>
        </div>
      )}

      <footer className="mt-auto pt-10 text-xs text-muted-foreground md:text-[13px]">
        <p className="text-right">◇ max · ultracode · /effort</p>
        <div className="my-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-ember">ultracode</span>
          <span className="h-px w-4 bg-border" />
        </div>
        <p>
          <span className="text-[#d4553a]">⏵⏵ {build.status[lang]}</span> · 14 {build.agents[lang]}
        </p>
      </footer>
    </div>
  );
}

/** Pixel "S" mark in the site's palette. */
function PixelLogo() {
  const rows = ["01110", "10000", "01110", "00001", "11110"];
  return (
    <svg width="52" height="52" viewBox="0 0 7 6" aria-hidden className="shrink-0">
      {rows.flatMap((r, y) =>
        [...r].map((c, x) =>
          c === "1" ? (
            <rect key={`${x}-${y}`} x={x} y={y + 0.5} width="1" height="1" fill="#e8894a" />
          ) : null,
        ),
      )}
      <rect x="6" y="0" width="0.7" height="0.7" fill="#f0b45a" />
      <rect x="6" y="2.2" width="0.7" height="0.7" fill="#f1e7d0" />
    </svg>
  );
}
