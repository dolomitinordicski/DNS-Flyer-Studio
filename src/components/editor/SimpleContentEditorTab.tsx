import { REPORTING_AREAS } from '@dolomitinordicski/dns-shared-data';
import React from 'react';
import { PACKAGE_OFFER_PRESETS, applyPackageOfferPreset } from '../../model/packageOfferPresets';
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
  const uploadTicketImage = (target: 'ticketLocalLogoUrl' | 'imageUrl' | 'qrImageUrl') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || file.size > 2_000_000) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        if (target === 'ticketLocalLogoUrl') onChangeContent({ ticketLocalLogoUrl: reader.result });
        else onChangeContent({ ticketContent: { ...content.ticketContent!, [target]: reader.result } });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
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
      {(product?.type === 'voucher' || product?.type === 'gutschein') && (
        <section className="space-y-2 rounded-xl border border-slate-200 p-3">
          <label htmlFor="voucher-reporting-area" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {ui('DNS Gebiet / Aussteller', 'Area DNS / emittente')}
          </label>
          <select id="voucher-reporting-area"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900"
            value={Object.entries(REGIONAL_AREA_ALIASES).find(([, legacy]) => legacy === content.regionId)?.[0] || content.regionId}
            onChange={event => onChangeContent({ regionId: event.target.value, customRegionName: '', selectedRegionLogoId: 'primary' })}
            disabled={!isDNSAdmin}
          >
            {REPORTING_AREAS.filter(area => area.active).map(area => (
              <option key={area.id} value={area.id}>{area.localizedName[uiLanguage] || area.canonicalName}</option>
            ))}
          </select>
          {!isDNSAdmin && <p className="text-[10px] text-slate-500">{ui('Gebiet wird von DNS Core vorgegeben.', 'Area assegnata da DNS Core.')}</p>}
        </section>
      )}
      {(product?.type === 'gutschein' || product?.type === 'voucher') && (
        <section className="space-y-3 border-t border-slate-200 pt-4">
          {product.type === 'gutschein' ? <>
            <label className="block space-y-1"><span className="text-[10px] font-bold">{ui('Saisonkarte Geltungsbereich', 'Ambito skipass stagionale')}</span>
              <select className="w-full rounded-lg border p-2 text-xs" value={content.documentScope || 'dns'}
                onChange={e => onChangeContent({ documentScope: e.target.value as 'dns' | 'area' })}>
                <option value="dns">Dolomiti NordicSki</option><option value="area">{ui('Area-Saisonkarte', 'Skipass stagionale Area')}</option>
              </select>
            </label>
            {field('holderName', 'Name', 'Nominativo')}
            {field('issueDate', 'Ausstellungsdatum', 'Data emissione')}
          </> : <>
            {field('partnerName', 'Partnerbetrieb', 'Struttura partner')}
            {field('guestName', 'Gast', 'Ospite')}
            {field('stayPeriod', 'Aufenthaltszeitraum', 'Periodo soggiorno')}
            <label className="block space-y-1"><span className="text-[10px] font-bold">{ui('Leistungen (eine je Zeile)', 'Prestazioni incluse (una per riga)')}</span>
              <textarea rows={6} className="w-full rounded-lg border p-2 text-xs"
                value={(content.voucherServices || []).join('\n')}
                onChange={e => onChangeContent({ voucherServices: e.target.value.split('\n') })} />
            </label>
          </>}
          {field('documentCode', 'Dokumentcode (optional)', 'Codice documento (facoltativo)')}
        </section>
      )}
      {product?.dataPolicy.ticketType && (
        <section className="space-y-3 rounded-xl border border-[#AAD0D1] bg-slate-50 p-3">
          <h4 className="text-xs font-bold text-[#0D4D5E]">{ui('Ticket · Ausstellendes Gebiet', 'Ticket · Area emittente')}</h4>
          {isDNSAdmin && <label className="block space-y-1">
            <span className="text-[10px] font-bold">{ui('Area auswählen', 'Seleziona area')}</span>
            <select className="w-full rounded-lg border p-2 text-xs" value={content.issuingAreaId || (content.regionId !== 'dns_central' ? content.regionId : '3_zinnen')}
              onChange={e => onChangeContent({ issuingAreaId: e.target.value, issuerName: '', customRegionName: '' })}>
              {REGIONAL_LOGOS.filter(area => area.id !== 'dns_central').map(area => <option key={area.id} value={area.id}>{area.regionName}</option>)}
            </select>
          </label>}
          <p className="text-[10px] text-slate-500">{ui('Alle drei Tickettypen verwenden das Logo der ausstellenden Area.', 'Tutti e tre i ticket utilizzano il logo dell’area emittente.')}</p>
          {(['issuerName', 'contactEmail', 'contactPhone', 'websiteUrl'] as const).map(key => (
            <label key={key} className="block space-y-1"><span className="text-[10px] font-bold">{key}</span>
              <input className="w-full rounded-lg border p-2 text-xs" value={content[key] || ''} onChange={e => onChangeContent({ [key]: e.target.value })} />
            </label>
          ))}
          <label className="block space-y-1"><span className="text-[10px] font-bold">{ui('Zusätzliches Tourismuslogo (URL)', 'Logo turistico aggiuntivo (URL)')}</span>
            <input className="w-full rounded-lg border p-2 text-xs" value={content.ticketLocalLogoUrl || ''} onChange={e => onChangeContent({ ticketLocalLogoUrl: e.target.value })} placeholder="https://…/logo.png" />
          </label>
          <button type="button" className="rounded-lg border bg-white px-3 py-2 text-xs font-bold" onClick={() => uploadTicketImage('ticketLocalLogoUrl')}>{ui('Logo hochladen (max. 2 MB)', 'Carica logo (max 2 MB)')}</button>
          <label className="block space-y-1"><span className="text-[10px] font-bold">{ui('Name Zusatzlogo', 'Nome logo aggiuntivo')}</span>
            <input className="w-full rounded-lg border p-2 text-xs" value={content.ticketLocalLogoName || ''} onChange={e => onChangeContent({ ticketLocalLogoName: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            <input type="checkbox" checked={content.ticketContent?.enabled || false} onChange={e => onChangeContent({ ticketContent: { ...content.ticketContent, enabled: e.target.checked, type: content.ticketContent?.type || 'info' } })} />
            {ui('Zusätzliche Ticketinhalte', 'Contenuti aggiuntivi ticket')}
          </label>
          {content.ticketContent?.enabled && <div className="space-y-2">
            <select className="w-full rounded-lg border p-2 text-xs" value={content.ticketContent.type}
              onChange={e => onChangeContent({ ticketContent: { ...content.ticketContent!, type: e.target.value as 'promo' | 'info' } })}>
              <option value="info">Info</option><option value="promo">Promo</option>
            </select>
            {(['title', 'subtitle', 'body', 'imageUrl', 'qrImageUrl', 'qrLabel'] as const).map(key => (
              <label key={key} className="block space-y-1"><span className="text-[10px] font-bold">{key}</span>
                {key === 'body' ? <textarea rows={3} maxLength={350} className="w-full rounded-lg border p-2 text-xs" value={content.ticketContent?.[key] || ''}
                    onChange={e => onChangeContent({ ticketContent: { ...content.ticketContent!, [key]: e.target.value } })} />
                  : <input className="w-full rounded-lg border p-2 text-xs" value={content.ticketContent?.[key] || ''}
                    onChange={e => onChangeContent({ ticketContent: { ...content.ticketContent!, [key]: e.target.value } })} />}
              </label>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border bg-white px-3 py-2 text-xs font-bold" onClick={() => uploadTicketImage('imageUrl')}>{ui('Bild hochladen', 'Carica immagine')}</button>
              <button type="button" className="rounded-lg border bg-white px-3 py-2 text-xs font-bold" onClick={() => uploadTicketImage('qrImageUrl')}>{ui('QR-Bild hochladen', 'Carica QR')}</button>
            </div>
          </div>}
        </section>
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
      {product?.type === 'regional_price_list' && (
        <section className="p-3 rounded-xl border border-[#AAD0D1] space-y-3">
          <h4 className="text-xs font-bold text-[#0D4D5E]">{ui('Eigene Gebietsinfos', 'Informazioni proprie dell’area')}</h4>
          <p className="text-[10px] text-slate-500">{ui('Nur ausgefüllte Angaben werden gezeigt. Das Querformat passt sich automatisch an.', 'Mostriamo solo i contenuti inseriti: il layout orizzontale si adatta automaticamente.')}</p>
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold">{ui('Kurztext (DE / IT / EN)', 'Breve testo (DE / IT / EN)')}</span>
            <textarea rows={3} maxLength={350} className="w-full border rounded-lg p-2 text-xs"
              value={content.regionalLocalText ?? ''}
              onChange={e => onChangeContent({ regionalLocalText: e.target.value })}
              placeholder={ui('Ein kurzer Text, vorzugsweise dreisprachig…', 'Un breve testo, preferibilmente trilingue…')}/>
          </label>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold">{ui('Dienste', 'Servizi')}</div>
            {([
              ['ski_school', ui('Skischule', 'Scuola sci')],
              ['rental', ui('Verleih', 'Noleggio')],
              ['ski_bus', 'Ski bus'],
              ['parking', ui('Parkplatz', 'Parcheggio')],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={(content.regionalLocalServices ?? []).includes(key)}
                  onChange={e => onChangeContent({ regionalLocalServices: e.target.checked
                    ? [...(content.regionalLocalServices ?? []), key]
                    : (content.regionalLocalServices ?? []).filter(item => item !== key) })}/>
                {label}
              </label>
            ))}
          </div>
        </section>
      )}
      {product?.type === 'hotel_package' && (
        <section className="rounded-xl border border-[#AAD0D1] bg-slate-50 p-3 space-y-2">
          <h4 className="text-xs font-bold text-[#0D4D5E]">{ui('Pakete & Angebote', 'Pacchetti e offerte')}</h4>
          <p className="text-[11px] text-slate-600">{ui('Manuelle Vorlagen; vorhandene Texte werden bei Auswahl ersetzt.', 'Preset manuali; la selezione sostituisce i testi esistenti.')}</p>
          <div className="grid grid-cols-3 gap-2">
            {PACKAGE_OFFER_PRESETS.map(preset => <button key={preset.id} type="button"
              className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-semibold text-[#0D4D5E] hover:border-[#0D4D5E]"
              onClick={() => onChangeContent(applyPackageOfferPreset(content, preset.id))}>{preset.label[uiLanguage]}</button>)}
          </div>
        </section>
      )}
      {field('title', 'Titel', 'Titolo')}
      {field('subtitle', 'Untertitel', 'Sottotitolo', true)}
      {field('validityPeriod', 'Gültigkeit', 'Validità')}
      {field('badgeText', 'Kennzeichnung', 'Etichetta')}
      {field('location', 'Ort', 'Località')}
      {field('pricePrefix', 'Preispräfix', 'Prefisso prezzo')}
      {field('priceAmount', 'Preis', 'Prezzo')}
      {field('priceCurrency', 'Währung', 'Valuta')}
      {field('priceSuffix', 'Preis-Zusatz', 'Dettaglio prezzo')}
      {field('priceNote', 'Preishinweis', 'Nota prezzo', true)}
      {field('featuresTitle', 'Leistungen', 'Servizi inclusi')}
      {product?.type === 'hotel_package' && (
        <section className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-slate-600">{ui('Inklusivleistungen (bis zu 5)', 'Servizi inclusi (fino a 5)')}</p>
          {(content.features || []).slice(0, 5).map((feature, index) => (
            <div key={feature.id || index} className="flex items-center gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2 text-xs"
                value={feature.text} onChange={event => onChangeContent({ features: (content.features || []).map((item, i) => i === index ? { ...item, text: event.target.value } : item) })} />
              <button type="button" className="px-2 text-xs text-slate-600" aria-label={ui('Entfernen', 'Rimuovi')}
                onClick={() => onChangeContent({ features: (content.features || []).filter((_, i) => i !== index) })}>×</button>
            </div>
          ))}
          {(content.features || []).length < 5 && <button type="button" className="text-xs font-semibold text-[#0D4D5E]"
            onClick={() => onChangeContent({ features: [...(content.features || []), { id: 'offer-' + Date.now(), icon: 'nordic_classic', text: '', highlight: false }] })}>
            + {ui('Leistung hinzufügen', 'Aggiungi servizio')}
          </button>}
        </section>
      )}
      {field('ctaText', 'Aktion', 'Invito all’azione')}
      {field('contactEmail', 'E-Mail', 'Email')}
      {field('contactPhone', 'Telefon', 'Telefono')}
      {field('websiteUrl', 'Website', 'Sito web')}
    </div>
  );
}
