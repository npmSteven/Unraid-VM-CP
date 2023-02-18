import { Component } from 'solid-js';

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

const sections: IDropdownSection[] = [
  {
    title: 'Admin',
    actions: [
      {
        text: 'Change Username',
        icon: <AiOutlineUser />,
      },
      {
        text: 'Change Password',
        icon: <RiSystemLockPasswordLine />,
      },
      {
        text: 'Delete',
        icon: <RiSystemDeleteBin2Line />,
      },
    ],
  },
  {
    title: 'VM',
    actions: [
      {
        text: 'VMs',
        icon: <FiServer />,
      },
    ],
  },
];

export const UserDropdown: Component = () => {

  return (
    <Dropdown sections={sections} top={90}  />
  );
};
