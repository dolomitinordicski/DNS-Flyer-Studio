import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail } from 'lucide-react';
import { FlyerContent, BrandColorScheme, SectionVisibility } from '../../types';
import { DolomitiNordicSkiLogo, DolomitiCurvesVector } from '../CorporateVectors';

export interface BrandFooterBlockProps {
  content: FlyerContent;
  theme?: BrandColorScheme;
  plt?: any;
  regionLogo?: any;
  visibility?: SectionVisibility;
  isA3?: boolean;
  isA5?: boolean;
  isBackground?: boolean;
  isTrilingual?: boolean;
  activeColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    textColor: string;
  };
}

export const BrandFooterBlock: React.FC<BrandFooterBlockProps> = ({
  content,
  theme,
  plt,
  regionLogo,
  visibility,
  isA3 = false,
  isA5 = false,
  isBackground = false,
  isTrilingual = false,
  activeColors
}) => {
  if (visibility && visibility.footer === false) return null;

  const fc = content.footerConfig || {};
  const translations = content.translations || {};
  const it = translations.it || {};
  const de = translations.de || {};
  const en = translations.en || {};

  const isTrilingualEffective = isTrilingual || content.languageMode === 'trilingual';

  const getTri = (key: string, fallback: string) => {
    if (!isTrilingualEffective || content.languageMode === 'trilingual') return fallback;
    const valIt = it.footerConfig?.[key] || it[key] || '';
    const valDe = de.footerConfig?.[key] || de[key] || '';
    const valEn = en.footerConfig?.[key] || en[key] || '';
    if (!valIt && !valDe && !valEn) return fallback;
    return [valDe, valIt, valEn].filter(Boolean).join(' • ');
  };

  const primaryColor = activeColors?.primary || theme?.primaryHex || '#0D4D5E';
  const secondaryColor = activeColors?.secondary || theme?.secondaryHex || '#072F3A';
  const accentColor = activeColors?.accent || theme?.accentHex || '#AAD0D1';

  // Config values with smart defaults
  const ticketBadge = isTrilingualEffective 
    ? getTri('ticketBadgeText', fc.ticketBadgeText || 'ACQUISTA IL BIGLIETTO DIGITALE ONLINE')
    : (fc.ticketBadgeText || plt?.footerBadgeText || 'ACQUISTA IL BIGLIETTO DIGITALE ONLINE');

  const website = fc.websiteUrl || content.websiteUrl || 'www.dolomitinordicski.com';
  const phone = fc.phone || content.contactPhone || '+39 0474 913156';
  const email = fc.email || content.contactEmail || 'info@dolomitinordicski.com';
  
  const embedQrCode = fc.embedQrCode !== false && visibility?.qrCode !== false && content.qrCode?.enabled !== false;
  const qrUrl = content.qrCode?.url || (website.startsWith('http') ? website : `https://${website}`);
  const qrScanLabel = isTrilingualEffective
    ? getTri('qrScanLabel', fc.qrScanLabel || 'SCANSIONA PER...')
    : (fc.qrScanLabel || plt?.qrScanLabel || 'SCANSIONA PER...');

  const networkSlogan = isTrilingualEffective
    ? getTri('footerText', fc.networkSlogan || (plt?.footerText ? `${plt.footerText}` : '8 AREAS = 1 NETWORK • DOLOMITI NORDICSKI'))
    : (fc.networkSlogan || (plt?.footerText ? `${plt.footerText}` : '8 AREAS = 1 NETWORK • DOLOMITI NORDICSKI'));
    
  const networkAreasList = fc.networkAreasList || 'Anterselva • Val Casies • 3 Cime • Osttirol • Comelico • Cortina • Valle Aurina • Seiser Alm';

  return (
    <footer className="w-full shrink-0 space-y-1 font-vietnam mt-auto pt-1">
      {/* 1. UPPER FOOTER CONTAINER (Rounded card with contact, ticket badge & integrated QR code) */}
      <div 
        className={`relative overflow-hidden rounded-2xl border transition-all ${
          isA3 ? 'p-3.5 sm:p-4' : isA5 ? 'p-1.5' : 'p-2.5 sm:p-3'
        } ${
          isBackground 
            ? 'bg-slate-900/80 text-white border-white/20 backdrop-blur-md' 
            : 'bg-[#F4F9FA] text-slate-800 border-[#0D4D5E]/20 shadow-2xs'
        }`}
      >
        {/* Subtle Skier/Swoosh Background Watermark Graphic on the Right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 overflow-hidden flex items-center justify-end pr-6">
          <DolomitiCurvesVector className="w-full h-full text-[#0D4D5E] object-cover scale-125 translate-x-6" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2.5">
          {/* Left Column: Ticket Badge, Main URL, Contacts */}
          <div className="space-y-0.5 min-w-0 flex-1">
            {/* Pill Badge */}
            <div className="inline-block">
              <span 
                className={`font-black uppercase tracking-wide rounded-md px-2 py-0.5 inline-flex items-center gap-1 shadow-2xs ${
                  isA3 ? 'text-xs' : isA5 ? 'text-[6.5px]' : 'text-[8px] sm:text-[8.5px]'
                }`}
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                {ticketBadge}
              </span>
            </div>

            {/* Main Website URL */}
            <div className={`font-black tracking-tight leading-tight truncate ${
              isA3 ? 'text-base sm:text-lg' : isA5 ? 'text-[9.5px]' : 'text-xs sm:text-sm'
            }`} style={{ color: isBackground ? '#FFFFFF' : primaryColor }}>
              {website}
            </div>

            {/* Contacts Row */}
            <div className={`flex items-center gap-2 font-bold flex-wrap opacity-90 ${
              isA3 ? 'text-xs' : isA5 ? 'text-[7px]' : 'text-[8.5px] sm:text-[9px]'
            } ${isBackground ? 'text-slate-200' : 'text-slate-700'}`}>
              {phone && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Phone className="w-2.5 h-2.5 shrink-0 opacity-80" style={{ color: primaryColor }} />
                  <span>{phone}</span>
                </span>
              )}
              {email && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Mail className="w-2.5 h-2.5 shrink-0 opacity-80" style={{ color: primaryColor }} />
                  <span>{email}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Embedded QR Code Container */}
          {embedQrCode && (
            <div className={`shrink-0 flex flex-col items-center bg-white ${isA5 ? 'p-1' : 'p-1.5 sm:p-2'} rounded-xl border border-slate-200/90 shadow-2xs z-20`}>
              <QRCodeSVG 
                value={qrUrl} 
                size={isA3 ? 72 : isA5 ? 38 : 52} 
                fgColor={primaryColor}
                level="M"
              />
              <span className={`font-black uppercase tracking-wider text-center mt-0.5 ${
                isA3 ? 'text-[8.5px]' : isA5 ? 'text-[6px]' : 'text-[7px] sm:text-[7.5px]'
              }`} style={{ color: primaryColor }}>
                {qrScanLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. LOWER NETWORK STRIP (Logo, Slogan & 8 Areas List) */}
      <div 
        className={`flex items-center justify-between gap-1.5 border-t pt-1 px-0.5 font-bold uppercase tracking-tight ${
          isA3 ? 'text-[9.5px]' : isA5 ? 'text-[6px]' : 'text-[7px] sm:text-[7.5px]'
        } ${isBackground ? 'border-white/20 text-white' : 'border-slate-200/90 text-slate-700'}`}
        style={{ color: isBackground ? '#FFFFFF' : primaryColor }}
      >
        {/* Far Left: Dolomiti NordicSki Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <DolomitiNordicSkiLogo 
            variant={content.logoVariant || (isBackground ? 'negative' : 'original')} 
            className={`${isA5 ? 'h-3.5' : isA3 ? 'h-7' : 'h-4 sm:h-5'} shrink-0`} 
            customPrimary={isBackground ? '#FFFFFF' : primaryColor}
            customSecondary={isBackground ? 'rgba(255,255,255,0.8)' : secondaryColor}
            customAccent={accentColor}
            cornerStyle={content.logoCornerStyle}
          />
        </div>

        {/* Center: Network Slogan */}
        <div className="truncate font-black text-center flex-1 px-1 opacity-90">
          {networkSlogan}
        </div>

        {/* Far Right: Areas List */}
        <div className="shrink-0 text-right font-semibold opacity-80 truncate max-w-[42%]">
          {networkAreasList}
        </div>
      </div>
    </footer>
  );
};
