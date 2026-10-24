import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { dnsCoreDb, getDNSCoreUser } from '../lib/dnsCore';
import { loadCurrentFlyerAccess } from './currentFlyerAccess';

export type FadeSide = 'none' | 'top' | 'right' | 'bottom' | 'left';
export type DesignProperty = 'corners' | 'pills' | 'heroFade';
export interface DesignValues { corners: 'square' | 'soft' | 'round'; pills: 'square' | 'soft' | 'pill'; heroFade: FadeSide }
export type DesignOverride = Partial<DesignValues>;
export interface DNSFlyerDesignPolicy { schemaVersion: 1; global: DesignValues; perFlyer: Record<string, DesignOverride>; updatedAt?: string; updatedBy?: string }
export const DEFAULT_DESIGN: DesignValues = { corners: 'round', pills: 'pill', heroFade: 'bottom' };
export const DEFAULT_POLICY: DNSFlyerDesignPolicy = { schemaVersion: 1, global: DEFAULT_DESIGN, perFlyer: {} };
const target = doc(dnsCoreDb, 'flyerDesignPolicies', 'dns-global');
const accepted: Record<DesignProperty, string[]> = {
  corners: ['square','soft','round'], pills: ['square','soft','pill'], heroFade: ['none','top','right','bottom','left'],
};
function validated(input: unknown): DesignOverride {
  if (!input || typeof input !== 'object') return {};
  const obj = input as Record<string, unknown>, out: DesignOverride = {};
  for (const key of Object.keys(accepted) as DesignProperty[]) {
    if (typeof obj[key] === 'string' && accepted[key].includes(obj[key] as string)) {
      (out as Record<string, unknown>)[key] = obj[key];
    }
  }
  return out;
}
export function parseDesignPolicy(raw: unknown): DNSFlyerDesignPolicy {
  const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const global = { ...DEFAULT_DESIGN, ...validated(data.global) };
  const perFlyer: Record<string, DesignOverride> = {};
  if (data.perFlyer && typeof data.perFlyer === 'object') {
    for (const [name, setting] of Object.entries(data.perFlyer)) {
      if (/^[a-z][a-z0-9_]{0,80}$/.test(name)) perFlyer[name] = validated(setting);
    }
  }
  return { schemaVersion: 1, global, perFlyer };
}
export function resolveFlyerDesign(policy: DNSFlyerDesignPolicy, flyer: string): DesignValues {
  return { ...policy.global, ...policy.perFlyer[flyer] };
}
export function subscribeDesignPolicy(onUpdate: (policy: DNSFlyerDesignPolicy) => void, onError?: (message: string) => void) {
  return onSnapshot(target, snap => onUpdate(parseDesignPolicy(snap.exists() ? snap.data() : null)), error => onError?.(error.code));
}
/** Always authorize against current DNS Core identity; hidden UI alone is not security. */
export async function saveDesignPolicy(next: DNSFlyerDesignPolicy): Promise<void> {
  const user = getDNSCoreUser();
  if (!user) throw new Error('DNS login required');
  const access = await loadCurrentFlyerAccess();
  if (!access.isAdmin) throw new Error('DNS admin role required');
  const clean = parseDesignPolicy(next);
  await setDoc(target, { ...clean, updatedBy: user.uid, updatedAt: new Date().toISOString() });
}
