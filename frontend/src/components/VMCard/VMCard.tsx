import type { Component } from 'solid-js';
import { VMStatus } from '../VMStatus/VMStatus';

import styles from './VMCard.module.css';

export const VMCard: Component = () => {
  return (
    <div class={styles.card}>
      {/* Name & Status */}
      <div class={styles.cardHeader}>
        <div class={styles.cardHeaderTitle}>Steven-PC</div>
        <VMStatus status='started' />
      </div>
      {/* Information (OS, Storage, Ram, etc) */}
      <div>
        
      </div>
    </div>
  );
};
