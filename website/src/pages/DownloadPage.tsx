import {
  ArrowDownToLine,
  LogoDebian,
  LogoGithub,
  LogoLinux,
  LogoMacos,
  LogoWindows,
} from "@gravity-ui/icons";
import { Chip, Link, buttonVariants } from "@heroui/react";
import type { ComponentType, SVGProps } from "react";
import { ActionCard, FeaturedCard } from "../components/cards";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { type DownloadItem, type ReleaseDownloads } from "../data/downloads";
import { type messages } from "../i18n/messages";
import type { Platform } from "../lib/platform";

type DownloadPageProps = {
  t: ReturnType<typeof messages>;
  platform: Platform;
  recommended?: { href: string; label: string; detail: string; size: string };
  releaseDownloads: ReleaseDownloads;
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

export function DownloadPage({ t, recommended, releaseDownloads }: DownloadPageProps) {
  const recommendedItem = releaseDownloads.downloads.find((item) => item.href === recommended?.href);

  return (
    <section className="page-section download-page">
      <PageHeader
        title={t.downloadTitle}
        description={t.downloadLead}
        meta={<Chip size="sm" variant="secondary">v{releaseDownloads.release.version}</Chip>}
      />

      {recommended && recommendedItem && (
        <SectionReveal aria-label={t.recommended}>
          <FeaturedCard
            className="download-recommended"
            icon={<DownloadIcon item={recommendedItem} />}
            title={recommended.label}
            eyebrow={<Chip size="sm" variant="secondary">{t.recommended} · {platformLabel(recommendedItem.platform)}</Chip>}
            description={`${recommended.detail} · ${recommended.size}`}
            action={(
              <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended.href}>
                {t.downloadLabel}<ArrowDownToLine width={18} height={18} />
              </Link>
            )}
          />
        </SectionReveal>
      )}

      <SectionHeader title={t.allPackages} className="subhead" />
      <SectionReveal as="div" className="download-grid" delay={0.04}>
        {releaseDownloads.downloads.map((item) => (
          <ActionCard
            className="download-item"
            href={item.href}
            key={item.href}
            title={item.label}
            description={item.detail}
            meta={<span className="download-item-size">{item.size}</span>}
            icon={<DownloadIcon item={item} />}
            arrow={<ArrowDownToLine width={18} height={18} />}
            external={item.platform === "source"}
          />
        ))}
      </SectionReveal>
    </section>
  );
}
