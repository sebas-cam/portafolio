/**
 * Build engine for the "14 agents build the page" intro.
 *
 * The page is fully rendered. While <html data-build> is set, every top-most text/media
 * element inside a [data-sec] zone starts as a wireframe. Each section then runs seven
 * phases, each with its own visible effect:
 *   Research     scouts sweep the section
 *   Architecture selection boxes + placeholders on every block, column guides, wires
 *   Design       headings vectorized (dashed outline + anchor nodes, "N vectors"), ghost cards
 *   Development  outlines traced then filled, copy typed char by char, chips/buttons lit
 *   QA           real WCAG contrast chips on text
 *   Deploy       radar ring
 *   Go-live      light beam, visuals painted, section marked built; swarm flocks to the next
 * A virtual clock drives everything, so pause/skip are exact. No real agents involved.
 */

export type BuildMode = "show" | "scroll";
export type Phase = "relev" | "arch" | "design" | "dev" | "qa" | "deploy" | "live";
export type BuildState = {
  section: number;
  total: number;
  phase: Phase;
  mode: BuildMode;
  paused: boolean;
  done: boolean;
  secs: number;
};

type Pt = { x: number; y: number };
type Team = Exclude<Phase, "live">;
type Sec = {
  key: string;
  el: HTMLElement;
  roots: HTMLElement[];
  els: HTMLElement[];
  blocks: HTMLElement[];
  label: HTMLElement | null;
  built: boolean;
};
type Cur = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: Team;
  color: string;
  seed: number;
  flying: boolean;
  fx: number;
  fy: number;
  bend: number;
  t0: number;
  dur: number;
  tgt: (() => Pt) | null;
  onArrive: (() => void) | null;
  holdUntil: number;
  home: Pt;
  trail: Pt[];
  labelUntil: number;
  hold: number;
};
type Box = { el: HTMLElement; at: number; until: number; chip?: string; fill: boolean };
type Vec = {
  el: HTMLElement;
  words: { text: string; x: number; y: number }[];
  font: string;
  ls: string;
  pts: Pt[];
  count: number;
  at: number;
  trace: number | null;
};
type Wire = { a: HTMLElement; b: HTMLElement; at: number; until: number; bend: number };
type Chip = { el: HTMLElement; text: string; at: number; until: number };
type Fx = { sec: Sec; at: number; kind: "ring" | "beam" | "guides" | "scan"; until: number };
type TypeJob = {
  el: HTMLElement;
  nodes: Text[];
  orig: string[];
  total: number;
  start: number;
  dur: number;
  caret: Pt;
  done: boolean;
};

const CANDIDATES = "h1,h2,h3,h4,p,li,dt,dd,a,button,img,video,.display,.eyebrow";
const HEADINGS = "h1,h2,h3,.display";
const TEAMS: { team: Team; color: string; n: number }[] = [
  { team: "relev", color: "#f1e7d0", n: 2 },
  { team: "arch", color: "#c9b8a3", n: 2 },
  { team: "design", color: "#d4553a", n: 3 },
  { team: "dev", color: "#f0b45a", n: 4 },
  { team: "qa", color: "#8f8476", n: 2 },
  { team: "deploy", color: "#e8894a", n: 1 },
];
const LABELS: Record<"en" | "es", Record<Phase, string>> = {
  en: {
    relev: "Research",
    arch: "Architecture",
    design: "Design",
    dev: "Development",
    qa: "QA",
    deploy: "Deploy",
    live: "Go-live",
  },
  es: {
    relev: "Relevamiento",
    arch: "Arquitectura",
    design: "Diseño",
    dev: "Desarrollo",
    qa: "QA",
    deploy: "Deploy",
    live: "Go-live",
  },
};
const RULER = 16;
const MONO = '"Geist Mono", ui-monospace, monospace';

const visible = (e: HTMLElement) =>
  e.offsetWidth > 0 && e.offsetHeight > 0 && e.getClientRects().length > 0;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function collect(roots: HTMLElement[]) {
  const all = roots
    .flatMap((r) => [...r.querySelectorAll<HTMLElement>(CANDIDATES)])
    .filter(visible);
  const set = new Set(all);
  // Top-most candidates only, so opacity never compounds and a card's chips build one by one.
  return all.filter((e) => {
    for (let p = e.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
}
function blocksOf(root: HTMLElement) {
  const real = (e: HTMLElement) =>
    ([...e.children] as HTMLElement[]).filter((k) => visible(k) && !k.hasAttribute("aria-hidden"));
  let inner = root;
  for (let kids = real(inner); kids.length === 1; kids = real(inner)) inner = kids[0]!;
  const out: HTMLElement[] = [];
  for (const k of real(inner)) {
    const kids = real(k);
    if (getComputedStyle(k).display.includes("grid") && kids.length > 1 && kids.length <= 6)
      out.push(...kids);
    else out.push(k);
  }
  return out.filter((b) => b.offsetHeight > 20).slice(0, 7);
}
function textNodes(el: HTMLElement) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const out: Text[] = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) if ((n as Text).nodeValue) out.push(n as Text);
  return out;
}

// WCAG contrast from any CSS color the browser understands (oklch included).
let probe: CanvasRenderingContext2D | null = null;
function rgba(c: string): [number, number, number, number] {
  probe ??= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext(
    "2d",
    { willReadFrequently: true },
  );
  if (!probe) return [0, 0, 0, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = c;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return [d[0]!, d[1]!, d[2]!, d[3]! / 255];
}
function contrast(el: HTMLElement) {
  let bg: [number, number, number, number] = rgba(getComputedStyle(document.body).backgroundColor);
  for (let p: HTMLElement | null = el; p; p = p.parentElement) {
    const c = rgba(getComputedStyle(p).backgroundColor);
    if (c[3] > 0.5) {
      bg = c;
      break;
    }
  }
  const f = rgba(getComputedStyle(el).color);
  const mix = f.slice(0, 3).map((v, i) => v * f[3] + bg[i]! * (1 - f[3]));
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const a = lum(mix),
    b = lum(bg.slice(0, 3));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Put every [data-sec] zone into its wireframe state (marks build targets with data-bel). */
export function markWireframe() {
  // Snap into the wireframe without transitions, or the finished page visibly fades out.
  const html = document.documentElement;
  html.setAttribute("data-build-instant", "");
  for (const el of document.querySelectorAll<HTMLElement>("[data-sec]")) {
    const key = el.dataset["sec"]!;
    const roots = [el, ...document.querySelectorAll<HTMLElement>(`[data-sec-with="${key}"]`)];
    collect(roots).forEach((e) => e.setAttribute("data-bel", ""));
  }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => html.removeAttribute("data-build-instant")),
  );
}

export class BuildEngine {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private secs: Sec[] = [];
  private curs: Cur[] = [];
  private pings: { x: number; y: number; at: number; color: string }[] = [];
  private boxes: Box[] = [];
  private vecs = new Map<HTMLElement, Vec>();
  private wires: Wire[] = [];
  private chips: Chip[] = [];
  private fx: Fx[] = [];
  private typing: TypeJob[] = [];
  private clock = 0;
  private last = 0;
  private raf = 0;
  private waiters: { at: number; res: () => void }[] = [];
  private camTarget: number | null = null;
  private abort = false;
  private started = 0;
  private swarm = true;
  private flock = false;
  private rulers = 0;
  private mouse: Pt = { x: -1, y: -1 };
  private labels: Record<Phase, string>;
  private vecWord: string;
  state: BuildState;

  constructor(
    private canvas: HTMLCanvasElement,
    lang: "en" | "es",
    vecWord: string,
    private emit: (s: BuildState) => void,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.labels = LABELS[lang];
    this.vecWord = vecWord;
    this.state = {
      section: 0,
      total: 0,
      phase: "relev",
      mode: "show",
      paused: false,
      done: false,
      secs: 0,
    };
    this.scan();
    this.resize();
    let i = 0;
    for (const t of TEAMS)
      for (let k = 0; k < t.n; k++, i++) {
        const p = { x: this.w / 2 + Math.cos(i) * 60, y: -30 - i * 6 };
        this.curs.push({
          ...p,
          vx: 0,
          vy: 0,
          team: t.team,
          color: t.color,
          seed: i * 1.7,
          flying: false,
          fx: 0,
          fy: 0,
          bend: 0,
          t0: 0,
          dur: 1,
          tgt: null,
          onArrive: null,
          holdUntil: 0,
          home: { x: this.w / 2 + (i - 7) * 18, y: 90 },
          trail: [],
          labelUntil: 0,
          hold: 120,
        });
      }
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onMouse, { passive: true });
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Mark zones and elements; puts the page into its wireframe state. */
  scan() {
    const zones = [...document.querySelectorAll<HTMLElement>("[data-sec]")];
    this.secs = zones.map((el) => {
      const key = el.dataset["sec"]!;
      const roots = [el, ...document.querySelectorAll<HTMLElement>(`[data-sec-with="${key}"]`)];
      const els = collect(roots);
      els.forEach((e) => e.setAttribute("data-bel", ""));
      const label =
        el.querySelector<HTMLElement>(":scope > p.eyebrow") ??
        el.querySelector<HTMLElement>(".eyebrow");
      return { key, el, roots, els, blocks: blocksOf(el), label, built: false };
    });
    this.state.total = this.secs.length;
  }

  // ── public controls ─────────────────────────────────────────
  async start(mode: BuildMode) {
    this.abort = false;
    this.started = this.clock;
    this.state = { ...this.state, mode, done: false, paused: false, section: 0, phase: "relev" };
    document.documentElement.dataset["build"] = "running";
    window.addEventListener("wheel", this.onGesture, { passive: true });
    window.addEventListener("touchmove", this.onGesture, { passive: true });
    window.addEventListener("keydown", this.onKey);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    this.push();
    await this.wait(200);
    if (mode === "show") await this.runShow();
    if (this.state.mode === "scroll" && !this.abort) await this.runScroll();
    if (!this.abort) this.finish();
  }

  skip() {
    if (this.state.done) return;
    this.abort = true;
    this.typing.forEach((j) => this.endTyping(j));
    for (const s of this.secs) this.complete(s);
    this.clearFx();
    this.waiters.splice(0).forEach((w) => w.res());
    this.finish();
  }

  togglePause() {
    this.state.paused = !this.state.paused;
    // Resume flights from wherever the swarm drifted while paused.
    if (!this.state.paused)
      for (const c of this.curs)
        if (c.flying) {
          c.fx = c.x;
          c.fy = c.y;
          c.t0 = this.clock;
        }
    this.push();
  }
  setSwarm(on: boolean) {
    this.swarm = on;
  }

  replay() {
    this.abort = true;
    this.waiters.splice(0).forEach((w) => w.res());
    this.typing.forEach((j) => this.endTyping(j));
    this.clearFx();
    document.documentElement.dataset["build"] = "pending";
    for (const s of this.secs) {
      s.built = false;
      delete s.el.dataset["built"];
      delete s.el.dataset["phase"];
      s.roots.forEach((r) => {
        delete r.dataset["built"];
        delete r.dataset["phase"];
      });
      s.els.forEach((e) => e.removeAttribute("data-on"));
    }
    requestAnimationFrame(() => void this.start("show"));
  }

  destroy() {
    this.abort = true;
    cancelAnimationFrame(this.raf);
    this.typing.forEach((j) => this.endTyping(j));
    this.unlisten();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onMouse);
    delete document.documentElement.dataset["build"];
  }

  // ── sequences ───────────────────────────────────────────────
  private async runShow() {
    for (let i = 0; i < this.secs.length; i++) {
      if (this.abort || this.state.mode !== "show") return;
      await this.buildSection(i, 0.72);
    }
  }

  private async runScroll() {
    this.camTarget = null;
    this.flock = false;
    while (!this.abort && this.secs.some((s) => !s.built)) {
      const i = this.secs.findIndex((s) => {
        if (s.built) return false;
        const r = s.el.getBoundingClientRect();
        return r.top < this.h * 0.8 && r.bottom > 40;
      });
      if (i < 0) {
        await this.wait(120);
        continue;
      }
      await this.buildSection(i, 0.65);
    }
  }

  private async buildSection(i: number, sp: number) {
    const s = this.secs[i]!;
    const show = () => this.state.mode === "show";
    const top = () => this.docY(s.el) - 64;
    this.state.section = i;
    this.flock = false;

    // 1 · Research: scouts sweep the section.
    this.phase("relev");
    if (show()) this.camTarget = top();
    this.fx.push({ sec: s, at: this.clock, kind: "scan", until: this.clock + 420 * sp });
    this.team("relev").forEach((c, k) => {
      const e = s.els[Math.floor(rnd(0, s.els.length))];
      if (e) this.send(c, this.pt(e, rnd(0.1, 0.9), 0.5), null, 120, k === 0);
    });
    await this.wait(300 * sp);
    if (this.abort) return;

    // 2 · Architecture: every block measured at once, placeholders, guides, wires.
    this.phase("arch");
    const until = this.clock + 1500 * sp;
    this.fx.push({ sec: s, at: this.clock, kind: "guides", until });
    s.blocks.forEach((b, k) => {
      this.boxes.push({ el: b, at: this.clock + k * 50, until, fill: true });
      if (s.label && s.label !== b && !b.contains(s.label))
        this.wires.push({ a: s.label, b, at: this.clock + k * 60, until, bend: rnd(-0.35, 0.35) });
    });
    const corners = s.blocks.flatMap((b) => [this.pt(b, 0, 0), this.pt(b, 1, 1)]);
    [...this.team("arch"), ...this.team("relev"), ...this.team("design")].forEach((c, k) => {
      const p = corners[k % Math.max(1, corners.length)];
      if (p) this.send(c, p, null, 500, k < 2);
    });
    await this.wait(480 * sp);
    if (this.abort) return;

    // 3 · Design: headings vectorized, ghost cards.
    this.phase("design");
    s.el.dataset["phase"] = "design";
    s.roots.forEach((r) => (r.dataset["phase"] = "design"));
    const heads = s.els.filter((e) => e.matches(HEADINGS) && this.inView(e, 200));
    heads.forEach((e) => this.vectorize(e));
    const big = heads.sort(
      (a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight,
    )[0];
    if (big) {
      const v = this.vecs.get(big);
      if (v)
        this.boxes.push({
          el: big,
          at: this.clock,
          until: this.clock + 900 * sp,
          fill: false,
          chip: `${v.count} ${this.vecWord}`,
        });
    }
    const designers = this.team("design");
    heads.slice(0, 6).forEach((e, k) => {
      const c = designers[k % designers.length]!;
      this.send(c, this.pt(e, rnd(0.2, 0.9), rnd(0.2, 0.8)), null, 300, true);
    });
    await this.wait(460 * sp);
    if (this.abort) return;

    // 4 · Development: trace + fill headings, type copy, light the rest.
    this.phase("dev");
    s.el.dataset["phase"] = "dev";
    s.roots.forEach((r) => (r.dataset["phase"] = "dev"));
    const n = s.els.length;
    const gap = clamp((850 * sp) / Math.max(1, n), 12, 90);
    for (let j = 0; j < n; j++) {
      if (this.abort) return;
      const el = s.els[j]!;
      const c = this.freeCursor();
      if (el.matches(HEADINGS)) {
        this.send(c, this.pt(el, 0.02, 0.5), () => this.trace(el), 80, Math.random() < 0.4);
      } else if (el.tagName === "P" && (el.textContent?.length ?? 0) < 320 && this.inView(el, 0)) {
        const job = this.startTyping(el, sp);
        this.send(c, () => job.caret, null, job.dur + 60, Math.random() < 0.4);
      } else {
        this.send(
          c,
          this.pt(el, rnd(0.15, 0.85), rnd(0.3, 0.8)),
          () => this.light(el),
          90,
          Math.random() < 0.25,
        );
      }
      if (show()) {
        const r = el.getBoundingClientRect();
        const y = this.docY(el) + r.height - this.h * 0.62;
        if (this.camTarget === null || y > this.camTarget) this.camTarget = Math.max(top(), y);
      }
      await this.wait(gap);
    }
    // Let flights land and typing finish (capped).
    for (
      let k = 0;
      k < 6 && (this.curs.some((c) => c.flying && c.onArrive) || this.typing.length);
      k++
    )
      await this.wait(80);
    await this.wait(120 * sp);
    if (this.abort) return;

    // 5 · QA: real contrast chips.
    this.phase("qa");
    // Measure only elements whose colour transition has already settled.
    const checks = s.els
      .filter(
        (e) =>
          e.hasAttribute("data-on") &&
          (e.matches(HEADINGS) || e.tagName === "P") &&
          this.inView(e, -40),
      )
      .slice(0, 3);
    this.complete(s);
    this.typing.filter((j) => s.els.includes(j.el)).forEach((j) => this.endTyping(j));
    const qa = this.team("qa");
    checks.forEach((e, k) => {
      const r = contrast(e);
      const grade = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA·L" : "✗";
      this.chips.push({
        el: e,
        text: `${r.toFixed(1)}:1 ${grade}`,
        at: this.clock + k * 90,
        until: this.clock + 900 * sp,
      });
      const c = qa[k % qa.length]!;
      this.send(c, this.pt(e, 1, 0), null, 500, true);
    });
    await this.wait(380 * sp);
    if (this.abort) return;

    // 6 · Deploy: radar ring.
    this.phase("deploy");
    this.fx.push({ sec: s, at: this.clock, kind: "ring", until: this.clock + 950 });
    this.team("deploy").forEach((c) => this.send(c, this.secCenter(s), null, 400, true));
    await this.wait(320 * sp);
    if (this.abort) return;

    // 7 · Go-live: beam, visuals painted, swarm flocks to the next section.
    this.phase("live");
    this.fx.push({ sec: s, at: this.clock, kind: "beam", until: this.clock + 750 });
    s.el.dataset["built"] = "";
    s.roots.forEach((r) => (r.dataset["built"] = ""));
    await this.wait(260 * sp);
    if (show() && i < this.secs.length - 1) {
      this.flock = true;
      this.curs.forEach((c) => {
        c.tgt = null;
        c.flying = false;
        c.onArrive = null;
      });
      await this.wait(300 * sp);
    }
  }

  private complete(s: Sec) {
    s.els.forEach((e) => {
      if (!e.hasAttribute("data-on")) e.setAttribute("data-on", "");
    });
    s.built = true;
    s.roots.forEach((r) => {
      r.dataset["phase"] = "dev";
    });
    s.els.forEach((e) => this.vecs.delete(e));
  }

  private light(el: HTMLElement) {
    if (!el.hasAttribute("data-on")) el.setAttribute("data-on", "");
  }

  private finish() {
    this.unlisten();
    this.camTarget = null;
    this.flock = false;
    for (const s of this.secs) {
      s.el.dataset["built"] = "";
      s.roots.forEach((r) => (r.dataset["built"] = ""));
    }
    this.state = {
      ...this.state,
      done: true,
      paused: false,
      secs: (this.clock - this.started) / 1000,
      section: this.secs.length - 1,
      phase: "live",
    };
    this.push();
    window.setTimeout(() => {
      if (!this.state.done) return;
      delete document.documentElement.dataset["build"];
      for (const s of this.secs) {
        delete s.el.dataset["phase"];
        s.roots.forEach((r) => delete r.dataset["phase"]);
      }
    }, 1000);
  }

  // ── effects ─────────────────────────────────────────────────
  private vectorize(el: HTMLElement) {
    const cs = getComputedStyle(el);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const upper = cs.textTransform === "uppercase";
    const er = el.getBoundingClientRect();
    const words: Vec["words"] = [];
    const m = this.ctx;
    m.save();
    m.font = font;
    for (const node of textNodes(el)) {
      const text = node.nodeValue ?? "";
      for (const mt of text.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, mt.index);
        range.setEnd(node, mt.index + mt[0].length);
        const r = range.getBoundingClientRect();
        const word = upper ? mt[0].toUpperCase() : mt[0];
        const asc = m.measureText(word).fontBoundingBoxAscent;
        words.push({ text: word, x: r.left - er.left, y: r.top - er.top + asc });
      }
    }
    m.restore();
    // Sample the glyph outline for anchor nodes.
    const W = Math.ceil(er.width) + 4,
      H = Math.ceil(er.height) + 4;
    const oc = Object.assign(document.createElement("canvas"), { width: W, height: H });
    const o = oc.getContext("2d", { willReadFrequently: true });
    const pts: Pt[] = [];
    if (o) {
      o.font = font;
      o.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      o.strokeStyle = "#fff";
      o.lineWidth = 1.4;
      words.forEach((w) => o.strokeText(w.text, w.x, w.y));
      const d = o.getImageData(0, 0, W, H).data;
      // Evenly spaced anchor nodes along the outline: greedy keep with a spatial hash.
      const D = Math.max(5, parseFloat(cs.fontSize) / 6.5);
      const seen = new Set<string>();
      for (let y = 0; y < H; y += 2)
        for (let x = 0; x < W; x += 2) {
          if (d[(y * W + x) * 4 + 3]! < 90) continue;
          const gx = Math.floor(x / D),
            gy = Math.floor(y / D);
          let near = false;
          for (let oy = -1; oy <= 1 && !near; oy++)
            for (let ox = -1; ox <= 1 && !near; ox++)
              if (seen.has(`${gx + ox},${gy + oy}`))
                near = pts.some(
                  (p) =>
                    Math.abs(p.x - x) < D &&
                    Math.abs(p.y - y) < D &&
                    Math.floor(p.x / D) === gx + ox &&
                    Math.floor(p.y / D) === gy + oy,
                );
          if (near) continue;
          seen.add(`${gx},${gy}`);
          pts.push({ x, y });
        }
    }
    this.vecs.set(el, {
      el,
      words,
      font,
      ls: o?.letterSpacing ?? "0px",
      pts,
      count: pts.length,
      at: this.clock,
      trace: null,
    });
  }

  private trace(el: HTMLElement) {
    const v = this.vecs.get(el);
    if (!v) {
      this.light(el);
      return;
    }
    v.trace = this.clock;
  }

  private startTyping(el: HTMLElement, sp: number): TypeJob {
    const nodes = textNodes(el);
    const orig = nodes.map((n) => n.nodeValue ?? "");
    const total = orig.reduce((a, s) => a + s.length, 0);
    const r = el.getBoundingClientRect();
    el.style.minHeight = `${r.height}px`;
    nodes.forEach((n) => (n.nodeValue = ""));
    el.setAttribute("data-on", "");
    const job: TypeJob = {
      el,
      nodes,
      orig,
      total,
      start: this.clock,
      dur: clamp(total * 11, 420, 1100) * sp,
      caret: { x: r.left, y: r.top + 10 },
      done: false,
    };
    this.typing.push(job);
    return job;
  }
  private stepTyping(j: TypeJob) {
    const q = clamp((this.clock - j.start) / j.dur, 0, 1);
    let left = Math.round(q * j.total);
    let lastNode: Text | null = null,
      lastLen = 0;
    j.nodes.forEach((n, i) => {
      const o = j.orig[i]!;
      const take = clamp(left, 0, o.length);
      left -= take;
      const v = o.slice(0, take);
      if (n.nodeValue !== v) n.nodeValue = v;
      if (take > 0) {
        lastNode = n;
        lastLen = take;
      }
    });
    if (lastNode) {
      const range = document.createRange();
      range.setStart(lastNode, Math.max(0, lastLen - 1));
      range.setEnd(lastNode, lastLen);
      const r = range.getBoundingClientRect();
      if (r.width || r.height) j.caret = { x: r.right + 1, y: r.top + r.height * 0.55 };
    }
    if (q >= 1) this.endTyping(j);
  }
  private endTyping(j: TypeJob) {
    if (j.done) return;
    j.done = true;
    j.nodes.forEach((n, i) => (n.nodeValue = j.orig[i]!));
    j.el.style.minHeight = "";
    this.typing = this.typing.filter((x) => x !== j);
  }

  private clearFx() {
    this.boxes = [];
    this.wires = [];
    this.chips = [];
    this.fx = [];
    this.vecs.clear();
  }

  // ── agents ──────────────────────────────────────────────────
  private team(t: Team) {
    return this.curs.filter((c) => c.team === t);
  }
  private freeCursor() {
    let best = this.curs[0]!,
      score = Infinity;
    for (const c of this.curs) {
      const s = (c.flying ? 1e6 : 0) + Math.max(0, c.holdUntil - this.clock) + Math.random() * 60;
      if (s < score) {
        score = s;
        best = c;
      }
    }
    return best;
  }
  private send(c: Cur, tgt: () => Pt, onArrive: (() => void) | null, hold: number, label = false) {
    if (c.onArrive) {
      const f = c.onArrive;
      c.onArrive = null;
      f();
    }
    const p = tgt();
    const dist = Math.hypot(p.x - c.x, p.y - c.y);
    Object.assign(c, {
      flying: true,
      fx: c.x,
      fy: c.y,
      t0: this.clock,
      dur: clamp(200 + dist * 0.5, 240, 720),
      bend: rnd(-0.45, 0.45),
      tgt,
      onArrive,
      holdUntil: this.clock + 1e9,
    });
    c.labelUntil = label ? this.clock + 900 : c.labelUntil;
    c.hold = hold;
  }
  private pt(el: HTMLElement, fx: number, fy: number) {
    return () => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width * fx, y: r.top + r.height * fy };
    };
  }

  // ── loop ────────────────────────────────────────────────────
  private frame = (now: number) => {
    const dt = Math.min(50, now - this.last);
    this.last = now;
    if (!this.state.paused) this.clock += dt;
    if (!this.state.done && !this.state.paused)
      this.state.secs = (this.clock - this.started) / 1000;
    for (let k = this.waiters.length - 1; k >= 0; k--)
      if (this.waiters[k]!.at <= this.clock) this.waiters.splice(k, 1)[0]!.res();
    if (!this.state.paused) [...this.typing].forEach((j) => this.stepTyping(j));

    if (this.camTarget !== null && this.state.mode === "show" && !this.state.paused) {
      const max = document.documentElement.scrollHeight - this.h;
      const d = clamp(this.camTarget, 0, max) - window.scrollY;
      if (Math.abs(d) > 0.5)
        window.scrollTo({ top: window.scrollY + d * 0.085, behavior: "instant" as ScrollBehavior });
    }

    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private step(dt: number) {
    const k = dt / 16.7;
    const t = performance.now() / 1000;
    const follow = (this.state.paused || this.state.done) && this.mouse.x >= 0;
    this.curs.forEach((c, i) => {
      let tx: number, ty: number;
      if (follow) {
        const a = t * 0.9 + c.seed,
          r = 26 + (i % 4) * 9;
        tx = this.mouse.x + Math.cos(a) * r;
        ty = this.mouse.y + 22 + Math.sin(a * 1.3) * r * 0.7;
      } else if (c.flying && c.tgt) {
        const p = c.tgt();
        const q = clamp((this.clock - c.t0) / c.dur, 0, 1),
          e = ease(q);
        const mx = (c.fx + p.x) / 2,
          my = (c.fy + p.y) / 2,
          dx = p.x - c.fx,
          dy = p.y - c.fy;
        const cx = mx - dy * c.bend,
          cy = my + dx * c.bend;
        c.x = (1 - e) * (1 - e) * c.fx + 2 * (1 - e) * e * cx + e * e * p.x;
        c.y = (1 - e) * (1 - e) * c.fy + 2 * (1 - e) * e * cy + e * e * p.y;
        c.vx = c.vy = 0;
        if (q >= 1) {
          c.flying = false;
          c.holdUntil = this.clock + c.hold;
          const f = c.onArrive;
          c.onArrive = null;
          if (f) {
            f();
            this.pings.push({ x: p.x, y: p.y, at: this.clock, color: c.color });
          }
        }
        this.trailPush(c);
        return;
      } else if (c.tgt && this.clock < c.holdUntil) {
        const p = c.tgt();
        tx = p.x + Math.sin(t * 3 + c.seed) * 2;
        ty = p.y + Math.cos(t * 2.6 + c.seed) * 2;
        c.home = { x: p.x, y: p.y };
      } else if (this.flock) {
        tx = this.w / 2 + (i - 6.5) * 16 + Math.sin(t * 2 + c.seed) * 5;
        ty = 76 + Math.abs(i - 6.5) * 4 + Math.cos(t * 2.2 + c.seed) * 4;
      } else {
        c.tgt = null;
        tx = c.home.x + Math.sin(t * 0.8 + c.seed) * 14;
        ty = c.home.y + Math.cos(t * 0.7 + c.seed) * 10;
      }
      const stiff = follow || this.flock ? 0.05 : 0.03;
      c.vx = (c.vx + (tx - c.x) * stiff * k) * Math.pow(0.8, k);
      c.vy = (c.vy + (ty - c.y) * stiff * k) * Math.pow(0.8, k);
      c.x += c.vx * k;
      c.y += c.vy * k;
      this.trailPush(c);
    });
    const now = this.clock;
    this.pings = this.pings.filter((p) => now - p.at < 600);
    this.boxes = this.boxes.filter((b) => now < b.until);
    this.wires = this.wires.filter((w) => now < w.until);
    this.chips = this.chips.filter((c) => now < c.until);
    this.fx = this.fx.filter((f) => now < f.until);
    for (const [el, v] of this.vecs)
      if (v.trace !== null && now - v.trace > 900) this.vecs.delete(el);
    this.rulers += ((this.state.done ? 0 : 1) - this.rulers) * 0.08 * k;
  }
  private trailPush(c: Cur) {
    c.trail.push({ x: c.x, y: c.y });
    if (c.trail.length > 22) c.trail.shift();
  }

  // ── drawing ─────────────────────────────────────────────────
  private draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const now = this.clock;
    if ((this.state.paused || this.state.done) && this.mouse.x >= 0 && this.swarm) {
      const g = ctx.createRadialGradient(
        this.mouse.x,
        this.mouse.y,
        0,
        this.mouse.x,
        this.mouse.y,
        220,
      );
      g.addColorStop(0, "rgba(232,137,74,0.10)");
      g.addColorStop(1, "rgba(232,137,74,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    for (const f of this.fx) this.drawFx(f, now);
    if (this.rulers > 0.01) this.drawRulers();
    for (const wv of this.wires) this.drawWire(wv, now);
    for (const b of this.boxes) this.drawBox(b, now);
    for (const v of this.vecs.values()) this.drawVec(v, now);
    for (const c of this.chips) this.drawChip(c, now);
    if (!this.swarm) return;

    for (const p of this.pings) {
      const q = (now - p.at) / 600;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = (1 - q) * 0.8;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + q * 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const c of this.curs) {
      // flight path (curved) + comet tail
      if (c.flying && c.tgt) {
        const p = c.tgt(),
          dx = p.x - c.fx,
          dy = p.y - c.fy;
        const cx = (c.fx + p.x) / 2 - dy * c.bend,
          cy = (c.fy + p.y) / 2 + dx * c.bend;
        ctx.strokeStyle = hexA(c.color, 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.fx, c.fy);
        ctx.quadraticCurveTo(cx, cy, p.x, p.y);
        ctx.stroke();
      }
      const tr = c.trail;
      for (let i = 1; i < tr.length; i++) {
        const q = i / tr.length;
        ctx.strokeStyle = hexA(c.color, q * 0.55);
        ctx.lineWidth = 0.4 + q * 1.8;
        ctx.beginPath();
        ctx.moveTo(tr[i - 1]!.x, tr[i - 1]!.y);
        ctx.lineTo(tr[i]!.x, tr[i]!.y);
        ctx.stroke();
      }
    }
    this.curs.forEach((c) => {
      drawArrow(ctx, c.x, c.y, c.color);
      if (!this.state.done && c.labelUntil > now)
        this.pill(this.labels[c.team], c.x + 11, c.y + 17, c.color, "#1b1714");
    });
  }

  private pill(text: string, x: number, y: number, bg: string, fg: string, size = 10) {
    const { ctx } = this;
    ctx.font = `500 ${size}px ${MONO}`;
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, tw + 10, size + 6, 3);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(text, x + 5, y + size + 1.5);
    return tw + 10;
  }

  private drawBox(b: Box, now: number) {
    if (now < b.at) return;
    const { ctx } = this;
    const r = b.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > this.h) return;
    const q = clamp((now - b.at) / 200, 0, 1) * clamp((b.until - now) / 250, 0, 1);
    ctx.globalAlpha = q;
    const x = Math.round(r.left) + 0.5,
      y = Math.round(r.top) + 0.5,
      W = Math.round(r.width),
      H = Math.round(r.height);
    if (b.fill) {
      ctx.fillStyle = "rgba(241,231,208,0.045)";
      ctx.fillRect(x, y, W, H);
    }
    ctx.strokeStyle = "rgba(232,137,74,0.75)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, W, H);
    ctx.fillStyle = "#f1e7d0";
    for (const [px, py] of [
      [x, y],
      [x + W, y],
      [x + W, y + H],
      [x, y + H],
    ] as const)
      ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    const label = `${W} × ${H}`;
    ctx.font = `500 10px ${MONO}`;
    const tw = ctx.measureText(label).width;
    this.pill(
      label,
      x + W / 2 - tw / 2 - 5,
      Math.min(this.h - 18, y + H + 6),
      "rgba(232,137,74,0.9)",
      "#1b1714",
    );
    if (b.chip) {
      ctx.font = `500 10px ${MONO}`;
      this.pill(b.chip, x + W - ctx.measureText(b.chip).width - 10, y - 20, "#f1e7d0", "#1b1714");
    }
    ctx.globalAlpha = 1;
  }

  private drawWire(wv: Wire, now: number) {
    if (now < wv.at) return;
    const { ctx } = this;
    const a = wv.a.getBoundingClientRect(),
      b = wv.b.getBoundingClientRect();
    const x1 = a.left,
      y1 = a.bottom + 2,
      x2 = b.left + Math.min(24, b.width / 2),
      y2 = b.top;
    const q = ease(clamp((now - wv.at) / 420, 0, 1));
    const cx = (x1 + x2) / 2 + (y2 - y1) * wv.bend,
      cy = (y1 + y2) / 2 - (x2 - x1) * wv.bend * 0.3;
    ctx.globalAlpha = clamp((wv.until - now) / 250, 0, 1);
    ctx.strokeStyle = "rgba(232,137,74,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const N = 24;
    let ex = x1,
      ey = y1;
    for (let i = 1; i <= N * q; i++) {
      const s = i / N;
      ex = (1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * cx + s * s * x2;
      ey = (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * cy + s * s * y2;
      ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    ctx.fillStyle = "#e8894a";
    ctx.beginPath();
    ctx.arc(x1, y1, 2, 0, Math.PI * 2);
    ctx.arc(ex, ey, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawVec(v: Vec, now: number) {
    const { ctx } = this;
    const r = v.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > this.h) return;
    const appear = clamp((now - v.at) / 350, 0, 1);
    const tq = v.trace === null ? 0 : clamp((now - v.trace) / 480, 0, 1);
    if (v.trace !== null && tq >= 1 && !v.el.hasAttribute("data-on"))
      v.el.setAttribute("data-on", "glow");
    const fade = v.trace === null ? 1 : clamp(1 - (now - v.trace - 480) / 400, 0, 1);
    ctx.save();
    ctx.globalAlpha = appear * fade;
    ctx.font = v.font;
    ctx.letterSpacing = v.ls;
    const cut = r.left + r.width * tq;
    // traced part: solid outline
    if (tq > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.left - 4, r.top - 20, cut - r.left + 4, r.height + 40);
      ctx.clip();
      ctx.strokeStyle = "rgba(232,137,74,0.95)";
      ctx.lineWidth = 1.1;
      ctx.setLineDash([]);
      v.words.forEach((w) => ctx.strokeText(w.text, r.left + w.x, r.top + w.y));
      ctx.restore();
    }
    // pending part: dashed vectors + anchor nodes
    ctx.save();
    ctx.beginPath();
    ctx.rect(cut, r.top - 20, r.right - cut + 8, r.height + 40);
    ctx.clip();
    ctx.strokeStyle = "rgba(232,137,74,0.85)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2.5, 3]);
    ctx.lineDashOffset = -now / 60;
    v.words.forEach((w) => ctx.strokeText(w.text, r.left + w.x, r.top + w.y));
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(241,231,208,0.55)";
    ctx.lineWidth = 0.8;
    const shown = Math.floor(v.pts.length * appear);
    const step = Math.max(1, Math.ceil(v.pts.length / 650));
    for (let i = 0; i < shown; i += step) {
      const p = v.pts[i]!;
      ctx.beginPath();
      ctx.arc(r.left + p.x, r.top + p.y, 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  private drawChip(c: Chip, now: number) {
    if (now < c.at) return;
    const r = c.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > this.h) return;
    this.ctx.globalAlpha = clamp((now - c.at) / 150, 0, 1) * clamp((c.until - now) / 200, 0, 1);
    const x = Math.min(this.w - 120, r.left + Math.min(r.width, this.textWidth(c.el)) + 8),
      y = r.top + 2;
    this.pill(c.text, x, y, "#f1e7d0", "#1b1714");
    this.pill("QA", x, y + 20, "#8f8476", "#1b1714");
    this.ctx.globalAlpha = 1;
  }
  private textWidth(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rs = [...range.getClientRects()];
    return rs.length
      ? Math.max(...rs.map((r) => r.right)) - el.getBoundingClientRect().left
      : el.offsetWidth;
  }

  private drawFx(f: Fx, now: number) {
    const { ctx } = this;
    const r = f.sec.el.getBoundingClientRect();
    const life = clamp((now - f.at) / (f.until - f.at), 0, 1);
    if (f.kind === "scan") {
      const y =
        clamp(r.top, RULER, this.h) +
        (Math.min(r.bottom, this.h) - clamp(r.top, RULER, this.h)) * ease(life);
      const g = ctx.createLinearGradient(0, y - 40, 0, y);
      g.addColorStop(0, "rgba(241,231,208,0)");
      g.addColorStop(1, "rgba(241,231,208,0.10)");
      ctx.fillStyle = g;
      ctx.fillRect(r.left, y - 40, r.width, 40);
      ctx.fillStyle = "rgba(241,231,208,0.4)";
      ctx.fillRect(r.left, y, r.width, 1);
    } else if (f.kind === "guides") {
      const a = clamp((now - f.at) / 250, 0, 1) * clamp((f.until - now) / 300, 0, 1);
      const inner = f.sec.blocks[0]?.parentElement?.getBoundingClientRect() ?? r;
      const left = Math.max(inner.left, r.left + 20),
        right = Math.min(inner.right, r.right - 20);
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(232,137,74,0.035)";
      const gw = (right - left - 11 * 20) / 12;
      for (let i = 0; i < 12; i++)
        ctx.fillRect(
          left + i * (gw + 20),
          Math.max(r.top, RULER),
          gw,
          Math.min(r.bottom, this.h) - Math.max(r.top, RULER),
        );
      ctx.strokeStyle = "rgba(241,231,208,0.12)";
      ctx.setLineDash([4, 6]);
      const cx = (r.left + r.right) / 2,
        cy = clamp((r.top + r.bottom) / 2, 0, this.h);
      ctx.beginPath();
      ctx.moveTo(cx, Math.max(r.top, RULER));
      ctx.lineTo(cx, Math.min(r.bottom, this.h));
      ctx.moveTo(r.left, cy);
      ctx.lineTo(r.right, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    } else if (f.kind === "ring") {
      const c = this.secCenter(f.sec)();
      const R = Math.hypot(this.w, this.h) * 0.55 * ease(life);
      ctx.strokeStyle = `rgba(232,137,74,${0.7 * (1 - life)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(241,231,208,${0.35 * (1 - life)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, R * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      if (life < 0.8) this.pill(this.labels.deploy, c.x - 24, c.y - R - 8, "#e8894a", "#1b1714");
    } else {
      const x = r.left + r.width * ease(life);
      const top = Math.max(r.top, 0),
        bot = Math.min(r.bottom, this.h);
      const g = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
      g.addColorStop(0, "rgba(232,137,74,0)");
      g.addColorStop(0.5, `rgba(240,180,90,${0.22 * (1 - life * 0.6)})`);
      g.addColorStop(1, "rgba(232,137,74,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 90, top, 180, bot - top);
      ctx.fillStyle = `rgba(255,240,220,${0.85 * (1 - life)})`;
      ctx.fillRect(x - 0.75, top, 1.5, bot - top);
    }
  }

  private drawRulers() {
    const { ctx, w, h } = this;
    ctx.globalAlpha = this.rulers;
    ctx.fillStyle = "rgba(27,23,20,0.92)";
    ctx.fillRect(0, 0, w, RULER);
    ctx.fillRect(0, 0, RULER, h);
    ctx.fillStyle = "rgba(232,137,74,0.25)";
    for (const b of this.boxes) {
      const r = b.el.getBoundingClientRect();
      ctx.fillRect(r.left, 0, r.width, RULER);
      ctx.fillRect(0, r.top, RULER, r.height);
    }
    ctx.strokeStyle = "rgba(241,231,208,0.22)";
    ctx.fillStyle = "rgba(241,231,208,0.4)";
    ctx.font = `8px ${MONO}`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 10) {
      const big = x % 100 === 0;
      ctx.moveTo(x + 0.5, RULER);
      ctx.lineTo(x + 0.5, RULER - (big ? 8 : x % 50 === 0 ? 5 : 3));
      if (big && x) ctx.fillText(String(x), x + 3, 8);
    }
    const sy = window.scrollY;
    for (let y = -(sy % 10); y < h; y += 10) {
      const v = Math.round(y + sy);
      const big = v % 100 === 0;
      ctx.moveTo(RULER, y + 0.5);
      ctx.lineTo(RULER - (big ? 8 : v % 50 === 0 ? 5 : 3), y + 0.5);
      if (big && y > RULER) {
        ctx.save();
        ctx.translate(8, y + 3);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(v), 0, 0);
        ctx.restore();
      }
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(241,231,208,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, RULER + 0.5);
    ctx.lineTo(w, RULER + 0.5);
    ctx.moveTo(RULER + 0.5, 0);
    ctx.lineTo(RULER + 0.5, h);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── helpers ─────────────────────────────────────────────────
  private wait(ms: number) {
    if (this.abort) return Promise.resolve();
    return new Promise<void>((res) => this.waiters.push({ at: this.clock + ms, res }));
  }
  private phase(p: Phase) {
    this.state.phase = p;
    this.push();
  }
  private push() {
    this.emit({ ...this.state });
  }
  private docY(el: HTMLElement) {
    return el.getBoundingClientRect().top + window.scrollY;
  }
  private inView(el: HTMLElement, margin: number) {
    const r = el.getBoundingClientRect();
    return r.bottom > -margin && r.top < this.h + margin;
  }
  private secCenter(s: Sec) {
    return () => {
      const r = s.el.getBoundingClientRect();
      return {
        x: (r.left + r.right) / 2,
        y: clamp((Math.max(r.top, 0) + Math.min(r.bottom, this.h)) / 2, 60, this.h - 60),
      };
    };
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  private onMouse = (e: PointerEvent) => {
    this.mouse = { x: e.clientX, y: e.clientY };
  };
  /** Any user gesture hands control back: remaining sections build as they scroll into view. */
  private onGesture = () => {
    if (this.state.mode !== "show" || this.state.done) return;
    this.state.mode = "scroll";
    this.camTarget = null;
    this.flock = false;
    this.push();
  };
  private onKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key))
      this.onGesture();
  };
  private unlisten() {
    window.removeEventListener("wheel", this.onGesture);
    window.removeEventListener("touchmove", this.onGesture);
    window.removeEventListener("keydown", this.onKey);
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15);
  ctx.lineTo(4, 11.5);
  ctx.lineTo(7, 18);
  ctx.lineTo(9.4, 17);
  ctx.lineTo(6.5, 10.6);
  ctx.lineTo(11.5, 10.6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#14110f";
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
