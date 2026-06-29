import type { Platform } from "../lib/platform";

export type ReleaseInfo = {
  version: string;
  tag: string;
  url: string;
  latest: string;
};

export const release: ReleaseInfo = {
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

export type ReleaseDownloads = {
  release: ReleaseInfo;
  downloads: DownloadItem[];
  source: "fallback" | "cache" | "github";
};

type GithubReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

export type GithubRelease = {
  tag_name: string;
  html_url: string;
  assets?: GithubReleaseAsset[];
};

export const fallbackReleaseDownloads: ReleaseDownloads = {
  release,
  downloads,
  source: "fallback",
};

export function recommendedDownload(platform: Platform, items: DownloadItem[] = downloads) {
  if (platform === "unknown") return items.find((item) => item.platform === "macos" && item.primary);
  return items.find((item) => item.platform === platform && item.primary) ?? items.find((item) => item.platform === platform);
}

function formatVersion(tag: string) {
  return tag.replace(/^v/i, "");
}

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const mb = bytes / 1024 / 1024;
  return `${mb >= 10 ? mb.toFixed(1) : mb.toFixed(1)} MB`;
}

function classifyAsset(asset: GithubReleaseAsset): DownloadItem | undefined {
  const name = asset.name;
  const lower = name.toLowerCase();
  const href = asset.browser_download_url;
  const size = formatSize(asset.size);

  if (lower.endsWith(".dmg")) {
    const isArm = /aarch64|arm64|apple[-_ ]?silicon/.test(lower);
    return {
      platform: "macos",
      label: isArm ? "macOS Apple Silicon" : "macOS",
      detail: "DMG installer",
      href,
      size,
      primary: true,
    };
  }

  if (lower.endsWith(".exe")) {
    return {
      platform: "windows",
      label: "Windows",
      detail: "Setup executable",
      href,
      size,
      primary: true,
    };
  }

  if (lower.endsWith(".msi")) {
    return {
      platform: "windows",
      label: "Windows MSI",
      detail: "Enterprise installer",
      href,
      size,
    };
  }

  if (lower.endsWith(".appimage")) {
    return {
      platform: "linux",
      label: "Linux AppImage",
      detail: "Portable package",
      href,
      size,
      primary: true,
    };
  }

  if (lower.endsWith(".deb")) {
    return {
      platform: "linux",
      label: "Linux deb",
      detail: "Debian / Ubuntu",
      href,
      size,
    };
  }

  if (lower.endsWith(".rpm")) {
    return {
      platform: "linux",
      label: "Linux rpm",
      detail: "Fedora / RHEL",
      href,
      size,
    };
  }

  return undefined;
}

const platformOrder: Record<DownloadItem["platform"], number> = {
  macos: 0,
  windows: 1,
  linux: 2,
  source: 3,
};

function itemOrder(item: DownloadItem) {
  const label = item.label.toLowerCase();
  const variant = label.includes("msi") ? 2 : label.includes("deb") ? 2 : label.includes("rpm") ? 3 : 1;
  return platformOrder[item.platform] * 10 + (item.primary ? 0 : variant);
}

export function parseGithubRelease(payload: GithubRelease): ReleaseDownloads | undefined {
  if (!payload.tag_name || !payload.html_url) return undefined;
  const parsedDownloads = (payload.assets ?? [])
    .map(classifyAsset)
    .filter((item): item is DownloadItem => Boolean(item))
    .sort((a, b) => itemOrder(a) - itemOrder(b));

  if (parsedDownloads.length === 0) return undefined;

  const githubSource: DownloadItem = {
    platform: "source",
    label: "Source code",
    detail: "GitHub repository",
    href: "https://github.com/2716190547/zipax",
    size: "Git",
  };

  return {
    release: {
      version: formatVersion(payload.tag_name),
      tag: payload.tag_name,
      url: payload.html_url,
      latest: release.latest,
    },
    downloads: [...parsedDownloads, githubSource],
    source: "github",
  };
}
