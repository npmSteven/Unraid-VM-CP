import { Component, createSignal, onMount } from 'solid-js';

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
        Icon: FiLogOut,
      }
    ]
  }
]

export const ProfileDropdown: Component = () => {

  const [isLoading, setIsLoading] = createSignal(true);

  onMount(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  })

  return (
    <Dropdown sections={sections} isLoading={isLoading()} top={55} />
  );
};
