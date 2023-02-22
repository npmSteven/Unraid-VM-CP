import { useNavigate, useParams } from '@solidjs/router';
import { AiOutlineLink } from 'solid-icons/ai';
import { BiRegularArrowBack } from 'solid-icons/bi';
import { Component, createSignal, Match, onMount, Switch } from 'solid-js';
import toast from 'solid-toast';
import { Button } from '../../components/Button/Button';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageLoading } from '../../components/PageLoading/PageLoading';
import { getLinkableVMs, linkVMApi } from '../../services/vms';

import styles from './LinkVM.module.css';

const LinkVM: Component = () => {
  const params: any = useParams();
  const navigate = useNavigate();

  const [linkableVMs, setLinkableVMs] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [selectedVM, setSelectedVM] = createSignal<any>(null);

  const getLinkableVMsUI = async () => {
    try {
      setIsLoading(true);
      
      const json: any = await getLinkableVMs(params.userId);
      if (json?.success) {
        setLinkableVMs(json.payload);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - LinkVM - onMount():', error);
    }
  }

  onMount(async () => {
    try {
      await getLinkableVMsUI();
    } catch (error) {
      console.error('ERROR - LinkVM - onMount():', error);
    }
  })

  const onChangeVM = (e: any) => {
    const id = e.target.value;
    if (!id) return;
    const vm = linkableVMs().find((v: any) => v.id === id);
    setSelectedVM(vm);
  }

  const linkVM = async () => {
    try {
      if (!selectedVM()) return;
      setIsLoading(true);
      await toast.promise(linkVMApi(selectedVM().id, params.userId), {
        loading: `Linking ${selectedVM().name}`,
        success: `Linked ${selectedVM().name}`,
        error: `There was an issue trying to link ${selectedVM().name}`
      })
      await getLinkableVMsUI();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - linkVM():', error);
      throw error;
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
          display: 'flex',
          // "justify-content": 'flex-end'
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
          <select onChange={onChangeVM}>
            <option selected>Select a VM</option>
            {linkableVMs().map((vm: any) => (
              <option value={vm.id}>{vm.name}</option>
            ))}
          </select>
          <Button
            text='Link'
            Icon={AiOutlineLink}
            onClick={linkVM}
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

export default LinkVM;
