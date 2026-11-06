import React, { useState } from 'react';
import { FLYER_PRODUCTS } from '../model/flyerProductModel';
import {
  saveFlyerAvailabilityPolicy,
  type DNSFlyerAvailabilityPolicy,
} from '../data/dnsFlyerAvailabilityPolicy';

export function DNSFlyerAvailabilityControl({
  policy,
  onClose,
  uiLanguage,
}: {
  policy: DNSFlyerAvailabilityPolicy;
  uiLanguage: 'de' | 'it';
  onClose: () => void;
}) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [draft, setDraft] = useState<DNSFlyerAvailabilityPolicy>(() => structuredClone(policy));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveFlyerAvailabilityPolicy(draft);
      setMessage(ui('Flyer-Verfügbarkeit gespeichert.', 'Disponibilità flyer salvata.'));
    } catch (error) {
      setMessage(ui('Speichern fehlgeschlagen: ', 'Salvataggio non riuscito: ') + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 sm:p-4 no-print" role="dialog" aria-modal="true" aria-label="DNS Flyer Availability">
    <div className="flex w-full max-w-lg max-h-[calc(100dvh-1rem)] min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0D4D5E]">{ui('DNS · Flyer-Verfügbarkeit', 'DNS · Flyer disponibili')}</h2>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-lg border px-3 py-1.5 text-sm">{ui('Schließen', 'Chiudi')}</button>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
        {FLYER_PRODUCTS.map(product => (
          <label key={product.type} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <strong className="block text-sm text-slate-900">{product.label[uiLanguage]}</strong>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={draft.enabled[product.type] === true}
              onChange={event => setDraft(previous => ({
                ...previous,
                enabled: { ...previous.enabled, [product.type]: event.target.checked },
              }))}
            />
          </label>
        ))}
      </div>

      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <p role="status" className="min-w-0 flex-1 text-xs text-slate-600">{message}</p>
        <div className="flex justify-end">
        <button type="button" disabled={saving} onClick={save}
          className="rounded-lg bg-[#0D4D5E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {saving ? ui('Speichern…', 'Salvataggio…') : ui('Verfügbarkeit speichern', 'Salva disponibilità')}
        </button>
        </div>
      </div>
    </div>
  </div>;
}
