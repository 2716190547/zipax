import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import type { Update } from "@tauri-apps/plugin-updater";
import { getAppInfo } from "@/lib/tauri";

export type UpdateCheckResult =
  | { status: "latest"; currentVersion: string }
  | { status: "ready"; currentVersion: string; latestVersion: string };

type ReadyUpdateResult = Extract<UpdateCheckResult, { status: "ready" }>;

let readyUpdate: ReadyUpdateResult | null = null;
let preparationTask: Promise<UpdateCheckResult> | null = null;
let stagedUpdate: Update | null = null;

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (readyUpdate) return readyUpdate;
  preparationTask ??= prepareUpdate().finally(() => {
    preparationTask = null;
  });
  return preparationTask;
}

async function prepareUpdate(): Promise<UpdateCheckResult> {
  const update = await check();

  if (!update) {
    const appInfo = await getAppInfo();
    return { status: "latest", currentVersion: appInfo.version };
  }

  try {
    await update.download();
  } catch (error) {
    await update.close().catch(() => {});
    throw error;
  }

  stagedUpdate = update;
  readyUpdate = {
    status: "ready",
    currentVersion: update.currentVersion,
    latestVersion: update.version,
  };
  return readyUpdate;
}

export async function restartToApplyUpdate(): Promise<void> {
  if (!stagedUpdate) throw new Error("没有已准备好的更新");
  await stagedUpdate.install();
  await relaunch();
}
