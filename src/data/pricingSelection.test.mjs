import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPrice } from './pricingSelection.ts';

const row = (scopeType, scopeId, productCode, unitPrice, salesChannel = 'official', salesPeriod = 'regular') =>
  ({ scopeType, scopeId, productCode, unitPrice, salesChannel, salesPeriod });
const network = 'dolomiti-nordicski';
const area = 'drei-zinnen';

test('area day and week prices override any network default', () => {
  const rows = [row('network', network, 'day', 10), row('reportingArea', area, 'day', 16),
    row('network', network, 'wk-area', 50), row('reportingArea', area, 'wk-area', 55)];
  assert.equal(selectPrice(rows, 'day', area), 16);
  assert.equal(selectPrice(rows, 'wk-area', area), 55);
});

test('area season overrides legacy network baseline; missing area season does not silently fall back', () => {
  const rows = [row('network', network, 'sk-area', 140),
    row('reportingArea', area, 'sk-area', 130)];
  assert.equal(selectPrice(rows, 'sk-area', area), 130);
  assert.equal(selectPrice(rows, 'sk-area', 'osttirol'), null);
});

test('DNS week and season tickets ignore reporting-area prices', () => {
  const rows = [row('network', network, 'wk-dns', 65),
    row('reportingArea', area, 'wk-dns', 55),
    row('network', network, 'sk-dns', 145),
    row('reportingArea', area, 'sk-dns', 100)];
  assert.equal(selectPrice(rows, 'wk-dns', area), 65);
  assert.equal(selectPrice(rows, 'sk-dns', area), 145);
});

test('channel and period are matched exactly, without cross-channel fallback', () => {
  const rows = [row('reportingArea', area, 'day', 16),
    row('reportingArea', area, 'day', 20, 'track'),
    row('network', network, 'sk-area', 140, 'official', 'regular'),
    row('reportingArea', area, 'sk-area', 120, 'official', 'presale')];
  assert.equal(selectPrice(rows, 'day', area, 'track'), 20);
  assert.equal(selectPrice(rows, 'sk-area', area, 'official', 'presale'), 120);
  assert.equal(selectPrice(rows, 'sk-area', area), null);
  assert.equal(selectPrice(rows, 'day', area, 'online'), null);
});

test('unset override does not mask valid network price', () => {
  const rows = [row('reportingArea', area, 'sk-area', null),
    row('network', network, 'sk-area', 140)];
  assert.equal(selectPrice(rows, 'sk-area', area), 140);
});
