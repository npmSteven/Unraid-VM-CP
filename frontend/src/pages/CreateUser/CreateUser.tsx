import { createForm, Field, Form, setValue } from '@modular-forms/solid';
import { useNavigate } from '@solidjs/router';
import { AiOutlineUserAdd } from 'solid-icons/ai';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, createSignal } from 'solid-js';
import toast from 'solid-toast';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { createUserAPI } from '../../services/users';

import styles from './CreateUser.module.css';

type ICreateUserForm = {
  username: string;
  password: string;
};

const CreateUser: Component = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = createSignal(false);
  const createUserForm = createForm<ICreateUserForm>();

  const goToUsers = () => {
    navigate('/users');
  }

  const onSubmit = async (newUser: ICreateUserForm) => {
    try {
      setIsLoading(true);

      await toast.promise(
        createUserAPI(newUser.username, newUser.password),
        {
          loading: `Creating ${newUser.username}`,
          success: `Created ${newUser.username}`,
          error: `There was an issue creating ${newUser.username}`,
        }
      )
      setValue(createUserForm, 'username', '');
      setValue(createUserForm, 'password', '');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - CreateUser - onSubmit():', error);
    }
  }

  return (
    <div>
      <Navbar />
      <div>
        <Button
          text='Back'
          Icon={BiRegularArrowBack}
          onClick={goToUsers}
          style={{
            margin: '10px',
          }}
        />
      </div>
      <div>

        {/* Login Form */}
        <Form class={styles.form} of={createUserForm} onSubmit={onSubmit}>
          <Field of={createUserForm} name="username">
            {(field) => (
              <div class={styles.inputContainer}>
                <label>Username</label>
                <input {...field.props} type="text" value={field.value} />
              </div>
            )}
          </Field>
          <Field of={createUserForm} name="password">
            {(field) => (
              <div class={styles.inputContainer}>
                <label>Password</label>
                <input {...field.props} type="password" value={field.value} />
              </div>
            )}
          </Field>
          <Button
            onClick={() => { }}
            type='submit'
            text='Create User'
            isLoading={isLoading()}
            Icon={AiOutlineUserAdd}
            class={styles.createUserButton}
            disabled={isLoading()}
          />
        </Form>

      </div>
    </div>
  );
};

export default CreateUser;
