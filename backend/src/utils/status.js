/* node:coverage disable */
function toApiProductStatus(status) {
  return status === 'paused' ? 'pausado' : 'activo';
}

function toDbProductStatus(status) {
  return status === 'pausado' ? 'paused' : 'active';
}

function toApiOrderStatus(status) {
  return status === 'confirmed' ? 'confirmada' : status;
}

module.exports = {
  toApiOrderStatus,
  toApiProductStatus,
  toDbProductStatus,
};
/* node:coverage enable */
