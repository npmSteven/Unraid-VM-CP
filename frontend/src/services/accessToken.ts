import jwtDecode from "jwt-decode";
import { hasTimestampExpired } from "./time";

const ACCESS_TOKEN_KEY = 'access_token';

export const saveAccessToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export const isAccessTokenValid = (): boolean => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) return false;
    const decoded: any = jwtDecode(accessToken);
    return hasTimestampExpired(decoded.exp);
  } catch (error) {
    console.error('ERROR - isAccessTokenValid():', error);
    return false;
  }
}

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
