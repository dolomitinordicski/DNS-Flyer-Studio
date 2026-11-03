import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

// Firebase Auth persistence is keyed by API key and app name. Using the same
// canonical name as DNS Workspace lets same-origin embedded documents observe
// one dns-core session without transferring credentials or tokens.
export const DNS_CORE_APP_NAME = 'dns-digital-pass';

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

// Explicit local-only opt-in for browser acceptance tests. Never connect a
// deployed build to local emulators, even if its environment is misconfigured.
if (import.meta.env.DEV && import.meta.env.VITE_DNS_USE_EMULATORS === 'true') {
  connectAuthEmulator(dnsCoreAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(dnsCoreDb, '127.0.0.1', 8080);
}


export const dnsCoreAuthProvider = new GoogleAuthProvider();
dnsCoreAuthProvider.setCustomParameters({ prompt: 'select_account' });

export function subscribeDNSCoreUser(listener: (user: User | null) => void): () => void {
  return onAuthStateChanged(dnsCoreAuth, listener);
}

export async function signInDNSCore(): Promise<User> {
  const result = await signInWithPopup(dnsCoreAuth, dnsCoreAuthProvider);
  return result.user;
}

/** Uses the same dns-core Firebase Auth tenant; no parallel account store. */
export async function signInDNSCoreWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(dnsCoreAuth, email, password);
  return result.user;
}

export async function signOutDNSCore(): Promise<void> {
  await signOut(dnsCoreAuth);
}

export function getDNSCoreUser(): User | null {
  return dnsCoreAuth.currentUser;
}
