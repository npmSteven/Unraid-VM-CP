import { Component, createSignal, JSX } from 'solid-js';
import Dismiss from 'solid-dismiss';

import { BsThreeDotsVertical } from 'solid-icons/bs'

import { IVMStatus } from '../../types/IVMStatus';

import { VMStatus } from '../VMStatus/VMStatus';

import styles from './VMCard.module.css';
import { VMDropdown } from '../VMDropdown/VMDropdown';
import { VMAdminDropdown } from '../VMAdminDropdown/VMAdminDropdown';

type Props = {
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
            {!props.isAdmin && <VMDropdown status={props.status} />}
            {props.isAdmin && <VMAdminDropdown />}
          </Dismiss>
        </div>
      </div>
    </div>
  );
};
