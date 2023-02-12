
export const config = {
  unraid: {
    ip: process.env.UNRAID_IP,
    username: process.env.UNRAID_USERNAME,
    password: process.env.UNRAID_PASSWORD,
  },
  server: {
    port: 8000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  }
};
