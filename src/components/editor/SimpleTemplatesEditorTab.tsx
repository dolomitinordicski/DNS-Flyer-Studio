import React from 'react';
import { Check, Cloud, LayoutTemplate, Loader2 } from 'lucide-react';
import type { FlyerContent, LayoutTemplateId } from '../../types';
import { FLYER_TEMPLATES } from '../../data/templates';
import { FLYER_PRODUCTS } from '../../model/flyerProductModel';
import type { SavedDesign } from '../../lib/firebase';

interface SimpleTemplatesEditorTabProps {
  uiLanguage: 'de' | 'it';
  firebaseSavedModels: SavedDesign[];
  isSaving: boolean;
  saveToast: string | null;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onSave: () => void;
  onOpenSavedDesignsModal: () => void;
  onLoadSaved: (content: FlyerContent) => void;
}

export function SimpleTemplatesEditorTab({
  uiLanguage,
  firebaseSavedModels,
  isSaving,
  saveToast,
  onApplyTemplate,
  onSave,
  onOpenSavedDesignsModal,
  onLoadSaved,
}: SimpleTemplatesEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const templates = FLYER_PRODUCTS.map(product => ({
    product,
    template: FLYER_TEMPLATES.find(item => item.id === product.templateId),
  })).filter(item => item.template);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-[#0D4D5E]" />
          {ui('Verfügbare Flyer', 'Flyer disponibili')}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui(
            'Wähle einen freigegebenen DNS-Flyertyp. Layout, Stil und Blockstruktur sind bereits festgelegt.',
            'Scegli un tipo di flyer approvato DNS. Layout, stile e blocchi sono già impostati.'
          )}
        </p>
      </div>

      {saveToast && (
        <div className="p-3 bg-[#0D4D5E] text-white rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#AAD0D1]" />
          {saveToast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {templates.map(({ product, template }) => (
          <button
            key={product.type}
            type="button"
            onClick={() => onApplyTemplate(product.templateId)}
            className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#0D4D5E] text-left transition-all shadow-2xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#0D4D5E]">
                  {product.label[uiLanguage]}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 font-vietnam">
                  {template!.name.replace(/^\d+\.\s*/, '')}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {template!.description}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                style={{ backgroundColor: template!.previewColor }}
              />
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-2.5 bg-[#0D4D5E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4 text-[#AAD0D1]" />}
        {ui('Entwurf speichern', 'Salva bozza')}
      </button>

      {firebaseSavedModels.length > 0 && (
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#0D4D5E] uppercase tracking-wider">
              {ui('Meine Flyer', 'I miei flyer')}
            </h4>
            <button onClick={onOpenSavedDesignsModal} className="text-[10px] text-[#0D4D5E] font-bold hover:underline">
              {ui('Alle anzeigen', 'Mostra tutti')}
            </button>
          </div>
          <div className="space-y-2">
            {firebaseSavedModels.slice(0, 5).map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => onLoadSaved(item.content)}
                className="w-full p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-left"
              >
                <div className="font-bold text-xs text-slate-900 truncate">{item.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
