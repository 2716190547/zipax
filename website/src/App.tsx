import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BootSplash } from "./components/BootSplash";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LiquidEtherBackground } from "./components/LiquidEtherBackground";
import { recommendedDownload } from "./data/downloads";
import { routeFromHash, routeKey, type Route } from "./data/routes";
import { locales, matchLocale, messages, type Locale } from "./i18n/messages";
import { detectPlatform } from "./lib/platform";
import { resolveTheme, type ThemeMode } from "./lib/theme";
import { DocPage } from "./pages/DocPage";
import { DocsIndexPage } from "./pages/DocsIndexPage";
import { DownloadPage } from "./pages/DownloadPage";
import { HomePage } from "./pages/HomePage";
import { SupportPage } from "./pages/SupportPage";

export function App() {
  const [platform] = useState(detectPlatform);
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("zipax.locale");
    return stored ? matchLocale(stored) : matchLocale(navigator.language);
  });
  const [route, setRoute] = useState<Route>(() => routeFromHash(locale));
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("zipax.theme") as ThemeMode | null;
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  });

  const t = useMemo(() => messages(locale), [locale]);
  const recommended = recommendedDownload(platform);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(routeFromHash(locale));
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [locale]);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("zipax.theme", theme);
  }, [theme]);

  useEffect(() => {
    const dir = locales.find((item) => item.key === locale)?.dir ?? "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("zipax.locale", locale);
  }, [locale]);

  return (
    <div className="site-shell">
      <BootSplash />
      {route.name === "home" && <LiquidEtherBackground />}
      <Header route={route} t={t} locale={locale} theme={theme} onLocale={setLocale} onTheme={setTheme} />
      <AnimatePresence mode="wait">
        <motion.main
          key={routeKey(route)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {route.name === "home" && <HomePage t={t} locale={locale} platform={platform} recommended={recommended} />}
          {route.name === "download" && <DownloadPage t={t} platform={platform} recommended={recommended} />}
          {route.name === "docs" && <DocsIndexPage t={t} locale={locale} />}
          {route.name === "doc" && <DocPage t={t} locale={locale} slug={route.slug} />}
          {route.name === "support" && <SupportPage t={t} />}
        </motion.main>
      </AnimatePresence>
      <Footer t={t} />
    </div>
  );
}
