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
        Icon: AiOutlineUser,
      },
      {
        text: 'Change Password',
        Icon: RiSystemLockPasswordLine,
      },
      {
        text: 'Delete',
        Icon: RiSystemDeleteBin2Line,
      },
    ],
  },
  {
    title: 'VM',
    actions: [
      {
        text: 'VMs',
        Icon: FiServer,
      },
    ],
  },
];

export const UserDropdown: Component = () => {

  return (
    <Dropdown sections={sections} top={90}  />
  );
};
