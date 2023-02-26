import { createForm, Field, Form, setValue } from '@modular-forms/solid';
import toast from 'solid-toast';
import { useNavigate, useParams } from '@solidjs/router';
import { Component, createSignal, Match, onMount, Switch } from 'solid-js';

// Icons
import { AiOutlineUserAdd } from 'solid-icons/ai';
import { BiRegularArrowBack } from 'solid-icons/bi';

// Components
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';

// Services
import { getUserApi, getUserByIdApi, updateUserPasswordApi, updateUserUsernameApi } from '../../services/users';

// Styles
import styles from './EditUser.module.css';
import { PageLoading } from '../../components/PageLoading/PageLoading';

type IUpdateUsernameForm = {
  username: string;
};

type IUpdatePasswordForm = {
  password: string;
};

const EditUser: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isLoadingUsername, setIsLoadingUsername] = createSignal(false);
  const [isLoadingPassword, setIsLoadingPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [user, setUser] = createSignal<any>({});
  const updateUsernameForm = createForm<IUpdateUsernameForm>();
  const updatePasswordForm = createForm<IUpdatePasswordForm>();

  const goToUsers = () => {
    navigate('/users');
  }

  const getUserUI = async () => {
    try {
      setIsLoading(true);
      const json = await getUserByIdApi(params.userId);
      if (json?.success) {
        setUser(json.payload);
        setValue(updateUsernameForm, 'username', user()?.username ?? '');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - getUserUI():', error);
    }
  }

  onMount(async () => {
    try {
      await getUserUI();
    } catch (error) {
      console.error('ERROR - EditUser - onMount():', error);
    }
  })

  const onSubmitUsername = async (newUser: IUpdateUsernameForm) => {
    try {
      setIsLoadingUsername(true);
      await toast.promise(
        updateUserUsernameApi(params.userId, newUser.username),
        {
          loading: `Updating username to ${newUser.username}`,
          success: `Updated username to ${newUser.username}`,
          error: `There was an issue updating ${newUser.username}`,
        }
      )
      await getUserUI();
      setIsLoadingUsername(false);
    } catch (error) {
      setIsLoadingUsername(false);
      console.error('ERROR - onSubmitUsername():', error);
    }
  }

  const onSubmitPassword = async (newUser: IUpdatePasswordForm) => {
    try {
      setIsLoadingPassword(true);
      await toast.promise(
        updateUserPasswordApi(params.userId, newUser.password),
        {
          loading: `Updating password`,
          success: `Updated password`,
          error: `There was an issue updating the password`,
        }
      )
      await getUserUI();
      setValue(updatePasswordForm, 'password', '');
      setIsLoadingPassword(false);
    } catch (error) {
      setIsLoadingPassword(false);
      console.error('ERROR - onSubmitPassword():', error);
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
      <Switch>
        <Match when={!isLoading()}>
          <div>
            <h1>Edit user</h1>
            <p>Username: {user()?.username}</p>

            {/* Update Username Form */}
            <Form class={styles.form} of={updateUsernameForm} onSubmit={onSubmitUsername}>
              <Field of={updateUsernameForm} name="username">
                {(field) => (
                  <div class={styles.inputContainer}>
                    <label>Username</label>
                    <input {...field.props} type="text" autoCapitalize='none' value={field.value} />
                  </div>
                )}
              </Field>
              <Button
                onClick={() => { }}
                type='submit'
                text='Update username'
                isLoading={isLoadingUsername()}
                Icon={AiOutlineUserAdd}
                class={styles.createUserButton}
                disabled={isLoadingUsername()}
              />
            </Form>

            {/* Update Username Form */}
            <Form class={styles.form} style={{ "margin-top": '20px' }} of={updatePasswordForm} onSubmit={onSubmitPassword}>
              <Field of={updatePasswordForm} name="password">
                {(field) => (
                  <div class={styles.inputContainer}>
                    <label></label>
                    <input {...field.props} type="password" value={field.value} />
                  </div>
                )}
              </Field>
              <Button
                onClick={() => { }}
                type='submit'
                text='Update password'
                isLoading={isLoadingPassword()}
                Icon={AiOutlineUserAdd}
                class={styles.createUserButton}
                disabled={isLoadingPassword()}
              />
            </Form>

          </div>
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
      </Switch>
    </div>
  );
};

export default EditUser;
