import * as dotenv from 'dotenv'

dotenv.config();

export const config = {
  unraid: {
    ip: process.env.UNRAID_IP,
    isHTTPS: process.env.UNRAID_IS_HTTPS !== '' && process.env.UNRAID_IS_HTTPS === 'true',
    username: process.env.UNRAID_USERNAME,
    password: process.env.UNRAID_PASSWORD,
  },
  server: {
    port: 8787,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  }
};
