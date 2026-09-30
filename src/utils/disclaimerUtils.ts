export interface LegalNoticeItem {
  lang: string;
  label: string;
  flag: string;
  text: string;
}

export function getLegalNoticeItems(plt: any, content?: any): LegalNoticeItem[] {
  const items: LegalNoticeItem[] = [];

  if (plt?.disclaimerIt && typeof plt.disclaimerIt === 'string' && plt.disclaimerIt.trim()) {
    items.push({ lang: 'IT', label: 'Italiano', flag: '🇮🇹', text: plt.disclaimerIt.trim() });
  }
  if (plt?.disclaimerDe && typeof plt.disclaimerDe === 'string' && plt.disclaimerDe.trim()) {
    items.push({ lang: 'DE', label: 'Deutsch', flag: '🇩🇪', text: plt.disclaimerDe.trim() });
  }
  if (plt?.disclaimerEn && typeof plt.disclaimerEn === 'string' && plt.disclaimerEn.trim()) {
    items.push({ lang: 'EN', label: 'English', flag: '🇬🇧', text: plt.disclaimerEn.trim() });
  }

  if (items.length === 0 && content?.disclaimer && typeof content.disclaimer === 'string' && content.disclaimer.trim()) {
    items.push({ lang: 'INFO', label: 'Info', flag: '📜', text: content.disclaimer.trim() });
  }

  return items;
}
