import React, { forwardRef, useEffect, useState, useSyncExternalStore } from 'react';
import { resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';
import { FlyerContent } from '../types';
import { getAllSportsIcons } from '../data/sportsIcons';
import { DEFAULT_PRICE_LIST_TEXTS } from '../data/templates';
import { loadOfficialPriceTexts } from '../data/livePriceLists';
import type { PriceListTexts } from '../types';
import { getContentForLanguage } from '../utils/multilingual';
import { getTemporaryFlyerImage, subscribeTemporaryFlyerImage } from '../data/temporaryFlyerImage';
import { 
  DolomitiSkierTrackEmblem, 
  NordicSwooshOverlay,
} from './CorporateVectors';

// Import Variants
import { FLYER_VARIANT_MAP, ClassicVariant } from './flyer-variants/VariantTypes';
import { resolveFlyerBrand, resolveFlyerVisibility, resolveFlyerTheme, resolveFlyerDimensions } from '../model/flyerCanvasPresentation';

interface FlyerCanvasProps {
  content: FlyerContent;
  scale?: number;
}

export const FlyerCanvas = forwardRef<HTMLDivElement, FlyerCanvasProps>(({ content, scale = 1 }, ref) => {
  const regionLogo = resolveFlyerBrand(content);

  // Map selected sports icons (standard + custom)
  const allIcons = getAllSportsIcons();
  const sportsIconList: any[] = Array.isArray(content.selectedSportsIcons) 
    ? content.selectedSportsIcons 
    : (Array.isArray(content.activeSportsIcons) ? content.activeSportsIcons : ['nordic_classic', 'nordic_skating', 'skipass', 'ski_bus']);
  
  const activeSportsIcons = sportsIconList
    .map(iconId => typeof iconId === 'string' ? allIcons.find(s => s.id === iconId) || { id: iconId, nameIt: iconId, nameDe: iconId, nameEn: iconId } : iconId)
    .filter(Boolean);

  // Localized Content for active language
  const temporaryPhoto = useSyncExternalStore(subscribeTemporaryFlyerImage, getTemporaryFlyerImage);
  const localizedContent = getContentForLanguage(content, content.activeLanguage || 'it');
  if (temporaryPhoto?.regionId === content.regionId) localizedContent.heroImageUrl = temporaryPhoto.url;

  // Graphic Style choice
  const graphicStyle = content.graphicStyle || 'classic_official';

  // The network/area rates are authoritative DNS Core data, not template constants.
  const isPriceList = content.layoutTemplateId === 'official_price_list' || content.layoutTemplateId === 'regional_price_list';
  const isNetworkPriceList = content.layoutTemplateId === 'official_price_list';
  const isPackageOffer = content.layoutTemplateId === 'hotel_skipass_package';
  const isTicket = ['ticket_online_weekly_dns', 'ticket_online_weekly_area', 'ticket_online_daily'].includes(content.layoutTemplateId || '');
  const seasonId = /^\\d{4}[/-]\\d{2}$/.test(content.validityPeriod || '')
    ? content.validityPeriod.replace('/', '-') : '2026-27';
  const [officialPrices, setOfficialPrices] = useState<Partial<PriceListTexts>>({});
  const [priceLoadState, setPriceLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    if (!isPriceList) return;
    let cancelled = false;
    setOfficialPrices({});
    setPriceLoadState('loading');
    void loadOfficialPriceTexts(seasonId, content.regionId, isNetworkPriceList)
      .then(prices => { if (!cancelled) { setOfficialPrices(prices); setPriceLoadState('ready'); } })
      .catch(error => { if (!cancelled) { console.error('DNS tariff lookup failed:', error); setPriceLoadState('error'); } });
    return () => { cancelled = true; };
  }, [isPriceList, isNetworkPriceList, seasonId, content.regionId]);

  const missingOfficialPrices: Partial<PriceListTexts> = isPriceList ? {
    carouselWeekPrice: '—', carouselWeekTrackSupplement: '—', carouselSeasonPrice: '—',
    ...(isNetworkPriceList ? {} : { regionalDayPrice: '—', regionalDayTrackSupplement: '—', regionalWeekPrice: '—', regionalWeekTrackSupplement: '—', regionalSeasonPrice: '—' }),
  } : {};
  const editorialFromPrices: Partial<PriceListTexts> = isNetworkPriceList ? {
    regionalDayPrice: content.priceListTexts?.regionalDayPrice ?? localizedContent.priceListTexts?.regionalDayPrice,
    regionalWeekPrice: content.priceListTexts?.regionalWeekPrice ?? localizedContent.priceListTexts?.regionalWeekPrice,
    regionalSeasonPrice: content.priceListTexts?.regionalSeasonPrice ?? localizedContent.priceListTexts?.regionalSeasonPrice,
  } : {};
  const plt = { ...DEFAULT_PRICE_LIST_TEXTS, ...localizedContent.priceListTexts, ...editorialFromPrices, ...missingOfficialPrices, ...officialPrices };
  // Legacy saved flyers can contain the old fixed +5€ track surcharge. Remove it:
  // the authoritative surcharge is now displayed directly below the DNS weekly price.
  if (isPriceList && plt.regionalNote) {
    plt.regionalNote = plt.regionalNote
      .replace(/\s*\+\s*5\s*€\s*Aufpreis auf der Loipe\.?/gi, '')
      .replace(/\s*\+\s*5\s*€\s*in pista dal controllore\.?/gi, '')
      .replace(/\s*\+\s*5\s*€\s*surcharge on track\.?/gi, '');
  }

  const visibility = resolveFlyerVisibility(content);
  const theme = resolveFlyerTheme(content);

  // Helper for rendering ornaments like the Skier
  const renderOrnament = () => {
    if (!content.ornamentSkier?.enabled) return null;
    
    const pos = content.ornamentSkier.position || 'footer_corner';
    const sizeMap: Record<string, number> = { 'sm': 40, 'md': 65, 'lg': 110, 'xl': 180 };
    const size = sizeMap[content.ornamentSkier.size || 'md'] || 65;
    
    let positionClasses = "";
    switch(pos) {
      case 'header_right': positionClasses = "top-4 right-6"; break;
      case 'hero_watermark': positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"; break;
      case 'price_badge': positionClasses = "bottom-48 right-12 rotate-[-12deg]"; break;
      case 'footer_corner':
      default: positionClasses = "bottom-6 right-8";
    }

    return (
      <div 
        className={`absolute z-30 pointer-events-none ${positionClasses}`}
        style={{ 
          opacity: (content.ornamentSkier.opacity || 90) / 100,
          width: size,
          height: size
        }}
      >
        <DolomitiSkierTrackEmblem color={content.ornamentSkier.color || theme.primaryHex} />
      </div>
    );
  };

  const renderDNSCornerSkier = () => {
    if (!isNetworkPriceList || !content.dnsSkierCorner || content.dnsSkierCorner === 'none') return null;
    const corner = content.dnsSkierCorner;
    const position = {
      top_left: 'top-3 left-3',
      top_right: 'top-3 right-3',
      bottom_left: 'bottom-3 left-3',
      bottom_right: 'bottom-3 right-3',
    }[corner];
    // Fixed safe inset, deliberately smaller than the former full-page skier.
    const size = content.format === 'A3' ? 105 : 65;
    return (
      <div className={`absolute z-20 pointer-events-none opacity-45 ${position}`}
        style={{ width: size, height: size }} data-dns-skier={corner}>
        <DolomitiSkierTrackEmblem />
      </div>
    );
  };

  const variantProps = {
    content: localizedContent,
    plt,
    theme,
    regionLogo,
    activeSportsIcons,
    visibility,
    format: content.format || 'A4',
    orientation: content.orientation || 'portrait'
  };

  const dimensions = resolveFlyerDimensions(content);
  // Official area identity accent, separate from DNS corporate colors.
  const regionalDocument = ['regional_price_list', 'ticket_online_weekly_area', 'ticket_online_daily'].includes(content.layoutTemplateId || '');
  const regionAccent = regionalDocument ? resolveDNSRegionAccent(content.regionId) : null;

  return (
    <div 
      ref={ref}
      data-pricing-state={isPriceList ? priceLoadState : 'ready'}
      className="bg-white shadow-2xl overflow-hidden relative select-none shrink-0"
      style={{
        ...dimensions,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        marginBottom: scale < 1 ? `calc(${dimensions.height} * ${scale - 1})` : '0',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div className="absolute inset-0 z-0 bg-white" />
      {regionAccent && (
        <div aria-hidden="true" data-dns-area-accent={content.regionId}
          className="absolute inset-y-0 left-0 z-20 pointer-events-none"
          style={{ width: '2mm', backgroundColor: regionAccent }} />
      )}
      
      {/* Background Hero Image (if set to full background) */}
      {visibility.heroImage && content.layoutTemplateId !== 'hotel_skipass_package' && content.heroImagePosition === 'background' && localizedContent.heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={localizedContent.heroImageUrl}
            alt="Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div 
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: content.heroOverlayOpacity / 100 }}
          />
        </div>
      )}

      {isPriceList && priceLoadState !== 'ready' && (
        <div className="absolute top-0 right-0 z-50 bg-amber-100 text-amber-900 text-[8px] p-1" role="status">
          {priceLoadState === 'loading' ? 'DNS: tariffe in caricamento' : 'DNS: tariffe non disponibili'}
        </div>
      )}
      {/* Render selected Variant */}
      {(() => {
        let effectiveGraphicStyle = graphicStyle;
        if (content.layoutTemplateId === 'hotel_skipass_package') {
          effectiveGraphicStyle = 'package_offer_editorial';
        }
        const VariantComponent = FLYER_VARIANT_MAP[effectiveGraphicStyle] || ClassicVariant;
        return <VariantComponent {...variantProps} />;
      })()}

      {/* Nordic Swoosh Overlay */}
      {!isPriceList && !isTicket && !isPackageOffer && <NordicSwooshOverlay config={content.nordicSwoosh} />}
      {!isTicket && !isPackageOffer && renderDNSCornerSkier()}

      {/* Global Ornaments */}
      {!isPriceList && !isTicket && !isPackageOffer && renderOrnament()}
    </div>
  );
});

FlyerCanvas.displayName = 'FlyerCanvas';
