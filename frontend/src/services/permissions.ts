import { request } from "./api";

export const updatePermissionsAPI = async (unraidVMId: string, userId: string, permissions: any) => {
  try {
    const json = await request({
      method: 'PUT',
      path: `/vms/${unraidVMId}/users/${userId}/permissions`,
      body: permissions,
    });
    
    return json;
  } catch (error) {
    console.error('ERROR - updatePermissionsAPI():', error);
    throw error;
  }
}
