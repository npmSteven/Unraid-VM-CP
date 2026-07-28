import { load } from 'cheerio';
import { IUnraidVM } from '../types/IUnraidVM.js';

export const extractVMsFromHTML = (vmsHTML: string, unraidIP: string): IUnraidVM[] => {
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
