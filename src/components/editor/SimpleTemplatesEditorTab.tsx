import React, { useState } from 'react';
import { ChevronDown, LayoutTemplate } from 'lucide-react';
import { FLYER_HELP } from './flyerHelp';
import type { LayoutTemplateId } from '../../types';
import { FLYER_TEMPLATES } from '../../data/templates';
import { FLYER_PRODUCTS } from '../../model/flyerProductModel';
import { isFlyerProductEnabled, type DNSFlyerAvailabilityPolicy } from '../../data/dnsFlyerAvailabilityPolicy';

interface SimpleTemplatesEditorTabProps {
  uiLanguage: 'de' | 'it';
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  isDNSAdmin: boolean;
  canWriteFlyer: boolean;
  canEditDNSGlobal: boolean;
  availabilityPolicy: DNSFlyerAvailabilityPolicy;
  canBypassAvailability: boolean;
}

export function SimpleTemplatesEditorTab({
  uiLanguage,
  onApplyTemplate,
  isDNSAdmin,
  canWriteFlyer,
  canEditDNSGlobal,
  availabilityPolicy,
  canBypassAvailability,
}: SimpleTemplatesEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [expanded, setExpanded] = useState<string | null>(null);
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
          const canEdit = canWriteFlyer && !restricted && (product.type !== 'dns_price_list' || isDNSAdmin);
          const isExpanded = expanded === product.type;
          return (
            <div key={product.type} className={`rounded-xl border p-3 shadow-2xs ${isPriceList ? 'bg-[#EDF5F5] border-[#AAD0D1]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onApplyTemplate(product.templateId)}
                  disabled={restricted}
                  aria-label={product.label[uiLanguage]}
                  className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0D4D5E]">
                    {product.label[uiLanguage]}
                  </span>
                </button>
                <span
                  role="img"
                  aria-label={canEdit ? ui('Bearbeitbar', 'Modificabile') : ui('Nicht bearbeitbar', 'Non modificabile')}
                  title={canEdit ? ui('Bearbeitbar', 'Modificabile') : ui('Nicht bearbeitbar', 'Non modificabile')}
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${canEdit ? 'bg-emerald-600' : 'bg-red-600'}`}
                />
              </div>
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`flyer-help-${product.type}`}
                onClick={() => setExpanded(previous => previous === product.type ? null : product.type)}
                className="mt-1 flex items-center gap-1 rounded text-[11px] font-medium text-slate-600 hover:text-[#0D4D5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0D4D5E]"
              >
                {ui('Details', 'Dettagli')}
                <ChevronDown aria-hidden="true" className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && (
                <p id={`flyer-help-${product.type}`} className="mt-2 border-t border-slate-200 pt-2 text-[11px] leading-relaxed text-slate-600">
                  {FLYER_HELP[product.type][uiLanguage]}
                </p>
              )}
            </div>
        })}
      </div>
    </div>
  );
}
