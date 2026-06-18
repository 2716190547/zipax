import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { languageOptions, useI18n } from "@/i18n";
import { BarChart3, Dock, Ellipsis, Languages, Palette, Power, RefreshCw, SunMoon, Tag } from "@/components/icons";
import { HeroSelect, HeroSwitch, SettingsCard, SettingRow, SettingTitle, StatCard } from "@/components/ui";
import { useUpdateCheck } from "@/hooks/useUpdateCheck";
import { formatBytes } from "@/lib/format";
import { disableAutostart, enableAutostart, getAppInfo, isAutostartEnabled } from "@/lib/tauri";
import { safeWarn } from "@/lib/utils";
import type { AppearanceMode, LanguageMode, ThemeColor } from "@/store/app";

interface AppearanceSettingProps {
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
}

interface ThemeColorSettingProps {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

interface LanguageSettingProps {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
}

interface SwitchSettingProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

interface StatsSettingProps {
  totalSaved: number;
  totalCount: number;
  clearStats: () => void;
}

export function AutostartSetting() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    isAutostartEnabled()
      .then(setEnabled)
      .catch((error) => {
        safeWarn("Failed to read autostart status", error);
      });
  }, []);

  const handleChange = async (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    try {
      if (nextEnabled) await enableAutostart();
      else await disableAutostart();
    } catch (error) {
      safeWarn("Failed to update autostart status", error);
      setEnabled(!nextEnabled);
    }
  };

  return (
    <SettingsCard>
      <SettingRow icon={<Power size={16} strokeWidth={1.75} />} title={t("general.autostart")} info={t("general.autostartInfo")}>
        <HeroSwitch isSelected={enabled} onChange={handleChange} />
      </SettingRow>
    </SettingsCard>
  );
}

export function AppearanceSetting({ appearanceMode, setAppearanceMode }: AppearanceSettingProps) {
  const { t } = useI18n();

  return (
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
  );
}

export function ThemeColorSetting({ themeColor, setThemeColor }: ThemeColorSettingProps) {
  const { t } = useI18n();
  const selectedThemeColor = themeColor === "claude" ? "amber" : themeColor;

  return (
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
  );
}

export function LanguageSetting({ languageMode, setLanguageMode }: LanguageSettingProps) {
  const { t } = useI18n();

  return (
    <SettingsCard>
      <SettingRow icon={<Languages size={16} strokeWidth={1.75} />} title={t("general.language")}>
        <HeroSelect<LanguageMode>
          ariaLabel={t("general.language")}
          value={languageMode}
          onChange={(value) => window.setTimeout(() => setLanguageMode(value), 80)}
          options={languageOptions.map((option) => ({
            key: option.key,
            label: option.key === "system" ? "System" : option.label,
          }))}
          compact
          className="settings-select-language"
        />
      </SettingRow>
    </SettingsCard>
  );
}

export function CloseToTraySetting({ enabled, onChange }: SwitchSettingProps) {
  const { t } = useI18n();

  return (
    <SettingsCard>
      <SettingRow icon={<Dock size={16} strokeWidth={1.75} />} title={t("general.closeToTray")} info={t("general.closeToTrayInfo")}>
        <HeroSwitch isSelected={enabled} onChange={onChange} />
      </SettingRow>
    </SettingsCard>
  );
}

export function VersionSetting() {
  const { t } = useI18n();
  const [currentVersion, setCurrentVersion] = useState("");
  const { checking, hint, checkNow } = useUpdateCheck();

  useEffect(() => {
    getAppInfo()
      .then((info) => setCurrentVersion(info.version))
      .catch(() => {});
  }, []);

  return (
    <SettingsCard>
      <SettingRow icon={<Tag size={16} strokeWidth={1.75} />} title={`${t("general.currentVersion")} v${currentVersion}`}>
        <div className="settings-update-action">
          {hint && <span className={`settings-update-hint is-${hint.tone}`}>{hint.text}</span>}
          <Button
            size="sm"
            variant="tertiary"
            className="settings-check-update-btn"
            isDisabled={checking}
            onPress={checkNow}
          >
            {checking ? t("general.updateChecking") : t("general.checkUpdate")}
          </Button>
        </div>
      </SettingRow>
    </SettingsCard>
  );
}

export function AutoUpdateSetting({ enabled, onChange }: SwitchSettingProps) {
  const { t } = useI18n();

  return (
    <SettingsCard>
      <SettingRow icon={<RefreshCw size={16} strokeWidth={1.75} />} title={t("general.softwareUpdate")}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground/60">{t("general.autoCheckUpdates")}</span>
          <HeroSwitch isSelected={enabled} onChange={onChange} />
        </div>
      </SettingRow>
    </SettingsCard>
  );
}

export function StatsSetting({ totalSaved, totalCount, clearStats }: StatsSettingProps) {
  const { t } = useI18n();
  const [showClearStats, setShowClearStats] = useState(false);

  return (
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
  );
}
