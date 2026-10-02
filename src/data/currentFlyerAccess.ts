import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { dnsCoreDb, getDNSCoreUser } from '../lib/dnsCore';

export interface CurrentFlyerAccess {
  isAdmin: boolean;
  reportingAreaId?: string;
  organizationId?: string;
}

export async function loadCurrentFlyerAccess(): Promise<CurrentFlyerAccess> {
  const user = getDNSCoreUser();
  if (!user) return { isAdmin: false };

  const [userSnap, grantsSnap] = await Promise.all([
    getDoc(doc(dnsCoreDb, 'users', user.uid)),
    getDocs(query(collection(dnsCoreDb, 'accessGrants'), where('userId', '==', user.uid))),
  ]);

  const userData = userSnap.exists() ? userSnap.data() : undefined;
  const isAdmin = Array.isArray(userData?.globalRoles) && userData.globalRoles.includes('dns-admin');

  const grants = grantsSnap.docs
    .map(item => item.data())
    .filter(item => item.active === true);

  const reportingArea = grants.find(item => item.scopeType === 'reportingArea');
  const organization = grants.find(item => item.scopeType === 'organization');

  return {
    isAdmin,
    reportingAreaId: reportingArea?.scopeId,
    organizationId: organization?.scopeId,
  };
}
