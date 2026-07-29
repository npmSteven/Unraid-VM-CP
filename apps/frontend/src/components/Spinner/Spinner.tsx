import { Component } from 'solid-js';

import styles from './Spinner.module.css';

type Props = {
  size?: number
}

export const Spinner: Component = (props: Props) => {
  return (
    <div class={styles.spinnerContainer}>
      <div
        class={styles.spinner}
        style={{
          height: `${props.size ?? 40}px`,
          width: `${props.size ?? 40}px`,
        }}
      ></div>
    </div>
  );
};
