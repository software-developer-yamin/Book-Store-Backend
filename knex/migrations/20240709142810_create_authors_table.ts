import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('authors', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('bio');
    table.date('birth_date').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('authors');
}
