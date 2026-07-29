import { jwtDecode } from 'jwt-decode';
import { hasTimestampExpired } from '@unraid-vm-cp/shared-utils';
import type { IJWTPayload } from '@unraid-vm-cp/shared-types';

const ACCESS_TOKEN_KEY = 'access_token';

export const saveAccessToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const isAccessTokenValid = (): boolean => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) return false;
    const decoded = jwtDecode<IJWTPayload & { exp: number }>(accessToken);
    return !hasTimestampExpired(decoded.exp);
  } catch (error) {
    console.error('ERROR - isAccessTokenValid():', error);
    return false;
  }
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};
