import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineSyncEngine } from './offlineQueue';

test('offline queue enqueues and prevents duplicate submissions using clientId', () => {
  const engine = new OfflineSyncEngine();
  
  const item1 = engine.enqueue({
    clientId: 'sos_tx_001',
    action: 'CREATE_INCIDENT',
    payload: { type: 'MEDICAL' },
  });

  assert.equal(engine.getPendingCount(), 1);

  // Re-submission with same clientId returns the identical queue item
  const item2 = engine.enqueue({
    clientId: 'sos_tx_001',
    action: 'CREATE_INCIDENT',
    payload: { type: 'MEDICAL' },
  });

  assert.equal(item1.id, item2.id);
  assert.equal(engine.getPendingCount(), 1);
});

test('marks items synced and records processed set', () => {
  const engine = new OfflineSyncEngine();
  engine.enqueue({
    clientId: 'sos_tx_002',
    action: 'UPDATE_INCIDENT_STATUS',
    payload: { status: 'ON_SCENE' },
  });

  assert.equal(engine.markSynced('sos_tx_002'), true);
  assert.equal(engine.getPendingCount(), 0);
  assert.equal(engine.isAlreadyProcessed('sos_tx_002'), true);
});

test('handles conflicts properly', () => {
  const engine = new OfflineSyncEngine();
  engine.enqueue({
    clientId: 'task_003',
    action: 'COMPLETE_TASK',
    payload: { taskId: 'T-1' },
  });

  assert.equal(engine.markConflict('task_003', 'Server status is already verified'), true);
  const queue = engine.getQueue();
  assert.equal(queue[0].status, 'FAILED_CONFLICT');
  assert.equal(queue[0].errorMessage, 'Server status is already verified');
});

test('enqueues and deduplicates lost person reports (CREATE_LOST_PERSON)', () => {
  const engine = new OfflineSyncEngine();
  const lostCase = {
    personName: 'Ravi Teja',
    approxAge: 7,
    lastSeenLocation: 'Pushkar Ghat Promenade',
    contactPhone: '+91 98480 11223'
  };

  const item1 = engine.enqueue({
    clientId: 'lost_tx_901',
    action: 'CREATE_LOST_PERSON',
    payload: lostCase,
  });

  assert.equal(item1.action, 'CREATE_LOST_PERSON');
  assert.equal(item1.payload.personName, 'Ravi Teja');
  assert.equal(engine.getPendingCount(), 1);

  // Idempotent duplicate submission
  const item2 = engine.enqueue({
    clientId: 'lost_tx_901',
    action: 'CREATE_LOST_PERSON',
    payload: lostCase,
  });
  assert.equal(item1.id, item2.id);
  assert.equal(engine.getPendingCount(), 1);

  // Mark synced
  assert.equal(engine.markSynced('lost_tx_901'), true);
  assert.equal(engine.getPendingCount(), 0);
  assert.equal(engine.isAlreadyProcessed('lost_tx_901'), true);
});

test('schedules exponential backoff and tracks nextRetryAfter on transmission failure', () => {
  const engine = new OfflineSyncEngine();
  engine.enqueue({
    clientId: 'sos_retry_001',
    action: 'CREATE_INCIDENT',
    payload: { type: 'DROWNING_RISK' },
  });

  const retry1 = engine.recordRetry('sos_retry_001', 'Network timeout');
  assert.ok(retry1);
  assert.equal(retry1.retryCount, 1);
  assert.ok(retry1.backoffMs >= 2000 && retry1.backoffMs <= 3000);

  const queue = engine.getQueue();
  const item = queue.find(q => q.clientId === 'sos_retry_001');
  assert.ok(item);
  assert.equal(item.retryCount, 1);
  assert.ok(item.lastAttemptAt);
  assert.ok(item.nextRetryAfter && item.nextRetryAfter > Date.now());

  // Ready items filter excludes items in active backoff
  const readyItems = engine.getReadyItems();
  assert.equal(readyItems.some(i => i.clientId === 'sos_retry_001'), false);
});

test('requeues failed timeout items back into ready queue', () => {
  const engine = new OfflineSyncEngine();
  engine.enqueue({
    clientId: 'fail_item_001',
    action: 'CREATE_INCIDENT',
    payload: { type: 'FIRE' },
  });

  // Force fail to TIMEOUT
  for (let i = 0; i < 9; i++) {
    engine.recordRetry('fail_item_001', 'Server unreachable');
  }

  assert.equal(engine.getFailedCount(), 1);
  assert.equal(engine.getPendingCount(), 0);

  // Requeue
  const requeued = engine.requeueFailed('fail_item_001');
  assert.equal(requeued, 1);
  assert.equal(engine.getPendingCount(), 1);
  assert.equal(engine.getFailedCount(), 0);
  assert.equal(engine.getReadyItems().length, 1);
});
