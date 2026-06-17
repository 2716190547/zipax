import { Button } from "@heroui/react";
import { useState } from "react";
import { Download, RefreshCw, X } from "@/components/icons";
import { useI18n } from "@/i18n";
import { downloadAndInstallUpdate } from "@/lib/update";
import { useAppStore } from "@/store/app";

export function UpdatePrompt() {
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);
  const availableUpdate = useAppStore((s) => s.availableUpdate);
  const setAvailableUpdate = useAppStore((s) => s.setAvailableUpdate);

  if (!availableUpdate) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndInstallUpdate();
    } catch {
      setDownloading(false);
    }
  };

  return (
    <div className="update-prompt" role="status" aria-live="polite">
      <div className="update-prompt-icon">
        <RefreshCw size={18} strokeWidth={1.9} />
      </div>
      <div className="update-prompt-copy">
        <p className="update-prompt-title">
          {t("general.updatePromptTitle", { version: availableUpdate.latestVersion })}
        </p>
        <p className="update-prompt-detail">
          {t("general.updatePromptDetail", { current: availableUpdate.currentVersion })}
        </p>
      </div>
      <div className="update-prompt-actions">
        <Button size="sm" variant="primary" isDisabled={downloading} onPress={handleDownload}>
          {downloading ? null : <Download size={14} strokeWidth={1.9} />}
          {downloading ? t("general.updateDownloading") : t("general.updateDownload")}
        </Button>
        <Button
          size="sm"
          variant="tertiary"
          isIconOnly
          className="tool-icon-button"
          aria-label={t("general.updateLater")}
          onPress={() => setAvailableUpdate(null)}
        >
          <X size={15} strokeWidth={1.9} />
        </Button>
      </div>
    </div>
  );
}
