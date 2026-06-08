# Marketplace Local - LocalMarket

Aplicacion web para un marketplace local donde clientes pueden explorar productos, agregar articulos al carrito y confirmar compras, mientras vendedores gestionan su catalogo desde un panel administrativo.

## Tecnologias

- Frontend: React, Vite, CSS responsive.
- Backend: Node.js, Express.
- Base de datos propuesta: PostgreSQL.
- Documentacion API: OpenAPI/Swagger.
- Pruebas: Node Test Runner para unitarias e integracion, Playwright para EndToEnd.
- Contenedores: Dockerfile por aplicacion y `docker-compose.yml`.

## Arquitectura

```text
MARKET-PLACE-LOCAL/
  frontend/             SPA React con vistas cliente, vendedor y UI Kit
  backend/              API REST Express
  database/schema.sql   Modelo relacional PostgreSQL
  docker-compose.yml    Ejecucion local con frontend, backend y Postgres
```

El frontend consume la API desde `VITE_API_URL`. Si el backend no esta activo, mantiene un modo prototipo con datos en `localStorage`, util para demostraciones del flujo completo.

## Instalacion local

### Backend

```bash
cd backend
npm install
npm start
```

API disponible en `http://localhost:3000`.

Credenciales demo:

- Cliente: `cliente@localmarket.com` / `123456`
- Vendedor: `vendedor@localmarket.com` / `123456`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicacion disponible en `http://localhost:5173`.

## Variables de entorno

Backend: copiar `backend/.env.example`.

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/MARKETPLACE-LOCAL
```

Frontend: copiar `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:3000/api
```

## Rutas principales

La navegacion se maneja como SPA interna:

- Login y registro.
- Catalogo de productos.
- Detalle de producto.
- Carrito de compras.
- Confirmacion de orden.
- Dashboard de vendedor.
- Crear, editar y eliminar productos.
- Vista UI Kit.

## API REST

Swagger/OpenAPI:

- UI: `http://localhost:3000/api-docs`
- JSON: `http://localhost:3000/api-docs/openapi.json`

Endpoints implementados:

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `POST /api/orders`

## Pruebas

### Unitarias e integracion

```bash
cd backend
npm test
```

El script usa `node --test --experimental-test-coverage` e incluye pruebas de servicios y endpoints HTTP.

### EndToEnd

```bash
cd frontend
npm install
npx playwright install
npm run test:e2e
```

Pruebas E2E incluidas:

- Cliente inicia sesion y visualiza catalogo.
- Cliente agrega producto al carrito y confirma compra.
- Vendedor crea producto desde dashboard.

## Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Base de datos

El script `database/schema.sql` contiene:

- Usuarios, roles y perfiles de vendedor.
- Categorias y productos.
- Carritos e items.
- Ordenes e items de orden.
- Llaves primarias, foraneas, restricciones e indices.

