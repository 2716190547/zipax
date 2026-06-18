import { Input, Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import { ConfigCard, ConfigSection } from "@/components/ui";
import type { CompressionSettingsEditorValue } from "./CompressionSettingsEditor";

export type CompressionEditorLayout = "cards" | "panel";

export function DimensionFieldRow({
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
  const { t } = useI18n();
  return (
    <div className="dimension-field-row">
      <div className="dimension-field-stack">
        <div className="dimension-fields-control">
          <div className="dimension-input-wrap">
            <Input
              type="text"
              inputMode="numeric"
              aria-label={t("compression.maxWidth")}
              placeholder={t("compression.width")}
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
              aria-label={t("compression.maxHeight")}
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

export function CompressionEditorDivider({
  layout,
  name,
}: {
  layout: CompressionEditorLayout;
  name: string;
}) {
  return layout === "panel" ? <Separator className="config-divider" data-section={name} /> : null;
}

export function CompressionEditorSection({
  layout,
  cardVariant,
  icon,
  title,
  info,
  unit,
  titleAccessory,
  infoSize,
  value,
  note,
  action,
  className,
  children,
}: {
  layout: CompressionEditorLayout;
  cardVariant: "default" | "embedded";
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
}) {
  const sectionProps = {
    icon,
    title,
    info,
    unit,
    titleAccessory,
    infoSize,
    value,
    note,
    action,
    className,
  };

  return layout === "panel" ? (
    <ConfigSection {...sectionProps}>{children}</ConfigSection>
  ) : (
    <ConfigCard variant={cardVariant} {...sectionProps}>{children}</ConfigCard>
  );
}
