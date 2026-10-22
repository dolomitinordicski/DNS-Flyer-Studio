# Data ownership audit — DNS Flyer Studio

Status: scoped audit, 2026-10-22. No UI or runtime change.

## Authoritative data

- **DNS Core / Shared Data** owns reporting-area IDs, entity records, seasons, pricing and official asset metadata.
- `src/data/livePriceLists.ts` loads pricing from DNS Core `ticketPricingConfigs` and uses `coreReportingAreaId()` from `src/data/regionalLogos.ts`; do not reintroduce a second alias table.
- `src/data/blockDataProviders.ts` exposes the allowed Core collections through explicit providers.
- Logos in `src/data/regionalLogos.ts` point to Shared Data assets; flyer-specific paired partner marks and display labels are presentation decisions.

## Local editorial/presentation data

- `src/data/brand.ts` holds headline facts and an additional `BRAND_AREAS` view with editorial short names and numbering; it is not a canonical entity registry.
- `src/data/sportsIcons.ts` provides translated flyer icon labels and descriptions; it is not a source for operational service availability.
- `src/data/templates.ts` defines initial editorial flyer content and layout, not authoritative prices.
- `src/data/ticketDemoPresets.ts` contains non-operational examples, never real validation or issuance URLs.

## Follow-up risks and required contracts

1. **Area metadata duplication:** compare `BRAND_AREAS` against Core reporting areas before removing it. Preserve editorial names, order and compatibility with persisted region IDs.
2. **Ticket reciprocity:** `src/model/ticketPresentation.ts` still includes `RECIPROCAL_AREAS` as an explicitly interim mapping. Do not present it as official or replace it until an authoritative contract exists.
3. **Price defaults:** `DEFAULT_PRICE_LIST_TEXTS` contains sample editorial prices; official price lists must continue to show DNS Core values (or the unavailable marker), not fallback figures.
4. **Asset URLs:** confirm public Shared Data logo availability and fallback behavior independently from the build.
5. **Runtime verification:** successful Vite/TypeScript/Pages checks do not validate Firestore permissions or browser initialization.

## Refactoring rule

One canonical ID mapping, one authoritative pricing source. Keep Flyer Studio's layout and editorial presentation local; do not infer official facts from sample presets. Verify `npm run lint`, `npm run build`, and GitHub Pages deployment before taking another runtime change.
