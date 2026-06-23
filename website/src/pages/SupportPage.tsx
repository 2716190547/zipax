import { Bug, Code } from "@gravity-ui/icons";
import { Card, Link } from "@heroui/react";
import { SectionHeader } from "../components/SectionHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { type messages } from "../i18n/messages";

export function SupportPage({ t }: { t: ReturnType<typeof messages> }) {
  return (
    <section className="page-section support-layout">
      <SectionHeader title={t.supportTitle} description={t.supportLead} level={1} />
      <SectionReveal as="div" className="support-grid" delay={0.04}>
        <Link className="card-link" href="https://github.com/2716190547/zipax/issues" target="_blank" rel="noreferrer">
          <Card className="support-card" variant="default">
            <Card.Header><Bug width={24} height={24} /></Card.Header>
            <Card.Content><Card.Title>{t.issuesTitle}</Card.Title><Card.Description>{t.issuesDescription}</Card.Description></Card.Content>
            <Card.Footer><Link.Icon /></Card.Footer>
          </Card>
        </Link>
        <Link className="card-link" href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">
          <Card className="support-card" variant="default">
            <Card.Header><Code width={24} height={24} /></Card.Header>
            <Card.Content><Card.Title>{t.repositoryTitle}</Card.Title><Card.Description>{t.repositoryDescription}</Card.Description></Card.Content>
            <Card.Footer><Link.Icon /></Card.Footer>
          </Card>
        </Link>
      </SectionReveal>
    </section>
  );
}
