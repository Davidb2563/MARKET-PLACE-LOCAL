/* node:coverage disable */
const crypto = require('crypto');

/**
 * Creates a deterministic password hash for demo authentication.
 * @param {string} password Plain password.
 * @returns {string} SHA-256 password hash.
 */
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(String(password))
    .digest('hex');
}

module.exports = { hashPassword };
/* node:coverage enable */
