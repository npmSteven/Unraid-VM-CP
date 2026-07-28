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
    ip: unraidIp,
    port: unraidPort,
    isHTTPS: unraidIsHTTPS,
    username: Bun.env.UNRAID_USERNAME!,
    password: Bun.env.UNRAID_PASSWORD!,
    baseUrl: `http${unraidIsHTTPS ? 's' : ''}://${unraidIp}${unraidPort ? `:${unraidPort}` : ''}`,
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
    secret: Bun.env.JWT_SECRET!,
  }
};
