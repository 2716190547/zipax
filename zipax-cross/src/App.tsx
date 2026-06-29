import { useRef } from "react";
import { useAppStore } from "@/store/app";
import ManualCompression from "@/components/ManualCompression";
import GeneralView from "@/components/GeneralView";
import WorkflowView from "@/components/WorkflowView";
import AutomationView from "@/components/AutomationView";
import DependenciesView from "@/components/DependenciesView";
import AboutView from "@/components/AboutView";
import { WindowFrame } from "@/components/WindowFrame";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { useAutomationSync } from "@/hooks/useAutomationRules";
import { useAutoWindowSize } from "@/hooks/useAutoWindowSize";
import {
  useAppearanceSync,
  useAutoUpdateCheck,
  useAutostartRefresh,
  useCloseToTraySync,
  useDocumentLocale,
  usePlatformClass,
  useTrayStatusSync,
  useTrayToggleSync,
} from "@/hooks/useAppEffects";

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const themeColor = useAppStore((s) => s.themeColor);
  const setThemeColor = useAppStore((s) => s.setThemeColor);
  const languageMode = useAppStore((s) => s.languageMode);
  const autoCheckUpdates = useAppStore((s) => s.autoCheckUpdates);
  const setAutoCheckUpdates = useAppStore((s) => s.setAutoCheckUpdates);
  const setReadyUpdate = useAppStore((s) => s.setReadyUpdate);
  const closeToTray = useAppStore((s) => s.closeToTray);
  const globalAutomationEnabled = useAppStore((s) => s.globalAutomationEnabled);
  const setGlobalAutomationEnabled = useAppStore((s) => s.setGlobalAutomationEnabled);
  const totalSaved = useAppStore((s) => s.totalSaved);
  const totalCount = useAppStore((s) => s.totalCount);
  const shellRef = useRef<HTMLDivElement>(null);

  usePlatformClass();
  useAutoWindowSize(shellRef, [activeTab, appearanceMode, languageMode, themeColor]);
  useAppearanceSync(appearanceMode, themeColor, setThemeColor);
  useDocumentLocale(languageMode);
  useCloseToTraySync(closeToTray);
  useAutoUpdateCheck({ enabled: autoCheckUpdates, setReadyUpdate });
  useTrayStatusSync({ autoCheckUpdates, globalAutomationEnabled, totalSaved, totalCount });
  useTrayToggleSync({ setAutoCheckUpdates, setGlobalAutomationEnabled });
  useAutostartRefresh();
  useAutomationSync();

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
