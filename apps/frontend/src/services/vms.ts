import { request } from "./api";

export const getVMsApi = async () => {
  try {
    const json = await request({ 
      path: '/vms',
    });
    return json;
  } catch (error) {
    console.error('ERROR - getVMsApi():', error);
    throw error;
  }
}

export const getVMApi = async (unraidVMId: string, userId: string) => {
  try {
    const json = await request({ 
      path: `/vms/${unraidVMId}/users/${userId}`,
    });
    return json;
  } catch (error) {
    console.error('ERROR - getVMApi():', error);
    throw error;
  }
}

export const getVMsUserApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/users/${id}`,
    });
    return json;
  } catch (error) {
    console.error('ERROR - getVMsUserApi():', error);
    throw error;
  }
}

export const getLinkableVMs = async (userId: string) => {
  try {
    const json = await request({ 
      path: `/vms/users/${userId}/linkable`,
    });
    return json;
  } catch (error) {
    console.error('ERROR - getLinkableVMs():', error);
    throw error;
  }
}

export const linkVMApi = async (unraidVMId: string, userId: string) => {
  try {
    const json = await request({ 
      path: `/vms/${unraidVMId}/users/${userId}`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - linkVMApi()::', error);
    throw error;
  }
}

export const unlinkVMApi = async (unraidVMId: string, userId: string) => {
  try {
    const json = await request({ 
      path: `/vms/${unraidVMId}/users/${userId}`,
      method: 'DELETE',
    });
    return json;
  } catch (error) {
    console.error('ERROR - unlinkVMApi()::', error);
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
    console.error('ERROR - startVMApi():', error);
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
    console.error('ERROR - stopVMApi():', error);
    throw error;
  }
}

export const restartVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/restart`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - restartVMApi():', error);
    throw error;
  }
}

export const forceStopVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/force-stop`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - forceStopVMApi():', error);
    throw error;
  }
}

export const removeVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/remove-vm`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - removeVMApi():', error);
    throw error;
  }
}

export const removeVMAndDisksApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/remove-vm-and-disks`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - removeVMAndDisksApi():', error);
    throw error;
  }
}

export const pauseVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/pause`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - pauseVMApi():', error);
    throw error;
  }
}

export const resumeVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/resume`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - resumeVMApi():', error);
    throw error;
  }
}

export const hibernateVMApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/vms/${id}/hibernate`,
      method: 'POST',
    });
    return json;
  } catch (error) {
    console.error('ERROR - hibernateVMApi():', error);
    throw error;
  }
}
