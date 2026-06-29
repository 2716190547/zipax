import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PageTransition } from "./components/motion/PageTransition";
import { RouteLoadingOverlay } from "./components/motion/RouteLoadingOverlay";
import { RouteParticleBridge } from "./components/particles/RouteParticleBridge";
import { recommendedDownload } from "./data/downloads";
import { routeFromHash, routeKey, type Route } from "./data/routes";
import { locales, matchLocale, messages, type Locale } from "./i18n/messages";
import { detectPlatform } from "./lib/platform";
import { resolveTheme, type ThemeMode } from "./lib/theme";
import { useLatestRelease } from "./lib/useLatestRelease";
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
  const [transitionId, setTransitionId] = useState(0);
  const pendingRouteUpdate = useRef<number | null>(null);
  const routeListenerReady = useRef(false);

  const t = useMemo(() => messages(locale), [locale]);
  const releaseDownloads = useLatestRelease();
  const recommended = recommendedDownload(platform, releaseDownloads.downloads);
  const currentRouteKey = routeKey(route);
  const overlayRouteKey = transitionId > 0 ? `transition-${transitionId}` : currentRouteKey;

  useEffect(() => {
    const onHashChange = () => {
      const nextRoute = routeFromHash(locale);
      if (!routeListenerReady.current) {
        routeListenerReady.current = true;
        setRoute(nextRoute);
        return;
      }

      if (pendingRouteUpdate.current) window.clearTimeout(pendingRouteUpdate.current);
      setTransitionId((value) => value + 1);
      pendingRouteUpdate.current = window.setTimeout(() => {
        setRoute(nextRoute);
        pendingRouteUpdate.current = null;
      }, 420);
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      if (pendingRouteUpdate.current) window.clearTimeout(pendingRouteUpdate.current);
    };
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
      <Header
        route={route}
        t={t}
        locale={locale}
        theme={theme}
        onLocale={setLocale}
        onTheme={setTheme}
        downloadHref={recommended?.href ?? releaseDownloads.release.latest}
      />
      <RouteLoadingOverlay routeKey={overlayRouteKey} />
      <RouteParticleBridge routeKey={currentRouteKey} />
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={currentRouteKey}>
          {route.name === "home" && <HomePage t={t} locale={locale} platform={platform} recommended={recommended} />}
          {route.name === "download" && <DownloadPage t={t} platform={platform} recommended={recommended} releaseDownloads={releaseDownloads} />}
          {route.name === "docs" && <DocsIndexPage t={t} locale={locale} />}
          {route.name === "doc" && <DocPage t={t} locale={locale} slug={route.slug} />}
          {route.name === "support" && <SupportPage t={t} releaseInfo={releaseDownloads.release} />}
        </PageTransition>
      </AnimatePresence>
      <Footer t={t} releaseInfo={releaseDownloads.release} />
    </div>
  );
}
