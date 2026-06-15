import { useEffect, useState, useCallback } from "react";
import { Button, Tooltip } from "@heroui/react";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore, type FolderRule } from "@/store/app";
import { watchFolder, stopAllWatchers, type WatchFolderRequest } from "@/lib/tauri";
import { HeroSwitch, SettingsCard, SettingTitle, SettingRow, FolderRuleRow } from "@/components/ui";
import { CompressionSettingsEditor, type CompressionSettingsEditorValue } from "@/components/CompressionSettingsEditor";
import { Zap, Folder, AlertTriangle, Plus, Trash2 } from "@/components/icons";

export default function AutomationView() {
  const {
    folderRules, addFolderRule, updateFolderRule, removeFolderRule,
    ensureUniqueFolderRuleIds,
    errorRecords, clearErrorRecords,
    globalAutomationEnabled, setGlobalAutomationEnabled,
    totalSaved,
  } = useAppStore();

  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  useEffect(() => {
    ensureUniqueFolderRuleIds();
  }, [ensureUniqueFolderRuleIds]);

  const buildWatchRequest = useCallback((rule: FolderRule): WatchFolderRequest => ({
    path: rule.path,
    auto_compress: true,
    mode: rule.compressionMode,
    format: rule.outputFormat,
    level: rule.level,
    target_size_kb: rule.targetSizeKB,
    target_size_percent: rule.targetSizePercent,
    preserve_metadata: rule.preserveMetadata,
    overwrite: rule.outputFormat === "pdf" ? false : rule.overwriteOriginal,
    max_width: rule.maxWidth,
    max_height: rule.maxHeight,
    allow_upscale: false,
  }), []);

  useEffect(() => {
    let cancelled = false;
    const syncWatchers = async () => {
      await stopAllWatchers();
      if (!globalAutomationEnabled || cancelled) return;

      for (const rule of folderRules.filter((r) => r.isEnabled)) {
        if (cancelled) return;
        try {
          await watchFolder(buildWatchRequest(rule));
        } catch { /* Keep syncing the rest of the rules. */ }
      }
    };

    syncWatchers();
    return () => {
      cancelled = true;
    };
  }, [buildWatchRequest, folderRules, globalAutomationEnabled]);

  const addFolder = useCallback(async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === "string") {
        addFolderRule({
          path: selected, isEnabled: true, overwriteOriginal: true,
          compressionMode: "balanced", outputFormat: "original",
          level: 3, targetSizePercent: 60, preserveMetadata: false,
        });
      }
    } catch { /* cancelled */ }
  }, [addFolderRule]);

  const handleToggleGlobal = useCallback(async (enabled: boolean) => {
    setGlobalAutomationEnabled(enabled);
  }, [setGlobalAutomationEnabled]);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    updateFolderRule(id, { isEnabled: enabled });
  }, [updateFolderRule]);

  const handleDelete = useCallback(async (id: string) => {
    removeFolderRule(id);
    setExpandedRuleId((current) => {
      if (current === id) return null;
      return folderRules.some((rule) => rule.id !== id && rule.id === current) ? current : null;
    });
  }, [folderRules, removeFolderRule]);

  const handleEditRule = useCallback((id: string) => {
    setExpandedRuleId((current) => (current === id ? null : id));
  }, []);

  const updateRuleSettings = useCallback((id: string, patch: Partial<CompressionSettingsEditorValue>) => {
    const next: Partial<FolderRule> = {};
    if (patch.mode !== undefined) next.compressionMode = patch.mode;
    if (patch.format !== undefined) {
      next.outputFormat = patch.format;
      if (patch.format === "pdf") next.overwriteOriginal = false;
    }
    if (patch.level !== undefined) next.level = patch.level;
    if ("targetSizeKB" in patch) next.targetSizeKB = patch.targetSizeKB;
    if ("targetSizePercent" in patch) next.targetSizePercent = patch.targetSizePercent;
    if (patch.overwrite !== undefined) next.overwriteOriginal = patch.overwrite;
    if (next.outputFormat === "pdf") next.overwriteOriginal = false;
    if (patch.preserveMetadata !== undefined) next.preserveMetadata = patch.preserveMetadata;
    if ("maxWidth" in patch) next.maxWidth = patch.maxWidth;
    if ("maxHeight" in patch) next.maxHeight = patch.maxHeight;
    updateFolderRule(id, next);
  }, [updateFolderRule]);

  const formatSaved = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="view-stack">
      <SettingsCard>
        <SettingRow icon={<Zap size={16} strokeWidth={1.75} />} title={`自动压缩 · 已节省 ${formatSaved(totalSaved)}`}>
          <HeroSwitch isSelected={globalAutomationEnabled} onChange={handleToggleGlobal} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard>
        <div className="settings-section">
          <div className="flex items-center justify-between">
            <SettingTitle icon={<Folder size={16} strokeWidth={1.75} />} title="文件夹自动压缩" info="只处理加入文件夹后的新图片。" />
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="tertiary"
                  isIconOnly
                  className="tool-icon-button"
                  onPress={addFolder}
                  aria-label="添加文件夹"
                >
                  <Plus size={16} strokeWidth={1.75} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>添加文件夹</Tooltip.Content>
            </Tooltip>
          </div>

          {folderRules.length === 0 ? (
            <div className="surface-panel text-center py-5 text-default-400">
              <Folder size={28} strokeWidth={1.5} className="mx-auto mb-1.5" />
              <p className="surface-detail">还没有文件夹</p>
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
                    onToggle={(enabled) => handleToggle(rule.id, enabled)}
                    onEdit={() => handleEditRule(rule.id)}
                    onDelete={() => handleDelete(rule.id)}
                  />
                  {isConfigOpen && (
                    <div className="folder-rule-config">
                      <CompressionSettingsEditor
                        compact
                        embedded
                        layout="panel"
                        value={{
                          mode: rule.compressionMode,
                          format: rule.outputFormat,
                          level: rule.level,
                          targetSizeKB: rule.targetSizeKB,
                          targetSizePercent: rule.targetSizePercent,
                          overwrite: rule.overwriteOriginal,
                          preserveMetadata: rule.preserveMetadata,
                          maxWidth: rule.maxWidth,
                          maxHeight: rule.maxHeight,
                          allowUpscale: false,
                        }}
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
              <SettingTitle icon={<AlertTriangle size={16} strokeWidth={1.75} />} title="最近错误" />
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    size="sm"
                    variant="tertiary"
                    isIconOnly
                    className="tool-icon-button is-danger"
                    onPress={clearErrorRecords}
                    aria-label="清除错误"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>清除</Tooltip.Content>
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
