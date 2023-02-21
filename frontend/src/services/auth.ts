import { saveAccessToken } from "./accessToken";
import { request } from "./api";

export const authLogin = async (username: string, password: string) => {
  try {
    const json = await request({ 
      method: 'POST',
      path: '/auth/login',
      body: { username, password }
    });

    if (json?.success) {
      saveAccessToken(json.payload.accessToken);
    }

    return json;
  } catch (error) {
    console.error('ERROR - authLogin()', error);
    throw error;
  }
}
