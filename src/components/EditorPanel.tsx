import React, { useEffect, useState } from 'react';
import type { FlyerContent, LayoutTemplateId } from '../types';
import { PrintProofControl } from './print-proof/PrintProofControl';
import { EditorChrome, type EditorTabId } from './editor/EditorChrome';
import { SimpleTemplatesEditorTab } from './editor/SimpleTemplatesEditorTab';
import { SimpleContentEditorTab } from './editor/SimpleContentEditorTab';
import { SimpleImageEditorTab } from './editor/SimpleImageEditorTab';
import { SimpleStyleEditorTab } from './editor/SimpleStyleEditorTab';
import { SimplePageEditorTab } from './editor/SimplePageEditorTab';
import { QRCodeEditorTab } from './editor/QRCodeEditorTab';
import { getFlyerProductByTemplate } from '../model/flyerProductModel';
import { inspectProductBlocks } from '../model/productBlockDiagnostics';
import type { DNSFlyerAvailabilityPolicy } from '../data/dnsFlyerAvailabilityPolicy';

interface EditorPanelProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  autosaveStatus: 'local' | 'pending' | 'saving' | 'saved' | 'error';
  autosaveErrorCode?: string | null;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onMakeItPerfect?: () => void;
  onChangeFormat?: (format: FlyerContent['format']) => void;
  onToggleOrientation?: () => void;
  isDNSAdmin?: boolean;
  canWriteFlyer?: boolean;
  canEditDNSGlobal?: boolean;
  availabilityPolicy: DNSFlyerAvailabilityPolicy;
  canBypassAvailability?: boolean;
  readOnly?: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  uiLanguage,
  content,
  onChangeContent,
  autosaveStatus,
  autosaveErrorCode,
  onApplyTemplate,
  isDNSAdmin = false,
  canWriteFlyer = false,
  canEditDNSGlobal = false,
  availabilityPolicy,
  canBypassAvailability = false,
  onMakeItPerfect,
  onChangeFormat,
  onToggleOrientation,
  readOnly = false,
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [activeTab, setActiveTab] = useState<EditorTabId>('templates');
  const product = getFlyerProductByTemplate(content.layoutTemplateId);
  const disableImageTab = Boolean(product?.dataPolicy.ticketType);
  useEffect(() => {
    if (disableImageTab && activeTab === 'images') setActiveTab('content');
  }, [disableImageTab, activeTab]);
  const blockDiagnostics = product ? inspectProductBlocks(content, product) : [];
  const blockErrors = blockDiagnostics.flatMap(entry => entry.issues.filter(issue => issue.level === 'error').map(issue => `${entry.sectionId}: ${issue.message}`));


  return (
    <aside className="w-full h-full min-h-0 bg-white border-r border-slate-200 text-slate-800 flex flex-col overflow-hidden no-print">
      <EditorChrome
        uiLanguage={uiLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        readOnly={readOnly}
        disableImageTab={disableImageTab}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {readOnly && <p role="status" className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-950">{ui('DNS-Gesamtflyer: Nur Ansicht. Für Änderungen wählt bitte die regionale Preisliste.', 'Flyer generale DNS: sola lettura. Per le modifiche scegli il listino della tua area.')}</p>}
        {!readOnly && <div role="status" aria-live="polite" className="text-[11px] text-slate-600">
          {autosaveStatus === 'local' ? ui('Lokal gespeichert · DNS Core Anmeldung erforderlich', 'Salvato sul dispositivo · accedi a DNS Core')
            : autosaveStatus === 'pending' ? ui('Änderungen werden automatisch gespeichert…', 'Modifiche in attesa di sincronizzazione…')
            : autosaveStatus === 'saving' ? ui('In DNS Core speichern…', 'Salvataggio in DNS Core…')
            : autosaveStatus === 'saved' ? ui('In DNS Core gespeichert ✓', 'Salvato automaticamente in DNS Core ✓')
            : ui('Cloud-Speicherung fehlgeschlagen · Erneut versuchen', 'Errore salvataggio cloud · riprova')}
        </div>}
        {!readOnly && autosaveStatus === 'error' && autosaveErrorCode && (
          <div role="alert" className="text-[11px] p-2 bg-red-50 text-red-800 rounded border border-red-200">
            {ui('DNS Core Firestore: Entwurf nicht gespeichert', 'DNS Core Firestore: bozza non salvata')}: <code>{autosaveErrorCode}</code>
          </div>
        )}
        {!readOnly && blockErrors.length > 0 && (
          <div role="status" className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <strong>{ui('Blockdaten prüfen', 'Verifica dati blocchi')}</strong>
            <ul className="list-disc pl-4 mt-1">{blockErrors.map((message, index) => <li key={index}>{message}</li>)}</ul>
          </div>
        )}
        {!readOnly && <PrintProofControl content={content} language={uiLanguage} />}
        {(readOnly || activeTab === 'templates') && (
          <SimpleTemplatesEditorTab
            uiLanguage={uiLanguage}
            activeTemplateId={content.layoutTemplateId}
            onApplyTemplate={onApplyTemplate}
            isDNSAdmin={isDNSAdmin}
            canWriteFlyer={canWriteFlyer}
            canEditDNSGlobal={canEditDNSGlobal}
            availabilityPolicy={availabilityPolicy}
            canBypassAvailability={canBypassAvailability}
          />
        )}

        {!readOnly && activeTab === 'content' && (
          <SimpleContentEditorTab
            uiLanguage={uiLanguage}
            content={content}
            product={product}
            isDNSAdmin={isDNSAdmin}
            onChangeContent={onChangeContent}
          />
        )}

        {!readOnly && !disableImageTab && activeTab === 'images' && (
          <SimpleImageEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
          />
        )}

        {!readOnly && activeTab === 'style' && (
          <SimpleStyleEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
          />
        )}

        {!readOnly && activeTab === 'layout' && (
          <SimplePageEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
            product={product}
            onMakeItPerfect={onMakeItPerfect}
            onChangeFormat={onChangeFormat}
            onToggleOrientation={onToggleOrientation}
          />
        )}

        {!readOnly && activeTab === 'qr' && (
          <QRCodeEditorTab uiLanguage={uiLanguage} content={content} onChangeContent={onChangeContent} />
        )}
      </div>
    </aside>
  );
};
