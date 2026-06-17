import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompressResponse } from "@/lib/tauri";

export type CompressionMode = "quality" | "balanced" | "size" | "advanced" | "target";
export type OutputFormat = "original" | "jpeg" | "png" | "webp" | "avif" | "heic" | "pdf";
export type AppearanceMode = "system" | "light" | "dark";
export type ThemeColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "slate" | "claude";
export type LanguageMode =
  | "system"
  | "en-US"
  | "zh-CN"
  | "zh-TW"
  | "es-ES"
  | "ar"
  | "id-ID"
  | "pt-BR"
  | "fr-FR"
  | "ja-JP"
  | "ko-KR";
export type TabKey = "image" | "general" | "workflow" | "automation" | "dependencies" | "about";

export interface AvailableUpdate {
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
}

/** 检查文件名是否是已压缩文件（#C 后缀） */
export function isCompressedFile(name: string): boolean {
  const baseName = name.replace(/\.[^.]+$/, ""); // 去掉扩展名
  if (baseName.endsWith("#C")) return true;
  return /#C-\d+$/.test(baseName);
}

export interface CompressionItem {
  id: string;
  name: string;
  path: string;
  originalBytes: number;
  result?: CompressResponse;
  status: "preparing" | "pending" | "compressing" | "done" | "error";
  error?: string;
}

type NewCompressionItem = Omit<CompressionItem, "id" | "status"> & {
  status?: CompressionItem["status"];
};

export interface ErrorRecord {
  id: string;
  fileName: string;
  reason: string;
  occurredAt: Date;
}

export interface FolderRule {
  id: string;
  path: string;
  isEnabled: boolean;
  overwriteOriginal: boolean;
  compressionMode: CompressionMode;
  outputFormat: OutputFormat;
  level: number;
  targetSizeKB?: number;
  targetSizePercent?: number;
  preserveMetadata: boolean;
  maxWidth?: number;
  maxHeight?: number;
  lastProcessedAt?: string;
}

interface AppState {
  // UI state (transient — not persisted)
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  availableUpdate: AvailableUpdate | null;
  setAvailableUpdate: (update: AvailableUpdate | null) => void;

  // Compression settings (persisted)
  mode: CompressionMode;
  format: OutputFormat;
  level: number;
  targetSizeKB: number;
  targetSizePercent: number;
  preserveMetadata: boolean;
  overwrite: boolean;
  maxWidth?: number;
  maxHeight?: number;
  allowUpscale: boolean;

  setMode: (mode: CompressionMode) => void;
  setFormat: (format: OutputFormat) => void;
  setLevel: (level: number) => void;
  setTargetSizeKB: (kb: number) => void;
  setTargetSizePercent: (percent: number) => void;
  setPreserveMetadata: (v: boolean) => void;
  setOverwrite: (v: boolean) => void;
  setMaxWidth: (w?: number) => void;
  setMaxHeight: (h?: number) => void;
  setAllowUpscale: (v: boolean) => void;

  // Workflow settings (persisted)
  autoCopyAfterCompression: boolean;
  skipCompressedFiles: boolean;
  appearanceMode: AppearanceMode;
  themeColor: ThemeColor;
  languageMode: LanguageMode;
  autoCheckUpdates: boolean;
  closeToTray: boolean;
  globalAutomationEnabled: boolean;
  setAutoCopyAfterCompression: (v: boolean) => void;
  setSkipCompressedFiles: (v: boolean) => void;
  setAppearanceMode: (v: AppearanceMode) => void;
  setThemeColor: (v: ThemeColor) => void;
  setLanguageMode: (v: LanguageMode) => void;
  setAutoCheckUpdates: (v: boolean) => void;
  setCloseToTray: (v: boolean) => void;
  setGlobalAutomationEnabled: (v: boolean) => void;

  // Folder rules (persisted)
  folderRules: FolderRule[];
  addFolderRule: (rule: Omit<FolderRule, "id">) => void;
  updateFolderRule: (id: string, patch: Partial<FolderRule>) => void;
  removeFolderRule: (id: string) => void;
  ensureUniqueFolderRuleIds: () => void;

  // Items (transient — not persisted)
  items: CompressionItem[];
  addItem: (item: NewCompressionItem) => string;
  removeItem: (id: string) => void;
  clearItems: () => void;
  updateItem: (id: string, patch: Partial<CompressionItem>) => void;

  // Error records (persisted)
  errorRecords: ErrorRecord[];
  addErrorRecord: (record: Omit<ErrorRecord, "id">) => void;
  clearErrorRecords: () => void;

  // Stats (persisted)
  totalSaved: number;
  totalCount: number;
  recordCompression: (savedBytes: number) => void;
  clearStats: () => void;
}

let nextId = 0;
const genId = () => `item-${Date.now().toString(36)}-${nextId++}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "image",
      setActiveTab: (tab) => set({ activeTab: tab }),
      availableUpdate: null,
      setAvailableUpdate: (update) => set({ availableUpdate: update }),

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
        const defaultLevels: Record<CompressionMode, number> = {
          quality: 1, balanced: 3, size: 6, advanced: 3, target: 3,
        };
        set({ mode, level: defaultLevels[mode] });
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
      partialize: (state) => ({
        // 只持久化这些字段，排除 activeTab 和 items
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
        autoCopyAfterCompression: state.autoCopyAfterCompression,
        skipCompressedFiles: state.skipCompressedFiles,
        appearanceMode: state.appearanceMode,
        themeColor: state.themeColor,
        languageMode: state.languageMode,
        autoCheckUpdates: state.autoCheckUpdates,
        closeToTray: state.closeToTray,
        globalAutomationEnabled: state.globalAutomationEnabled,
        folderRules: state.folderRules,
        errorRecords: state.errorRecords,
        totalSaved: state.totalSaved,
        totalCount: state.totalCount,
      }),
    }
  )
);
