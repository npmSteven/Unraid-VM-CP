import { IconTypes } from 'solid-icons';
import { Component, JSX, Match, Switch } from 'solid-js';
import { Spinner } from '../Spinner/Spinner';

import styles from './Button.module.css';

type Props = {
  text: string
  Icon: IconTypes
  type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['type']
  class?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['class']
  isLoading?: boolean
}

export const Button: Component<Props> = (props) => {
  const { Icon } = props;
  return (
    <button class={`${styles.button} ${props.class ? props.class : ''}`} type={props.type || 'button'}>
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
