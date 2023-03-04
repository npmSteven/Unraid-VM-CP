import { extractVMsFromHTML } from "../src/services/unraid"
import { unraidVMsResponse1, unraidVMsResponse2 } from '../test_data/unraid_vms_responses';
describe('Unraid', () => {
  describe('getVMsHTML()', () => {
    it('should return array of vms with correct props response 1', () => {
      const vms = extractVMsFromHTML(unraidVMsResponse1, '1.1.1.1');
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
      const vms = extractVMsFromHTML(unraidVMsResponse1, '1.1.1.1:5686');
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
          osImg: 'http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/centos.png',
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
          osImg: 'http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/coreos.png',
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
          osImg: 'http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/linux.png',
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
          osImg: 'http://1.1.1.1:5686/plugins/dynamix.vm.manager/templates/images/windows11.png',
          isAutoStart: false,
          vnc: ''
        }
      ])
    })
    it('should return array of vms with correct props response 2', () => {
      const vms = extractVMsFromHTML(unraidVMsResponse2, '1.1.1.1');
      expect(vms).toHaveLength(6);
      expect(vms).toEqual([
        {
          id: 'fccdd36b-e706-9e64-cf96-a85048e34659',
          name: 'CentOS7',
          state: 'shutoff',
          graphics: '',
          memory: '',
          cpus: '4',
          storage: '',
          os: 'CentOS',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/centos.png',
          isAutoStart: false,
          vnc: ''
        },
        {
          id: '52804273-0857-4f43-8120-ade58a19ce6b',
          name: 'OpenWrt',
          state: 'shutoff',
          graphics: '',
          memory: '',
          cpus: '2',
          storage: '',
          os: 'Linux',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/linux.png',
          isAutoStart: false,
          vnc: ''
        },
        {
          id: '30b9218b-efaa-1994-ca1f-eacf9dac62fe',
          name: 'UbuntuServer22',
          state: 'shutoff',
          graphics: '',
          memory: '',
          cpus: '4',
          storage: '',
          os: 'Ubuntu',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/ubuntu.png',
          isAutoStart: false,
          vnc: ''
        },
        {
          id: 'adc4b08b-5ac8-441f-c031-a99301bef01d',
          name: 'Windows 11',
          state: 'running',
          graphics: '',
          memory: '',
          cpus: '8',
          storage: '',
          os: 'Windows 11',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/windows11.png',
          isAutoStart: true,
          vnc: '/plugins/dynamix.vm.manager/vnc.html?v=1640104829&autoconnect=true&host=192.168.31.159&port=&path=/wsproxy/5700/'
        },
        {
          id: 'b45c87ee-acc9-7ccb-3d82-61c48cacb7c6',
          name: 'arpl-syno',
          state: 'shutoff',
          graphics: '',
          memory: '',
          cpus: '4',
          storage: '',
          os: 'Linux',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/DSM_Synology.png',
          isAutoStart: false,
          vnc: ''
        },
        {
          id: '163e419e-73cb-b673-1cbb-99f545dda025',
          name: 'syno918',
          state: 'shutoff',
          graphics: '',
          memory: '',
          cpus: '4',
          storage: '',
          os: 'Linux',
          ips: [],
          osImg: 'http://1.1.1.1./VMMachines.php_files/DSM_Synology.png',
          isAutoStart: false,
          vnc: ''
        }
      ])
    })
    
  })
})