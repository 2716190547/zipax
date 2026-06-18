import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { CompressionSettingsEditorValue } from "@/components/CompressionSettingsEditor";
import { stopAllWatchers, watchFolder, type WatchFolderRequest } from "@/lib/tauri";
import { useAppStore, type FolderRule } from "@/store/app";
import { compressionDefaultLevels } from "@/store/utils";

const buildWatchRequest = (rule: FolderRule): WatchFolderRequest => ({
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
});

export const getRuleEditorValue = (rule: FolderRule): CompressionSettingsEditorValue => ({
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
});

function editorPatchToRulePatch(patch: Partial<CompressionSettingsEditorValue>): Partial<FolderRule> {
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
  return next;
}

export function useAutomationRules() {
  const folderRules = useAppStore((s) => s.folderRules);
  const addFolderRule = useAppStore((s) => s.addFolderRule);
  const updateFolderRule = useAppStore((s) => s.updateFolderRule);
  const removeFolderRule = useAppStore((s) => s.removeFolderRule);
  const ensureUniqueFolderRuleIds = useAppStore((s) => s.ensureUniqueFolderRuleIds);
  const globalAutomationEnabled = useAppStore((s) => s.globalAutomationEnabled);
  const setGlobalAutomationEnabled = useAppStore((s) => s.setGlobalAutomationEnabled);

  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  useEffect(() => {
    ensureUniqueFolderRuleIds();
  }, [ensureUniqueFolderRuleIds]);

  useEffect(() => {
    let cancelled = false;

    const syncWatchers = async () => {
      await stopAllWatchers();
      if (!globalAutomationEnabled || cancelled) return;

      for (const rule of folderRules.filter((r) => r.isEnabled)) {
        if (cancelled) return;
        try {
          await watchFolder(buildWatchRequest(rule));
        } catch {
          // Keep syncing the rest of the rules.
        }
      }
    };

    syncWatchers();
    return () => {
      cancelled = true;
    };
  }, [folderRules, globalAutomationEnabled]);

  const addFolder = useCallback(async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (!selected || typeof selected !== "string") return;

      addFolderRule({
        path: selected,
        isEnabled: true,
        overwriteOriginal: true,
        compressionMode: "balanced",
        outputFormat: "original",
        level: compressionDefaultLevels.balanced,
        targetSizePercent: 60,
        preserveMetadata: false,
      });
    } catch {
      // Cancelled.
    }
  }, [addFolderRule]);

  const toggleRule = useCallback((id: string, isEnabled: boolean) => {
    updateFolderRule(id, { isEnabled });
  }, [updateFolderRule]);

  const deleteRule = useCallback((id: string) => {
    removeFolderRule(id);
    setExpandedRuleId((current) => (current === id ? null : current));
  }, [removeFolderRule]);

  const toggleRuleEditor = useCallback((id: string) => {
    setExpandedRuleId((current) => (current === id ? null : id));
  }, []);

  const updateRuleSettings = useCallback((
    id: string,
    patch: Partial<CompressionSettingsEditorValue>,
  ) => {
    updateFolderRule(id, editorPatchToRulePatch(patch));
  }, [updateFolderRule]);

  return {
    folderRules,
    expandedRuleId,
    globalAutomationEnabled,
    setGlobalAutomationEnabled,
    addFolder,
    toggleRule,
    deleteRule,
    toggleRuleEditor,
    updateRuleSettings,
  };
}
