import { sql } from "drizzle-orm";
import db from "./index.js";

export const ensureTables = () => {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS vms (
      id TEXT PRIMARY KEY,
      unraidVMId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS user_vm_permissions (
      id TEXT PRIMARY KEY,
      vmId TEXT NOT NULL,
      userId TEXT NOT NULL,
      canStart INTEGER DEFAULT 0,
      canStop INTEGER DEFAULT 0,
      canRemoveVM INTEGER DEFAULT 0,
      canRemoveVMAndDisks INTEGER DEFAULT 0,
      canForceStop INTEGER DEFAULT 0,
      canRestart INTEGER DEFAULT 0,
      canPause INTEGER DEFAULT 0,
      canHibernate INTEGER DEFAULT 0,
      canResume INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS user_vm_actions (
      id TEXT PRIMARY KEY,
      vmId TEXT NOT NULL,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
};
