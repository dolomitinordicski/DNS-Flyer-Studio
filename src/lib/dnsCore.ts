import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const DNS_CORE_APP_NAME = 'dns-core-flyer-studio';

export const DNS_CORE_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAgxv6Z45-AfrusbFnCSyvYChRUBu6-vXc',
  authDomain: 'dns-core.firebaseapp.com',
  projectId: 'dns-core',
  storageBucket: 'dns-core.firebasestorage.app',
  messagingSenderId: '387653285986',
  appId: '1:387653285986:web:27ad6f2e9a41ea1aebb93b',
  measurementId: 'G-2G56PRYNME',
} as const;

export const dnsCoreApp: FirebaseApp =
  getApps().find(app => app.name === DNS_CORE_APP_NAME)
  ?? initializeApp(DNS_CORE_FIREBASE_CONFIG, DNS_CORE_APP_NAME);

export const dnsCoreDb: Firestore = getFirestore(dnsCoreApp);
export const dnsCoreAuth = getAuth(dnsCoreApp);

export const dnsCoreAuthProvider = new GoogleAuthProvider();
dnsCoreAuthProvider.setCustomParameters({ prompt: 'select_account' });

export function subscribeDNSCoreUser(listener: (user: User | null) => void): () => void {
  return onAuthStateChanged(dnsCoreAuth, listener);
}

export async function signInDNSCore(): Promise<User> {
  const result = await signInWithPopup(dnsCoreAuth, dnsCoreAuthProvider);
  return result.user;
}

export async function signOutDNSCore(): Promise<void> {
  await signOut(dnsCoreAuth);
}

export function getDNSCoreUser(): User | null {
  return dnsCoreAuth.currentUser;
}
