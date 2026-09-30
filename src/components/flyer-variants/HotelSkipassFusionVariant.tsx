import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail, Globe, MapPin, CheckCircle2, Hotel, Sparkles, Tag, ArrowRight, Star, Calendar } from 'lucide-react';
import { FlyerVariantProps } from './VariantTypes';
import { BrandHeaderBlock } from '../blocks/BrandHeaderBlock';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';
import { WireframeIcon } from '../WireframeIcon';
import { getSportsIconName } from '../../data/sportsIcons';
import { DolomitiSkierTrackEmblem } from '../CorporateVectors';

import { resolveHotelPackageData } from './resolveFlyerData';

export const HotelSkipassFusionVariant: React.FC<FlyerVariantProps> = ({
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
  const defaultHeroUrl = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';
  const heroUrl = content.heroImageUrl || defaultHeroUrl;

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${paddingClass} font-vietnam gap-2.5 overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ 
        background: `linear-gradient(165deg, ${theme.bgHex} 0%, #FFFFFF 60%, ${theme.accentHex}15 100%)` 
      }}
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

      {/* FUSED MAIN CONTENT CANVAS */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 relative">

        {/* INTEGRATED FUSED HERO IMAGE + OVERLAPPING TITLE & FLOATING PRICE BADGE */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#0D4D5E] shadow-md bg-[#0D4D5E] text-white">
          
          {/* Background Photo with Gradient Fade */}
          {visibility?.heroImage !== false && (
            <div className="relative w-full h-[140px] sm:h-[170px] overflow-hidden">
              <img 
                src={heroUrl} 
                alt="Alpine Resort Fusion" 
                className="w-full h-full object-cover scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0D4D5E]/40 via-[#0D4D5E]/60 to-[#0D4D5E]" />

              {/* Top Floating Badge & Location Pill */}
              <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1.5 shadow-md bg-[#AAD0D1] text-[#0D4D5E]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{displayBadge}</span>
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {displayLocation && (
                    <span className="text-[10px] font-bold text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 border border-white/20">
                      <MapPin className="w-3 h-3 text-[#AAD0D1]" />
                      <span>{displayLocation}</span>
                    </span>
                  )}
                  {displayValidityPeriod && (
                    <span className="text-[10px] font-bold text-white bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 border border-white/20">
                      <Calendar className="w-3 h-3 text-[#AAD0D1]" />
                      <span>{displayValidityPeriod}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Integrated Title Section (Seamlessly fused with photo) */}
          {visibility?.bigTitle !== false && (
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0D4D5E] to-[#417483] relative z-10 border-t border-white/10">
              <div className="absolute -right-2 -bottom-4 opacity-15 pointer-events-none w-28 h-28">
                <DolomitiSkierTrackEmblem color="#FFFFFF" />
              </div>

              <div className="space-y-1 pr-2 relative z-10">
                <h1 className="text-lg sm:text-2xl font-black text-white leading-tight uppercase tracking-tight font-vietnam drop-shadow-xs">
                  {displayTitle}
                </h1>
                {displaySubtitle && (
                  <p className="text-xs sm:text-sm font-medium text-slate-100/90 leading-snug">
                    {displaySubtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FUSED PRICE & SERVICES DUAL-BLOCK */}
        {(() => {
          const showPrice = visibility?.priceTables !== false;
          const showServices = visibility?.servicesBox !== false;

          if (!showPrice && !showServices) return null;

          return (
            <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 items-stretch">
              
              {/* PRICE HIGHLIGHT CARD */}
              {showPrice && (
                <div className={`${showServices ? 'col-span-5' : 'col-span-12'} bg-gradient-to-br from-[#0D4D5E] via-[#0D4D5E] to-[#0A3A47] text-white rounded-2xl p-3.5 border-2 border-[#AAD0D1] shadow-sm flex flex-col justify-between text-center relative overflow-hidden`}>
                  <div className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-widest text-[#AAD0D1] font-vietnam">
                    {displayPricePrefix}
                  </div>

                  <div className="my-1">
                    <div className="text-3xl sm:text-5xl font-black text-white leading-none tracking-tight font-vietnam">
                      <span className="text-xl sm:text-2xl text-[#AAD0D1] mr-0.5">{displayPriceCurrency}</span>
                      {displayPriceAmount}
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-black text-[#AAD0D1] uppercase font-vietnam bg-white/10 py-1 px-2 rounded-lg border border-white/15">
                    {displayPriceSuffix}
                  </div>

                  {displayPriceNote && (
                    <p className="text-[8.5px] font-medium text-slate-200 mt-2 pt-1.5 border-t border-white/15 leading-tight">
                      {displayPriceNote}
                    </p>
                  )}
                </div>
              )}

              {/* INTEGRATED SERVICES & FEATURES */}
              {showServices && (
                <div className={`${showPrice ? 'col-span-7' : 'col-span-12'} bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-3.5 border-2 border-[#0D4D5E]/20 shadow-2xs flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0D4D5E] mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1 font-vietnam">
                      <CheckCircle2 className="w-4 h-4 text-[#417483] shrink-0" />
                      <span>{displayFeaturesTitle}</span>
                    </h3>

                    <div className="space-y-1.5">
                      {displayFeatures.slice(0, 5).map((feat, idx) => (
                        <div 
                          key={feat.id || idx}
                          className={`flex items-start gap-1.5 text-[10px] sm:text-[11px] font-bold leading-tight p-1.5 rounded-lg ${
                            feat.highlight 
                              ? 'bg-[#AAD0D1]/30 text-[#0D4D5E] border border-[#AAD0D1]' 
                              : 'text-slate-800 bg-slate-50/80'
                          }`}
                        >
                          <span className="text-[#0D4D5E] font-black shrink-0">•</span>
                          <span>{feat.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SPORTS ICONS STRIP */}
                  {visibility?.sportsIcons !== false && activeSportsIcons.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 mt-2 flex-wrap">
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

            </div>
          );
        })()}

        {/* REGIONAL DESTINATION PRESENTATION / PROMO BANNER */}
        {visibility?.ecoBanner !== false && (displayPromoBannerTitle || displayPromoBannerText) && (
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border-2 border-[#0D4D5E]/20 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-white bg-[#0D4D5E]">
              <Hotel className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              {displayPromoBannerTitle && (
                <div className="text-[10px] font-black uppercase text-[#0D4D5E] tracking-wider font-vietnam">
                  {displayPromoBannerTitle}
                </div>
              )}
              {displayPromoBannerText && (
                <p className="text-[9px] sm:text-[10px] text-slate-700 font-semibold leading-snug">
                  {displayPromoBannerText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* FUSED HOTEL INFO & RECEPTION BANNER */}
        {visibility?.qrCode !== false && (
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border-2 border-[#0D4D5E] shadow-xs flex items-center justify-between gap-3 mt-auto">
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D4D5E] text-white font-vietnam">
                STRUTTURA & RECEPTION CONVENZIONATA
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 truncate font-vietnam">
                {hotelName}
              </h4>
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold text-slate-700">
                {phone && (
                  <span className="flex items-center gap-1 text-[#0D4D5E]">
                    <Phone className="w-3 h-3 text-[#417483]" />
                    <span>{phone}</span>
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-1 text-[#0D4D5E]">
                    <Mail className="w-3 h-3 text-[#417483]" />
                    <span>{email}</span>
                  </span>
                )}
                {website && (
                  <span className="flex items-center gap-1 text-[#0D4D5E]">
                    <Globe className="w-3 h-3 text-[#417483]" />
                    <span>{website}</span>
                  </span>
                )}
              </div>
            </div>

            {/* QR CODE */}
            {content.qrCode?.enabled !== false && (
              <div className="flex flex-col items-center shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-2xs">
                <QRCodeSVG 
                  value={content.qrCode?.url || (website.startsWith('http') ? website : `https://${website}`)}
                  size={isA5 ? 50 : 60}
                  fgColor="#0D4D5E"
                  bgColor="#FFFFFF"
                  level="H"
                />
                <span className="text-[7.5px] font-black uppercase text-[#0D4D5E] mt-1 text-center max-w-[80px] leading-none font-vietnam">
                  {content.qrCode?.label || 'PRENOTA ORA'}
                </span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 5. BRAND FOOTER */}
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
