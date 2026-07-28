import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../../../config.js";
import { getUserByUsername } from "../../../services/user.js";
import { UnauthorizedError } from "../../../services/ErrorHandler.js";
import { respondSuccess } from "../../../services/responses.js";

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.jwt.secret,
    exp: "30d",
  }))
  .post("/login", async ({ jwt, body }) => {
    try {
      const { username, password } = body;
      const { unraid } = config;

      if (unraid.username === username && unraid.password === password) {
        const accessToken = await jwt.sign({ isUnraidUser: true, id: unraid.username });
        return respondSuccess({ accessToken });
      }

      const user = await getUserByUsername(username);
      if (!user) throw new UnauthorizedError('Username or password is incorrect');

      const isMatch = await Bun.password.verify(password, user.password);
      if (!isMatch) throw new UnauthorizedError('Username or password is incorrect');

      const accessToken = await jwt.sign({ isUnraidUser: false, id: user.id });
      return respondSuccess({ accessToken });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return Response.json(
          { success: false, payload: [error.message] },
          { status: 401 },
        );
      }
      console.error('ERROR - /login', error);
      return Response.json(
        { success: false, payload: ["Internal server error"] },
        { status: 500 },
      );
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 16 }),
      password: t.String({ minLength: 6, maxLength: 255 }),
    }),
  });
