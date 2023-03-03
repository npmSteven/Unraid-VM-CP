import * as dotenv from 'dotenv'

dotenv.config();

export const config = {
  unraid: {
    ip: process.env.UNRAID_IP,
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
