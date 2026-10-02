import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Facebook, Twitter, Linkedin, Download } from 'lucide-react';
import { FlyerContent } from '../types';

interface SocialShareModalProps {
  uiLanguage: 'de' | 'it';
  isOpen: boolean;
  onClose: () => void;
  content: FlyerContent;
  onDownloadPng: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  uiLanguage,
  isOpen,
  onClose,
  content,
  onDownloadPng
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawUrl = content.websiteUrl || 'www.dolomitinordicski.com';
  const normalizedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;

  // Generate promotional caption text for social media post
  const promoText = `❄️ ${content.title} | Dolomiti NordicSki ❄️
${content.subtitle}

📍 Località: ${content.location}
📅 Validità: ${content.validityPeriod}
💰 Offerta: ${content.pricePrefix} ${content.priceAmount}${content.priceCurrency} ${content.priceSuffix}

✨ Cosa include:
${content.features.map(f => `• ${f.text}`).join('\n')}

🔗 Scopri i dettagli e prenota ora:
${normalizedUrl}

#DolomitiNordicSki #CrossCountrySkiing #SciDiFondo #Dolomiti #SouthTyrol #Trentino #Veneto #WinterHoliday`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(promoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp share URL
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`;

  // Facebook share URL
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(normalizedUrl)}`;

  // Twitter share URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${content.title} - ${content.subtitle}`)}&url=${encodeURIComponent(normalizedUrl)}`;

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: `${content.title} - ${content.subtitle}`,
          url: normalizedUrl,
        });
      } catch (err) {
        console.log('Share canceled or not supported');
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0D4D5E] text-white shadow-xs">
              <Share2 className="w-5 h-5 text-[#AAD0D1]" />
            </div>
            <div>
              <h3 className="font-vietnam font-bold text-base text-slate-900">
                {ui('Direkt in sozialen Medien teilen', 'Condivisione Diretta Social')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {ui('Flyer über die offiziellen Social-Media-Kanäle teilen', 'Pubblica il pacchetto offerta sui canali social ufficiali')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Quick Direct Social Share Buttons */}
          <div>
            <label className="block text-slate-700 font-bold mb-2">{ui('Direkt per Link teilen', 'Condividi Subito via Link')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all font-bold"
              >
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-all font-bold"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all font-bold"
              >
                <Twitter className="w-5 h-5 text-cyan-600" />
                <span>Twitter / X</span>
              </a>

              {/* Native Mobile Share */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#003865] hover:bg-blue-900 text-white border border-[#003865] transition-all font-bold shadow-xs"
              >
                <Share2 className="w-5 h-5 text-cyan-300" />
                <span>{ui('Teilen', 'Condividi App')}</span>
              </button>

            </div>
          </div>

          {/* Image Export Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onDownloadPng();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#E30613] hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{ui('Flyer-PNG für Posts & Stories herunterladen', 'Scarica Immagine Flyer PNG per Post & Storie')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
