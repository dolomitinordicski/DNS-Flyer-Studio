# DNS Flyer Studio — price-list audit (2026-10-22)

Scope: modern **official_price_list** and **regional_price_list** only; no Legacy code or runtime changes.

## Confirmed wiring
- `src/data/livePriceLists.ts` reads `DNS_Core/ticketPricingConfigs`, matching DNS Data Entry `src/services/seasonalPersistence.ts` load/save calls.
- Reporting-area aliases use `coreReportingAreaId()` in `regionalLogos.ts`.
- Network and area on-track supplements are computed as the difference between the track and official sale prices.
- `PriceTableBlock.tsx` renders those supplements beneath day/week prices, when a non-missing result is available.
- `OfficialPriceTableVariant.tsx` provides specific A3/A4/A5 and portrait/landscape treatment; visual overflow has not been tested in-browser.

## Findings (prioritized)
1. **P1 — Season selection:** `FlyerCanvas.tsx` uses `/^\\\\d{4}[/-]\\\\d{2}$/` in source, matching literal backslash/d rather than digits. It therefore falls back to `2026-27` for normal season labels, including later seasons. Fix carefully and test `2026/27`, `2026-27`, `2027/28`, malformed values.
2. **P1 — Editorial area prices on network list:** `FlyerCanvas.tsx` intentionally retains saved `regionalDayPrice`, `regionalWeekPrice`, `regionalSeasonPrice` for the DNS-wide list. Defaults in `templates.ts` include fixed and 'from' figures. Confirm approved policy for calculating current area-wide minimums before changing: these are not hydrated from DNS Core.
3. **P2 — Pricing lookup strictness:** `loadOfficialPriceTexts()` matches exactly `salesPeriod === 'regular'` and `salesChannel === 'official'/'track'`; Shared Data's `TicketPricingConfig.salesPeriod` is optional, so an otherwise valid record lacking this field displays '—'. Verify Data Entry always supplies the period; do not silently guess it.
4. **P2 — Missing vs ready distinction:** A successful Firestore request sets `priceLoadState='ready'` even with no matching pricing rows; price placeholders remain '—'. Consider a separate missing-rate diagnostic before export, not demo fallback tariffs.
5. **P2 — Layout QA:** A3/A4/A5, landscape compact/extended, image positioning and partner-logo scaling have code branches but need browser/print visual tests (clipping and font legibility).
6. **P3 — Template defaults:** Static 2026/27 pricing examples, including historical figures, remain in `DEFAULT_PRICE_LIST_TEXTS`. Keep sample content explicitly editorial and ensure official list placeholders mask stale prices where needed.

## Do not change without separate approval
- No writes to pricing in DNS Core; Data Entry remains authoritative.
- No changes to Analytics, Shared Data contracts or Legacy.
- No automatic assumptions about regional tariffs or reciprocity agreements.

## Release gate
Fix P1 season parser first, then validate `npm run lint`, `npm run build`, deployment and an actual browser rendering/export test for network and area lists. A green CI alone does not prove tariff completeness or print readiness.
