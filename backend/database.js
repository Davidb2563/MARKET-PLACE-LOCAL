const sqlite3 = require('sqlite3').verbose();

// crea o abre la base de datos
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

module.exports = db;