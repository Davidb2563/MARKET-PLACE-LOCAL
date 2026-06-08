const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../src/app');

function withServer(run) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const { port } = server.address();
      try {
        await run(`http://127.0.0.1:${port}`);
        server.close(resolve);
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

async function jsonFetch(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json();
  return { response, body };
}

test('GET /api/health responde estado ok', () => withServer(async (baseUrl) => {
  const { response, body } = await jsonFetch(baseUrl, '/api/health');

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
}));

test('POST /api/auth/login entrega token para vendedor', () => withServer(async (baseUrl) => {
  const { response, body } = await jsonFetch(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'vendedor@localmarket.com',
      password: '123456',
      role: 'vendedor',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.user.role, 'vendedor');
  assert.ok(body.token);
}));

test('GET /api/products lista catalogo y filtra por categoria', () => withServer(async (baseUrl) => {
  const { response, body } = await jsonFetch(baseUrl, '/api/products?category=Hogar');

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body.data), true);
  assert.equal(body.data.every((product) => product.category === 'Hogar'), true);
}));

test('POST /api/orders crea una orden', () => withServer(async (baseUrl) => {
  const productsResponse = await jsonFetch(baseUrl, '/api/products');
  const product = productsResponse.body.data.find((item) => item.stock > 0);

  const { response, body } = await jsonFetch(baseUrl, '/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customerId: 1,
      items: [{ productId: product.id, quantity: 1 }],
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(body.data.items.length, 1);
  assert.equal(body.data.status, 'confirmada');
}));

test('GET /api-docs/openapi.json expone documentacion Swagger', () => withServer(async (baseUrl) => {
  const { response, body } = await jsonFetch(baseUrl, '/api-docs/openapi.json');

  assert.equal(response.status, 200);
  assert.equal(body.openapi, '3.0.3');
  assert.equal(Boolean(body.paths['/api/products']), true);
}));

test('POST /api/auth/register crea un usuario nuevo', () => withServer(async (baseUrl) => {
  const email = `nuevo-${Date.now()}@localmarket.com`;
  const { response, body } = await jsonFetch(baseUrl, '/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Nuevo Cliente',
      email,
      password: '123456',
      role: 'cliente',
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(body.user.email, email);
}));

test('PUT y DELETE /api/products gestionan producto de vendedor', () => withServer(async (baseUrl) => {
  const created = await jsonFetch(baseUrl, '/api/products', {
    method: 'POST',
    body: JSON.stringify({
      vendorId: 2,
      name: 'Producto API',
      category: 'Moda',
      price: 22000,
      stock: 2,
      description: 'Producto creado por prueba de integracion',
      status: 'activo',
      location: 'Bogota',
    }),
  });

  const productId = created.body.data.id;
  const updated = await jsonFetch(baseUrl, `/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...created.body.data, stock: 5 }),
  });
  const deleted = await jsonFetch(baseUrl, `/api/products/${productId}`, {
    method: 'DELETE',
  });

  assert.equal(created.response.status, 201);
  assert.equal(updated.body.data.stock, 5);
  assert.equal(deleted.body.data.id, productId);
}));
