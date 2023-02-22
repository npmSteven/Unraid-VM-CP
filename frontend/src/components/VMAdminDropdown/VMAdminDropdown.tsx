import { Accessor, Component } from 'solid-js';

// Components
import { Dropdown } from '../Dropdown/Dropdown';

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Icons
import { BiRegularUnlink } from 'solid-icons/bi'
import { SiOpenaccess } from 'solid-icons/si'

// Styles
import styles from './VMAdminDropdown.module.css';

type Props = {
  id: string,
  userId: string,
  isLoading: Accessor<boolean>,
  unlinkVM: (unraidVMId: string, userId: string) => Promise<void>
}

export const VMAdminDropdown: Component<Props> = (props: Props) => {

  const sections: IDropdownSection[] = [
    {
      title: 'VM',
      actions: [
        {
          text: 'Unlink',
          Icon: BiRegularUnlink,
          onClick: () => props.unlinkVM(props.id, props.userId),
        },
        {
          text: 'Permissions',
          Icon: SiOpenaccess,
          onClick: () => {},
        }
      ]
    }
  ]

  return (
    <Dropdown sections={sections} top={55} isLoading={props.isLoading()} />
  );
};
