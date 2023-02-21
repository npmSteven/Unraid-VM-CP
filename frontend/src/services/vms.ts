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
