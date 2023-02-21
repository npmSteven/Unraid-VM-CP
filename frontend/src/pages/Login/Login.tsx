import { Component } from 'solid-js';
import { createForm, Form, Field } from '@modular-forms/solid';
import { BiRegularLogInCircle } from 'solid-icons/bi'

// Styles
import styles from './Login.module.css';

// Components
import { Button } from '../../components/Button/Button';
import { authLogin } from '../../services/auth';
import { getUser } from '../../services/users';

type ILoginForm = {
  username: string;
  password: string;
};

const Login: Component = () => {
  const loginForm = createForm<ILoginForm>();

  const onSubmit = async (login: ILoginForm) => {
    try {
      await authLogin(login.username, login.password);
      const userJson = await getUser();      
    } catch (error) {
      console.error('ERROR - onSubmit():', error);
      
    }
  }

  return (
    <div class={styles.login}>
      {/* Login Form */}
      <Form class={styles.form} of={loginForm} onSubmit={onSubmit}>
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
          onClick={() => {}}
          type='submit'
          text='Login'
          Icon={BiRegularLogInCircle}
          class={styles.loginButton}
        />
      </Form>

    </div>
  );
};

export default Login;
