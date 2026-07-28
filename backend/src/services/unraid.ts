import { config } from '../config.js';
import { BadRequestError, ForbiddenError } from './ErrorHandler.js';
import { IUnraidVM } from '../types/IUnraidVM.js';
import { startVM, stopVM, forceStopVM, rebootVM, pauseVM, resumeVM, initGraphQLClient } from './unraid-graphql.js';
import { extractVMsFromHTML } from './extract-vms.js';

const { unraid } = config;

const cookieState: { unraid?: string } = {};

const setCookie = (cookie: string) => {
  cookieState.unraid = cookie;
}

export const getCookie = () => {
  return cookieState?.unraid;
}

const csrfTokenState: { csrfToken?: string } = {};

const setCSRFToken = (csrfToken: string) => {
  csrfTokenState.csrfToken = csrfToken;
}

const getCSRFToken = () => {
  return csrfTokenState.csrfToken;
}

let csrfTokenPromise: Promise<void> | null = null;

const ensureCSRFToken = async () => {
  if (getCSRFToken()) return;
  if (csrfTokenPromise) return csrfTokenPromise;
  csrfTokenPromise = getCSRFTokenUnraid();
  await csrfTokenPromise;
  csrfTokenPromise = null;
}

initGraphQLClient(getCookie);

const unraidURI = `http${unraid.isHTTPS ? 's' : ''}://${unraid.ip}${unraid.port ? `:${unraid.port}` : ''}`;

const getCSRFTokenUnraid = async () => {
  try {
    const cookie = getCookie();
    if (!cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const response = await fetch(`${unraidURI}/Dashboard`, {
      headers: { Cookie: cookie },
    });
    const html = await response.text();
    const { load } = await import('cheerio');
    const $ = load(html);
    const csrfToken = $('input[name="csrf_token"]').val();
    setCSRFToken(csrfToken);
  } catch (error) {
    console.error('ERROR - getCSRFTokenUnraid():', error);
    throw error;
  }
}

export const login = async () => {
  try {
    const response = await fetch(`${unraidURI}/login`, {
      method: 'post',
      body: new URLSearchParams({
        username: unraid.username,
        password: unraid.password,
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
          setCookie(unraidCookie.trim());
          return;
        }
      }
      throw new ForbiddenError('Unable to login to unraid');
    }
    const unraidCookie = cookies.find((cookie) => cookie.startsWith('unraid_'));
    if (!unraidCookie) throw new ForbiddenError('Unable to login to unraid');
    setCookie(unraidCookie)
  } catch (error) {
    console.error('ERROR - login():', error);
    throw error;
  }
}

const VMajaxURL = `${unraidURI}/plugins/dynamix.vm.manager/include/VMajax.php`
const requestVMajax = async (unraidVMId: string, action: string) => {
  try {
    const cookie = getCookie();
    if (!cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const response = await fetch(VMajaxURL, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      },
      body: new URLSearchParams({
        uuid: unraidVMId,
        action: action,
        csrf_token: getCSRFToken() || '',
      }),
    });
    const data = await response.json();
    if (data?.error) {
      throw new BadRequestError(data.error)
    }
    return data;
  } catch (error) {
    console.error('ERROR - requestVMajax():', error);
    throw error;
  }
}

export const startVMUnraid = async (unraidVMId: string) => {
  try {
    return await startVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - startVMUnraid():', error);
    throw error;
  }
}

export const stopVMUnraid = async (unraidVMId: string) => {
  try {
    return await stopVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - stopVMUnraid():', error);
    throw error;
  }
}

export const forceStopVMUnraid = async (unraidVMId: string) => {
  try {
    return await forceStopVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - forceStopVMUnraid():', error);
    throw error;
  }
}

export const restartVMUnraid = async (unraidVMId: string) => {
  try {
    return await rebootVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - restartVMUnraid():', error);
    throw error;
  }
}

export const pauseVMUnraid = async (unraidVMId: string) => {
  try {
    return await pauseVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - pauseVMUnraid():', error);
    throw error;
  }
}

export const resumeVMUnraid = async (unraidVMId: string) => {
  try {
    return await resumeVM(unraidVMId);
  } catch (error) {
    console.error('ERROR - resumeVMUnraid():', error);
    throw error;
  }
}

export const hibernateVMUnraid = async (unraidVMId: string) => {
  try {
    await ensureCSRFToken();
    return requestVMajax(unraidVMId, 'domain-pmsuspend');
  } catch (error) {
    console.error('ERROR - hibernateVMUnraid():', error);
    throw error;
  }
}

export const removeVMUnraid = async (unraidVMId: string) => {
  try {
    await ensureCSRFToken();
    return requestVMajax(unraidVMId, 'domain-undefine');
  } catch (error) {
    console.error('ERROR - removeVMUnraid():', error);
    throw error;
  }
}

export const removeVMAndDisksVMUnraid = async (unraidVMId: string) => {
  try {
    await ensureCSRFToken();
    return requestVMajax(unraidVMId, 'domain-delete');
  } catch (error) {
    console.error('ERROR - removeVMAndDisksVMUnraid():', error);
    throw error;
  }
}

const getVMsHTML = async () => {
  try {
    const cookie = getCookie();
    if (!cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const VMMachinesURL = `${unraidURI}/plugins/dynamix.vm.manager/include/VMMachines.php`
    const response = await fetch(VMMachinesURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      },
    });
    return response.text();
  } catch (error) {
    console.error('ERROR - getVMsHTML()', error);
    throw error;
  }
}

export const getVMsUnraid = async (): Promise<IUnraidVM[]> => {
  try {
    const vmsHTML = await getVMsHTML();
    return extractVMsFromHTML(vmsHTML, unraidURI);
  } catch (error) {
    console.error('ERROR - getVMs()', error);
    throw error;
  }
}

export const getVMsByIdsUnraid = async (unraidVMIds: string[]) => {
  try {
    const unraidVMs = await getVMsUnraid();
    return unraidVMs.filter((unraidVM) => unraidVMIds.includes(unraidVM.id));
  } catch (error) {
    console.error('ERROR - getVMsByIds()', error);
    throw error;
  }
}

export const getVMByIdUnraid = async (unraidVMId: string) => {
  try {
    const unraidVMs = await getVMsUnraid();
    return unraidVMs.find((unraidVM) => unraidVM.id === unraidVMId);
  } catch (error) {
    console.error('ERROR - getVMsByIds()', error);
    throw error;
  }
}
