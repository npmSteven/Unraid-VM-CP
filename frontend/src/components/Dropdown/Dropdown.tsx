import { Component, Match, Switch } from 'solid-js';

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';
import type { IDropdownAction } from '../../types/IDropdownAction';

// Styles
import styles from './Dropdown.module.css';

// Components
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
                {section.actions.map((action: IDropdownAction) => {
                  const { Icon } = action;
                  return (
                    <button class={styles.dropdownSectionListItem}>
                      <Icon size={18} />
                      <span>{action.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </Match>
      </Switch>
    </div>
  );
};
