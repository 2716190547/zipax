import { useCallback, useState } from "react";
import { useI18n } from "@/i18n";
import { checkForUpdate } from "@/lib/update";
import { useAppStore } from "@/store/app";

export type UpdateHint = { text: string; tone: "success" | "danger" } | null;

export function useUpdateCheck() {
  const { t } = useI18n();
  const setAvailableUpdate = useAppStore((s) => s.setAvailableUpdate);
  const [checking, setChecking] = useState(false);
  const [hint, setHint] = useState<UpdateHint>(null);

  const checkNow = useCallback(async () => {
    setChecking(true);
    setHint(null);
    try {
      const result = await checkForUpdate();
      if (result.status === "latest") {
        setHint({ text: t("general.updateLatestShort"), tone: "success" });
        return;
      }

      setAvailableUpdate({
        currentVersion: result.currentVersion,
        latestVersion: result.latestVersion,
        downloadUrl: result.downloadUrl,
      });
      setHint({
        text: t("general.updateAvailable", { version: result.latestVersion }),
        tone: "success",
      });
    } catch {
      setHint({ text: t("general.updateFailed"), tone: "danger" });
    } finally {
      setChecking(false);
    }
  }, [setAvailableUpdate, t]);

  return { checking, hint, checkNow };
}
