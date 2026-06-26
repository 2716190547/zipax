import { DocCard } from "../components/cards";
import { PageHeader } from "../components/PageHeader";
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
      <PageHeader title={t.docsTitle} description={t.docsLead} />
      <SectionReveal as="div" className="docs-list" delay={0.04}>
        {items.map((item, index) => (
          <DocCard
            href={`#/docs/${item.slug}`}
            index={String(index + 1).padStart(2, "0")}
            title={item.title}
            description={item.body}
            key={item.slug}
          />
        ))}
      </SectionReveal>
    </section>
  );
}
