import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlyerContent } from '../types';
import { saveDesignToFirebase } from '../lib/firebase';

export type AutosaveStatus = 'local' | 'pending' | 'saving' | 'saved' | 'error';

/**
 * One canonical draft per editing session. Local browser recovery is managed
 * by App; this hook only synchronizes changed drafts to DNS Core.
 *
 * Updates are serialized to prevent older network writes from overwriting newer
 * edits. A document ID is reused across autosave and manual saves, and is
 * recovered after refresh for the same signed-in account.
 */
export function useFlyerAutosave(
  content: FlyerContent,
  userId: string | null,
  enabled: boolean,
) {
  const [status, setStatus] = useState<AutosaveStatus>('local');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const idRef = useRef<string | null>(null);
  const epochRef = useRef(0);
  const lastSavedRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const userRef = useRef<string | null>(null);

  useEffect(() => {
    if (userRef.current === userId) return;
    userRef.current = userId;
    epochRef.current += 1;
    const restoredId = userId ? localStorage.getItem(`dns_active_draft_${userId}`) : null;
    idRef.current = restoredId;
    setDraftId(restoredId);
    lastSavedRef.current = null;
    setStatus(userId ? 'pending' : 'local');
    setErrorCode(null);
  }, [userId]);

  const selectDraft = useCallback((id: string | null, loaded?: FlyerContent) => {
    epochRef.current += 1;
    idRef.current = id;
    setDraftId(id);
    lastSavedRef.current = loaded ? JSON.stringify(loaded) : null;
    if (userRef.current) {
      const key = `dns_active_draft_${userRef.current}`;
      if (id) localStorage.setItem(key, id);
      else localStorage.removeItem(key);
      setStatus(id && loaded ? 'saved' : 'pending');
    } else {
      setStatus('local');
    }
  }, []);

  const saveNow = useCallback((snapshot: FlyerContent, title?: string): Promise<void> => {
    if (!userRef.current) {
      setStatus('local');
      return Promise.reject(new Error('DNS_CORE_AUTH_REQUIRED'));
    }
    const epoch = epochRef.current;
    const owner = userRef.current;
    const signature = JSON.stringify(snapshot);
    if (signature === lastSavedRef.current && !title) return queueRef.current.then(() => {});
    setStatus('saving');
    setErrorCode(null);

    const next = queueRef.current.catch(() => {}).then(async () => {
      if (epoch !== epochRef.current || owner !== userRef.current) return;
      if (signature === lastSavedRef.current && !title) return;
      const savedId = await saveDesignToFirebase(
        idRef.current,
        title || snapshot.title || 'DNS Flyer',
        snapshot,
        snapshot.graphicStyle,
        snapshot.heroImageUrl,
      );
      if (epoch !== epochRef.current || owner !== userRef.current) return;
      idRef.current = savedId;
      setDraftId(savedId);
      localStorage.setItem(`dns_active_draft_${owner}`, savedId);
      lastSavedRef.current = signature;
      setStatus('saved');
      setErrorCode(null);
    });
    queueRef.current = next.catch(() => {});
    return next.catch(error => {
      if (epoch === epochRef.current) {
        setErrorCode(error?.code || error?.message || 'FIRESTORE_SAVE_FAILED');
        setStatus('error');
      }
      throw error;
    });
  }, []);

  useEffect(() => {
    if (!userId || !enabled) return;
    if (JSON.stringify(content) === lastSavedRef.current) return;
    setStatus('pending');
    const timer = window.setTimeout(() => {
      void saveNow(content).catch(error => console.error('DNS Flyer autosave failed:', error));
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [content, userId, enabled, saveNow]);

  return { status, errorCode, draftId, saveNow, selectDraft };
}
