import { createSignal } from "solid-js"
import toast from "solid-toast";
import { useVMs } from "../contexts/vms";
import { restartVMApi, startVMApi, stopVMApi } from "../services/vms";

export const useVMControls = (id: string, name: string) => {
  const [isLoading, setIsLoading] = createSignal(false);

  const {getVMs} = useVMs();

  const runActionAndGetVMs = async (action: Promise<any>) => {
    try {
      setIsLoading(true);
      const json = await action;
      if (!json.success) throw new Error('Failed to run action');
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
      console.error('ERROR - stopVM():', error);
    }
  }

  const restartVM = async () => {
    try {
      toast.promise(runActionAndGetVMs(restartVMApi(id)), {
        loading: `Restarting ${name}`,
        success: `Restarted ${name}`,
        error: `There was an issue trying to restart ${name}`
      })
    } catch (error) {
      console.error('ERROR - stopVM():', error);
    }
  }

  return {
    isLoading,
    startVM,
    stopVM,
    restartVM,
  }
}