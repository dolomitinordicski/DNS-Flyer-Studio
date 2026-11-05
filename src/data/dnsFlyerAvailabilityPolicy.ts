import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { dnsCoreDb, getDNSCoreUser } from '../lib/dnsCore';
import { loadCurrentFlyerAccess } from './currentFlyerAccess';
import type { FlyerProductType } from '../model/flyerProductModel';

export interface DNSFlyerAvailabilityPolicy {
  schemaVersion: 1;
  enabled: Record<FlyerProductType, boolean>;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_FLYER_AVAILABILITY: DNSFlyerAvailabilityPolicy = {
  schemaVersion: 1,
  enabled: {
    dns_price_list: true,
    regional_price_list: true,
    ticket_weekly_dns: false,
    ticket_weekly_area: false,
    ticket_daily_area: false,
    hotel_package: false,
    voucher: false,
    gutschein: false,
    promotion: false,
  },
};

const target = doc(dnsCoreDb, 'flyerAvailabilityPolicies', 'dns-global');
const PRODUCT_TYPES = Object.keys(DEFAULT_FLYER_AVAILABILITY.enabled) as FlyerProductType[];

export function parseFlyerAvailabilityPolicy(raw: unknown): DNSFlyerAvailabilityPolicy {
  const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const source = data.enabled && typeof data.enabled === 'object'
    ? data.enabled as Record<string, unknown>
    : {};
  const enabled = { ...DEFAULT_FLYER_AVAILABILITY.enabled };
  for (const type of PRODUCT_TYPES) {
    if (typeof source[type] === 'boolean') enabled[type] = source[type] as boolean;
  }
  return {
    schemaVersion: 1,
    enabled,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

export function subscribeFlyerAvailabilityPolicy(
  onUpdate: (policy: DNSFlyerAvailabilityPolicy) => void,
  onError?: (message: string) => void,
) {
  return onSnapshot(target,
    snap => onUpdate(parseFlyerAvailabilityPolicy(snap.exists() ? snap.data() : null)),
    error => onError?.(error.code),
  );
}

export function isFlyerProductEnabled(policy: DNSFlyerAvailabilityPolicy, type: FlyerProductType): boolean {
  return policy.enabled[type] === true;
}

export async function saveFlyerAvailabilityPolicy(next: DNSFlyerAvailabilityPolicy): Promise<void> {
  const user = getDNSCoreUser();
  if (!user) throw new Error('DNS login required');
  const access = await loadCurrentFlyerAccess();
  if (!access.isAdmin) throw new Error('DNS admin role required');
  const clean = parseFlyerAvailabilityPolicy(next);
  await setDoc(target, {
    ...clean,
    updatedBy: user.uid,
    updatedAt: new Date().toISOString(),
  });
}
