import { IncidentStatus, UserRole } from '../types';

export interface TransitionValidation {
  allowed: boolean;
  reason?: string;
}

// Permitted next states from current status
export const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  REPORTED: ['ACKNOWLEDGED', 'DUPLICATE', 'CANCELLED', 'REJECTED', 'ASSIGNED'],
  ACKNOWLEDGED: ['ASSIGNED', 'ESCALATED', 'DUPLICATE', 'CANCELLED', 'REJECTED'],
  ASSIGNED: ['ACCEPTED', 'ESCALATED', 'CANCELLED'],
  ACCEPTED: ['EN_ROUTE', 'ESCALATED', 'CANCELLED'],
  EN_ROUTE: ['ON_SCENE', 'ESCALATED', 'CANCELLED'],
  ON_SCENE: ['RESOLVED', 'ESCALATED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'ESCALATED'],
  CLOSED: [], // terminal unless supervisor reopens
  DUPLICATE: [],
  CANCELLED: [],
  ESCALATED: ['ASSIGNED', 'ON_SCENE', 'RESOLVED', 'CLOSED'],
  REJECTED: [],
};

// Which roles have permission to perform specific status transitions
export function canRolePerformTransition(
  role: UserRole,
  currentStatus: IncidentStatus,
  targetStatus: IncidentStatus
): TransitionValidation {
  // Check if target is in standard state machine
  const permitted = VALID_TRANSITIONS[currentStatus];
  if (!permitted || !permitted.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid status transition from ${currentStatus} to ${targetStatus}`,
    };
  }

  // Responder-specific roles
  const isResponder = ['medical_responder', 'police_responder', 'sdrf_rescue', 'volunteer'].includes(role);
  const isAuthority = ['command_operator', 'admin', 'department_operator'].includes(role);
  const isSupervisor = ['field_supervisor', 'admin', 'command_operator'].includes(role);

  if (targetStatus === 'ACCEPTED' || targetStatus === 'EN_ROUTE' || targetStatus === 'ON_SCENE') {
    if (isResponder || isAuthority) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Only assigned responders or command operators can update field movement status',
    };
  }

  if (targetStatus === 'RESOLVED') {
    if (isResponder || isAuthority || isSupervisor) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Only on-scene responders or operators can mark an incident resolved',
    };
  }

  if (targetStatus === 'CLOSED') {
    if (isAuthority || isSupervisor) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Verification and closure requires an authorized command operator or supervisor',
    };
  }

  if (targetStatus === 'ASSIGNED' || targetStatus === 'ACKNOWLEDGED' || targetStatus === 'DUPLICATE' || targetStatus === 'REJECTED') {
    if (isAuthority || isSupervisor) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Triage and responder dispatch requires an authorized operator',
    };
  }

  return { allowed: true };
}
