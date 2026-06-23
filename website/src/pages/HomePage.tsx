import { ArrowDownToLine, CircleCheck } from "@gravity-ui/icons";
import { Chip, Link, Typography, buttonVariants } from "@heroui/react";
import { Icon, type IconName } from "../components/Icon";
import { SectionHeader } from "../components/SectionHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { HeroParticleLogo } from "../components/particles/HeroParticleLogo";
import { docsForLocale, type DocSection } from "../data/docs";
import { release } from "../data/downloads";
import { firstDocHref } from "../data/routes";
import { type Locale, type messages } from "../i18n/messages";
import type { Platform } from "../lib/platform";

type HomePageProps = {
  t: ReturnType<typeof messages>;
  locale: Locale;
  platform: Platform;
  recommended?: { href: string; label: string };
};

export function HomePage({ t, locale, platform, recommended }: HomePageProps) {
  const docs = docsForLocale(locale);
  const compressDoc = docs.find((doc) => doc.slug === "compress") ?? docs[0];
  const automationDoc = docs.find((doc) => doc.slug === "automation") ?? docs[1];
  const downloadLabel = platform === "unknown" ? "Desktop" : recommended?.label;
  const proof = [t.featureManual, t.featureAutomation, t.featureOpen];
  const featureDescriptions = [compressDoc.body, automationDoc.body, t.footer];

  return (
    <>
      <section className="hero-section home-hero">
        <div className="hero-copy">
          <Typography.Heading className="hero-brand-title" level={1}>zipax</Typography.Heading>
          <Typography.Heading className="hero-lead" level={2}>{t.heroLead}</Typography.Heading>
          <Typography.Paragraph className="hero-text">{t.heroText}</Typography.Paragraph>
          <div className="hero-actions">
            <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended?.href ?? release.latest}>
              <ArrowDownToLine width={18} height={18} aria-hidden="true" />
              {t.downloadTitle}
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href={firstDocHref(locale)}>{t.viewDocs}</Link>
            <Link className="hero-github-link" href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">{t.github}<Link.Icon /></Link>
          </div>
          <span className="hero-platform-note">{t.downloadFor} {downloadLabel}</span>
          <div className="hero-proof" aria-label="Product highlights">
            {proof.map((item) => <Chip key={item} size="sm" variant="secondary"><CircleCheck width={14} height={14} />{item}</Chip>)}
          </div>
        </div>
        <div className="hero-product" role="img" aria-label="zipax particle logo">
          <HeroParticleLogo />
        </div>
      </section>
      <FeatureGrid t={t} descriptions={featureDescriptions} intro={t.heroText} />
      <WorkflowSection t={t} doc={compressDoc} />
      <LocalSection t={t} />
      <SectionReveal className="home-cta" delay={0.04}>
        <div>
          <Typography.Heading level={2}>{t.downloadTitle}</Typography.Heading>
          <Typography.Paragraph>{t.downloadLead}</Typography.Paragraph>
        </div>
        <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended?.href ?? release.latest}>
          {t.downloadTitle}<ArrowDownToLine width={18} height={18} />
        </Link>
      </SectionReveal>
    </>
  );
}

function FeatureGrid({ t, descriptions, intro }: { t: ReturnType<typeof messages>; descriptions: string[]; intro: string }) {
  const features: Array<{ icon: IconName; text: string; description: string }> = [
    { icon: "compress", text: t.featureManual, description: descriptions[0] },
    { icon: "folderSync", text: t.featureAutomation, description: descriptions[1] },
    { icon: "codeOpen", text: t.featureOpen, description: descriptions[2] },
  ];

  return (
    <SectionReveal className="section home-features">
      <SectionHeader title={t.featuresTitle} description={intro} className="split-heading" />
      <div className="feature-grid">
        {features.map(({ icon, text, description }, index) => (
          <article className="feature-item" key={text}>
            <span className="feature-index">0{index + 1}</span>
            <span className="feature-icon"><Icon name={icon} size={24} /></span>
            <Typography.Heading level={3}>{text}</Typography.Heading>
            <Typography.Paragraph>{description}</Typography.Paragraph>
          </article>
        ))}
      </div>
    </SectionReveal>
  );
}

function WorkflowSection({ t, doc }: { t: ReturnType<typeof messages>; doc: DocSection }) {
  return (
    <SectionReveal className="workflow-section" delay={0.04}>
      <div className="workflow-copy">
        <SectionHeader title={doc.title} description={doc.body} meta={<Chip size="sm" variant="secondary">{t.usage}</Chip>} />
        <div className="workflow-steps">
          {doc.steps.map((step, index) => (
            <div className="workflow-step" key={step}>
              <Chip size="sm" variant="secondary">{index + 1}</Chip>
              <Typography.Paragraph size="sm">{step}</Typography.Paragraph>
            </div>
          ))}
        </div>
      </div>
      <div className="product-screenshot"><ProductShot /></div>
    </SectionReveal>
  );
}

function LocalSection({ t }: { t: ReturnType<typeof messages> }) {
  return (
    <SectionReveal className="local-section" delay={0.04}>
      <div className="local-copy">
        <SectionHeader title={t.featureOpen} description={t.heroText} meta={<Chip size="sm" variant="secondary">{t.updateReady}</Chip>} />
        <ul>{[t.featureManual, t.featureAutomation, t.featureUpdate].map((point) => <li key={point}><CircleCheck width={20} height={20} aria-hidden="true" />{point}</li>)}</ul>
      </div>
    </SectionReveal>
  );
}

function ProductShot() {
  return (
    <span className="product-shot-stack" role="img" aria-label="zipax app interface">
      <img className="product-shot-image" src="/screenshots/zipax-dark-en.png" alt="" />
    </span>
  );
}
