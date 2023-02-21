import { request } from "./api";

export const getUser = async () => {
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
