import { createContext, createSignal, useContext } from "solid-js";
import { getVMsApi, getVMsUserApi } from '../services/vms';
type VMsContextValue = {
  getVMs: () => Promise<any>
  vms: () => any[]
  getVMsUser: (id: string) => Promise<any>
  vmsUser: () => any[]
  clearVMs: () => void
};

const VMsContext = createContext<VMsContextValue>();

export const VMsProvider = (props: any) => {
  const [vms, setVMs] = createSignal([]);
  const [vmsUser, setVMsUser] = createSignal([]);

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

  const getVMsUser = async (id: string): Promise<any> => {
    try {
      const json = await getVMsUserApi(id);
      if (json?.success) {
        setVMsUser(json.payload);
      }
    } catch (error) {
      console.error('ERROR - getUser():', error);
      throw error;
    }
  };

  const clearVMs = () => {
    setVMs([]);
    setVMsUser([]);
  }

  return (
    <VMsContext.Provider value={{ vms, getVMs, clearVMs, getVMsUser, vmsUser }}>
      {props.children}
    </VMsContext.Provider>
  );
};

export const useVMs = (): VMsContextValue => useContext(VMsContext);
