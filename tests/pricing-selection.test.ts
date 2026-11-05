import assert from 'node:assert/strict';
import test from 'node:test';
import { selectPrice, type PriceSelectionRow } from '../src/data/pricingSelection';

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

test('area aliases use the canonical reporting-area scope', () => {
  const rows = [
    row('day', 12, 'reportingArea', 'drei-zinnen'),
    row('day', 15),
    row('wk-dns', 65),
    row('wk-dns', 999, 'reportingArea', 'drei-zinnen'),
  ];
  assert.equal(selectPrice(rows, 'day', 'drei-zinnen'), 12);
  assert.equal(selectPrice(rows, 'wk-dns', 'drei-zinnen'), 65);
});

test('regional track surcharge must use corresponding scoped track and official values', () => {
  const rows = [
    row('day', 12, 'reportingArea', area),
    row('day', 17, 'reportingArea', area, 'track'),
    row('day', 15),
    row('wk-area', 55, 'reportingArea', area),
    row('wk-area', 65, 'reportingArea', area, 'track'),
    row('wk-dns', 65), row('wk-dns', 75, 'network', network, 'track'),
  ];
  assert.equal(selectPrice(rows, 'day', area, 'track')! - selectPrice(rows, 'day', area)!, 5);
  assert.equal(selectPrice(rows, 'wk-area', area, 'track')! - selectPrice(rows, 'wk-area', area)!, 10);
  assert.equal(selectPrice(rows, 'wk-dns', area, 'track')! - selectPrice(rows, 'wk-dns', area)!, 10);
});

test('Val Casies season tariff is always read from its reporting area, never legacy DNS network', () => {
  const gsies = 'gsiesertal-welsberg-taisten';
  const rows = [row('sk-area', 140), row('sk-area', 125, 'reportingArea', gsies),
    row('sk-area', 130, 'reportingArea', 'osttirol'), row('sk-dns', 145)];
  assert.equal(selectPrice(rows, 'sk-area', gsies), 125);
  assert.equal(selectPrice(rows, 'sk-area', 'drei-zinnen'), null);
  assert.equal(selectPrice(rows, 'sk-dns', gsies), 145);
});

test('Val Casies presale and regular season prices remain separate', () => {
  const gsies = 'gsiesertal-welsberg-taisten';
  const rows = [row('sk-area', 120, 'reportingArea', gsies, 'official', 'presale'),
    row('sk-area', 130, 'reportingArea', gsies, 'official', 'regular')];
  assert.equal(selectPrice(rows, 'sk-area', gsies, 'official', 'presale'), 120);
  assert.equal(selectPrice(rows, 'sk-area', gsies), 130);
});

test('an organization-only seasonal override cannot masquerade as the area tariff', () => {
  const gsies = 'gsiesertal-welsberg-taisten';
  const rows = [row('sk-area', 100, 'organization', 'gsies-partner'), row('sk-area', 125, 'reportingArea', gsies)];
  assert.equal(selectPrice(rows, 'sk-area', gsies), 125);
});
