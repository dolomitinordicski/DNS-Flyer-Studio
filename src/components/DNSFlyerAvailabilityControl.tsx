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

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 no-print" role="dialog" aria-modal="true" aria-label="DNS Flyer Availability">
    <div className="w-full max-w-xl rounded-2xl bg-white p-7 shadow-2xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4D5E]">{ui('DNS · Flyer-Verfügbarkeit', 'DNS · Flyer disponibili')}</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5">{ui('Schließen', 'Chiudi')}</button>
      </div>

      <div className="space-y-2">
        {FLYER_PRODUCTS.map(product => (
          <label key={product.type} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
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

      {message && <p role="status" className="text-sm">{message}</p>}
      <div className="flex justify-end">
        <button type="button" disabled={saving} onClick={save}
          className="rounded-lg bg-[#0D4D5E] px-5 py-3 font-bold text-white disabled:opacity-50">
          {saving ? ui('Speichern…', 'Salvataggio…') : ui('Verfügbarkeit speichern', 'Salva disponibilità')}
        </button>
      </div>
    </div>
  </div>;
}
