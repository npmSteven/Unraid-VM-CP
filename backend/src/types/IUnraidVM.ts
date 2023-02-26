import { IUserVMPermissions } from './IUserVMPermissions.js';

export type IUnraidVM = {
  id: string
  name: string 
  state: string
  graphics: string
  memory: string
  cpus: string | number
  storage: string
  os: string
  ips: any[]
  vnc: string
  osImg: string
  isAutoStart: boolean
  permissions?: IUserVMPermissions
}
