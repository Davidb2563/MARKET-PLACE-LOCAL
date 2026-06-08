const test = require('node:test');
const assert = require('node:assert/strict');
const { login, register } = require('../src/services/authService');
const {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} = require('../src/services/productService');
const { createOrder } = require('../src/services/orderService');

test('login autentica usuarios demo por rol', async () => {
  const result = await login({
    email: 'cliente@localmarket.com',
    password: '123456',
    role: 'cliente',
  });

  assert.equal(result.user.role, 'cliente');
  assert.match(result.token, /demo-token-cliente/);
});

test('register valida correos duplicados', async () => {
  await assert.rejects(() => register({
    name: 'Cliente Demo',
    email: 'cliente@localmarket.com',
    password: '123456',
    role: 'cliente',
  }), /registrado/);
});

test('product service filtra, crea, actualiza y elimina productos', async () => {
  const created = await createProduct({
    vendorId: 2,
    name: 'Producto de prueba',
    category: 'Hogar',
    price: 10000,
    stock: 4,
    description: 'Producto usado para pruebas unitarias',
    status: 'activo',
    location: 'Bogota',
  });

  assert.equal((await getProductById(created.id)).name, 'Producto de prueba');
  assert.equal((await listProducts({ search: 'prueba' })).some((item) => item.id === created.id), true);

  const updated = await updateProduct(created.id, { ...created, stock: 9 });
  assert.equal(updated.stock, 9);

  const deleted = await deleteProduct(created.id);
  assert.equal(deleted.id, created.id);
});

test('createOrder calcula total y descuenta inventario', async () => {
  const product = await createProduct({
    vendorId: 2,
    name: 'Ordenable',
    category: 'Alimentos',
    price: 5000,
    stock: 3,
    description: 'Producto para orden',
    status: 'activo',
    location: 'Cali',
  });

  const order = await createOrder({
    customerId: 1,
    items: [{ productId: product.id, quantity: 2 }],
  });

  assert.equal(order.total, 10000);
  assert.equal((await getProductById(product.id)).stock, 1);
  await deleteProduct(product.id);
});
