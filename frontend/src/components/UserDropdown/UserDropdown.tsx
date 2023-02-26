import { Component, createSignal } from 'solid-js';
import toast from 'solid-toast';
import { useNavigate } from '@solidjs/router';

// Icons
import { AiOutlineEdit } from 'solid-icons/ai';
import { FiServer } from 'solid-icons/fi';
import { RiSystemDeleteBin2Line } from 'solid-icons/ri'

// Types
import type { IDropdownSection } from '../../types/IDropdownSection';

// Components
import { Dropdown } from '../Dropdown/Dropdown';

// Services
import { deleteUserApi } from '../../services/users';

// Contexts
import { useUser } from '../../contexts/user';

// Styles
import styles from './UserDropdown.module.css';

type Props = {
  id: string
}

export const UserDropdown: Component<Props> = (props: Props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const { getUser } = useUser();
  const navigate = useNavigate();

  const goToUserVMs = () => {
    navigate(`/users/${props.id}/vms`)
  }

  const goToUserEdit = () => {
    navigate(`/users/${props.id}/edit`)
  }

  const deleteUser = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteUserApi(props.id),
        {
          loading: 'Deleting user...',
          success: 'User deleted',
          error: 'Error deleting user',
        }
      )
      await getUser();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - deleteUser():', error);
    }
  }

  const sections: IDropdownSection[] = [
    {
      title: 'Admin',
      actions: [
        {
          text: 'Edit',
          Icon: AiOutlineEdit,
          onClick: goToUserEdit,
        },
        {
          text: 'Delete',
          Icon: RiSystemDeleteBin2Line,
          onClick: deleteUser,
        },
      ],
    },
    {
      title: 'VM',
      actions: [
        {
          text: 'VMs',
          Icon: FiServer,
          onClick: goToUserVMs,
        },
      ],
    },
  ];


  return (
    <Dropdown sections={sections} top={70}  />
  );
};
