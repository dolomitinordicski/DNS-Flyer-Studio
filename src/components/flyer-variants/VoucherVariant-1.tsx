import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FlyerVariantProps } from './VariantTypes';
import { DolomitiNordicSkiLogo, DolomitiSkierTrackEmblem, OFFICIAL_ASSET_PATHS } from '../CorporateVectors';
import { WireframeIcon } from '../WireframeIcon';
import { getSportsIconName } from '../../data/sportsIcons';
import { getLegalNoticeItems } from '../../utils/disclaimerUtils';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';

export const VoucherVariant1: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons = [],
  visibility
}) => {
  // Format awareness
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  // Calculate density to adjust spacing
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 5;

  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5')) 
    : isA3 
    ? (isAiry ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-5') 
    : (isAiry ? 'gap-4' : 'gap-2.5 sm:gap-3');

  const mainPadding = isA5 
    ? (isLandscape ? 'p-1.5' : 'p-2.5') 
    : isA3 
    ? 'p-8 sm:p-12' 
    : (isAiry ? 'p-5 sm:p-7' : 'p-4 sm:p-5');

  const headerTaglineSize = isA5 
    ? 'text-[10px]' 
    : isA3 
    ? 'text-lg sm:text-xl' 
    : 'text-sm sm:text-base lg:text-lg';

  const titleSize = isA5 
    ? 'text-lg' 
    : isA3 
    ? 'text-4xl sm:text-5xl' 
    : isLandscape ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-4xl';

  const headerSubtitleSize = isA5 
    ? 'text-[9.5px]' 
    : isA3 
    ? 'text-sm sm:text-base' 
    : 'text-xs sm:text-sm lg:text-base';

  const dnsLogoSize = isA5 
    ? (isLandscape ? 'h-7' : 'h-8') 
    : isA3 
    ? 'h-20 sm:h-28' 
    : isLandscape ? 'h-12 sm:h-14' : 'h-14 sm:h-18 lg:h-20';

  const regionLogoSize = isA5 
    ? 'h-7 max-w-[65px]' 
    : isA3 
    ? 'h-16 sm:h-20 max-w-[130px]' 
    : 'h-11 sm:h-14 lg:h-16 max-w-[95px]';

  const priceSize = isA5 
    ? 'text-xl' 
    : isA3 
    ? 'text-4xl sm:text-5xl' 
    : 'text-2xl sm:text-3xl';

  const qrCodeSize = isA5 ? 45 : isA3 ? 95 : isLandscape ? 60 : 72;

  // Generate or extract serial code for ticket / voucher
  const ticketSerial = content.addressInfo?.includes('Ticket ID')
    ? content.addressInfo
    : `TICKET ID: #TK-2026-DNS-${content.regionId?.toUpperCase() || 'GENERAL'}-04892`;

  const isOnlineTicket = content.graphicStyle === 'online_ticket_manifesto' || 
    ['ticket_online_daily', 'ticket_online_weekly_area', 'ticket_online_weekly_dns'].includes(content.title?.toLowerCase() || '');

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${mainPadding} font-vietnam ${mainGap} overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.cardBgHex }}
    >
      
      {/* 1. MANIFESTO HEADER PASS BAR */}
      {visibility.header && (
        <div 
          className="flex items-center justify-between border-b-2 pb-3 sm:pb-3.5 gap-3.5 shrink-0 min-w-0 relative" 
          style={{ borderColor: theme.primaryHex }}
        >
          <div className="space-y-1 flex-1 min-w-0">
            <span 
              className={`${headerTaglineSize} font-black uppercase tracking-widest block break-words whitespace-normal leading-snug`} 
              style={{ color: theme.primaryHex }}
            >
              {content.headerTagline || 'Wochenkarte / SETTIMANALE / WEEKLY TICKET'}
            </span>

            <h2 className={`${titleSize} font-black text-slate-900 font-vietnam leading-tight break-words uppercase`}>
              {content.title || 'LOIPENTICKET / BIGLIETTO DA SCI DI FONDO'}
            </h2>

            <div className={`${headerSubtitleSize} text-slate-600 font-bold flex flex-wrap items-center gap-2`}>
              <span className="uppercase tracking-tight">
                {content.subtitle || 'CROSS COUNTRY SKI TICKET - DOLOMITI NORDICSKI'}
              </span>
              {content.location && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="uppercase font-black tracking-widest truncate" style={{ color: theme.primaryHex }}>
                    {content.location}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end justify-center gap-1.5 shrink-0 max-w-[45%]">
            {(regionLogo?.dnsLogoPlacement === 'header' || !regionLogo?.dnsLogoPlacement) && (
              <DolomitiNordicSkiLogo 
                variant={content.logoVariant || 'original'} 
                className={`${dnsLogoSize} shrink-0 object-contain`} 
                customPrimary={theme.primaryHex} 
                customSecondary={theme.secondaryHex}
                customAccent={theme.accentHex} 
                cornerStyle={content.logoCornerStyle}
              />
            )}

            {regionLogo && regionLogo.id !== 'dns_central' && (
              <div 
                className={`flex items-center justify-center gap-1.5 shrink-0 ${
                  (content.logoCornerStyle || 'rounded') === 'none'
                    ? ''
                    : (content.logoCornerStyle === 'sharp' ? 'bg-white p-1.5 rounded-none border border-slate-200 shadow-xs' : 'bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs')
                }`}
                style={{ transform: `scale(${(regionLogo.regionalLogoScale || 100) / 100})`, transformOrigin: 'right center' }}
              >
                <img
                  src={regionLogo.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe}
                  alt={regionLogo.name}
                  className={`${regionLogoSize} object-contain`}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                {regionLogo.secondaryLogoSrc && (
                  <img
                    src={regionLogo.secondaryLogoSrc}
                    alt={`${regionLogo.name} Secondary`}
                    className={`${regionLogoSize} object-contain`}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Image Buffer */}
      {visibility.heroImage && content.heroImageUrl && (
        <div 
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md shrink-0 transition-all duration-300 ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[60px] max-h-[140px]' : isA3 ? 'flex-1 min-h-[180px] max-h-[400px]' : isLandscape ? 'flex-1 min-h-[80px] max-h-[200px]' : 'flex-1 min-h-[100px] max-h-[300px]') : ''}`}
          style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
        >
          <img src={content.heroImageUrl} alt={content.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 2. MAIN COUPON / TICKET PASS CARD */}
      <div className={`flex-1 flex ${isLandscape ? 'flex-row gap-3' : 'flex-col ' + mainGap} min-h-0 justify-between`}>

        {/* Ticket Details & Price Coupon Box */}
        {visibility.promotionBox && (
          <div 
            className={`p-3 sm:p-4 rounded-2xl border-2 flex ${isLandscape ? 'flex-col justify-between w-[40%] shrink-0' : 'flex-wrap sm:flex-nowrap items-center justify-between'} gap-3 text-xs sm:text-sm shadow-md min-w-0 relative overflow-hidden`}
            style={{ backgroundColor: theme.bgHex, borderColor: `${theme.primaryHex}40` }}
          >
            {/* Background Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none w-32 h-32">
              <DolomitiSkierTrackEmblem color={theme.primaryHex} />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 relative z-10">
              <div className="flex items-center justify-between gap-2 border-b border-dashed pb-1.5" style={{ borderColor: `${theme.primaryHex}30` }}>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest truncate">
                  INTESTATARIO / SERIALE TICKET
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 tracking-wider shrink-0">
                  STAGIONE {content.validityPeriod || '2026/27'}
                </span>
              </div>

              <div className={`font-black ${isA5 ? 'text-sm' : isA3 ? 'text-xl' : 'text-base sm:text-lg'} tracking-tight break-words uppercase`} style={{ color: theme.primaryHex }}>
                {content.badgeText || content.subtitle || 'OSPITE DOLOMITI NORDICSKI'}
              </div>

              <div className="text-[9.5px] text-slate-600 font-bold flex items-center gap-1.5 truncate">
                <span className="text-slate-400 font-black">SERIAL:</span>
                <span className="truncate font-black" style={{ color: theme.primaryHex }}>{ticketSerial}</span>
              </div>

              {content.priceNote && (
                <div className="text-[9px] italic text-slate-600 font-bold bg-white/80 p-1.5 rounded-lg border border-slate-200/80 leading-tight break-words">
                  {content.priceNote}
                </div>
              )}
            </div>

            {/* Price Box + QR Code & Turnstile Barcode */}
            <div className={`flex ${isLandscape ? 'flex-row items-center justify-between w-full' : 'items-center gap-3'} shrink-0 relative z-10`}>
              
              <div className="text-right bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shrink-0 min-w-[105px] shadow-sm">
                <div className="text-[8.5px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                  {content.pricePrefix || 'TARIFFA / PREIS'}:
                </div>
                <div className={`${priceSize} font-black tracking-tighter break-all`} style={{ color: theme.primaryHex }}>
                  {content.priceAmount} {content.priceCurrency}
                </div>
                {content.priceSuffix && (
                  <div className="text-[8.5px] font-black text-slate-500 uppercase mt-0.5 tracking-wider opacity-90">
                    {content.priceSuffix}
                  </div>
                )}
              </div>

              {/* QR & Barcode Container */}
              {visibility.qrCode && content.qrCode.enabled && (
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shrink-0 shadow-sm flex flex-col items-center justify-center text-center">
                  <QRCodeSVG 
                    value={content.qrCode.url || 'https://www.dolomitinordicski.com'} 
                    size={qrCodeSize} 
                    fgColor={theme.primaryHex} 
                  />
                  
                  {/* Simulated 1D Barcode Graphic */}
                  <div className="w-full flex justify-between items-center h-3 px-0.5 bg-slate-900 rounded mt-1.5 opacity-90 overflow-hidden">
                    {[3, 1, 4, 2, 1, 5, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 5].map((w, i) => (
                      <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    VARCO SCAN
                  </span>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 3. TICKET SPECIFICATIONS OR 8-AREA VALIDITY GRID */}
        {visibility.priceTables && (
          <div className={`space-y-1.5 min-w-0 flex-1 flex flex-col justify-between ${isLandscape ? 'w-[58%]' : 'w-full'}`}>
            
            <div className="flex items-center justify-between">
              <h3 className={`${isA5 ? 'text-[10px]' : isA3 ? 'text-base' : 'text-xs sm:text-sm'} font-black uppercase tracking-widest shrink-0`} style={{ color: theme.primaryHex }}>
                Gültigkeit des Tickets / Validità del Ticket (8 Valli):
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                {content.regionId === 'dns_central' ? 'Tutte le 8 Valli Attive' : 'Area Selezionata'}
              </span>
            </div>

            {/* 8 Valli Grid */}
            <div className={`grid ${isLandscape ? 'grid-cols-2 flex-1' : isA3 ? 'grid-cols-4' : 'grid-cols-2'} ${isA5 ? 'gap-1 text-[8.5px]' : isA3 ? 'gap-2.5 text-sm' : 'gap-1.5 text-[9.5px] sm:text-[10.5px]'} items-stretch`}>
              {[
                { code: '02', name: 'Antholzertal / Valle Anterselva', id: 'anterselva' },
                { code: '03', name: 'Gsiesertal-Welsberg-Taisten / Val Casies', id: 'gsiesertal' },
                { code: '04', name: '3 Zinnen Dolomites / 3 Cime Dolomiti', id: '3_zinnen' },
                { code: '05', name: 'Osttirol', id: 'osttirol' },
                { code: '06', name: 'Comelico', id: 'comelico' },
                { code: '07', name: 'Cortina d’Ampezzo', id: 'cortina' },
                { code: '08', name: 'Ahrntal / Valle Aurina', id: 'ahrntal' },
                { code: '09', name: 'Seiser Alm / Val Gardena', id: 'seiser_alm_val_gardena' }
              ].map((area) => {
                const isActive = content.regionId === area.id || content.regionId === 'dns_central';
                return (
                  <div 
                    key={area.code} 
                    className={`p-1.5 sm:p-2 rounded-xl border flex items-center gap-1.5 transition-all shadow-2xs min-w-0 ${isLandscape ? 'h-full' : ''}`}
                    style={
                      isActive 
                        ? { backgroundColor: theme.primaryHex, color: '#FFFFFF', borderColor: theme.primaryHex }
                        : { backgroundColor: theme.bgHex, color: theme.textColorHex, borderColor: `${theme.primaryHex}20` }
                    }
                  >
                    <span 
                      className="px-1.5 py-0.5 rounded-md text-[8.5px] font-black shadow-2xs shrink-0"
                      style={
                        isActive 
                          ? { backgroundColor: theme.accentHex, color: theme.primaryHex }
                          : { backgroundColor: '#E2E8F0', color: '#334155' }
                      }
                    >
                      {area.code}
                    </span>
                    <span className="truncate leading-tight font-bold tracking-tight min-w-0 flex-1">{area.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Optional Specific Conditions / Inclusions List if present */}
            {content.features && content.features.length > 0 && (
              <div className="pt-1.5 border-t border-slate-200 grid grid-cols-2 gap-1.5">
                {content.features.slice(0, 4).map((feat) => (
                  <div 
                    key={feat.id} 
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-700 flex items-center gap-1.5 truncate"
                  >
                    <span style={{ color: theme.primaryHex }} className="font-black shrink-0">✓</span>
                    <span className="truncate">{feat.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Active Sports & Services Icons Bar */}
            {visibility.sportsIcons !== false && activeSportsIcons.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                {activeSportsIcons.map((icon) => (
                  <div 
                    key={icon.id} 
                    className="p-1 px-2 rounded-lg bg-white border border-slate-200 text-[8.5px] font-black text-slate-800 flex items-center gap-1 shadow-2xs"
                  >
                    <WireframeIcon icon={icon} className="w-3 h-3" style={{ color: theme.primaryHex }} />
                    <span className="truncate max-w-[100px]">{getSportsIconName(icon, content.language || 'it')}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* 4. OFFICIAL LEGAL DISCLAIMER (MULTILINGUAL) */}
      {visibility.disclaimer && (() => {
        const legalItems = getLegalNoticeItems(plt, content);
        if (legalItems.length === 0) return null;
        return (
          <div className={`p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-200 ${isA5 ? 'text-[7px]' : isA3 ? 'text-xs' : 'text-[8px] sm:text-[9px]'} text-slate-600 leading-tight font-medium shadow-inner shrink-0 space-y-1`}>
            {legalItems.map((item) => (
              <div key={item.lang} className="flex items-start gap-1 min-w-0">
                <span className="font-extrabold text-[7px] uppercase tracking-wider text-slate-800 shrink-0 bg-slate-200/80 px-1 py-0.2 rounded font-vietnam">
                  {item.lang}:
                </span>
                <p className="break-words flex-1 min-w-0">{item.text}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* 5. FOOTER */}
      {visibility.footer && (
        <BrandFooterBlock 
          content={content}
          theme={theme}
          plt={plt}
          regionLogo={regionLogo}
          visibility={visibility}
          isA3={fmt === 'A3'}
          isA5={fmt === 'A5'}
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
      )}

    </div>
  );
};

export const VoucherVariant = VoucherVariant1;
