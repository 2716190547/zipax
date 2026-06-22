import { ArrowDownToLine, CircleCheck } from "@gravity-ui/icons";
import { Card, Chip, Link, Typography, buttonVariants } from "@heroui/react";
import { Icon, type IconName } from "../components/Icon";
import { ParticleLogo } from "../components/ParticleLogo";
import { SectionHeader } from "../components/SectionHeader";
import { ZipaxWordmark } from "../components/ZipaxWordmark";
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

const copy = {
  en: {
    proof: ["Images + PDF", "Folder automation", "Local processing"],
    featureIntro: "The useful parts stay close. Everything else stays out of your way.",
    featureDescriptions: [
      "Drop in a file and get a smaller copy in a few seconds.",
      "Watch a folder once, then let zipax handle every new file.",
      "Your files are processed on your device, not sent to a cloud service.",
      "Stay current without hunting down a new installer.",
    ],
    flowEyebrow: "One quiet workflow",
    flowTitle: "From heavy file to ready-to-share.",
    flowText: "Choose a file or a folder rule. zipax applies your settings and leaves the original exactly where it is.",
    steps: ["Choose", "Compress", "Keep moving"],
    stepTexts: ["Images, PDFs, or a watched folder.", "Use a preset or tune quality once.", "Get the smaller file where you expect it."],
    localLabel: "Designed for your desktop",
    localTitle: "Fast when you need it. Invisible when you don’t.",
    localText: "zipax lives in the menu bar and works locally. No account, no upload queue, no recurring workflow to remember.",
    localPoints: ["Keeps originals safe", "Works without an account", "Open source and free"],
    ctaTitle: "Make every file lighter.",
    ctaText: "Download zipax and turn compression into a one-step habit.",
    ctaButton: "Download zipax",
  },
  zh: {
    proof: ["图片 + PDF", "文件夹自动化", "本地处理"],
    featureIntro: "常用能力触手可及，其余部分安静退后。",
    featureDescriptions: [
      "拖入文件，几秒钟得到更轻巧的副本。",
      "设置一次监听文件夹，之后的新文件自动处理。",
      "文件只在你的设备上处理，无需上传云端。",
      "自动保持最新，不必反复寻找安装包。",
    ],
    flowEyebrow: "一条安静的工作流",
    flowTitle: "从体积太大，到随手可发。",
    flowText: "选择文件或文件夹规则，zipax 按你的设置完成压缩，并把原文件留在熟悉的位置。",
    steps: ["选择", "压缩", "继续工作"],
    stepTexts: ["图片、PDF，或一个监听文件夹。", "使用预设，或只调整一次质量。", "在预期的位置拿到更小的文件。"],
    localLabel: "为桌面而生",
    localTitle: "需要时很快，不需要时隐身。",
    localText: "zipax 常驻菜单栏并在本地工作。无需账号、没有上传队列，也不用记住繁琐流程。",
    localPoints: ["妥善保留原文件", "无需注册账号", "免费且开源"],
    ctaTitle: "让每个文件轻一点。",
    ctaText: "下载 zipax，把压缩变成一步完成的小习惯。",
    ctaButton: "下载 zipax",
  },
};

export function HomePage({ t, locale, platform, recommended }: HomePageProps) {
  const c = locale.startsWith("zh") ? copy.zh : copy.en;
  const downloadLabel = platform === "unknown" ? "Desktop" : recommended?.label;

  return (
    <>
      <section className="hero-section home-hero">
        <div className="hero-copy">
          <Typography.Heading className="hero-brand-title" level={1}>
            <ZipaxWordmark size="display" />
          </Typography.Heading>
          <Typography.Heading className="hero-lead" level={2}>{t.heroLead}</Typography.Heading>
          <Typography.Paragraph className="hero-text">{t.heroText}</Typography.Paragraph>
          <div className="hero-actions">
            <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended?.href ?? release.latest}>
              <ArrowDownToLine width={18} height={18} aria-hidden="true" />
              {t.downloadFor} {downloadLabel}
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href={firstDocHref(locale)}>{t.viewDocs}</Link>
            <Link className="hero-github-link" href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">{t.github}<Link.Icon /></Link>
          </div>
          <div className="hero-proof" aria-label="Product highlights">
            {c.proof.map((item) => <Chip key={item} size="sm" variant="secondary"><CircleCheck width={14} height={14} />{item}</Chip>)}
          </div>
        </div>
        <ParticleLogo />
      </section>
      <FeatureGrid t={t} descriptions={c.featureDescriptions} intro={c.featureIntro} />
      <WorkflowSection locale={locale} copy={c} />
      <LocalSection copy={c} />
      <section className="home-cta">
        <div>
          <Typography.Heading level={2}>{c.ctaTitle}</Typography.Heading>
          <Typography.Paragraph>{c.ctaText}</Typography.Paragraph>
        </div>
        <Link className={buttonVariants({ variant: "primary", size: "lg" })} href={recommended?.href ?? release.latest}>
          {c.ctaButton}<ArrowDownToLine width={18} height={18} />
        </Link>
      </section>
    </>
  );
}

function FeatureGrid({ t, descriptions, intro }: { t: ReturnType<typeof messages>; descriptions: string[]; intro: string }) {
  const features: Array<{ icon: IconName; text: string; description: string }> = [
    { icon: "compress", text: t.featureManual, description: descriptions[0] },
    { icon: "folderSync", text: t.featureAutomation, description: descriptions[1] },
    { icon: "codeOpen", text: t.featureOpen, description: descriptions[2] },
    { icon: "update", text: t.featureUpdate, description: descriptions[3] },
  ];

  return (
    <section className="section home-features">
      <SectionHeader title={t.featuresTitle} description={intro} className="split-heading" />
      <div className="feature-grid">
        {features.map(({ icon, text, description }, index) => (
          <Card className="feature-card" key={text} variant="default">
            <Card.Header>
              <span className="feature-index">0{index + 1}</span>
            </Card.Header>
            <Card.Content>
              <span className="feature-icon"><Icon name={icon} size={26} /></span>
              <Card.Title>{text}</Card.Title>
              <Card.Description>{description}</Card.Description>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection({ locale, copy: c }: { locale: Locale; copy: typeof copy.en }) {
  return (
    <section className="workflow-section">
      <div className="workflow-copy">
        <SectionHeader title={c.flowTitle} description={c.flowText} meta={<Chip size="sm" variant="secondary">{c.flowEyebrow}</Chip>} />
        <div className="workflow-steps">
          {c.steps.map((step, index) => (
            <div className="workflow-step" key={step}>
              <Chip size="sm" variant="secondary">{index + 1}</Chip>
              <div><Typography weight="semibold">{step}</Typography><Typography.Paragraph size="sm">{c.stepTexts[index]}</Typography.Paragraph></div>
            </div>
          ))}
        </div>
      </div>
      <div className="product-window">
        <div className="product-window-bar"><i /><i /><i /><span>zipax</span></div>
        <img src={`/screenshots/${locale.startsWith("zh") ? "zipax-light-zh.png" : "zipax-dark-en.png"}`} alt="zipax app interface" />
      </div>
    </section>
  );
}

function LocalSection({ copy: c }: { copy: typeof copy.en }) {
  return (
    <section className="local-section">
      <div className="local-orb" aria-hidden="true"><span /><span /><span /></div>
      <div className="local-copy">
        <SectionHeader title={c.localTitle} description={c.localText} meta={<Chip size="sm" variant="secondary">{c.localLabel}</Chip>} />
        <ul>{c.localPoints.map((point) => <li key={point}><CircleCheck width={20} height={20} aria-hidden="true" />{point}</li>)}</ul>
      </div>
    </section>
  );
}
