import { Input, Separator } from "@heroui/react";
import { useEffect, useState, type ReactNode } from "react";
import type { CompressionMode, OutputFormat } from "@/store/app";
import { Crop, Download, SlidersVertical } from "@/components/icons";
import { ConfigCard, ConfigFieldRow, ConfigSection, QualitySlider, SegmentTabs } from "@/components/ui";
import { HeroSelect, HeroSwitch } from "@/components/ui";

const modeOptions: { key: CompressionMode; label: string; shortLabel: string }[] = [
  { key: "quality", label: "高清优先", shortLabel: "高清" },
  { key: "balanced", label: "平衡", shortLabel: "平衡" },
  { key: "size", label: "体积优先", shortLabel: "体积" },
  { key: "advanced", label: "高级", shortLabel: "高级" },
  { key: "target", label: "目标大小", shortLabel: "目标" },
];

const formatOptions: { key: OutputFormat; label: string }[] = [
  { key: "original", label: "原格式" },
  { key: "jpeg", label: "JPEG" },
  { key: "png", label: "PNG" },
  { key: "webp", label: "WebP" },
  { key: "avif", label: "AVIF" },
  { key: "heic", label: "HEIC" },
  { key: "pdf", label: "PDF" },
];

function DimensionFieldRow({
  maxWidth,
  maxHeight,
  disabled,
  onChange,
}: {
  maxWidth?: number;
  maxHeight?: number;
  disabled?: boolean;
  onChange: (patch: Pick<Partial<CompressionSettingsEditorValue>, "maxWidth" | "maxHeight">) => void;
}) {
  return (
    <div className="dimension-field-row">
      <div className="dimension-field-stack">
        <div className="dimension-fields-control">
          <div className="dimension-input-wrap">
            <Input
              type="text"
              inputMode="numeric"
              aria-label="最大宽度"
              placeholder="宽度"
              value={maxWidth != null ? String(maxWidth) : ""}
              onChange={(event) => onChange({
                maxWidth: event.target.value ? Number(event.target.value) : undefined,
              })}
              disabled={disabled}
              variant="secondary"
              className="dimension-input"
            />
            <span className="dimension-input-unit">px</span>
          </div>
          <span className="dimension-separator">×</span>
          <div className="dimension-input-wrap">
            <Input
              type="text"
              inputMode="numeric"
              aria-label="最大高度"
              placeholder=""
              value={maxHeight != null ? String(maxHeight) : ""}
              onChange={(event) => onChange({
                maxHeight: event.target.value ? Number(event.target.value) : undefined,
              })}
              disabled={disabled}
              variant="secondary"
              className="dimension-input"
            />
            <span className="dimension-input-unit">px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  layout?: "cards" | "panel";
}

export function CompressionSettingsEditor({
  value,
  onChange,
  compact = false,
  embedded = false,
  layout = "cards",
}: CompressionSettingsEditorProps) {
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

  const renderSection = ({
    icon,
    title,
    info,
    unit,
    titleAccessory,
    infoSize,
    value: sectionValue,
    note,
    action,
    className,
    children,
  }: {
    icon: ReactNode;
    title: string;
    info?: string;
    unit?: string;
    titleAccessory?: ReactNode;
    infoSize?: "sm" | "md";
    value?: ReactNode;
    note?: ReactNode;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
  }) => (
    layout === "panel" ? (
      <ConfigSection
        icon={icon}
        title={title}
        info={info}
        unit={unit}
        titleAccessory={titleAccessory}
        infoSize={infoSize}
        value={sectionValue}
        note={note}
        action={action}
        className={className}
      >
        {children}
      </ConfigSection>
    ) : (
      <ConfigCard
        variant={cardVariant}
        icon={icon}
        title={title}
        info={info}
        unit={unit}
        titleAccessory={titleAccessory}
        infoSize={infoSize}
        value={sectionValue}
        note={note}
        action={action}
        className={className}
      >
        {children}
      </ConfigCard>
    )
  );
  const renderDivider = (key: string) => (
    layout === "panel" ? <Separator key={key} className="config-divider" /> : null
  );

  const setMode = (mode: CompressionMode) => {
    const defaultLevels: Record<CompressionMode, number> = {
      quality: 1,
      balanced: 3,
      size: 6,
      advanced: 3,
      target: 3,
    };
    onChange({ mode, level: defaultLevels[mode] });
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
      {renderSection({
        icon: <SlidersVertical size={16} strokeWidth={1.9} />,
        title: "压缩目标",
        info: "选择预设模式，或在高级模式下手动调整质量等级。",
        value: <span className="compression-target-value">{compressionValue}</span>,
        className: "compression-target-section",
        children: (
          <>
            <SegmentTabs
              ariaLabel="压缩模式"
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
                  minLabel="体积更小"
                  maxLabel="质量更稳"
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
        ),
      })}
      {renderDivider("compression-output-divider")}

      {renderSection({
        icon: <Download size={16} strokeWidth={1.9} />,
        title: "输出规则",
        note: isPdfExport ? "图片将导出为 PDF" : value.overwrite ? "当前设置将替换原图" : "输出新文件",
        children: (
          <>
            <ConfigFieldRow label="替换原图" control="auto">
              <HeroSwitch
                size="sm"
                isSelected={!isPdfExport && value.overwrite}
                isDisabled={isPdfExport}
                onChange={(overwrite) => onChange({ overwrite })}
              />
            </ConfigFieldRow>
            <ConfigFieldRow label="格式" control="select">
              <HeroSelect
                ariaLabel="输出格式"
                value={value.format}
                onChange={setFormat}
                options={formatOptions}
                className="config-select-inline"
                compact
              />
            </ConfigFieldRow>
            <ConfigFieldRow label="保留元数据" control="auto">
              <HeroSwitch
                size="sm"
                isSelected={value.preserveMetadata}
                onChange={(preserveMetadata) => onChange({ preserveMetadata })}
              />
            </ConfigFieldRow>
          </>
        ),
      })}
      {renderDivider("output-resize-divider")}

      {renderSection({
        icon: <Crop size={16} strokeWidth={1.9} />,
        title: "尺寸约束",
        info: "最大尺寸按像素限制输出宽高；高度留空则按比例缩放。",
        action: (
          <HeroSwitch
            size="sm"
            isSelected={resizeExpanded}
            onChange={setResizeEnabled}
          />
        ),
        children: (
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
        ),
      })}
    </div>
  );
}
