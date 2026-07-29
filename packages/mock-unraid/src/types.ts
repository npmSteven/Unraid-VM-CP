import type { IVM, VMState } from '@unraid-vm-cp/shared-types';

export interface ActionLogEntry {
  timestamp: number;
  action: string;
  vmId?: string;
  endpoint: string;
  details?: Record<string, unknown>;
}

export interface MockUnraidConfig {
  port?: number;
  username?: string;
  password?: string;
  initialVMs?: IVM[];
  csrfToken?: string;
  authCookieName?: string;
  format?: 'v6' | 'v7';
}

export interface MockUnraidServer {
  url: string;
  port: number;
  stop(): Promise<void>;
  getVMs(): IVM[];
  setVMState(id: string, state: VMState): void;
  addVM(vm: IVM): void;
  removeVM(id: string): void;
  getActions(): ActionLogEntry[];
  clearActions(): void;
}
