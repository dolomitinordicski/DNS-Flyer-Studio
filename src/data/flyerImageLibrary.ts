import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { dnsCoreApp, dnsCoreAuth, getDNSCoreUser } from '../lib/dnsCore';
import { coreReportingAreaId } from './regionalLogos';

const storage = getStorage(dnsCoreApp);
// Surface a missing bucket or unavailable service instead of retrying for minutes.
storage.maxUploadRetryTime = 30_000;
storage.maxOperationRetryTime = 15_000;
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 2400;

export interface FlyerImageAsset { url: string; name: string; path: string }

async function areaFolder(areaId: string): Promise<string> {
  // Firebase restores the account asynchronously after a page refresh.
  await dnsCoreAuth.authStateReady();
  const user = getDNSCoreUser();
  if (!user) throw new Error('DNS_CORE_AUTH_REQUIRED');
  // The reporting area is the DNS counterpart. Storage rules decide whether
  // the signed-in account may read or write the shared area library.
  // The editor uses legacy presentation IDs (e.g. 3_zinnen), while
  // dns-core Storage grants are issued for canonical reporting-area IDs
  // (e.g. drei-zinnen). Never use the presentation alias as a Storage path.
  const area = coreReportingAreaId(areaId).replace(/[^a-zA-Z0-9_-]/g, '_');
  if (!area) throw new Error('INVALID_AREA_SCOPE');
  return `flyerAssets/${area}`;
}

async function optimizeImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('IMAGE_TYPE_UNSUPPORTED');
  if (file.size > MAX_BYTES) throw new Error('IMAGE_TOO_LARGE');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('IMAGE_PROCESSING_UNAVAILABLE');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(result => result ? resolve(result) : reject(new Error('IMAGE_PROCESSING_UNAVAILABLE')), 'image/jpeg', 0.84)
    );
    return blob;
  } finally {
    bitmap.close();
  }
}

export async function uploadFlyerImage(file: File, regionId: string): Promise<FlyerImageAsset> {
  const folder = await areaFolder(regionId);
  const optimized = await optimizeImage(file);
  const name = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 90) || 'image';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${name}.jpg`;
  const imageRef = ref(storage, path);
  await uploadBytes(imageRef, optimized, { contentType: 'image/jpeg' });
  return { path, name: file.name, url: await getDownloadURL(imageRef) };
}

export async function listFlyerImages(regionId: string): Promise<FlyerImageAsset[]> {
  const folder = await areaFolder(regionId);
  const result = await listAll(ref(storage, folder));
  const items = await Promise.all(result.items.map(async item => ({
    path: item.fullPath,
    name: item.name.replace(/^\d+_[a-z0-9]+_/, '').replace(/\.jpg$/, ''),
    url: await getDownloadURL(item),
  })));
  return items.reverse();
}
