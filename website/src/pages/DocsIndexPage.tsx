import { Link, Typography } from "@heroui/react";
import { ArrowRight } from "@gravity-ui/icons";
import { SectionHeader } from "../components/SectionHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { docsForLocale } from "../data/docs";
import { type Locale, type messages } from "../i18n/messages";

type DocsIndexPageProps = {
  t: ReturnType<typeof messages>;
  locale: Locale;
};

export function DocsIndexPage({ t, locale }: DocsIndexPageProps) {
  const items = docsForLocale(locale);

  return (
    <section className="page-section docs-index">
      <SectionHeader title={t.docsTitle} description={t.docsLead} level={1} />
      <SectionReveal as="div" className="docs-list" delay={0.04}>
        {items.map((item, index) => (
          <Link className="docs-list-item" href={`#/docs/${item.slug}`} key={item.slug}>
            <span className="docs-list-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="docs-list-copy">
              <Typography.Heading level={3}>{item.title}</Typography.Heading>
              <Typography.Paragraph>{item.body}</Typography.Paragraph>
            </span>
            <ArrowRight className="docs-list-arrow" width={18} height={18} aria-hidden="true" />
          </Link>
        ))}
      </SectionReveal>
    </section>
  );
}
