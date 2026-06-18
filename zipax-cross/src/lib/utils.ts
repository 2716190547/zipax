export const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function dispatchZipaxResize(delays: number[] = []) {
  window.dispatchEvent(new Event("zipax:resize"));
  return delays.map((delay) => (
    window.setTimeout(() => window.dispatchEvent(new Event("zipax:resize")), delay)
  ));
}

export function safeWarn(message: string, error: unknown) {
  console.warn(message, error);
}
