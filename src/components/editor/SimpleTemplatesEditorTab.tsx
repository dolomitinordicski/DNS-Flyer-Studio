import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import type { LayoutTemplateId } from '../../types';
import { FLYER_TEMPLATES } from '../../data/templates';
import { FLYER_PRODUCTS } from '../../model/flyerProductModel';
import { isFlyerProductEnabled, type DNSFlyerAvailabilityPolicy } from '../../data/dnsFlyerAvailabilityPolicy';

interface SimpleTemplatesEditorTabProps {
  uiLanguage: 'de' | 'it';
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  isDNSAdmin: boolean;
  availabilityPolicy: DNSFlyerAvailabilityPolicy;
  canBypassAvailability: boolean;
}

export function SimpleTemplatesEditorTab({
  uiLanguage,
  onApplyTemplate,
  isDNSAdmin,
  availabilityPolicy,
  canBypassAvailability,
}: SimpleTemplatesEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const templates = FLYER_PRODUCTS
    .filter(product => product.type === 'dns_price_list' || canBypassAvailability || isFlyerProductEnabled(availabilityPolicy, product.type))
    .map(product => ({
      product,
      template: FLYER_TEMPLATES.find(item => item.id === product.templateId),
    }))
    .filter(item => item.template);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-[#0D4D5E]" />
          {ui('Verfügbare Flyer', 'Flyer disponibili')}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {templates.map(({ product, template }) => {
          const restricted = product.dataPolicy.access === 'dns-only' && !isDNSAdmin;
          const isPriceList = product.type === 'dns_price_list' || product.type === 'regional_price_list';
          return (
            <button
              key={product.type}
              type="button"
              onClick={() => { if (!restricted) onApplyTemplate(product.templateId); }}
              disabled={restricted}
              aria-label={`${product.label[uiLanguage]}${restricted ? ui(' — DNS-Zugriff erforderlich', ' — Richiede accesso DNS') : ''}`}
              className={`p-3 rounded-xl border text-left transition-all shadow-2xs ${isPriceList ? 'bg-[#EDF5F5] border-[#AAD0D1]' : 'bg-slate-50 border-slate-200'} ${restricted ? 'cursor-not-allowed opacity-65' : 'hover:bg-white hover:border-[#0D4D5E]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#0D4D5E]">
                    {product.label[uiLanguage]}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1 font-vietnam">
                    {template!.name.replace(/^\d+\.\s*/, '')}
                  </div>
                  {product.type === 'dns_price_list' && !isDNSAdmin && (
                    <p className="text-[10px] font-bold text-blue-800 mt-1">
                      {ui('Nur Ansicht · zentral von DNS verwaltet', 'Sola lettura · gestito centralmente da DNS')}
                    </p>
                  )}
                  {product.type === 'regional_price_list' && !isDNSAdmin && (
                    <p className="text-[10px] font-bold text-emerald-800 mt-1">
                      {ui('Euer Gebietsflyer · bearbeitbar', 'Flyer della vostra area · modificabile')}
                    </p>
                  )}
                  {restricted && <p className="text-[10px] font-bold text-amber-800 mt-1">
                    {ui('Nur mit DNS-Zentralberechtigung verfügbar', 'Disponibile con autorizzazione DNS centrale')}
                  </p>}
                </div>
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                  style={{ backgroundColor: template!.previewColor }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
