// Types
import { Accessor, Component, createSignal } from 'solid-js';
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
import { useUser } from '../../contexts/user';
import { RiDeviceComputerLine } from 'solid-icons/ri';

type Props = {
  vm: any;
  isLoading: Accessor<boolean>
  startVM: () => Promise<any>
  stopVM: () => Promise<any>
  forceStopVM: () => Promise<any>
  removeVM: () => Promise<any>
  removeVMAndDisks: () => Promise<any>
  pauseVM: () => Promise<any>
  resumeVM: () => Promise<any>
  hibernateVM: () => Promise<any>
  restartVM: () => Promise<any>
  openVNC: () => void
}

export const VMDropdown: Component<Props> = (props: Props) => {
  const { 
    startVM,
    stopVM,
    forceStopVM,
    removeVM,
    removeVMAndDisks,
    pauseVM,
    resumeVM,
    hibernateVM,
    restartVM,
    isLoading,
    openVNC,
    vm,
  } = props;
  const { isUnraidUser } = useUser();

  const buildStartedSections = () => {
    const startedSections: IDropdownSection[] = [
      {
        title: 'Control',
        actions: []
      }
    ];

    const { actions } = startedSections[0];
    
    if (vm?.vnc && isUnraidUser()) {
      actions.push({
        text: 'Open VNC',
        Icon: RiDeviceComputerLine,
        onClick: openVNC,
      })
    }

    if (vm?.permissions?.canStop || isUnraidUser()) {
      actions.push({
        text: 'Stop',
        Icon: FaSolidPowerOff,
        onClick: stopVM,
      })
    }

    if (vm?.permissions?.canPause || isUnraidUser()) {
      actions.push({
        text: 'Pause',
        Icon: FaRegularCirclePause,
        onClick: pauseVM,
      })
    }

    if (vm?.permissions?.canRestart || isUnraidUser()) {
      actions.push({
        text: 'Restart',
        Icon: FiRefreshCcw,
        onClick: restartVM,
      })
    }
    if (vm?.permissions?.canHibernate || isUnraidUser()) {
      actions.push({
        text: 'Hibernate',
        Icon: ImSleepy,
        onClick: hibernateVM,
      })
    }
    if (vm?.permissions?.canForceStop || isUnraidUser()) {
      actions.push({
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: forceStopVM,
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

    if (vm?.permissions?.canResume || isUnraidUser()) {
      actions.push({
        text: 'Resume',
        Icon: FaRegularCirclePlay,
        onClick: resumeVM,
      })
    }

    if (vm?.permissions?.canForceStop || isUnraidUser()) {
      actions.push({
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: forceStopVM,
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

    if (vm?.permissions?.canStart || isUnraidUser()) {
      actions.push({
        text: 'Start',
        Icon: FaRegularCirclePlay,
        onClick: startVM,
      })
    }

    if (vm?.permissions?.canRemoveVM || isUnraidUser()) {
      actions.push({
        text: 'Remove VM',
        Icon: AiOutlineMinusCircle,
        onClick: removeVM,
      })
    }

    if (vm?.permissions?.canRemoveVMAndDisks || isUnraidUser()) {
      actions.push({
        text: 'Remove VM & Disks',
        Icon: FiTrash2,
        onClick: removeVMAndDisks,
      })
    }

    return stoppedSections;
  }


  const getSectionsByStatus = (): IDropdownSection[] => {
    switch(vm.status) {
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
