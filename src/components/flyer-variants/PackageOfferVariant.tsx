import { resolveDNSFlyerPhoto } from '../../data/dnsStockPhotos';
import React from 'react';
import { resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';
import { QRCodeSVG } from 'qrcode.react';
import { DolomitiFullLogo, NordicSwooshGraphic } from '../CorporateVectors';
import type { FlyerVariantProps } from './VariantTypes';
import { resolveHotelPackageData, officialPackageAreaName } from './resolveFlyerData';
import { getFlyerPrintTypography, getFlyerPrintFontSizes } from '../../design/flyerPrintTypography';

/**
 * Print-first package composition. Editorial content only: no tariff lookup,
 * no cards, no service tiles, no dashboard chrome.
 */
export const PackageOfferVariant: React.FC<FlyerVariantProps> = ({
  content, theme, regionLogo, visibility,
}) => {
  const data = resolveHotelPackageData(content, content.activeLanguage || 'de');
  const areaName = officialPackageAreaName(content.regionId, content.activeLanguage || 'de');
  const landscape = content.orientation === 'landscape';
  const compact = content.format === 'A5';
  const tight = landscape || compact;
  const printType = getFlyerPrintTypography(content.format || 'A4');
  const layoutScale = Math.max(0.90, Math.min(1.24, content.textScaleFactor ?? 1));
  const printSizes = getFlyerPrintFontSizes(content.format || 'A4', layoutScale);
  const longCopy = data.title.length > 46 || data.subtitle.length > 110;
  const visibleFeatures = data.features.filter(feature => feature.text?.trim());
  const denseCopy = data.subtitle.length > 110 || visibleFeatures.length > 3 || Boolean(data.priceNote);
  const primary = theme.primaryHex;
  const photoMargin = compact ? 'mx-5' : 'mx-9';
  // Area identity only on small existing graphic accents; corporate palette stays intact.
  const accent = theme.accentHex;
  const areaAccent = resolveDNSRegionAccent(content.regionId) || accent;
  const regionalLogo = regionLogo?.logoSrc;
  const partnerLogo = content.customRegionalLogoUrl;
  const hasPrice = Boolean(data.priceAmount.trim());
  const heroImageUrl = resolveDNSFlyerPhoto(content.heroImageUrl, 'hotel_skipass_package');
  const showPhoto = visibility.heroImage !== false && Boolean(heroImageUrl);
  const showServices = visibility.servicesBox !== false && visibleFeatures.length > 0;
  const qrUrl = content.qrCode?.url || (data.website ? (data.website.startsWith('http') ? data.website : `https://${data.website}`) : '');
  const focus = `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%`;

  const image = showPhoto ? (
    <div className={`relative overflow-hidden min-h-0 bg-slate-100 ${landscape ? '' : photoMargin}`} style={{ flex: landscape ? '0 0 38%' : `0 0 ${denseCopy ? 36 : 45}%` }}>
      <img src={heroImageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: focus }} referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 ${compact ? 'p-5' : 'p-9'}`}>
        <span className="inline-block h-1 w-12 mb-3" data-dns-area-accent="package-photo" style={{ backgroundColor: areaAccent }} />
        <p className={`text-white ${printType.label} font-semibold uppercase tracking-wide`} style={{fontSize:printSizes.label}}>{data.location || 'Dolomiti NordicSki'}</p>
      </div>
    </div>
  ) : null;

  return (
    <article className="relative z-10 flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam text-slate-900" data-package-layout={landscape ? 'split' : 'editorial'}>
      {visibility.header !== false && (
        <header className={`flex shrink-0 items-center justify-between gap-4 ${compact ? 'px-6 py-4' : 'px-10 py-7'}`}>
          <div className="flex min-w-0 items-center gap-3">
            {regionalLogo && content.regionId !== 'dns_central' ? (
              <img src={regionalLogo} alt={areaName || regionLogo?.regionName || 'Area partner'}
                className={compact ? 'h-11 max-w-[170px] object-contain' : 'h-16 max-w-[280px] object-contain'} />
            ) : <span className="text-sm font-semibold" style={{ color: primary }}>{areaName || 'Dolomiti NordicSki'}</span>}
            {partnerLogo && <img src={partnerLogo} alt="Partner" className={compact ? 'h-8 max-w-[75px] object-contain' : 'h-10 max-w-[100px] object-contain'} />}
          </div>
          <div className="shrink-0 opacity-80">
            <DolomitiFullLogo variant={content.logoVariant} isDarkHeader={false}
              className={compact ? 'h-6 w-auto max-w-[95px] object-contain' : 'h-9 w-auto max-w-[155px] object-contain'}
              customPrimary={primary} customAccent={accent} cornerStyle={content.logoCornerStyle} />
          </div>
        </header>
      )}
      <div className={`flex min-h-0 flex-1 ${landscape ? 'flex-row px-7 gap-4' : 'flex-col'}`}>
        {image}
        <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${landscape ? 'justify-start' : 'justify-between'} ${compact ? 'gap-2 px-6 py-3' : landscape ? 'gap-2 px-1 py-2' : denseCopy ? 'gap-3 px-10 py-5' : 'gap-5 px-10 py-7'}`}>
          <div className="min-w-0">
            <div className={landscape ? 'mb-2 h-1 w-12' : 'mb-5 h-1 w-12'} data-dns-area-accent="package-heading" style={{ backgroundColor: areaAccent }} />
            {data.badge && <p className={`${tight ? `mb-1 ${printType.label}` : `mb-3 ${printType.label}`} font-semibold uppercase tracking-[0.17em]`} style={{ color: primary }}>{data.badge}</p>}
            <h1 className={`${compact ? 'text-2xl' : landscape ? (longCopy ? 'text-[26px]' : 'text-[32px]') : 'text-[44px]'} font-semibold leading-[1.08] tracking-tight break-words`} style={landscape ? { fontSize: `${Math.round((longCopy ? 28 : 34) * layoutScale)}px` } : undefined}>{data.title}</h1>
            {data.subtitle && <p className={`${tight ? `mt-1 ${printType.body} leading-snug` : `mt-4 ${printType.body} leading-snug`} text-slate-600 break-words`} style={{fontSize:printSizes.body}}>{data.subtitle}</p>}
            {(data.location || data.validityPeriod) && <p className={`${tight ? `mt-2 ${printType.detail}` : `mt-4 ${printType.detail}`} tracking-wide text-slate-500 break-words`} style={{fontSize:printSizes.detail}}>{[data.location, data.validityPeriod].filter(Boolean).join('  ·  ')}</p>}
          </div>
          {showServices && (
            <div className="min-w-0">
              {data.featuresTitle && <p className={`mb-2 ${printType.label} font-semibold uppercase tracking-wide text-slate-600`} style={{fontSize:printSizes.label}}>{data.featuresTitle}</p>}
              <p className={`${printType.body} leading-snug text-slate-700 break-words`} style={{fontSize:printSizes.body}}>
                {visibleFeatures.map(feature => feature.text).join('  ·  ')}
              </p>
            </div>
          )}
          {visibility.priceTables !== false && (
            <div className={`flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 break-words ${landscape ? "mt-auto pt-2" : ""}`}>
              {hasPrice ? (
                <>
                  {data.pricePrefix && <span className={`${printType.detail} uppercase tracking-wide text-slate-600`} style={{fontSize:printSizes.detail}}>{data.pricePrefix}</span>}
                  <span className={`${compact ? 'text-3xl' : landscape ? 'text-4xl' : 'text-5xl'} font-semibold tracking-tight`} style={{ color: primary }}>{data.priceAmount} {data.priceCurrency}</span>
                  {data.priceSuffix && <span className={`${printType.detail} text-slate-600`} style={{fontSize:printSizes.detail}}>{data.priceSuffix}</span>}
                </>
              ) : <span className="text-lg font-medium" style={{ color: primary }}>{data.priceNote || 'Preis auf Anfrage'}</span>}
              {hasPrice && data.priceNote && <p className={`w-full ${printType.detail} leading-snug text-slate-600`} style={{fontSize:printSizes.detail}}>{data.priceNote}</p>}
            </div>
          )}
        </div>
      </div>
      {visibility.footer !== false && (
        <footer className={`relative isolate flex shrink-0 items-end justify-between gap-5 border-t border-slate-200 ${compact ? 'px-6 py-4' : 'px-10 py-6'}`}>
          <div className="pointer-events-none absolute inset-y-0 right-5 z-0 w-[65%] overflow-hidden" aria-hidden="true">
            <NordicSwooshGraphic variant="swoosh_only" color={accent} className="absolute right-0 top-1/2 h-32 w-full -translate-y-1/2" style={{ opacity: 0.17 }} />
          </div>
          <div className="relative z-10 min-w-0 space-y-1">
            <div className={`${printType.callToAction} font-semibold`} style={{ color: primary, fontSize: printSizes.callToAction }}>{content.ctaText || 'Jetzt anfragen'}</div>
            <p className={`${printType.footer} text-slate-600 break-words`} style={{fontSize:printSizes.footer}}>{[data.website, data.email, data.phone].filter(Boolean).join('  ·  ')}</p>
          </div>
          {visibility.qrCode !== false && content.qrCode?.enabled && qrUrl && (
            <div className="relative z-10 shrink-0"><QRCodeSVG value={qrUrl} size={compact ? 44 : 60} fgColor={primary} bgColor="#FFFFFF" /></div>
          )}
        </footer>
      )}
    </article>
  );
};
