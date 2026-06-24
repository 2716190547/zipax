import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState } from "./types";
import { compressionDefaultLevels, genId, isCompressedFile } from "./utils";

export type {
  AppState,
  AppearanceMode,
  CompressionItem,
  CompressionMode,
  ErrorRecord,
  FolderRule,
  LanguageMode,
  NewCompressionItem,
  OutputFormat,
  ReadyUpdate,
  TabKey,
  ThemeColor,
} from "./types";
export { isCompressedFile };

const persistCompressionSettings = (state: AppState) => ({
  mode: state.mode,
  format: state.format,
  level: state.level,
  targetSizeKB: state.targetSizeKB,
  targetSizePercent: state.targetSizePercent,
  preserveMetadata: state.preserveMetadata,
  overwrite: state.overwrite,
  maxWidth: state.maxWidth,
  maxHeight: state.maxHeight,
  allowUpscale: state.allowUpscale,
});

const persistWorkflowSettings = (state: AppState) => ({
  autoCopyAfterCompression: state.autoCopyAfterCompression,
  skipCompressedFiles: state.skipCompressedFiles,
  appearanceMode: state.appearanceMode,
  themeColor: state.themeColor,
  languageMode: state.languageMode,
  autoCheckUpdates: state.autoCheckUpdates,
  closeToTray: state.closeToTray,
  globalAutomationEnabled: state.globalAutomationEnabled,
});

const persistAutomationState = (state: AppState) => ({
  folderRules: state.folderRules,
  errorRecords: state.errorRecords,
});

const persistStats = (state: AppState) => ({
  totalSaved: state.totalSaved,
  totalCount: state.totalCount,
});

const persistAppState = (state: AppState) => ({
  ...persistCompressionSettings(state),
  ...persistWorkflowSettings(state),
  ...persistAutomationState(state),
  ...persistStats(state),
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "image",
      setActiveTab: (tab) => set({ activeTab: tab }),
      readyUpdate: null,
      setReadyUpdate: (update) => set({ readyUpdate: update }),

      // Manual compression settings
      mode: "balanced",
      format: "original",
      level: 3,
      targetSizeKB: 500,
      targetSizePercent: 60,
      preserveMetadata: false,
      overwrite: false,
      maxWidth: undefined,
      maxHeight: undefined,
      allowUpscale: false,

      setMode: (mode) => {
        set({ mode, level: compressionDefaultLevels[mode] });
      },
      setFormat: (format) => set({ format }),
      setLevel: (level) => set({ level }),
      setTargetSizeKB: (kb) => set({ targetSizeKB: kb }),
      setTargetSizePercent: (percent) => set({ targetSizePercent: percent }),
      setPreserveMetadata: (v) => set({ preserveMetadata: v }),
      setOverwrite: (v) => set({ overwrite: v }),
      setMaxWidth: (w) => set({ maxWidth: w }),
      setMaxHeight: (h) => set({ maxHeight: h }),
      setAllowUpscale: (v) => set({ allowUpscale: v }),

      // Workflow
      autoCopyAfterCompression: false,
      skipCompressedFiles: true,
      appearanceMode: "system",
      themeColor: "blue",
      languageMode: "system",
      autoCheckUpdates: false,
      closeToTray: true,
      globalAutomationEnabled: true,
      setAutoCopyAfterCompression: (v) => set({ autoCopyAfterCompression: v }),
      setSkipCompressedFiles: (v) => set({ skipCompressedFiles: v }),
      setAppearanceMode: (v) => set({ appearanceMode: v }),
      setThemeColor: (v) => set({ themeColor: v }),
      setLanguageMode: (v) => set({ languageMode: v }),
      setAutoCheckUpdates: (v) => set({ autoCheckUpdates: v }),
      setCloseToTray: (v) => set({ closeToTray: v }),
      setGlobalAutomationEnabled: (v) => set({ globalAutomationEnabled: v }),

      // Folder rules
      folderRules: [],
      addFolderRule: (rule) =>
        set((s) => ({
          folderRules: [
            ...s.folderRules,
            { ...rule, id: genId() },
          ],
        })),
      updateFolderRule: (id, patch) =>
        set((s) => ({
          folderRules: s.folderRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeFolderRule: (id) =>
        set((s) => ({ folderRules: s.folderRules.filter((r) => r.id !== id) })),
      ensureUniqueFolderRuleIds: () =>
        set((s) => {
          const seen = new Set<string>();
          let changed = false;
          const folderRules = s.folderRules.map((rule) => {
            if (!rule.id || seen.has(rule.id)) {
              changed = true;
              const nextRule = { ...rule, id: genId() };
              seen.add(nextRule.id);
              return nextRule;
            }
            seen.add(rule.id);
            return rule;
          });
          return changed ? { folderRules } : {};
        }),

      // Manual items (transient)
      items: [],
      addItem: (item) => {
        const id = genId();
        const { status = "pending", ...nextItem } = item;
        set((s) => ({ items: [...s.items, { ...nextItem, id, status }] }));
        return id;
      },
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clearItems: () => set({ items: [] }),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      // Error records
      errorRecords: [],
      addErrorRecord: (record) =>
        set((s) => ({
          errorRecords: [{ ...record, id: genId() }, ...s.errorRecords].slice(0, 20),
        })),
      clearErrorRecords: () => set({ errorRecords: [] }),

      // Stats
      totalSaved: 0,
      totalCount: 0,
      recordCompression: (savedBytes) =>
        set((s) => ({
          totalSaved: s.totalSaved + Math.max(0, savedBytes),
          totalCount: s.totalCount + 1,
        })),
      clearStats: () => set({ totalSaved: 0, totalCount: 0 }),
    }),
    {
      name: "zipax-store",
      partialize: persistAppState,
    }
  )
);
