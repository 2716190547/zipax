export const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function dispatchZipaxResize(delays: number[] = []) {
  window.dispatchEvent(new Event("zipax:resize"));
  return delays.map((delay) => (
    window.setTimeout(() => window.dispatchEvent(new Event("zipax:resize")), delay)
  ));
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
