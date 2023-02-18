import type { Component } from 'solid-js';

import styles from './Spinner.module.css';

export const Spinner: Component = () => {
  return (
    <div class={styles.spinnerContainer}>
      <div class={styles.spinner}></div>
    </div>

  );
};
