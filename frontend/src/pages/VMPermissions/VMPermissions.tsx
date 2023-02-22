import { useNavigate, useParams } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, createSignal, Match, onMount, Switch } from 'solid-js';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageLoading } from '../../components/PageLoading/PageLoading';
import { getVMApi } from '../../services/vms';

// Styles
import styles from './VMPermissions.module.css';

const VMPermissions: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = createSignal(false);
  const [vm, setVM] = createSignal({});

  const getVM = async () => {
    try {
      setIsLoading(true);
      const json = await getVMApi(params.unraidVMId, params.userId);
      if (json?.success) {
        setVM(json.payload);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - getVM():', error);
    }
  }

  onMount(async () => {
    try {
      await getVM();
    } catch (error) {
      console.error('ERROR - VMPermissions - onMount():', error);
    }
  })

  const goToUserVMs = () => {
    navigate(`/users/${params.userId}/vms`);
  }

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: 'flex'
        }}
      >
        <Button
          text='Back'
          Icon={BiRegularArrowBack}
          onClick={goToUserVMs}
          style={{
            margin: '10px',
          }}
        />
      </div>
      <Switch>
        <Match when={!isLoading()}>

          {/* <input type="checkbox" /> */}
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
      </Switch>
    </div>
  );
};

export default VMPermissions;