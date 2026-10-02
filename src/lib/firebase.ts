import type { FlyerContent, FlyerRecord, SportsIcon } from '../types';
import type { FlyerDocumentV1 } from '../model/flyerDocument';
import {
  deleteFlyerDocument,
  loadOwnedFlyerDocuments,
  loadOwnedPublications,
  publicationProjection,
  publishFlyerDocument,
  saveFlyerDocument,
  savedDesignProjection,
  type FlyerDocumentRecord,
} from '../data/flyerRepository';
import { getDNSCoreUser } from './dnsCore';
import { INITIAL_FLYER_REGISTRY } from '../data/mockFlyerRegistry';

export interface SavedDesign {
  id: string;
  title: string;
  description?: string;
  regionId: string;
  graphicStyle: any;
  themeColor: string;
  content: FlyerContent;
  document?: FlyerDocumentV1;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = 'dns_flyer_saved_designs';
const LOCAL_REGISTRY_KEY = 'dns_flyer_registry_items';
const LOCAL_CUSTOM_ICONS_KEY = 'dns_custom_sports_icons';

function getLegacyLocalDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLegacyLocalRegistry(): FlyerRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : INITIAL_FLYER_REGISTRY;
  } catch {
    return INITIAL_FLYER_REGISTRY;
  }
}

export async function saveDesignToFirebase(
  id: string | null,
  title: string,
  content: FlyerContent,
  _graphicStyle: any,
  _thumbnail?: string,
): Promise<string> {
  const record = await saveFlyerDocument(content, {
    id: id || undefined,
    title,
    status: 'draft',
  });
  return record.id;
}

export async function loadDesignsFromFirebase(): Promise<SavedDesign[]> {
  if (!getDNSCoreUser()) {
    return getLegacyLocalDesigns();
  }
  const records = await loadOwnedFlyerDocuments();
  return records.map(record => {
    const projected = savedDesignProjection(record);
    return {
      ...projected,
      createdAt: '',
      updatedAt: '',
    } as SavedDesign;
  });
}

export async function deleteDesignFromFirebase(id: string): Promise<boolean> {
  await deleteFlyerDocument(id);
  return true;
}

export async function loadFlyerRecordsFromFirebase(): Promise<FlyerRecord[]> {
  if (!getDNSCoreUser()) {
    return getLegacyLocalRegistry();
  }
  const publications = await loadOwnedPublications();
  return publications.map(publicationProjection);
}

export async function saveFlyerRecordToFirebase(record: Partial<FlyerRecord>): Promise<FlyerRecord> {
  if (!record.content) {
    throw new Error('FLYER_CONTENT_REQUIRED');
  }

  const draftStatus = record.status === 'scheduled' ? 'ready' : 'draft';
  const documentRecord: FlyerDocumentRecord = await saveFlyerDocument(record.content, {
    id: record.document?.meta.id ?? undefined,
    title: record.title,
    status: draftStatus,
  });

  if (record.status === 'issued') {
    const publication = await publishFlyerDocument(documentRecord);
    return publicationProjection(publication);
  }

  return {
    id: documentRecord.id,
    title: documentRecord.title,
    regionId: record.content.regionId,
    regionName: record.regionName || record.content.customRegionName || record.content.regionId,
    status: record.status || 'draft',
    publishDate: record.publishDate || '',
    validityPeriod: record.content.validityPeriod || '',
    location: record.content.location || '',
    category: record.category || 'general',
    priceInfo: record.priceInfo || '',
    targetAudience: record.targetAudience || '',
    content: record.content,
    document: documentRecord.document,
    thumbnailUrl: record.content.heroImageUrl || '',
    createdByRegion: record.createdByRegion || '',
    createdAt: record.createdAt || '',
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteFlyerRecordFromFirebase(id: string): Promise<boolean> {
  // Publication snapshots are immutable by design. Drafts can be deleted through
  // deleteDesignFromFirebase; historical publication deletion is admin/backend only.
  if (id.includes('__')) {
    throw new Error('FLYER_PUBLICATION_IMMUTABLE');
  }
  await deleteFlyerDocument(id);
  return true;
}

function getLocalCustomIcons(): SportsIcon[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_ICONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomIcons(icons: SportsIcon[]) {
  localStorage.setItem(LOCAL_CUSTOM_ICONS_KEY, JSON.stringify(icons));
}

/**
 * Custom binary icons remain local during F6 until the Storage-backed
 * flyerAssets provider is enabled. They are not written as Base64 into Firestore.
 */
export async function loadCustomIconsFromFirebase(): Promise<SportsIcon[]> {
  return getLocalCustomIcons();
}

export async function saveCustomIconToFirebase(
  icon: Omit<SportsIcon, 'id'> & { id?: string },
): Promise<SportsIcon> {
  const docId = icon.id || `custom_icon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newIcon: SportsIcon = {
    id: docId,
    name: icon.name,
    nameIt: icon.nameIt || icon.name,
    nameDe: icon.nameDe || icon.name,
    nameEn: icon.nameEn || icon.name,
    category: icon.category || 'Custom',
    lucideIconName: icon.lucideIconName || 'Sparkles',
    description: icon.description || 'Custom icon',
    customIconUrl: icon.customIconUrl || '',
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  const list = getLocalCustomIcons();
  const index = list.findIndex(item => item.id === docId);
  if (index >= 0) list[index] = newIcon;
  else list.unshift(newIcon);
  saveLocalCustomIcons(list);
  return newIcon;
}

export async function deleteCustomIconFromFirebase(id: string): Promise<boolean> {
  saveLocalCustomIcons(getLocalCustomIcons().filter(icon => icon.id !== id));
  return true;
}
