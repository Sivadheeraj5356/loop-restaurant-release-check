import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreRelease, validateRelease } from '../src/release_check.js';

const release = {
  name: 'delivery-order-variance-alert',
  customerImpact: 'Managers see orders where payouts diverge from expected totals',
  orders: 'Handles created, accepted, cancelled, and refunded order states',
  data: 'Aggregates order, payout, and refund records with immutable event IDs',
  tests: [{ name: 'cancelled order', status: 'passed' }, { name: 'refund variance', status: 'passed' }],
  rollback: 'Hide alert and preserve existing payout report'
};

test('accepts a complete restaurant MVP release', () => {
  const result = scoreRelease(release);
  assert.equal(result.ready, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.metrics.areas, 5);
});

test('rejects missing release areas', () => {
  const incomplete = { name: 'menu-import', tests: [{ name: 'csv parse', status: 'passed' }] };
  assert.deepEqual(validateRelease(incomplete), ['customerImpact is required', 'orders is required', 'data is required', 'rollback is required']);
});

test('pending or failed tests block release', () => {
  const blocked = { ...release, tests: [{ name: 'cancelled order', status: 'pending' }, { name: 'refund variance', status: 'failed' }] };
  const result = scoreRelease(blocked);
  assert.equal(result.ready, false);
  assert.equal(result.metrics.pending, 2);
});
