import {
  ArrowDownToLine,
  LogoDebian,
  LogoGithub,
  LogoLinux,
  LogoMacos,
  LogoWindows,
} from "@gravity-ui/icons";
import { Chip, Link, Typography, buttonVariants } from "@heroui/react";
import type { ComponentType, SVGProps } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { downloads, release, type DownloadItem } from "../data/downloads";
import { type messages } from "../i18n/messages";
import type { Platform } from "../lib/platform";

type DownloadPageProps = {
  t: ReturnType<typeof messages>;
  platform: Platform;
  recommended?: { href: string; label: string; detail: string; size: string };
};

type PlatformIcon = ComponentType<SVGProps<SVGSVGElement>>;

function iconForDownload(item: Pick<DownloadItem, "platform" | "label">): PlatformIcon {
  if (item.platform === "macos") return LogoMacos;
  if (item.platform === "windows") return LogoWindows;
  if (item.platform === "source") return LogoGithub;
  if (item.label.toLowerCase().includes("deb")) return LogoDebian;
  return LogoLinux;
}

function DownloadIcon({ item }: { item: Pick<DownloadItem, "platform" | "label"> }) {
  const Glyph = iconForDownload(item);
  return <Glyph width={26} height={26} aria-hidden="true" />;
}

function platformLabel(platform: DownloadItem["platform"]) {
  return { macos: "macOS", windows: "Windows", linux: "Linux", source: "GitHub" }[platform];
}

export function DownloadPage({ t, recommended }: DownloadPageProps) {
  const recommendedItem = downloads.find((item) => item.href === recommended?.href);

  return (
    <section className="page-section download-page">
      <SectionHeader
        title={t.downloadTitle}
        description={t.downloadLead}
        level={1}
        meta={<Chip size="sm" variant="secondary">v{release.version}</Chip>}
      />

      {recommended && recommendedItem && (
        <SectionReveal className="download-recommended" aria-label={t.recommended}>
          <span className="download-platform-icon download-platform-icon-featured">
            <DownloadIcon item={recommendedItem} />
          </span>
          <div className="download-recommended-copy">
            <Typography.Heading level={2}>{recommended.label}</Typography.Heading>
            <Chip size="sm" variant="secondary">{t.recommended} · {platformLabel(recommendedItem.platform)}</Chip>
            <Typography.Paragraph>{recommended.detail} · {recommended.size}</Typography.Paragraph>
          </div>
          <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended.href}>
            {t.downloadLabel}<ArrowDownToLine width={18} height={18} />
          </Link>
        </SectionReveal>
      )}

      <SectionHeader title={t.allPackages} className="subhead" />
      <SectionReveal as="div" className="download-grid" delay={0.04}>
        {downloads.map((item) => (
          <Link className="download-item" href={item.href} key={item.href}>
            <span className="download-platform-icon"><DownloadIcon item={item} /></span>
            <span className="download-item-copy">
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
            <span className="download-item-size">{item.size}</span>
            <ArrowDownToLine className="download-item-arrow" width={18} height={18} aria-hidden="true" />
          </Link>
        ))}
      </SectionReveal>
    </section>
  );
}
