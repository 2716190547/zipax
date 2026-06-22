import { ArrowDownToLine } from "@gravity-ui/icons";
import { Card, Chip, Link } from "@heroui/react";
import { SectionHeader } from "../components/SectionHeader";
import { downloads, release } from "../data/downloads";
import { type messages } from "../i18n/messages";
import type { Platform } from "../lib/platform";

type DownloadPageProps = {
  t: ReturnType<typeof messages>;
  platform: Platform;
  recommended?: { href: string; label: string; detail: string; size: string };
};

export function DownloadPage({ t, platform, recommended }: DownloadPageProps) {
  return (
    <section className="page-section">
      <SectionHeader
        title={t.downloadTitle}
        description={t.downloadLead}
        level={1}
        meta={<Chip size="sm" variant="secondary">v{release.version}</Chip>}
      />
      {recommended && (
        <Link className="card-link" href={recommended.href}>
          <Card className="recommended-card" variant="tertiary">
            <Card.Header><Chip size="sm">{t.recommended} · {platform}</Chip></Card.Header>
            <Card.Content>
              <Card.Title>{recommended.label}</Card.Title>
              <Card.Description>{recommended.detail} · {recommended.size}</Card.Description>
            </Card.Content>
            <Card.Footer><span>{t.downloadFor} {recommended.label}</span><ArrowDownToLine width={18} height={18} /></Card.Footer>
          </Card>
        </Link>
      )}
      <SectionHeader title={t.allPackages} className="subhead" />
      <div className="download-grid">
        {downloads.map((item) => (
          <Link className="card-link" href={item.href} key={item.href}>
            <Card className="download-card" variant="default">
              <Card.Header><Chip size="sm" variant="secondary">{item.platform}</Chip></Card.Header>
              <Card.Content>
                <Card.Title>{item.label}</Card.Title>
                <Card.Description>{item.detail} · {item.size}</Card.Description>
              </Card.Content>
              <Card.Footer><ArrowDownToLine width={18} height={18} /></Card.Footer>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
