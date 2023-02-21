import { request } from "./api";

export const authLogin = async (username: string, password: string) => {
  try {
    const json = await request({ 
      method: 'POST',
      path: '/auth/login',
      body: { username, password }
    });

    return json;
  } catch (error) {
    console.error('ERROR - authLogin()', error);
    throw error;
  }
}
