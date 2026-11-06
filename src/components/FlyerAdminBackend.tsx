import React, { useState } from 'react';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { DNSFlyerAvailabilityControl } from './DNSFlyerAvailabilityControl';
import { DNSDesignControl } from './DNSDesignControl';
import type { DNSFlyerAvailabilityPolicy } from '../data/dnsFlyerAvailabilityPolicy';
import type { DNSFlyerDesignPolicy } from '../data/dnsFlyerDesignPolicy';

interface Props {
  availabilityPolicy: DNSFlyerAvailabilityPolicy;
  designPolicy: DNSFlyerDesignPolicy;
  uiLanguage: 'de' | 'it';
  onClose: () => void;
}

export function FlyerAdminBackend({ availabilityPolicy, designPolicy, uiLanguage, onClose }: Props) {
  const [tab, setTab] = useState<'availability' | 'design'>('availability');
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <section aria-label="DNS Flyer Studio Backend" className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F4F9FA] no-print">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#0D4D5E]/15 bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Settings2 aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0D4D5E]" />
          <div>
            <h2 className="text-base font-bold font-vietnam text-[#0D4D5E]">DNS Flyer Studio · Backend</h2>
            <p className="text-xs text-slate-600">{ui('Flyer-Einstellungen verwalten', 'Gestione impostazioni flyer')}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-[#0D4D5E]/30 bg-white px-3 py-2 text-xs font-semibold text-[#0D4D5E] hover:bg-[#E9F3F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0D4D5E]">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {ui('Zurück zum Editor', "Torna all'editor")}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-5">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav role="tablist" aria-label={ui('Backend-Bereiche', 'Sezioni backend')}
          className="flex shrink-0 gap-1 border-b border-slate-200 bg-slate-50 px-3 pt-2">
          {([
            { id: 'availability' as const, de: 'Flyer-Verfügbarkeit', it: 'Disponibilità flyer' },
            { id: 'design' as const, de: 'Design Control', it: 'Design Control' },
          ]).map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-t-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0D4D5E] ${tab === item.id ? 'bg-white text-[#0D4D5E] shadow-[0_-1px_0_#AAD0D1]' : 'text-slate-600 hover:bg-white/80'}`}>
              {ui(item.de, item.it)}
            </button>
          ))}
        </nav>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div role="tabpanel" aria-label={ui('Flyer-Verfügbarkeit', 'Disponibilità flyer')}
            className={tab === 'availability' ? 'h-full' : 'hidden'}>
            <DNSFlyerAvailabilityControl embedded policy={availabilityPolicy} onClose={onClose} uiLanguage={uiLanguage} />
          </div>
          <div role="tabpanel" aria-label="DNS Design Control"
            className={tab === 'design' ? 'h-full' : 'hidden'}>
            <DNSDesignControl embedded policy={designPolicy} onClose={onClose} uiLanguage={uiLanguage} />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
