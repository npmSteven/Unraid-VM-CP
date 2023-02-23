import { useNavigate, useParams } from '@solidjs/router';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { SiOpenaccess } from 'solid-icons/si';
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
  const [vm, setVM] = createSignal<any>({});

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

  const updatePermissionsState = (permission: string) => {
    const { permissions }: any = vm();
    const updatedPermissions = { ...permissions };
    const isChecked = !updatedPermissions[permission];
    updatedPermissions[permission] = isChecked;
    setVM((prev: any) => ({ ...prev, permissions: { ...prev.permissions, ...updatedPermissions } }))
  }

  const updatePermissions = async () => {
    try {
      setIsLoading(true);
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
      } = vm().permissions;

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
          loading: `Updating permissions `,
          success: `Updated permissions`,
          error: `There was an issue updating the permissions`,
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
          <div>

            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canStart')}
            >
              <label>Start</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canStart}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canStop')}
            >
              <label>Stop</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canStop}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canPause')}
            >
              <label>Pause</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canPause}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canRemoveVM')}
            >
              <label>Remove VM</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canRemoveVM}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canRemoveVMAndDisks')}
            >
              <label>Remove VM And Disks</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canRemoveVMAndDisks}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canHibernate')}
            >
              <label>Hibernate</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canHibernate}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canForceStop')}
            >
              <label>Force Stop</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canForceStop}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canRestart')}
            >
              <label>Restart</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canRestart}
              />
            </div>
            <div
              class={styles.permission}
              onClick={() => updatePermissionsState('canResume')}
            >
              <label>Resume</label>
              <input
                type="checkbox"
                checked={vm()?.permissions?.canResume}
              />
            </div>
          </div>
          <Button
            text='Update Permissions'
            Icon={SiOpenaccess}
            onClick={updatePermissions}
            style={{
              margin: '10px',
            }}
          />
        </Match>
        <Match when={isLoading()}>
          <PageLoading />
        </Match>
      </Switch>
    </div>
  );
};

export default VMPermissions;