# Ticketvorlagen — DNS Flyer Studio 2026/27

Status: implementation specification (not yet a rendered or TicWeb-certified template).

## Canonical names
- DNS Wochenkarte (network-wide)
- Area Wochenkarte (area-specific weekly pass)
- Area Tageskarte (area-specific day pass)

Do not label an area ticket “Gebiets-Wochenkarte” or “Region Wochenkarte”. “Area” is the product term. Keep machine identifiers stable and independent of translations: `dns_weekly`, `area_weekly`, `area_daily`.

## Design contract
- Reproduce the existing TicWeb ticket template's visual hierarchy, especially the central data/validation section, before changing layout.
- DNS design tokens and official assets only. Area identity uses an area logo/name from DNS Shared Data; no arbitrary color or layout editing.
- Three separate one-language-at-a-time DE, IT, EN views/exports using a single layout contract.
- Prevent overflow for longer Italian or English labels; preserve QR/barcode scannability and printer-safe margins.
- Do not hardcode official tariffs, validity periods, field coordinates, barcode type or ticket dimensions until checked against the legacy source and TicWeb requirements.

## Proposed data contract
```ts
type TicketTemplateId = 'dns_weekly' | 'area_weekly' | 'area_daily';
type TicketLocale = 'de' | 'it' | 'en';
type TicketTemplateInput = {
  templateId: TicketTemplateId;
  locale: TicketLocale;
  season: string;
  areaId?: string;
  branding: { dnsLogoAssetId: string; areaLogoAssetId?: string };
  runtime: {
    ticketId: string;
    validityStart?: string;
    validityEnd?: string;
    tariffLabel?: string;
    priceFormatted?: string;
    barcodePayload?: string;
    qrPayload?: string;
  };
};
```

Fields are provisional pending a legacy TicWeb sample. Runtime issuance/data validation remain in TicWeb; Flyer Studio is only responsible for artwork/template export.

## Editor behavior
1. Choose one of the three canonical templates.
2. For an area ticket, select an area from DNS Shared Data.
3. Choose language DE / IT / EN.
4. Preview with clearly flagged sample data.
5. Export PNG or PDF; enable shared “Code” export only on supported document types, using the separate export feature.

## Acceptance checklist
- [ ] Legacy visual comparison at actual ticket dimensions, especially central region
- [ ] DNS and area branding placement verified
- [ ] Correct three names and localization in DE/IT/EN
- [ ] All dynamically provided fields safely bound (no fake real ticket)
- [ ] PNG/PDF export checked for type size, margins, and codes
- [ ] TicWeb integration contract and eventual Code export tested with LTS
- [ ] No duplication of the shared Code export module

## Scope boundary
This specification establishes product naming and layout/data boundaries. It does **not** claim implemented UI, complete legacy fidelity, or functioning TicWeb/Code integration.
