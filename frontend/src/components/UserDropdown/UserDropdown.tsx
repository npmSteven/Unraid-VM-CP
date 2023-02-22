import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// Icons
import { AiOutlineUser } from 'solid-icons/ai';
import { FiServer } from 'solid-icons/fi';
import { RiSystemDeleteBin2Line, RiSystemLockPasswordLine } from 'solid-icons/ri'

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Components
import { Dropdown } from '../Dropdown/Dropdown';

// Styles
import styles from './UserDropdown.module.css';

type Props = {
  id: string
}

export const UserDropdown: Component<Props> = (props: Props) => {

  const navigate = useNavigate();

  const goToUserVMs = () => {
    navigate(`/users/${props.id}/vms`)
  }

  const sections: IDropdownSection[] = [
    {
      title: 'Admin',
      actions: [
        {
          text: 'Change Username',
          Icon: AiOutlineUser,
          onClick: () => {},
        },
        {
          text: 'Change Password',
          Icon: RiSystemLockPasswordLine,
          onClick: () => {},
        },
        {
          text: 'Delete',
          Icon: RiSystemDeleteBin2Line,
          onClick: () => {},
        },
      ],
    },
    {
      title: 'VM',
      actions: [
        {
          text: 'VMs',
          Icon: FiServer,
          onClick: goToUserVMs,
        },
      ],
    },
  ];


  return (
    <Dropdown sections={sections} top={70}  />
  );
};
