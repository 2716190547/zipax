import { useEffect, useRef } from "react";

type RouteParticleBridgeProps = {
  routeKey: string;
};

type BridgeParticle = {
  startX: number;
  startY: number;
  travelX: number;
  travelY: number;
  delay: number;
  size: number;
  layer: number;
};

export function RouteParticleBridge({ routeKey }: RouteParticleBridgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousRoute = useRef(routeKey);

  useEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const compact = window.matchMedia("(max-width: 620px)").matches;
    const count = compact ? 150 : 240;
    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const brand = document.querySelector<HTMLElement>(".brand")?.getBoundingClientRect();
    const originX = brand ? brand.left + brand.width * 0.42 : 48;
    const originY = brand ? brand.top + brand.height * 0.5 : 44;
    const random = seededRandom(routeKey.split("").reduce((value, letter) => value + letter.charCodeAt(0), 726));
    const styles = getComputedStyle(document.documentElement);
    const colors = [
      styles.getPropertyValue("--accent").trim() || "#1687f2",
      styles.getPropertyValue("--accent-soft-foreground").trim() || "#45b6ff",
      styles.getPropertyValue("--foreground").trim() || "#9edbff",
    ];
    const particles: BridgeParticle[] = Array.from({ length: count }, (_, index) => ({
      startX: originX + (random() - 0.5) * 24,
      startY: originY + (random() - 0.5) * 18,
      travelX: width * (0.18 + random() * 0.58),
      travelY: height * (0.08 + random() * 0.4),
      delay: (index % 3) * 24 + random() * 72,
      size: 0.65 + random() * 1.4,
      layer: index % 3,
    }));

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.dataset.active = "true";
    const start = performance.now();
    let frame = 0;
    let finished = false;

    const releaseCanvas = () => {
      if (finished) return;
      finished = true;
      context.clearRect(0, 0, width, height);
      canvas.width = 1;
      canvas.height = 1;
      delete canvas.dataset.active;
    };

    const draw = (now: number) => {
      const elapsed = now - start;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        const progress = Math.max(0, Math.min(1, (elapsed - particle.delay) / 310));
        if (progress <= 0 || progress >= 1) continue;
        const eased = 1 - Math.pow(1 - progress, 3);
        const alpha = Math.sin(progress * Math.PI) * 0.72;
        const x = particle.startX + particle.travelX * eased;
        const y = particle.startY + particle.travelY * eased;
        context.globalAlpha = alpha;
        context.fillStyle = colors[particle.layer];
        context.beginPath();
        context.ellipse(x, y, particle.size * (1 + progress * 1.8), particle.size, 0.55, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (elapsed < 460) frame = requestAnimationFrame(draw);
      else releaseCanvas();
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      releaseCanvas();
    };
  }, [routeKey]);

  return <canvas ref={canvasRef} className="route-particle-bridge" aria-hidden="true" />;
}

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
