const parseTrustProxy = (value?: string): boolean | number | string => {
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  const num = parseInt(value, 10);
  if (!isNaN(num)) return num;
  return value;
};

const unraidIsHTTPS = Bun.env.UNRAID_IS_HTTPS === 'true';
const unraidIp = Bun.env.UNRAID_IP!;
const unraidPort = Bun.env.UNRAID_PORT;

export const config = {
  unraid: {
    get ip() { return Bun.env.UNRAID_IP || '127.0.0.1'; },
    get port() { return Bun.env.UNRAID_PORT; },
    get isHTTPS() { return Bun.env.UNRAID_IS_HTTPS === 'true'; },
    get username() { return Bun.env.UNRAID_USERNAME || 'root'; },
    get password() { return Bun.env.UNRAID_PASSWORD || 'password'; },
    get baseUrl() {
      const isHTTPS = Bun.env.UNRAID_IS_HTTPS === 'true';
      const ip = Bun.env.UNRAID_IP || '127.0.0.1';
      const port = Bun.env.UNRAID_PORT;
      return `http${isHTTPS ? 's' : ''}://${ip}${port ? `:${port}` : ''}`;
    },
  },
  server: {
    port: parseInt(Bun.env.SERVER_PORT || '8787', 10),
    serveFrontend: Bun.env.SERVE_FRONTEND !== 'false',
    frontendDistPath: Bun.env.FRONTEND_DIST_PATH || '../frontend/dist',
    trustProxy: parseTrustProxy(Bun.env.TRUST_PROXY),
  },
  cors: {
    origin: Bun.env.CORS_ORIGIN || '*',
  },
  jwt: {
    get secret() {
      return Bun.env.JWT_SECRET || 'default_jwt_secret_dev_key';
    },
  }
};
