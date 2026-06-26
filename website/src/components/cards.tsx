import { ArrowRight } from "@gravity-ui/icons";
import { Link, Typography } from "@heroui/react";
import type { ReactNode } from "react";

type ActionCardProps = {
  href: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  icon?: ReactNode;
  arrow?: ReactNode;
  external?: boolean;
  className?: string;
};

export function IconFrame({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return <span className={`icon-frame ${featured ? "icon-frame-featured" : ""}`.trim()}>{children}</span>;
}

export function ActionCard({ href, title, description, meta, icon, arrow, external = false, className = "" }: ActionCardProps) {
  return (
    <Link className={`action-card ${className}`.trim()} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {icon && <IconFrame>{icon}</IconFrame>}
      <span className="action-card-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {meta && <span className="action-card-meta">{meta}</span>}
      <span className="action-card-arrow" aria-hidden="true">{arrow ?? <ArrowRight width={18} height={18} />}</span>
    </Link>
  );
}

type FeaturedCardProps = {
  icon?: ReactNode;
  title: string;
  eyebrow?: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function FeaturedCard({ icon, title, eyebrow, description, action, className = "" }: FeaturedCardProps) {
  return (
    <article className={`featured-card ${className}`.trim()}>
      {icon && <IconFrame featured>{icon}</IconFrame>}
      <div className="featured-card-copy">
        {eyebrow && <div className="featured-card-eyebrow">{eyebrow}</div>}
        <Typography.Heading level={2}>{title}</Typography.Heading>
        {description && <Typography.Paragraph>{description}</Typography.Paragraph>}
      </div>
      {action && <div className="featured-card-action">{action}</div>}
    </article>
  );
}

type DocCardProps = {
  href: string;
  index?: string;
  title: string;
  description?: string;
};

export function DocCard({ href, index, title, description }: DocCardProps) {
  return (
    <Link className="doc-card" href={href}>
      {index && <span className="doc-card-index">{index}</span>}
      <span className="doc-card-copy">
        <Typography.Heading level={3}>{title}</Typography.Heading>
        {description && <Typography.Paragraph>{description}</Typography.Paragraph>}
      </span>
      <ArrowRight className="doc-card-arrow" width={18} height={18} aria-hidden="true" />
    </Link>
  );
}
