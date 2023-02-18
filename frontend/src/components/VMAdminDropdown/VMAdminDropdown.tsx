import { Component } from 'solid-js';

// Components
import { Dropdown } from '../Dropdown/Dropdown';

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Icons
import { BiRegularUnlink } from 'solid-icons/bi'
import { SiOpenaccess } from 'solid-icons/si'

// Styles
import styles from './VMAdminDropdown.module.css';

const sections: IDropdownSection[] = [
  {
    title: 'VM',
    actions: [
      {
        text: 'Unlink',
        icon: <BiRegularUnlink size={18} />,
      },
      {
        text: 'Permissions',
        icon: <SiOpenaccess size={18} />,
      }
    ]
  }
]

export const VMAdminDropdown: Component = () => {

  return (
    <Dropdown sections={sections} top={55} />
  );
};
