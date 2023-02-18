import type { Component } from 'solid-js';

import type { IDropdownSection } from '../../types/IDropdownSection';

import { FiLogOut } from 'solid-icons/fi'

import styles from './ProfileDropdown.module.css';
import { Dropdown } from '../Dropdown/Dropdown';

const sections: IDropdownSection[] = [
  {
    title: 'User',
    actions: [
      {
        text: 'Logout',
        icon: <FiLogOut size={18} />,
      }
    ]
  }
]

export const ProfileDropdown: Component = () => {
  return (
    <Dropdown sections={sections} />
  );
};
