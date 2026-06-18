import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import type { Update } from "@tauri-apps/plugin-updater";
import { getAppInfo } from "@/lib/tauri";

export type UpdateCheckResult =
  | { status: "latest"; currentVersion: string }
  | { status: "available"; currentVersion: string; latestVersion: string; downloadUrl: string };

let pendingUpdate: Update | null = null;

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const update = await check();

  if (!update) {
    const appInfo = await getAppInfo();
    return { status: "latest", currentVersion: appInfo.version };
  }

  pendingUpdate = update;

  return {
    status: "available",
    currentVersion: update.currentVersion,
    latestVersion: update.version,
    downloadUrl: "",
  };
}

export async function downloadAndInstallUpdate(
  onEvent?: (event: { event: string; data?: unknown }) => void,
): Promise<void> {
  const update = pendingUpdate;
  if (!update) throw new Error("没有待下载的更新");

  await update.downloadAndInstall((event) => {
    onEvent?.(event);
  });

  await relaunch();
}
