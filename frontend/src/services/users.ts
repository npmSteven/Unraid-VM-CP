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
