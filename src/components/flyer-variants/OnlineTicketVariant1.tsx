import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FlyerVariantProps } from './VariantTypes';
import { DolomitiNordicSkiLogo, DolomitiSkierTrackEmblem, OFFICIAL_ASSET_PATHS } from '../CorporateVectors';
import { WireframeIcon } from '../WireframeIcon';
import { getSportsIconName } from '../../data/sportsIcons';
import { getLegalNoticeItems } from '../../utils/disclaimerUtils';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';
import { RegionalAreasGridBlock } from '../blocks/RegionalAreasGridBlock';

export const OnlineTicketVariant1: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons = [],
  visibility = {} as any
}) => {
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  const lang = content.activeLanguage || 'it';
  const translations = content.translations || {};
  const activeTranslation = translations[lang] || {};

  const passType = content.digitalPassType || 'weekly_dns';

  // Dynamic pass title according to pass type & language
  const defaultPassTitle = 
    passType === 'daily_area'
      ? (lang === 'en' ? 'DAY AREA' : lang === 'de' ? 'TAGESKARTE AREA' : 'BIGLIETTO GIORNALIERO')
      : passType === 'weekly_area'
      ? (lang === 'en' ? 'WEEK AREA' : lang === 'de' ? 'WOCHENKARTE AREA' : 'SETTIMANALE DI AREA')
      : (lang === 'en' ? 'WEEK DOLOMITI NORDICSKI' : lang === 'de' ? 'WOCHENKARTE DOLOMITI NORDICSKI' : 'SETTIMANALE DOLOMITI NORDICSKI');

  let rawTitle = activeTranslation.title || content.title;
  if (!rawTitle || rawTitle === 'WOCHENKARTE / SETTIMANALE 7 DAYS' || rawTitle === 'BIGLIETTO GIORNALIERO' || rawTitle === 'SETTIMANALE DI AREA' || rawTitle === 'SETTIMANALE DOLOMITI NORDICSKI') {
    rawTitle = defaultPassTitle;
  }
  const displayTitle = rawTitle;

  const displaySubtitle = activeTranslation.subtitle || content.subtitle || '';
  const displayHeaderTagline = activeTranslation.headerTagline || content.headerTagline || '';

  // Dynamic spacing and font sizes
  const paddingClass = isA5 ? (isLandscape ? 'p-2' : 'p-2.5') : 'p-5 sm:p-7';
  const mainGap = isA5 ? 'gap-1.5' : 'gap-4';

  const titleSize = isA5 ? 'text-lg' : 'text-2xl sm:text-3xl';
  const priceSize = isA5 ? 'text-2xl' : 'text-3xl sm:text-4xl';
  const qrSize = isA5 ? 60 : 105;

  // Serial ticket code placeholder
  const ticketSerial = content.addressInfo?.includes('Ticket ID')
    ? content.addressInfo
    : `TICKET ID: #TK-2026-DNS-${Math.floor(10000 + Math.random() * 90000)}`;

  // Localized Labels
  const validityTitle = lang === 'de' 
    ? 'GÜLTIGKEIT DES TICKETS' 
    : lang === 'en' 
    ? 'TICKET VALIDITY' 
    : 'VALIDITÀ DEL BIGLIETTO';

  const statusText = lang === 'de' ? 'GÜLTIG' : lang === 'en' ? 'VALID' : 'VALIDO';
  const issuerLabel = lang === 'de' ? 'Aussteller:' : lang === 'en' ? 'Issuer:' : 'Emettitore:';
  const holderLabel = lang === 'de' ? 'Inhaber / Name:' : lang === 'en' ? 'Holder Name:' : 'Nome e Cognome:';
  const issuedLabel = lang === 'de' ? 'Ausstellungsdatum:' : lang === 'en' ? 'Issue Date:' : 'Data Emissione:';
  const turnstileScanLabel = lang === 'de' ? 'DREHKREUZ-SCAN' : lang === 'en' ? 'TURNSTILE SCAN' : 'VARCO DI ACCESSO';
  const specTitle = lang === 'de' ? 'SPEZIFIKATIONEN & BEDINGUNGEN:' : lang === 'en' ? 'SPECIFICATIONS & CONDITIONS:' : 'SPECIFICHE & CONDIZIONI:';
  const servicesTitle = lang === 'de' ? 'AKTIVE SERVICES & SPORTARTEN:' : lang === 'en' ? 'ACTIVE SERVICES & SPORTS:' : 'SERVIZI & SPORT ATTIVI:';
  const verificationTitle = lang === 'de' ? 'PRÜFUNG & AUSSTELLER:' : lang === 'en' ? 'TICKET VERIFICATION & ISSUER:' : 'VERIFICA & EMETTITORE:';
  const ticketDetailsLabel = lang === 'de' ? 'TICKET-DETAILS:' : lang === 'en' ? 'TICKET DETAILS:' : 'DETTAGLIO TICKET:';
  const helpContactLabel = lang === 'de' ? 'Hilfe / Kontakt:' : lang === 'en' ? 'Help / Contact:' : 'Assistenza / Contatti:';
  const officialLayoutNote = lang === 'de' 
    ? 'Offizielles digitales Ticket-Layout ausgestellt von '
    : lang === 'en' 
    ? 'Official Digital Pass layout issued by '
    : 'Layout Ufficiale Digital Pass emesso da ';

  const defaultTagline = lang === 'de' 
    ? 'OFFIZIELLES DIGITALES TICKET' 
    : lang === 'en' 
    ? 'OFFICIAL DIGITAL PASS' 
    : 'BIGLIETTO DIGITALE UFFICIALE';

  // Turnstile instructions localized
  const turnstileText = lang === 'de'
    ? 'Anweisungen am Drehkreuz: QR-Code an den optischen Leser des Drehkreuzes halten, um den Zugang zu entwerten.'
    : lang === 'en'
    ? 'Turnstile instructions: Hold the QR Code to the optical scanner at the access gates to validate access.'
    : 'Istruzioni ai varchi: Accostare il QR Code al lettore ottico dei tornelli per convalidare l\'accesso alle piste.';

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${paddingClass} font-vietnam gap-1.5 sm:gap-2 overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.cardBgHex }}
    >
      
      {/* 1. MANIFESTO HEADER BANNER */}
      {visibility.header !== false && (
        <div 
          className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border shadow-sm relative overflow-hidden shrink-0 flex flex-col gap-1.5"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
            borderColor: `${theme.accentHex}40`,
            color: '#FFFFFF'
          }}
        >
          {/* Subtle Watermark Skier Emblem */}
          <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none w-24 h-24 sm:w-28 sm:h-28">
            <DolomitiSkierTrackEmblem color="#FFFFFF" />
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 relative z-10">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#AAD0D1] block break-words whitespace-normal leading-tight">
                {displayHeaderTagline}
              </span>
              <h1 className={`${titleSize} font-black tracking-tight leading-none text-white font-vietnam uppercase break-words`}>
                {displayTitle}
              </h1>
              <p className="text-[9.5px] sm:text-[10.5px] text-slate-200 font-bold tracking-tight break-words whitespace-normal leading-snug">
                {displaySubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div 
                className={`shrink-0 flex items-center justify-center gap-1.5 ${
                  (content.logoCornerStyle || 'rounded') === 'none' 
                    ? '' 
                    : (content.logoCornerStyle === 'sharp' ? 'rounded-none border p-1 bg-white/90 shadow-xs border-white/20' : 'rounded-lg border p-1 bg-white/90 shadow-xs border-white/20')
                }`}
                style={{ transform: `scale(${(regionLogo?.regionalLogoScale || 100) / 100})`, transformOrigin: 'right center' }}
              >
                <img
                  src={regionLogo?.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe}
                  alt={regionLogo?.name || 'Dolomiti NordicSki'}
                  className="h-7 sm:h-9 object-contain max-w-[85px]"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== OFFICIAL_ASSET_PATHS.logoFarbe) {
                      target.src = OFFICIAL_ASSET_PATHS.logoFarbe;
                    }
                  }}
                />
                {regionLogo?.secondaryLogoSrc && (
                  <img
                    src={regionLogo.secondaryLogoSrc}
                    alt={`${regionLogo.name} Secondary`}
                    className="h-7 sm:h-9 object-contain max-w-[85px]"
                  />
                )}
              </div>

              {(regionLogo?.dnsLogoPlacement === 'header' || !regionLogo?.dnsLogoPlacement) && (
                <DolomitiNordicSkiLogo 
                  variant="horizontal_light" 
                  className="h-8 sm:h-11 shrink-0 object-contain" 
                  cornerStyle={content.logoCornerStyle}
                />
              )}
            </div>
          </div>

          {/* Sub Header Ticket Specs Bar */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/15 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-100 relative z-10">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded bg-[#AAD0D1] text-[#0D4D5E] font-black shadow-2xs">
                DIGITAL PASS
              </span>
              <span className="truncate">{regionLogo?.regionName || content.location || 'Dolomiti NordicSki'}</span>
            </div>
            <div className="text-right text-[#AAD0D1] font-black shrink-0 ml-2">
              SEASON {content.validityPeriod || '2026/27'}
            </div>
          </div>
        </div>
      )}

      {/* Hero Image Buffer */}
      {visibility.heroImage !== false && (
        <div 
          className={`relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs shrink-0 transition-all duration-300 ${!content.heroImageHeightPx ? (isA5 ? 'h-[70px]' : isLandscape ? 'h-[90px]' : 'h-[110px] sm:h-[130px]') : ''}`}
          style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
        >
          <img 
            src={content.heroImageUrl || 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=1000'} 
            alt={displayTitle || 'Hero Banner'} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 2. MAIN TICKET COUPON & HOLDER / SCANNER BLOCK */}
      <div className="flex-1 flex flex-col justify-between gap-2 min-h-0">
        
        {/* Ticket Coupon Card */}
        {(visibility.promotionBox !== false || visibility.priceTables !== false) && (
          <div 
            className="rounded-xl sm:rounded-2xl border-2 p-2.5 sm:p-3.5 shadow-sm space-y-2 relative overflow-hidden shrink-0"
            style={{ backgroundColor: theme.bgHex, borderColor: `${theme.primaryHex}40` }}
          >
            {/* Cut line & Tagline */}
            <div className="flex items-center justify-between gap-2 border-b-2 border-dashed pb-2" style={{ borderColor: `${theme.primaryHex}30` }}>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[8.5px] font-black uppercase text-slate-400 tracking-widest">
                  DIGITAL PASS • {regionLogo?.regionName || 'Dolomiti NordicSki'}
                </div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-tight" style={{ color: theme.primaryHex }}>
                  {regionLogo?.regionName || content.location || 'Dolomiti NordicSki Area'}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[8.5px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 tracking-wider">
                  {(activeTranslation.pricePrefix || content.pricePrefix || (lang === 'de' ? 'PREIS' : lang === 'en' ? 'PRICE' : 'PREZZO'))}: {content.priceAmount} {content.priceCurrency}
                </span>
              </div>
            </div>

            {/* Price, Holder Info, Verification & Enlarged QR Grid */}
            <div className="grid grid-cols-12 gap-2.5 items-stretch">
              
              {/* Left Ticket Details & Holder Information */}
              <div className="col-span-7 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">
                    {ticketDetailsLabel}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {displayTitle}
                  </div>
                  <p className="text-[9.5px] text-slate-600 font-bold mt-0.5 leading-snug">
                    {displaySubtitle}
                  </p>
                </div>

                {/* Holder Name & Issue Date Fields */}
                <div className="p-2 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[7.5px] block">{holderLabel}</span>
                      <span className="font-extrabold text-slate-900 block truncate">{content.holderName || 'Mario Rossi'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[7.5px] block">{issuedLabel}</span>
                      <span className="font-extrabold text-slate-900 block truncate">{content.issueDate || '15.12.2026'}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 grid grid-cols-2 gap-2 text-[8.5px] font-black uppercase">
                    <div>
                      <span className="text-slate-400 font-bold text-[7.5px] block">{issuerLabel}</span>
                      <span className="text-[#0D4D5E] font-black block truncate">{regionLogo?.regionName || 'Dolomiti NordicSki'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[7.5px] block">Serial / Status:</span>
                      <span className="text-emerald-700 font-black block truncate">{ticketSerial} • {statusText}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Enlarged QR Code Block */}
              <div className="col-span-5 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs">
                {visibility.qrCode !== false && content.qrCode?.enabled && (
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <QRCodeSVG 
                      value={content.qrCode.url || 'https://www.dolomitinordicski.com'} 
                      size={isA5 ? 55 : 85} 
                      fgColor={theme.primaryHex} 
                    />
                  </div>
                )}

                <div className="text-[7.5px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {turnstileScanLabel}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. REGIONAL AREAS VALIDITY TABLE (GRID OF 8 REGIONS / ALL AREAS) */}
        {(visibility?.servicesBox !== false || visibility?.priceTables !== false) && (
          <div className="shrink-0">
            <RegionalAreasGridBlock 
              selectedRegionOption={content.selectedRegionOption}
              activeRegionId={content.regionId}
              digitalPassType={content.digitalPassType || 'weekly_dns'}
              themePrimaryHex={theme.primaryHex}
              isA5={isA5}
              titleOverride={content.validityTitle}
            />
          </div>
        )}

        {/* 3B. BANNER PROMOZIONALE (DIGITAL PASS) */}
        {content.promoBannerEnabled && (
          <div 
            className="rounded-xl p-2 sm:p-2.5 border shadow-2xs flex items-center justify-between gap-2 shrink-0 min-w-0"
            style={{
              backgroundColor: content.promoBannerBgColor || '#FEF3C7',
              borderColor: content.promoBannerBgColor ? `${content.promoBannerBgColor}CC` : '#F59E0B',
              color: content.promoBannerTextColor || '#78350F'
            }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm sm:text-base shrink-0">{content.promoBannerIcon || '📢'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span 
                    className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider font-vietnam truncate"
                    style={{ color: content.promoBannerTextColor || '#78350F' }}
                  >
                    {activeTranslation.promoBannerTitle || content.promoBannerTitle || 'OFFERTA PROMOZIONALE'}
                  </span>
                  {(activeTranslation.promoBannerBadge || content.promoBannerBadge) && (
                    <span 
                      className="text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded shadow-2xs shrink-0 font-vietnam"
                      style={{
                        backgroundColor: content.promoBannerTextColor || '#D97706',
                        color: content.promoBannerBgColor || '#FFFFFF'
                      }}
                    >
                      {activeTranslation.promoBannerBadge || content.promoBannerBadge}
                    </span>
                  )}
                </div>
                {(activeTranslation.promoBannerText || content.promoBannerText) && (
                  <p 
                    className="text-[8.5px] sm:text-[9px] font-extrabold leading-tight mt-0.5 break-words"
                    style={{ color: content.promoBannerTextColor || '#78350F' }}
                  >
                    {activeTranslation.promoBannerText || content.promoBannerText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3C. BANNER ECO (DIGITAL PASS) */}
        {content.ecoBannerEnabled && (
          <div 
            className="rounded-xl p-2 sm:p-2.5 border shadow-2xs flex items-center justify-between gap-2 shrink-0 min-w-0"
            style={{
              background: content.ecoBannerBgColor || 'linear-gradient(135deg, #065F46, #047857)',
              borderColor: content.ecoBannerBgColor ? `${content.ecoBannerBgColor}CC` : '#10B981',
              color: content.ecoBannerTextColor || '#FFFFFF'
            }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm sm:text-base shrink-0">{content.ecoBannerIcon || '🍃'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span 
                    className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider font-vietnam truncate"
                    style={{ color: content.ecoBannerTextColor || '#FFFFFF' }}
                  >
                    {activeTranslation.ecoBannerTitle || content.ecoBannerTitle || 'GREEN MOBILITY & ECO-TICKET'}
                  </span>
                  {(activeTranslation.ecoBannerTagline || content.ecoBannerTagline) && (
                    <span 
                      className="text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 font-vietnam"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: content.ecoBannerTextColor || '#FFFFFF'
                      }}
                    >
                      {activeTranslation.ecoBannerTagline || content.ecoBannerTagline}
                    </span>
                  )}
                </div>
                {(activeTranslation.ecoBannerText || content.ecoBannerText) && (
                  <p 
                    className="text-[8.5px] sm:text-[9px] font-medium leading-tight mt-0.5 break-words opacity-95"
                    style={{ color: content.ecoBannerTextColor || '#FFFFFF' }}
                  >
                    {activeTranslation.ecoBannerText || content.ecoBannerText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3D. VERIFICA TICKET & VARCHI AUTOMATICI BLOCK */}
        {visibility.turnstileNote !== false && (
          <div className="bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1 shrink-0 min-w-0">
            <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-black uppercase text-[#0D4D5E] font-vietnam">
              <span className="flex items-center gap-1">
                <span>🔍</span>
                <span>{verificationTitle}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-extrabold">
                {statusText}
              </span>
            </div>
            <p className="text-[8.5px] sm:text-[9px] text-slate-700 font-bold leading-tight">
              {turnstileText}
            </p>
          </div>
        )}

        {/* 4. OPTIONAL TICKET SPECIFICATIONS & INCLUSIONS */}
        {visibility.features !== false && (
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 shrink-0 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0D4D5E] font-vietnam flex items-center gap-1">
                <span>📋</span>
                <span>{content.featuresTitle || specTitle}</span>
              </h3>
              <div className="text-[8.5px] font-bold text-slate-500">
                {turnstileText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {content.features.slice(0, 4).map((feat, idx) => {
                const featText = activeTranslation.features?.[idx]?.text || feat.text;

                return (
                  <div 
                    key={feat.id} 
                    className={`p-1 sm:p-1.5 rounded-lg text-[9.5px] sm:text-[10px] font-bold flex items-start gap-1.5 ${
                      feat.highlight 
                        ? 'bg-[#0D4D5E]/10 text-[#0D4D5E] border border-[#0D4D5E]/20' 
                        : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span className="text-[#0D4D5E] font-black shrink-0 mt-0.5">✓</span>
                    <span className="leading-tight font-bold">{featText}</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Sports & Services Icons Strip */}
            {visibility.sportsIcons !== false && activeSportsIcons.length > 0 && (
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] font-black uppercase text-slate-500">
                <span>{servicesTitle}</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {activeSportsIcons.map((icon) => (
                    <div 
                      key={icon.id}
                      className="flex items-center gap-1 px-1.5 py-0.2 bg-slate-50 rounded border border-slate-200 text-[8.5px] font-extrabold text-[#0D4D5E]"
                    >
                      <WireframeIcon icon={icon} className="w-2.5 h-2.5 text-[#0D4D5E]" />
                      <span className="truncate max-w-[90px]">{getSportsIconName(icon, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. OFFICIAL LEGAL DISCLAIMER */}
      {visibility.disclaimer !== false && (
        <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg border border-slate-200 text-[8px] sm:text-[8.5px] text-slate-600 leading-tight font-medium shrink-0 shadow-inner">
          <p className="break-words">
            {activeTranslation.disclaimer || (lang === 'de' ? plt.disclaimerDe : lang === 'en' ? plt.disclaimerEn : plt.disclaimerIt)}
          </p>
        </div>
      )}

      {/* 5. FOOTER */}
      {visibility.footer !== false && (
        <div className="shrink-0">
          <BrandFooterBlock 
            content={content}
            theme={theme}
            plt={plt}
            regionLogo={regionLogo}
            visibility={visibility}
            isA3={isA3}
            isA5={isA5}
            isBackground={false}
            activeColors={{
              primary: theme.primaryHex,
              secondary: theme.secondaryHex,
              accent: theme.accentHex,
              background: theme.bgHex,
              cardBg: '#FFFFFF',
              textColor: theme.textColorHex
            }}
          />
        </div>
      )}

    </div>
  );
};

export const OnlineTicketVariant = OnlineTicketVariant1;
