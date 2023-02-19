import { Component } from 'solid-js';

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Icons
import { FiLogOut } from 'solid-icons/fi'

// Styles
import styles from './ProfileDropdown.module.css';

// Components
import { Dropdown } from '../Dropdown/Dropdown';

const sections: IDropdownSection[] = [
  {
    title: 'User',
    actions: [
      {
        text: 'Logout',
        Icon: FiLogOut,
      }
    ]
  }
]

export const ProfileDropdown: Component = () => {

  return (
    <Dropdown sections={sections} top={55} />
  );
};
