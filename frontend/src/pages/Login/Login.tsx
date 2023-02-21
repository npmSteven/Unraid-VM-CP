import { Component, createSignal } from 'solid-js';
import { createForm, Form, Field } from '@modular-forms/solid';

// Icons
import { BiRegularLogInCircle } from 'solid-icons/bi'

// Styles
import styles from './Login.module.css';

// Components
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../contexts/auth';
import { useUser } from '../../contexts/user';

type ILoginForm = {
  username: string;
  password: string;
};

const Login: Component = () => {
  const [isLoading, setIsLoading] = createSignal(false);
  const { login } = useAuth();
  const { getUser } = useUser();
  const loginForm = createForm<ILoginForm>();

  const onSubmit = async (l: ILoginForm) => {
    try {
      setIsLoading(true);
      await login(l.username, l.password)
      await getUser(); 
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
          isLoading={isLoading()}
          Icon={BiRegularLogInCircle}
          class={styles.loginButton}
          disabled={isLoading()}
        />
      </Form>

    </div>
  );
};

export default Login;
