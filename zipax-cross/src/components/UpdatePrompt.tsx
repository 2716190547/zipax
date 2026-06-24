import { Button } from "@heroui/react";
import { useState } from "react";
import { RefreshCw, X } from "@/components/icons";
import { useI18n } from "@/i18n";
import { restartToApplyUpdate } from "@/lib/update";
import { useAppStore } from "@/store/app";

export function UpdatePrompt() {
  const { t } = useI18n();
  const [restarting, setRestarting] = useState(false);
  const readyUpdate = useAppStore((s) => s.readyUpdate);
  const setReadyUpdate = useAppStore((s) => s.setReadyUpdate);

  if (!readyUpdate) return null;

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await restartToApplyUpdate();
    } catch {
      setRestarting(false);
    }
  };

  return (
    <div className="update-prompt" role="status" aria-live="polite">
      <div className="update-prompt-icon">
        <RefreshCw size={18} strokeWidth={1.9} />
      </div>
      <div className="update-prompt-copy">
        <p className="update-prompt-title">
          {t("general.updatePromptTitle", { version: readyUpdate.latestVersion })}
        </p>
        <p className="update-prompt-detail">{t("general.updatePromptDetail")}</p>
      </div>
      <div className="update-prompt-actions">
        <Button size="sm" variant="primary" isDisabled={restarting} onPress={handleRestart}>
          <RefreshCw className={restarting ? "is-spinning" : ""} size={14} strokeWidth={1.9} />
          {restarting ? t("general.updateRestarting") : t("general.updateRestart")}
        </Button>
        <Button
          size="sm"
          variant="tertiary"
          isIconOnly
          className="tool-icon-button"
          aria-label={t("general.updateLater")}
          onPress={() => setReadyUpdate(null)}
        >
          <X size={15} strokeWidth={1.9} />
        </Button>
      </div>
    </div>
  );
}
