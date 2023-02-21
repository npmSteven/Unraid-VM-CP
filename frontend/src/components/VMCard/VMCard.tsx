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
  ip?: string
  isAdmin?: boolean
  permissions?: IPermissions
}

export const VMCard: Component<Props> = (props: Props): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  let btnEl;

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
            {renderInformationRow('IP', props.ip || 'QEMU Agent not found')}
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
            {!props.isAdmin && <VMDropdown id={props.id} name={props.name} status={props.status} permissions={props.permissions} />}
            {props.isAdmin && <VMAdminDropdown />}
          </Dismiss>
        </div>
      </div>
    </div>
  );
};
