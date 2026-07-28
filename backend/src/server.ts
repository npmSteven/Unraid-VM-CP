import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { config } from "./config.js";
import { unraidClientPlugin } from "./plugins/unraidClient.js";
import { authRoutes } from "./api/v1/auth/auth.js";
import { configRoutes } from "./api/v1/config/config.js";
import { userRoutes } from "./api/v1/users/users.js";
import { vmRoutes } from "./api/v1/vms/vms.js";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(unraidClientPlugin)
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

const server = app.listen(
  { port: config.server.port, hostname: "0.0.0.0" },
  () => {
    console.log(`Backend has started on port ${config.server.port}`);
  },
);

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, draining connections...`);
  await server.stop();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
