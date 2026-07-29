export const VM_PERMISSION_KEYS = [
  'canStart', 'canStop', 'canRestart', 'canPause', 'canResume',
  'canHibernate', 'canForceStop', 'canRemoveVM', 'canRemoveVMAndDisks',
] as const
export type VMPermissionKey = typeof VM_PERMISSION_KEYS[number]

export const VM_ACTIONS = [
  'start', 'stop', 'restart', 'pause', 'resume',
  'hibernate', 'force-stop', 'remove-vm', 'remove-vm-and-disks',
] as const
export type VMAction = typeof VM_ACTIONS[number]

export type VMState =
  | 'nostate' | 'running' | 'blocked' | 'paused' | 'shutdown'
  | 'shutoff' | 'crashed' | 'pmsuspended' | 'idle' | 'unknown'

export interface IVM {
  id: string
  name: string
  state: VMState
  graphics: string
  memory: string
  cpus: string | number
  storage: string
  os: string
  ips: { type: string; address: string; prefix: string }[]
  vnc: string
  osImg: string
  isAutoStart: boolean
  permissions?: IVMPermissions
}

export interface IVMPermissions {
  id: string
  vmId: string
  userId: string
  canStart: boolean
  canStop: boolean
  canRemoveVM: boolean
  canRemoveVMAndDisks: boolean
  canForceStop: boolean
  canRestart: boolean
  canPause: boolean
  canHibernate: boolean
  canResume: boolean
  createdAt: number
  updatedAt: number
}

export interface IResponse<T = unknown> {
  success: boolean
  payload: T
}

export interface IUser {
  id: string
  username: string
  password: string
  createdAt: number
  updatedAt: number
}

export type ISanitisedUser = Omit<IUser, 'password'>

export interface IJWTPayload {
  isUnraidUser: boolean
  id: string
}
