import type { Component } from 'solid-js';
import { IVMStatus } from '../../types/IVMStatus';

import styles from './VMStatus.module.css';

type IProps = {
  status: IVMStatus;
}

export const VMStatus: Component<IProps> = (props) => {
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
      {/* {props.status} */}
      {/* {getStatusClass()} */}
    </div>
  );
};
