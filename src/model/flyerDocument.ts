import type {
  FlyerContent,
  FlyerSectionId,
  FlyerStatus,
  GraphicStyle,
  LanguageCode,
  LayoutTemplateId,
  PaperFormat,
  PaperOrientation,
  SectionVisibility,
} from '../types';
import type { BlockDataBinding } from './blockDataContract';
import { createInlineBlockBindings } from './blockDataContract';

export const FLYER_DOCUMENT_SCHEMA = 'dns.flyer-document' as const;
export const FLYER_DOCUMENT_VERSION = 1 as const;

const LEGACY_GRAPHIC_STYLE_MAP: Partial<Record<GraphicStyle, GraphicStyle>> = {
  classic_corporate_v1: 'classic_corporate',
  classic_official_v1: 'classic_official',
  modern_glacier_v1: 'modern_glacier',
  glacier_panorama_v1: 'glacier_panorama',
  nordic_modern_v1: 'nordic_modern',
  official_price_table_v1: 'official_price_table',
  online_ticket_manifesto_v1: 'online_ticket_manifesto',
  manifesto_voucher_v1: 'manifesto_voucher',
  official_ticket_voucher_v1: 'official_ticket_voucher',
};

export function normalizeGraphicStyle(style: GraphicStyle): GraphicStyle {
  return LEGACY_GRAPHIC_STYLE_MAP[style] ?? style;
}


export interface FlyerDocumentV1 {
  schema: typeof FLYER_DOCUMENT_SCHEMA;
  version: typeof FLYER_DOCUMENT_VERSION;
  meta: {
    id?: string;
    title: string;
    createdAt?: string;
    updatedAt?: string;
    source: 'legacy' | 'editor' | 'saved-design' | 'registry';
  };
  locale: {
    mode: 'monolingual' | 'trilingual';
    activeLanguage: LanguageCode;
  };
  brand: {
    regionId: string;
    selectedRegionLogoId?: string;
    graphicStyle: GraphicStyle;
    themeColor: FlyerContent['themeColor'];
  };
  page: {
    format: PaperFormat;
    orientation: PaperOrientation;
    showCropMarks: boolean;
    showBleedArea: boolean;
  };
  composition: {
    templateId?: LayoutTemplateId;
    visibility?: SectionVisibility;
    orderPortrait?: FlyerSectionId[];
    orderLandscape?: FlyerSectionId[];
    bindings?: BlockDataBinding[];
  };
  assets: {
    heroImageUrl?: string;
    importedImages: string[];
    secondaryImages: string[];
    selectedSportsIcons: string[];
  };
  publication: {
    status?: FlyerStatus;
    publishDate?: string;
    validityPeriod?: string;
  };
  /**
   * Lossless compatibility snapshot.
   * F2 intentionally keeps the complete legacy payload so existing renderers,
   * editors and previously saved designs remain byte-for-byte equivalent at
   * the data level while domains migrate incrementally in F3+.
   */
  legacyContent: FlyerContent;
}

export interface CreateFlyerDocumentOptions {
  id?: string;
  title?: string;
  source?: FlyerDocumentV1['meta']['source'];
  status?: FlyerStatus;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function createFlyerDocumentV1(
  content: FlyerContent,
  options: CreateFlyerDocumentOptions = {},
): FlyerDocumentV1 {
  const cloned = structuredCloneSafe(content);
  return {
    schema: FLYER_DOCUMENT_SCHEMA,
    version: FLYER_DOCUMENT_VERSION,
    meta: {
      id: options.id,
      title: options.title ?? cloned.title ?? 'Dolomiti NordicSki Flyer',
      createdAt: options.createdAt,
      updatedAt: options.updatedAt,
      source: options.source ?? 'editor',
    },
    locale: {
      mode: cloned.languageMode ?? 'monolingual',
      activeLanguage: cloned.activeLanguage ?? 'it',
    },
    brand: {
      regionId: cloned.regionId || 'dns_central',
      selectedRegionLogoId: cloned.selectedRegionLogoId,
      graphicStyle: normalizeGraphicStyle(cloned.graphicStyle),
      themeColor: cloned.themeColor,
    },
    page: {
      format: cloned.format,
      orientation: cloned.orientation,
      showCropMarks: cloned.showCropMarks,
      showBleedArea: cloned.showBleedArea,
    },
    composition: {
      templateId: cloned.layoutTemplateId,
      visibility: cloned.sectionVisibility ?? cloned.visibility,
      orderPortrait: cloned.sectionOrderPortrait,
      orderLandscape: cloned.sectionOrderLandscape,
      bindings: createInlineBlockBindings(cloned),
    },
    assets: {
      heroImageUrl: cloned.heroImageUrl,
      importedImages: [...(cloned.importedImages ?? [])],
      secondaryImages: [...(cloned.secondaryImages ?? [])],
      selectedSportsIcons: [...(cloned.selectedSportsIcons ?? [])],
    },
    publication: {
      status: options.status,
      publishDate: options.publishDate,
      validityPeriod: cloned.validityPeriod,
    },
    legacyContent: cloned,
  };
}

export function isFlyerDocumentV1(value: unknown): value is FlyerDocumentV1 {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FlyerDocumentV1>;
  return candidate.schema === FLYER_DOCUMENT_SCHEMA
    && candidate.version === FLYER_DOCUMENT_VERSION
    && !!candidate.legacyContent;
}

export function flyerDocumentToContent(document: FlyerDocumentV1): FlyerContent {
  const legacy = structuredCloneSafe(document.legacyContent);
  const visibility = document.composition.visibility
    ?? legacy.sectionVisibility
    ?? legacy.visibility;

  return {
    ...legacy,
    languageMode: document.locale.mode,
    activeLanguage: document.locale.activeLanguage,
    regionId: document.brand.regionId,
    selectedRegionLogoId: document.brand.selectedRegionLogoId ?? legacy.selectedRegionLogoId,
    graphicStyle: normalizeGraphicStyle(document.brand.graphicStyle),
    themeColor: document.brand.themeColor,
    format: document.page.format,
    orientation: document.page.orientation,
    showCropMarks: document.page.showCropMarks,
    showBleedArea: document.page.showBleedArea,
    layoutTemplateId: document.composition.templateId ?? legacy.layoutTemplateId,
    sectionVisibility: visibility,
    visibility,
    sectionOrderPortrait: document.composition.orderPortrait ?? legacy.sectionOrderPortrait,
    sectionOrderLandscape: document.composition.orderLandscape ?? legacy.sectionOrderLandscape,
    heroImageUrl: document.assets.heroImageUrl ?? legacy.heroImageUrl,
    importedImages: [...document.assets.importedImages],
    secondaryImages: [...document.assets.secondaryImages],
    selectedSportsIcons: [...document.assets.selectedSportsIcons],
    validityPeriod: document.publication.validityPeriod ?? legacy.validityPeriod,
  };
}

/** Accepts both the new document envelope and every historical plain FlyerContent payload. */
export function normalizeFlyerContent(value: unknown): FlyerContent | null {
  if (isFlyerDocumentV1(value)) return flyerDocumentToContent(value);
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<FlyerContent>;
  if (!candidate.regionId || !candidate.format || !candidate.orientation || !candidate.graphicStyle) {
    return null;
  }
  const normalized = structuredCloneSafe(candidate as FlyerContent);
  normalized.graphicStyle = normalizeGraphicStyle(normalized.graphicStyle);
  return normalized;
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
