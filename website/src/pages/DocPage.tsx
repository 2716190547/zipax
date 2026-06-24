import { Breadcrumbs, Card, Chip, Link, Typography } from "@heroui/react";
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
          {doc.troubleshooting && doc.troubleshooting.length > 0 && (
            <section className="doc-troubleshooting" aria-labelledby="troubleshooting-title">
              <div className="doc-troubleshooting-heading">
                <Typography.Heading id="troubleshooting-title" className="section-title" level={2}>{t.troubleshooting}</Typography.Heading>
                <Typography.Paragraph>{t.troubleshootingLead}</Typography.Paragraph>
              </div>
              <div className="troubleshooting-list">
                {doc.troubleshooting.map((item, index) => (
                  <Card className="troubleshooting-item" key={item.title} variant="secondary">
                    <Card.Header className="troubleshooting-item-header">
                      <Chip size="sm" variant="secondary">{String(index + 1).padStart(2, "0")}</Chip>
                      <div>
                        <Card.Title>{item.title}</Card.Title>
                        <Card.Description>{item.summary}</Card.Description>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <div className="troubleshooting-columns">
                        <div>
                          <Typography.Heading level={3}>{t.possibleCauses}</Typography.Heading>
                          <ul>{item.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul>
                        </div>
                        <div>
                          <Typography.Heading level={3}>{t.recommendedSteps}</Typography.Heading>
                          <ol>{item.solutions.map((solution) => <li key={solution}>{solution}</li>)}</ol>
                        </div>
                      </div>
                      {item.commands && item.commands.length > 0 && (
                        <div className="troubleshooting-commands">
                          <Typography.Heading level={3}>{t.diagnosticCommands}</Typography.Heading>
                          {item.commands.map((command) => (
                            <figure className="doc-code-block" key={command.label}>
                              <figcaption>{command.label}</figcaption>
                              <pre><code>{command.code}</code></pre>
                            </figure>
                          ))}
                        </div>
                      )}
                      {item.warning && <aside className="doc-warning" aria-label={t.safetyNote}><strong>{t.safetyNote}</strong><p>{item.warning}</p></aside>}
                      {item.sources && item.sources.length > 0 && (
                        <div className="doc-sources">
                          <strong>{t.officialReferences}</strong>
                          {item.sources.map((source) => <Link key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<Link.Icon /></Link>)}
                        </div>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </section>
          )}
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
