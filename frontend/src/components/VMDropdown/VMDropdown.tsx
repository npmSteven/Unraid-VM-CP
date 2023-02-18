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
        icon: <FaSolidPowerOff size={18} />,
      },
      {
        text: 'Pause',
        icon: <FaRegularCirclePause size={18} />,
      },
      {
        text: 'Restart',
        icon: <FiRefreshCcw size={18} />,
      },
      {
        text: 'Hibernate',
        icon: <ImSleepy size={18} />,
      },
      {
        text: 'Force Stop',
        icon: <AiOutlineStop size={18} />,
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
        icon: <FaRegularCirclePlay size={18} />,
      },
      {
        text: 'Force Stop',
        icon: <AiOutlineStop size={18} />,
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
        icon: <FaRegularCirclePlay size={18} />,
      },
      {
        text: 'Remove VM',
        icon: <AiOutlineMinusCircle size={18} />,
      },
      {
        text: 'Remove VM & Disks',
        icon: <FiTrash2 size={18} />,
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
    <Dropdown sections={getSectionsByStatus()} />
  );
};
