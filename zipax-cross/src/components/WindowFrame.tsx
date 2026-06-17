import { Tabs } from "@heroui/react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import { ClipboardList, House, Package, Settings, Sparkles, Zap } from "@/components/icons";
import { WindowControls } from "@/components/WindowControls";
import type { TabKey } from "@/store/app";

const tabs: { key: TabKey; icon: ReactNode }[] = [
  { key: "image", icon: <House size={24} strokeWidth={1.75} /> },
  { key: "general", icon: <Settings size={24} strokeWidth={1.75} /> },
  { key: "workflow", icon: <ClipboardList size={24} strokeWidth={1.75} /> },
  { key: "automation", icon: <Zap size={24} strokeWidth={1.75} /> },
  { key: "dependencies", icon: <Package size={24} strokeWidth={1.75} /> },
  { key: "about", icon: <Sparkles size={24} strokeWidth={1.75} /> },
];

interface WindowFrameProps {
  activeTab: TabKey;
  onActiveTabChange: (tab: TabKey) => void;
  children: ReactNode;
}

export function WindowFrame({ activeTab, onActiveTabChange, children }: WindowFrameProps) {
  const { t } = useI18n();

  return (
    <section className="zipax-shell">
      <header className="zipax-header">
        <div className="zipax-titlebar" data-tauri-drag-region>
          <h1 className="zipax-title" data-tauri-drag-region>{t(`tabs.${activeTab}`)}</h1>
          <WindowControls />
        </div>
        <Tabs
          variant="secondary"
          selectedKey={activeTab}
          onSelectionChange={(key) => onActiveTabChange(key as TabKey)}
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
          {children}
        </div>
      </main>
    </section>
  );
}
