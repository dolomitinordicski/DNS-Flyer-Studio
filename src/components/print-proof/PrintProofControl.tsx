import React, { useState } from 'react';
import type { FlyerContent } from '../../types';
import { FlyerCanvas } from '../FlyerCanvas';
import { supportsPrintProof, createPrintProofContent } from './printProofModel';

/** Standalone, product-gated print-proof feature; never persists demo data. */
export function PrintProofControl({ content, language }: { content: FlyerContent; language: 'de' | 'it' }) {
  const [open, setOpen] = useState(false);
  if (!supportsPrintProof(content.layoutTemplateId)) return null;
  const de = language === 'de';
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-xl border-2 border-[#0D4D5E] bg-[#EDF5F5] p-3 text-left text-xs font-extrabold text-[#0D4D5E] hover:bg-[#DCEEEE]">
        {de ? 'Druckvorschau · Muster-Ticket' : 'Anteprima di stampa · Ticket di prova'}
        <span className="mt-1 block font-normal">{de ? 'Vollständiges Beispiel mit Testdaten und Test-QR' : 'Esempio completo con dati e QR dimostrativi'}</span>
      </button>
      {open && <div className="fixed inset-0 z-[100] flex flex-col items-center overflow-auto bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-label={de ? 'Muster-Ticket' : 'Ticket di prova'}>
        <div className="mb-4 flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3">
          <div className="text-sm font-bold">{de ? 'MUSTER · NICHT GÜLTIG' : 'FACSIMILE · NON VALIDO'}</div>
          <button type="button" className="rounded-lg bg-[#0D4D5E] px-4 py-2 text-sm font-bold text-white" onClick={() => setOpen(false)}>{de ? 'Schließen' : 'Chiudi'}</button>
        </div>
        <div className="origin-top scale-[0.58] sm:scale-[0.75]"><FlyerCanvas content={createPrintProofContent(content)} scale={1} /></div>
      </div>}
    </>
  );
}
