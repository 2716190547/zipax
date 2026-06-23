import { useEffect, useRef } from "react";
import { ZIPAX_LOGO_LAYERS, ZIPAX_LOGO_VIEWBOX } from "../brand/zipaxLogoPaths";

type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  layer: number;
  size: number;
  alpha: number;
};

const ASSEMBLY_DURATION = 760;
const IDLE_DURATION = 9000;

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createParticles(count: number): Particle[] {
  const maskSize = ZIPAX_LOGO_VIEWBOX * 2;
  const center = maskSize / 2;
  const candidates = ZIPAX_LOGO_LAYERS.map((layer) => {
    const canvas = document.createElement("canvas");
    canvas.width = maskSize;
    canvas.height = maskSize;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return [];
    context.scale(2, 2);
    context.fillStyle = "#000";
    context.fill(new Path2D(layer.path));
    const pixels = context.getImageData(0, 0, maskSize, maskSize).data;
    const points: Array<[number, number]> = [];
    for (let y = 1; y < maskSize; y += 2) {
      for (let x = 1; x < maskSize; x += 2) {
        if (pixels[(y * maskSize + x) * 4 + 3] > 96) points.push([x, y]);
      }
    }
    return points;
  });

  const random = seededRandom(72619);
  const weights = [0.54, 0.29, 0.17];
  const particles: Particle[] = [];

  for (let layer = 0; layer < candidates.length; layer += 1) {
    const layerCount = layer === candidates.length - 1
      ? count - particles.length
      : Math.round(count * weights[layer]);
    const points = candidates[layer];
    for (let index = 0; index < layerCount && points.length; index += 1) {
      const [pointX, pointY] = points[Math.floor(random() * points.length)];
      const angle = random() * Math.PI * 2;
      const radius = 0.18 + random() * 0.58;
      particles.push({
        x: (pointX - center) / center,
        y: (pointY - center) / center,
        startX: Math.cos(angle) * radius,
        startY: Math.sin(angle) * radius,
        layer,
        size: 0.75 + random() * 1.35,
        alpha: 0.42 + random() * 0.48,
      });
    }
  }

  return particles;
}

export function HeroParticleLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const compact = window.matchMedia("(max-width: 620px)").matches;
    const tablet = window.matchMedia("(max-width: 900px)").matches;
    const particles = createParticles(compact ? 380 : tablet ? 620 : 920);
    const pointer = { x: 0, y: 0, active: false };
    let width = 1;
    let height = 1;
    let isVisible = true;
    let animationFrame = 0;
    let lastFrame = 0;
    let startTime = performance.now();
    let colors = ["#1687f2", "#45b6ff", "#9edbff"];

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue("--accent").trim() || "#1687f2";
      const accentSoft = styles.getPropertyValue("--accent-soft-foreground").trim() || "#45b6ff";
      const foreground = styles.getPropertyValue("--foreground").trim() || "#9edbff";
      colors = [accent, accentSoft, foreground];
    };

    const draw = (now: number) => {
      animationFrame = 0;
      if (!isVisible || document.hidden) return;
      if (!reducedMotion && now - lastFrame < 32) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      const minSize = Math.min(width, height);
      const elapsed = reducedMotion ? ASSEMBLY_DURATION + 200 : now - startTime;
      const settled = Math.min(1, elapsed / (ASSEMBLY_DURATION + 120));
      const roll = reducedMotion ? 0 : Math.sin(elapsed * 0.00018) * 0.075 * settled;
      const yaw = reducedMotion ? 0 : Math.sin(elapsed * 0.00014) * 0.09 * settled + (pointer.active ? pointer.x * 0.085 : 0);
      const cosRoll = Math.cos(roll);
      const sinRoll = Math.sin(roll);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const centerX = width / 2;
      const centerY = height / 2;

      context.globalCompositeOperation = "source-over";
      for (const particle of particles) {
        const layer = ZIPAX_LOGO_LAYERS[particle.layer];
        const progress = Math.max(0, Math.min(1, (elapsed - layer.delay) / ASSEMBLY_DURATION));
        const eased = 1 - Math.pow(1 - progress, 3);
        const baseX = (particle.startX + (particle.x * 0.88 - particle.startX) * eased) * minSize * 0.46;
        const baseY = (particle.startY + (particle.y * 0.88 - particle.startY) * eased) * minSize * 0.46;
        const depth = layer.depth * minSize;
        const yawX = baseX * cosYaw + depth * sinYaw;
        const yawDepth = -baseX * sinYaw + depth * cosYaw;
        const perspective = 1 / (1 - yawDepth / (minSize * 3.4));
        let screenX = centerX + (yawX * cosRoll - baseY * sinRoll) * perspective;
        let screenY = centerY + (yawX * sinRoll + baseY * cosRoll) * perspective;

        if (pointer.active && !reducedMotion) {
          const dx = screenX - (centerX + pointer.x * width * 0.5);
          const dy = screenY - (centerY + pointer.y * height * 0.5);
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(0, 156 - distance);
          if (influence > 0 && distance > 0.1) {
            const push = Math.min(64, influence * 0.46);
            screenX += (dx / distance) * push;
            screenY += (dy / distance) * push;
          }
        }

        context.globalAlpha = particle.alpha * (0.45 + eased * 0.55);
        context.fillStyle = colors[particle.layer];
        context.beginPath();
        context.arc(screenX, screenY, particle.size * perspective, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (!reducedMotion && (elapsed < IDLE_DURATION || pointer.active)) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const scheduleDraw = () => {
      if (!animationFrame && isVisible && !document.hidden) animationFrame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) draw(performance.now());
      else scheduleDraw();
    };

    const handlePointer = (event: PointerEvent) => {
      if (!finePointer || reducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      pointer.active = inside;
      if (inside) {
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      scheduleDraw();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) scheduleDraw();
      else if (animationFrame) cancelAnimationFrame(animationFrame);
      if (!isVisible) animationFrame = 0;
    }, { rootMargin: "120px" });
    const themeObserver = new MutationObserver(() => {
      readColors();
      if (reducedMotion) draw(performance.now());
    });
    const handleVisibility = () => scheduleDraw();

    readColors();
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    resize();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return (
    <div className="hero-particle-aura" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-particle-canvas" />
    </div>
  );
}
