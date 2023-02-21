// Types
import type { Component } from 'solid-js';
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

type Props = {
  status: IVMStatus,
  permissions: IPermissions;
}

export const VMDropdown: Component<Props> = (props: Props) => {

  const { permissions } = props;

  const buildStartedSections = () => {
    const startedSections: IDropdownSection[] = [
      {
        title: 'Control',
        actions: []
      }
    ];

    const { actions } = startedSections[0];
    
    if (permissions.canStop) {
      actions.push({
        text: 'Stop',
        Icon: FaSolidPowerOff,
        onClick: () => {},
      })
    }

    if (permissions.canPause) {
      actions.push({
        text: 'Pause',
        Icon: FaRegularCirclePause,
        onClick: () => {},
      })
    }

    if (permissions.canRestart) {
      actions.push({
        text: 'Restart',
        Icon: FiRefreshCcw,
        onClick: () => {},
      })
    }
    if (permissions.canHibernate) {
      actions.push({
        text: 'Hibernate',
        Icon: ImSleepy,
        onClick: () => {},
      })
    }
    if (permissions.canForceStop) {
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

    if (permissions.canResume) {
      actions.push({
        text: 'Resume',
        Icon: FaRegularCirclePlay,
        onClick: () => {},
      })
    }

    if (permissions.canForceStop) {
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

    if (permissions.canStart) {
      actions.push({
        text: 'Start',
        Icon: FaRegularCirclePlay,
        onClick: () => {},
      })
    }

    if (permissions.canRemoveVM) {
      actions.push({
        text: 'Remove VM',
        Icon: AiOutlineMinusCircle,
        onClick: () => {},
      })
    }

    if (permissions.canRemoveVMAndDisks) {
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
    <Dropdown sections={getSectionsByStatus()} top={55} />
  );
};
