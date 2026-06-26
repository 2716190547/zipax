import { Typography } from "@heroui/react";
import type { ReactNode } from "react";
import { TextReveal } from "./motion/TextReveal";

type PageHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, meta, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header-copy">
        <TextReveal className="page-title-reveal">
          <Typography.Heading className="page-title" level={1}>{title}</Typography.Heading>
        </TextReveal>
        {description && (
          <TextReveal className="page-lead-reveal" delay={0.05}>
            <Typography.Paragraph className="page-lead">{description}</Typography.Paragraph>
          </TextReveal>
        )}
      </div>
      {(meta || actions) && (
        <div className="page-header-aside">
          {meta && <div className="page-header-meta">{meta}</div>}
          {actions && <div className="page-header-actions">{actions}</div>}
        </div>
      )}
    </header>
  );
}
