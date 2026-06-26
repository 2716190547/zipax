import { BookOpen, Bug, Code, Tag } from "@gravity-ui/icons";
import { ActionCard } from "../components/cards";
import { PageHeader } from "../components/PageHeader";
import { SectionReveal } from "../components/motion/SectionReveal";
import { release } from "../data/downloads";
import { type messages } from "../i18n/messages";

export function SupportPage({ t }: { t: ReturnType<typeof messages> }) {
  const supportItems = [
    {
      href: "https://github.com/2716190547/zipax/issues",
      title: t.issuesTitle,
      description: t.issuesDescription,
      icon: <Bug width={22} height={22} />,
      external: true,
    },
    {
      href: "#/docs",
      title: t.documentationLabel,
      description: t.docsLead,
      icon: <BookOpen width={22} height={22} />,
    },
    {
      href: "https://github.com/2716190547/zipax",
      title: t.repositoryTitle,
      description: t.repositoryDescription,
      icon: <Code width={22} height={22} />,
      external: true,
    },
    {
      href: release.latest,
      title: t.releaseLabel,
      description: `zipax ${release.version}`,
      icon: <Tag width={22} height={22} />,
      external: true,
    },
  ];

  return (
    <section className="page-section support-layout">
      <PageHeader title={t.supportTitle} description={t.supportLead} />
      <SectionReveal as="div" className="support-grid" delay={0.04}>
        {supportItems.map((item) => (
          <ActionCard
            className="support-card"
            href={item.href}
            title={item.title}
            description={item.description}
            icon={item.icon}
            external={item.external}
            key={item.href}
          />
        ))}
      </SectionReveal>
    </section>
  );
}
