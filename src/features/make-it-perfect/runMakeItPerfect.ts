import type { FlyerContent } from '../../types';
import { measureFlyerLayout } from '../../utils/layoutOptimizer';

export interface MakeItPerfectOptions {
  content: FlyerContent;
  applyContent: (next: FlyerContent) => void;
  adjustHeroHeight: (height: number) => void;
  getCanvas: () => HTMLElement | null;
}

/** Fit typography in every flyer without changing any text, prices or legal content. */
export async function runMakeItPerfect({
  content, applyContent, getCanvas,
}: MakeItPerfectOptions): Promise<string> {
  // Preserve all editorial, tariff and layout fields; auto-fit only changes text size.
  const optimized = content;
  const afterPaint = () => new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  const fit = async (factor: number) => {
    applyContent({ ...optimized, textScaleFactor: factor });
    await afterPaint();
    const canvas = getCanvas();
    return canvas ? measureFlyerLayout(canvas) : null;
  };
  // Start from a conservative size, grow when whitespace permits, shrink on overflow.
  let factor = Math.max(0.72, Math.min(1.12, optimized.textScaleFactor ?? 1));
  let measurement = await fit(factor);
  if (!measurement) return 'Make It Perfect: anteprima non disponibile.';

  if (measurement.overflowPx > 2) {
    for (let i = 0; i < 7 && measurement.overflowPx > 2 && factor > 0.72; i++) {
      factor = Math.max(0.72, factor - 0.06);
      measurement = (await fit(factor)) ?? measurement;
    }
  } else {
    // When the page has room, test larger type and retain only the last fitting size.
    for (let i = 0; i < 5 && factor < 1.24; i++) {
      const candidate = Math.min(1.24, factor + 0.04);
      const trial = await fit(candidate);
      if (!trial || trial.overflowPx > 2) {
        await fit(factor);
        break;
      }
      factor = candidate;
      measurement = trial;
    }
  }
  const page = `${optimized.format} · ${optimized.orientation === 'landscape' ? 'orizzontale' : 'verticale'}`;
  return measurement.overflowPx > 2
    ? `Attenzione: ${page} — ${measurement.overflowPx}px fuori pagina anche con il testo ridotto.`
    : `Layout ${page}: tipografia ${Math.round(factor * 100)}%, ${measurement.measuredBlocks} blocchi verificati.`;
}
