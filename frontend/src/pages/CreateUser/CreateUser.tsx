import { useNavigate } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component } from 'solid-js';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';

import styles from './CreateUser.module.css';

const CreateUser: Component = () => {
  const navigate = useNavigate();

  const goToUsers = () => {
    navigate('/users');
  }

  return (
    <div>
      <Navbar />
      <div
        style={{
        }}
      >
        <Button
          text='Back'
          Icon={BiRegularArrowBack}
          onClick={goToUsers}
          style={{
            margin: '10px',
          }}
        />
      </div>
      Create User
    </div>
  );
};

export default CreateUser;
