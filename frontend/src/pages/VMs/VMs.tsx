import { useNavigate, useParams } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, onMount } from 'solid-js';

// Components
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { VMCard } from '../../components/VMCard/VMCard';

// Styles
import styles from './VMs.module.css';

export const VMs: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const isAdminVMCard = !!params.userId;

  onMount(() => {
    console.log(params.userId);
  })

  const goToUsers = () => {
    navigate('/users');
  }

  return (
    <div>
      <Navbar />
      {isAdminVMCard && (
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
      )}
      <div
        style={{
          display: 'flex',
          "flex-wrap": 'wrap',
          "justify-content": 'center',
        }}
      >
        <VMCard
          status='started'
          name='Steven-PC'
          os='Windows 11'
          storage='1tb'
          memory='1024M'
          cpus='6'
          graphics='RTX3080Ti'
          isAutoStart={false}
          isAdmin={isAdminVMCard}
        />
        <VMCard
          status='paused'
          name='Steven-PC'
          os='Windows 11'
          storage='1tb'
          memory='1024M'
          cpus='6'
          graphics='RTX3080Ti'
          ip='192.168.1.150'
          isAutoStart={false}
          isAdmin={isAdminVMCard}
        />
        <VMCard
          status='stopped'
          name='Steven-PC'
          os='Windows 11'
          storage='1tb'
          memory='1024M'
          cpus='6'
          graphics='RTX3080Ti'
          ip='192.168.1.150'
          isAutoStart={false}
          isAdmin={isAdminVMCard}
        />
      </div>
    </div>
  );
};

export default VMs;
