import { Component, createSignal } from 'solid-js';
import Dismiss from 'solid-dismiss';

// Icons
import { BsThreeDotsVertical } from 'solid-icons/bs';

// Components
import { UserDropdown } from '../UserDropdown/UserDropdown';

import styles from './UserCard.module.css';

export const UserCard: Component = () => {
  const [open, setOpen] = createSignal(false);
  let btnEl;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
      }}
    >
      <button
        class={styles.userCard}
        ref={btnEl}
      >
        <img class={styles.userImage} src="https://ui-avatars.com/api/?name=Steven&size=40" alt="Profile image" />
        <span class={styles.username}>Steven</span>
        <BsThreeDotsVertical size={24} />
      </button>
      <Dismiss
        menuButton={btnEl}
        open={open}
        setOpen={setOpen}
        closeWhenOverlayClicked={false}
      >
        <UserDropdown />
      </Dismiss>
    </div>
  );
};
