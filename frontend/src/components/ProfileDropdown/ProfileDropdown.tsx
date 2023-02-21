import { Component } from 'solid-js';

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Icons
import { FiLogOut } from 'solid-icons/fi'

// Styles
import styles from './ProfileDropdown.module.css';

// Components
import { Dropdown } from '../Dropdown/Dropdown';
import { useLogout } from '../../hooks/logout';


export const ProfileDropdown: Component = () => {
  
  const logout = useLogout();

  const sections: IDropdownSection[] = [
    {
      title: 'User',
      actions: [
        {
          text: 'Logout',
          Icon: FiLogOut,
          onClick: logout,
        }
      ]
    }
  ]

  return (
    <Dropdown sections={sections} top={55} />
  );
};
