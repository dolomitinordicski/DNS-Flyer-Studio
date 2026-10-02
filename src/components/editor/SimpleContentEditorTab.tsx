import React from 'react';
import type { FlyerContent } from '../../types';
import type { FlyerProductDefinition } from '../../model/flyerProductModel';

interface SimpleContentEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  product?: FlyerProductDefinition;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function SimpleContentEditorTab({
  uiLanguage,
  content,
  product,
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
