import { Component, createSignal } from 'solid-js';
import Dismiss from 'solid-dismiss';

// Icons
import { FaSolidChevronDown } from 'solid-icons/fa'

// Styles
import styles from './Navbar.module.css';

// Components
import { ProfileDropdown } from '../ProfileDropdown/ProfileDropdown';
import { A } from '@solidjs/router';
import { useUser } from '../../contexts/user';

export const Navbar: Component = () => {
  const { isUnraidUser, user } = useUser()
  const [open, setOpen] = createSignal(false);
  let btnEl;

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
          {isUnraidUser() && <A class={styles.link} href="/users">Users</A>}
          <A class={styles.link} href="/vms">VMs</A>
        </ul>
        {/* Profile */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
          }}
        >
          <button class={styles.profile} ref={btnEl}>
            {/* Profile Icon */}
            <img class={styles.profileImage} src={`https://ui-avatars.com/api/?name=${user()?.username || user()?.id}&size=25`} alt="Profile image" />
            {/* Username */}
            <span class={styles.username}>{user()?.username || user()?.id}</span>
            {/* Dropdown */}
            <FaSolidChevronDown size={18} />
          </button>
          <Dismiss
            menuButton={btnEl}
            open={open}
            setOpen={setOpen}
            closeWhenOverlayClicked={false}
          >
            <ProfileDropdown />
          </Dismiss>
        </div>
      </div>
    </nav>
  );
};
