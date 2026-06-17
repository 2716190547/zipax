import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app";
import { isRtl, resolveLocale } from "@/i18n";
import ManualCompression from "@/components/ManualCompression";
import GeneralView from "@/components/GeneralView";
import WorkflowView from "@/components/WorkflowView";
import AutomationView from "@/components/AutomationView";
import DependenciesView from "@/components/DependenciesView";
import AboutView from "@/components/AboutView";
import { WindowFrame } from "@/components/WindowFrame";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { disableAutostart, enableAutostart, isAutostartEnabled, setCloseToTrayEnabled, setTrayStatus } from "@/lib/tauri";
import { checkForUpdate } from "@/lib/update";
import { useAutoWindowSize } from "@/hooks/useAutoWindowSize";

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const themeColor = useAppStore((s) => s.themeColor);
  const setThemeColor = useAppStore((s) => s.setThemeColor);
  const languageMode = useAppStore((s) => s.languageMode);
  const autoCheckUpdates = useAppStore((s) => s.autoCheckUpdates);
  const setAutoCheckUpdates = useAppStore((s) => s.setAutoCheckUpdates);
  const setAvailableUpdate = useAppStore((s) => s.setAvailableUpdate);
  const closeToTray = useAppStore((s) => s.closeToTray);
  const globalAutomationEnabled = useAppStore((s) => s.globalAutomationEnabled);
  const setGlobalAutomationEnabled = useAppStore((s) => s.setGlobalAutomationEnabled);
  const totalSaved = useAppStore((s) => s.totalSaved);
  const totalCount = useAppStore((s) => s.totalCount);
  const shellRef = useRef<HTMLDivElement>(null);

  useAutoWindowSize(shellRef, [activeTab, appearanceMode, languageMode, themeColor]);

  // 外观模式切换
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyAppearance = () => {
      if (appearanceMode === "dark") {
        root.classList.add("dark");
      } else if (appearanceMode === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.toggle("dark", media.matches);
      }
    };
    applyAppearance();
    if (appearanceMode !== "system") return;
    media.addEventListener("change", applyAppearance);
    return () => media.removeEventListener("change", applyAppearance);
  }, [appearanceMode]);

  useEffect(() => {
    const root = document.documentElement;
    const normalizedThemeColor = themeColor === "claude" ? "amber" : themeColor;
    if (themeColor === "claude") {
      setThemeColor("amber");
    }
    root.dataset.themeColor = normalizedThemeColor;
  }, [setThemeColor, themeColor]);

  useEffect(() => {
    const locale = resolveLocale(languageMode);
    document.documentElement.lang = locale;
    document.documentElement.dataset.textDirection = isRtl(locale) ? "rtl" : "ltr";
  }, [languageMode]);

  useEffect(() => {
    setCloseToTrayEnabled(closeToTray).catch((error) => {
      console.warn("Failed to update close behavior", error);
    });
  }, [closeToTray]);

  useEffect(() => {
    if (!autoCheckUpdates) return;
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkForUpdate();
        if (result.status !== "available") return;
        setAvailableUpdate({
          currentVersion: result.currentVersion,
          latestVersion: result.latestVersion,
          downloadUrl: result.downloadUrl,
        });
      } catch {
        // Automatic checks stay quiet unless an update is available.
      }
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [autoCheckUpdates, setAvailableUpdate]);

  useEffect(() => {
    setTrayStatus({
      auto_check_updates: autoCheckUpdates,
      global_automation_enabled: globalAutomationEnabled,
      total_saved: totalSaved,
      total_count: totalCount,
    }).catch((error) => {
      console.warn("Failed to sync tray status", error);
    });
  }, [autoCheckUpdates, globalAutomationEnabled, totalSaved, totalCount]);

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

  useEffect(() => {
    let isMounted = true;
    const refreshAutostartRegistration = async () => {
      try {
        const enabled = await isAutostartEnabled();
        if (!enabled || !isMounted) return;
        await disableAutostart();
        await enableAutostart();
      } catch (error) {
        console.warn("Failed to refresh autostart registration", error);
      }
    };
    refreshAutostartRegistration();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="zipax-app text-foreground" ref={shellRef}>
      <WindowFrame activeTab={activeTab} onActiveTabChange={setActiveTab}>
        <UpdatePrompt />
        {activeTab === "image" && <ManualCompression />}
        {activeTab === "general" && <GeneralView />}
        {activeTab === "workflow" && <WorkflowView />}
        {activeTab === "automation" && <AutomationView />}
        {activeTab === "dependencies" && <DependenciesView />}
        {activeTab === "about" && <AboutView />}
      </WindowFrame>
    </div>
  );
}
