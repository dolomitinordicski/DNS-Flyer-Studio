/** Flyer Studio only. Print editorial tokens: never exported to DNS Foundation. */
export type PrintFormat = 'A3' | 'A4' | 'A5';
export interface FlyerPrintTypeScale {
  label: string;
  body: string;
  detail: string;
  footer: string;
  callToAction: string;
}
/** Layout-specific minimum readable sizes; compact landscape is handled by layout, not 9px text. */
export function getFlyerPrintTypography(format: PrintFormat = 'A4'): FlyerPrintTypeScale {
  if (format === 'A5') return {
    label: 'text-[13px]',
    body: 'text-[15px]',
    detail: 'text-[14px]',
    footer: 'text-[12px]',
    callToAction: 'text-[16px]',
  };
  if (format === 'A3') return {
    label: 'text-[19px]',
    body: 'text-[23px]',
    detail: 'text-[19px]',
    footer: 'text-[17px]',
    callToAction: 'text-[21px]',
  };
  return {
    label: 'text-[16px]',
    body: 'text-[19px]',
    detail: 'text-[17px]',
    footer: 'text-[15px]',
    callToAction: 'text-[19px]',
  };
}

/** Inline sizes are deliberately numeric: Make it perfect can resize print copy at runtime. */
export function getFlyerPrintFontSizes(format: PrintFormat = 'A4', factor = 1) {
  const base = format === 'A5'
    ? { label: 13, body: 15, detail: 14, footer: 12, callToAction: 16 }
    : format === 'A3'
      ? { label: 19, body: 23, detail: 19, footer: 17, callToAction: 21 }
      : { label: 16, body: 19, detail: 17, footer: 15, callToAction: 19 };
  const multiplier = Math.max(0.9, Math.min(1.24, factor));
  return Object.fromEntries(
    Object.entries(base).map(([key, size]) => [key, Math.round(size * multiplier * 10) / 10])
  ) as typeof base;
}
