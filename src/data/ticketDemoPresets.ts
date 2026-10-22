/** Non-operational editorial presets. Never use as TicWeb issuance/validation data. */
export const DIGITAL_PASS_PRESETS = {
  weekly_dns: {
    languageMode: 'monolingual' as const,
    digitalPassType: 'weekly_dns' as const,
    headerTagline: 'DIGITAL PASS',
    badgeText: 'PASS CAROSELLO DOLOMITI NORDICSKI 900+ KM',
    title: 'SETTIMANALE DOLOMITI NORDICSKI',
    subtitle: 'Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki',
    validityPeriod: '2026/27',
    location: '8 AREE CAROSELLO (900+ KM PISTE)',
    pricePrefix: 'TARIFFA',
    priceAmount: '62',
    priceCurrency: '€',
    priceSuffix: '/ 7G CAROSELLO',
    priceNote: 'Valido in tutte le 8 Valli partner • Pass con tecnologia di verifica QR',
    featuresTitle: 'Specifiche Settimanale Carosello 8 Valli:',
    promoBannerEnabled: false,
    promoBannerTitle: 'OFFERTA PROMOZIONALE ONLINE',
    promoBannerText: 'Presenta il tuo Digital Pass nei centri e negozi convenzionati per vantaggi esclusivi.',
    promoBannerBadge: 'PROMO ONLINE',
    ecoBannerEnabled: false,
    ecoBannerTitle: 'GREEN MOBILITY & ECO PASS',
    ecoBannerText: 'Questo Digital Pass è 100% paperless e include la mobilità Ski Bus gratuita della valle.',
    ecoBannerTagline: '100% ECO-FRIENDLY',
    translations: {
      it: {
        title: 'SETTIMANALE DOLOMITI NORDICSKI',
        badgeText: 'PASS CAROSELLO DOLOMITI NORDICSKI 900+ KM',
        subtitle: 'Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki'
      },
      de: {
        title: 'WOCHENKARTE DOLOMITI NORDICSKI',
        badgeText: 'DOLOMITI NORDICSKI KARUSSELL-PASS 900+ KM',
        subtitle: 'Gültig für 7 aufeinanderfolgende Tage in allen 8 Gebieten des Karussells'
      },
      en: {
        title: 'DNS WEEKLY PASS',
        badgeText: 'DOLOMITI NORDICSKI CAROUSEL PASS 900+ KM',
        subtitle: 'Valid for 7 consecutive days in all 8 Carousel areas'
      }
    },
    features: [
      { id: 'tk_dns1', icon: 'skipass', text: 'Accesso illimitato per 7 giorni consecutivi in tutte le 8 aree della rete', highlight: true },
      { id: 'tk_dns2', icon: 'skipass', text: 'Oltre 900 km di piste da fondo perfettamente tracciate e garanzia neve', highlight: true },
      { id: 'tk_dns3', icon: 'ski_bus', text: 'Uso dello Ski Bus locale compreso nelle tratte convenzionate delle 8 valli', highlight: false },
      { id: 'tk_dns4', icon: 'skipass', text: 'Codice seriale e QR Code per lettura automatica ai varchi e ai tornelli', highlight: false }
    ],
    addressInfo: 'Consorzio Dolomiti NordicSki - Ticket ID #TK-2026-DNS8K-09923',
    qrCode: {
      enabled: true,
      url: 'https://example.invalid/dns-ticket-sample',
      label: 'FACSIMILE · NON VALIDO',
      fgColor: '#0D4D5E',
      bgColor: '#FFFFFF',
      centerLogo: 'dns' as const,
      position: 'bottom_right' as const
    }
  },
  daily_area: {
    languageMode: 'monolingual' as const,
    digitalPassType: 'daily_area' as const,
    headerTagline: 'DIGITAL PASS',
    badgeText: 'BIGLIETTO GIORNALIERO UFFICIALE',
    title: 'BIGLIETTO GIORNALIERO',
    subtitle: 'Valido 1 Giorno solare sulle piste da fondo dell\'area selezionata',
    validityPeriod: '2026/27',
    location: '04 3 CIME DOLOMITI',
    pricePrefix: 'TARIFFA',
    priceAmount: '14',
    priceCurrency: '€',
    priceSuffix: '/ GIORNALIERO',
    priceNote: 'Titolo di viaggio personale non cedibile • Scansionare ai varchi di accesso',
    featuresTitle: 'Specifiche Biglietto Giornaliero:',
    promoBannerEnabled: false,
    promoBannerTitle: 'OFFERTA PROMOZIONALE ONLINE',
    promoBannerText: 'Presenta il tuo Digital Pass nei centri e negozi convenzionati per vantaggi esclusivi.',
    promoBannerBadge: 'PROMO ONLINE',
    ecoBannerEnabled: false,
    ecoBannerTitle: 'GREEN MOBILITY & ECO PASS',
    ecoBannerText: 'Questo Digital Pass è 100% paperless e include la mobilità Ski Bus gratuita della valle.',
    ecoBannerTagline: '100% ECO-FRIENDLY',
    translations: {
      it: {
        title: 'BIGLIETTO GIORNALIERO',
        badgeText: 'BIGLIETTO GIORNALIERO UFFICIALE',
        subtitle: 'Valido 1 Giorno solare sulle piste da fondo dell\'area selezionata'
      },
      de: {
        title: 'AREA TAGESKARTE',
        badgeText: 'OFFIZIELLES TAGES-TICKET',
        subtitle: 'Gültig für 1 Kalendertag auf den Langlaufloipen des gewählten Gebiets'
      },
      en: {
        title: 'AREA DAY PASS',
        badgeText: 'OFFICIAL DAY AREA PASS',
        subtitle: 'Valid for 1 day on cross-country trails in the selected area'
      }
    },
    features: [
      { id: 'tk_d1', icon: 'skipass', text: 'Valido per 1 giornata solare nella data indicata sul ticket', highlight: true },
      { id: 'tk_d2', icon: 'skipass', text: 'Accesso diretto ai varchi di controllo tramite Barcode e QR Code', highlight: false },
      { id: 'tk_d3', icon: 'skipass', text: 'Titolo strettamente personale, non cedibile e non rimborsabile', highlight: false },
      { id: 'tk_d4', icon: 'ski_bus', text: 'Utilizzo gratuito degli Ski Bus locali della Valle Pusteria compreso', highlight: true }
    ],
    addressInfo: 'Consorzio Dolomiti NordicSki - Ticket ID #TK-2026-DAILY-04892',
    qrCode: {
      enabled: true,
      url: 'https://example.invalid/dns-ticket-sample',
      label: 'FACSIMILE · NON VALIDO',
      fgColor: '#0D4D5E',
      bgColor: '#FFFFFF',
      centerLogo: 'dns' as const,
      position: 'bottom_right' as const
    }
  },
  weekly_area: {
    languageMode: 'monolingual' as const,
    digitalPassType: 'weekly_area' as const,
    headerTagline: 'DIGITAL PASS',
    badgeText: 'BIGLIETTO SETTIMANALE AREA 7 GIORNI',
    title: 'SETTIMANALE DI AREA',
    subtitle: 'Valido 7 Giorni consecutivi nella singola area di fondo selezionata',
    validityPeriod: '2026/27',
    location: '02 ANTHOLZERTAL / VALLE ANTERSELVA',
    pricePrefix: 'TARIFFA',
    priceAmount: '52',
    priceCurrency: '€',
    priceSuffix: '/ 7 GIORNI AREA',
    priceNote: 'Pass personale 7 giorni per la singola area • Presentare ai varchi di controllo',
    featuresTitle: 'Specifiche Settimanale Singola Area:',
    promoBannerEnabled: false,
    promoBannerTitle: 'OFFERTA PROMOZIONALE ONLINE',
    promoBannerText: 'Presenta il tuo Digital Pass nei centri e negozi convenzionati per vantaggi esclusivi.',
    promoBannerBadge: 'PROMO ONLINE',
    ecoBannerEnabled: false,
    ecoBannerTitle: 'GREEN MOBILITY & ECO PASS',
    ecoBannerText: 'Questo Digital Pass è 100% paperless e include la mobilità Ski Bus gratuita della valle.',
    ecoBannerTagline: '100% ECO-FRIENDLY',
    translations: {
      it: {
        title: 'SETTIMANALE DI AREA',
        badgeText: 'BIGLIETTO SETTIMANALE AREA 7 GIORNI',
        subtitle: 'Valido 7 Giorni consecutivi nella singola area di fondo selezionata'
      },
      de: {
        title: 'AREA WOCHENKARTE',
        badgeText: 'OFFIZIELLE AREA WOCHENKARTE 7 TAGE',
        subtitle: 'Gültig für 7 aufeinanderfolgende Tage im gewählten Langlaufgebiet'
      },
      en: {
        title: 'AREA WEEKLY PASS',
        badgeText: 'OFFICIAL WEEK AREA PASS',
        subtitle: 'Valid for 7 consecutive days in the selected cross-country area'
      }
    },
    features: [
      { id: 'tk_w1', icon: 'skipass', text: 'Valido per 7 giorni consecutivi dall\'attivazione nella sola area di emissione', highlight: true },
      { id: 'tk_w2', icon: 'skipass', text: 'Accesso illimitato a tutte le piste preparate dell\'area indicata', highlight: false },
      { id: 'tk_w3', icon: 'skipass', text: 'Codice di controllo unico e seriale stampato per la verifica ai varchi', highlight: true },
      { id: 'tk_w4', icon: 'ski_bus', text: 'Servizio navetta e ski bus convenzionato della valle compreso', highlight: false }
    ],
    addressInfo: 'Consorzio Dolomiti NordicSki - Ticket ID #TK-2026-WKAREA-02194',
    qrCode: {
      enabled: true,
      url: 'https://example.invalid/dns-ticket-sample',
      label: 'FACSIMILE · NON VALIDO',
      fgColor: '#0D4D5E',
      bgColor: '#FFFFFF',
      centerLogo: 'dns' as const,
      position: 'bottom_right' as const
    }
  }
};

