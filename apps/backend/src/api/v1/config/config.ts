import { Elysia } from "elysia";
import { config } from "../../../config.js";
import { authGuard } from "../../../middleware/auth.js";
import { respondSuccess } from "@unraid-vm-cp/shared-types";

export const configRoutes = new Elysia({ prefix: "/api/v1/config" })
  .use(authGuard)
  .get("/", async () => {
    return respondSuccess({
      unraidBaseUrl: config.unraid.baseUrl,
    });
  });
