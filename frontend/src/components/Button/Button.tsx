import { Component, JSX, Match, Switch } from 'solid-js';

// Types
import type { IconTypes } from 'solid-icons';

// Components
import { Spinner } from '../Spinner/Spinner';

// Styles
import styles from './Button.module.css';

type Props = {
  text: string
  Icon: IconTypes
  onClick: JSX.ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['type']
  class?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['class']
  isLoading?: boolean
  style?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['style']
  disabled?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['disabled']
}

export const Button: Component<Props> = (props) => {
  const { Icon } = props;
  return (
    <button
      onClick={props.onClick}
      style={props.style}
      class={`${styles.button} ${props.class ? props.class : ''}`} 
      type={props.type || 'button'}
      disabled={props.disabled}
    >
      <Switch>
        <Match when={!props.isLoading}>
          <Icon size={24} />
        </Match>
        <Match when={props.isLoading}>
          <Spinner size={16} />
        </Match>
      </Switch>
      <span class={styles.buttonText}>{props.text}</span>
    </button>
  );
};
