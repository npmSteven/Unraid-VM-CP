import { createContext, createSignal, useContext } from "solid-js";
import { getVMsApi } from '../services/vms';
type VMsContextValue = {
  getVMs: () => Promise<any>
  vms: () => any[]
  clearVMs: () => void
};

const VMsContext = createContext<VMsContextValue>();

export const VMsProvider = (props: any) => {
  const [vms, setVMs] = createSignal([]);

  const getVMs = async (): Promise<any> => {
    try {
      const json = await getVMsApi();
      if (json?.success) {
        setVMs(json.payload);
      }
    } catch (error) {
      console.error('ERROR - getUser():', error);
      throw error;
    }
  };

  const clearVMs = () => {
    setVMs([]);
  }

  return (
    <VMsContext.Provider value={{ vms, getVMs, clearVMs }}>
      {props.children}
    </VMsContext.Provider>
  );
};

export const useVMs = (): VMsContextValue => useContext(VMsContext);
