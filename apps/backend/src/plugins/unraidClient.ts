import { Elysia } from "elysia";
import { config } from "../config.js";
import { UnraidClient } from "@unraid-vm-cp/unraid-client";

const unraidClient = new UnraidClient(config.unraid);

export const unraidClientPlugin = (app: Elysia) =>
  app.decorate('unraidClient', unraidClient);

export { unraidClient };
