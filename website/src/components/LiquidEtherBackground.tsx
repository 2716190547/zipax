import { useEffect, useRef } from "react";

type Blob = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  color: string;
};

const blobs: Blob[] = [
  { x: 0.14, y: 0.16, radius: 0.3, speed: 0.17, phase: 0.2, color: "71, 169, 255" },
  { x: 0.78, y: 0.2, radius: 0.26, speed: 0.13, phase: 2.1, color: "89, 221, 255" },
  { x: 0.62, y: 0.68, radius: 0.34, speed: 0.1, phase: 4.2, color: "104, 116, 255" },
];

export function LiquidEtherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0.5, y: 0.25, active: false };
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / Math.max(width, 1);
      pointer.y = event.clientY / Math.max(height, 1);
      pointer.active = true;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";

      blobs.forEach((blob, index) => {
        const motion = reduceMotion.matches ? 0 : time * 0.0001 * blob.speed;
        const influence = pointer.active ? 0.035 : 0;
        const x = width * (blob.x + Math.sin(motion * 5 + blob.phase) * 0.07 + (pointer.x - 0.5) * influence * (index + 1));
        const y = height * (blob.y + Math.cos(motion * 4 + blob.phase) * 0.06 + (pointer.y - 0.5) * influence);
        const radius = Math.max(width, height) * blob.radius;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${blob.color}, 0.2)`);
        gradient.addColorStop(0.46, `rgba(${blob.color}, 0.09)`);
        gradient.addColorStop(1, `rgba(${blob.color}, 0)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });

      context.globalCompositeOperation = "source-over";
      if (!reduceMotion.matches) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (reduceMotion.matches) draw(0);
    else frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas className="liquid-ether-background" ref={canvasRef} aria-hidden="true" />;
}
