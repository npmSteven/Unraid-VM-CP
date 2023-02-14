import * as cheerio from 'cheerio';
import axios from 'axios';
import { config } from '../config.js';

const { unraid } = config;

const login = async () => {
  try {
    const loginURL = `http://${unraid.ip}/login`

  } catch (error) {
    console.error('ERROR - login():', error);
    throw error;
  }
}

const getVMsHTML = () => {
  // const VMMachinesURL = `http://${unraid.ip}/plugins/dynamix.vm.manager/include/VMMachines.php`

  // axios({
  //   url: VMMachinesURL,
  //   headers: {
  //     Cookie: ''
  //   }
  // })
}

export const getVMs = () => {
  try {

    const $ = cheerio.load('vmsHTML', { xmlMode: true });
    const vms = $('.sortable').map((i, el) => {
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


    return vms;
  } catch (error) {
    console.error('ERROR - getVMs()', error);
    throw error;
  }
}
