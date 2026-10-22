import { useEffect, useRef, useState, type ReactNode } from "react";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Animated ASCII field tinted by a warm gradient. Pauses off-screen; static for reduced motion. */
export function AsciiBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const chars = " .·:-=+*#%@";
    const cell = 14;
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    const css = getComputedStyle(document.documentElement);
    const ember = css.getPropertyValue("--ember").trim();
    const cream = css.getPropertyValue("--foreground").trim();
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell - 2}px "Geist Mono", monospace`;
      ctx.textBaseline = "top";
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, cream);
      g.addColorStop(1, ember);
      ctx.fillStyle = g;
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell * 0.62) {
          const nx = x / w, ny = y / h;
          const v =
            Math.sin(nx * 6 + t) * 0.5 +
            Math.cos(ny * 5 - t * 0.8) * 0.5 +
            Math.sin((nx + ny) * 4 + t * 0.6);
          const d = Math.hypot(nx - 0.68, ny - 0.45);
          const k = Math.max(0, Math.min(1, (v + 2) / 4 - d * 0.9));
          const ch = chars[Math.floor(k * (chars.length - 1))] ?? " ";
          if (ch !== " ") ctx.fillText(ch, x, y);
        }
      }
    };
    const loop = () => {
      if (visible) { t += 0.012; draw(); }
      raf = requestAnimationFrame(loop);
    };
    resize();
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(c);
    if (reduced()) draw(); else loop();
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 bg-void ${className}`}>
      <canvas ref={ref} className="h-full w-full opacity-70" />
    </div>
  );
}

/** Field of vertical slats breathing in a wave. */
export function SlatsVoid({ count = 48, className = "" }: { count?: number; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none flex h-full items-end gap-[3px] ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="slat block h-full flex-1 bg-gradient-to-t from-ember/80 via-foreground/20 to-transparent"
          style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }}
        />
      ))}
    </div>
  );
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} data-shown={shown} className={`reveal ${className}`}>{children}</div>;
}
