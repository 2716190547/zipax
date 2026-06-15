import { SettingsCard, SettingTitle } from "@/components/ui";
import { Package } from "@/components/icons";

export default function DependenciesView() {
  return (
    <div className="view-stack">
      <SettingsCard>
        <div className="settings-section">
          <SettingTitle
            icon={<Package size={16} strokeWidth={1.75} />}
            title="外部依赖"
            info="zipax 优先使用内置依赖。"
          />
          <div className="surface-stack is-loose">
            <div className="surface-row">
              <div className="surface-copy">
                <p className="surface-title">内置工具路径</p>
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
