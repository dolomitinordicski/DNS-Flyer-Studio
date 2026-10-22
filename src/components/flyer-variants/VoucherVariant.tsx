import React from 'react';
import type { FlyerVariantProps } from './VariantTypes';
import { BlockStackRenderer } from '../blocks';
import { resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';

/**
 * Voucher editorial composition.
 * Uses the same shared blocks, form fields, localization, permissions and
 * print pipeline as the other flyers. It does not issue redeemable vouchers.
 */
export const VoucherVariant: React.FC<FlyerVariantProps> = ({
  content, plt, theme, regionLogo, activeSportsIcons = [], visibility,
}) => {
  const compact = content.format === 'A5';
  const large = content.format === 'A3';
  const landscape = content.orientation === 'landscape';
  const accent = resolveDNSRegionAccent(content.regionId);
  const shared = {
    content, plt, theme, regionLogo, activeSportsIcons, visibility,
    format: content.format || 'A4' as const,
    orientation: content.orientation || 'portrait' as const,
  };

  // Controlled, legible voucher hierarchy instead of the generic 12-section
  // flyer stack. Existing editors/visibility toggles still control each block.
  const stack = (order: Array<'header' | 'heroImage' | 'bigTitle' | 'promotionBox' | 'servicesBox' | 'qrCode' | 'disclaimer' | 'footer'>) =>
    <BlockStackRenderer order={order} {...shared} />;

  return (
    <article
      data-voucher-layout="editorial"
      className={`relative z-10 flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam text-slate-900 ${compact ? 'gap-2 p-3' : large ? 'gap-5 p-9' : 'gap-3 p-6'} ${content.cornerStyle === 'none' || content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : ''}`}
      style={{ backgroundColor: theme.cardBgHex }}
    >
      <div className="shrink-0">{stack(['header'])}</div>

      {landscape ? (
        <div className="flex min-h-0 flex-1 gap-5">
          <div className="min-h-0 min-w-0 flex-[1.05] overflow-hidden">{stack(['heroImage'])}</div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3">
            {accent && <span aria-hidden="true" className="h-[3px] w-8 rounded-full" style={{ backgroundColor: accent }} />}
            {stack(['bigTitle', 'promotionBox', 'servicesBox'])}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          <div className="min-h-0 overflow-hidden">{stack(['heroImage'])}</div>
          {accent && <span aria-hidden="true" className="h-[3px] w-8 shrink-0 rounded-full" style={{ backgroundColor: accent }} />}
          {stack(['bigTitle', 'promotionBox', 'servicesBox'])}
        </div>
      )}

      <div className="mt-auto shrink-0 space-y-2">
        {stack(['qrCode', 'disclaimer', 'footer'])}
      </div>
    </article>
  );
};


/** Gift certificate: more restrained hierarchy than a service redemption voucher.
 * Reuses the exact shared block renderers and production export pipeline.
 */
export const GutscheinVariant: React.FC<FlyerVariantProps> = ({
  content, plt, theme, regionLogo, activeSportsIcons = [], visibility,
}) => {
  const compact = content.format === 'A5';
  const landscape = content.orientation === 'landscape';
  const identity = resolveDNSRegionAccent(content.regionId);
  const props = { content, plt, theme, regionLogo, activeSportsIcons, visibility,
    format: content.format || 'A4' as const, orientation: content.orientation || 'portrait' as const };
  const blocks = (order: Array<'header' | 'heroImage' | 'bigTitle' | 'promotionBox' | 'qrCode' | 'disclaimer' | 'footer'>) =>
    <BlockStackRenderer order={order} {...props} />;

  return (
    <article data-voucher-layout="gutschein" className={`relative z-10 flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam ${compact ? 'gap-3 p-4' : 'gap-5 p-8'}`} style={{ backgroundColor: theme.cardBgHex }}>
      <div className="shrink-0">{blocks(['header'])}</div>
      <div className={`flex min-h-0 flex-1 ${landscape ? 'flex-row gap-6' : 'flex-col gap-4'}`}>
        <div className={`min-h-0 overflow-hidden ${landscape ? 'w-1/2' : 'shrink'}`}>{blocks(['heroImage'])}</div>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          {identity && <span aria-hidden="true" className="h-[3px] w-10 rounded-full" style={{ backgroundColor: identity }} />}
          {blocks(['bigTitle', 'promotionBox'])}
        </div>
      </div>
      <div className="mt-auto shrink-0 space-y-2">{blocks(['qrCode', 'disclaimer', 'footer'])}</div>
    </article>
  );
};
