/**
 * Compatibility bridge from historical Flyer Studio region IDs to the
 * canonical DNS Core reporting-area IDs.
 *
 * New persistence/data-source code must use canonical IDs. The visual/editor
 * layer may keep historical IDs until a controlled document-schema migration.
 */
export const FLYER_REGION_TO_REPORTING_AREA: Record<string, string> = {
  osttirol: 'osttirol',
  '3_zinnen': 'drei-zinnen',
  cortina: 'cortina-d-ampezzo',
  comelico: 'val-comelico',
  gsiesertal: 'gsiesertal-welsberg-taisten',
  anterselva: 'antholzertal',
  ahrntal: 'ahrntal',
  seiser_alm_val_gardena: 'seiser-alm-dolomites-val-gardena',
};

export function toCanonicalReportingAreaId(regionId?: string): string | null {
  if (!regionId || regionId === 'dns_central') return null;
  return FLYER_REGION_TO_REPORTING_AREA[regionId] ?? regionId;
}
