const { orders } = require('../data/store');
const { isDatabaseEnabled, transaction, query } = require('../config/database');
const { getProductById } = require('./productService');
const { toApiOrderStatus } = require('../utils/status');

function mapOrder(row, items = []) {
  return {
    id: row.id,
    customerId: row.customer_id,
    items,
    total: Number(row.total),
    status: toApiOrderStatus(row.status),
    deliveryAddress: row.delivery_address || 'Recoger en tienda',
    createdAt: row.created_at,
  };
}

/**
 * Creates an order and calculates totals from current product prices.
 * @param {{customerId:number,items:Array<{productId:number,quantity:number}>,deliveryAddress?:string}} payload Order data.
 * @returns {Promise<object>} Created order.
 */
async function createOrder(payload) {
  const customerId = Number(payload.customerId || 1);
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!items.length) {
    const error = new Error('La orden debe incluir al menos un producto');
    error.status = 400;
    throw error;
  }

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    return transaction(async (client) => {
      const orderItems = [];

      for (const item of items) {
        const productResult = await client.query(`
          SELECT p.id, p.name, p.price, p.stock, p.vendor_id
          FROM products p
          WHERE p.id = $1
          FOR UPDATE
        `, [Number(item.productId)]);

        const product = productResult.rows[0];
        if (!product) {
          const error = new Error('Producto no encontrado');
          error.status = 404;
          throw error;
        }

        const quantity = Math.max(1, Number(item.quantity || 1));
        if (Number(product.stock) < quantity) {
          const error = new Error(`Stock insuficiente para ${product.name}`);
          error.status = 400;
          throw error;
        }

        await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [quantity, product.id],
        );

        orderItems.push({
          productId: product.id,
          vendorId: product.vendor_id,
          name: product.name,
          quantity,
          unitPrice: Number(product.price),
          subtotal: Number(product.price) * quantity,
        });
      }

      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const createdOrder = await client.query(`
        INSERT INTO orders (customer_id, total, status, delivery_address)
        VALUES ($1, $2, 'confirmed', $3)
        RETURNING *
      `, [customerId, total, payload.deliveryAddress || 'Recoger en tienda']);

      for (const item of orderItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          createdOrder.rows[0].id,
          item.productId,
          item.vendorId,
          item.quantity,
          item.unitPrice,
          item.subtotal,
        ]);
      }

      return mapOrder(createdOrder.rows[0], orderItems);
    });
  }
  /* node:coverage enable */

  const orderItems = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    const quantity = Math.max(1, Number(item.quantity || 1));

    if (product.stock < quantity) {
      const error = new Error(`Stock insuficiente para ${product.name}`);
      error.status = 400;
      throw error;
    }

    product.stock -= quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    });
  }

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const order = {
    id: Date.now(),
    customerId,
    items: orderItems,
    total,
    status: 'confirmada',
    deliveryAddress: payload.deliveryAddress || 'Recoger en tienda',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  return order;
}

/**
 * Lists orders for a customer.
 * @param {number|string} customerId Customer id.
 * @returns {Promise<object[]>} Customer orders.
 */
async function listOrders(customerId) {
  const parsedCustomerId = customerId ? Number(customerId) : null;

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      SELECT *
      FROM orders
      WHERE ($1::int IS NULL OR customer_id = $1)
      ORDER BY created_at DESC
    `, [parsedCustomerId]);

    const mapped = [];
    for (const order of result.rows) {
      const items = await query(`
        SELECT
          oi.product_id AS "productId",
          p.name,
          oi.quantity,
          oi.unit_price AS "unitPrice",
          oi.subtotal
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
      `, [order.id]);
      mapped.push(mapOrder(order, items.rows.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      }))));
    }
    return mapped;
  }
  /* node:coverage enable */

  return orders.filter((order) => !parsedCustomerId || order.customerId === parsedCustomerId);
}

module.exports = {
  createOrder,
  listOrders,
};
