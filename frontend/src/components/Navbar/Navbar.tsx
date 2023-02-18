import type { Component } from 'solid-js';

import { FaSolidChevronDown } from 'solid-icons/fa'

import styles from './Navbar.module.css';

export const Navbar: Component = () => {
  return (
    <nav class={styles.nav}>
      {/* Left */}
      <div class={styles.brand}>
        UNRAID VM CP (Alpha)
      </div>
      {/* Right */}
      <div class={styles.content}>
        {/* Nav links */}
        <ul class={styles.links}>
          <li class={styles.link}>
            <a href="#">Users</a>
          </li>
          <li class={styles.link}>
            <a href="#">VMs</a>
          </li>
        </ul>
        {/* Profile */}
        <div class={styles.profile}>
          {/* Profile Icon */}
          <img class={styles.profileImage} src="https://ui-avatars.com/api/?name=Steven&size=25" alt="Profile image" />
          {/* Username */}
          <span class={styles.username}>Steven</span>
          {/* Dropdown */}
          <FaSolidChevronDown size={18} />
        </div>
      </div>
    </nav>
  );
};
