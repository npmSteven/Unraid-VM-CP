// Types
import { Component, createSignal } from 'solid-js';
import type { IDropdownSection } from '../../types/IDropdownSection';
import type { IVMStatus } from '../../types/IVMStatus';

// Icons
import { FaSolidPowerOff } from 'solid-icons/fa'
import { FaRegularCirclePause } from 'solid-icons/fa'
import { FiRefreshCcw } from 'solid-icons/fi'
import { AiOutlineMinusCircle } from 'solid-icons/ai'
import { AiOutlineStop } from 'solid-icons/ai'
import { FaRegularCirclePlay } from 'solid-icons/fa'
import { ImSleepy } from 'solid-icons/im'
import { FiTrash2 } from 'solid-icons/fi'

// Components
import { Dropdown } from '../Dropdown/Dropdown';
import { IPermissions } from '../../types/IPermissions';
import { startVMApi, stopVMApi } from '../../services/vms';
import toast from 'solid-toast';
import { useVMs } from '../../contexts/vms';

type Props = {
  id: string
  name: string
  status: IVMStatus,
  permissions: IPermissions | undefined;
}

export const VMDropdown: Component<Props> = (props: Props) => {
  const { permissions, id, name } = props;

  const [isLoading, setIsLoading] = createSignal(false);

  const { getVMs } = useVMs();

  const runActionAndGetVMs = async (action: Promise<any>) => {
    try {
      setIsLoading(true);
      await action;
      await getVMs();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - runActionAndGetVMs():', error);
      throw error;
    }
  }

  const startVM = async () => {
    try {
      toast.promise(runActionAndGetVMs(startVMApi(id)), {
        loading: `Starting ${name}`,
        success: `Started ${name}`,
        error: `There was an issue trying to start ${name}`
      })
    } catch (error) {
      console.error('ERROR - startVM():', error);
    }
  }

  const stopVM = async () => {
    try {
      toast.promise(runActionAndGetVMs(stopVMApi(id)), {
        loading: `Stopping ${name}`,
        success: `Stopped ${name}`,
        error: `There was an issue trying to stop ${name}`
      })
    } catch (error) {
      console.error('ERROR - startVM():', error);
    }
  }

  const buildStartedSections = () => {
    const startedSections: IDropdownSection[] = [
      {
        title: 'Control',
        actions: []
      }
    ];

    const { actions } = startedSections[0];
    
    if (permissions?.canStop) {
      actions.push({
        text: 'Stop',
        Icon: FaSolidPowerOff,
        onClick: stopVM,
      })
    }

    if (permissions?.canPause) {
      actions.push({
        text: 'Pause',
        Icon: FaRegularCirclePause,
        onClick: () => {},
      })
    }

    if (permissions?.canRestart) {
      actions.push({
        text: 'Restart',
        Icon: FiRefreshCcw,
        onClick: () => {},
      })
    }
    if (permissions?.canHibernate) {
      actions.push({
        text: 'Hibernate',
        Icon: ImSleepy,
        onClick: () => {},
      })
    }
    if (permissions?.canForceStop) {
      actions.push({
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: () => {},
      })
    }

    return startedSections;
  }
  
  const buildPausedSections = () => {
    const pausedSections: IDropdownSection[] = [
      {
        title: 'Control',
        actions: []
      }
    ];

    const { actions } = pausedSections[0];

    if (permissions?.canResume) {
      actions.push({
        text: 'Resume',
        Icon: FaRegularCirclePlay,
        onClick: () => {},
      })
    }

    if (permissions?.canForceStop) {
      actions.push({
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: () => {},
      })
    }

    return pausedSections;
  }
  
  const buildStoppedSections = () => {
    const stoppedSections: IDropdownSection[] = [
      {
        title: 'Control',
        actions: []
      }
    ];

    const { actions } = stoppedSections[0];

    if (permissions?.canStart) {
      actions.push({
        text: 'Start',
        Icon: FaRegularCirclePlay,
        onClick: startVM,
      })
    }

    if (permissions?.canRemoveVM) {
      actions.push({
        text: 'Remove VM',
        Icon: AiOutlineMinusCircle,
        onClick: () => {},
      })
    }

    if (permissions?.canRemoveVMAndDisks) {
      actions.push({
        text: 'Remove VM & Disks',
        Icon: FiTrash2,
        onClick: () => {},
      })
    }

    return stoppedSections;
  }


  const getSectionsByStatus = (): IDropdownSection[] => {
    switch(props.status) {
      case 'paused':
        return buildPausedSections();
      case 'started':
        return buildStartedSections();
      case 'stopped':
        return buildStoppedSections();
      default:
        return [];
    }
  }

  return (
    <Dropdown sections={getSectionsByStatus()} isLoading={isLoading()} top={55} />
  );
};
