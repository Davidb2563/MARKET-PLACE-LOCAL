const db = require('./database');


db.run(`DROP TABLE IF EXISTS users`);


db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    link TEXT
  )
`);