import { listen } from "@tauri-apps/api/event";
import { useEffect, useLayoutEffect } from "react";
import { isRtl, resolveLocale } from "@/i18n";
import { checkForUpdate } from "@/lib/update";
import {
  disableAutostart,
  enableAutostart,
  isAutostartEnabled,
  setCloseToTrayEnabled,
  setTrayStatus,
} from "@/lib/tauri";
import { safeWarn } from "@/lib/utils";
import type { AppearanceMode, LanguageMode, ThemeColor } from "@/store/app";
import type { ReadyUpdate } from "@/store/types";

interface TrayStatusOptions {
  autoCheckUpdates: boolean;
  globalAutomationEnabled: boolean;
  totalSaved: number;
  totalCount: number;
}

interface TrayToggleOptions {
  setAutoCheckUpdates: (enabled: boolean) => void;
  setGlobalAutomationEnabled: (enabled: boolean) => void;
}

interface AutoUpdateOptions {
  enabled: boolean;
  setReadyUpdate: (update: ReadyUpdate) => void;
}

function detectPlatform() {
  return /windows/i.test(navigator.userAgent) ? "windows" : "default";
}

export function usePlatformClass() {
  useLayoutEffect(() => {
    document.documentElement.dataset.platform = detectPlatform();
  }, []);
}

export function useAppearanceSync(
  appearanceMode: AppearanceMode,
  themeColor: ThemeColor,
  setThemeColor: (color: ThemeColor) => void,
) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyAppearance = () => {
      root.classList.toggle(
        "dark",
        appearanceMode === "dark" || (appearanceMode === "system" && media.matches),
      );
    };

    applyAppearance();
    if (appearanceMode !== "system") return;
    media.addEventListener("change", applyAppearance);
    return () => media.removeEventListener("change", applyAppearance);
  }, [appearanceMode]);

  useEffect(() => {
    const normalizedThemeColor = themeColor === "claude" ? "amber" : themeColor;
    if (themeColor === "claude") setThemeColor("amber");
    document.documentElement.dataset.themeColor = normalizedThemeColor;
  }, [setThemeColor, themeColor]);
}

export function useDocumentLocale(languageMode: LanguageMode) {
  useEffect(() => {
    const locale = resolveLocale(languageMode);
    document.documentElement.lang = locale;
    document.documentElement.dataset.textDirection = isRtl(locale) ? "rtl" : "ltr";
  }, [languageMode]);
}

export function useCloseToTraySync(closeToTray: boolean) {
  useEffect(() => {
    setCloseToTrayEnabled(closeToTray).catch((error) => {
      safeWarn("Failed to update close behavior", error);
    });
  }, [closeToTray]);
}

export function useAutoUpdateCheck({ enabled, setReadyUpdate }: AutoUpdateOptions) {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkForUpdate();
        if (result.status !== "ready") return;
        setReadyUpdate({
          currentVersion: result.currentVersion,
          latestVersion: result.latestVersion,
        });
      } catch {
        // Background update failures stay quiet; manual checks still report errors.
      }
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [enabled, setReadyUpdate]);
}

export function useTrayStatusSync(options: TrayStatusOptions) {
  const { autoCheckUpdates, globalAutomationEnabled, totalSaved, totalCount } = options;

  useEffect(() => {
    setTrayStatus({
      auto_check_updates: autoCheckUpdates,
      global_automation_enabled: globalAutomationEnabled,
      total_saved: totalSaved,
      total_count: totalCount,
    }).catch((error) => {
      safeWarn("Failed to sync tray status", error);
    });
  }, [autoCheckUpdates, globalAutomationEnabled, totalSaved, totalCount]);
}

export function useTrayToggleSync(options: TrayToggleOptions) {
  const { setAutoCheckUpdates, setGlobalAutomationEnabled } = options;

  useEffect(() => {
    const unlisten = listen<{ key: string; enabled: boolean }>("zipax://tray-toggle", (event) => {
      if (event.payload.key === "autoCheckUpdates") {
        setAutoCheckUpdates(event.payload.enabled);
      } else if (event.payload.key === "globalAutomationEnabled") {
        setGlobalAutomationEnabled(event.payload.enabled);
      }
    });
    return () => {
      unlisten.then((dispose) => dispose()).catch(() => {});
    };
  }, [setAutoCheckUpdates, setGlobalAutomationEnabled]);
}

export function useAutostartRefresh() {
  useEffect(() => {
    let isMounted = true;
    const refreshAutostartRegistration = async () => {
      try {
        const enabled = await isAutostartEnabled();
        if (!enabled || !isMounted) return;
        await disableAutostart();
        await enableAutostart();
      } catch (error) {
        safeWarn("Failed to refresh autostart registration", error);
      }
    };
    refreshAutostartRegistration();
    return () => {
      isMounted = false;
    };
  }, []);
}
