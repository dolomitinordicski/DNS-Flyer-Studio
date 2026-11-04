/** Pricing precedence for area products only. DNS weekly and season tickets are network-only. */
export interface PriceSelectionRow {
  scopeType: string;
  scopeId: string;
  productCode: string;
  salesChannel: string;
  salesPeriod: string;
  unitPrice: number | null;
}

export function selectPrice(
  rows: PriceSelectionRow[],
  productCode: string,
  reportingAreaId: string,
  channel: string = 'official',
  period: string = 'regular',
): number | null {
  const network = 'dolomiti-nordicski';
  const eligibleScopes = productCode === 'wk-dns' || productCode === 'sk-dns'
    ? [{ scopeType: 'network', scopeId: network }]
    : [{ scopeType: 'reportingArea', scopeId: reportingAreaId },
       { scopeType: 'network', scopeId: network }];
  for (const scope of eligibleScopes) {
    const matching = rows.find(row =>
      row.scopeType === scope.scopeType && row.scopeId === scope.scopeId &&
      row.productCode === productCode && row.salesChannel === channel &&
      row.salesPeriod === period && typeof row.unitPrice === 'number' &&
      Number.isFinite(row.unitPrice));
    if (matching) return matching.unitPrice;
  }
  return null;
}
