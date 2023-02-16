import * as cheerio from 'cheerio';
import axios from 'axios';
import cache from 'memory-cache';

import { config } from '../config.js';
import { ForbiddenError } from './ErrorHandler.js';
import { IUnraidVM } from '../types/IUnraidVM.js';

const { unraid } = config;

const cookieState: any = {};

const setCookie = (cookie) => {
  cookieState.unraid = cookie;
}

const getCookie = () => {
  return cookieState?.unraid;
}

export const login = async () => {
  try {
    const response = await axios({
      url: `http://${unraid.ip}/login`,
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
  } catch (error) {
    console.error('ERROR - login():', error);
    throw error;
  }
}

const getVMsHTML = async () => {
  try {
    const cookie = getCookie();
    if (!cookie) {
      throw new ForbiddenError('Not authenticated with unraid');
    }
    const VMMachinesURL = `http://${unraid.ip}/plugins/dynamix.vm.manager/include/VMMachines.php`
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

/**
 * Note: We cache the response for 5 seconds as sometimes we call this function multiple times
 */
export const getVMsUnraid = async (): Promise<IUnraidVM[]> => {
  const cachedVms = cache.get('vms');
  if (cachedVms) {
    return cachedVms;
  }
  try {
    const vmsHTML = await getVMsHTML();
    
    const $ = cheerio.load(vmsHTML, { xmlMode: true });
    const vms: IUnraidVM[] = $('.sortable').map((i, el) => {
      const onclickAttr = $(el).find('.outer span.hand').attr('onclick');
      const parentId = $(el).attr('parent-id');

      const id = onclickAttr.match(/addVMContext\('.*?','(.*?)'/)[1];
      const name = $(el).find('.inner a').text();
      const graphics = $(el).find('td:nth-child(6)').text();
      const state = $(el).find('.state').text();
      const memory = $(el).find('td:nth-child(4)').text();
      const cpus = $(el).find('td:nth-child(3) a').text();
      const osImg = `http://${unraid.ip}${$(el).find('.outer span.hand img').attr('src')}`;
      const os = onclickAttr.match(/addVMContext\('.*?','.*?','(.*?)'/)[1];
      const isAutoStart = onclickAttr.includes('autoconnect=true');
      const storage = $(el).find('td:nth-child(5)').text().match(/\d+G/)[0];

      // IP
      const ips = []
      $(`[child-id="${parentId}"]`).find('tbody tr').each((index, element) => {
        const ipType = $(element).find('td:nth-child(3)').text().trim();
        const ipAddress = $(element).find('td:nth-child(4)').text().trim();
        const ipPrefix = $(element).find('td:nth-child(5)').text().trim();

        if (ipType === 'ipv4' || ipType === 'ipv6') {
          ips.push({ type: ipType, address: ipAddress, prefix: ipPrefix });
        }
      });

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
      }
    }).toArray()

    cache.put('vms', vms, 60000); // Cache the response for 60 seconds

    return vms;
  } catch (error) {
    console.error('ERROR - getVMs()', error);
    throw error;
  }
}

export const getVMsByIdsUnraid = async (unraidVMIds) => {
  try {
    const unraidVMs = await getVMsUnraid();
    const filteredUnraidVMs = unraidVMs.filter((unraidVM) => unraidVMIds.includes(unraidVM.id));
    return filteredUnraidVMs;
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
