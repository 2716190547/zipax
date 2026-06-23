import { useMemo, useState } from "react";
import { Button, Drawer, Link, buttonVariants } from "@heroui/react";
import { ArrowDownToLine, Bars, Gear, Globe, Moon, Sun, Xmark } from "@gravity-ui/icons";
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
  const drawerState = useMemo(() => ({
    isOpen: menuOpen,
    setOpen: setMenuOpen,
    open: () => setMenuOpen(true),
    close: () => setMenuOpen(false),
    toggle: () => setMenuOpen((open) => !open),
  }), [menuOpen]);
  const activeLocale = locales.find((item) => item.key === locale) ?? locales[0];
  const nextTheme: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };
  const themeIcon = theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Gear />;

  const nav = (
    <>
      <Link className={route.name === "download" ? "active" : ""} href="#/download" onClick={drawerState.close}>{t.navDownload}</Link>
      <Link className={isDocsRoute(route) ? "active" : ""} href="#/docs" onClick={drawerState.close}>{t.navDocs}</Link>
      <Link className={route.name === "support" ? "active" : ""} href="#/support" onClick={drawerState.close}>{t.navSupport}</Link>
      <Link href="https://github.com/2716190547/zipax" target="_blank" rel="noreferrer">{t.navGithub}<Link.Icon /></Link>
    </>
  );

  return (
    <header className="site-header">
      <Link className="brand" href="#/" aria-label="zipax home">
        <ZipaxWordmark size="md" />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {nav}
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
        <Link className={buttonVariants({ variant: "primary", isIconOnly: true })} href={downloadHref} aria-label={t.downloadTitle}>
          <ArrowDownToLine width={18} height={18} />
        </Link>
        <Drawer state={drawerState}>
          <Drawer.Trigger className={buttonVariants({ variant: "secondary", isIconOnly: true })} aria-label={t.menu}>
            <Bars width={20} height={20} />
          </Drawer.Trigger>
          <Drawer.Backdrop className="mobile-drawer-backdrop">
            <Drawer.Content className="mobile-drawer-content" placement="right">
              <Drawer.Dialog>
                <Drawer.Header className="mobile-drawer-header">
                  <Drawer.Heading><ZipaxWordmark size="md" /></Drawer.Heading>
                  <Drawer.CloseTrigger className={buttonVariants({ variant: "ghost", isIconOnly: true })} aria-label={t.close}>
                    <Xmark width={20} height={20} />
                  </Drawer.CloseTrigger>
                </Drawer.Header>
                <Drawer.Body className="mobile-drawer-body">
                  <nav className="mobile-nav" aria-label="Mobile primary">{nav}</nav>
                  <div className="mobile-settings">
                    <span className="mobile-settings-label">{t.theme}</span>
                    <div className="theme-options">
                      {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
                        <Button key={mode} variant={theme === mode ? "primary" : "secondary"} onPress={() => onTheme(mode)}>
                          {mode === "system" ? <Gear /> : mode === "light" ? <Sun /> : <Moon />}
                          {mode === "system" ? t.system : mode === "light" ? t.light : t.dark}
                        </Button>
                      ))}
                    </div>
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
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    </header>
  );
}
