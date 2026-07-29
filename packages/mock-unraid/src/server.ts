import type { IVM, VMState } from '@unraid-vm-cp/shared-types';
import type { MockUnraidConfig, MockUnraidServer, ActionLogEntry } from './types.js';
import { validateStateTransition } from './state-machine.js';
import { renderDashboardHtml } from './templates/dashboard.js';
import { renderVMMachinesHtml } from './templates/vmmachines.js';

export const DEFAULT_INITIAL_VMS: IVM[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Windows 11',
    state: 'running',
    graphics: 'VNC:5900',
    memory: '8192M',
    cpus: '4',
    storage: '100G',
    os: 'Windows',
    ips: [{ type: 'ipv4', address: '192.168.1.50', prefix: '24' }],
    vnc: '5900',
    osImg: '/plugins/dynamix.vm.manager/templates/images/windows.png',
    isAutoStart: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Ubuntu Server',
    state: 'shutoff',
    graphics: 'VNC:5901',
    memory: '4096M',
    cpus: '2',
    storage: '50G',
    os: 'Linux',
    ips: [],
    vnc: '5901',
    osImg: '/plugins/dynamix.vm.manager/templates/images/ubuntu.png',
    isAutoStart: false,
  },
];

export async function createMockUnraid(config: MockUnraidConfig = {}): Promise<MockUnraidServer> {
  const port = config.port ?? 0;
  const username = config.username ?? 'root';
  const password = config.password ?? 'password';
  const csrfToken = config.csrfToken ?? 'mock_csrf_token_123456789';
  const authCookie = config.authCookieName ?? 'unraid_session_cookie_mock=valid_session';

  const vmsMap = new Map<string, IVM>();
  const initialVMs = config.initialVMs ?? DEFAULT_INITIAL_VMS;
  for (const vm of initialVMs) {
    vmsMap.set(vm.id, { ...vm });
  }

  const actions: ActionLogEntry[] = [];

  const logAction = (action: string, vmId?: string, endpoint: string = '', details?: Record<string, unknown>) => {
    actions.push({
      timestamp: Date.now(),
      action,
      vmId,
      endpoint,
      details,
    });
  };

  const server = Bun.serve({
    port,
    hostname: '127.0.0.1',
    async fetch(req: Request) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method.toUpperCase();
      const cookieHeader = req.headers.get('cookie') || '';

      const isAuthenticated = cookieHeader.includes('unraid_');

      if (path === '/login' && method === 'POST') {
        const formData = await req.formData();
        const reqUser = formData.get('username')?.toString();
        const reqPass = formData.get('password')?.toString();

        logAction('login', undefined, '/login', { username: reqUser });

        if (reqUser === username && reqPass === password) {
          return new Response('Found', {
            status: 302,
            headers: {
              'Location': '/Dashboard',
              'Set-Cookie': authCookie,
            },
          });
        }
        return new Response('Unauthorized', { status: 401 });
      }

      if (path === '/Dashboard' && method === 'GET') {
        if (!isAuthenticated) {
          return new Response('Forbidden', { status: 403 });
        }
        logAction('dashboard', undefined, '/Dashboard');
        return new Response(renderDashboardHtml(csrfToken), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (path.includes('/VMMachines.php') && method === 'GET') {
        if (!isAuthenticated) {
          return new Response('Forbidden', { status: 403 });
        }
        logAction('get_vms', undefined, path);
        const vmsList = Array.from(vmsMap.values());
        const html = renderVMMachinesHtml(vmsList, config.format ?? 'v6');
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (path === '/graphql' && method === 'POST') {
        if (!isAuthenticated) {
          return new Response(
            JSON.stringify({ errors: [{ message: 'Not authenticated with Unraid' }] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        try {
          const body = (await req.json()) as { query?: string; variables?: { id?: string } };
          const query = body.query || '';
          const vmId = body.variables?.id;

          let action = '';
          if (query.includes('start(')) action = 'start';
          else if (query.includes('stop(')) action = 'stop';
          else if (query.includes('forceStop(')) action = 'forceStop';
          else if (query.includes('reboot(')) action = 'reboot';
          else if (query.includes('pause(')) action = 'pause';
          else if (query.includes('resume(')) action = 'resume';

          if (!vmId) {
            return Response.json({ errors: [{ message: 'Missing VM id' }] });
          }

          const vm = vmsMap.get(vmId);
          if (!vm) {
            return Response.json({ errors: [{ message: `VM not found: ${vmId}` }] });
          }

          const validation = validateStateTransition(vm.state, action);
          if (!validation.valid) {
            logAction(`${action}_failed`, vmId, '/graphql', { error: validation.error });
            return Response.json({ errors: [{ message: validation.error }] });
          }

          vm.state = validation.targetState!;
          vmsMap.set(vmId, vm);
          logAction(action, vmId, '/graphql', { newState: vm.state });

          const responseData: Record<string, unknown> = {
            data: {
              vm: {
                [action]: true,
              },
            },
          };
          return Response.json(responseData);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Invalid request';
          return Response.json({ errors: [{ message: msg }] });
        }
      }

      if (path.includes('/VMajax.php') && method === 'POST') {
        if (!isAuthenticated) {
          return new Response('Forbidden', { status: 403 });
        }

        const formData = await req.formData();
        const uuid = formData.get('uuid')?.toString() || '';
        const action = formData.get('action')?.toString() || '';
        const reqCsrf = formData.get('csrf_token')?.toString() || '';

        if (reqCsrf !== csrfToken) {
          logAction('vmajax_invalid_csrf', uuid, path, { action, csrf: reqCsrf });
          return Response.json({ error: 'CSRF token missing or invalid' });
        }

        const vm = vmsMap.get(uuid);

        if (action === 'domain-pmsuspend') {
          if (!vm) return Response.json({ error: 'VM not found' });
          const validation = validateStateTransition(vm.state, 'hibernate');
          if (!validation.valid) {
            logAction('hibernate_failed', uuid, path, { error: validation.error });
            return Response.json({ error: validation.error });
          }
          vm.state = 'pmsuspended';
          vmsMap.set(uuid, vm);
          logAction('hibernate', uuid, path);
          return Response.json({ success: true });
        }

        if (action === 'domain-undefine') {
          if (!vm) return Response.json({ error: 'VM not found' });
          vmsMap.delete(uuid);
          logAction('remove-vm', uuid, path);
          return Response.json({ success: true });
        }

        if (action === 'domain-delete') {
          if (!vm) return Response.json({ error: 'VM not found' });
          vmsMap.delete(uuid);
          logAction('remove-vm-and-disks', uuid, path);
          return Response.json({ success: true });
        }

        logAction('vmajax_unknown', uuid, path, { action });
        return Response.json({ error: `Unknown VMajax action: ${action}` });
      }

      return new Response('Not Found', { status: 404 });
    },
  });

  const actualPort = server.port;
  const url = `http://127.0.0.1:${actualPort}`;

  return {
    url,
    port: actualPort,
    async stop() {
      await server.stop(true);
    },
    getVMs(): IVM[] {
      return Array.from(vmsMap.values()).map((vm) => ({ ...vm }));
    },
    setVMState(id: string, state: VMState) {
      const vm = vmsMap.get(id);
      if (vm) {
        vm.state = state;
        vmsMap.set(id, vm);
      }
    },
    addVM(vm: IVM) {
      vmsMap.set(vm.id, { ...vm });
    },
    removeVM(id: string) {
      vmsMap.delete(id);
    },
    getActions(): ActionLogEntry[] {
      return [...actions];
    },
    clearActions() {
      actions.length = 0;
    },
  };
}
