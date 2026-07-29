import type { VMState } from '@unraid-vm-cp/shared-types';

export const ALLOWED_TRANSITIONS: Record<string, VMState[]> = {
  start: ['shutoff', 'shutdown'],
  stop: ['running', 'paused', 'pmsuspended'],
  forceStop: ['running', 'paused', 'pmsuspended'],
  pause: ['running'],
  resume: ['paused', 'pmsuspended'],
  reboot: ['running'],
  hibernate: ['running'],
};

export const ACTION_TARGET_STATE: Record<string, VMState> = {
  start: 'running',
  stop: 'shutoff',
  forceStop: 'shutoff',
  pause: 'paused',
  resume: 'running',
  reboot: 'running',
  hibernate: 'pmsuspended',
};

export function validateStateTransition(
  currentState: VMState,
  action: string
): { valid: boolean; error?: string; targetState?: VMState } {
  const allowed = ALLOWED_TRANSITIONS[action];
  if (!allowed) {
    return { valid: false, error: `Unknown VM action: ${action}` };
  }
  if (!allowed.includes(currentState)) {
    return {
      valid: false,
      error: `Invalid state transition: Cannot ${action} VM in state '${currentState}'`,
    };
  }
  return { valid: true, targetState: ACTION_TARGET_STATE[action] };
}
