import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      CREATE TYPE role AS ENUM ('USER', 'ADMIN')
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`DROP TYPE role`);
}
