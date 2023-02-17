import type { Component } from 'solid-js';

import type { IVMStatus } from '../../types/IVMStatus';

import { VMStatus } from '../VMStatus/VMStatus';

import styles from './VMCard.module.css';

type IProps = {
  name: string
  status: IVMStatus
  os: string
  memory: string
  graphics: string
  storage: string
  cpus: string
  isAutoStart: boolean
  ip: string
}

export const VMCard: Component<IProps> = (props) => {
  return (
    <div class={styles.card}>
      {/* Name & Status */}
      <div class={styles.cardHeader}>
        <div class={styles.cardHeaderTitle}>{props.name ?? 'Not set'}</div>
        <VMStatus status={props.status} />
      </div>
      {/* Information (OS, Storage, Ram, etc) */}
      <div class={styles.information}>
        {/* Column 1 */}
        <div class={styles.informationColumn}>
          {/* Rows */}
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>OS</div>
            <div class={styles.informationRowDescription}>{props.os ?? 'Not set'}</div>
          </div>
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>Ram</div>
            <div class={styles.informationRowDescription}>{props.memory ?? 'Not set'}</div>
          </div>
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>Graphics</div>
            <div class={styles.informationRowDescription}>{props.graphics ?? 'Not set'}</div>
          </div>
        </div>
        {/* Column 2 */}
        <div class={styles.informationColumn}>
          {/* Rows */}
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>Storage</div>
            <div class={styles.informationRowDescription}>{props.storage ?? 'Not set'}</div>
          </div>
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>CPUs</div>
            <div class={styles.informationRowDescription}>{props.cpus ?? 'Not set'}</div>
          </div>
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>Auto Start</div>
            <div class={styles.informationRowDescription}>{JSON.stringify(props.isAutoStart)}</div>
          </div>
        </div>
        {/* Column 3 */}
        <div class={styles.informationColumn}>
          {/* Rows */}
          <div class={styles.informationRow}>
            <div class={styles.informationRowTitle}>IP</div>
            <div class={styles.informationRowDescription}>{props.ip ?? 'QEMU might need to be installed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
