import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import {
  createMockUnraid,
  validateStateTransition,
  renderVMMachinesHtml,
  renderDashboardHtml,
  type MockUnraidServer,
} from '../src/index.js';
import { UnraidClient } from '@unraid-vm-cp/unraid-client';
import type { IVM, VMState } from '@unraid-vm-cp/shared-types';

describe('mock-unraid state machine', () => {
  test('valid transitions for start', () => {
    expect(validateStateTransition('shutoff', 'start').valid).toBe(true);
    expect(validateStateTransition('shutdown', 'start').valid).toBe(true);
    expect(validateStateTransition('running', 'start').valid).toBe(false);
  });

  test('valid transitions for stop', () => {
    expect(validateStateTransition('running', 'stop').valid).toBe(true);
    expect(validateStateTransition('paused', 'stop').valid).toBe(true);
    expect(validateStateTransition('pmsuspended', 'stop').valid).toBe(true);
    expect(validateStateTransition('shutoff', 'stop').valid).toBe(false);
  });

  test('valid transitions for forceStop', () => {
    expect(validateStateTransition('running', 'forceStop').valid).toBe(true);
    expect(validateStateTransition('paused', 'forceStop').valid).toBe(true);
    expect(validateStateTransition('shutoff', 'forceStop').valid).toBe(false);
  });

  test('valid transitions for pause', () => {
    expect(validateStateTransition('running', 'pause').valid).toBe(true);
    expect(validateStateTransition('shutoff', 'pause').valid).toBe(false);
    expect(validateStateTransition('paused', 'pause').valid).toBe(false);
  });

  test('valid transitions for resume', () => {
    expect(validateStateTransition('paused', 'resume').valid).toBe(true);
    expect(validateStateTransition('pmsuspended', 'resume').valid).toBe(true);
    expect(validateStateTransition('running', 'resume').valid).toBe(false);
    expect(validateStateTransition('shutoff', 'resume').valid).toBe(false);
  });

  test('valid transitions for reboot', () => {
    expect(validateStateTransition('running', 'reboot').valid).toBe(true);
    expect(validateStateTransition('shutoff', 'reboot').valid).toBe(false);
  });

  test('valid transitions for hibernate', () => {
    expect(validateStateTransition('running', 'hibernate').valid).toBe(true);
    expect(validateStateTransition('shutoff', 'hibernate').valid).toBe(false);
  });

  test('unknown action returns error', () => {
    expect(validateStateTransition('running', 'invalidAction').valid).toBe(false);
  });
});

describe('mock-unraid HTML templates', () => {
  const testVMs: IVM[] = [
    {
      id: 'vm-1',
      name: 'Test VM 1',
      state: 'running',
      graphics: 'VNC:5900',
      memory: '2048M',
      cpus: '2',
      storage: '20G',
      os: 'Linux',
      ips: [{ type: 'ipv4', address: '10.0.0.1', prefix: '24' }],
      vnc: '5900',
      osImg: '/plugins/img.png',
      isAutoStart: true,
    },
  ];

  test('renderDashboardHtml produces csrf_token', () => {
    const html = renderDashboardHtml('test_token_999');
    expect(html).toContain('name="csrf_token"');
    expect(html).toContain('value="test_token_999"');
  });

  test('renderVMMachinesHtml v6 format', () => {
    const html = renderVMMachinesHtml(testVMs, 'v6');
    expect(html).toContain('Test VM 1');
    expect(html).toContain('autoconnect=true');
    expect(html).toContain('vcpu-vm-1');
  });

  test('renderVMMachinesHtml v7 format with parent-id and IPs', () => {
    const html = renderVMMachinesHtml(testVMs, 'v7');
    expect(html).toContain('parent-id="vm-0"');
    expect(html).toContain('10.0.0.1');
  });

  test('renderVMMachinesHtml empty list', () => {
    const html = renderVMMachinesHtml([], 'v6');
    expect(html).toBe('');
  });
});

describe('mock-unraid integration with UnraidClient', () => {
  let mockServer: MockUnraidServer;
  let client: UnraidClient;

  beforeEach(async () => {
    mockServer = await createMockUnraid({
      port: 0,
      username: 'root',
      password: 'password',
    });

    const parsedUrl = new URL(mockServer.url);

    client = new UnraidClient({
      ip: parsedUrl.hostname,
      port: parsedUrl.port,
      isHTTPS: false,
      username: 'root',
      password: 'password',
      baseUrl: mockServer.url,
    });
  });

  afterEach(async () => {
    if (mockServer) {
      await mockServer.stop();
    }
  });

  test('login authenticates with mock server', async () => {
    await client.login();
    expect(client.getCookie()).toBeDefined();
  });

  test('getVMsUnraid fetches VMs from mock server', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    expect(vms.length).toBe(2);
    expect(vms[0].name).toBe('Windows 11');
  });

  test('startVMUnraid successfully starts a shutoff VM', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    const shutoffVm = vms.find((v) => v.state === 'shutoff')!;
    expect(shutoffVm).toBeDefined();

    const res = await client.startVMUnraid(shutoffVm.id);
    expect(res).toBe(true);

    const actions = mockServer.getActions();
    const startAction = actions.find((a) => a.action === 'start' && a.vmId === shutoffVm.id);
    expect(startAction).toBeDefined();
  });

  test('stopVMUnraid successfully stops a running VM', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    const runningVm = vms.find((v) => v.state === 'running')!;

    const res = await client.stopVMUnraid(runningVm.id);
    expect(res).toBe(true);

    const updatedVMs = mockServer.getVMs();
    expect(updatedVMs.find((v) => v.id === runningVm.id)?.state).toBe('shutoff');
  });

  test('hibernateVMUnraid triggers domain-pmsuspend via VMajax', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    const runningVm = vms.find((v) => v.state === 'running')!;

    await client.hibernateVMUnraid(runningVm.id);
    const updatedVMs = mockServer.getVMs();
    expect(updatedVMs.find((v) => v.id === runningVm.id)?.state).toBe('pmsuspended');
  });

  test('removeVMUnraid removes VM via VMajax', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    const targetId = vms[0].id;

    await client.removeVMUnraid(targetId);
    const updatedVMs = mockServer.getVMs();
    expect(updatedVMs.find((v) => v.id === targetId)).toBeUndefined();
  });

  test('invalid GraphQL transition fails', async () => {
    await client.login();
    const vms = await client.getVMsUnraid();
    const runningVm = vms.find((v) => v.state === 'running')!;

    expect(client.startVMUnraid(runningVm.id)).rejects.toThrow();
  });
});
