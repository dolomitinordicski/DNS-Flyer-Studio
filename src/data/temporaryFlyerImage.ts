/** In-memory photo preview. Never saved as a blob URL into DNS Core. */
let preview: { regionId: string; url: string } | null = null;
const listeners = new Set<() => void>();

export function setTemporaryFlyerImage(regionId: string, file: File): string {
  const old = preview?.url;
  preview = { regionId, url: URL.createObjectURL(file) };
  if (old) URL.revokeObjectURL(old);
  listeners.forEach(listener => listener());
  return preview.url;
}

export function clearTemporaryFlyerImage(): void {
  const old = preview?.url;
  preview = null;
  listeners.forEach(listener => listener());
  if (old) URL.revokeObjectURL(old);
}

export function subscribeTemporaryFlyerImage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTemporaryFlyerImage(): { regionId: string; url: string } | null {
  return preview;
}
