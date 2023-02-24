import toast from "solid-toast"
import { getAccessToken, isAccessTokenValid } from "./accessToken"

type Props = {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
}

export const request = async ({
  method = 'GET',
  path,
  body = null,
}: Props) => {
  try {
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (body) {
      options.body = JSON.stringify(body);
    }
    
    if (isAccessTokenValid()) {
      const accessToken = getAccessToken();
      options.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`http://${location.hostname}:8787/api/v1${path}`, options);
    const json = await response.json();

    if (typeof json?.success === 'boolean' && !json.success) {
      json.payload.forEach((errorMsg: string) => {
        toast.error(errorMsg)
      })
      throw new Error('Request failed');
    }

    return json;
  } catch (error) {
    console.error('ERROR - request():', error);
    throw error;
  }
}
