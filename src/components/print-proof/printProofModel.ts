import type { FlyerContent } from '../../types';

export const PRINT_PROOF_TEMPLATES = new Set([
  'ticket_online_weekly_dns', 'ticket_online_weekly_area', 'ticket_online_daily',
]);

export function supportsPrintProof(templateId?: string): boolean {
  return PRINT_PROOF_TEMPLATES.has(templateId || '');
}

export interface TicketProofData {
  number: string;
  validity: string;
  price: string;
  holder: string;
  issueDate: string;
  qrPayload: string;
}

/** Deterministic, conspicuously invalid sample; never a real TicWeb payload. */
export function createTicketProofData(content: FlyerContent): TicketProofData {
  const area = content.issuingAreaId || content.regionId;
  const number = `SAMPLE-${area.toUpperCase()}-000184`;
  const daily = content.digitalPassType === 'daily_area';
  return {
    number,
    validity: daily ? '15.12.2026' : '15.12.2026 – 21.12.2026',
    price: content.digitalPassType === 'weekly_dns' ? '65,00 €' : 'DEMO €',
    holder: content.activeLanguage === 'de' ? 'Max Mustermann' : content.activeLanguage === 'en' ? 'John Smith' : 'Mario Rossi',
    issueDate: '15.12.2026',
    qrPayload: `DEMO:NOT_VALID:${number}`,
  };
}

export function createPrintProofContent(content: FlyerContent): FlyerContent {
  return { ...content, ticketProofMode: true };
}
