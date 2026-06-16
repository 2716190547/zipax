import { Button, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { languageOptions, useI18n } from "@/i18n";
import { useAppStore, type LanguageMode, type ThemeColor } from "@/store/app";
import { HeroSelect, HeroSwitch, SettingsCard, SettingRow, SettingTitle, StatCard } from "@/components/ui";
import { Power, Palette, SunMoon, Languages, Dock, RefreshCw, BarChart3, Ellipsis } from "@/components/icons";
import { enableAutostart, disableAutostart, isAutostartEnabled } from "@/lib/tauri";
import { checkForUpdate, openUpdateDownload } from "@/lib/update";

type UpdateStatus = "idle" | "checking" | "latest" | "available" | "error";

export default function GeneralView() {
  const { t } = useI18n();
  const [showClearStats, setShowClearStats] = useState(false);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [updateMessage, setUpdateMessage] = useState(t("general.updateIdle"));
  const {
    totalSaved, totalCount, clearStats,
    appearanceMode, setAppearanceMode,
    themeColor, setThemeColor,
    languageMode, setLanguageMode,
    autoCheckUpdates, setAutoCheckUpdates,
    closeToTray, setCloseToTray,
  } = useAppStore();
  const selectedThemeColor = themeColor === "claude" ? "amber" : themeColor;

  useEffect(() => {
    isAutostartEnabled()
      .then(setAutostartEnabled)
      .catch((error) => {
        console.warn("Failed to read autostart status", error);
      });
  }, []);

  useEffect(() => {
    if (updateStatus === "idle") setUpdateMessage(t("general.updateIdle"));
  }, [t, updateStatus]);

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

  const handleCheckUpdate = async () => {
    setUpdateStatus("checking");
    setUpdateMessage(t("general.updateChecking"));
    try {
      const result = await checkForUpdate();
      if (result.status === "latest") {
        setUpdateStatus("latest");
        setUpdateMessage(t("general.updateLatest", { version: result.currentVersion }));
        return;
      }

      setUpdateStatus("available");
      setUpdateMessage(t("general.updateAvailable", { version: result.latestVersion }));
      const shouldOpen = window.confirm(t("general.updateConfirm", {
        latest: result.latestVersion,
        current: result.currentVersion,
      }));
      if (shouldOpen) {
        await openUpdateDownload(result.downloadUrl);
      }
    } catch (error) {
      setUpdateStatus("error");
      setUpdateMessage(error instanceof Error ? error.message : t("general.updateFailed"));
    }
  };

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow icon={<Power size={16} strokeWidth={1.75} />} title={t("general.autostart")} info={t("general.autostartInfo")}>
          <HeroSwitch isSelected={autostartEnabled} onChange={handleToggleAutostart} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<SunMoon size={16} strokeWidth={1.75} />} title={t("general.appearance")}>
          <HeroSelect
            ariaLabel={t("general.appearance")}
            value={appearanceMode}
            onChange={setAppearanceMode}
            options={[
              { key: "system", label: t("general.system") },
              { key: "light", label: t("general.light") },
              { key: "dark", label: t("general.dark") },
            ]}
            compact
            className="settings-select-appearance"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<Palette size={16} strokeWidth={1.75} />} title={t("general.themeColor")}>
          <HeroSelect<ThemeColor>
            ariaLabel={t("general.themeColor")}
            value={selectedThemeColor}
            onChange={setThemeColor}
            options={[
              { key: "blue", label: t("theme.blue") },
              { key: "emerald", label: t("theme.emerald") },
              { key: "violet", label: t("theme.violet") },
              { key: "amber", label: t("theme.amber") },
              { key: "rose", label: t("theme.rose") },
              { key: "slate", label: t("theme.slate") },
            ]}
            compact
            className="settings-select-theme"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<Languages size={16} strokeWidth={1.75} />} title={t("general.language")}>
          <HeroSelect<LanguageMode>
            ariaLabel={t("general.language")}
            value={languageMode}
            onChange={(value) => {
              window.setTimeout(() => setLanguageMode(value), 80);
            }}
            options={languageOptions.map((option) => ({
              key: option.key,
              label: option.key === "system" ? "System" : option.label,
            }))}
            compact
            className="settings-select-language"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<Dock size={16} strokeWidth={1.75} />} title={t("general.closeToTray")} info={t("general.closeToTrayInfo")}>
          <HeroSwitch isSelected={closeToTray} onChange={setCloseToTray} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow icon={<RefreshCw size={16} strokeWidth={1.75} />} title={t("general.softwareUpdate")} info={t("general.softwareUpdateInfo")}>
          <div className="flex items-center gap-2">
            <HeroSwitch isSelected={autoCheckUpdates} onChange={setAutoCheckUpdates} />
            <span className={`update-status-text is-${updateStatus}`}>{updateMessage}</span>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="tertiary"
                  isIconOnly
                  className="tool-icon-button"
                  aria-label={t("general.checkUpdate")}
                  isDisabled={updateStatus === "checking"}
                  onPress={handleCheckUpdate}
                >
                  <RefreshCw size={16} strokeWidth={1.75} className={updateStatus === "checking" ? "is-spinning" : ""} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{t("general.checkUpdate")}</Tooltip.Content>
            </Tooltip>
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <div className="settings-section">
          <div className="flex items-center justify-between">
            <SettingTitle icon={<BarChart3 size={16} strokeWidth={1.75} />} title={t("general.stats")} />
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
                  {t("general.clear")}
                </Button>
              )}
              <Button
                size="sm"
                variant="tertiary"
                isIconOnly
                className="tool-icon-button"
                aria-label={t("general.moreStats")}
                onPress={() => setShowClearStats((visible) => !visible)}
              >
                <Ellipsis size={17} strokeWidth={2.2} />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <StatCard title={t("general.compressionCount")} value={String(totalCount)} unit={t("general.itemsUnit")} />
            <StatCard title={t("general.savedSize")} value={formatBytes(totalSaved)} />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
