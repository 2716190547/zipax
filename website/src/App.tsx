import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PageTransition } from "./components/motion/PageTransition";
import { RouteTransitionMask } from "./components/motion/RouteTransitionMask";
import { recommendedDownload } from "./data/downloads";
import { routeFromHash, routeFromHashValue, routeKey, type Route } from "./data/routes";
import { locales, matchLocale, messages, type Locale } from "./i18n/messages";
import { detectPlatform } from "./lib/platform";
import { resolveTheme, type ThemeMode } from "./lib/theme";
import { useLatestRelease } from "./lib/useLatestRelease";
import { DocPage } from "./pages/DocPage";
import { DocsIndexPage } from "./pages/DocsIndexPage";
import { DownloadPage } from "./pages/DownloadPage";
import { HomePage } from "./pages/HomePage";
import { SupportPage } from "./pages/SupportPage";

const routeSwitchDelay = 560;
const routeMaskDuration = 1120;

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
  const [maskActive, setMaskActive] = useState(false);
  const routeSwitchTimer = useRef<number | null>(null);
  const maskTimer = useRef<number | null>(null);

  const t = useMemo(() => messages(locale), [locale]);
  const releaseDownloads = useLatestRelease();
  const recommended = recommendedDownload(platform, releaseDownloads.downloads);
  const currentRouteKey = routeKey(route);
  const currentRouteKeyRef = useRef(currentRouteKey);

  useEffect(() => {
    currentRouteKeyRef.current = currentRouteKey;
  }, [currentRouteKey]);

  const startRouteTransition = useCallback((nextRoute: Route, nextRouteKey: string) => {
    if (nextRouteKey === currentRouteKeyRef.current) {
      return;
    }

    if (routeSwitchTimer.current) window.clearTimeout(routeSwitchTimer.current);
    if (maskTimer.current) window.clearTimeout(maskTimer.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentRouteKeyRef.current = nextRouteKey;
      setRoute(nextRoute);
      return;
    }

    setTransitionId((value) => value + 1);
    setMaskActive(true);
    routeSwitchTimer.current = window.setTimeout(() => {
      currentRouteKeyRef.current = nextRouteKey;
      setRoute(nextRoute);
      routeSwitchTimer.current = null;
    }, routeSwitchDelay);
    maskTimer.current = window.setTimeout(() => {
      setMaskActive(false);
      maskTimer.current = null;
    }, routeMaskDuration);
  }, []);

  useEffect(() => {
    const transitionToHash = (hash: string) => {
      const nextRoute = routeFromHashValue(locale, hash);
      const nextRouteKey = routeKey(nextRoute);
      if (nextRouteKey === currentRouteKeyRef.current) return;

      window.history.pushState(null, "", hash);
      startRouteTransition(nextRoute, nextRouteKey);
    };

    const onHashChange = () => {
      const nextRoute = routeFromHash(locale);
      startRouteTransition(nextRoute, routeKey(nextRoute));
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#/"]') : null;
      const href = target?.getAttribute("href");
      if (!href || target?.target) return;

      event.preventDefault();
      transitionToHash(href);
    };

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("hashchange", onHashChange);
      if (routeSwitchTimer.current) window.clearTimeout(routeSwitchTimer.current);
      if (maskTimer.current) window.clearTimeout(maskTimer.current);
    };
  }, [locale, startRouteTransition]);

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
      <RouteTransitionMask active={maskActive} transitionId={transitionId} />
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
