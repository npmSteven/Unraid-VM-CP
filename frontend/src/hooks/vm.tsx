import { createSignal } from "solid-js"
import toast from "solid-toast";
import { useVMs } from "../contexts/vms";
import { restartVMApi, startVMApi, stopVMApi, unlinkVMApi } from "../services/vms";

export const useVMActions = (id: string, name: string) => {
  const [isLoading, setIsLoading] = createSignal(false);

  const { getVMs, getVMsUser } = useVMs();

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
      console.error('ERROR - stopVM():', error);
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
    startVM,
    stopVM,
    restartVM,
    unlinkVM
  }
}