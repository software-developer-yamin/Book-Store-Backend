import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
      CREATE TYPE token_type AS ENUM ('ACCESS', 'REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL')
    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`DROP TYPE token_type`);
}
