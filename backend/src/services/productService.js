const { categories, products } = require('../data/store');
const { isDatabaseEnabled, query } = require('../config/database');
const { toApiProductStatus, toDbProductStatus } = require('../utils/status');

function mapProduct(row) {
  return {
    id: row.id,
    vendorId: row.vendor_user_id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    image: row.image_url || '',
    description: row.description,
    status: toApiProductStatus(row.status),
    location: row.location || 'Local',
  };
}

/**
 * Returns all category names available for products.
 * @returns {Promise<string[]>} Product categories.
 */
async function listCategories() {
  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query('SELECT name FROM categories ORDER BY name');
    return result.rows.map((row) => row.name);
  }
  /* node:coverage enable */

  return categories;
}

/**
 * Returns products matching search, category and vendor filters.
 * @param {{search?:string,category?:string,vendorId?:number}} filters Product filters.
 * @returns {Promise<object[]>} Filtered products.
 */
async function listProducts(filters = {}) {
  const search = String(filters.search || '').trim().toLowerCase();
  const category = String(filters.category || '').trim();
  const vendorId = filters.vendorId ? Number(filters.vendorId) : null;

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      SELECT p.*, c.name AS category, vp.user_id AS vendor_user_id
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN vendor_profiles vp ON vp.id = p.vendor_id
      WHERE ($1::text = '' OR LOWER(p.name || ' ' || p.description || ' ' || COALESCE(p.location, '')) LIKE '%' || $1 || '%')
        AND ($2::text = '' OR c.name = $2)
        AND ($3::int IS NULL OR vp.user_id = $3)
      ORDER BY p.created_at DESC, p.id DESC
    `, [search, category, vendorId]);

    return result.rows.map(mapProduct);
  }
  /* node:coverage enable */

  return products.filter((product) => {
    const matchesSearch = !search
      || product.name.toLowerCase().includes(search)
      || product.description.toLowerCase().includes(search)
      || product.location.toLowerCase().includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesVendor = !vendorId || product.vendorId === vendorId;
    return matchesSearch && matchesCategory && matchesVendor;
  });
}

/**
 * Finds a product by id.
 * @param {number|string} id Product id.
 * @returns {Promise<object>} Product detail.
 */
async function getProductById(id) {
  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      SELECT p.*, c.name AS category, vp.user_id AS vendor_user_id
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN vendor_profiles vp ON vp.id = p.vendor_id
      WHERE p.id = $1
      LIMIT 1
    `, [Number(id)]);

    if (!result.rows[0]) throwNotFound();
    return mapProduct(result.rows[0]);
  }
  /* node:coverage enable */

  const product = products.find((item) => item.id === Number(id));
  if (!product) throwNotFound();
  return product;
}

/**
 * Creates a product for a vendor.
 * @param {object} payload Product data.
 * @returns {Promise<object>} Created product.
 */
async function createProduct(payload) {
  await validateProduct(payload);

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      INSERT INTO products (
        vendor_id, category_id, name, description, price, stock, image_url, location, status
      )
      SELECT vp.id, c.id, $1, $2, $3, $4, $5, $6, $7
      FROM vendor_profiles vp
      JOIN categories c ON c.name = $8
      WHERE vp.user_id = $9
      RETURNING *
    `, [
      payload.name.trim(),
      payload.description.trim(),
      Number(payload.price),
      Number(payload.stock),
      payload.image || '',
      payload.location || 'Local',
      toDbProductStatus(payload.status),
      payload.category,
      Number(payload.vendorId || 2),
    ]);

    if (!result.rows[0]) {
      const error = new Error('Vendedor o categoria no encontrados');
      error.status = 400;
      throw error;
    }
    return getProductById(result.rows[0].id);
  }
  /* node:coverage enable */

  const product = {
    id: Date.now(),
    vendorId: Number(payload.vendorId || 2),
    name: payload.name.trim(),
    category: payload.category,
    price: Number(payload.price),
    stock: Number(payload.stock),
    image: payload.image || '',
    description: payload.description.trim(),
    status: payload.status || 'activo',
    location: payload.location || 'Local',
  };
  products.unshift(product);
  return product;
}

/**
 * Updates an existing product.
 * @param {number|string} id Product id.
 * @param {object} payload Product data.
 * @returns {Promise<object>} Updated product.
 */
async function updateProduct(id, payload) {
  const product = await getProductById(id);
  await validateProduct({ ...product, ...payload });

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      UPDATE products p
      SET
        category_id = c.id,
        name = $1,
        description = $2,
        price = $3,
        stock = $4,
        image_url = $5,
        location = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      FROM categories c
      WHERE p.id = $8
        AND c.name = $9
      RETURNING p.id
    `, [
      payload.name ?? product.name,
      payload.description ?? product.description,
      Number(payload.price ?? product.price),
      Number(payload.stock ?? product.stock),
      payload.image ?? product.image,
      payload.location ?? product.location,
      toDbProductStatus(payload.status ?? product.status),
      Number(id),
      payload.category ?? product.category,
    ]);

    if (!result.rows[0]) throwNotFound();
    return getProductById(id);
  }
  /* node:coverage enable */

  Object.assign(product, {
    ...payload,
    price: Number(payload.price ?? product.price),
    stock: Number(payload.stock ?? product.stock),
  });
  return product;
}

/**
 * Deletes a product by id.
 * @param {number|string} id Product id.
 * @returns {Promise<object>} Deleted product.
 */
async function deleteProduct(id) {
  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const product = await getProductById(id);
    await query('DELETE FROM products WHERE id = $1', [Number(id)]);
    return product;
  }
  /* node:coverage enable */

  const index = products.findIndex((item) => item.id === Number(id));
  if (index < 0) throwNotFound();
  const [deleted] = products.splice(index, 1);
  return deleted;
}

async function validateProduct(product) {
  if (!product.name || !product.category || !product.description) {
    const error = new Error('Nombre, categoria y descripcion son obligatorios');
    error.status = 400;
    throw error;
  }
  const validCategories = await listCategories();
  if (!validCategories.includes(product.category)) {
    const error = new Error('Categoria no valida');
    error.status = 400;
    throw error;
  }
  if (Number(product.price) <= 0 || Number(product.stock) < 0) {
    const error = new Error('Precio y stock deben ser valores validos');
    error.status = 400;
    throw error;
  }
}

function throwNotFound() {
  const error = new Error('Producto no encontrado');
  error.status = 404;
  throw error;
}

module.exports = {
  categories,
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  listProducts,
  updateProduct,
};
