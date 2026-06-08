const { users } = require('../data/store');
const { isDatabaseEnabled, query, transaction } = require('../config/database');
const { hashPassword } = require('../utils/password');

function toSafeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

/**
 * Authenticates a user with email, password and an optional role.
 * @param {{email:string,password:string,role?:string}} credentials Login credentials.
 * @returns {Promise<{token:string,user:object}>} Authenticated user payload.
 */
async function login(credentials) {
  const email = String(credentials.email || '').trim().toLowerCase();
  const password = String(credentials.password || '');
  const role = credentials.role;

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const result = await query(`
      SELECT u.id, u.name, u.email, u.password_hash, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE LOWER(u.email) = $1
        AND u.status = 'active'
        AND ($2::text IS NULL OR r.name = $2)
      LIMIT 1
    `, [email, role || null]);

    const user = result.rows[0];
    if (!user || user.password_hash !== hashPassword(password)) {
      throwUnauthorized();
    }

    const safeUser = toSafeUser(user);
    return {
      token: `demo-token-${safeUser.role}-${safeUser.id}`,
      user: safeUser,
    };
  }
  /* node:coverage enable */

  const user = users.find((item) => (
    item.email.toLowerCase() === email
    && item.password === password
    && (!role || item.role === role)
  ));

  if (!user) throwUnauthorized();

  const { password: hiddenPassword, ...safeUser } = user;
  return {
    token: `demo-token-${safeUser.role}-${safeUser.id}`,
    user: safeUser,
  };
}

/**
 * Registers a new marketplace user and creates related cart/vendor records.
 * @param {{name:string,email:string,password:string,role:string}} payload User registration data.
 * @returns {Promise<{token:string,user:object}>} Created user payload.
 */
async function register(payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const role = payload.role === 'vendedor' ? 'vendedor' : 'cliente';

  if (!name || !email || password.length < 6) {
    const error = new Error('Nombre, correo y contrasena de minimo 6 caracteres son obligatorios');
    error.status = 400;
    throw error;
  }

  /* node:coverage disable */
  if (isDatabaseEnabled) {
    const user = await transaction(async (client) => {
      const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
      if (existing.rows.length) {
        const error = new Error('El correo ya se encuentra registrado');
        error.status = 409;
        throw error;
      }

      const created = await client.query(`
        INSERT INTO users (role_id, name, email, password_hash)
        SELECT r.id, $1, $2, $3
        FROM roles r
        WHERE r.name = $4
        RETURNING id, name, email
      `, [name, email, hashPassword(password), role]);

      const safeUser = { ...created.rows[0], role };
      if (role === 'cliente') {
        await client.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [safeUser.id]);
      }
      if (role === 'vendedor') {
        await client.query(`
          INSERT INTO vendor_profiles (user_id, store_name, city)
          VALUES ($1, $2, 'Local')
          ON CONFLICT (user_id) DO NOTHING
        `, [safeUser.id, name]);
      }
      return safeUser;
    });

    return {
      token: `demo-token-${user.role}-${user.id}`,
      user,
    };
  }
  /* node:coverage enable */

  if (users.some((user) => user.email.toLowerCase() === email)) {
    const error = new Error('El correo ya se encuentra registrado');
    error.status = 409;
    throw error;
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role,
  };
  users.push(user);

  return login({ email, password, role });
}

function throwUnauthorized() {
  const error = new Error('Credenciales incorrectas');
  error.status = 401;
  throw error;
}

module.exports = {
  login,
  register,
};
