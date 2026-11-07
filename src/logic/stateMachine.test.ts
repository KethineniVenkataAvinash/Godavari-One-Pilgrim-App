import test from 'node:test';
import assert from 'node:assert/strict';
import { canRolePerformTransition, VALID_TRANSITIONS } from './stateMachine';

test('valid incident progression: REPORTED -> ACKNOWLEDGED -> ASSIGNED -> ACCEPTED -> EN_ROUTE -> ON_SCENE -> RESOLVED -> CLOSED', () => {
  // Operator acknowledges
  assert.equal(canRolePerformTransition('command_operator', 'REPORTED', 'ACKNOWLEDGED').allowed, true);
  
  // Operator assigns
  assert.equal(canRolePerformTransition('command_operator', 'ACKNOWLEDGED', 'ASSIGNED').allowed, true);

  // Responder accepts
  assert.equal(canRolePerformTransition('medical_responder', 'ASSIGNED', 'ACCEPTED').allowed, true);

  // Responder moves en route
  assert.equal(canRolePerformTransition('medical_responder', 'ACCEPTED', 'EN_ROUTE').allowed, true);

  // Responder on scene
  assert.equal(canRolePerformTransition('medical_responder', 'EN_ROUTE', 'ON_SCENE').allowed, true);

  // Responder resolves
  assert.equal(canRolePerformTransition('medical_responder', 'ON_SCENE', 'RESOLVED').allowed, true);

  // Operator closes with verification
  assert.equal(canRolePerformTransition('command_operator', 'RESOLVED', 'CLOSED').allowed, true);
});

test('pilgrim cannot perform responder or operator status changes', () => {
  const result = canRolePerformTransition('pilgrim', 'ASSIGNED', 'ACCEPTED');
  assert.equal(result.allowed, false);
});

test('responder cannot close a disputed case without authority approval', () => {
  const result = canRolePerformTransition('police_responder', 'RESOLVED', 'CLOSED');
  assert.equal(result.allowed, false);
});

test('invalid transition jumps are blocked', () => {
  // Cannot jump straight from REPORTED to ON_SCENE
  const result = canRolePerformTransition('command_operator', 'REPORTED', 'ON_SCENE');
  assert.equal(result.allowed, false);
});
