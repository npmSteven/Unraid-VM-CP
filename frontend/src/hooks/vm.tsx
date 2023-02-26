import { createSignal } from "solid-js"
import toast from "solid-toast";
import { useVMs } from "../contexts/vms";
import { forceStopVMApi, hibernateVMApi, pauseVMApi, removeVMAndDisksApi, removeVMApi, restartVMApi, resumeVMApi, startVMApi, stopVMApi, unlinkVMApi } from "../services/vms";

export const useVMActions = (id: string, name: string) => {
  const [isLoading, setIsLoading] = createSignal(false);

  const { getVMs, getVMsUser, vms } = useVMs();

  const startVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(startVMApi(id), {
        loading: `Starting ${name}`,
        success: `Started ${name}`,
        error: `There was an issue trying to start ${name}`
      })
      await getVMs();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - startVM():', error);
    }
  }

  const stopVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(stopVMApi(id), {
        loading: `Stopping ${name}`,
        success: `Stopped ${name}`,
        error: `There was an issue trying to stop ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - stopVM():', error);
    }
  }

  const restartVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(restartVMApi(id), {
        loading: `Restarting ${name}`,
        success: `Restarted ${name}`,
        error: `There was an issue trying to restart ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - restartVM():', error);
    }
  }

  const forceStopVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(forceStopVMApi(id), {
        loading: `Force stopping ${name}`,
        success: `Force stopped ${name}`,
        error: `There was an issue trying to force stopping ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - forceStopVM():', error);
    }
  }

  const removeVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(removeVMApi(id), {
        loading: `Removing ${name}`,
        success: `Removed ${name}`,
        error: `There was an issue trying to remove ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - removeVM():', error);
    }
  }

  const removeVMAndDisks = async () => {
    try {
      setIsLoading(true);
      await toast.promise(removeVMAndDisksApi(id), {
        loading: `Removing ${name} and disks`,
        success: `Removed ${name} and disks`,
        error: `There was an issue trying to remove ${name} and disks`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - removeVMAndDisks():', error);
    }
  }

  const pauseVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(pauseVMApi(id), {
        loading: `Pausing ${name}`,
        success: `Paused ${name}`,
        error: `There was an issue trying to pause ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - pauseVM():', error);
    }
  }

  const resumeVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(resumeVMApi(id), {
        loading: `Resuming ${name}`,
        success: `Resumed ${name}`,
        error: `There was an issue trying to resume ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - resumeVM():', error);
    }
  }

  const hibernateVM = async () => {
    try {
      setIsLoading(true);
      await toast.promise(hibernateVMApi(id), {
        loading: `Hibernating ${name}`,
        success: `Hibernated ${name}`,
        error: `There was an issue trying to hibernate ${name}`
      })
      await getVMs();
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      console.error('ERROR - hibernateVM():', error);
    }
  }

  const openVNC = () => {
    const vm = vms().find((vm) => vm.id === id);
    if (vm) {
      window.open(`http://${location.hostname}${vm.vnc}`, '_blank');
    }
  }

  const unlinkVM = async (unraidVMId: string, userId: string) => {
    try {
      setIsLoading(true);
      await toast.promise(unlinkVMApi(unraidVMId, userId), {
        loading: `Unlinking ${name}`,
        success: `Unlinked ${name}`,
        error: `There was an issue trying to unlink ${name}`
      })
      await getVMsUser(userId)
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - unlinkVM():', error);
      throw error;
    }
  }


  return {
    isLoading,
    // Controls
    startVM,
    stopVM,
    restartVM,
    forceStopVM,
    removeVM,
    removeVMAndDisks,
    pauseVM,
    resumeVM,
    hibernateVM,
    openVNC,

    unlinkVM
  }
}