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
