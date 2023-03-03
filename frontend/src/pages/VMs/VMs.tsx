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
import { AiOutlineLink } from 'solid-icons/ai';
import { PageLoading } from '../../components/PageLoading/PageLoading';

export const VMs: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { vms, getVMs, getVMsUser, vmsUser } = useVMs();
  const [isLoading, setIsLoading] = createSignal(false);

  const isAdminVMCard = !!params.userId;

  const initVMs = async () => {
    try {
      await getVMs();
    } catch (error) {
      console.error('ERROR - initVMs():', error);
      throw error;
    }
  }

  const initAdminVMs = async () => {
    try {
      await getVMsUser(params.userId);
    } catch (error) {
      console.error('ERROR - initAdminVMs():', error);
      throw error;
    }
  }

  onMount(async () => {
    try {
      setIsLoading(true);

      if (isAdminVMCard) {
        await initAdminVMs();
      } else {
        await initVMs();
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - VMs - onMount():', error);
    }
  })

  const goToUsers = () => {
    navigate('/users');
  }

  const goToLinkAVM = () => {
    navigate(`/users/${params.userId}/vms/link`)
  }

  return (
    <div>
      <Navbar />
      {isAdminVMCard && (
        <div
          style={{
            display: 'flex',
            "justify-content": 'space-between'
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
          <Button
            text='Link a VM'
            Icon={AiOutlineLink}
            onClick={goToLinkAVM}
            style={{
              margin: '10px',
            }}
          />
        </div>
      )}
      <Switch>
        <Match when={!isLoading() && vms().length >= 1}>
          <div
            style={{
              display: 'grid',
              'grid-template-columns': 'repeat(auto-fit, minmax(350px, 1fr) )',
            }}
          >
            {!isAdminVMCard &&
              vms().map((vm) => (
                <VMCard
                  id={vm.id}
                  status={vm.state}
                  name={vm.name}
                  os={vm.os}
                  storage={vm.storage}
                  memory={vm.memory}
                  cpus={vm.cpus}
                  graphics={vm.graphics}
                  isAutoStart={vm.isAutoStart}
                  isAdmin={isAdminVMCard}
                  vnc={vm.vnc}
                  ip={vm.ips.find(({ type }) => type === 'ipv4')?.address}
                  permissions={vm.permissions}
                />
              ))}
            {isAdminVMCard &&
              vmsUser().map((vm) => (
                <VMCard
                  userId={params.userId}
                  id={vm.id}
                  status={vm.state}
                  name={vm.name}
                  os={vm.os}
                  storage={vm.storage}
                  memory={vm.memory}
                  cpus={vm.cpus}
                  graphics={vm.graphics}
                  isAutoStart={vm.isAutoStart}
                  isAdmin={isAdminVMCard}
                  ip={vm.ips.find(({ type }) => type === 'ipv4')?.address}
                />
              ))}
          </div>
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
        <Match when={!isLoading() && vms().length === 0}>
          <h3 style={{ "text-align": 'center', "font-weight": 500 }}>No VM's to display</h3>
        </Match>
      </Switch>
    </div>
  );
};

export default VMs;
