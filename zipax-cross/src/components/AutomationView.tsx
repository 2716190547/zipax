import { Button, Tooltip } from "@heroui/react";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/store/app";
import { formatBytes } from "@/lib/format";
import { getRuleEditorValue, useAutomationRules } from "@/hooks/useAutomationRules";
import { HeroSwitch, SettingsCard, SettingTitle, SettingRow, FolderRuleRow } from "@/components/ui";
import { CompressionSettingsEditor } from "@/components/CompressionSettingsEditor";
import { Zap, Folder, AlertTriangle, Plus, Trash2 } from "@/components/icons";

export default function AutomationView() {
  const { t } = useI18n();
  const errorRecords = useAppStore((s) => s.errorRecords);
  const clearErrorRecords = useAppStore((s) => s.clearErrorRecords);
  const totalSaved = useAppStore((s) => s.totalSaved);
  const {
    folderRules,
    expandedRuleId,
    globalAutomationEnabled,
    setGlobalAutomationEnabled,
    addFolder,
    toggleRule,
    deleteRule,
    toggleRuleEditor,
    updateRuleSettings,
  } = useAutomationRules();

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow icon={<Zap size={16} strokeWidth={1.75} />} title={t("automation.autoCompressionSaved", { saved: formatBytes(totalSaved) })}>
          <HeroSwitch isSelected={globalAutomationEnabled} onChange={setGlobalAutomationEnabled} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <div className="settings-section">
          <div className="flex items-center justify-between">
            <SettingTitle icon={<Folder size={16} strokeWidth={1.75} />} title={t("automation.folderCompression")} info={t("automation.folderCompressionInfo")} />
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="tertiary"
                  isIconOnly
                  className="tool-icon-button"
                  onPress={addFolder}
                  aria-label={t("automation.addFolder")}
                >
                  <Plus size={16} strokeWidth={1.75} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{t("automation.addFolder")}</Tooltip.Content>
            </Tooltip>
          </div>

          {folderRules.length === 0 ? (
            <div className="surface-panel text-center py-5 text-default-400">
              <Folder size={28} strokeWidth={1.5} className="mx-auto mb-1.5" />
              <p className="surface-detail">{t("automation.noFolders")}</p>
            </div>
          ) : (
            <div className="surface-stack is-loose">
              {folderRules.map((rule) => {
                const isConfigOpen = expandedRuleId === rule.id;
                return (
                <div key={rule.id} className={isConfigOpen ? "folder-rule-item is-open" : "folder-rule-item"}>
                  <FolderRuleRow
                    path={rule.path}
                    isEnabled={rule.isEnabled}
                    lastProcessedAt={rule.lastProcessedAt}
                    isConfigOpen={isConfigOpen}
                    onToggle={(enabled) => toggleRule(rule.id, enabled)}
                    onEdit={() => toggleRuleEditor(rule.id)}
                    onDelete={() => deleteRule(rule.id)}
                  />
                  {isConfigOpen && (
                    <div className="folder-rule-config">
                      <CompressionSettingsEditor
                        compact
                        embedded
                        layout="panel"
                        value={getRuleEditorValue(rule)}
                        onChange={(patch) => updateRuleSettings(rule.id, patch)}
                      />
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      </SettingsCard>

      {errorRecords.length > 0 && (
        <SettingsCard>
          <div className="settings-section">
            <div className="flex items-center justify-between">
              <SettingTitle icon={<AlertTriangle size={16} strokeWidth={1.75} />} title={t("automation.recentErrors")} />
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    size="sm"
                    variant="tertiary"
                    isIconOnly
                    className="tool-icon-button is-danger"
                    onPress={clearErrorRecords}
                    aria-label={t("automation.clearErrors")}
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{t("automation.clear")}</Tooltip.Content>
              </Tooltip>
            </div>
            <div className="surface-stack">
              {errorRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="surface-row">
                  <div className="surface-copy">
                    <p className="surface-title truncate">{record.fileName}</p>
                    <p className="surface-detail">{record.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
