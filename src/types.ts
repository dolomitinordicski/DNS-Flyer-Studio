export type PaperFormat = 'A4' | 'A5' | 'A3';
export type PaperOrientation = 'portrait' | 'landscape';

export type BrandColorScheme = 'frosted_ice' | 'nordic_sky' | 'deep_glacier' | 'ice_white';

export type GraphicStyle = 
  | 'classic_corporate' 
  | 'classic_corporate_v1'
  | 'modern_glacier' 
  | 'modern_glacier_v1'
  | 'manifesto_voucher' 
  | 'manifesto_voucher_v1'
  | 'classic_official' 
  | 'classic_official_v1'
  | 'glacier_panorama' 
  | 'glacier_panorama_v1'
  | 'nordic_modern' 
  | 'nordic_modern_v1'
  | 'official_price_table' 
  | 'official_price_table_v1'
  | 'official_ticket_voucher' 
  | 'official_ticket_voucher_v1'
  | 'online_ticket_manifesto'
  | 'online_ticket_manifesto_v1'
  | 'hotel_skipass_package'
  | 'hotel_skipass_boutique'
  | 'hotel_skipass_panorama'
  | 'hotel_skipass_compact'
  | 'hotel_skipass_fusion';

export type LayoutTemplateId = 
  | 'official_price_list' 
  | 'regional_price_list' 
  | 'weekly_ticket_pass' 
  | 'hotel_skipass_package' 
  | 'gift_voucher' 
  | 'hotel_manifesto' 
  | 'ticket_digital_pass'
  | 'ticket_online_daily'
  | 'ticket_online_weekly_area'
  | 'ticket_online_weekly_dns'
  | 'custom';

export interface RegionLogoOption {
  id: string;
  name: string;
  logoSrc: string;
  logoWhiteSrc?: string;
  secondaryLogoSrc?: string;
  secondaryLogoWhiteSrc?: string;
}

export interface RegionalLogo {
  id: string;
  name: string;
  regionName: string;
  subTitle: string;
  primaryColor?: string;
  logoSrc?: string; // Optional custom regional logo path
  logoWhiteSrc?: string; // Optional white/negative variant of regional logo
  secondaryLogoSrc?: string;
  secondaryLogoWhiteSrc?: string;
  logos?: RegionLogoOption[]; // Optional list of logo variants available for this region
  logoOptions?: RegionLogoOption[]; // Alias for logos
}

export interface SportsIcon {
  id: string;
  name: string;
  nameIt?: string;
  nameDe?: string;
  nameEn?: string;
  category: 'Nordic Skiing' | 'Services' | 'Accommodation' | 'Events' | 'Custom';
  lucideIconName: string;
  description?: string;
  descriptionIt?: string;
  descriptionDe?: string;
  descriptionEn?: string;
  customIconUrl?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export type LogoVariantType = 'original' | 'negative' | 'grayscale' | 'skier_track_emblem' | 'horizontal_light' | 'badge_card' | 'none';

export type LogoPositionType = 'header_left' | 'header_center' | 'top_banner' | 'floating_badge';

export type NordicSwooshPosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'none';
export type NordicSwooshVariant = 'swoosh_only' | 'swoosh_skier';
export type NordicSwooshSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';

export interface NordicSwooshConfig {
  enabled: boolean;
  position: NordicSwooshPosition;
  variant: NordicSwooshVariant;
  size?: NordicSwooshSize;
  customWidthPx?: number; // arbitrary pixel size e.g. 50px to 900px
  opacity: number; // 10 to 100
  color?: string;
}

export interface OrnamentCurvesConfig {
  enabled: boolean;
  position?: 'header_right' | 'header_bottom' | 'hero_overlay' | 'content_divider' | 'footer_top' | 'background_diagonal' | 'none';
  color?: string;
  opacity: number; // 10 to 100
  sizePx?: number; // 150 to 600 px width
}

export interface OrnamentSkierConfig {
  enabled: boolean;
  position: 'header_right' | 'hero_watermark' | 'price_badge' | 'footer_corner' | 'none';
  color: string;
  opacity: number; // 10 to 100
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export interface CustomColorCombination {
  primary: string; // Frosted Ice Blue (#0D4D5E) or custom
  secondary: string; // Nordic Sky (#417483) or custom
  accent: string; // Glacier Ice (#AAD0D1) or custom
  background: string; // Snow White (#F4F9FA) or custom
  cardBg: string; // Pure White (#FFFFFF) or custom
  textColor: string; // Deep Blue (#0D4D5E) or custom
}

export interface PackageFeature {
  id: string;
  icon: string;
  text: string;
  highlight?: boolean;
}

export interface QRCodeConfig {
  enabled: boolean;
  url: string;
  label: string;
  fgColor: string;
  bgColor: string;
  centerLogo: 'none' | 'dns' | 'ski' | 'star';
  position: 'bottom_right' | 'bottom_left' | 'sidebar' | 'banner';
}

export interface PriceListTexts {
  seasonYear?: string;
  mainTitle?: string;
  subTitle?: string;
  bannerTitle?: string;
  
  // Regional Table
  regionalHeader?: string;
  regionalDayTitle?: string;
  regionalDaySub?: string;
  regionalDayPrice?: string;
  regionalWeekTitle?: string;
  regionalWeekSub?: string;
  regionalWeekPrice?: string;
  regionalSeasonTitle?: string;
  regionalSeasonSub?: string;
  regionalSeasonPrice?: string;
  regionalNote?: string;

  // Carousel Table
  carouselHeader?: string;
  carouselWeekTitle?: string;
  carouselWeekSub?: string;
  carouselWeekPrice?: string;
  carouselSeasonTitle?: string;
  carouselSeasonSub?: string;
  carouselSeasonPrice?: string;
  earlyBirdLabel?: string;
  earlyBirdDiscount?: string;
  earlyBirdSub?: string;

  // Services Box
  infoServicesHeader?: string;
  infoKidsText?: string;
  infoSchoolsText?: string;

  // Banner & Custom Banner
  ecoTagline?: string;
  ecoTitle?: string;
  ecoSub?: string;
  customBanner?: { 
    type: 'eco' | 'event' | 'snow' | 'sponsor' | 'custom'; 
    title?: string; 
    text?: string; 
    icon?: string; 
    color?: string;
  };

  // Disclaimers & Footer
  disclaimerDe?: string;
  disclaimerIt?: string;
  disclaimerEn?: string;
  footerText?: string;
}

export interface FooterConfig {
  mode?: 'dns' | 'custom_area';
  ticketBadgeText?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  embedQrCode?: boolean;
  qrScanLabel?: string;
  networkSlogan?: string;
  networkAreasList?: string;
}

export type FlyerSectionId = 
  | 'header'
  | 'heroImage' 
  | 'bigTitle'
  | 'earlyBird' 
  | 'promotionBox' 
  | 'priceTables' 
  | 'servicesBox'
  | 'sportsIcons' 
  | 'features'
  | 'turnstileNote'
  | 'ecoBanner' 
  | 'qrCode'
  | 'disclaimer'
  | 'footer';

export interface SectionVisibility {
  header: boolean;
  heroImage: boolean;
  bigTitle?: boolean;
  earlyBird: boolean;
  promotionBox: boolean;
  priceTables: boolean;
  servicesBox: boolean;
  sportsIcons?: boolean;
  features?: boolean;
  turnstileNote?: boolean;
  ecoBanner: boolean;
  qrCode: boolean;
  disclaimer: boolean;
  footer: boolean;
}

export type LanguageCode = 'de' | 'it' | 'en';

export interface MultilingualTextSet {
  headerTagline?: string;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  validityPeriod?: string;
  validityTitle?: string;
  location?: string;
  pricePrefix?: string;
  priceAmount?: string;
  priceCurrency?: string;
  priceSuffix?: string;
  priceNote?: string;
  featuresTitle?: string;
  ctaText?: string;
  addressInfo?: string;
  holderName?: string;
  issueDate?: string;
  ticketStatus?: string;
  issuerName?: string;
  turnstileNote?: string;
  verificationNote?: string;
  digitalPassType?: 'weekly_dns' | 'daily_area' | 'weekly_area';
  promoBannerTitle?: string;
  promoBannerText?: string;
  promoBannerBadge?: string;
  ecoBannerTitle?: string;
  ecoBannerText?: string;
  ecoBannerTagline?: string;
  features?: PackageFeature[];
  priceListTexts?: PriceListTexts;
}

export interface FlyerContent {
  // Language mode: 'monolingual' for single-language per ticket or 'trilingual' for single document with 3 languages
  languageMode?: 'monolingual' | 'trilingual';
  
  // Active viewing/editing language
  activeLanguage?: LanguageCode;
  translations?: {
    de?: MultilingualTextSet;
    it?: MultilingualTextSet;
    en?: MultilingualTextSet;
  };

  // Digital Pass Type (Weekly DNS, Daily Area, Weekly Area)
  digitalPassType?: 'weekly_dns' | 'daily_area' | 'weekly_area';
  selectedRegionOption?: string; // 'all' for 900+ km Carosello or regionId like '3_zinnen', 'anterselva', etc.
  ticketStatus?: string;
  issuerName?: string;
  turnstileNote?: string;
  verificationNote?: string;

  // Digital Pass Specific Banners
  promoBannerEnabled?: boolean;
  promoBannerTitle?: string;
  promoBannerText?: string;
  promoBannerBadge?: string;
  
  ecoBannerEnabled?: boolean;
  ecoBannerTitle?: string;
  ecoBannerText?: string;
  ecoBannerTagline?: string;

  // Brand Header & Regional Logo Customization
  regionId: string;
  selectedRegionLogoId?: string;
  customRegionalLogoUrl?: string;
  regionalLogoScale?: number; // scale percentage (e.g. 100 = 100%, 75, 125, 150)
  logoBadgeBgStyle?: 'auto' | 'dark' | 'light' | 'none'; // Sfondo del badge logo: automatico (scuro nei temi scuri), scuro forzato, chiaro (bianco), o trasparente/nessuno
  dnsLogoPlacement?: 'header' | 'footer_left' | 'hidden'; // Header (default/stacked), Footer Left, or Hidden
  customRegionName?: string;
  headerTagline: string;
  
  // Customizable Price List Texts
  priceListTexts?: PriceListTexts;
  
  // Titles & Headings
  badgeText: string;
  title: string;
  subtitle: string;
  validityPeriod: string;
  location: string;
  
  // Pricing & Highlight
  pricePrefix: string; // e.g., "Da"
  priceAmount: string; // e.g., "289"
  priceCurrency: string; // e.g., "€"
  priceSuffix: string; // e.g., "/ 3 Notti per persona"
  priceNote: string; // e.g., "Incluso Skipass Dolomiti NordicSki 3 giorni"
  
  // Features / Services list
  featuresTitle: string;
  features: PackageFeature[];
  
  // Main Hero Image
  heroImageUrl: string;
  heroImagePosition: 'top' | 'middle' | 'background' | 'split';
  heroOverlayOpacity: number; // 0 to 100
  heroImageHeightPx?: number; // Custom height buffer in px computed by Make It Perfect
  textScaleFactor?: number; // Text scale multiplier computed by Make It Perfect (A3/A4/A5)
  
  // Secondary Images
  showSecondaryImages: boolean;
  secondaryImages: string[];
  
  // Sports Icons Strip
  selectedSportsIcons: string[]; // icon IDs
  
  // Call To Action & Footer Info
  ctaText: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  addressInfo: string;
  holderName?: string;
  issueDate?: string;
  
  // Dynamic QR Code
  qrCode: QRCodeConfig;
  
  // Layout Options
  layoutTemplateId?: LayoutTemplateId;
  format: PaperFormat;
  orientation: PaperOrientation;
  themeColor: BrandColorScheme;
  graphicStyle: GraphicStyle;
  cornerStyle?: 'rounded' | 'sharp' | 'none'; // 'rounded' (default rounded edges), 'sharp' (a spigolo / squadrati), or 'none' (senza bordo/fondo)
  logoCornerStyle?: 'rounded' | 'sharp' | 'none'; // Style for logo containers (regional logo badges)
  importedImages?: string[];
  customPrimaryColor: string;
  customAccentColor: string;
  headingFont: 'Be Vietnam Pro' | 'Roboto';
  bodyFont: 'Be Vietnam Pro' | 'Roboto';
  showCropMarks: boolean;
  showBleedArea: boolean;
  
  // Footer partner logos visibility
  showPartnerLogos: boolean;

  // Custom Footer Configuration
  footerConfig?: FooterConfig;

  // DNS Logo & Ornamental Graphic Elements
  logoVariant?: LogoVariantType;
  logoPosition?: LogoPositionType;
  nordicSwoosh?: NordicSwooshConfig;
  ornamentCurves?: OrnamentCurvesConfig;
  ornamentSkier?: OrnamentSkierConfig;
  customColors?: CustomColorCombination;
  
  // Visibility toggles for document sections
  sectionVisibility?: SectionVisibility;
  visibility?: SectionVisibility;

  // Separate section ordering for portrait and landscape orientations
  sectionOrderPortrait?: FlyerSectionId[];
  sectionOrderLandscape?: FlyerSectionId[];
}

export type FlyerStatus = 'issued' | 'scheduled' | 'draft';

export interface FlyerRecord {
  id: string;
  title: string;
  regionId: string;
  regionName: string;
  status: FlyerStatus;
  publishDate: string; // e.g. "2025-11-15"
  validityPeriod: string;
  location: string;
  category: 'hotel_skipass' | 'events_races' | 'cross_country_course' | 'season_pass' | 'family_promo' | 'general';
  priceInfo?: string;
  targetAudience?: string;
  content: FlyerContent;
  thumbnailUrl?: string;
  createdByRegion?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  downloadsCount?: number;
}

export interface FlyerTemplate {
  id: LayoutTemplateId;
  name: string;
  tagline: string;
  description: string;
  previewColor: string;
  defaultContent: Partial<FlyerContent>;
}
