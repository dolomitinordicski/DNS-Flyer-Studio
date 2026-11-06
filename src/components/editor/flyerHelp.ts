import type { FlyerProductType } from '../../model/flyerProductModel';

// UI-only help: the descriptions never become flyer document content.
export const FLYER_HELP: Record<FlyerProductType, { de: string; it: string }> = {
  dns_price_list: {
    de: 'Offizielle DNS-Preisliste. Anpassbar: Titel, Bild, Kontakte und Layout. DNS-Tarife aus Data Entry.',
    it: 'Listino ufficiale DNS. Personalizzabili: titolo, immagine, contatti e layout. Tariffe DNS da Data Entry.',
  },
  regional_price_list: {
    de: 'Preisliste eures Gebiets. Anpassbar: Bild, Texte, lokale Leistungen und Kontakte. Tarife aus Data Entry.',
    it: 'Listino della vostra area. Personalizzabili: immagine, testi, servizi locali e contatti. Tariffe da Data Entry.',
  },
  ticket_weekly_dns: {
    de: 'DNS-Wochenkarte. Anpassbar: Aussteller, Zusatzlogo, Kontakte, QR-Code und Zusatzinhalte.',
    it: 'Settimanale DNS. Personalizzabili: emittente, logo aggiuntivo, contatti, codice QR e contenuti aggiuntivi.',
  },
  ticket_weekly_area: {
    de: 'Wochenkarte eures Gebiets. Anpassbar: Aussteller, Zusatzlogo, Kontakte, QR-Code und Zusatzinhalte.',
    it: 'Settimanale della vostra area. Personalizzabili: emittente, logo aggiuntivo, contatti, codice QR e contenuti aggiuntivi.',
  },
  ticket_daily_area: {
    de: 'Tageskarte eures Gebiets. Anpassbar: Aussteller, Zusatzlogo, Kontakte, QR-Code und Zusatzinhalte.',
    it: 'Giornaliero della vostra area. Personalizzabili: emittente, logo aggiuntivo, contatti, codice QR e contenuti aggiuntivi.',
  },
  hotel_package: {
    de: 'Flyer für touristische Angebote. Anpassbar: Texte, Preise, Leistungen, Bild und Kontakte.',
    it: 'Flyer per offerte turistiche. Personalizzabili: testi, prezzi, servizi, immagine e contatti.',
  },
  gutschein: {
    de: 'Geschenkgutschein. Anpassbar: Inhaber, Gültigkeit, Dokumentcode, Bild und QR-Code.',
    it: 'Buono regalo. Personalizzabili: intestatario, validità, codice documento, immagine e codice QR.',
  },
  voucher: {
    de: 'Voucher für Leistungen oder Aufenthalte. Anpassbar: Gast, Leistungen, Gültigkeit, Bild und Kontakte.',
    it: 'Voucher per servizi o soggiorni. Personalizzabili: ospite, prestazioni, validità, immagine e contatti.',
  },
  promotion: {
    de: 'Werbeflyer für Aktionen. Anpassbar: Texte, Bild, Preise, Leistungen und QR-Code.',
    it: 'Flyer promozionale. Personalizzabili: testi, immagine, prezzi, servizi e codice QR.',
  },
};
