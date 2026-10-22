import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DolomitiFullLogo, NordicSwooshGraphic } from '../CorporateVectors';
import type { FlyerVariantProps } from './VariantTypes';
import { resolveHotelPackageData } from './resolveFlyerData';

/**
 * Print-first package composition. Editorial content only: no tariff lookup,
 * no cards, no service tiles, no dashboard chrome.
 */
export const PackageOfferVariant: React.FC<FlyerVariantProps> = ({
  content, theme, regionLogo, visibility,
}) => {
  const data = resolveHotelPackageData(content, content.activeLanguage || 'de');
  const landscape = content.orientation === 'landscape';
  const compact = content.format === 'A5';
  const primary = theme.primaryHex;
  const photoMargin = compact ? 'mx-5' : 'mx-9';
  const accent = theme.accentHex;
  const regionalLogo = regionLogo?.logoSrc;
  const partnerLogo = content.customRegionalLogoUrl;
  const hasPrice = Boolean(data.priceAmount.trim());
  const showPhoto = visibility.heroImage !== false && Boolean(content.heroImageUrl);
  const showServices = visibility.servicesBox !== false && data.features.length > 0;
  const qrUrl = content.qrCode?.url || (data.website ? (data.website.startsWith('http') ? data.website : `https://${data.website}`) : '');
  const focus = `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%`;

  const image = showPhoto ? (
    <div className={`relative overflow-hidden min-h-0 bg-slate-100 ${landscape ? '' : photoMargin}`} style={{ flex: landscape ? '1 1 52%' : '0 0 49%' }}>
      <img src={content.heroImageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: focus }} referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 ${compact ? 'p-5' : 'p-9'}`}>
        <span className="inline-block h-1 w-12 mb-3" style={{ backgroundColor: accent }} />
        <p className="text-white text-xs font-semibold uppercase tracking-[0.22em]">{data.location || 'Dolomiti NordicSki'}</p>
      </div>
    </div>
  ) : null;

  return (
    <article className="relative z-10 flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam text-slate-900" data-package-layout={landscape ? 'split' : 'editorial'}>
      {visibility.header !== false && (
        <header className={`flex shrink-0 items-center justify-between gap-4 ${compact ? 'px-6 py-4' : 'px-10 py-7'}`}>
          <div className="flex min-w-0 items-center gap-3">
            {regionalLogo && content.regionId !== 'dns_central' ? (
              <img src={regionalLogo} alt={regionLogo?.regionName || 'Area partner'}
                className={compact ? 'h-11 max-w-[170px] object-contain' : 'h-16 max-w-[280px] object-contain'} />
            ) : <span className="text-sm font-semibold" style={{ color: primary }}>{regionLogo?.regionName || 'Dolomiti NordicSki'}</span>}
            {partnerLogo && <img src={partnerLogo} alt="Partner" className={compact ? 'h-8 max-w-[75px] object-contain' : 'h-10 max-w-[100px] object-contain'} />}
          </div>
          <div className="shrink-0 opacity-80">
            <DolomitiFullLogo variant={content.logoVariant} isDarkHeader={false}
              className={compact ? 'h-6 w-auto max-w-[95px] object-contain' : 'h-9 w-auto max-w-[155px] object-contain'}
              customPrimary={primary} customAccent={accent} cornerStyle={content.logoCornerStyle} />
          </div>
        </header>
      )}
      <div className={`flex min-h-0 flex-1 ${landscape ? 'flex-row px-9 gap-7' : 'flex-col'}`}>
        {image}
        <div className={`flex min-h-0 min-w-0 flex-1 flex-col justify-between ${compact ? 'gap-3 px-6 py-5' : landscape ? 'gap-5 px-3 py-6' : 'gap-6 px-10 py-8'}`}>
          <div className="min-w-0">
            <div className="mb-5 h-1 w-12" style={{ backgroundColor: accent }} />
            {data.badge && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: primary }}>{data.badge}</p>}
            <h1 className={`${compact ? 'text-2xl' : landscape ? 'text-[38px]' : 'text-[44px]'} font-semibold leading-[1.08] tracking-tight break-words`}>{data.title}</h1>
            {data.subtitle && <p className={`${compact ? 'mt-2 text-xs' : 'mt-4 text-base'} leading-relaxed text-slate-600`}>{data.subtitle}</p>}
            {(data.location || data.validityPeriod) && <p className="mt-4 text-[11px] tracking-wide text-slate-500">{[data.location, data.validityPeriod].filter(Boolean).join('  ·  ')}</p>}
          </div>
          {showServices && (
            <div className="min-w-0">
              {data.featuresTitle && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{data.featuresTitle}</p>}
              <p className={`${compact ? 'text-[11px]' : 'text-[13px]'} leading-relaxed text-slate-700`}>
                {data.features.filter(f => f.text?.trim()).slice(0, compact ? 3 : 4).map(f => f.text).join('  ·  ')}
              </p>
            </div>
          )}
          {visibility.priceTables !== false && (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {hasPrice ? (
                <>
                  {data.pricePrefix && <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{data.pricePrefix}</span>}
                  <span className={`${compact ? 'text-3xl' : 'text-5xl'} font-semibold tracking-tight`} style={{ color: primary }}>{data.priceAmount} {data.priceCurrency}</span>
                  {data.priceSuffix && <span className="text-xs text-slate-500">{data.priceSuffix}</span>}
                </>
              ) : <span className="text-lg font-medium" style={{ color: primary }}>{data.priceNote || 'Preis auf Anfrage'}</span>}
              {hasPrice && data.priceNote && <p className="w-full text-[10px] leading-relaxed text-slate-500">{data.priceNote}</p>}
            </div>
          )}
        </div>
      </div>
      {visibility.footer !== false && (
        <footer className={`relative isolate flex shrink-0 items-end justify-between gap-5 border-t border-slate-200 ${compact ? 'px-6 py-4' : 'px-10 py-6'}`}>
          <div className="pointer-events-none absolute inset-y-0 right-8 z-0 w-48 overflow-hidden" aria-hidden="true">
            <NordicSwooshGraphic variant="swoosh_only" color={accent} className="absolute right-0 top-1/2 h-32 w-48 -translate-y-1/2" style={{ opacity: 0.11 }} />
          </div>
          <div className="relative z-10 min-w-0 space-y-1">
            <div className="text-[12px] font-semibold" style={{ color: primary }}>{content.ctaText || 'Jetzt anfragen'}</div>
            <p className="text-[10px] text-slate-600">{[data.website, data.email, data.phone].filter(Boolean).join('  ·  ')}</p>
          </div>
          {visibility.qrCode !== false && content.qrCode?.enabled && qrUrl && (
            <div className="relative z-10 shrink-0"><QRCodeSVG value={qrUrl} size={compact ? 44 : 60} fgColor={primary} bgColor="#FFFFFF" /></div>
          )}
        </footer>
      )}
    </article>
  );
};
