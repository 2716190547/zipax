import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import type { CompressionMode, OutputFormat } from "@/store/app";
import { compressionDefaultLevels } from "@/store/utils";
import { Crop, Download, SlidersVertical } from "@/components/icons";
import { ConfigFieldRow, QualitySlider, SegmentTabs } from "@/components/ui";
import { HeroSelect, HeroSwitch } from "@/components/ui";
import {
  CompressionEditorDivider,
  CompressionEditorSection,
  DimensionFieldRow,
  type CompressionEditorLayout,
} from "./CompressionSettingsEditorParts";

export interface CompressionSettingsEditorValue {
  mode: CompressionMode;
  format: OutputFormat;
  level: number;
  targetSizeKB?: number;
  targetSizePercent?: number;
  overwrite: boolean;
  preserveMetadata: boolean;
  maxWidth?: number;
  maxHeight?: number;
  allowUpscale: boolean;
}

interface CompressionSettingsEditorProps {
  value: CompressionSettingsEditorValue;
  onChange: (patch: Partial<CompressionSettingsEditorValue>) => void;
  compact?: boolean;
  embedded?: boolean;
  layout?: CompressionEditorLayout;
}

export function CompressionSettingsEditor({
  value,
  onChange,
  compact = false,
  embedded = false,
  layout = "cards",
}: CompressionSettingsEditorProps) {
  const { t } = useI18n();
  const hasResizeLimit = !!(value.maxWidth || value.maxHeight);
  const isPdfExport = value.format === "pdf";
  const [resizeExpanded, setResizeExpanded] = useState(hasResizeLimit);
  useEffect(() => {
    if (hasResizeLimit) setResizeExpanded(true);
  }, [hasResizeLimit]);
  useEffect(() => {
    if (isPdfExport && value.overwrite) {
      onChange({ overwrite: false });
    }
  }, [isPdfExport, value.overwrite, onChange]);

  const targetSizePercent = value.targetSizePercent ?? 60;
  const compressionValue = value.mode === "target" ? `${targetSizePercent}%` : value.level;
  const editorClassName = [
    "compression-editor",
    compact ? "is-compact" : "",
    embedded ? "is-embedded" : "",
  ].filter(Boolean).join(" ");
  const cardVariant = embedded ? "embedded" : "default";
  const modeOptions: { key: CompressionMode; label: string; shortLabel: string }[] = [
    { key: "quality", label: t("compression.mode.quality"), shortLabel: t("compression.mode.qualityShort") },
    { key: "balanced", label: t("compression.mode.balanced"), shortLabel: t("compression.mode.balancedShort") },
    { key: "size", label: t("compression.mode.size"), shortLabel: t("compression.mode.sizeShort") },
    { key: "advanced", label: t("compression.mode.advanced"), shortLabel: t("compression.mode.advancedShort") },
    { key: "target", label: t("compression.mode.target"), shortLabel: t("compression.mode.targetShort") },
  ];
  const formatOptions: { key: OutputFormat; label: string }[] = [
    { key: "original", label: t("compression.format.original") },
    { key: "jpeg", label: "JPEG" },
    { key: "png", label: "PNG" },
    { key: "webp", label: "WebP" },
    { key: "avif", label: "AVIF" },
    { key: "heic", label: "HEIC" },
    { key: "pdf", label: "PDF" },
  ];

  const setMode = (mode: CompressionMode) => {
    onChange({ mode, level: compressionDefaultLevels[mode] });
  };

  const setResizeEnabled = (enabled: boolean) => {
    setResizeExpanded(enabled);
    if (!enabled) {
      onChange({ maxWidth: undefined, maxHeight: undefined, allowUpscale: false });
    }
  };

  const setFormat = (format: OutputFormat) => {
    onChange(format === "pdf" ? { format, overwrite: false } : { format });
  };

  return (
    <div className={editorClassName}>
      <CompressionEditorSection
        layout={layout}
        cardVariant={cardVariant}
        icon={<SlidersVertical size={16} strokeWidth={1.9} />}
        title={t("compression.target")}
        info={t("compression.targetInfo")}
        value={<span className="compression-target-value">{compressionValue}</span>}
        className="compression-target-section"
      >
          <>
            <SegmentTabs
              ariaLabel={t("compression.mode")}
              selectedKey={value.mode}
              options={modeOptions}
              onChange={setMode}
              className="config-tabs compression-target-tabs"
              listClassName="config-tabs-list compression-target-tabs-list"
            />

            {value.mode !== "target" ? (
              <div className="config-control-wide compression-target-slider">
                <QualitySlider
                  value={value.level}
                  onChange={(level) => onChange({ level })}
                  disabled={value.mode !== "advanced"}
                  showTooltip
                  showValue={false}
                  showTitle={false}
                />
              </div>
            ) : (
              <div className="config-control-wide compression-target-slider">
                <QualitySlider
                  minValue={10}
                  maxValue={95}
                  step={5}
                  minLabel={t("compression.smallerSize")}
                  maxLabel={t("compression.steadierQuality")}
                  value={targetSizePercent}
                  valueLabel={`${targetSizePercent}%`}
                  onChange={(targetSizePercent) => onChange({ targetSizePercent })}
                  showTooltip
                  showValue={false}
                  showTitle={false}
                />
              </div>
            )}
          </>
      </CompressionEditorSection>
      <CompressionEditorDivider layout={layout} name="compression-output" />

      <CompressionEditorSection
        layout={layout}
        cardVariant={cardVariant}
        icon={<Download size={16} strokeWidth={1.9} />}
        title={t("compression.outputRules")}
        note={isPdfExport ? t("compression.exportPdf") : value.overwrite ? t("compression.replaceOriginalNote") : t("compression.outputNewFile")}
      >
          <>
            <ConfigFieldRow label={t("compression.overwriteOriginal")} control="auto">
              <HeroSwitch
                size="sm"
                isSelected={!isPdfExport && value.overwrite}
                isDisabled={isPdfExport}
                onChange={(overwrite) => onChange({ overwrite })}
              />
            </ConfigFieldRow>
            <ConfigFieldRow label={t("compression.format")} control="select">
              <HeroSelect
                ariaLabel={t("compression.outputFormat")}
                value={value.format}
                onChange={setFormat}
                options={formatOptions}
                className="config-select-inline"
                compact
              />
            </ConfigFieldRow>
            <ConfigFieldRow label={t("compression.preserveMetadata")} control="auto">
              <HeroSwitch
                size="sm"
                isSelected={value.preserveMetadata}
                onChange={(preserveMetadata) => onChange({ preserveMetadata })}
              />
            </ConfigFieldRow>
          </>
      </CompressionEditorSection>
      <CompressionEditorDivider layout={layout} name="output-resize" />

      <CompressionEditorSection
        layout={layout}
        cardVariant={cardVariant}
        icon={<Crop size={16} strokeWidth={1.9} />}
        title={t("compression.resize")}
        info={t("compression.resizeInfo")}
        action={
          <HeroSwitch
            size="sm"
            isSelected={resizeExpanded}
            onChange={setResizeEnabled}
          />
        }
      >
          <>
            {resizeExpanded && (
              <DimensionFieldRow
                maxWidth={value.maxWidth}
                maxHeight={value.maxHeight}
                disabled={!resizeExpanded}
                onChange={onChange}
              />
            )}
          </>
      </CompressionEditorSection>
    </div>
  );
}
