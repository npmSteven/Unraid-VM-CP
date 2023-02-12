export type IUserVMPermissions = {
  id: string;
  vmId: string;
  userId: string;
  canStart: boolean;
  canStop: boolean;
  canRemoveVM: boolean;
  canRemoveVMAndDisks: boolean;
  canForceStop: boolean;
  canRestart: boolean;
  canPause: boolean;
  canHibernate: boolean;
  canResume: boolean;
  createdAt: number;
  updatedAt: number;
}
