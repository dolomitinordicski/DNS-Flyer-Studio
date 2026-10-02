# DNS Flyer Studio — F0 Architecture Audit & Freeze

**Status:** F0 baseline  
**Date:** 2026-10-02  
**Repository:** `dolomitinordicski/DNS-Flyer-Studio`  
**Baseline main commit:** `8a8009a2f344f41b6abd53f307e070b09b15f0f5`  
**Baseline deploy:** GitHub Pages run `37000649364` — success  
**Purpose:** document the current architecture before any structural refactor. F0 must not change flyer rendering, template visuals, document output, Firebase data, or production behavior.

---

## 1. Executive summary

DNS Flyer Studio is already a capable document-generation engine. The correct strategy is **preserve the renderer and progressively normalize the architecture around it**, not rewrite the application.

The current codebase combines three generations:

1. **Legacy hand-built variants** — large layout components such as `OfficialPriceTableVariant1`, `OnlineTicketVariant1`, `ClassicVariant1`.
2. **Block-based renderer** — `BLOCK_REGISTRY` + compact variants such as `ClassicVariant`, `OfficialPriceTableVariant`, `ModernGlacierVariant`.
3. **DNS Foundation shell** — shared header, accessibility runtime, shared regional logo architecture, DNS_Core status probe.

The largest risks are outside the renderer:
- `EditorPanel.tsx` is a 319 KB monolith.
- persistence is described in the UI as Firebase/Cloud but the application config is empty and therefore currently falls back to LocalStorage.
- Firestore rules are fully open if Firebase is enabled as-is.
- `FlyerContent` contains several generations of aliases and concerns.
- dashboard lifecycle and season logic are prototype-level and partly hardcoded.
- UI bilingualism is incomplete and defaults to Italian on a clean browser.

---

## 2. Baseline inventory

### Source footprint
- Source files under `src/`: **70**
- Total source payload: about **959 KB**
- Largest application modules:
  - `src/components/EditorPanel.tsx` — **319,286 bytes**
  - `src/components/FlyerDashboard.tsx` — **58,390 bytes**
  - `src/components/flyer-variants/OfficialPriceTableVariant1.tsx` — **40,113 bytes**
  - `src/data/templates.ts` — **27,939 bytes**
  - `src/utils/multilingual.ts` — **25,917 bytes**
  - `src/components/flyer-variants/OnlineTicketVariant1.tsx` — **25,440 bytes**
  - `src/components/flyer-variants/ClassicVariant1.tsx` — **21,422 bytes**
  - `src/App.tsx` — **20,945 bytes**

### Runtime stack
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Firebase 12
- jsPDF
- html2canvas-pro
- qrcode.react
- Recharts
- DNS shared package from `dns-shared-data`

### Active template presets found in `FLYER_TEMPLATES`
1. `official_price_list`
2. `regional_price_list`
3. `ticket_digital_pass`
4. `hotel_skipass_package`
5. `gift_voucher`
6. `hotel_manifesto`

The `LayoutTemplateId` union also contains legacy/planned IDs that are not currently represented as active `FLYER_TEMPLATES` entries. F0 classifies these as **schema residue / future compatibility**, not active templates.

---

## 3. Rendering engine — FROZEN during F0–F2

These files are the current visual engine and must not be functionally changed during architecture cleanup unless a separately approved rendering fix is required:

- `src/components/FlyerCanvas.tsx`
- `src/components/flyer-variants/*`
- `src/components/blocks/*`
- `src/utils/layoutOptimizer.ts`
- `src/utils/multilingual.ts`
- `src/components/CorporateVectors.tsx`
- `src/data/templates.ts` visual/default-content payloads

### Protected behaviors
- A3 / A4 / A5
- portrait / landscape
- active template appearance
- active graphic variant appearance
- section visibility
- section ordering
- regional logos
- sports icons
- QR rendering
- ornaments / curves / swoosh
- PDF and PNG visual dimensions
- DE / IT / EN document generation
- existing saved design compatibility

Any later refactor must demonstrate visual equivalence or an explicitly approved visual change.

---

## 4. Block architecture inventory

### Implemented block files
- `BrandHeaderBlock`
- `BigTitleBlock`
- `HeroMediaBlock`
- `EarlyBirdBlock`
- `PromoHeroBlock`
- `PriceTableBlock`
- `ServiceGridBlock`
- `CustomBannerBlock`
- `CallToActionBlock`
- `DisclaimerBlock`
- `BrandFooterBlock`
- `RegionalAreasGridBlock`

### Currently registered in `BLOCK_REGISTRY`
- header
- bigTitle
- heroImage
- earlyBird
- promotionBox
- priceTables
- servicesBox
- ecoBanner
- qrCode
- disclaimer
- footer

### Schema components documented but not yet implemented as first-class registered blocks
- PRICE_CAROUSEL
- INFO_SERVICES_BOX
- EVENT_SCHEDULE
- MAP_LOCATION_BLOCK
- CUSTOM_TEXT_BLOCK
- PARTNER_SPONSOR_GRID
- SOCIAL_COMMUNITY_BAR
- CONTACT_CARD_BOX

**F0 conclusion:** `COMPONENT_SCHEMA.md` is the intended target architecture, but the runtime currently implements only a subset.

---

## 5. Variant architecture inventory

### Compact / block-oriented variants
- `ClassicVariant.tsx`
- `ModernGlacierVariant.tsx`
- `NordicModernVariant.tsx`
- `OfficialPriceTableVariant.tsx`
- `OnlineTicketVariant.tsx`
- `VoucherVariant.tsx`

### Legacy / hand-built renderer variants
- `ClassicVariant1.tsx`
- `ModernGlacierVariant1.tsx`
- `NordicModernVariant1.tsx`
- `OfficialPriceTableVariant1.tsx`
- `OnlineTicketVariant1.tsx`
- `VoucherVariant-1.tsx`

### Hotel-specific renderer family
- `HotelSkipassVariant.tsx`
- `HotelSkipassPanoramaVariant.tsx`
- `HotelSkipassCompactVariant.tsx`
- `HotelSkipassFusionVariant.tsx`

**F0 rule:** no legacy variant is deleted before an explicit visual migration check. The existence of a compact equivalent is not sufficient evidence for deletion.

---

## 6. State and document model

The current application uses one broad `FlyerContent` object for:
- document copy
- translations
- template selection
- layout
- style
- region
- imagery
- sports icons
- QR
- footer
- decorative vectors
- section visibility
- section ordering
- digital pass metadata
- hotel/package metadata
- editor/runtime preferences

### Compatibility aliases currently present
Examples include:
- `sectionVisibility` + `visibility`
- `selectedSportsIcons` + runtime fallback to `activeSportsIcons`
- multiple graphic style IDs with `_v1` equivalents

**F0 conclusion:** these aliases must remain readable until a versioned migration layer exists. They must not be removed ad hoc.

### F2 target
Introduce a versioned `FlyerDocument v1` with explicit domains:
- meta
- locale
- brand
- page
- composition
- content
- assets
- publication

Old `FlyerContent` records must continue to load through a compatibility adapter.

---

## 7. Persistence audit

### Application Firebase
`firebase-applet-config.json` currently contains blank Firebase credentials.

Therefore `src/lib/firebase.ts` detects Firebase as unconfigured and uses browser LocalStorage fallbacks for:
- saved designs: `dns_flyer_saved_designs`
- flyer registry: `dns_flyer_registry_items`
- custom sports icons: `dns_custom_sports_icons`

### DNS_Core header probe
`src/lib/dnsCoreHeader.ts` connects to DNS_Core only to read:
- `reportingAreas`
- `organizations`

This is a connectivity/status probe. It is **not** Flyer Studio persistence.

### Firestore rules
The repository rules currently allow unrestricted read/write to:
- `designs`
- `flyer_registry`
- `custom_icons`

These rules are not suitable for production governance.

### F0 freeze rule
Do not activate Firebase by simply filling the config. Persistence must be addressed only after the DNS governance/data model decision in F6.

---

## 8. Saved designs vs publication lifecycle

Current Saved Designs behavior writes:
1. a saved design, and
2. a flyer registry record with status `issued`.

This conflates **saving** with **publishing**.

Target lifecycle for later work:
- DRAFT
- READY
- PUBLISHED
- ARCHIVED

Saving a design must never implicitly mean publication.

No change is made in F0.

---

## 9. Dashboard audit

The dashboard already contains useful concepts:
- grid / timeline / table / charts
- region filters
- category filters
- draft / scheduled / issued status
- duplicate
- delete
- preview
- metrics

Prototype limitations:
- LocalStorage fallback means it is not currently a shared registry.
- timeline months are hardcoded to 2025-10 through 2026-04.
- UI describes “9 regions”; DNS Central is a network scope, not a ninth reporting area.
- `viewsCount` and `downloadsCount` exist in the record model but are not backed by a verified analytics pipeline.
- most copy is Italian-only.

The dashboard must not be treated as authoritative operational data until F6/F7.

---

## 10. Branding and shared data audit

Positive:
- Foundation shared tool chrome is already integrated.
- accessibility runtime is shared.
- regional logos mostly resolve from `dns-shared-data/brand/regions`.
- DNS_Core header probe exists.

Remaining duplication:
- local copies under `public/assets`
- local copies under `src/assets`
- local `brand.ts`
- local `regionalLogos.ts`
- vector/brand knowledge in `CorporateVectors.tsx`

F0 rule: do not remove local assets yet. They may be required by legacy renderers. F6+ can replace them only after dependency tracing.

---

## 11. Language audit

Two separate language concepts must be preserved:

### UI language
DNS standard:
- DE primary/default
- IT secondary

Current clean-browser behavior defaults to IT. Large parts of Editor, Dashboard, Saved Designs, Export and Social UI are still Italian-only.

### Document language
Flyer content may be:
- DE
- IT
- EN
- trilingual

UI language and document language must remain independent.

F1 will address UI language only. It must not alter document translations or rendered output.

---

## 12. Export audit

Current exports:
- single-language PDF
- DE/IT/EN separate PDFs
- DE/IT/EN multi-page PDF
- PNG
- separate multilingual PNGs
- browser print
- crop-mark support

Current implementation uses DOM rasterization via `html2canvas-pro` and PDF placement via `jsPDF`.

F0 classification:
- valid current production behavior
- not yet a formal prepress pipeline
- no promise of true print-ready 300 DPI should be inferred solely from `scale: 3`

F8 will introduce explicit preflight rather than silently changing export behavior.

---

## 13. Critical technical debt register

### P0 — governance / truthfulness
1. Cloud/Firebase wording while persistence may be LocalStorage.
2. Firestore rules are open if enabled.
3. save action can implicitly create an `issued` registry record.

### P1 — maintainability
4. `EditorPanel.tsx` monolith.
5. dual renderer architecture.
6. oversized `FlyerContent` with aliases.
7. duplicated brand and asset sources.

### P1 — product consistency
8. UI DE-first standard not yet applied.
9. dashboard season timeline hardcoded.
10. “9 regions” terminology inconsistent with DNS canonical model.

### P2 — future capability
11. block schema only partially implemented.
12. export lacks explicit preflight.
13. analytics counters lack authoritative event pipeline.

---

## 14. F0 protected boundaries

Until a later phase explicitly reopens them:

### DO NOT
- change flyer visual output
- delete a variant
- rename active template IDs
- remove compatibility aliases
- migrate stored records
- enable Firebase
- change Firestore rules as a standalone action
- remove duplicated assets
- change price/disclaimer copy
- change DNS ticket logic
- rewrite export engine

### ALLOWED in F1–F3
- UI copy extraction
- DE-first UI localization
- component decomposition with same props/behavior
- type/schema adapters that preserve backward compatibility
- tests/build guards
- documentation

---

## 15. Proposed sequence after F0

### F1 — Foundation & UI language
DE default, IT secondary, no flyer-content changes.

### F2 — FlyerDocument v1
Versioned schema + legacy adapter, no visual changes.

### F3 — Editor decomposition
Split the editor into isolated panels while preserving behavior.

### F4 — Complete block engine
Make COMPONENT_SCHEMA executable and contextual.

### F5 — Variant migration
Progressively replace legacy renderer variants after visual comparison.

### F6 — DNS Core persistence & governance
Canonical areas/organizations, user grants, flyer designs/publications/assets.

### F7 — Operational dashboard
Season-aware registry and explicit publication lifecycle.

### F8 — Export preflight
Format, overflow, assets, QR, languages, legal, bleed/crop checks.

---

## 16. F0 exit criteria

F0 is complete when:
- baseline commit is recorded;
- renderer freeze boundaries are explicit;
- templates, blocks and variants are inventoried;
- LocalStorage/Firebase behavior is documented;
- known architectural risks are classified;
- no production behavior has changed;
- the audit passes the normal repository build check.

