import { Typography } from "@heroui/react";
import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  level?: 1 | 2;
  meta?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, level = 2, meta, className = "" }: SectionHeaderProps) {
  return (
    <div className={`section-heading ${className}`.trim()}>
      <Typography.Heading className={level === 1 ? "page-title" : "section-title"} level={level}>
        {title}
      </Typography.Heading>
      {description && <Typography.Paragraph className="section-description">{description}</Typography.Paragraph>}
      {meta && <div className="section-meta">{meta}</div>}
    </div>
  );
}
