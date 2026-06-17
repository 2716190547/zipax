import { ReactNode } from "react";
import { Card, Tooltip } from "@heroui/react";
import { Info } from "@/components/icons";

/**
 * SettingsCard — 通用设置卡片
 */
export function SettingsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={`zipax-card ${className}`}
    >
      <Card.Content className="settings-card-body">{children}</Card.Content>
    </Card>
  );
}

/**
 * SettingTitle — 设置行标题
 *
 * icon: Lucide 图标组件 (如 <Power size={16} />)
 */
export function SettingTitle({
  icon,
  title,
  info,
}: {
  icon?: ReactNode;
  title: string;
  info?: string;
}) {
  return (
    <div className="setting-title">
      {icon && <span className="setting-icon">{icon}</span>}
      <span className="setting-title-text">{title}</span>
      {info && (
        <Tooltip>
          <Tooltip.Trigger>
            <span className="setting-info-button">
              <Info size={17} strokeWidth={1.9} />
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content placement="top">{info}</Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * SettingRow — 设置行 (标题 + 右侧控件)
 */
export function SettingRow({
  title,
  info,
  icon,
  children,
}: {
  title: string;
  info?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="setting-row">
      <SettingTitle icon={icon} title={title} info={info} />
      {children}
    </div>
  );
}

/**
 * StatCard — 统计数字卡片
 */
export function StatCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <div className="stat-value-row">
        <span className="stat-value">{value}</span>
        {unit && (
          <span className="text-xs font-medium text-default-500">{unit}</span>
        )}
      </div>
    </div>
  );
}
