import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
};

const logoPaths = [
  "M114.89 83.2471C115.283 84.152 116.379 88.46 116.379 88.46L125.92 124.72L56.718 85.0708L30.2785 69.4947C30.2785 69.4947 50.1796 64.0129 59.9378 61.5968C65.9913 60.1892 72.2628 57.7355 78.5276 57.6073C95.703 57.2553 109.253 67.5782 114.89 83.2471Z",
  "M103.627 44.2722L28.9829 64.4839L38.7311 47.2197C44.843 36.3309 48.9894 28.8512 62.6722 26.7012C74.0503 24.9133 81.6545 31.691 91.0168 36.8074C95.0714 39.0231 103.627 44.2722 103.627 44.2722Z",
  "M52.2308 13.1045L24.3453 61.8083C24.3453 61.8083 21.9679 53.2962 20.9624 49.5335C18.9873 41.8848 15.9649 34.8015 20.5793 27.3726C25.2387 19.8707 31.5226 18.6017 39.3329 16.5254L52.2308 13.1045Z",
];

function createParticles(count: number): Particle[] {
  const mask = document.createElement("canvas");
  mask.width = 280;
  mask.height = 280;
  const context = mask.getContext("2d");
  if (!context) return [];
  context.translate(0, 0);
  context.scale(2, 2);
  context.fillStyle = "#fff";
  logoPaths.forEach((path) => context.fill(new Path2D(path)));
  const pixels = context.getImageData(0, 0, mask.width, mask.height).data;
  const candidates: Array<[number, number]> = [];

  for (let y = 12; y < 258; y += 3) {
    for (let x = 12; x < 258; x += 3) {
      if (pixels[(y * mask.width + x) * 4 + 3] > 80) candidates.push([x, y]);
    }
  }

  const particles: Particle[] = [];
  for (let index = 0; index < count && candidates.length; index += 1) {
    const candidateIndex = Math.floor(Math.random() * candidates.length);
    const [x, y] = candidates.splice(candidateIndex, 1)[0];
    const angle = Math.random() * Math.PI * 2;
    const spread = 118 + Math.random() * 42;
    particles.push({
      x: Math.cos(angle) * spread,
      y: Math.sin(angle) * spread,
      z: (Math.random() - 0.5) * 90,
      tx: x - 140,
      ty: y - 140,
      tz: (Math.random() - 0.5) * 18,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 0.8 + Math.random() * 1.8,
      alpha: 0.45 + Math.random() * 0.55,
    });
  }
  return particles;
}

export function ParticleLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 720px)").matches;
    const particles = createParticles(compact ? 520 : 920);
    if (reduceMotion) {
      particles.forEach((particle) => {
        particle.x = particle.tx;
        particle.y = particle.ty;
        particle.z = particle.tz;
      });
    }
    const pointer = { x: 0, y: 0, active: false };
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left - width / 2;
      pointer.y = event.clientY - bounds.top - height / 2;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = (time: number) => {
      const elapsed = Math.min(1, (time - start) / 1800);
      const assemble = reduceMotion ? 1 : 1 - Math.pow(1 - elapsed, 3);
      const rotationY = reduceMotion ? 0 : Math.sin(time * 0.00028) * 0.2 + (pointer.active ? pointer.x / Math.max(width, 1) * 0.3 : 0);
      const rotationX = reduceMotion ? 0 : Math.cos(time * 0.00022) * 0.08 - (pointer.active ? pointer.y / Math.max(height, 1) * 0.16 : 0);
      const scale = Math.min(width, height) / 420;
      const themeDark = document.documentElement.dataset.theme === "dark";

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      context.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        const force = 0.045;
        particle.vx += (particle.tx - particle.x) * force * assemble;
        particle.vy += (particle.ty - particle.y) * force * assemble;
        particle.vz += (particle.tz - particle.z) * force * assemble;

        if (pointer.active && elapsed > 0.7) {
          const dx = particle.x * scale - pointer.x;
          const dy = particle.y * scale - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 76) {
            const repel = (76 - distance) / 76 * 0.65;
            particle.vx += dx / Math.max(distance, 1) * repel;
            particle.vy += dy / Math.max(distance, 1) * repel;
            particle.vz += repel * 0.8;
          }
        }

        particle.vx *= 0.83;
        particle.vy *= 0.83;
        particle.vz *= 0.83;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const rotatedX = particle.x * cosY - particle.z * sinY;
        const rotatedZ = particle.x * sinY + particle.z * cosY;
        const rotatedY = particle.y * cosX - rotatedZ * sinX;
        const depth = rotatedZ * cosX + particle.y * sinX;
        const perspective = 420 / (420 + depth);
        const screenX = rotatedX * perspective * scale;
        const screenY = rotatedY * perspective * scale;
        const radius = particle.size * perspective * Math.max(scale, 0.8);
        const blue = 190 + Math.round((depth + 80) * 0.16);

        context.beginPath();
        context.arc(screenX, screenY, radius, 0, Math.PI * 2);
        context.fillStyle = themeDark
          ? `rgba(90, ${Math.min(220, blue)}, 255, ${particle.alpha})`
          : `rgba(10, 118, ${Math.min(255, blue + 30)}, ${particle.alpha * 0.86})`;
        context.fill();
      });

      context.restore();
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    if (reduceMotion) draw(performance.now() + 1800);
    else frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="particle-logo-shell">
      <canvas ref={canvasRef} className="particle-logo-canvas" aria-hidden="true" />
    </div>
  );
}
