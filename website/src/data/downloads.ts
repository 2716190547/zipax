import type { Platform } from "../lib/platform";

export const release = {
  version: "0.24.0",
  tag: "v0.24.0",
  url: "https://github.com/2716190547/zipax/releases/tag/v0.24.0",
  latest: "https://github.com/2716190547/zipax/releases/latest",
};

const base = "https://github.com/2716190547/zipax/releases/download/v0.24.0";

export interface DownloadItem {
  platform: Exclude<Platform, "unknown">;
  label: string;
  detail: string;
  href: string;
  size: string;
  primary?: boolean;
}

export const downloads: DownloadItem[] = [
  {
    platform: "macos",
    label: "macOS Apple Silicon",
    detail: "DMG installer",
    href: `${base}/zipax_0.24.0_aarch64.dmg`,
    size: "9.2 MB",
    primary: true,
  },
  {
    platform: "windows",
    label: "Windows",
    detail: "Setup executable",
    href: `${base}/zipax_0.24.0_x64-setup.exe`,
    size: "5.2 MB",
    primary: true,
  },
  {
    platform: "windows",
    label: "Windows MSI",
    detail: "Enterprise installer",
    href: `${base}/zipax_0.24.0_x64_en-US.msi`,
    size: "7.3 MB",
  },
  {
    platform: "linux",
    label: "Linux AppImage",
    detail: "Portable package",
    href: `${base}/zipax_0.24.0_amd64.AppImage`,
    size: "81.8 MB",
    primary: true,
  },
  {
    platform: "linux",
    label: "Linux deb",
    detail: "Debian / Ubuntu",
    href: `${base}/zipax_0.24.0_amd64.deb`,
    size: "8.5 MB",
  },
  {
    platform: "linux",
    label: "Linux rpm",
    detail: "Fedora / RHEL",
    href: `${base}/zipax-0.24.0-1.x86_64.rpm`,
    size: "8.5 MB",
  },
  {
    platform: "source",
    label: "Source code",
    detail: "GitHub repository",
    href: "https://github.com/2716190547/zipax",
    size: "Git",
  },
];

export function recommendedDownload(platform: Platform) {
  if (platform === "unknown") return downloads.find((item) => item.platform === "macos" && item.primary);
  return downloads.find((item) => item.platform === platform && item.primary);
}
