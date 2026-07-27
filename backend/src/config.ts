import * as dotenv from 'dotenv'

dotenv.config();

const parseTrustProxy = (value?: string): boolean | number | string => {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  const num = parseInt(value, 10);
  if (!isNaN(num)) return num;
  return value;
};

const unraidIsHTTPS = process.env.UNRAID_IS_HTTPS !== '' && process.env.UNRAID_IS_HTTPS === 'true';
const unraidIp = process.env.UNRAID_IP;

export const config = {
  unraid: {
    ip: unraidIp,
    isHTTPS: unraidIsHTTPS,
    username: process.env.UNRAID_USERNAME,
    password: process.env.UNRAID_PASSWORD,
    baseUrl: `http${unraidIsHTTPS ? 's' : ''}://${unraidIp}`,
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '8787', 10),
    serveFrontend: process.env.SERVE_FRONTEND !== 'false',
    frontendDistPath: process.env.FRONTEND_DIST_PATH || '../frontend/dist',
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  }
};
