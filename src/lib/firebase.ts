import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import rawFirebaseConfig from '../../firebase-applet-config.json';
import { FlyerContent, FlyerRecord, SportsIcon } from '../types';
import { createFlyerDocumentV1, flyerDocumentToContent, isFlyerDocumentV1, type FlyerDocumentV1 } from '../model/flyerDocument';
import { INITIAL_FLYER_REGISTRY } from '../data/mockFlyerRegistry';

interface FirebaseAppletConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

const firebaseConfig: FirebaseAppletConfig = (rawFirebaseConfig as FirebaseAppletConfig) || {};

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

const COLLECTION_NAME = 'designs';
const LOCAL_STORAGE_KEY = 'dns_flyer_saved_designs';

// Helper for local storage fallback
function getLocalDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.map(normalizeSavedDesign) : [];
  } catch {
    return [];
  }
}

function normalizeSavedDesign(item: any): SavedDesign {
  const document = isFlyerDocumentV1(item?.document) ? item.document : undefined;
  const content = document
    ? flyerDocumentToContent(document)
    : (item?.content as FlyerContent);
  return {
    ...item,
    content,
    document: document ?? (content ? createFlyerDocumentV1(content, {
      id: item?.id,
      title: item?.title,
      source: 'legacy',
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    }) : undefined),
  };
}

function saveLocalDesigns(items: SavedDesign[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

let db: Firestore | null = null;
let isFirebaseConfigured = false;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    isFirebaseConfigured = true;
  } catch (err) {
    console.warn('Firebase initialization skipped/failed:', err);
  }
}

/**
 * Save or update a flyer design in Firestore (or LocalStorage if unconfigured)
 */
export async function saveDesignToFirebase(
  id: string | null,
  title: string,
  content: FlyerContent,
  graphicStyle: any,
  thumbnail?: string
): Promise<string> {
  const docId = id || `design_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const payloadItem: SavedDesign = {
    id: docId,
    title: title || content.title || 'Senza Titolo',
    regionId: content.regionId || 'default',
    graphicStyle: graphicStyle || 'classic_official',
    themeColor: content.themeColor || 'classic_blue',
    content: JSON.parse(JSON.stringify(content)),
    document: createFlyerDocumentV1(content, {
      id: docId,
      title,
      source: 'saved-design',
      createdAt: nowIso,
      updatedAt: nowIso,
    }),
    thumbnail: thumbnail || '',
    updatedAt: nowIso,
    createdAt: nowIso
  };

  if (isFirebaseConfigured && db) {
    try {
      const designRef = doc(db, COLLECTION_NAME, docId);
      const firestorePayload = {
        ...payloadItem,
        timestamp: serverTimestamp()
      };
      await setDoc(designRef, firestorePayload, { merge: true });
      return docId;
    } catch (error) {
      console.warn('Firestore save failed, falling back to LocalStorage:', error);
    }
  }

  // Fallback to LocalStorage
  const localList = getLocalDesigns();
  const existingIdx = localList.findIndex(d => d.id === docId);
  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...payloadItem };
  } else {
    localList.unshift(payloadItem);
  }
  saveLocalDesigns(localList);
  return docId;
}

/**
 * Fetch all saved flyer designs from Firestore (or LocalStorage)
 */
export async function loadDesignsFromFirebase(): Promise<SavedDesign[]> {
  if (isFirebaseConfigured && db) {
    try {
      const designsCol = collection(db, COLLECTION_NAME);
      const q = query(designsCol, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);

      const results: SavedDesign[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          title: data.title || 'Design Senza Titolo',
          description: data.description || '',
          regionId: data.regionId || 'default',
          graphicStyle: data.graphicStyle || 'classic_official',
          themeColor: data.themeColor || 'classic_blue',
          content: isFlyerDocumentV1(data.document)
            ? flyerDocumentToContent(data.document)
            : data.content as FlyerContent,
          document: isFlyerDocumentV1(data.document)
            ? data.document
            : createFlyerDocumentV1(data.content as FlyerContent, {
                id: docSnap.id,
                title: data.title,
                source: 'legacy',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              }),
          thumbnail: data.thumbnail || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      return results;
    } catch (error) {
      console.warn('Firestore load failed, falling back to LocalStorage:', error);
    }
  }

  return getLocalDesigns();
}

/**
 * Delete a design from Firestore (or LocalStorage) by ID
 */
export async function deleteDesignFromFirebase(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const designRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(designRef);
    } catch (error) {
      console.warn('Firestore delete failed, falling back to LocalStorage:', error);
    }
  }

  const localList = getLocalDesigns().filter(d => d.id !== id);
  saveLocalDesigns(localList);
  return true;
}

const REGISTRY_COLLECTION = 'flyer_registry';
const LOCAL_REGISTRY_KEY = 'dns_flyer_registry_items';

function normalizeFlyerRecord(item: FlyerRecord): FlyerRecord {
  const document = isFlyerDocumentV1(item.document) ? item.document : undefined;
  const content = document ? flyerDocumentToContent(document) : item.content;
  return {
    ...item,
    content,
    document: document ?? (content ? createFlyerDocumentV1(content, {
      id: item.id,
      title: item.title,
      source: 'legacy',
      status: item.status,
      publishDate: item.publishDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }) : undefined),
  };
}

function getLocalRegistry(): FlyerRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRY_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(INITIAL_FLYER_REGISTRY));
      return INITIAL_FLYER_REGISTRY.map(normalizeFlyerRecord);
    }
    const items: FlyerRecord[] = JSON.parse(raw);
    // Remove old removed mock pseudo-flyers (flyer_rec_02 to flyer_rec_10)
    const filtered = items.map(normalizeFlyerRecord).filter(item => {
      if (item.id && /^flyer_rec_0[2-9]|^flyer_rec_10/.test(item.id)) {
        return false;
      }
      return true;
    });
    // Ensure flyer_rec_01 exists if registry is empty
    if (filtered.length === 0) {
      return INITIAL_FLYER_REGISTRY.map(normalizeFlyerRecord);
    }
    return filtered;
  } catch {
    return INITIAL_FLYER_REGISTRY.map(normalizeFlyerRecord);
  }
}

function saveLocalRegistry(items: FlyerRecord[]) {
  try {
    localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('LocalStorage write failed for registry:', err);
  }
}

/**
 * Load all Flyer Records for the Regional Analytics Dashboard
 */
export async function loadFlyerRecordsFromFirebase(): Promise<FlyerRecord[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, REGISTRY_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const results: FlyerRecord[] = [];
        snapshot.forEach((docSnap) => {
          if (/^flyer_rec_0[2-9]|^flyer_rec_10/.test(docSnap.id)) {
            return;
          }
          const data = docSnap.data();
          results.push({
            id: docSnap.id,
            title: data.title || 'Flyer Senza Titolo',
            regionId: data.regionId || 'dns_central',
            regionName: data.regionName || 'Dolomiti NordicSki',
            status: data.status || 'issued',
            publishDate: data.publishDate || new Date().toISOString().split('T')[0],
            validityPeriod: data.validityPeriod || '',
            location: data.location || '',
            category: data.category || 'general',
            priceInfo: data.priceInfo || '',
            targetAudience: data.targetAudience || '',
            content: isFlyerDocumentV1(data.document)
              ? flyerDocumentToContent(data.document)
              : data.content as FlyerContent,
            document: isFlyerDocumentV1(data.document)
              ? data.document
              : createFlyerDocumentV1(data.content as FlyerContent, {
                  id: docSnap.id,
                  title: data.title,
                  source: 'legacy',
                  status: data.status,
                  publishDate: data.publishDate,
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                }),
            thumbnailUrl: data.thumbnailUrl || '',
            createdByRegion: data.createdByRegion || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            viewsCount: data.viewsCount || 0,
            downloadsCount: data.downloadsCount || 0
          });
        });
        return results.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      }
    } catch (error) {
      console.warn('Firestore registry load failed, falling back to local registry:', error);
    }
  }

  return getLocalRegistry();
}

/**
 * Save or update a Flyer Record in Firestore/LocalStorage
 */
export async function saveFlyerRecordToFirebase(record: Partial<FlyerRecord>): Promise<FlyerRecord> {
  const docId = record.id || `flyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const fullRecord: FlyerRecord = {
    id: docId,
    title: record.title || record.content?.title || 'Senza Titolo',
    regionId: record.regionId || record.content?.regionId || 'dns_central',
    regionName: record.regionName || 'Dolomiti NordicSki',
    status: record.status || 'issued',
    publishDate: record.publishDate || new Date().toISOString().split('T')[0],
    validityPeriod: record.validityPeriod || record.content?.validityPeriod || '',
    location: record.location || record.content?.location || '',
    category: record.category || 'general',
    priceInfo: record.priceInfo || (record.content ? `${record.content.pricePrefix || ''} ${record.content.priceAmount}${record.content.priceCurrency}` : ''),
    targetAudience: record.targetAudience || '',
    content: record.content as FlyerContent,
    document: record.document ?? createFlyerDocumentV1(record.content as FlyerContent, {
      id: docId,
      title: record.title,
      source: 'registry',
      status: record.status || 'issued',
      publishDate: record.publishDate || new Date().toISOString().split('T')[0],
      createdAt: record.createdAt || nowIso,
      updatedAt: nowIso,
    }),
    thumbnailUrl: record.thumbnailUrl || record.content?.heroImageUrl || '',
    createdByRegion: record.createdByRegion || record.regionName || 'Organizzazione',
    createdAt: record.createdAt || nowIso,
    updatedAt: nowIso,
    viewsCount: record.viewsCount || 0,
    downloadsCount: record.downloadsCount || 0
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, REGISTRY_COLLECTION, docId);
      await setDoc(ref, {
        ...fullRecord,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore registry save failed, saving to local storage:', err);
    }
  }

  const localList = getLocalRegistry();
  const existingIdx = localList.findIndex(item => item.id === docId);
  if (existingIdx >= 0) {
    localList[existingIdx] = fullRecord;
  } else {
    localList.unshift(fullRecord);
  }
  saveLocalRegistry(localList);

  return fullRecord;
}

/**
 * Delete a Flyer Record
 */
export async function deleteFlyerRecordFromFirebase(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, REGISTRY_COLLECTION, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore registry delete failed:', err);
    }
  }

  const filtered = getLocalRegistry().filter(item => item.id !== id);
  saveLocalRegistry(filtered);
  return true;
}

const CUSTOM_ICONS_COLLECTION = 'custom_icons';
const LOCAL_CUSTOM_ICONS_KEY = 'dns_custom_sports_icons';

function getLocalCustomIcons(): SportsIcon[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_ICONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomIcons(icons: SportsIcon[]) {
  try {
    localStorage.setItem(LOCAL_CUSTOM_ICONS_KEY, JSON.stringify(icons));
  } catch (err) {
    console.error('LocalStorage write failed for custom icons:', err);
  }
}

/**
 * Load user uploaded custom sports icons from Firestore (or LocalStorage)
 */
export async function loadCustomIconsFromFirebase(): Promise<SportsIcon[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, CUSTOM_ICONS_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const results: SportsIcon[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          results.push({
            id: docSnap.id,
            name: data.name || 'Icona Personalizzata',
            nameIt: data.nameIt || data.name || 'Icona Personalizzata',
            nameDe: data.nameDe || data.name || 'Benutzerdefiniertes Icon',
            nameEn: data.nameEn || data.name || 'Custom Icon',
            category: data.category || 'Custom',
            lucideIconName: data.lucideIconName || 'Sparkles',
            description: data.description || '',
            customIconUrl: data.customIconUrl || '',
            isCustom: true,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });
        return results;
      }
    } catch (err) {
      console.warn('Firestore custom icons load failed, falling back to local storage:', err);
    }
  }

  return getLocalCustomIcons();
}

/**
 * Save a new user custom icon to Firestore (or LocalStorage)
 */
export async function saveCustomIconToFirebase(icon: Omit<SportsIcon, 'id'> & { id?: string }): Promise<SportsIcon> {
  const docId = icon.id || `custom_icon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const newIcon: SportsIcon = {
    id: docId,
    name: icon.name,
    nameIt: icon.nameIt || icon.name,
    nameDe: icon.nameDe || icon.name,
    nameEn: icon.nameEn || icon.name,
    category: icon.category || 'Custom',
    lucideIconName: icon.lucideIconName || 'Sparkles',
    description: icon.description || 'Icona caricata dall\'utente',
    customIconUrl: icon.customIconUrl || '',
    isCustom: true,
    createdAt: nowIso
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, CUSTOM_ICONS_COLLECTION, docId);
      await setDoc(ref, {
        ...newIcon,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore custom icon save failed, saving to local storage:', err);
    }
  }

  const list = getLocalCustomIcons();
  const existingIdx = list.findIndex(i => i.id === docId);
  if (existingIdx >= 0) {
    list[existingIdx] = newIcon;
  } else {
    list.unshift(newIcon);
  }
  saveLocalCustomIcons(list);

  return newIcon;
}

/**
 * Delete a custom icon from Firestore (and LocalStorage)
 */
export async function deleteCustomIconFromFirebase(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, CUSTOM_ICONS_COLLECTION, id);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore custom icon delete failed:', err);
    }
  }

  const filtered = getLocalCustomIcons().filter(i => i.id !== id);
  saveLocalCustomIcons(filtered);
  return true;
}



