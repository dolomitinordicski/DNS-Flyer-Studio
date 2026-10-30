import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import type { FlyerContent, FlyerRecord, FlyerStatus } from '../types';
import {
  createFlyerDocumentV1,
  flyerDocumentToContent,
  isFlyerDocumentV1,
  type FlyerDocumentV1,
} from '../model/flyerDocument';
import { dnsCoreDb, getDNSCoreUser } from '../lib/dnsCore';
import { coreReportingAreaId } from './regionalLogos';
import { loadCurrentFlyerAccess } from './currentFlyerAccess';

export type FlyerScopeType = 'network' | 'reportingArea' | 'organization';

export interface FlyerDocumentRecord {
  id: string;
  schema: 'dns.flyer-document';
  version: 1;
  title: string;
  scopeType: FlyerScopeType;
  scopeId: string;
  seasonId: string;
  status: 'draft' | 'ready' | 'archived';
  ownerUserId: string;
  document: FlyerDocumentV1;
  createdAt?: unknown;
  updatedAt?: unknown;
  updatedBy: string;
}

export interface FlyerPublicationRecord {
  id: string;
  schema: 'dns.flyer-publication';
  version: 1;
  flyerDocumentId: string;
  title: string;
  scopeType: FlyerScopeType;
  scopeId: string;
  seasonId: string;
  snapshot: FlyerDocumentV1;
  publishedAt?: unknown;
  publishedBy: string;
}

export interface FlyerTemplateRecord {
  id: string;
  schema: 'dns.flyer-template';
  version: 1;
  name: string;
  scopeType: FlyerScopeType;
  scopeId: string;
  blockStack: string[];
  documentDefaults?: Partial<FlyerDocumentV1>;
  updatedAt?: unknown;
  updatedBy: string;
}

const DOCUMENTS = 'flyerDocuments';
const PUBLICATIONS = 'flyerPublications';

/**
 * FlyerDocumentV1 has optional nested fields. Firestore rejects `undefined`
 * even in nested maps (e.g. document.meta.createdAt). Remove absent values
 * before persisting without changing the editor's in-memory document.
 */
function firestoreSafeDocument(document: FlyerDocumentV1): FlyerDocumentV1 {
  return JSON.parse(JSON.stringify(document)) as FlyerDocumentV1;
}

export function requireDNSCoreUser() {
  const user = getDNSCoreUser();
  if (!user) {
    throw new Error('DNS_CORE_AUTH_REQUIRED');
  }
  return user;
}

export function scopeFromContent(content: FlyerContent): { scopeType: FlyerScopeType; scopeId: string } {
  if (!content.regionId || content.regionId === 'dns_central') {
    return { scopeType: 'network', scopeId: 'dolomiti-nordicski' };
  }
  return { scopeType: 'reportingArea', scopeId: coreReportingAreaId(content.regionId) };
}

/** Client-side safety boundary in addition to authoritative Firestore Rules. */
async function assertFlyerScope(scopeType: FlyerScopeType, scopeId: string, write: boolean) {
  const access = await loadCurrentFlyerAccess();
  if (access.isAdmin) return;
  if (write ? !access.canWrite : !access.canRead) throw new Error('FLYER_PERMISSION_DENIED');
  if (scopeType !== 'reportingArea' || !access.reportingAreaId
      || access.reportingAreaId !== scopeId) throw new Error('FLYER_AREA_SCOPE_DENIED');
}

export function seasonIdFromContent(content: FlyerContent): string {
  const raw = content.validityPeriod?.trim();
  if (raw && /^\d{4}[/-]\d{2}$/.test(raw)) {
    return raw.replace('/', '-');
  }
  return '2026-27';
}

export async function saveFlyerDocument(
  content: FlyerContent,
  options: {
    id?: string;
    title?: string;
    status?: FlyerDocumentRecord['status'];
  } = {},
): Promise<FlyerDocumentRecord> {
  const user = requireDNSCoreUser();
  const id = options.id ?? `flyer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const scope = scopeFromContent(content);
  await assertFlyerScope(scope.scopeType, scope.scopeId, true);
  const seasonId = seasonIdFromContent(content);
  // Historic imports embedded full Base64 files in drafts. Never send these
  // oversized binary strings to Firestore (which has a 1 MiB document limit).
  // The user can replace their legacy image with a persisted Storage URL.
  const safeContent: FlyerContent = {
    ...content,
    heroImageUrl: /^data:image\//i.test(content.heroImageUrl || '') ? '' : content.heroImageUrl,
    importedImages: (content.importedImages || []).filter(url => !/^data:/i.test(url)),
    secondaryImages: (content.secondaryImages || []).filter(url => !/^data:/i.test(url)),
  };
  const flyerDocument = firestoreSafeDocument(createFlyerDocumentV1(safeContent, {
    id,
    title: options.title,
    source: 'saved-design',
  }));

  const record: FlyerDocumentRecord = {
    id,
    schema: 'dns.flyer-document',
    version: 1,
    title: options.title ?? content.title ?? 'Dolomiti NordicSki Flyer',
    ...scope,
    seasonId,
    status: options.status ?? 'draft',
    ownerUserId: user.uid,
    document: flyerDocument,
    updatedBy: user.uid,
  };

  await setDoc(
    doc(dnsCoreDb, DOCUMENTS, id),
    {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return record;
}

export async function loadOwnedFlyerDocuments(): Promise<FlyerDocumentRecord[]> {
  const user = requireDNSCoreUser();
  const access = await loadCurrentFlyerAccess();
  if (!access.canRead) throw new Error('FLYER_PERMISSION_DENIED');
  const snapshot = await getDocs(
    query(collection(dnsCoreDb, DOCUMENTS), where('ownerUserId', '==', user.uid)),
  );

  return snapshot.docs
    .map(snap => hydrateDocumentRecord(snap.id, snap.data()))
    .filter((item): item is FlyerDocumentRecord => !!item && (access.isAdmin || (item.scopeType === 'reportingArea' && item.scopeId === access.reportingAreaId)))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function deleteFlyerDocument(id: string): Promise<void> {
  requireDNSCoreUser();
  const target = doc(dnsCoreDb, DOCUMENTS, id);
  const existing = await getDoc(target);
  if (!existing.exists()) throw new Error('FLYER_DOCUMENT_NOT_FOUND');
  await assertFlyerScope(existing.data().scopeType, existing.data().scopeId, true);
  await deleteDoc(target);
}

export async function publishFlyerDocument(
  documentRecord: FlyerDocumentRecord,
): Promise<FlyerPublicationRecord> {
  const user = requireDNSCoreUser();
  await assertFlyerScope(documentRecord.scopeType, documentRecord.scopeId, true);
  const publicationId = `${documentRecord.id}__${Date.now()}`;
  const record: FlyerPublicationRecord = {
    id: publicationId,
    schema: 'dns.flyer-publication',
    version: 1,
    flyerDocumentId: documentRecord.id,
    title: documentRecord.title,
    scopeType: documentRecord.scopeType,
    scopeId: documentRecord.scopeId,
    seasonId: documentRecord.seasonId,
    snapshot: firestoreSafeDocument(documentRecord.document),
    publishedBy: user.uid,
  };

  await setDoc(doc(dnsCoreDb, PUBLICATIONS, publicationId), {
    ...record,
    publishedAt: serverTimestamp(),
  });

  return record;
}

export async function loadOwnedPublications(): Promise<FlyerPublicationRecord[]> {
  const user = requireDNSCoreUser();
  const access = await loadCurrentFlyerAccess();
  if (!access.canRead) throw new Error('FLYER_PERMISSION_DENIED');
  const snapshot = await getDocs(
    query(collection(dnsCoreDb, PUBLICATIONS), where('publishedBy', '==', user.uid)),
  );
  return snapshot.docs
    .map(snap => hydratePublicationRecord(snap.id, snap.data()))
    .filter((item): item is FlyerPublicationRecord => !!item && (access.isAdmin || (item.scopeType === 'reportingArea' && item.scopeId === access.reportingAreaId)));
}

export function savedDesignProjection(record: FlyerDocumentRecord) {
  const content = flyerDocumentToContent(record.document);
  return {
    id: record.id,
    title: record.title,
    regionId: content.regionId,
    graphicStyle: content.graphicStyle,
    themeColor: content.themeColor,
    content,
    document: record.document,
    thumbnail: content.heroImageUrl || '',
    createdAt: '',
    updatedAt: '',
  };
}

export function publicationProjection(record: FlyerPublicationRecord): FlyerRecord {
  const content = flyerDocumentToContent(record.snapshot);
  return {
    id: record.id,
    title: record.title,
    regionId: content.regionId,
    regionName: content.customRegionName || content.regionId,
    status: 'issued',
    publishDate: new Date().toISOString().slice(0, 10),
    validityPeriod: content.validityPeriod || '',
    location: content.location || '',
    category: 'general',
    priceInfo: `${content.pricePrefix || ''} ${content.priceAmount || ''}${content.priceCurrency || ''}`.trim(),
    targetAudience: '',
    content,
    document: record.snapshot,
    thumbnailUrl: content.heroImageUrl || '',
    createdByRegion: content.customRegionName || content.regionId,
    createdAt: '',
    updatedAt: '',
  };
}

function hydrateDocumentRecord(id: string, data: DocumentData): FlyerDocumentRecord | null {
  if (!isFlyerDocumentV1(data.document)) return null;
  return {
    id,
    schema: 'dns.flyer-document',
    version: 1,
    title: data.title ?? data.document.meta.title ?? 'Flyer',
    scopeType: data.scopeType,
    scopeId: data.scopeId,
    seasonId: data.seasonId,
    status: data.status ?? 'draft',
    ownerUserId: data.ownerUserId,
    document: data.document,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
  };
}

function hydratePublicationRecord(id: string, data: DocumentData): FlyerPublicationRecord | null {
  if (!isFlyerDocumentV1(data.snapshot)) return null;
  return {
    id,
    schema: 'dns.flyer-publication',
    version: 1,
    flyerDocumentId: data.flyerDocumentId,
    title: data.title ?? data.snapshot.meta.title ?? 'Flyer',
    scopeType: data.scopeType,
    scopeId: data.scopeId,
    seasonId: data.seasonId,
    snapshot: data.snapshot,
    publishedAt: data.publishedAt,
    publishedBy: data.publishedBy,
  };
}
