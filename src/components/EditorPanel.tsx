import React, { useEffect, useState } from 'react';
import type { FlyerContent, LayoutTemplateId } from '../types';
import {
  loadDesignsFromFirebase,
  saveDesignToFirebase,
  type SavedDesign,
} from '../lib/firebase';
import { EditorChrome, type EditorTabId } from './editor/EditorChrome';
import { SimpleTemplatesEditorTab } from './editor/SimpleTemplatesEditorTab';
import { SimpleContentEditorTab } from './editor/SimpleContentEditorTab';
import { SimpleImageEditorTab } from './editor/SimpleImageEditorTab';
import { SimpleStyleEditorTab } from './editor/SimpleStyleEditorTab';
import { QRCodeEditorTab } from './editor/QRCodeEditorTab';
import { getFlyerProductByTemplate, lockContentToProduct } from '../model/flyerProductModel';
import { inspectProductBlocks } from '../model/productBlockDiagnostics';

interface EditorPanelProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onOpenSavedDesignsModal: () => void;
  onMakeItPerfect?: () => void;
  onChangeFormat?: (format: FlyerContent['format']) => void;
  onToggleOrientation?: () => void;
  isDNSAdmin?: boolean;
  onOpenLegacy?: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  uiLanguage,
  content,
  onChangeContent,
  onApplyTemplate,
  onOpenSavedDesignsModal,
  isDNSAdmin = false,
  onMakeItPerfect,
  onChangeFormat,
  onToggleOrientation,
  onOpenLegacy,
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [activeTab, setActiveTab] = useState<EditorTabId>('templates');
  const [savedModels, setSavedModels] = useState<SavedDesign[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const product = getFlyerProductByTemplate(content.layoutTemplateId);
  const blockDiagnostics = product ? inspectProductBlocks(content, product) : [];
  const blockErrors = blockDiagnostics.flatMap(entry => entry.issues.filter(issue => issue.level === 'error').map(issue => `${entry.sectionId}: ${issue.message}`));

  const refreshSaved = async () => {
    try {
      setSavedModels(await loadDesignsFromFirebase());
    } catch (error) {
      console.error('Failed to load Flyer documents:', error);
      setSavedModels([]);
    }
  };

  useEffect(() => {
    void refreshSaved();
  }, []);

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDesignToFirebase(
        null,
        content.title || ui('DNS Flyer', 'Flyer DNS'),
        content,
        content.graphicStyle,
        content.heroImageUrl,
      );
      await refreshSaved();
      setSaveToast(ui('Entwurf in DNS Core gespeichert.', 'Bozza salvata in DNS Core.'));
      setTimeout(() => setSaveToast(null), 3000);
    } catch (error: any) {
      const message = error?.message === 'DNS_CORE_AUTH_REQUIRED'
        ? ui('Bitte zuerst bei DNS Core anmelden.', 'Accedi prima a DNS Core.')
        : (error?.message || ui('Speichern fehlgeschlagen.', 'Salvataggio non riuscito.'));
      setSaveToast(message);
      setTimeout(() => setSaveToast(null), 4500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-hidden no-print">
      <EditorChrome
        uiLanguage={uiLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSavedDesignsModal={onOpenSavedDesignsModal}
        onOpenLegacy={onOpenLegacy}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {blockErrors.length > 0 && (
          <div role="status" className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <strong>{ui('Blockdaten prüfen', 'Verifica dati blocchi')}</strong>
            <ul className="list-disc pl-4 mt-1">{blockErrors.map((message, index) => <li key={index}>{message}</li>)}</ul>
          </div>
        )}
        {activeTab === 'templates' && (
          <SimpleTemplatesEditorTab
            uiLanguage={uiLanguage}
            firebaseSavedModels={savedModels}
            isSaving={isSaving}
            saveToast={saveToast}
            onApplyTemplate={onApplyTemplate}
            onSave={saveDraft}
            onOpenSavedDesignsModal={onOpenSavedDesignsModal}
            isDNSAdmin={isDNSAdmin}
            onLoadSaved={saved => {
              const savedProduct = getFlyerProductByTemplate(saved.layoutTemplateId);
              onChangeContent(savedProduct ? lockContentToProduct(saved, savedProduct) : saved);
            }}
          />
        )}

        {activeTab === 'content' && (
          <SimpleContentEditorTab
            uiLanguage={uiLanguage}
            content={content}
            product={product}
            onChangeContent={onChangeContent}
          />
        )}

        {activeTab === 'images' && (
          <SimpleImageEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
          />
        )}

        {activeTab === 'style' && (
          <SimpleStyleEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
            product={product}
            onMakeItPerfect={onMakeItPerfect}
            onChangeFormat={onChangeFormat}
            onToggleOrientation={onToggleOrientation}
          />
        )}

        {activeTab === 'qr' && (
          <QRCodeEditorTab content={content} onChangeContent={onChangeContent} />
        )}
      </div>
    </aside>
  );
};
