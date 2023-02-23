import { useNavigate, useParams } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, createSignal, Match, onMount, Switch } from 'solid-js';
import toast from 'solid-toast';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageLoading } from '../../components/PageLoading/PageLoading';
import { updatePermissionsAPI } from '../../services/permissions';
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

  const updatePermissions = async (permission: string) => {
    try {
      setIsLoading(true);
      const { permissions }: any = vm();
      const updatedPermissions = { ...permissions };
      const isChecked = !updatedPermissions[permission];
      updatedPermissions[permission] = isChecked;

      const {
        canForceStop,
        canHibernate,
        canPause,
        canRemoveVM,
        canRemoveVMAndDisks,
        canRestart,
        canResume,
        canStart,
        canStop,
      } = updatedPermissions;

      await toast.promise(
        updatePermissionsAPI(params.unraidVMId, params.userId, {
          canForceStop,
          canHibernate,
          canPause,
          canRemoveVM,
          canRemoveVMAndDisks,
          canRestart,
          canResume,
          canStart,
          canStop,
        }),
        {
          loading: `Setting permission ${permission} to ${isChecked}`,
          success: `Set permission ${permission} to ${isChecked}`,
          error: `There was an issue setting permission ${permission} to ${isChecked}`,
        }
      )
      await getVM();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - updatePermissions():', error);
    }
  }

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
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canStart')}
          >
            <label>Start</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canStart}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canStop')}
          >
            <label>Stop</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canStop}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canPause')}
          >
            <label>Pause</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canPause}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canRemoveVM')}
          >
            <label>Remove VM</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canRemoveVM}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canRemoveVMAndDisks')}
          >
            <label>Remove VM And Disks</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canRemoveVMAndDisks}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canHibernate')}
          >
            <label>Hibernate</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canHibernate}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canForceStop')}
          >
            <label>Force Stop</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canForceStop}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canRestart')}
          >
            <label>Restart</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canRestart}
            />
          </div>
          <div
            class={styles.permission}
            onClick={() => updatePermissions('canResume')}
          >
            <label>Resume</label>
            <input
              type="checkbox"
              checked={vm()?.permissions?.canResume}
            />
          </div>
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
      </Switch>
    </div>
  );
};

export default VMPermissions;