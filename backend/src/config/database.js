/* node:coverage disable */
require('dotenv').config({ quiet: true });

const { Pool } = require('pg');

const isDatabaseEnabled = Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== 'test';

const pool = isDatabaseEnabled
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  : null;

/**
 * Runs a SQL query using the configured PostgreSQL pool.
 * @param {string} sql SQL statement with positional parameters.
 * @param {Array<unknown>} params Query parameters.
 * @returns {Promise<import('pg').QueryResult>} PostgreSQL query result.
 */
function query(sql, params = []) {
  if (!pool) {
    throw new Error('DATABASE_URL no esta configurada');
  }
  return pool.query(sql, params);
}

/**
 * Executes multiple SQL operations inside a transaction.
 * @param {(client: import('pg').PoolClient) => Promise<unknown>} callback Transaction callback.
 * @returns {Promise<unknown>} Callback result after commit.
 */
async function transaction(callback) {
  if (!pool) {
    throw new Error('DATABASE_URL no esta configurada');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  isDatabaseEnabled,
  pool,
  query,
  transaction,
};
/* node:coverage enable */
