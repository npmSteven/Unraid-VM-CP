import { Component, createSignal } from 'solid-js';
import Dismiss from 'solid-dismiss';

// Icons
import { BsThreeDotsVertical } from 'solid-icons/bs';

// Components
import { UserDropdown } from '../UserDropdown/UserDropdown';

// Styles
import styles from './UserCard.module.css';

type Props = {
  id: string
  username: string
}

export const UserCard: Component<Props> = (props: Props) => {
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
        <img class={styles.userImage} src={`https://ui-avatars.com/api/?name=${props.username}n&size=40`} alt="Profile image" />
        <span class={styles.username}>{props.username}</span>
        <BsThreeDotsVertical size={24} />
      </button>
      <Dismiss
        menuButton={btnEl}
        open={open}
        setOpen={setOpen}
        closeWhenOverlayClicked={false}
      >
        <UserDropdown id={props.id} />
      </Dismiss>
    </div>
  );
};
