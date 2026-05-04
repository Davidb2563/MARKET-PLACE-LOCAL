require('./initDB');

const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());


// 👉 RUTA 1: obtener TODOS los usuarios
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});


// 👉 RUTA 2: obtener usuario por EMAIL
app.get('/users/:email', (req, res) => {
  const email = req.params.email;

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) return res.status(500).json(err);
      res.json(row);
    }
  );
});


// 👉 RUTA 3: crear usuario (CON LINK)
app.post('/users', (req, res) => {
  const { name, email, link } = req.body;

  db.run(
    `INSERT INTO users (name, email, link) VALUES (?, ?, ?)`,
    [name, email, link],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        id: this.lastID,
        name,
        email,
        link
      });
    }
  );
});


// 👉 INICIAR SERVIDOR
app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});