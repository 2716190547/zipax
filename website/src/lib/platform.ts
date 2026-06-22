export type Platform = "macos" | "windows" | "linux" | "source" | "unknown";

export function detectPlatform(): Platform {
  const platform = navigator.userAgentData?.platform?.toLowerCase() ?? "";
  const ua = navigator.userAgent.toLowerCase();
  const value = `${platform} ${ua}`;

  if (value.includes("mac")) return "macos";
  if (value.includes("win")) return "windows";
  if (value.includes("linux") || value.includes("x11")) return "linux";
  return "unknown";
}
