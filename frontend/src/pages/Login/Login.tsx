import type { Component } from 'solid-js';
import { createForm, Form, Field } from '@modular-forms/solid';
import { BiRegularLogInCircle } from 'solid-icons/bi'

import styles from './Login.module.css';
import { Button } from '../../components/Button/Button';

type ILoginForm = {
  username: string;
  password: string;
};

export const Login: Component = () => {
  const loginForm = createForm<ILoginForm>();

  return (
    <div class={styles.login}>



      {/* Login Form */}
      <Form class={styles.form} of={loginForm} onSubmit={() => console.log(loginForm)}>
        <Field of={loginForm} name="username">
          {(field) => (
            <div class={styles.inputContainer}>
              <label>Username</label>
              <input {...field.props} type="text" />
            </div>
          )}
        </Field>
        <Field of={loginForm} name="password">
          {(field) => (
            <div class={styles.inputContainer}>
              <label>Password</label>
              <input {...field.props} type="password" />
            </div>
          )}
        </Field>
        <Button
          type='submit'
          text='Login'
          Icon={BiRegularLogInCircle}
          class={styles.loginButton}
        />
      </Form>

    </div>
  );
};
