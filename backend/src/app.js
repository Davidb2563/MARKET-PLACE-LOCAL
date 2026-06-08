const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/authRoutes');
const { productRouter } = require('./routes/productRoutes');
const { orderRouter } = require('./routes/orderRoutes');
const { healthRouter } = require('./routes/healthRoutes');
const { openApiDocument } = require('./docs/openapi');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.get('/api-docs/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.get('/api-docs', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LocalMarket API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '/api-docs/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Error interno del servidor',
  });
});

module.exports = { app };
