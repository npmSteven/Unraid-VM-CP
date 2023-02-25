import { request } from "./api";

export const getUserApi = async () => {
  try {
    const json = await request({ 
      path: '/users',
    });
    return json;
  } catch (error) {
    console.error('ERROR - getUsers()', error);
    throw error;
  }
}

export const createUserAPI = async (username: string, password: string) => {
  try {
    const json = await request({ 
      path: '/users',
      method: 'POST',
      body: {
        username,
        password,
      }
    });
    return json;
  } catch (error) {
    console.error('ERROR - createUserAPI():', error);
    throw error;
  }
}

export const deleteUserApi = async (id: string) => {
  try {
    const json = await request({ 
      path: `/users/${id}`,
      method: 'DELETE',
    });
    return json;
  } catch (error) {
    console.error('ERROR - deleteUserApi():', error);
    throw error;
  }
}

export const updateUserUsernameApi = async (id: string, username: string) => {
  try {
    const json = await request({ 
      path: `/users/${id}/username`,
      method: 'PUT',
      body: {
        username,
      }
    });
    return json;
  } catch (error) {
    console.error('ERROR - updateUserUsernameApi():', error);
    throw error;
  }
}

export const updateUserPasswordApi = async (id: string, password: string) => {
  try {
    const json = await request({ 
      path: `/users/${id}/password`,
      method: 'PUT',
      body: {
        password,
      }
    });
    return json;
  } catch (error) {
    console.error('ERROR - updateUserPasswordApi():', error);
    throw error;
  }
}
