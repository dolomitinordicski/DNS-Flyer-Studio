import type { FlyerContent } from '../../types';
import { measureFlyerLayout, optimizeLayout } from '../../utils/layoutOptimizer';

export interface MakeItPerfectOptions {
  content: FlyerContent;
  applyContent: (next: FlyerContent) => void;
  adjustHeroHeight: (height: number) => void;
  getCanvas: () => HTMLElement | null;
}

/** Optimizes document geometry without touching authoritative prices or legal copy. */
export async function runMakeItPerfect({
  content, applyContent, adjustHeroHeight, getCanvas,
}: MakeItPerfectOptions): Promise<string> {
  const { content: updated } = optimizeLayout(content);
  applyContent(updated);
  const afterPaint = () => new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  await afterPaint();
  let measurement = getCanvas() ? measureFlyerLayout(getCanvas()!) : null;
  let height = updated.heroImageHeightPx ?? 140;
  for (let attempt = 0; measurement && measurement.overflowPx > 2 && attempt < 3; attempt++) {
    const nextHeight = Math.max(65, height - measurement.overflowPx - 8);
    if (nextHeight >= height) break;
    height = nextHeight;
    adjustHeroHeight(nextHeight);
    await afterPaint();
    const canvas = getCanvas();
    measurement = canvas ? measureFlyerLayout(canvas) : null;
  }
  const page = `${updated.format} · ${updated.orientation === 'landscape' ? 'orizzontale' : 'verticale'}`;
  return !measurement
    ? `Layout ${page}: anteprima non disponibile per la verifica.`
    : measurement.overflowPx > 2
      ? `Attenzione: ${page} — ${measurement.overflowPx}px di contenuti fuori pagina. Scegli un formato maggiore o riduci i testi.`
      : `Layout ${page}: ${measurement.measuredBlocks} blocchi controllati, nessun overflow rilevato.`;
}
