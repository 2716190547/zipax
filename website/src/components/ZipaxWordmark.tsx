import { ZipaxIcon } from "./ZipaxIcon";

type ZipaxWordmarkProps = {
  className?: string;
  size?: "sm" | "md" | "display";
  iconVariant?: "full" | "mono";
};

export function ZipaxWordmark({ className = "", size = "md", iconVariant = "mono" }: ZipaxWordmarkProps) {
  return (
    <span className={`zipax-wordmark zipax-wordmark-${size} ${className}`.trim()}>
      <ZipaxIcon className="zipax-wordmark-icon" variant={iconVariant} decorative />
      <span className="zipax-wordmark-text">zipax</span>
    </span>
  );
}
