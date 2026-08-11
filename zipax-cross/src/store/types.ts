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

export interface ReadyUpdate {
  currentVersion: string;
  latestVersion: string;
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

export type NewCompressionItem = Omit<CompressionItem, "id" | "status"> & {
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

export interface AppState {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  readyUpdate: ReadyUpdate | null;
  setReadyUpdate: (update: ReadyUpdate | null) => void;

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

  folderRules: FolderRule[];
  addFolderRule: (rule: Omit<FolderRule, "id">) => void;
  updateFolderRule: (id: string, patch: Partial<FolderRule>) => void;
  removeFolderRule: (id: string) => void;
  ensureUniqueFolderRuleIds: () => void;

  items: CompressionItem[];
  addItem: (item: NewCompressionItem) => string;
  removeItem: (id: string) => void;
  clearItems: () => void;
  updateItem: (id: string, patch: Partial<CompressionItem>) => void;

  errorRecords: ErrorRecord[];
  addErrorRecord: (record: Omit<ErrorRecord, "id">) => void;
  clearErrorRecords: () => void;

  totalSaved: number;
  totalCount: number;
  recordCompression: (savedBytes: number) => void;
  clearStats: () => void;
}
