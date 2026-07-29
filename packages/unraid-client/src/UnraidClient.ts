import { BadRequestError, ForbiddenError } from '@unraid-vm-cp/shared-types';
import type { IVM } from '@unraid-vm-cp/shared-types';
import { startVM, stopVM, forceStopVM, rebootVM, pauseVM, resumeVM, initGraphQLClient } from './unraid-graphql.js';
import { extractVMsFromHTML } from './extract-vms.js';

type UnraidConfig = {
  ip: string;
  port?: string;
  isHTTPS: boolean;
  username: string;
  password: string;
  baseUrl: string;
};

export class UnraidClient {
  private cookie: string | undefined;
  private csrfToken: string | undefined;
  private csrfTokenPromise: Promise<void> | null = null;
  private unraidURI: string;
  private cfg: UnraidConfig;

  constructor(cfg: UnraidConfig) {
    this.cfg = cfg;
    this.unraidURI = `http${cfg.isHTTPS ? 's' : ''}://${cfg.ip}${cfg.port ? `:${cfg.port}` : ''}`;
    initGraphQLClient(() => this.cookie, this.unraidURI);
  }

  getCookie(): string | undefined {
    return this.cookie;
  }

  async login(): Promise<void> {
    const response = await fetch(`${this.unraidURI}/login`, {
      method: 'post',
      body: new URLSearchParams({
        username: this.cfg.username,
        password: this.cfg.password,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
      },
      redirect: 'manual',
    });
    const cookies = response.headers.getSetCookie?.() ?? [];
    if (!cookies.length) {
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        const unraidCookie = setCookieHeader.split(',').find((c: string) => c.trim().startsWith('unraid_'));
        if (unraidCookie) {
          this.cookie = unraidCookie.trim();
          return;
        }
      }
      throw new ForbiddenError('Unable to login to unraid');
    }
    const unraidCookie = cookies.find((cookie) => cookie.startsWith('unraid_'));
    if (!unraidCookie) throw new ForbiddenError('Unable to login to unraid');
    this.cookie = unraidCookie;
  }

  private async getCSRFTokenUnraid(): Promise<void> {
    if (!this.cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const response = await fetch(`${this.unraidURI}/Dashboard`, {
      headers: { Cookie: this.cookie },
    });
    const html = await response.text();
    const { load } = await import('cheerio');
    const $ = load(html);
    this.csrfToken = $('input[name="csrf_token"]').val();
  }

  async ensureCSRFToken(): Promise<void> {
    if (this.csrfToken) return;
    if (this.csrfTokenPromise) return this.csrfTokenPromise;
    this.csrfTokenPromise = this.getCSRFTokenUnraid();
    await this.csrfTokenPromise;
    this.csrfTokenPromise = null;
  }

  async requestVMajax(unraidVMId: string, action: string): Promise<unknown> {
    if (!this.cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const response = await fetch(
      `${this.unraidURI}/plugins/dynamix.vm.manager/include/VMajax.php`,
      {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.cookie,
        },
        body: new URLSearchParams({
          uuid: unraidVMId,
          action,
          csrf_token: this.csrfToken || '',
        }),
      }
    );
    const data = await response.json() as { error?: string };
    if (data?.error) {
      throw new BadRequestError(data.error);
    }
    return data;
  }

  private async getVMHTML(): Promise<string> {
    if (!this.cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const VMMachinesURL = `${this.unraidURI}/plugins/dynamix.vm.manager/include/VMMachines.php`;
    const response = await fetch(VMMachinesURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': this.cookie,
      },
    });
    return response.text();
  }

  async getVMsUnraid(): Promise<IVM[]> {
    const vmsHTML = await this.getVMHTML();
    return extractVMsFromHTML(vmsHTML, this.unraidURI);
  }

  async getVMByIdUnraid(unraidVMId: string): Promise<IVM | undefined> {
    const unraidVMs = await this.getVMsUnraid();
    return unraidVMs.find((vm) => vm.id === unraidVMId);
  }

  async getVMsByIdsUnraid(unraidVMIds: string[]): Promise<IVM[]> {
    const unraidVMs = await this.getVMsUnraid();
    return unraidVMs.filter((vm) => unraidVMIds.includes(vm.id));
  }

  async startVMUnraid(unraidVMId: string): Promise<boolean> {
    return startVM(unraidVMId);
  }

  async stopVMUnraid(unraidVMId: string): Promise<boolean> {
    return stopVM(unraidVMId);
  }

  async forceStopVMUnraid(unraidVMId: string): Promise<boolean> {
    return forceStopVM(unraidVMId);
  }

  async restartVMUnraid(unraidVMId: string): Promise<boolean> {
    return rebootVM(unraidVMId);
  }

  async pauseVMUnraid(unraidVMId: string): Promise<boolean> {
    return pauseVM(unraidVMId);
  }

  async resumeVMUnraid(unraidVMId: string): Promise<boolean> {
    return resumeVM(unraidVMId);
  }

  async hibernateVMUnraid(unraidVMId: string): Promise<unknown> {
    await this.ensureCSRFToken();
    return this.requestVMajax(unraidVMId, 'domain-pmsuspend');
  }

  async removeVMUnraid(unraidVMId: string): Promise<unknown> {
    await this.ensureCSRFToken();
    return this.requestVMajax(unraidVMId, 'domain-undefine');
  }

  async removeVMAndDisksUnraid(unraidVMId: string): Promise<unknown> {
    await this.ensureCSRFToken();
    return this.requestVMajax(unraidVMId, 'domain-delete');
  }
}
