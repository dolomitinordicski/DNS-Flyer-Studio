import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail, Globe, MapPin, CheckCircle2, Hotel, Sparkles, QrCode, Tag } from 'lucide-react';
import { FlyerVariantProps } from './VariantTypes';
import { BrandHeaderBlock } from '../blocks/BrandHeaderBlock';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';
import { WireframeIcon } from '../WireframeIcon';
import { getSportsIconName } from '../../data/sportsIcons';
import { DolomitiSkierTrackEmblem } from '../CorporateVectors';

import { resolveHotelPackageData } from './resolveFlyerData';

export const HotelSkipassCompactVariant: React.FC<FlyerVariantProps> = ({
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

  const activeLang = content.activeLanguage || 'it';
  
  // Resolve localized package data
  const data = resolveHotelPackageData(content, activeLang);

  const displayTitle = data.title;
  const displaySubtitle = data.subtitle;
  const displayBadge = data.badge;
  const displayHeaderTagline = data.headerTagline;
  const displayLocation = data.location;
  const displayValidityPeriod = data.validityPeriod;
  
  const displayPricePrefix = data.pricePrefix;
  const displayPriceAmount = data.priceAmount;
  const displayPriceCurrency = data.priceCurrency;
  const displayPriceSuffix = data.priceSuffix;
  const displayPriceNote = data.priceNote;
  
  const displayFeaturesTitle = data.featuresTitle;
  const displayFeatures = data.features;

  const displayPromoBannerTitle = data.promoBannerTitle;
  const displayPromoBannerText = data.promoBannerText;

  const hotelName = data.hotelName;
  const phone = data.phone;
  const email = data.email;
  const website = data.website;

  const paddingClass = isA5 ? 'p-2.5' : 'p-4 sm:p-6';

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${paddingClass} font-vietnam gap-2.5 overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.bgHex }}
    >
      {/* 1. BRAND HEADER */}
      {visibility?.header !== false && (
        <BrandHeaderBlock
          content={{
            ...content,
            headerTagline: displayHeaderTagline,
            hideHeaderBadge: true
          }}
          theme={theme}
          regionLogo={regionLogo}
          visibility={visibility}
          format={fmt}
          orientation={content.orientation}
          activeLanguage={activeLang}
        />
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col gap-2.5 min-h-0">

        {/* 2. RECEPTION & NOTICE BOARD HIGH-CONTRAST HEADER CARD */}
        {visibility?.bigTitle !== false && (
          <div className="bg-[#0D4D5E] text-white rounded-2xl p-4 border-2 border-[#AAD0D1] shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-1 z-10 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#AAD0D1] text-[#0D4D5E]">
                  {displayBadge}
                </span>
                {displayLocation && (
                  <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded">
                    {displayLocation}
                  </span>
                )}
                {displayValidityPeriod && (
                  <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded">
                    {displayValidityPeriod}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase font-vietnam tracking-tight">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-xs font-medium text-slate-100/90 leading-snug">
                  {displaySubtitle}
                </p>
              )}
            </div>

            <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-[#AAD0D1]/20 border border-[#AAD0D1] text-[#AAD0D1]">
              <Hotel className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* HERO IMAGE (IF ACTIVE) */}
        {visibility?.heroImage !== false && content.heroImageUrl && (
          <div 
            className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs shrink-0"
            style={{ height: content.heroImageHeightPx ? `${content.heroImageHeightPx}px` : '110px' }}
          >
            <img 
              src={content.heroImageUrl} 
              alt="Hotel Special Package" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        {/* 3. XXL PRICE DISPLAY & ENLARGED RECEPTION QR CODE */}
        {(() => {
          const showPrice = visibility?.priceTables !== false;
          const showServices = visibility?.servicesBox !== false;

          if (!showPrice && !showServices) return null;

          return (
            <div className="grid grid-cols-12 gap-2.5 items-stretch flex-1 min-h-0">
              
              {/* XXL HIGH VISIBILITY PRICE BOX */}
              {showPrice && (
                <div className={`${showServices ? 'col-span-6' : 'col-span-12'} bg-white rounded-2xl p-4 border-2 border-[#0D4D5E] shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden`}>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0D4D5E] font-vietnam mb-1">
                    {displayPricePrefix}
                  </div>

                  <div className="flex items-baseline justify-center gap-1 my-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#0D4D5E] font-vietnam">{displayPriceCurrency}</span>
                    <span className="text-4xl sm:text-6xl font-black text-[#0D4D5E] leading-none font-vietnam tracking-tight">{displayPriceAmount}</span>
                  </div>

                  <div className="text-xs sm:text-sm font-black text-[#0D4D5E] uppercase font-vietnam bg-[#AAD0D1]/30 px-3 py-1 rounded-full border border-[#AAD0D1]">
                    {displayPriceSuffix}
                  </div>

                  {displayPriceNote && (
                    <p className="text-[9.5px] font-bold text-slate-600 mt-2 pt-2 border-t border-slate-200 leading-tight">
                      {displayPriceNote}
                    </p>
                  )}
                </div>
              )}

              {/* ENLARGED QR CODE FOR INSTANT SCANNING AT RECEPTION / NOTICE BOARD */}
              {visibility?.qrCode !== false && content.qrCode?.enabled !== false && (
                <div className={`${showPrice && showServices ? 'col-span-6' : showPrice || showServices ? 'col-span-6' : 'col-span-12'} bg-gradient-to-br from-[#0D4D5E] to-[#417483] text-white rounded-2xl p-3.5 border-2 border-[#AAD0D1] shadow-sm flex flex-col items-center justify-center text-center`}>
                  <div className="bg-white p-2.5 rounded-xl border border-white/40 shadow-md mb-2">
                    <QRCodeSVG 
                      value={content.qrCode?.url || (website.startsWith('http') ? website : `https://${website}`)}
                      size={isA5 ? 65 : 82}
                      fgColor="#0D4D5E"
                      bgColor="#FFFFFF"
                      level="H"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#AAD0D1] font-vietnam flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{content.qrCode?.label || 'SCANSIONA CON LO SMARTPHONE'}</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-200 mt-0.5">
                    Offerta & Dettagli Skipass Live
                  </span>
                </div>
              )}

            </div>
          );
        })()}

        {/* 4. INCLUSIONS & SERVICES LIST (COMPACT & BOLD) */}
        {visibility?.servicesBox !== false && (
          <div className="bg-white rounded-2xl p-3.5 border-2 border-[#0D4D5E]/20 shadow-2xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0D4D5E] flex items-center gap-1.5 border-b border-slate-100 pb-1 font-vietnam">
              <CheckCircle2 className="w-4 h-4 text-[#0D4D5E] shrink-0" />
              <span>{displayFeaturesTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {displayFeatures.slice(0, 6).map((feat, idx) => (
                <div 
                  key={feat.id || idx}
                  className={`flex items-start gap-1.5 text-[10px] sm:text-[10.5px] font-bold leading-tight p-1.5 rounded-lg ${
                    feat.highlight 
                      ? 'bg-[#0D4D5E]/10 text-[#0D4D5E] border border-[#0D4D5E]/20' 
                      : 'text-slate-800 bg-slate-50'
                  }`}
                >
                  <span className="text-[#0D4D5E] font-black shrink-0">•</span>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>

            {/* SPORTS ICONS */}
            {visibility?.sportsIcons !== false && activeSportsIcons.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 flex-wrap">
                {activeSportsIcons.slice(0, 5).map((iconObj, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 rounded-full bg-[#0D4D5E]/10 text-[#0D4D5E] text-[8.5px] font-extrabold flex items-center gap-1 border border-[#0D4D5E]/20"
                  >
                    <WireframeIcon icon={iconObj} className="w-3 h-3 text-[#0D4D5E]" />
                    <span>{getSportsIconName(iconObj, activeLang)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. REGIONAL DESTINATION PRESENTATION / PROMO BANNER */}
        {visibility?.ecoBanner !== false && (displayPromoBannerTitle || displayPromoBannerText) && (
          <div className="rounded-xl p-2.5 border border-[#0D4D5E]/20 bg-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black text-white bg-[#0D4D5E]">
              <Hotel className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              {displayPromoBannerTitle && (
                <div className="text-[9.5px] font-black uppercase text-[#0D4D5E] tracking-wider font-vietnam">
                  {displayPromoBannerTitle}
                </div>
              )}
              {displayPromoBannerText && (
                <p className="text-[9px] text-slate-700 font-medium leading-tight">
                  {displayPromoBannerText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. HOTEL RECEPTION CONTACT BAR */}
        {visibility?.qrCode !== false && (
          <div className="rounded-2xl p-3 border-2 border-[#0D4D5E] bg-white shadow-2xs flex items-center justify-between gap-3 mt-auto">
            <div className="min-w-0 flex-1">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D4D5E] text-white font-vietnam">
                HOTEL & RECEPTION CONVENZIONATA
              </span>
              <h4 className="text-sm font-black text-slate-900 truncate font-vietnam mt-0.5">
                {hotelName}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-800 shrink-0">
              {phone && (
                <span className="flex items-center gap-1 text-[#0D4D5E]">
                  <Phone className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{phone}</span>
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1 text-[#0D4D5E]">
                  <Mail className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{email}</span>
                </span>
              )}
              {website && (
                <span className="flex items-center gap-1 text-[#0D4D5E]">
                  <Globe className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{website}</span>
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 6. BRAND FOOTER */}
      {visibility?.footer !== false && (
        <BrandFooterBlock
          content={content}
          theme={theme as any}
          plt={plt}
          regionLogo={regionLogo}
          visibility={visibility}
          isA3={isA3}
          isA5={isA5}
        />
      )}
    </div>
  );
};
