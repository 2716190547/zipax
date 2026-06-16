import { Button } from "@heroui/react";
import { open as openUrl } from "@tauri-apps/plugin-shell";
import { useI18n } from "@/i18n";
import { SettingsCard } from "@/components/ui";
import { Coffee, Github, Leaf, AppIcon } from "@/components/icons";

const GITHUB_REPOSITORY_URL = "https://github.com/2716190547/zipax";
const SUPPORT_URL = "https://github.com/2716190547/zipax/blob/master/SUPPORT.md";

export default function AboutView() {
  const { t } = useI18n();
  return (
    <div className="view-stack">
      <SettingsCard>
        <div className="about-hero">
          <div className="about-icon-row">
            <Leaf size={42} strokeWidth={1.65} className="about-leaf-left" />
            <AppIcon size={84} className="about-app-icon" />
            <Leaf size={42} strokeWidth={1.65} className="about-leaf-right" />
          </div>

          <div className="text-center">
            <p className="about-title">{t("about.title")}</p>
            <p className="about-subtitle">{t("about.subtitle")}</p>
          </div>

          <div className="flex gap-2.5">
            <Button size="sm" variant="secondary" onPress={() => openUrl(GITHUB_REPOSITORY_URL)}>
              <Github size={14} />
              {t("about.github")}
            </Button>
            <Button size="sm" variant="secondary" onPress={() => openUrl(SUPPORT_URL)}>
              <Coffee size={14} />
              {t("about.support")}
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
