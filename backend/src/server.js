const { app } = require('./app');
const { seedDatabase } = require('./data/seedDatabase');

const PORT = process.env.PORT || 3000;

seedDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error.message);
    process.exit(1);
  });
