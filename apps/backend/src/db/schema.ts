import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});

export const vms = sqliteTable("vms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  unraidVMId: text("unraidVMId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});

export const userVmPermissions = sqliteTable("user_vm_permissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  vmId: text("vmId").notNull(),
  userId: text("userId").notNull(),
  canStart: integer("canStart", { mode: "boolean" }).default(false),
  canStop: integer("canStop", { mode: "boolean" }).default(false),
  canRemoveVM: integer("canRemoveVM", { mode: "boolean" }).default(false),
  canRemoveVMAndDisks: integer("canRemoveVMAndDisks", { mode: "boolean" }).default(false),
  canForceStop: integer("canForceStop", { mode: "boolean" }).default(false),
  canRestart: integer("canRestart", { mode: "boolean" }).default(false),
  canPause: integer("canPause", { mode: "boolean" }).default(false),
  canHibernate: integer("canHibernate", { mode: "boolean" }).default(false),
  canResume: integer("canResume", { mode: "boolean" }).default(false),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});

export const userVmActions = sqliteTable("user_vm_actions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  vmId: text("vmId").notNull(),
  userId: text("userId").notNull(),
  action: text("action").notNull(),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
});
