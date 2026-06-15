import type { ReactNode } from "react";
import { Card, Tooltip } from "@heroui/react";
import { Info } from "@/components/icons";

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <Card className="config-panel">
      <Card.Content className="config-panel-content">{children}</Card.Content>
    </Card>
  );
}

export function ConfigCard({
  icon,
  title,
  info,
  unit,
  titleAccessory,
  infoSize,
  value,
  note,
  action,
  variant = "default",
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
  variant?: "default" | "embedded";
  className?: string;
  children: ReactNode;
}) {
  const cardClassName = [
    variant === "embedded" ? "config-section is-embedded" : "config-section",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Card className={cardClassName}>
      <Card.Content className="config-section-content">
        <div className="config-section-header">
          <ConfigTitle icon={icon} title={title} info={info} unit={unit} accessory={titleAccessory} infoSize={infoSize} />
          {value != null && <span className="config-section-value">{value}</span>}
          {value == null && note != null && <span className="config-muted-note">{note}</span>}
          {value == null && note == null && action != null && action}
        </div>
        {children}
      </Card.Content>
    </Card>
  );
}

export function ConfigSection({
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
  return (
    <section className={className ? `config-panel-section ${className}` : "config-panel-section"}>
      <div className="config-section-header">
        <ConfigTitle icon={icon} title={title} info={info} unit={unit} accessory={titleAccessory} infoSize={infoSize} />
        {value != null && <span className="config-section-value">{value}</span>}
        {value == null && note != null && <span className="config-muted-note">{note}</span>}
        {value == null && note == null && action != null && action}
      </div>
      {children}
    </section>
  );
}

export function ConfigTitle({
  icon,
  title,
  info,
  unit,
  accessory,
  subtle = false,
  infoSize = "sm",
}: {
  icon: ReactNode;
  title: string;
  info?: string;
  unit?: string;
  accessory?: ReactNode;
  subtle?: boolean;
  infoSize?: "sm" | "md";
}) {
  return (
    <div className={subtle ? "config-section-heading is-subtle" : "config-section-heading"}>
      {icon}
      <span>{title}</span>
      {accessory}
      {unit && <span className="config-section-unit">{unit}</span>}
      {info && (
        <Tooltip>
          <Tooltip.Trigger>
            <span className={infoSize === "sm" ? "config-info-button is-sm" : "config-info-button"} data-info-size={infoSize}>
              <Info size={infoSize === "sm" ? 11 : 13} strokeWidth={2} />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content placement="top">{info}</Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
}

export function ConfigRow({
  label,
  title,
  icon,
  info,
  children,
}: {
  label?: string;
  title?: string;
  icon?: ReactNode;
  info?: string;
  children: ReactNode;
}) {
  return (
    <div className="config-row">
      {title ? (
        <ConfigTitle icon={icon} title={title} info={info} subtle />
      ) : (
        <span className="config-label">{label}</span>
      )}
      {children}
    </div>
  );
}

export function ConfigFieldRow({
  label,
  description,
  stacked = false,
  control = "auto",
  children,
}: {
  label: string;
  description?: ReactNode;
  stacked?: boolean;
  control?: "auto" | "select" | "wide";
  children: ReactNode;
}) {
  const controlClassName = [
    "config-field-control",
    stacked ? "is-stacked" : "",
    `is-${control}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={stacked ? "config-field-row is-stacked" : "config-field-row"}>
      <span className="config-field-label">{label}</span>
      <div className={controlClassName}>
        {children}
        {description && <p className="config-help-text">{description}</p>}
      </div>
    </div>
  );
}
