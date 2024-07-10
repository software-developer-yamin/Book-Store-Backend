import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('name');
    table.string('password').notNullable();
    table.enu('role', ['USER', 'ADMIN']).defaultTo('USER').notNullable();
    table.boolean('is_email_verified').defaultTo(false).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
