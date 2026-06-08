/* node:coverage disable */
const { demoProducts } = require('./seedProducts');
const { query, isDatabaseEnabled } = require('../config/database');
const { hashPassword } = require('../utils/password');
const { toDbProductStatus } = require('../utils/status');

/**
 * Seeds the PostgreSQL database with demo users, vendor profile and products.
 * It is idempotent and only inserts records that do not already exist.
 * @returns {Promise<void>}
 */
async function seedDatabase() {
  if (!isDatabaseEnabled) return;

  await query(`
    INSERT INTO roles (name)
    VALUES ('cliente'), ('vendedor'), ('admin')
    ON CONFLICT (name) DO NOTHING
  `);

  await query(`
    INSERT INTO categories (name, description)
    VALUES
      ('Alimentos', 'Productos alimenticios locales'),
      ('Artesanias', 'Productos hechos a mano'),
      ('Hogar', 'Articulos para casa'),
      ('Moda', 'Ropa y accesorios'),
      ('Tecnologia', 'Accesorios tecnologicos')
    ON CONFLICT (name) DO NOTHING
  `);

  await query(`
    INSERT INTO users (role_id, name, email, password_hash)
    SELECT r.id, 'Cliente Demo', 'cliente@localmarket.com', $1
    FROM roles r
    WHERE r.name = 'cliente'
    ON CONFLICT (email) DO NOTHING
  `, [hashPassword('123456')]);

  await query(`
    INSERT INTO users (role_id, name, email, password_hash)
    SELECT r.id, 'Tienda Andina', 'vendedor@localmarket.com', $1
    FROM roles r
    WHERE r.name = 'vendedor'
    ON CONFLICT (email) DO NOTHING
  `, [hashPassword('123456')]);

  await query(`
    INSERT INTO carts (user_id)
    SELECT u.id
    FROM users u
    WHERE u.email = 'cliente@localmarket.com'
    ON CONFLICT (user_id) DO NOTHING
  `);

  await query(`
    INSERT INTO vendor_profiles (user_id, store_name, description, city, address)
    SELECT u.id, 'Tienda Andina', 'Emprendimiento local con productos seleccionados.', 'Bogota', 'Centro'
    FROM users u
    WHERE u.email = 'vendedor@localmarket.com'
    ON CONFLICT (user_id) DO NOTHING
  `);

  const count = await query('SELECT COUNT(*)::int AS total FROM products');
  if (count.rows[0].total > 0) return;

  for (const product of demoProducts) {
    await query(`
      INSERT INTO products (
        vendor_id, category_id, name, description, price, stock, image_url, location, status
      )
      SELECT vp.id, c.id, $1, $2, $3, $4, $5, $6, $7
      FROM vendor_profiles vp
      JOIN users u ON u.id = vp.user_id
      JOIN categories c ON c.name = $8
      WHERE u.email = 'vendedor@localmarket.com'
    `, [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.image,
      product.location,
      toDbProductStatus(product.status),
      product.category,
    ]);
  }
}

module.exports = { seedDatabase };
/* node:coverage enable */
