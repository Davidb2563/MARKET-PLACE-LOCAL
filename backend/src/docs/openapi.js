const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'LocalMarket API',
    version: '1.0.0',
    description: 'API REST para marketplace local con autenticacion, catalogo, productos de vendedor y ordenes.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Entorno local' },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Verifica el estado del backend',
        responses: { 200: { description: 'Servicio disponible' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Inicia sesion por rol',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          200: { description: 'Login exitoso' },
          401: { description: 'Credenciales incorrectas' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registra cliente o vendedor',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: {
          201: { description: 'Usuario creado' },
          409: { description: 'Correo duplicado' },
        },
      },
    },
    '/api/products': {
      get: {
        summary: 'Lista productos',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'vendorId', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Catalogo de productos' } },
      },
      post: {
        summary: 'Crea producto de vendedor',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { 201: { description: 'Producto creado' } },
      },
    },
    '/api/products/categories': {
      get: {
        summary: 'Lista categorias disponibles',
        responses: { 200: { description: 'Categorias' } },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Consulta detalle de producto',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Producto encontrado' }, 404: { description: 'No encontrado' } },
      },
      put: {
        summary: 'Actualiza producto',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { 200: { description: 'Producto actualizado' } },
      },
      delete: {
        summary: 'Elimina producto',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Producto eliminado' } },
      },
    },
    '/api/orders': {
      get: {
        summary: 'Lista ordenes',
        parameters: [{ in: 'query', name: 'customerId', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Ordenes' } },
      },
      post: {
        summary: 'Crea orden de compra',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } } },
        responses: { 201: { description: 'Orden confirmada' } },
      },
    },
  },
  components: {
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'cliente@localmarket.com' },
          password: { type: 'string', example: '123456' },
          role: { type: 'string', enum: ['cliente', 'vendedor'] },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['cliente', 'vendedor'] },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'category', 'price', 'stock', 'description'],
        properties: {
          vendorId: { type: 'integer', example: 2 },
          name: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          image: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['activo', 'pausado'] },
          location: { type: 'string' },
        },
      },
      OrderInput: {
        type: 'object',
        required: ['items'],
        properties: {
          customerId: { type: 'integer', example: 1 },
          deliveryAddress: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'integer' },
                quantity: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { openApiDocument };
