import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { config } from "./config.js";
import { authRoutes } from "./api/v1/auth/auth.js";
import { configRoutes } from "./api/v1/config/config.js";
import { userRoutes } from "./api/v1/users/users.js";
import { vmRoutes } from "./api/v1/vms/vms.js";

const app = new Elysia()
  .use(cors({
    origin: config.cors.origin,
    credentials: true,
  }))
  .use(authRoutes)
  .use(configRoutes)
  .use(userRoutes)
  .use(vmRoutes);

if (config.server.serveFrontend) {
  app.use(staticPlugin({
    assets: config.server.frontendDistPath,
    prefix: "/",
    alwaysStatic: false,
  }));
  app.get("*", ({ path }) => {
    if (path.startsWith("/api/")) return;
    return Bun.file(`${config.server.frontendDistPath}/index.html`);
  });
}

app.listen(config.server.port, () => {
  console.log(`Backend has started on port ${config.server.port}`);
});
