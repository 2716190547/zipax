import { Breadcrumbs, Card, Link, Typography } from "@heroui/react";
import { docForSlug, docsForLocale, type DocSlug } from "../data/docs";
import { type Locale, type messages } from "../i18n/messages";

type DocPageProps = {
  t: ReturnType<typeof messages>;
  locale: Locale;
  slug: DocSlug;
};

export function DocPage({ t, locale, slug }: DocPageProps) {
  const items = docsForLocale(locale);
  const doc = docForSlug(locale, slug) ?? items[0];
  const currentIndex = items.findIndex((item) => item.slug === doc.slug);
  const previous = currentIndex > 0 ? items[currentIndex - 1] : undefined;
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : undefined;

  return (
    <section className="page-section doc-page">
      <Card className="doc-sidebar" aria-label={t.docsTitle}>
        <Card.Content>
          <Card.Title>{t.docsTitle}</Card.Title>
          <nav>
            {items.map((item) => (
              <Link className={item.slug === doc.slug ? "active" : ""} href={`#/docs/${item.slug}`} key={item.slug}>
                {item.title}
              </Link>
            ))}
          </nav>
        </Card.Content>
      </Card>
      <Card className="doc-article">
        <Card.Content>
          <Breadcrumbs className="doc-breadcrumbs">
            <Breadcrumbs.Item href="#/docs">{t.docsTitle}</Breadcrumbs.Item>
            <Breadcrumbs.Item>{doc.title}</Breadcrumbs.Item>
          </Breadcrumbs>
          <Typography.Heading className="page-title" level={1}>{doc.title}</Typography.Heading>
          <Typography.Paragraph className="doc-lead">{doc.body}</Typography.Paragraph>
          <ol className="doc-steps">
            {doc.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          {doc.faq && doc.faq.length > 0 && (
            <div className="doc-faq">
              <Typography.Heading className="section-title" level={2}>{t.faq}</Typography.Heading>
              <div className="faq-list">
                {doc.faq.map((item) => (
                  <Card className="faq-item" key={item.question} variant="secondary">
                    <Card.Header><Card.Title className="faq-question">{item.question}</Card.Title></Card.Header>
                    <Card.Content><Card.Description className="faq-answer">{item.answer}</Card.Description></Card.Content>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <nav className="doc-pagination" aria-label={t.docsTitle}>
            {previous ? <Link href={`#/docs/${previous.slug}`}><span>{t.previousDoc}</span><strong>{previous.title}</strong></Link> : <span />}
            {next ? <Link href={`#/docs/${next.slug}`}><span>{t.nextDoc}</span><strong>{next.title}</strong></Link> : <span />}
          </nav>
        </Card.Content>
      </Card>
    </section>
  );
}
