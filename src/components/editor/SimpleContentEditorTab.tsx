import React from 'react';
import type { FlyerContent, LanguageCode } from '../../types';
import { getContentForLanguage } from '../../utils/multilingual';
import type { FlyerProductDefinition } from '../../model/flyerProductModel';
import { REGIONAL_LOGOS, REGIONAL_AREA_ALIASES } from '../../data/regionalLogos';

interface SimpleContentEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  product?: FlyerProductDefinition;
  isDNSAdmin?: boolean;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function SimpleContentEditorTab({
  uiLanguage,
  content,
  product,
  isDNSAdmin = false,
  onChangeContent,
}: SimpleContentEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const can = (field: string) => !product || product.editableFields.includes(field);
  const field = (
    key: keyof FlyerContent,
    labelDe: string,
    labelIt: string,
    multiline = false,
  ) => {
    if (!can(String(key))) return null;
    const value = String(content[key] ?? '');
    const cls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D4D5E]";
    return (
      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{ui(labelDe, labelIt)}</span>
        {multiline ? (
          <textarea
            value={value}
            rows={3}
            onChange={e => onChangeContent({ [key]: e.target.value } as Partial<FlyerContent>)}
            className={cls}
          />
        ) : (
          <input
            value={value}
            onChange={e => onChangeContent({ [key]: e.target.value } as Partial<FlyerContent>)}
            className={cls}
          />
        )}
      </label>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('Inhalte', 'Contenuti')}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui(
            'Nur die für diesen Flyertyp freigegebenen Inhalte können geändert werden.',
            'Puoi modificare solo i contenuti abilitati per questo tipo di flyer.'
          )}
        </p>
      </div>

      {product?.dataPolicy.languageMode === 'monolingual' && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {ui('Dokumentsprache', 'Lingua documento')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['de', 'it', 'en'] as LanguageCode[]).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => onChangeContent(getContentForLanguage(content, lang))}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  (content.activeLanguage || 'de') === lang
                    ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">
            {ui('Das Ticket wird jeweils in einer einzigen Sprache ausgegeben.', 'Il ticket viene prodotto in una sola lingua alla volta.')}
          </p>
        </div>
      )}

      {product?.type === 'regional_price_list' && isDNSAdmin && (
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-600">{ui('Berichtsgebiet', 'Area partner')}</span>
          <select
            value={Object.entries(REGIONAL_AREA_ALIASES).find(([, alias]) => alias === content.regionId)?.[0] || content.regionId}
            onChange={event => onChangeContent({ regionId: event.target.value, customRegionName: '' })}
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
          >
            {REGIONAL_LOGOS.filter(area => area.id !== 'dns_central').map(area => {
              const coreId = Object.entries(REGIONAL_AREA_ALIASES).find(([, alias]) => alias === area.id)?.[0] || area.id;
              return <option key={coreId} value={coreId}>{area.regionName}</option>;
            })}
          </select>
          <span className="text-[10px] text-slate-500">{ui('Gebietspreise werden automatisch von DNS Data Entry geladen.', 'I prezzi dell’area vengono caricati automaticamente da DNS Data Entry.')}</span>
        </label>
      )}
      {product?.type === 'dns_price_list' && (
        <section className="p-3 rounded-xl border border-[#AAD0D1] bg-[#EDF5F5] space-y-3">
          <h4 className="text-xs font-bold text-[#0D4D5E]">
            {ui('Gebietstarife ab — frei editierbar', 'Tariffe regionali «a partire da» — testo libero')}
          </h4>
          {([
            ['regionalDayPrice', 'Tageskarte ab', 'Giornaliero da'],
            ['regionalWeekPrice', 'Wochenkarte ab', 'Settimanale da'],
            ['regionalSeasonPrice', 'Saisonkarte ab', 'Stagionale da'],
          ] as const).map(([key, de, it]) => (
            <label key={key} className="block space-y-1">
              <span className="text-[10px] font-bold text-slate-600">{ui(de, it)}</span>
              <input
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                value={content.priceListTexts?.[key] ?? ''}
                onChange={event => onChangeContent({
                  priceListTexts: { ...content.priceListTexts, [key]: event.target.value },
                })}
              />
            </label>
          ))}
          <p className="text-[10px] text-slate-600">
            {ui('DNS-Netzpreise werden automatisch aus Data Entry übernommen.', 'I prezzi DNS sono importati automaticamente da Data Entry.')}
          </p>
        </section>
      )}
      {product?.type === 'regional_price_list' && (
        <p className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-200">
          {ui('Gebietstarife und DNS-Netzpreise werden aus Data Entry geladen; hier nicht bearbeitbar.', 'Le tariffe della regione e quelle DNS provengono da Data Entry e non sono modificabili qui.')}
        </p>
      )}
      {field('title', 'Titel', 'Titolo')}
      {field('subtitle', 'Untertitel', 'Sottotitolo', true)}
      {field('validityPeriod', 'Gültigkeit', 'Validità')}
      {field('priceAmount', 'Preis', 'Prezzo')}
      {field('priceSuffix', 'Preis-Zusatz', 'Dettaglio prezzo')}
      {field('priceNote', 'Preishinweis', 'Nota prezzo', true)}
      {field('contactEmail', 'E-Mail', 'Email')}
      {field('contactPhone', 'Telefon', 'Telefono')}
      {field('websiteUrl', 'Website', 'Sito web')}
    </div>
  );
}
