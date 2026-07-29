import type { IVM } from '@unraid-vm-cp/shared-types';

export function renderVMMachinesHtml(vms: IVM[], format: 'v6' | 'v7' = 'v6'): string {
  if (format === 'v7') {
    return renderVMMachinesV7Html(vms);
  }
  return renderVMMachinesV6Html(vms);
}

function renderVMMachinesV6Html(vms: IVM[]): string {
  return vms
    .map((vm) => {
      const autoConn = vm.isAutoStart ? ',autoconnect=true' : '';
      const onclick = `addVMContext('ctx','${vm.id}','${vm.os}','${vm.state}','${vm.vnc || ''}'${autoConn})`;
      const osImgPath = vm.osImg.startsWith('http')
        ? vm.osImg.substring(vm.osImg.indexOf('/plugins'))
        : vm.osImg;

      return `
<span class="outer">
  <span class="hand" onclick="${onclick}">
    <img src="${osImgPath.startsWith('/') ? '.' + osImgPath : osImgPath}" />
  </span>
  <span class="inner">
    <a href="#">${vm.name}</a>
  </span>
</span>
<a class="vcpu-${vm.id}">${vm.cpus}</a>
<div>Memory: ${vm.memory} Storage: 0 / ${vm.storage} Graphics: ${vm.graphics}</div>
`;
    })
    .join('\n');
}

function renderVMMachinesV7Html(vms: IVM[]): string {
  return vms
    .map((vm, index) => {
      const parentId = `vm-${index}`;
      const autoConn = vm.isAutoStart ? ',autoconnect=true' : '';
      const onclick = `addVMContext('ctx','${vm.id}','${vm.os}','${vm.state}','${vm.vnc || ''}'${autoConn})`;
      const osImgPath = vm.osImg.startsWith('http')
        ? vm.osImg.substring(vm.osImg.indexOf('/plugins'))
        : vm.osImg;

      const ipRows = (vm.ips || [])
        .map(
          (ip) => `
        <tr>
          <td></td><td></td>
          <td>${ip.type}</td>
          <td>${ip.address}</td>
          <td>${ip.prefix}</td>
        </tr>`
        )
        .join('');

      return `
<table parent-id="${parentId}">
  <tr>
    <td>
      <span class="outer">
        <span class="hand" onclick="${onclick}">
          <img src="${osImgPath.startsWith('/') ? '.' + osImgPath : osImgPath}" />
        </span>
        <span class="inner">
          <a href="#">${vm.name}</a>
        </span>
      </span>
      <a class="vcpu-${vm.id}">${vm.cpus}</a>
    </td>
    <td>2</td>
    <td>3</td>
    <td>${vm.memory}</td>
    <td>${vm.storage}</td>
    <td>${vm.graphics}</td>
  </tr>
</table>
<table child-id="${parentId}">
  <tbody>
    ${ipRows}
  </tbody>
</table>
`;
    })
    .join('\n');
}
