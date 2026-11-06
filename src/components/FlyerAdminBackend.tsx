import React, { useEffect, useState } from 'react';
import { Settings2, X } from 'lucide-react';
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
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="DNS Flyer Studio Backend"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-2 sm:p-5 no-print">
      <section className="flex h-[min(780px,calc(100dvh-1rem))] w-full max-w-3xl min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 bg-[#0D4D5E] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <Settings2 aria-hidden="true" className="h-5 w-5 shrink-0 text-[#AAD0D1]" />
            <div>
              <h2 className="text-base font-bold font-vietnam">DNS Flyer Studio · Backend</h2>
              <p className="text-xs text-white/70">{ui('Verwaltung der Flyer-Einstellungen', 'Gestione delle impostazioni flyer')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={ui('Backend schließen', 'Chiudi backend')}
            title={ui('Backend schließen', 'Chiudi backend')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>
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
      </section>
    </div>
  );
}
