import { useNavigate } from '@solidjs/router';
import { AiOutlineUserAdd } from 'solid-icons/ai';
import { Component, Match, onMount, Switch } from 'solid-js';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageLoading } from '../../components/PageLoading/PageLoading';
import { UserCard } from '../../components/UserCard/UserCard';
import { useUser } from '../../contexts/user';

import styles from './Users.module.css';

const Users: Component = () => {
  const navigate = useNavigate()
  const { users, getUser, isLoading } = useUser();

  onMount(async () => {
    try {
      await getUser();
    } catch (error) {
      console.error('ERROR - Users - onMount():', error);
    }
  })

  const goToCreateUsers = () => {
    navigate('/users/create');
  }

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: 'flex',
          "justify-content": 'flex-end'
        }}
      >
        <Button
          text='Create User'
          Icon={AiOutlineUserAdd}
          onClick={goToCreateUsers}
          style={{
            margin: '10px',
          }}
        />
      </div>

      <Switch>
        <Match when={!isLoading()}>
          {/* Users */}
          <div
            style={{
              display: 'flex',
              "flex-wrap": 'wrap',
            }}
          >
            {users().map((user) => (
              <UserCard id={user.id} username={user.username} />
            ))}
          </div>
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
      </Switch>

    </div>
  );
};

export default Users;
