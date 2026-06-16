import { useI18n } from "@/i18n";
import { SettingsCard, SettingTitle } from "@/components/ui";
import { Package } from "@/components/icons";

export default function DependenciesView() {
  const { t } = useI18n();
  return (
    <div className="view-stack">
      <SettingsCard>
        <div className="settings-section">
          <SettingTitle
            icon={<Package size={16} strokeWidth={1.75} />}
            title={t("dependencies.external")}
            info={t("dependencies.externalInfo")}
          />
          <div className="surface-stack is-loose">
            <div className="surface-row">
              <div className="surface-copy">
                <p className="surface-title">{t("dependencies.bundledToolsPath")}</p>
                <p className="surface-detail font-mono">
                zipax.app/Contents/Resources/Tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

    </div>
  );
}
