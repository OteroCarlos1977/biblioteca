const hardcodedDatabase = require('./hardcodedDatabase');
const mysqlConnection = require('./mysqlConnection');
const sqliteConnection = require('./sqliteConnection');
const postgresConnection = require('./postgresConnection');
const firebaseConnection = require('./firebaseConnection');

// Selector central de origen de datos.
// Si el proyecto cambia de hardcoded a MySQL/PostgreSQL/etc., los controllers
// siguen importando desde ../database y no necesitan conocer el motor real.
const provider = process.env.DB_PROVIDER || 'hardcoded';

const databases = {
  hardcoded: hardcodedDatabase,
  mysql: mysqlConnection,
  sqlite: sqliteConnection,
  postgres: postgresConnection,
  firebase: firebaseConnection,
};

if (!databases[provider]) {
  throw new Error(`DB_PROVIDER invalido: ${provider}`);
}

module.exports = databases[provider];
