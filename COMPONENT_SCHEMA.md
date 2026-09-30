# Mappatura e Architettura Modulare Componenti Volantini (Component Schema)

Questo documento definisce l'architettura dei componenti per i volantini **Dolomiti NordicSki**, assegnando a ciascun blocco di contenuto un **identificatore breve in inglese (Component ID)**, definendo i campi dati necessari per la redazione e definendo la strategia per comporre e riordinare i blocchi.

---

## 1. Catalogo dei Componenti (Component Mapping)

| Component ID | Nome Italiano | Descrizione e Utilizzo |
| :--- | :--- | :--- |
| **`BRAND_HEADER`** | Testata Brand & Loghi | Logo principale Dolomiti NordicSki, Logo Regionale dell'Area Partner, Badge e Tagline. |
| **`HERO_MEDIA`** | Immagine Principale (Hero) | Foto di copertina (Top, Split, Background o Middle), galleria immagini secondarie e striscia icone sport. |
| **`PROMO_HERO`** | Blocco Titolo & Prezzo Offerta | Badge promozionale, Titolo dell'offerta, Sottotitolo, Periodo di validità, Luogo e Prezzo in evidenza. |
| **`PRICE_TABLE`** | Listino Prezzi Ufficiale | Griglia/Tabella dettagliata prezzi (Giornaliero, Settimanale, Stagionale Area, Stagionale DNS) con sconti e fasce d'età. |
| **`PRICE_CAROUSEL`** | Prevendita & Carte Stagionali | Box di prevendita Early Bird, tessera stagionale, settimanale e sconti speciali. |
| **`SERVICE_GRID`** | Servizi Inclusi / Features | Lista con spunte dei servizi inclusi nel pacchetto/offerta (es. Hotel, Skipass, Guida, Sauna). |
| **`INFO_SERVICES_BOX`** | Info Servizi, Scuole & Bambini | Box informativo dedicato a regole per bambini (es. fino a 8 anni gratis), scuole di sci e noleggi. |
| **`CUSTOM_BANNER`** *(ex Eco-Mobility)* | Banner Informativo Multi-Uso | Banner tematico flessibile usabile per: Mobilità Sostenibile / Bus inclusi, Apertura Impianti & Piste, Avvisi Meteo/Neve, Sponsor o Eventi Speciali. |
| **`EVENT_SCHEDULE`** *(Nuovo)* | Programma Eventi & Orari | Tabella/Lista orari aperture casse, gare, manifestazioni ed eventi locali. |
| **`MAP_LOCATION_BLOCK`** *(Nuovo)* | Mappa & Indicazioni Piste | Box con punto di partenza, indicazioni stradali, coordinate GPS o mappa schematica dell'area sciistica. |
| **`CUSTOM_TEXT_BLOCK`** *(Nuovo)* | Testo Libero / Descrizione | Paragrafo di testo libero per raccontare il territorio, consigli sull'attrezzatura o dettagli specifici dell'offerta. |
| **`PARTNER_SPONSOR_GRID`** *(Nuovo)* | Griglia Sponsor & Partner | Griglia con loghi di noleggi convenzionati, rifugi, hotel partner o sponsor locali. |
| **`SOCIAL_COMMUNITY_BAR`** *(Nuovo)* | Social & Hashtag Community | Fascia d'ingaggio social con hashtag ufficiali (`#DolomitiNordicSki`), handle Instagram/Facebook e invito a condividere foto. |
| **`CONTACT_CARD_BOX`** *(Nuovo)* | Box Contatti & Infopoint | Scheda contatti con numeri di telefono casse, orari di apertura degli uffici e mail di supporto. |
| **`CALL_TO_ACTION`** | Call to Action & QR Code | Invito all'azione (CTA), indirizzo web, dettagli contatti e QR Code scansionabile per prenotazione o acquisto ticket. |
| **`DISCLAIMER_LEGAL`** | Note Legali & Disclaimer | Testi e clausole legali multilingua (DE / IT / EN) relative a prezzi, validità e condizioni d'uso. |
| **`BRAND_FOOTER`** | Piè di Pagina (Footer) | Fascia di chiusura con contatti dell'emittente, indirizzo, copyright 2026, sito web e loghi dei 12 consorzi partner. |

---

## 2. Come vengono gestiti i Campi da Redigere (Form Fields Strategy)

Quando si utilizzano o si combinano componenti diversi, **i campi da compilare nell'editor devono adattarsi dinamicamente** senza creare confusione o mostrare opzioni irrilevanti.

### A. Modello Dati Unificato (`FlyerContent`)
Tutti i dati risiedono in un unico oggetto dati strutturato. Ogni componente attinge a campi specifici:
- **`BRAND_HEADER`** → `title`, `subtitle`, `selectedRegionId`, `regionLogo`
- **`PRICE_TABLE`** → `priceTableCategories` (Categorie, Prezzi, Note Sconti)
- **`PRICE_CAROUSEL`** → `presaleCards` (Tipo pass, Prezzo normale, Prezzo scontato)
- **`CUSTOM_BANNER`** → `bannerType` ('eco' | 'event' | 'snow' | 'custom'), `bannerTitle`, `bannerText`, `bannerIcon`
- **`SERVICE_GRID`** → `includedServices` (Lista stringhe con spunta)
- **`EVENT_SCHEDULE`** → `scheduleItems` (Ora/Data, Titolo Evento, Luogo)

### B. Campi Dinamici nell'Editor (Contextual Form Panels)
Nell'Editor Panel, la scheda dei contenuti si organizza in **Fisarmoniche / Moduli Contestuali**:
1. **Campi Base Always-On** (Titolo, Date, QR Code, Foto, Footer) sempre visibili.
2. **Pannelli Modulo Dinamici**:
   - Se il volantino scelto o personalizzato include il componente `PRICE_TABLE`, nell'editor appare automaticamente il pannello *"Compilazione Listino Prezzi"*.
   - Se l'utente aggiunge il componente `CUSTOM_BANNER`, appare il pannello *"Configurazione Banner Informativo"* (scelta tipo banner, testo personalizzato, colore di evidenza).
   - Se l'utente rimuove un componente, il relativo pannello di compilazione si nasconde, lasciando l'editor sempre pulito ed essenziale.

---

## 3. Assegnazione Componenti ai Modelli Esistenti (Preset Stacks)

| Modello Volantino | Stack Componenti Predefinito |
| :--- | :--- |
| **Classic** | `[ BRAND_HEADER, HERO_MEDIA, PROMO_HERO, SERVICE_GRID, CALL_TO_ACTION, CUSTOM_BANNER, DISCLAIMER_LEGAL, BRAND_FOOTER ]` |
| **OfficialPriceTable** | `[ BRAND_HEADER, PRICE_TABLE, INFO_SERVICES_BOX, CUSTOM_BANNER, CALL_TO_ACTION, DISCLAIMER_LEGAL, BRAND_FOOTER ]` |
| **OnlineTicket** | `[ BRAND_HEADER, HERO_MEDIA, PRICE_CAROUSEL, INFO_SERVICES_BOX, CALL_TO_ACTION, DISCLAIMER_LEGAL, BRAND_FOOTER ]` |
| **Voucher** | `[ BRAND_HEADER, HERO_MEDIA, PROMO_HERO, SERVICE_GRID, CALL_TO_ACTION, BRAND_FOOTER ]` |
| **ModernGlacier** | `[ BRAND_HEADER, HERO_MEDIA, PROMO_HERO, SERVICE_GRID, CALL_TO_ACTION, BRAND_FOOTER ]` |
| **NordicModern** | `[ BRAND_HEADER, HERO_MEDIA, PROMO_HERO, SERVICE_GRID, CALL_TO_ACTION, BRAND_FOOTER ]` |

---

## 4. Gestione dei Modelli Custom / Personalizzati

In una fase successiva di sviluppo, l'utente potrà:
1. Scegliere **"Crea Modello Custom"** o **"Personalizza Struttura"** su un volantino esistente.
2. Attivare/Disattivare i blocchi con switch ON/OFF.
3. Riordinare la sequenza visiva dei blocchi (es. spostare il `CUSTOM_BANNER` in alto prima dei prezzi o sotto le immagini).
4. Redigere direttamente i soli dati necessari per i blocchi attivi.
