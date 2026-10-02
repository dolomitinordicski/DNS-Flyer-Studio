import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type {
  AssetLibraryDataProvider,
  DNSCoreDataProvider,
} from '../model/blockDataResolver';
import type {
  AssetLibraryBlockDataSource,
  DNSCoreBlockDataSource,
} from '../model/blockDataContract';
import { dnsCoreDb } from '../lib/dnsCore';

const ALLOWED_DNS_CORE_DATASETS = new Set([
  'reportingAreas',
  'organizations',
  'seasons',
  'ticketPricingConfigs',
  'areaAllocationKeys',
]);

export const dnsCoreBlockDataProvider: DNSCoreDataProvider = {
  async resolve(source: DNSCoreBlockDataSource): Promise<unknown> {
    if (!ALLOWED_DNS_CORE_DATASETS.has(source.dataset)) {
      throw new Error(`UNSUPPORTED_DNS_CORE_DATASET:${source.dataset}`);
    }

    if (source.entityId) {
      const snapshot = await getDoc(doc(dnsCoreDb, source.dataset, source.entityId));
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    }

    if (source.season) {
      const snapshot = await getDocs(
        query(collection(dnsCoreDb, source.dataset), where('seasonId', '==', source.season)),
      );
      return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    }

    const snapshot = await getDocs(collection(dnsCoreDb, source.dataset));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  },
};

export const flyerAssetMetadataProvider: AssetLibraryDataProvider = {
  async resolve(source: AssetLibraryBlockDataSource): Promise<unknown> {
    const results = await Promise.all(
      source.assetIds.map(async assetId => {
        const snapshot = await getDoc(doc(dnsCoreDb, 'flyerAssets', assetId));
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      }),
    );
    return results.filter(Boolean);
  },
};
