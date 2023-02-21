import { request } from "./api";

export const getVMsApi = async () => {
  try {
    const json = await request({ 
      path: '/vms',
    });
    return json;
  } catch (error) {
    console.error('ERROR - getVMsApi()', error);
    throw error;
  }
}

export const startVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/start`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - startVMApi()', error);
    throw error;
  }
}

export const stopVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/stop`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - stopVMApi()', error);
    throw error;
  }
}
