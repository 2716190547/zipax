import { useEffect, useState } from "react";
import {
  fallbackReleaseDownloads,
  parseGithubRelease,
  type GithubRelease,
  type ReleaseDownloads,
} from "../data/downloads";

const RELEASE_API = "https://api.github.com/repos/2716190547/zipax/releases/latest";
const CACHE_KEY = "zipax.latestRelease";
const CACHE_TTL = 6 * 60 * 60 * 1000;

type ReleaseCache = {
  savedAt: number;
  data: ReleaseDownloads;
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const cached = JSON.parse(raw) as ReleaseCache;
    if (!cached.savedAt || !cached.data || Date.now() - cached.savedAt > CACHE_TTL) return undefined;
    return { ...cached.data, source: "cache" as const };
  } catch {
    return undefined;
  }
}

function writeCache(data: ReleaseDownloads) {
  try {
    const cache: ReleaseCache = { savedAt: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable in private contexts. The fallback data remains valid.
  }
}

export function useLatestRelease() {
  const [releaseDownloads, setReleaseDownloads] = useState<ReleaseDownloads>(() => readCache() ?? fallbackReleaseDownloads);

  useEffect(() => {
    const controller = new AbortController();

    async function refreshRelease() {
      try {
        const response = await fetch(RELEASE_API, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`GitHub release request failed: ${response.status}`);

        const payload = (await response.json()) as GithubRelease;
        const parsed = parseGithubRelease(payload);
        if (!parsed) throw new Error("GitHub release did not contain supported assets");

        writeCache(parsed);
        setReleaseDownloads(parsed);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("[zipax] Falling back to bundled release data.", error);
      }
    }

    refreshRelease();
    return () => controller.abort();
  }, []);

  return releaseDownloads;
}
