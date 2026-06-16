import { Tabs } from "@heroui/react";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { useAppStore, type TabKey } from "@/store/app";
import { isRtl, resolveLocale, useI18n } from "@/i18n";
import { House, Settings, ClipboardList, Zap, Package, Sparkles } from "@/components/icons";
import ManualCompression from "@/components/ManualCompression";
import GeneralView from "@/components/GeneralView";
import WorkflowView from "@/components/WorkflowView";
import AutomationView from "@/components/AutomationView";
import DependenciesView from "@/components/DependenciesView";
import AboutView from "@/components/AboutView";
import { disableAutostart, enableAutostart, isAutostartEnabled, setCloseToTrayEnabled, setTrayStatus } from "@/lib/tauri";
import { checkForUpdate, openUpdateDownload } from "@/lib/update";
import { useAutoWindowSize } from "@/hooks/useAutoWindowSize";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "image", label: "首页", icon: <House size={24} strokeWidth={1.75} /> },
  { key: "general", label: "通用", icon: <Settings size={24} strokeWidth={1.75} /> },
  { key: "workflow", label: "工作流", icon: <ClipboardList size={24} strokeWidth={1.75} /> },
  { key: "automation", label: "自动化", icon: <Zap size={24} strokeWidth={1.75} /> },
  { key: "dependencies", label: "依赖", icon: <Package size={24} strokeWidth={1.75} /> },
  { key: "about", label: "关于", icon: <Sparkles size={24} strokeWidth={1.75} /> },
];

export default function App() {
  const { t } = useI18n();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const themeColor = useAppStore((s) => s.themeColor);
  const setThemeColor = useAppStore((s) => s.setThemeColor);
  const languageMode = useAppStore((s) => s.languageMode);
  const autoCheckUpdates = useAppStore((s) => s.autoCheckUpdates);
  const setAutoCheckUpdates = useAppStore((s) => s.setAutoCheckUpdates);
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
        const shouldOpen = window.confirm(
          t("general.updateConfirm", {
            latest: result.latestVersion,
            current: result.currentVersion,
          }),
        );
        if (shouldOpen) await openUpdateDownload(result.downloadUrl);
      } catch {
        // Automatic checks stay quiet unless an update is available.
      }
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [autoCheckUpdates, t]);

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
    <div className="zipax-app bg-background text-foreground" ref={shellRef}>
      <header className="zipax-header">
        <h1 className="zipax-title">{t(`tabs.${activeTab}`)}</h1>
        <Tabs
          variant="secondary"
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(k as TabKey)}
          className="zipax-tabs"
        >
          <Tabs.List className="zipax-tab-list">
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.key} id={tab.key} className="zipax-tab">
                <div className="zipax-tab-title">
                  <span className="zipax-tab-icon">{tab.icon}</span>
                  <span>{t(`tabs.${tab.key}`)}</span>
                </div>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </header>
      <div className="h-px bg-divider" />
      <main className="zipax-content">
        <div key={activeTab} className="zipax-page-frame">
          {activeTab === "image" && <ManualCompression />}
          {activeTab === "general" && <GeneralView />}
          {activeTab === "workflow" && <WorkflowView />}
          {activeTab === "automation" && <AutomationView />}
          {activeTab === "dependencies" && <DependenciesView />}
          {activeTab === "about" && <AboutView />}
          <div className="zipax-measure-sentinel" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}
