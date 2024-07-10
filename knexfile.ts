import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Update with your config settings.

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    searchPath: ['knex', 'public'],
    migrations: {
      tableName: 'knex_migrations',
      directory: './knex/migrations'
    },
    seeds: {
      directory: './knex/seeds'
    },
    debug: true
  }
};

export default knexConfig;
