import { docForSlug, docsForLocale, type DocSlug } from "./docs";
import type { Locale } from "../i18n/messages";

export type Route =
  | { name: "home" }
  | { name: "download" }
  | { name: "docs" }
  | { name: "doc"; slug: DocSlug }
  | { name: "support" };

export function routeFromHash(locale: Locale): Route {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [page, slug] = parts;

  if (page === "download") return { name: "download" };
  if (page === "support") return { name: "support" };
  if (page === "docs" && slug && docForSlug(locale, slug)) return { name: "doc", slug: slug as DocSlug };
  if (page === "docs") return { name: "docs" };
  return { name: "home" };
}

export function routeKey(route: Route) {
  return route.name === "doc" ? `doc-${route.slug}` : route.name;
}

export function isDocsRoute(route: Route) {
  return route.name === "docs" || route.name === "doc";
}

export function firstDocHref(locale: Locale) {
  const first = docsForLocale(locale)[0];
  return `#/docs/${first.slug}`;
}
