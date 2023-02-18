import { Component, Match, Switch } from 'solid-js';

import type { IDropdownSection } from '../../types/IDropdownSection';
import type { IDropdownAction } from '../../types/IDropdownAction';

import styles from './Dropdown.module.css';
import { Spinner } from '../Spinner/Spinner';

type Props = {
  sections: IDropdownSection[]
  isLoading?: boolean
  top?: number
}

export const Dropdown: Component<Props> = (props: Props) => {
  return (
    <div
      class={styles.dropdownContainer}
      style={top ? { top: `${props.top}px` } : {}}
    >
      <Switch>
        <Match when={props.isLoading}>
          <div
            style={{
              padding: '20px'
            }}
          >
            <Spinner />
          </div>
        </Match>
        <Match when={!props.isLoading}>
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
        </Match>
      </Switch>
    </div>
  );
};
