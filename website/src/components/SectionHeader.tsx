import { Typography } from "@heroui/react";
import type { ReactNode } from "react";
import { TextReveal } from "./motion/TextReveal";

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
      <div className="section-heading-main">
        <TextReveal className="section-title-reveal">
          <Typography.Heading className={level === 1 ? "page-title" : "section-title"} level={level}>
            {title}
          </Typography.Heading>
        </TextReveal>
        {meta && <div className="section-meta">{meta}</div>}
      </div>
      {description && (
        <TextReveal className="section-description-reveal" delay={0.05}>
          <Typography.Paragraph className="section-description">{description}</Typography.Paragraph>
        </TextReveal>
      )}
    </div>
  );
}
