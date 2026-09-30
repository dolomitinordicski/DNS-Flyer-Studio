import React from 'react';
import { BlockProps } from './BlockTypes';
import { QRCodeSVG } from 'qrcode.react';
import * as LucideIcons from 'lucide-react';

export const CallToActionBlock: React.FC<BlockProps> = ({
  content,
  theme,
  visibility,
  format,
  orientation
}) => {
  // If qrCode section is disabled OR if footer section is enabled (which already handles QR code & contacts inside BrandFooterBlock), return null
  if (visibility && (visibility.qrCode === false || visibility.footer !== false)) return null;
  if (!content.qrCode || content.qrCode.enabled === false) return null;

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = orientation === 'landscape' || content.orientation === 'landscape';

  const qrCodeSize = isA5 ? 55 : isA3 ? 95 : 70;

  return (
    <div className="flex justify-end w-full mt-auto pt-2">
      <div className="flex flex-col items-center bg-white p-2 rounded-2xl shadow-md border border-slate-200 shrink-0">
        <QRCodeSVG 
          value={content.qrCode.url || 'https://www.dolomitinordicski.com'} 
          size={isLandscape ? (isA5 ? 50 : isA3 ? 85 : 60) : qrCodeSize} 
          fgColor={content.qrCode.fgColor || theme.primaryHex}
          bgColor={content.qrCode.bgColor || '#FFFFFF'}
          level="H"
        />
        {content.qrCode.label && (
          <span 
            className="text-[7.5px] sm:text-[8.5px] font-black uppercase font-vietnam mt-1 text-center max-w-[90px] leading-tight tracking-tighter truncate"
            style={{ color: theme.primaryHex }}
          >
            {content.qrCode.label}
          </span>
        )}
      </div>
    </div>
  );
};
