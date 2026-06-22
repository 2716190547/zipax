import { Link, Separator, Typography } from "@heroui/react";
import { ZipaxWordmark } from "./ZipaxWordmark";
import { release } from "../data/downloads";
import { type messages } from "../i18n/messages";

export function Footer({ t }: { t: ReturnType<typeof messages> }) {
  return (
    <footer className="site-footer">
      <Separator className="footer-separator" />
      <div className="footer-content">
        <div className="footer-brand">
          <Link className="footer-logo" href="#/" aria-label="zipax home">
            <ZipaxWordmark size="md" iconVariant="full" />
          </Link>
          <Typography.Paragraph className="footer-tagline">{t.footer}</Typography.Paragraph>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <Typography.Heading level={3}>Product</Typography.Heading>
            <Link href={release.url}>Release {release.version}</Link>
            <Link href="#/download">Download</Link>
            <Link href="#/docs">Documentation</Link>
          </div>
          
          <div className="footer-column">
            <Typography.Heading level={3}>Community</Typography.Heading>
            <Link href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">GitHub<Link.Icon /></Link>
            <Link href="https://github.com/2716190547/zipax/issues" target="_blank" rel="noreferrer">Issues<Link.Icon /></Link>
            <Link href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">Contribute<Link.Icon /></Link>
          </div>
        </div>
      </div>
      
      <Separator className="footer-separator footer-separator-bottom" />
      <div className="footer-bottom">
        <span>© 2026 zipax. Open source under MIT License.</span>
      </div>
    </footer>
  );
}
