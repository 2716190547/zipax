import { useAppStore } from "@/store/app";
import { HeroSwitch, SettingsCard, SettingRow } from "@/components/ui";
import { ClipboardCopy, CheckCircle } from "@/components/icons";

export default function WorkflowView() {
  const {
    autoCopyAfterCompression, skipCompressedFiles,
    setAutoCopyAfterCompression, setSkipCompressedFiles,
  } = useAppStore();

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow
          icon={<ClipboardCopy size={16} strokeWidth={1.75} />}
          title="压缩后自动复制"
          info="压缩完成后，把结果文件放入系统剪贴板。"
        >
          <HeroSwitch isSelected={autoCopyAfterCompression} onChange={setAutoCopyAfterCompression} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <SettingRow
          icon={<CheckCircle size={16} strokeWidth={1.75} />}
          title="跳过已压缩文件"
          info="文件名以 #C 或 #C-数字 结尾时，不再重复压缩。"
        >
          <HeroSwitch isSelected={skipCompressedFiles} onChange={setSkipCompressedFiles} />
        </SettingRow>
      </SettingsCard>
    </div>
  );
}
