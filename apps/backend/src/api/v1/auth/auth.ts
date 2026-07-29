import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../../../config.js";
import { getUserByUsername } from "../../../services/user.js";
import { respondSuccess, respondErrorMessage, respond } from "@unraid-vm-cp/shared-types";
import { err, ok } from "neverthrow";
import { AppErr } from "@unraid-vm-cp/shared-types";

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.jwt.secret,
    exp: "30d",
  }))
  .post("/login", async ({ jwt, body }) => {
    const { username, password } = body;
    const { unraid } = config;

    if (unraid.username === username && unraid.password === password) {
      const accessToken = await jwt.sign({ isUnraidUser: true, id: unraid.username });
      return respondSuccess({ accessToken });
    }

    const userRes = getUserByUsername(username);
    if (userRes.isErr()) {
      return respond(err(userRes.error));
    }
    const user = userRes.value;

    if (!user) {
      return respond(err(AppErr.unauthorized('Username or password is incorrect')));
    }

    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      return respond(err(AppErr.unauthorized('Username or password is incorrect')));
    }

    const accessToken = await jwt.sign({ isUnraidUser: false, id: user.id });
    return respondSuccess({ accessToken });
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 16 }),
      password: t.String({ minLength: 6, maxLength: 255 }),
    }),
  });
