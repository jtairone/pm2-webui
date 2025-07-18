const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true
});

// Cria a tabela de usuários se não existir
async function initializeDatabase() {
  const hasUsersTable = await db.schema.hasTable('users');
  if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.boolean('is_admin').defaultTo(false);
      table.string('photo_url');
      table.timestamps(true, true);
    });
    //console.log('Tabela de usuários criada com sucesso!');
  }
}

module.exports = { db, initializeDatabase };