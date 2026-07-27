import { Sequelize } from 'sequelize';
import BetterSqlite3 from 'better-sqlite3';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  dialectModule: BetterSqlite3,
  logging: false,
});
