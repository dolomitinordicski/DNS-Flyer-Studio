# F6 — DNS Core Persistence

DNS Flyer Studio uses the shared Firebase project `dns-core`.

## Architecture

```text
React UI
  ↓
compatibility facade (src/lib/firebase.ts)
  ↓
flyerRepository
  ↓
DNS Core Auth + Firestore
```

Blocks do not query Firestore. Canonical data reaches blocks only through the Block Data Contract/provider layer defined in F5B.

## Authoritative collections

- `flyerDocuments`
- `flyerPublications`
- `flyerTemplates`
- `flyerAssets`

## Working vs published

- Save → working `flyerDocument`
- Publish → immutable `flyerPublication`

## LocalStorage

Legacy LocalStorage records remain readable for migration. Failed DNS Core writes are no longer silently treated as successful local cloud saves.

## Authentication

The application uses a dedicated named Firebase app bound to `dns-core` and Google Authentication. Firestore authorization is enforced by central rules in `dns-shared-data`.

## Custom icons/assets

Binary custom icons remain local until the Storage-backed asset provider is enabled. They are intentionally not written as Base64 payloads into Firestore.


## F6.5 — Runtime block hydration

F6.5 activates the first real DNS Core → Block Engine data path.

### PRICE_TABLE

Official and regional price-list documents now declare the `PRICE_TABLE` binding as:

```text
source.kind = dns-core
dataset = ticketPricingConfigs
season = active flyer season
```

When a valid DNS Core session is available, the runtime loads canonical official pricing and hydrates a **runtime-only** copy of the flyer.

Mapping:
- `day` → regional daily price
- `wk-area` → regional weekly price
- `sk-area` → regional season price
- `wk-dns` → DNS weekly price
- `sk-dns` → DNS season price

Only active official/regular EUR pricing is used. Missing canonical values do not erase inline values.

### No duplication

Canonical prices are not copied into editable FlyerContent just to render them.

```text
editable content
      +
DNS Core canonical prices
      ↓
resolvedContent (runtime only)
      ↓
FlyerCanvas / PDF / PNG
```

Saved documents retain their source binding and inline fallback. The canonical source remains DNS Core.

### Canonical IDs

Historical Flyer Studio region IDs are mapped through `canonicalRegionIds.ts` before DNS Core access.

Examples:
- `3_zinnen` → `drei-zinnen`
- `anterselva` → `antholzertal`
- `comelico` → `val-comelico`
- `cortina` → `cortina-d-ampezzo`

This adapter also governs Firestore scope IDs for Flyer documents.

### Export

Multilingual export no longer mutates the editable document language. It renders a temporary runtime preview, preserving canonical hydration and the editor state.
