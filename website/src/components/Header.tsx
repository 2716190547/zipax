import { useState } from "react";
import { Button, ButtonGroup, Link, buttonVariants } from "@heroui/react";
import { ArrowDownToLine, ArrowRight, Gear, Globe, Moon, Sun } from "@gravity-ui/icons";
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
  downloadHref: string;
};

export function Header({ route, t, locale, theme, onLocale, onTheme, downloadHref }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLocale = locales.find((item) => item.key === locale) ?? locales[0];
  const nextTheme: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };
  const themeIcon = theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Gear />;

  const navItems = [
    { key: "download", label: t.navDownload, href: "#/download", active: route.name === "download" },
    { key: "docs", label: t.navDocs, href: "#/docs", active: isDocsRoute(route) },
    { key: "support", label: t.navSupport, href: "#/support", active: route.name === "support" },
    { key: "github", label: t.navGithub, href: "https://github.com/2716190547/zipax", active: false, external: true },
  ];

  return (
    <header className={`site-header ${menuOpen ? "mobile-expanded" : ""}`.trim()}>
      <Link className="brand" href="#/" aria-label="zipax home">
        <ZipaxWordmark size="md" />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <Link className={item.active ? "active" : ""} href={item.href} key={item.key} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>
            {item.label}{item.external && <Link.Icon />}
          </Link>
        ))}
      </nav>
      <div className="header-controls">
        <Button className="theme-cycle" isIconOnly variant="secondary" aria-label={`${t.theme}: ${theme}`} onPress={() => onTheme(nextTheme[theme])}>
          {themeIcon}
        </Button>
        <HeroSelect<Locale>
          ariaLabel={t.language}
          value={locale}
          onChange={onLocale}
          triggerIcon={<Globe />}
          triggerLabel={activeLocale.short}
          options={locales.map((item) => ({ key: item.key, label: item.label }))}
          className="site-select locale-select"
        />
      </div>
      <div className="mobile-actions">
        <Link className={`mobile-quick-download ${buttonVariants({ variant: "primary", isIconOnly: true })}`} href={downloadHref} aria-label={t.downloadTitle}>
          <ArrowDownToLine width={18} height={18} />
        </Link>
        <Button
          className="mobile-menu-toggle"
          isIconOnly
          variant="secondary"
          aria-label={menuOpen ? t.close : t.menu}
          aria-expanded={menuOpen}
          onPress={() => setMenuOpen((open) => !open)}
        >
          <span className="mobile-menu-glyph" aria-hidden="true"><i /><i /></span>
        </Button>
      </div>
      <div className="mobile-nav-panel" aria-hidden={!menuOpen}>
        <nav className="mobile-nav" aria-label="Mobile primary">
          {navItems.map((item) => (
            <Link
              className={item.active ? "active" : ""}
              href={item.href}
              key={item.key}
              aria-current={item.active ? "page" : undefined}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.label}</span>
              <span className="mobile-nav-icon" aria-hidden="true">
                {item.external ? <Link.Icon /> : <ArrowRight width={18} height={18} />}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mobile-settings">
          <span className="mobile-settings-label">{t.theme}</span>
          <ButtonGroup className="theme-options" fullWidth variant="secondary" aria-label={t.theme}>
            {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
              <Button key={mode} className={theme === mode ? "theme-option-active" : ""} variant="secondary" aria-pressed={theme === mode} onPress={() => onTheme(mode)}>
                {mode === "system" ? <Gear /> : mode === "light" ? <Sun /> : <Moon />}
                {mode === "system" ? t.system : mode === "light" ? t.light : t.dark}
              </Button>
            ))}
          </ButtonGroup>
          <span className="mobile-settings-label">{t.language}</span>
          <HeroSelect<Locale>
            ariaLabel={t.language}
            value={locale}
            onChange={onLocale}
            triggerIcon={<Globe />}
            triggerLabel={activeLocale.label}
            options={locales.map((item) => ({ key: item.key, label: item.label }))}
            className="drawer-locale-select"
          />
        </div>
      </div>
    </header>
  );
}
