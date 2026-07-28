import { describe, it, expect } from "bun:test";
import { extractVMsFromHTML } from "../src/services/extract-vms.js";
import { unraidVMsResponse1, unraidVMsResponse2 } from '../test_data/unraid_vms_responses.js';

describe('extractVMsFromHTML', () => {
  it('should return array of vms with correct props response 1', () => {
    const vms = extractVMsFromHTML(unraidVMsResponse1, 'http://1.1.1.1');
    expect(vms).toHaveLength(4);
    expect(vms).toEqual([
      {
        id: 'cf088cf9-8a6f-b5a2-67bd-d4f784306f2a',
        name: 'CentOS',
        state: 'shutoff',
        graphics: 'VNC:auto',
        memory: '1024M',
        cpus: '1',
        storage: '50G',
        os: 'CentOS',
        ips: [],
        osImg: 'http://1.1.1.1/plugins/dynamix.vm.manager/templates/images/centos.png',
        isAutoStart: false,
        vnc: ''
      },
      {
        id: 'e416981a-5110-d3f0-bda0-f8d3a5b9dda6',
        name: 'CoreOS',
        state: 'shutoff',
        graphics: 'VNC:auto',
        memory: '1024M',
        cpus: '1',
        storage: '10G',
        os: 'CoreOS',
        ips: [],
        osImg: 'http://1.1.1.1/plugins/dynamix.vm.manager/templates/images/coreos.png',
        isAutoStart: false,
        vnc: ''
      },
      {
        id: 'f1626dbd-9eaa-218c-268d-9f73e2047057',
        name: 'Linux',
        state: 'shutoff',
        graphics: 'VNC:auto',
        memory: '1024M',
        cpus: '1',
        storage: '20G',
        os: 'Linux',
        ips: [],
        osImg: 'http://1.1.1.1/plugins/dynamix.vm.manager/templates/images/linux.png',
        isAutoStart: false,
        vnc: ''
      },
      {
        id: 'bf2cfa68-7d12-fa52-c4f6-50f1fa0a8735',
        name: 'Windows 11',
        state: 'shutoff',
        graphics: 'VNC:auto',
        memory: '4096M',
        cpus: '1',
        storage: '64G',
        os: 'Windows 11',
        ips: [],
        osImg: 'http://1.1.1.1/plugins/dynamix.vm.manager/templates/images/windows11.png',
        isAutoStart: false,
        vnc: ''
      }
    ])
  })

  it('should return array of vms with port response 1', () => {
    const vms = extractVMsFromHTML(unraidVMsResponse1, 'http://1.1.1.1:5686');
    expect(vms).toHaveLength(4);
    expect(vms[0].osImg).toBe('http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/centos.png');
    expect(vms[1].osImg).toBe('http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/coreos.png');
    expect(vms[2].osImg).toBe('http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/linux.png');
    expect(vms[3].osImg).toBe('http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/windows11.png');
  })

  it('should return array of vms with correct props response 2', () => {
    const vms = extractVMsFromHTML(unraidVMsResponse2, 'http://1.1.1.1');
    expect(vms).toHaveLength(6);
    expect(vms[0].id).toBe('fccdd36b-e706-9e64-cf96-a85048e34659');
    expect(vms[4].memory).toBe('4096M');
    expect(vms[3].state).toBe('running');
    expect(vms[3].isAutoStart).toBe(true);
  })
})
