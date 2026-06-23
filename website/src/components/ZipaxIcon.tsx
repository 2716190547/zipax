import { useId } from "react";
import { ZIPAX_LOGO_LAYERS } from "./brand/zipaxLogoPaths";

type ZipaxIconProps = {
  className?: string;
  title?: string;
  variant?: "full" | "mono" | "outline";
  decorative?: boolean;
};

export function ZipaxIcon({ className, title = "zipax", variant = "full", decorative = false }: ZipaxIconProps) {
  const id = useId();
  const gradientId = `${id}-zipax-tray`;
  const isMono = variant === "mono";
  const isOutline = variant === "outline";
  const fill = isOutline ? "none" : isMono ? "currentColor" : `url(#${gradientId})`;
  const stroke = isMono || isOutline ? "currentColor" : undefined;

  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!decorative && <title>{title}</title>}
      <defs>
        <linearGradient id={gradientId} x1="22" y1="18" x2="123" y2="123" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9EDBFF" />
          <stop offset="0.48" stopColor="#45B6FF" />
          <stop offset="1" stopColor="#1687F2" />
        </linearGradient>
      </defs>
      {ZIPAX_LOGO_LAYERS.map((layer, index) => (
        <path
          key={layer.name}
          className={`zipax-icon-layer zipax-icon-layer-${layer.name}`}
          d={layer.path}
          fill={fill}
          stroke={stroke}
          strokeWidth={isOutline ? 1.5 : isMono ? 1 : undefined}
          opacity={isOutline ? 1 : isMono ? Math.max(0.64, 1 - index * 0.18) : layer.opacity}
        />
      ))}
    </svg>
  );
}
