import { Tabs } from "@heroui/react";
import { useEffect, useRef } from "react";
import { useAppStore, type TabKey } from "@/store/app";
import { House, Settings, ClipboardList, Zap, Package, Sparkles } from "@/components/icons";
import ManualCompression from "@/components/ManualCompression";
import GeneralView from "@/components/GeneralView";
import WorkflowView from "@/components/WorkflowView";
import AutomationView from "@/components/AutomationView";
import DependenciesView from "@/components/DependenciesView";
import AboutView from "@/components/AboutView";
import { disableAutostart, enableAutostart, isAutostartEnabled } from "@/lib/tauri";
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
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const shellRef = useRef<HTMLDivElement>(null);

  useAutoWindowSize(shellRef, [activeTab]);

  // 外观模式切换
  useEffect(() => {
    const root = document.documentElement;
    if (appearanceMode === "dark") {
      root.classList.add("dark");
    } else if (appearanceMode === "light") {
      root.classList.remove("dark");
    } else {
      // system: 跟随系统
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, [appearanceMode]);

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
        <h1 className="zipax-title">{tabs.find((tab) => tab.key === activeTab)?.label}</h1>
        <Tabs
          variant="secondary"
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(k as TabKey)}
          className="zipax-tabs"
        >
          <Tabs.List className="zipax-tab-list">
            {tabs.map((t) => (
              <Tabs.Tab key={t.key} id={t.key} className="zipax-tab">
                <div className="zipax-tab-title">
                  <span className="zipax-tab-icon">{t.icon}</span>
                  <span>{t.label}</span>
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
