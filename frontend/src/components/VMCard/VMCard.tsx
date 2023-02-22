import { Component, createSignal, JSX } from 'solid-js';
import Dismiss from 'solid-dismiss';

// Icons
import { BsThreeDotsVertical } from 'solid-icons/bs'

// Types
import type { IVMStatus } from '../../types/IVMStatus';

// Styles
import styles from './VMCard.module.css';

// Components
import { VMStatus } from '../VMStatus/VMStatus';
import { VMDropdown } from '../VMDropdown/VMDropdown';
import { VMAdminDropdown } from '../VMAdminDropdown/VMAdminDropdown';
import { IPermissions } from '../../types/IPermissions';
import { useVMActions } from '../../hooks/vm';

type Props = {
  id: string
  name: string
  status: IVMStatus
  os: string
  memory: string
  graphics: string
  storage: string
  cpus: string
  isAutoStart: boolean
  userId?: string | undefined
  ip?: string
  isAdmin?: boolean
  permissions?: IPermissions
}

export const VMCard: Component<Props> = (props: Props): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  let btnEl;

  const { startVM, stopVM, restartVM, unlinkVM, isLoading } = useVMActions(props.id, props.name);

  const renderInformationRow = (title: string, description: string) => (
    <div class={styles.informationRow}>
      <div class={styles.informationRowTitle}>{title}</div>
      <div class={styles.informationRowDescription}>{description ?? 'Not set'}</div>
    </div>
  );

  return (
    <div class={styles.card}>
      <div class={styles.cardContainer}>
        <div class={styles.cardHeader}>
          <div class={styles.cardHeaderTitle}>{props.name || 'Not set'}</div>
        </div>
        <div class={styles.information}>
          <div class={styles.informationColumn}>
            {renderInformationRow('OS', props.os)}
            {renderInformationRow('Ram', props.memory)}
            {renderInformationRow('Graphics', props.graphics)}
          </div>
          <div class={styles.informationColumn}>
            {renderInformationRow('Storage', props.storage)}
            {renderInformationRow('CPUs', props.cpus)}
            {renderInformationRow('Auto Start', JSON.stringify(props.isAutoStart))}
          </div>
          <div class={styles.informationColumn}>
            {renderInformationRow('IP', props.ip || '')}
          </div>
        </div>
      </div>
      <div class={styles.statusContainer}>
        <VMStatus status={props.status} />
        <div
          style={{ position: 'relative' }}
        >
          <button class={styles.actionButton} ref={btnEl}>
            <BsThreeDotsVertical size={24} />
          </button>
          <Dismiss
            menuButton={btnEl}
            open={open}
            setOpen={setOpen}
            closeWhenOverlayClicked={false}
          >
            {!props.isAdmin && <VMDropdown restartVM={restartVM} isLoading={isLoading} startVM={startVM} stopVM={stopVM} status={props.status} permissions={props.permissions} />}
            {props.isAdmin && <VMAdminDropdown userId={props?.userId} id={props.id} unlinkVM={unlinkVM} isLoading={isLoading} />}
          </Dismiss>
        </div>
      </div>
    </div>
  );
};
