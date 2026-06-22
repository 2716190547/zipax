import { Link } from "@heroui/react";
import { Gear, Globe, Moon, Sun } from "@gravity-ui/icons";
import { isDocsRoute, type Route } from "../data/routes";
import { locales, type Locale, type messages } from "../i18n/messages";
import type { ThemeMode } from "../lib/theme";
import { HeroSelect } from "./HeroSelect";
import { ZipaxWordmark } from "./ZipaxWordmark";

type HeaderProps = {
  route: Route;
  t: ReturnType<typeof messages>;
  locale: Locale;
  theme: ThemeMode;
  onLocale: (locale: Locale) => void;
  onTheme: (theme: ThemeMode) => void;
};

export function Header({ route, t, locale, theme, onLocale, onTheme }: HeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="#/" aria-label="zipax home">
        <ZipaxWordmark size="md" />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        <Link className={route.name === "download" ? "active" : ""} href="#/download">{t.navDownload}</Link>
        <Link className={isDocsRoute(route) ? "active" : ""} href="#/docs">{t.navDocs}</Link>
        <Link className={route.name === "support" ? "active" : ""} href="#/support">{t.navSupport}</Link>
        <Link href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">{t.navGithub}<Link.Icon /></Link>
      </nav>
      <div className="header-controls">
        <HeroSelect<ThemeMode>
          ariaLabel={t.theme}
          value={theme}
          onChange={onTheme}
          triggerIcon={theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Gear />}
          options={[
            { key: "system", label: t.system, icon: <Gear /> },
            { key: "light", label: t.light, icon: <Sun /> },
            { key: "dark", label: t.dark, icon: <Moon /> },
          ]}
          className="site-select theme-select"
        />
        <HeroSelect<Locale>
          ariaLabel={t.language}
          value={locale}
          onChange={onLocale}
          triggerIcon={<Globe />}
          options={locales.map((item) => ({ key: item.key, label: item.label }))}
          className="site-select locale-select"
        />
      </div>
    </header>
  );
}
