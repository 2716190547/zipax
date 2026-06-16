import { useAppStore } from "@/store/app";
import { useI18n } from "@/i18n";
import { HeroSwitch, SettingsCard, SettingRow } from "@/components/ui";
import { ClipboardCopy, CheckCircle } from "@/components/icons";

export default function WorkflowView() {
  const { t } = useI18n();
  const {
    autoCopyAfterCompression, skipCompressedFiles,
    setAutoCopyAfterCompression, setSkipCompressedFiles,
  } = useAppStore();

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow
          icon={<ClipboardCopy size={16} strokeWidth={1.75} />}
          title={t("workflow.autoCopy")}
          info={t("workflow.autoCopyInfo")}
        >
          <HeroSwitch isSelected={autoCopyAfterCompression} onChange={setAutoCopyAfterCompression} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow
          icon={<CheckCircle size={16} strokeWidth={1.75} />}
          title={t("workflow.skipCompressed")}
          info={t("workflow.skipCompressedInfo")}
        >
          <HeroSwitch isSelected={skipCompressedFiles} onChange={setSkipCompressedFiles} />
        </SettingRow>
      </SettingsCard>
    </div>
  );
}
