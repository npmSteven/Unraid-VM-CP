import { useNavigate, useParams } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, createSignal, Match, onMount, Switch } from 'solid-js';
import { useVMs } from '../../contexts/vms';

// Components
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { VMCard } from '../../components/VMCard/VMCard';

// Styles
import styles from './VMs.module.css';
import { Spinner } from '../../components/Spinner/Spinner';

export const VMs: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { vms, getVMs } = useVMs();
  const [isLoading, setIsLoading] = createSignal(false);

  const isAdminVMCard = !!params.userId;


  onMount(async () => {
    try {
      console.log(params.userId);
      setIsLoading(true);
      await getVMs();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - VMs - onMount():', error);
    }
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
      <Switch>
        <Match when={!isLoading()}>
          <div
            style={{
              display: 'flex',
              "flex-wrap": 'wrap',
              "justify-content": 'center',
            }}
          >
            {vms().map((vm) => (
              <VMCard
                status={vm.state}
                name={vm.name}
                os={vm.os}
                storage={vm.storage}
                memory={vm.memory}
                cpus={vm.cpus}
                graphics={vm.graphics}
                isAutoStart={vm.isAutoStart}
                isAdmin={isAdminVMCard}
                permissions={vm.permissions}
              />
            ))}
          </div>
        </Match>
        <Match when={isLoading()}>
          <div style={{ display: 'flex', "justify-content": 'center', 'align-items': 'center', "margin-top": '50px' }}>
            <Spinner size={100} />
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default VMs;
