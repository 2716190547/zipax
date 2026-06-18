import { useAppStore } from "@/store/app";
import {
  AppearanceSetting,
  AutoUpdateSetting,
  AutostartSetting,
  CloseToTraySetting,
  LanguageSetting,
  StatsSetting,
  ThemeColorSetting,
  VersionSetting,
} from "@/components/GeneralSettings";

export default function GeneralView() {
  const {
    totalSaved, totalCount, clearStats,
    appearanceMode, setAppearanceMode,
    themeColor, setThemeColor,
    languageMode, setLanguageMode,
    autoCheckUpdates, setAutoCheckUpdates,
    closeToTray, setCloseToTray,
  } = useAppStore();

  return (
    <div className="view-stack">
      <AutostartSetting />
      <AppearanceSetting appearanceMode={appearanceMode} setAppearanceMode={setAppearanceMode} />
      <ThemeColorSetting themeColor={themeColor} setThemeColor={setThemeColor} />
      <LanguageSetting languageMode={languageMode} setLanguageMode={setLanguageMode} />
      <CloseToTraySetting enabled={closeToTray} onChange={setCloseToTray} />
      <VersionSetting />
      <AutoUpdateSetting enabled={autoCheckUpdates} onChange={setAutoCheckUpdates} />
      <StatsSetting totalSaved={totalSaved} totalCount={totalCount} clearStats={clearStats} />
    </div>
  );
}
