import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { dnsCoreDb, getDNSCoreUser } from '../lib/dnsCore';

/** UI projection only. Authoritative authorization stays in dns-core Firestore Rules. */
export interface CurrentFlyerAccess {
  isAdmin: boolean;
  hasNetworkAccess: boolean;
  canRead: boolean;
  canWrite: boolean;
  reportingAreaId?: string;
  organizationId?: string;
}

const denied = (): CurrentFlyerAccess => ({
  isAdmin: false, hasNetworkAccess: false, canRead: false, canWrite: false,
});

export async function loadCurrentFlyerAccess(): Promise<CurrentFlyerAccess> {
  const user = getDNSCoreUser();
  if (!user) return denied();

  const [userSnap, membershipSnap, grantsSnap] = await Promise.all([
    getDoc(doc(dnsCoreDb, 'users', user.uid)),
    getDocs(query(collection(dnsCoreDb, 'memberships'), where('userId', '==', user.uid))),
    getDocs(query(collection(dnsCoreDb, 'accessGrants'), where('userId', '==', user.uid))),
  ]);
  if (!userSnap.exists()) return denied();
  const profile = userSnap.data();
  if (profile.active !== true && profile.status !== 'active') return denied();

  const memberships = membershipSnap.docs.map(item => item.data())
    .filter(item => item.active === true || item.status === 'active');
  const grants = grantsSnap.docs.map(item => item.data())
    .filter(item => item.active === true && (!item.expiresAt || typeof item.expiresAt !== 'string' || Date.parse(item.expiresAt) > Date.now()));
  const isAdmin = Array.isArray(profile.globalRoles) && profile.globalRoles.includes('dns-admin');
  const permitted = (permission: string) => grants.filter(item =>
    Array.isArray(item.permissions) && item.permissions.includes(permission));
  const readGrants = permitted('flyer.read');
  const writeGrants = permitted('flyer.write');
  const network = grants.find(item => item.scopeType === 'network' && item.scopeId === 'dolomiti-nordicski'
    && (readGrants.includes(item) || writeGrants.includes(item)));
  const regionGrant = [...readGrants, ...writeGrants].find(item => item.scopeType === 'reportingArea');
  const orgGrant = [...readGrants, ...writeGrants].find(item => item.scopeType === 'organization'
    && memberships.some(m => m.organizationId === item.scopeId));

  return {
    isAdmin,
    hasNetworkAccess: isAdmin || !!network,
    canRead: isAdmin || readGrants.length > 0,
    canWrite: isAdmin || writeGrants.length > 0,
    reportingAreaId: regionGrant?.scopeId,
    organizationId: orgGrant?.scopeId,
  };
}
