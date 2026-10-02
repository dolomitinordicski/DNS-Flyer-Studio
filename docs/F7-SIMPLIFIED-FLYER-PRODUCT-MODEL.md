# F7 — Simplified Flyer Product Model

## Goal

Reduce Flyer Studio from a general-purpose design editor to a controlled DNS production tool for reporting areas.

The internal architecture remains powerful (Foundation, FlyerDocument, Block Engine, Data Contracts, DNS Core), while the area-facing UI exposes only the minimum necessary controls.

## Canonical flyer types

F7 defines one canonical template and one graphic style for each supported flyer type:

1. Price list
2. Digital Pass
3. Hotel + Nordic package
4. Voucher
5. Promotion

Each type owns:
- one `templateId`;
- one `graphicStyle`;
- one fixed block stack;
- one list of editable fields.

## Area-facing editor

Visible controls are limited to:

- Flyer / template selection
- Content
- Main image
- Colors
- QR

Paused from the operational UI:

- graphic-style selector;
- arbitrary block composition;
- graphic-elements editor;
- manual region selection;
- sports/custom icon editor;
- arbitrary section ordering;
- Make It Perfect;
- format/orientation/crop controls;
- legacy operational dashboard.

These capabilities are not deleted in F7. They remain internal/deprecated while the simplified product model is validated.

## Area context

The application resolves the current user's DNS Core `accessGrants`.

If the user has a `reportingArea` scope, new canonical flyers automatically use that area as `regionId`. The region is therefore contextual, not manually selected.

## Template + overrides

The canonical model is:

```text
DNS canonical template
+ reporting area context
+ allowed overrides
= area flyer
```

`FlyerDocument v1` remains backward compatible and continues to carry the complete snapshot, but F7 also persists:

- product type;
- canonical template ID;
- allowed override projection.

This allows later migration toward smaller override-only working records without breaking existing documents or publications.

## Product constraint

Applying or reopening a canonical flyer:
- forces the canonical graphic style;
- forces the canonical block order;
- disables blocks outside the type's block stack;
- preserves only the controls exposed through the simplified editor.

## Non-goals

F7 does not:
- delete the Block Engine;
- remove legacy data compatibility;
- change publication snapshots;
- add new Firestore collections;
- move binary assets to Storage;
- implement more visual variants.

The purpose is product simplification, not architectural rollback.
