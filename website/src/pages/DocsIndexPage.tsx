import { Card, Chip, Link } from "@heroui/react";
import { SectionHeader } from "../components/SectionHeader";
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
      <div className="docs-card-grid">
        {items.map((item, index) => (
          <Link className="card-link" href={`#/docs/${item.slug}`} key={item.slug}>
            <Card className="doc-card" variant="default">
              <Card.Header><Chip size="sm" variant="secondary">{String(index + 1).padStart(2, "0")}</Chip></Card.Header>
              <Card.Content>
                <Card.Title>{item.title}</Card.Title>
                <Card.Description>{item.body}</Card.Description>
              </Card.Content>
              <Card.Footer><Link.Icon /></Card.Footer>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
