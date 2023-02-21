export type IPermissions = {
  id: string
  vmId: string
  userId: string
  canStart: boolean
  canStop: boolean
  canRemoveVM: boolean
  canRemoveVMAndDisks: boolean
  canForceStop: boolean
  canPause: boolean
  canRestart: boolean
  canHibernate: boolean
  canResume: boolean
  createdAt: number
  updatedAt: number
}