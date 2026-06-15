import { Button, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { HeroSelect, HeroSwitch, SettingsCard, SettingRow, SettingTitle, StatCard } from "@/components/ui";
import { Power, Palette, RefreshCw, BarChart3, Ellipsis } from "@/components/icons";
import { enableAutostart, disableAutostart, isAutostartEnabled } from "@/lib/tauri";

export default function GeneralView() {
  const [showClearStats, setShowClearStats] = useState(false);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const { totalSaved, totalCount, clearStats, appearanceMode, setAppearanceMode } = useAppStore();

  useEffect(() => {
    isAutostartEnabled()
      .then(setAutostartEnabled)
      .catch((error) => {
        console.warn("Failed to read autostart status", error);
      });
  }, []);

  const handleToggleAutostart = async (enabled: boolean) => {
    setAutostartEnabled(enabled);
    try {
      if (enabled) { await enableAutostart(); }
      else { await disableAutostart(); }
    } catch (error) {
      console.warn("Failed to update autostart status", error);
      setAutostartEnabled(!enabled);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow icon={<Power size={16} strokeWidth={1.75} />} title="开机自启" info="登录后自动启动 zipax。">
          <HeroSwitch isSelected={autostartEnabled} onChange={handleToggleAutostart} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<Palette size={16} strokeWidth={1.75} />} title="外观">
          <HeroSelect
            ariaLabel="外观"
            value={appearanceMode}
            onChange={setAppearanceMode}
            options={[
              { key: "system", label: "跟随系统" },
              { key: "light", label: "浅色" },
              { key: "dark", label: "深色" },
            ]}
            compact
            className="w-[112px]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<RefreshCw size={16} strokeWidth={1.75} />} title="自动更新" info="发现新版本后自动下载并安装。">
          <div className="flex items-center gap-2">
            <HeroSwitch defaultSelected />
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="tertiary"
                  isIconOnly
                  className="tool-icon-button"
                  aria-label="检查更新"
                >
                  <RefreshCw size={16} strokeWidth={1.75} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>检查更新</Tooltip.Content>
            </Tooltip>
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <div className="settings-section">
          <div className="flex items-center justify-between">
            <SettingTitle icon={<BarChart3 size={16} strokeWidth={1.75} />} title="统计" />
            <div className="flex items-center gap-1.5">
              {showClearStats && (
                <Button
                  size="sm"
                  variant="danger-soft"
                  onPress={() => {
                    clearStats();
                    setShowClearStats(false);
                  }}
                >
                  清除
                </Button>
              )}
              <Button
                size="sm"
                variant="tertiary"
                isIconOnly
                className="tool-icon-button"
                aria-label="更多统计操作"
                onPress={() => setShowClearStats((visible) => !visible)}
              >
                <Ellipsis size={17} strokeWidth={2.2} />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <StatCard title="压缩数量" value={String(totalCount)} unit="张" />
            <StatCard title="节省大小" value={formatBytes(totalSaved)} />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
