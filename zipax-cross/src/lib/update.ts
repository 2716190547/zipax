import { open as openUrl } from "@tauri-apps/plugin-shell";
import { getAppInfo } from "@/lib/tauri";

export type UpdateCheckResult =
  | { status: "latest"; currentVersion: string }
  | { status: "available"; currentVersion: string; latestVersion: string; downloadUrl: string };

const APPCAST_URL = "https://raw.githubusercontent.com/2716190547/zipax/master/appcast.xml";

function compareVersions(a: string, b: string): number {
  const left = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function xmlTextByLocalName(element: Element | null | undefined, localName: string): string | undefined {
  if (!element) return undefined;
  return Array.from(element.children)
    .find((child) => child.localName === localName)
    ?.textContent
    ?.trim();
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const [appInfo, response] = await Promise.all([
    getAppInfo(),
    fetch(APPCAST_URL, { cache: "no-store" }),
  ]);
  if (!response.ok) throw new Error(`检查失败 (${response.status})`);

  const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
  const item = xml.querySelector("item");
  const latestVersion =
    xmlTextByLocalName(item, "shortVersionString") ||
    xmlTextByLocalName(item, "version") ||
    xmlTextByLocalName(item, "title");
  const downloadUrl =
    item?.querySelector("enclosure")?.getAttribute("url") ||
    xmlTextByLocalName(item, "link") ||
    "https://github.com/2716190547/zipax/releases/latest";

  if (!latestVersion) throw new Error("未找到版本信息");

  if (compareVersions(latestVersion, appInfo.version) <= 0) {
    return { status: "latest", currentVersion: appInfo.version };
  }

  return {
    status: "available",
    currentVersion: appInfo.version,
    latestVersion,
    downloadUrl,
  };
}

export async function openUpdateDownload(downloadUrl: string) {
  await openUrl(downloadUrl);
}
