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

const startedSections: IDropdownSection[] = [
  {
    title: 'Control',
    actions: [
      {
        text: 'Stop',
        Icon: FaSolidPowerOff,
        onClick: () => {},
      },
      {
        text: 'Pause',
        Icon: FaRegularCirclePause,
        onClick: () => {},
      },
      {
        text: 'Restart',
        Icon: FiRefreshCcw,
        onClick: () => {},
      },
      {
        text: 'Hibernate',
        Icon: ImSleepy,
        onClick: () => {},
      },
      {
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: () => {},
      },
    ],
  },
];

const pasuedSections: IDropdownSection[] = [
  {
    title: 'Control',
    actions: [
      {
        text: 'Resume',
        Icon: FaRegularCirclePlay,
        onClick: () => {},
      },
      {
        text: 'Force Stop',
        Icon: AiOutlineStop,
        onClick: () => {},
      },
    ],
  },
];

const stoppedSections: IDropdownSection[] = [
  {
    title: 'Control',
    actions: [
      {
        text: 'Start',
        Icon: FaRegularCirclePlay,
        onClick: () => {},
      },
      {
        text: 'Remove VM',
        Icon: AiOutlineMinusCircle,
        onClick: () => {},
      },
      {
        text: 'Remove VM & Disks',
        Icon: FiTrash2,
        onClick: () => {},
      },
    ],
  },
];

type Props = {
  status: IVMStatus,
}

export const VMDropdown: Component<Props> = (props: Props) => {

  const getSectionsByStatus = (): IDropdownSection[] => {
    switch(props.status) {
      case 'paused':
        return pasuedSections;
      case 'started':
        return startedSections;
      case 'stopped':
        return stoppedSections;
      default:
        return [];
    }
  }

  return (
    <Dropdown sections={getSectionsByStatus()} top={55} />
  );
};
