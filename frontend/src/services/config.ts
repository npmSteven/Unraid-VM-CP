import { request } from './api';

let cachedUnraidBaseUrl: string | null = null;

export const getUnraidBaseUrl = async (): Promise<string> => {
  if (cachedUnraidBaseUrl) return cachedUnraidBaseUrl;
  const res = await request({ path: '/config' });
  cachedUnraidBaseUrl = res.payload.unraidBaseUrl;
  return cachedUnraidBaseUrl!;
};
