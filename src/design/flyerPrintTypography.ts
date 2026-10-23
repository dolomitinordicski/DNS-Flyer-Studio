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
