/**
 * Build engine for the "14 agents build the page" intro.
 *
 * The page is fully rendered. While <html data-build> is set, every top-most text/media
 * element inside a [data-sec] zone is drawn as a wireframe (outlined headings, dimmed copy).
 * A swarm of 14 cursors on a fixed canvas flies to each element and "builds" it
 * (sets data-on), while selection boxes, rulers and dimension pills sell the idea of
 * agents laying the page out. A virtual clock drives everything, so pause/skip are exact.
 */

export type BuildMode = "show" | "scroll";
export type Phase = "arch" | "design" | "dev" | "qa";
export type BuildState = {
  section: number;
  total: number;
  phase: Phase;
  mode: BuildMode;
  paused: boolean;
  done: boolean;
  secs: number;
};

type Sec = {
  key: string;
  el: HTMLElement;
  roots: HTMLElement[];
  els: HTMLElement[];
  blocks: HTMLElement[];
  built: boolean;
};
type Cur = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  role: string;
  target: HTMLElement | null;
  ox: number;
  oy: number;
  fromX: number;
  fromY: number;
  onArrive: (() => void) | null;
  holdUntil: number;
  seed: number;
  trail: [number, number][];
};
type Ping = { x: number; y: number; at: number; color: string };

const CANDIDATES = "h1,h2,h3,h4,p,li,dt,dd,a,button,img,video,.display,.eyebrow";
const COLORS = [
  "#e8894a",
  "#f1e7d0",
  "#d4553a",
  "#f0b45a",
  "#8f8476",
  "#e8894a",
  "#f1e7d0",
  "#c9774a",
  "#f0b45a",
  "#d4553a",
  "#f1e7d0",
  "#8f8476",
  "#e8894a",
  "#f0b45a",
];
const ROLES_EN = [
  "Research",
  "Architect",
  "Layout",
  "UI",
  "Copy",
  "Frontend",
  "Motion",
  "Assets",
  "Data",
  "A11y",
  "SEO",
  "i18n",
  "Perf",
  "QA",
];
const ROLES_ES = [
  "Relevamiento",
  "Arquitectura",
  "Layout",
  "UI",
  "Copy",
  "Frontend",
  "Motion",
  "Assets",
  "Datos",
  "A11y",
  "SEO",
  "i18n",
  "Perf",
  "QA",
];
const RULER = 16;

const visible = (e: HTMLElement) =>
  e.offsetWidth > 0 && e.offsetHeight > 0 && e.getClientRects().length > 0;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function collect(roots: HTMLElement[]) {
  const all = roots
    .flatMap((r) => [...r.querySelectorAll<HTMLElement>(CANDIDATES)])
    .filter(visible);
  const set = new Set(all);
  // Keep top-most candidates only, so opacity never compounds and a card's chips build one by one.
  return all.filter((e) => {
    for (let p = e.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
}
function blocksOf(root: HTMLElement) {
  const real = (e: HTMLElement) =>
    ([...e.children] as HTMLElement[]).filter((k) => visible(k) && !k.hasAttribute("aria-hidden"));
  // Descend through single-child wrappers (e.g. hero: backdrop + max-w container).
  let inner = root;
  for (let kids = real(inner); kids.length === 1; kids = real(inner)) inner = kids[0]!;
  const out: HTMLElement[] = [];
  for (const k of real(inner)) {
    if (!visible(k)) continue;
    const kids = ([...k.children] as HTMLElement[]).filter(visible);
    if (getComputedStyle(k).display.includes("grid") && kids.length > 1 && kids.length <= 6)
      out.push(...kids);
    else out.push(k);
  }
  return out.filter((b) => b.offsetHeight > 24).slice(0, 4);
}

export class BuildEngine {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private secs: Sec[] = [];
  private curs: Cur[] = [];
  private pings: Ping[] = [];
  private clock = 0;
  private last = 0;
  private raf = 0;
  private waiters: { at: number; res: () => void }[] = [];
  private selection: HTMLElement | null = null;
  private selAt = 0;
  private camTarget: number | null = null;
  private abort = false;
  private started = 0;
  private swarm = true;
  private rulers = 0; // 0..1 fade
  private mouse = { x: -1, y: -1 };
  state: BuildState;

  constructor(
    private canvas: HTMLCanvasElement,
    private lang: "en" | "es",
    private emit: (s: BuildState) => void,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.state = {
      section: 0,
      total: 0,
      phase: "arch",
      mode: "show",
      paused: false,
      done: false,
      secs: 0,
    };
    this.scan();
    this.resize();
    const roles = lang === "es" ? ROLES_ES : ROLES_EN;
    const cx = this.w / 2,
      cy = this.h / 2;
    this.curs = COLORS.map((color, i) => ({
      x: cx + Math.cos(i) * 40,
      y: cy + Math.sin(i) * 40,
      vx: 0,
      vy: 0,
      color,
      role: roles[i]!,
      target: null,
      ox: 0,
      oy: 0,
      fromX: 0,
      fromY: 0,
      onArrive: null,
      holdUntil: 0,
      seed: i * 1.7,
      trail: [],
    }));
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
      return { key, el, roots, els, blocks: blocksOf(el), built: false };
    });
    this.state.total = this.secs.length;
  }

  // ── public controls ─────────────────────────────────────────
  async start(mode: BuildMode) {
    this.abort = false;
    this.started = this.clock;
    this.state = { ...this.state, mode, done: false, paused: false, section: 0 };
    document.documentElement.dataset["build"] = "running";
    window.addEventListener("wheel", this.onGesture, { passive: true });
    window.addEventListener("touchmove", this.onGesture, { passive: true });
    window.addEventListener("keydown", this.onKey);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    this.push();
    await this.wait(250);
    if (mode === "show") await this.runShow();
    if (this.state.mode === "scroll" && !this.abort) await this.runScroll();
    if (!this.abort) this.finish();
  }

  skip() {
    if (this.state.done) return;
    this.abort = true;
    for (const s of this.secs) this.complete(s);
    this.waiters.splice(0).forEach((w) => w.res());
    this.finish();
  }

  togglePause() {
    this.state.paused = !this.state.paused;
    this.push();
  }
  setSwarm(on: boolean) {
    this.swarm = on;
  }

  replay() {
    this.abort = true;
    this.waiters.splice(0).forEach((w) => w.res());
    document.documentElement.dataset["build"] = "pending";
    for (const s of this.secs) {
      s.built = false;
      delete s.el.dataset["built"];
      s.els.forEach((e) => e.removeAttribute("data-on"));
    }
    requestAnimationFrame(() => void this.start("show"));
  }

  destroy() {
    this.abort = true;
    cancelAnimationFrame(this.raf);
    this.unlisten();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onMouse);
    delete document.documentElement.dataset["build"];
  }

  // ── sequences ───────────────────────────────────────────────
  private async runShow() {
    for (let i = 0; i < this.secs.length; i++) {
      if (this.abort || this.state.mode !== "show") return;
      await this.buildSection(i, 1);
    }
  }

  private async runScroll() {
    this.camTarget = null;
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
      await this.buildSection(i, 0.5);
    }
  }

  private async buildSection(i: number, speed: number) {
    const s = this.secs[i]!;
    const show = this.state.mode === "show";
    this.state.section = i;
    this.phase("arch");
    if (show) {
      this.camTarget = this.docY(s.el) - 72;
      await this.wait(450 * speed);
    }

    // Architecture: agents measure the main blocks.
    for (const b of s.blocks.slice(0, show ? 3 : 2)) {
      if (this.abort) return;
      this.selection = b;
      this.selAt = this.clock;
      const r = b.getBoundingClientRect();
      const corners: [number, number][] = [
        [0, 0],
        [r.width, 0],
        [r.width, r.height],
        [0, r.height],
      ];
      corners.forEach(([ox, oy]) => this.send(this.freeCursor(), b, ox, oy));
      await this.wait(380 * speed);
    }
    this.selection = null;

    // Design + development: every element gets an agent.
    this.phase("design");
    const n = s.els.length;
    const gap = clamp((2600 * speed) / Math.max(1, n), 35, 170);
    for (let j = 0; j < n; j++) {
      if (this.abort) return;
      if (j === Math.floor(n / 2)) this.phase("dev");
      const el = s.els[j]!;
      const r = el.getBoundingClientRect();
      const ox = clamp(r.width * (0.15 + Math.random() * 0.7), 4, r.width),
        oy = clamp(r.height * (0.3 + Math.random() * 0.5), 2, r.height);
      this.send(this.freeCursor(), el, ox, oy, () => this.light(el));
      if (this.state.mode === "show") {
        const y = this.docY(el) + r.height - this.h * 0.62;
        if (this.camTarget === null || y > this.camTarget)
          this.camTarget = Math.max(this.docY(s.el) - 72, y);
      }
      await this.wait(gap);
    }
    await this.wait(520 * speed);

    // QA: settle anything still in flight.
    this.phase("qa");
    this.complete(s);
    await this.wait(320 * speed);
  }

  private complete(s: Sec) {
    s.els.forEach((e) => {
      if (!e.hasAttribute("data-on")) e.setAttribute("data-on", "");
    });
    s.built = true;
    s.el.dataset["built"] = "";
    s.roots.forEach((r) => (r.dataset["built"] = ""));
  }

  private light(el: HTMLElement) {
    if (el.hasAttribute("data-on")) return;
    const glow = el.matches("h1,h2,.display");
    el.setAttribute("data-on", glow ? "glow" : "");
    if (glow) window.setTimeout(() => el.setAttribute("data-on", ""), 900);
  }

  private finish() {
    this.unlisten();
    this.selection = null;
    this.camTarget = null;
    this.state = {
      ...this.state,
      done: true,
      paused: false,
      secs: (this.clock - this.started) / 1000,
      section: this.secs.length - 1,
    };
    this.push();
    window.setTimeout(() => {
      if (this.state.done) delete document.documentElement.dataset["build"];
    }, 900);
  }

  // ── agents ──────────────────────────────────────────────────
  private freeCursor() {
    let best = this.curs[0]!,
      score = Infinity;
    for (const c of this.curs) {
      const s = (c.target ? 1e6 : 0) + Math.max(0, c.holdUntil - this.clock) + Math.random() * 40;
      if (s < score) {
        score = s;
        best = c;
      }
    }
    return best;
  }
  private send(
    c: Cur,
    el: HTMLElement,
    ox: number,
    oy: number,
    onArrive: (() => void) | null = null,
  ) {
    if (c.onArrive) c.onArrive();
    c.target = el;
    c.ox = ox;
    c.oy = oy;
    c.fromX = c.x;
    c.fromY = c.y;
    c.onArrive = onArrive;
  }

  // ── loop ────────────────────────────────────────────────────
  private frame = (now: number) => {
    const dt = Math.min(50, now - this.last);
    this.last = now;
    if (!this.state.paused) this.clock += dt;
    if (!this.state.done && !this.state.paused) {
      this.state.secs = (this.clock - this.started) / 1000;
    }
    for (let k = this.waiters.length - 1; k >= 0; k--)
      if (this.waiters[k]!.at <= this.clock) this.waiters.splice(k, 1)[0]!.res();

    // Camera
    if (this.camTarget !== null && this.state.mode === "show" && !this.state.paused) {
      const max = document.documentElement.scrollHeight - this.h;
      const t = clamp(this.camTarget, 0, max);
      const d = t - window.scrollY;
      if (Math.abs(d) > 0.5) {
        window.scrollTo({ top: window.scrollY + d * 0.075, behavior: "instant" as ScrollBehavior });
      }
    }

    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private step(dt: number) {
    const k = dt / 16.7;
    const idle = this.state.done;
    const t = this.clock / 1000;
    const cx = idle && this.mouse.x >= 0 ? this.mouse.x : this.w * 0.5;
    const cy = idle && this.mouse.y >= 0 ? this.mouse.y + 40 : this.h * 0.55;
    for (const c of this.curs) {
      let tx: number, ty: number;
      if (c.target) {
        const r = c.target.getBoundingClientRect();
        tx = r.left + c.ox;
        ty = r.top + c.oy;
        if (Math.hypot(tx - c.x, ty - c.y) < 6) {
          const fn = c.onArrive;
          c.onArrive = null;
          c.target = null;
          c.holdUntil = this.clock + 160 + Math.random() * 200;
          if (fn) {
            fn();
            this.pings.push({ x: tx, y: ty, at: this.clock, color: c.color });
          }
        }
      } else {
        const a = t * 0.7 + c.seed,
          rad = idle ? 34 + (c.seed % 3) * 10 : 60 + (c.seed % 4) * 24;
        tx = cx + Math.cos(a) * rad + Math.sin(t * 1.3 + c.seed) * 12;
        ty = cy + Math.sin(a * 1.2) * rad * 0.6;
      }
      if (this.state.paused) continue;
      const stiff = c.target ? 0.075 : 0.02;
      c.vx = (c.vx + (tx - c.x) * stiff * k) * Math.pow(0.78, k);
      c.vy = (c.vy + (ty - c.y) * stiff * k) * Math.pow(0.78, k);
      c.x += c.vx * k;
      c.y += c.vy * k;
      c.trail.push([c.x, c.y]);
      if (c.trail.length > 10) c.trail.shift();
    }
    this.pings = this.pings.filter((p) => this.clock - p.at < 600);
    const want = this.state.done ? 0 : 1;
    this.rulers += (want - this.rulers) * 0.08 * k;
  }

  private draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    if (this.rulers > 0.01) this.drawRulers();
    if (this.selection) this.drawSelection(this.selection);
    if (!this.swarm) return;

    for (const p of this.pings) {
      const q = (this.clock - p.at) / 600;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = (1 - q) * 0.8;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 + q * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Flight lines + agent constellation
    for (const c of this.curs) {
      if (c.target) {
        const g = ctx.createLinearGradient(c.fromX, c.fromY, c.x, c.y);
        g.addColorStop(0, "rgba(241,231,208,0)");
        g.addColorStop(1, hexA(c.color, 0.55));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.fromX, c.fromY);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      }
      if (c.trail.length > 2) {
        ctx.strokeStyle = hexA(c.color, 0.25);
        ctx.beginPath();
        c.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
    }
    const busy = this.curs.filter((c) => c.target);
    ctx.strokeStyle = "rgba(241,231,208,0.12)";
    for (let i = 1; i < busy.length; i += 2) {
      const a = busy[i - 1]!,
        b = busy[i]!;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Cursors
    this.curs.forEach((c, i) => {
      drawArrow(ctx, c.x, c.y, c.color);
      const labelled = !this.state.done && c.target && (i % 5 === 0 || i === 13);
      if (labelled) {
        const text = c.role;
        ctx.font = '500 10px "Geist Mono", monospace';
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.95;
        roundRect(ctx, c.x + 10, c.y + 16, tw + 10, 16, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#1b1714";
        ctx.fillText(text, c.x + 15, c.y + 27.5);
      }
    });
  }

  private drawSelection(b: HTMLElement) {
    const { ctx } = this;
    const r = b.getBoundingClientRect();
    const q = clamp((this.clock - this.selAt) / 220, 0, 1);
    ctx.globalAlpha = q;
    ctx.strokeStyle = "rgba(241,231,208,0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(r.left) + 0.5,
      Math.round(r.top) + 0.5,
      Math.round(r.width),
      Math.round(r.height),
    );
    ctx.fillStyle = "#f1e7d0";
    for (const [x, y] of [
      [r.left, r.top],
      [r.right, r.top],
      [r.right, r.bottom],
      [r.left, r.bottom],
    ] as const)
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    // guide lines to the rulers
    ctx.strokeStyle = "rgba(232,137,74,0.25)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(r.left, RULER);
    ctx.lineTo(r.left, r.top);
    ctx.moveTo(RULER, r.top);
    ctx.lineTo(r.left, r.top);
    ctx.stroke();
    ctx.setLineDash([]);
    const label = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    ctx.font = '500 10px "Geist Mono", monospace';
    const tw = ctx.measureText(label).width;
    const lx = r.left + r.width / 2 - tw / 2 - 6,
      ly = Math.min(this.h - 20, r.bottom + 8);
    ctx.fillStyle = "#e8894a";
    roundRect(ctx, lx, ly, tw + 12, 16, 3);
    ctx.fill();
    ctx.fillStyle = "#1b1714";
    ctx.fillText(label, lx + 6, ly + 11.5);
    ctx.globalAlpha = 1;
  }

  private drawRulers() {
    const { ctx, w, h } = this;
    ctx.globalAlpha = this.rulers;
    ctx.fillStyle = "rgba(27,23,20,0.92)";
    ctx.fillRect(0, 0, w, RULER);
    ctx.fillRect(0, 0, RULER, h);
    if (this.selection) {
      const r = this.selection.getBoundingClientRect();
      ctx.fillStyle = "rgba(232,137,74,0.28)";
      ctx.fillRect(r.left, 0, r.width, RULER);
      ctx.fillRect(0, r.top, RULER, r.height);
    }
    ctx.strokeStyle = "rgba(241,231,208,0.22)";
    ctx.fillStyle = "rgba(241,231,208,0.4)";
    ctx.font = '8px "Geist Mono", monospace';
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

  private resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  private onMouse = (e: PointerEvent) => {
    this.mouse = { x: e.clientX, y: e.clientY };
  };
  /** Any user gesture hands control back: remaining sections build as they scroll into view. */
  private onGesture = () => {
    if (this.state.mode !== "show" || this.state.done) return;
    this.state.mode = "scroll";
    this.camTarget = null;
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
