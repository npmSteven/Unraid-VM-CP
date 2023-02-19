import { Component } from 'solid-js';

// Types
import type { IVMStatus } from '../../types/IVMStatus';

// Styles
import styles from './VMStatus.module.css';

type Props = {
  status: IVMStatus;
}

export const VMStatus: Component<Props> = (props) => {
  const { status } = props;

  const getStatusClass = () => {
    switch (status) {
      case 'started':
        return styles.started;
      case 'stopped':
        return styles.stopped;
      case 'paused':
        return styles.paused;
      default:
        return styles.unavailable;
    }
  }

  return (
    <div class={`${styles.status} ${getStatusClass()}`}>
    </div>
  );
};
