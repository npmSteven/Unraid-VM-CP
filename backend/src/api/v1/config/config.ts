import { Elysia } from "elysia";
import { config } from "../../../config.js";
import { authGuard } from "../../../middleware/auth.js";
import { errorHandler } from "../../../services/ErrorHandler.js";
import { respondSuccess } from "../../../services/responses.js";

export const configRoutes = new Elysia({ prefix: "/api/v1/config" })
  .use(authGuard)
  .get("/", async () => {
    try {
      return respondSuccess({
        unraidBaseUrl: config.unraid.baseUrl,
      });
    } catch (error) {
      return errorHandler(error as Error);
    }
  });
