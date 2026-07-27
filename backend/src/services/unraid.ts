import {load} from 'cheerio';
import axios from 'axios';

import { config } from '../config.js';
import { BadRequestError, ForbiddenError } from './ErrorHandler.js';
import { IUnraidVM } from '../types/IUnraidVM.js';

const { unraid } = config;

const cookieState: any = {};

const setCookie = (cookie) => {
  cookieState.unraid = cookie;
}

const getCookie = () => {
  return cookieState?.unraid;
}

const csrfTokenState: any = {};

const setCSRFToken = (csrfToken) => {
  csrfTokenState.csrfToken = csrfToken;
}

const getCSRFToken = () => {
  return csrfTokenState.csrfToken;
}

const unraidURI = `http${unraid.isHTTPS ? 's' : ''}://${unraid.ip}${unraid.port ? `:${unraid.port}` : ''}`;

const getCSRFTokenUnraid = async () => {
  try {
    const cookie = getCookie();
    if (!cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const response = await axios({
      url: `${unraidURI}/Dashboard`,
      headers: {
        Cookie: cookie,
      }
    });
    const $ = load(response.data);
    const csrfToken = $('input[name="csrf_token"]').val();
    setCSRFToken(csrfToken);
  } catch (error) {
    console.error('ERROR - getCSRFTokenUnraid():', error);
    throw error;
  }
}

export const login = async () => {
  try {
    const response = await axios({
      url: `${unraidURI}/login`,
      method: 'post',
      data: {
        username: unraid.username,
        password: unraid.password,
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 303,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
      },
      responseType: 'stream',
    });
    const cookies = response.headers['set-cookie'];
    if (!cookies) throw new ForbiddenError('Unable to login to unraid');
    const unraidCookie = cookies.find((cookie) => cookie.startsWith('unraid_'));
    setCookie(unraidCookie)
    await getCSRFTokenUnraid();
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
    const response = await axios({
      url: VMajaxURL,
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      },
      data: {
        uuid: unraidVMId,
        action: action,
        csrf_token: getCSRFToken()
      }
    })
    if (response?.data?.error) {
      throw new BadRequestError(response.data.error)
    }
    return response.data;
  } catch (error) {
    console.error('ERROR - requestVMajax():', error);
    throw error;
  }
}

export const startVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-start')
  } catch (error) {
    console.error('ERROR - startVMUnraid():', error);
    throw error;
  }
}

export const stopVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-stop');
  } catch (error) {
    console.error('ERROR - stopVMUnraid():', error);
    throw error;
  }
}

export const removeVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-undefine');
  } catch (error) {
    console.error('ERROR - removeVMUnraid():', error);
    throw error;
  }
}

export const removeVMAndDisksVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-delete');
  } catch (error) {
    console.error('ERROR - removeVMAndDisksVMUnraid():', error);
    throw error;
  }
}

export const forceStopVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-destroy');
  } catch (error) {
    console.error('ERROR - forceStopVMUnraid():', error);
    throw error;
  }
}

export const restartVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-restart');
  } catch (error) {
    console.error('ERROR - restartVMUnraid():', error);
    throw error;
  }
}

export const pauseVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-pause');
  } catch (error) {
    console.error('ERROR - pauseVMUnraid():', error);
    throw error;
  }
}

export const resumeVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-resume');
  } catch (error) {
    console.error('ERROR - resumeVMUnraid():', error);
    throw error;
  }
}

export const hibernateVMUnraid = async (unraidVMId: string) => {
  try {
    return requestVMajax(unraidVMId, 'domain-pmsuspend');
  } catch (error) {
    console.error('ERROR - hibernateVMUnraid():', error);
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
    const response = await axios({
      url: VMMachinesURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      },
    })
    return response.data;
  } catch (error) {
    console.error('ERROR - getVMsHTML()', error);
    throw error;
  }
}

export const extractVMsFromHTML = (vmsHTML, unraidIP) => {
  const $ = load(vmsHTML, { xmlMode: true });
  const hasParentId = $('[parent-id]').length > 0;
  const vmSections = hasParentId ? [] : vmsHTML.split(/<span class="outer">/).slice(1);

  const vms: IUnraidVM[] = $('.outer').map((i, el) => {
    const onclickAttr = $(el).find('span.hand').attr('onclick');

    const id = onclickAttr.match(/addVMContext\('.*?','(.*?)'/)[1];
    const name = $(el).find('.inner a').text();
    const cpus = $(`a.vcpu-${id}`).text();

    let imgSrc = $(el).find('span.hand img').attr('src');
    if (imgSrc && imgSrc.startsWith('./')) {
      imgSrc = imgSrc.substring(1);
    }
    const osImg = `${unraidIP}${imgSrc}`;

    const os = onclickAttr.match(/addVMContext\('.*?','.*?','(.*?)'/)[1];
    const vnc = onclickAttr.match(/addVMContext\('.*?','.*?','.*?','.*?','(.*?)'/)[1];
    const state = onclickAttr.match(/addVMContext\('.*?','.*?','.*?','(.*?)'/)[1];
    const isAutoStart = onclickAttr.includes('autoconnect=true');

    let graphics: string;
    let memory: string;
    let storage: string;
    let ips: { type: string; address: string; prefix: string }[];

    if (hasParentId) {
      const parentId = $(el).parent().parent().attr('parent-id');
      const sortableEl = $(`[parent-id="${parentId}"]`);
      graphics = $(sortableEl).find('td:nth-child(6)').text();
      memory = $(sortableEl).find('td:nth-child(4)').text();
      storage = $(sortableEl).find('td:nth-child(5)').text().match(/\d+G/)?.[0] || '';

      ips = [];
      $(`[child-id="${parentId}"]`).find('tbody tr').each((_, element) => {
        const ipType = $(element).find('td:nth-child(3)').text().trim();
        const ipAddress = $(element).find('td:nth-child(4)').text().trim();
        const ipPrefix = $(element).find('td:nth-child(5)').text().trim();

        if (ipType === 'ipv4' || ipType === 'ipv6') {
          ips.push({ type: ipType, address: ipAddress, prefix: ipPrefix });
        }
      });
    } else {
      const section = vmSections[i] || '';
      const nextOuter = section.indexOf('<span class="outer">');
      const vmHtml = nextOuter > 0 ? section.substring(0, nextOuter) : section;

      const memMatch = vmHtml.match(/(\d+M)/);
      const storMatch = vmHtml.match(/\d+\s*\/\s*(\d+G)/);
      const gfxMatch = vmHtml.match(/(VNC:\w*)/);

      memory = memMatch ? memMatch[1] : '';
      storage = storMatch ? storMatch[1] : '';
      graphics = gfxMatch ? gfxMatch[1] : '';
      ips = [];
    }

    return {
      id,
      name,
      state,
      graphics,
      memory,
      cpus,
      storage,
      os,
      ips,
      osImg,
      isAutoStart,
      vnc,
    }
  }).toArray()
  return vms;
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

export const getVMsByIdsUnraid = async (unraidVMIds) => {
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
