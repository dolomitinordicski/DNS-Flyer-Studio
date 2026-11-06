import React, { useState } from 'react';
import { DEFAULT_POLICY, type DNSFlyerDesignPolicy, type DesignProperty, saveDesignPolicy } from '../data/dnsFlyerDesignPolicy';
import { FLYER_TEMPLATES } from '../data/templates';

const fields: { id: DesignProperty; title: string; options: { value: string; title: string }[] }[] = [
  { id: 'corners', title: 'Bordi', options: [{value:'square',title:'Squadrati'}, {value:'soft',title:'Leggeri'}, {value:'round',title:'Arrotondati'}] },
  { id: 'pills', title: 'Pills / etichette', options: [{value:'square',title:'Squadrate'}, {value:'soft',title:'Morbide'}, {value:'pill',title:'Pills'}] },
  { id: 'heroFade', title: 'Sfumatura fotografia (un lato)', options: [{value:'none',title:'Nessuna'}, {value:'top',title:'Alto'}, {value:'right',title:'Destra'}, {value:'bottom',title:'Basso'}, {value:'left',title:'Sinistra'}] },
];
export function DNSDesignControl({ policy, onClose, uiLanguage }: { policy: DNSFlyerDesignPolicy; onClose: () => void; uiLanguage: 'de' | 'it' }) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [draft, setDraft] = useState<DNSFlyerDesignPolicy>(() => structuredClone(policy ?? DEFAULT_POLICY));
  const [target, setTarget] = useState('global');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const values = target === 'global' ? draft.global : draft.perFlyer[target] || {};
  const change = (key: DesignProperty, value: string) => {
    setDraft(previous => {
      const next = structuredClone(previous);
      if (target === 'global') (next.global as unknown as Record<string,string>)[key] = value;
      else {
        next.perFlyer[target] ||= {};
        if (value === 'inherit') delete (next.perFlyer[target] as Record<string,string>)[key];
        else (next.perFlyer[target] as Record<string,string>)[key] = value;
      }
      return next;
    });
  };
  const save = async () => {
    setSaving(true);
    setMessage('');
    try { await saveDesignPolicy(draft); setMessage(ui('DNS-Konfiguration gespeichert.', 'Configurazione DNS salvata.')); }
    catch (error) { setMessage(ui('Speichern fehlgeschlagen: ', 'Salvataggio non riuscito: ') + (error instanceof Error ? error.message : String(error))); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 no-print" role="dialog" aria-modal="true" aria-label="DNS Design Control">
    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-[#0D4D5E]">DNS · Design Control</h2></div>
        <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5">{ui('Schließen', 'Chiudi')}</button>
      </div>
      <label className="block text-sm font-semibold">{ui('Anwendungsbereich', 'Livello di applicazione')}
        <select className="mt-1 w-full rounded-lg border p-3" value={target} onChange={event=>setTarget(event.target.value)}>
          <option value="global">{ui("Global · alle Flyer", "Globale · tutti i flyer")}</option>
          {FLYER_TEMPLATES.map(template=><option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
      </label>
      {fields.map(field => <label key={field.id} className="block text-sm font-semibold">{({corners:ui('Ecken', 'Bordi'),pills:ui('Etiketten', 'Etichette'),heroFade:ui('Bildverlauf', 'Sfumatura immagine')} as Record<string,string>)[field.id]}
        <select className="mt-1 w-full rounded-lg border p-3" value={(values as unknown as Record<string,string>)[field.id] ?? 'inherit'} onChange={event=>change(field.id,event.target.value)}>
          {target !== 'global' && <option value="inherit">{ui("Globale Einstellung übernehmen", "Eredita impostazione globale")}</option>}
          {field.options.map(option => <option key={option.value} value={option.value}>{({square:ui('Eckig', 'Squadrato'),soft:ui('Weich', 'Morbido'),round:ui('Abgerundet', 'Arrotondato'),pill:ui('Pille', 'Pillola'),none:ui('Keine', 'Nessuna'),top:ui('Oben', 'Alto'),right:ui('Rechts', 'Destra'),bottom:ui('Unten', 'Basso'),left:ui('Links', 'Sinistra')} as Record<string,string>)[option.value] ?? option.title}</option>)}
        </select>
      </label>)}
      {message && <p role="status" className="text-sm">{message}</p>}
      <div className="flex justify-end"><button type="button" disabled={saving} onClick={save} className="rounded-lg bg-[#0D4D5E] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? ui('Speichern…', 'Salvataggio…') : ui('DNS-Einstellungen speichern', 'Salva impostazioni DNS')}</button></div>
    </div>
  </div>;
}
