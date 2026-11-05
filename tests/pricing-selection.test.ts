import assert from 'node:assert/strict';
import test from 'node:test';
import { selectPrice, type PriceSelectionRow } from '../src/data/pricingSelection';
import { resolveOfficialPriceTexts } from '../src/data/livePriceLists';

const network = 'dolomiti-nordicski';
const area = 'osttirol';
const row = (productCode: string, unitPrice: number | null, scopeType = 'network', scopeId = network, salesChannel = 'official', salesPeriod = 'regular'): PriceSelectionRow => ({
  productCode, unitPrice, scopeType, scopeId, salesChannel, salesPeriod,
});

test('area overrides take precedence for area products', () => {
  const rows = [row('day', 15), row('day', 12, 'reportingArea', area), row('wk-area', 60), row('wk-area', 55, 'reportingArea', area), row('sk-area', 140), row('sk-area', 120, 'reportingArea', area)];
  assert.equal(selectPrice(rows, 'day', area), 12);
  assert.equal(selectPrice(rows, 'wk-area', area), 55);
  assert.equal(selectPrice(rows, 'sk-area', area), 120);
});

test('DNS weekly and season prices cannot be overridden by area', () => {
  const rows = [row('wk-dns', 65), row('wk-dns', 1, 'reportingArea', area), row('sk-dns', 145), row('sk-dns', 1, 'reportingArea', area)];
  assert.equal(selectPrice(rows, 'wk-dns', area), 65);
  assert.equal(selectPrice(rows, 'sk-dns', area), 145);
});

test('area fallback is network when area price is missing', () => {
  assert.equal(selectPrice([row('wk-area', 60)], 'wk-area', area), 60);
  assert.equal(selectPrice([row('day', null, 'reportingArea', area), row('day', 15)], 'day', area), 15);
});

test('channel and period separation prevents track or presale leaking into official regular', () => {
  const rows = [row('day', 12, 'reportingArea', area), row('day', 17, 'reportingArea', area, 'track'), row('day', 10, 'reportingArea', area, 'official', 'presale')];
  assert.equal(selectPrice(rows, 'day', area), 12);
  assert.equal(selectPrice(rows, 'day', area, 'track'), 17);
  assert.equal(selectPrice(rows, 'day', area, 'official', 'presale'), 10);
});

test('regional flyer resolves area prices, track supplements and network-only DNS prices', () => {
  const rows = [
    row('day', 12, 'reportingArea', area), row('day', 17, 'reportingArea', area, 'track'),
    row('wk-area', 55, 'reportingArea', area), row('wk-area', 65, 'reportingArea', area, 'track'),
    row('sk-area', 120, 'reportingArea', area),
    row('wk-dns', 65), row('wk-dns', 999, 'reportingArea', area),
    row('wk-dns', 75, 'network', network, 'track'),
    row('sk-dns', 145), row('sk-dns', 999, 'reportingArea', area),
  ].map(r => ({ ...r, seasonId: '2026-27' }));
  const result = resolveOfficialPriceTexts(rows, area, false);
  assert.match(result.regionalDayPrice ?? '', /12/);
  assert.match(result.regionalWeekPrice ?? '', /55/);
  assert.match(result.regionalSeasonPrice ?? '', /120/);
  assert.match(result.carouselWeekPrice ?? '', /65/);
  assert.match(result.carouselSeasonPrice ?? '', /145/);
  assert.match(result.regionalDayTrackSupplement ?? '', /5/);
  assert.match(result.regionalWeekTrackSupplement ?? '', /10/);
  assert.match(result.carouselWeekTrackSupplement ?? '', /10/);
});

test('network flyer preserves editorial area prices rather than resolving area overrides', () => {
  const rows = [row('day', 12, 'reportingArea', area), row('wk-dns', 65), row('sk-dns', 145)]
    .map(r => ({ ...r, seasonId: '2026-27' }));
  const result = resolveOfficialPriceTexts(rows, area, true);
  assert.equal(result.regionalDayPrice, undefined);
  assert.match(result.carouselWeekPrice ?? '', /65/);
});
