const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.mensaje || "Error de servidor");
  }

  return payload;
}

export const api = {
  login: (body) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  }),
  register: (body) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  }),
  listProducts: () => request("/products"),
  createProduct: (body) => request("/products", {
    method: "POST",
    body: JSON.stringify(body),
  }),
  updateProduct: (id, body) => request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  }),
  deleteProduct: (id) => request(`/products/${id}`, {
    method: "DELETE",
  }),
  createOrder: (body) => request("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  }),
};
