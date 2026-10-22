import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { FlyerVariantProps } from './VariantTypes';
import { BlockStackRenderer } from '../blocks';
import { resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';

/**
 * Voucher editorial composition.
 * Uses the same shared blocks, form fields, localization, permissions and
 * print pipeline as the other flyers. It does not issue redeemable vouchers.
 */

/** Image crop is specific to the document composition; source and focal point
 * remain the shared FlyerContent fields used by the editor and Magic Tool. */
const VoucherImage: React.FC<{ content: FlyerVariantProps['content']; visible: boolean; kind: 'voucher' | 'gutschein'; landscape: boolean }> = ({ content, visible, kind, landscape }) => {
  if (!visible || !content.heroImageUrl) return null;
  const gift = kind === 'gutschein';
  return (
    <div data-voucher-image={kind}
      className={`relative w-full shrink-0 overflow-hidden bg-slate-100 ${gift ? (landscape ? 'h-full min-h-0' : 'h-[32%] min-h-[130px]') : (landscape ? 'h-full min-h-0' : 'h-[20%] min-h-[90px]')} ${content.cornerStyle === 'rounded' ? 'rounded-xl' : ''}`}>
      <img src={content.heroImageUrl} alt={content.title || ''}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }}
        referrerPolicy="no-referrer" />
    </div>
  );
};

/** Compact shared document footer: no legacy flyer slogan, sports tiles or CTA. */
const DocumentFooter: React.FC<{ content: FlyerVariantProps['content']; theme: FlyerVariantProps['theme']; visibility: FlyerVariantProps['visibility'] }> = ({ content, theme, visibility }) => {
  const qrUrl = content.qrCode?.url?.trim();
  const showQr = visibility.qrCode !== false && content.qrCode?.enabled === true && !!qrUrl;
  const details = [content.contactEmail, content.contactPhone, content.websiteUrl].filter(Boolean);
  if (visibility.footer === false && !showQr) return null;
  return <footer className="mt-auto flex shrink-0 items-end justify-between gap-4 border-t border-slate-200 pt-3 text-[10px] text-slate-600">
    {visibility.footer !== false && <div className="min-w-0 flex-1 space-y-1">
      <p className="font-semibold" style={{ color: theme.primaryHex }}>Dolomiti NordicSki</p>
      {details.length > 0 && <p className="break-words">{details.join(' · ')}</p>}
      {content.priceNote && <p className="break-words text-[9px]">{content.priceNote}</p>}
    </div>}
    {showQr && <div className="shrink-0" aria-label="QR"><QRCodeSVG value={qrUrl!} size={56} fgColor={theme.primaryHex} bgColor="#FFFFFF" /></div>}
  </footer>;
};

export const VoucherVariant: React.FC<FlyerVariantProps> = ({
  content, plt, theme, regionLogo, activeSportsIcons = [], visibility,
}) => {
  const compact = content.format === 'A5';
  const large = content.format === 'A3';
  const landscape = content.orientation === 'landscape';
  const accent = resolveDNSRegionAccent(content.regionId);
  const photo = <VoucherImage content={content} visible={visibility.heroImage !== false} kind="voucher" landscape={landscape} />;
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
          <div className="h-full min-h-0 min-w-0 flex-[0.85]">{photo}</div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3">
            {accent && <span aria-hidden="true" className="h-[3px] w-8 rounded-full" style={{ backgroundColor: accent }} />}
            {stack(['bigTitle', 'promotionBox'])}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          {photo}
          {accent && <span aria-hidden="true" className="h-[3px] w-8 shrink-0 rounded-full" style={{ backgroundColor: accent }} />}
          {stack(['bigTitle', 'promotionBox', 'servicesBox'])}
        </div>
      )}

      <DocumentFooter content={content} theme={theme} visibility={visibility} />
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
  const photo = <VoucherImage content={content} visible={visibility.heroImage !== false} kind="gutschein" landscape={landscape} />;
  const props = { content, plt, theme, regionLogo, activeSportsIcons, visibility,
    format: content.format || 'A4' as const, orientation: content.orientation || 'portrait' as const };
  const blocks = (order: Array<'header' | 'heroImage' | 'bigTitle' | 'promotionBox' | 'qrCode' | 'disclaimer' | 'footer'>) =>
    <BlockStackRenderer order={order} {...props} />;

  return (
    <article data-voucher-layout="gutschein" className={`relative z-10 flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam ${compact ? 'gap-3 p-4' : 'gap-5 p-8'}`} style={{ backgroundColor: theme.cardBgHex }}>
      <div className="shrink-0">{blocks(['header'])}</div>
      <div className={`flex min-h-0 flex-1 ${landscape ? 'flex-row gap-6' : 'flex-col gap-4'}`}>
        <div className={`min-h-0 ${landscape ? 'h-full w-1/2' : ''}`}>{photo}</div>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          {identity && <span aria-hidden="true" className="h-[3px] w-10 rounded-full" style={{ backgroundColor: identity }} />}
          {blocks(['bigTitle', 'promotionBox'])}
        </div>
      </div>
      <DocumentFooter content={content} theme={theme} visibility={visibility} />
    </article>
  );
};
