import type { Component } from 'solid-js';

import type { IDropdownSection } from '../../types/IDropdownSection';
import type { IDropdownAction } from '../../types/IDropdownAction';

import styles from './Dropdown.module.css';

type Props = {
  sections: IDropdownSection[],
}

export const Dropdown: Component<Props> = (props: Props) => {
  return (
    <div class={styles.dropdownContainer}>
      {props.sections.map((section: IDropdownSection) => (
        <div class={styles.dropdownSection}>
          <div class={styles.dropdownSectionTitle}>{section.title}</div>
          <div class={styles.dropdownSectionList}>
            {section.actions.map((action: IDropdownAction) => (
              <button class={styles.dropdownSectionListItem}>
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
