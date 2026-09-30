import React from 'react';
import { BlockProps } from './BlockTypes';
import { getLegalNoticeItems } from '../../utils/disclaimerUtils';

export const DisclaimerBlock: React.FC<BlockProps> = ({
  content,
  plt,
  visibility,
  format
}) => {
  if (visibility && visibility.disclaimer === false) return null;
  if (!plt) return null;

  const legalItems = getLegalNoticeItems(plt, content);
  if (legalItems.length === 0) return null;

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';

  return (
    <div className={`p-2 sm:p-2.5 bg-slate-50/90 rounded-2xl border border-slate-200 ${isA5 ? 'text-[7px]' : isA3 ? 'text-xs' : 'text-[8px] sm:text-[9px]'} text-slate-600 leading-tight font-medium shadow-inner shrink-0 w-full space-y-1`}>
      {legalItems.map((item) => (
        <div key={item.lang} className="flex items-start gap-1 min-w-0">
          <span className="font-extrabold text-[7px] sm:text-[7.5px] uppercase tracking-wider text-slate-800 shrink-0 bg-slate-200/80 px-1 py-0.2 rounded font-vietnam">
            {item.lang}:
          </span>
          <p className="break-words flex-1 min-w-0">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

