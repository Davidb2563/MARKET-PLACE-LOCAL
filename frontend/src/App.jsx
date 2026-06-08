import { useEffect, useMemo, useState } from "react";
import { categories, demoProducts } from "./data/demoProducts";
import { api } from "./services/api";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const emptyProduct = {
  name: "",
  category: "Alimentos",
  price: "",
  stock: "",
  image: "",
  description: "",
  status: "activo",
  location: "Local",
  vendorId: 2,
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [route, setRoute] = useState("login");
  const [auth, setAuth] = useState(() => readStorage("localmarket-auth", null));
  const [products, setProducts] = useState(() => readStorage("localmarket-products", demoProducts));
  const [cart, setCart] = useState(() => readStorage("localmarket-cart", []));
  const [lastOrder, setLastOrder] = useState(null);
  const [toast, setToast] = useState("");

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.localmarketToast);
    window.localmarketToast = window.setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    localStorage.setItem("localmarket-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("localmarket-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("localmarket-auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("localmarket-auth");
    }
  }, [auth]);

  useEffect(() => {
    api.listProducts()
      .then((payload) => {
        if (Array.isArray(payload.data) && payload.data.length) {
      setProducts(payload.data);
        }
      })
      .catch((error) => {
        notify(`API no disponible: ${error.message}`);
      });
  }, []);

  const navigate = (nextRoute) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRoute(nextRoute);
  };

  const login = async (credentials) => {
    try {
      const payload = await api.login(credentials);
      setAuth(payload.user);
      navigate(payload.user.role === "vendedor" ? "vendor" : "catalog");
    } catch (error) {
      setAuth(null);
      notify(`No se pudo iniciar sesion: ${error.message}`);
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.register(payload);
      setAuth(response.user);
      notify("Cuenta creada correctamente");
      navigate(response.user.role === "vendedor" ? "vendor" : "catalog");
    } catch (error) {
      notify(`No se pudo crear la cuenta: ${error.message}`);
    }
  };

  const logout = () => {
    setAuth(null);
    setCart([]);
    navigate("login");
  };

  const addToCart = (product, quantity = 1) => {
    if (product.status !== "activo" || product.stock === 0) {
      notify("Producto no disponible");
      return;
    }
    setCart((current) => {
      const exists = current.find((item) => item.productId === product.id);
      if (exists) {
        return current.map((item) => item.productId === product.id
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item);
      }
      return [...current, { productId: product.id, quantity }];
    });
    notify("Producto agregado al carrito");
  };

  const updateCart = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setCart((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
  };

  const saveProduct = async (product) => {
    const payload = {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      vendorId: auth?.id || 2,
    };
    try {
      if (product.id) {
        const response = await api.updateProduct(product.id, payload);
        setProducts((current) => current.map((item) => item.id === product.id ? response.data : item));
        notify("Producto actualizado");
      } else {
        const response = await api.createProduct(payload);
        setProducts((current) => [response.data, ...current]);
        notify("Producto creado");
      }
      navigate("vendor");
    } catch (error) {
      notify(`No se pudo guardar el producto: ${error.message}`);
    }
  };

  const removeProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setProducts((current) => current.filter((item) => item.id !== productId));
      notify("Producto eliminado");
    } catch (error) {
      notify(`No se pudo eliminar: ${error.message}`);
    }
  };

  const checkout = async () => {
    const orderItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    try {
      const response = await api.createOrder({
        customerId: auth?.id || 1,
        items: orderItems,
        deliveryAddress: "Entrega local coordinada",
      });
      setLastOrder(response.data);
    } catch (error) {
      notify(`No se pudo finalizar la compra: ${error.message}`);
      return;
    }

    setProducts((current) => current.map((product) => {
      const item = cart.find((cartItem) => cartItem.productId === product.id);
      return item ? { ...product, stock: Math.max(0, product.stock - item.quantity) } : product;
    }));
    setCart([]);
    navigate("order");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-shell">
      {toast && <div className="toast">{toast}</div>}
      {route !== "login" && route !== "register" && (
        <Header
          auth={auth}
          cartCount={cartCount}
          navigate={navigate}
          logout={logout}
        />
      )}
      <main>
        {route === "login" && <LoginPage onLogin={login} navigate={navigate} />}
        {route === "register" && <RegisterPage onRegister={register} navigate={navigate} />}
        {route === "catalog" && (
          <CatalogPage
            products={products}
            addToCart={addToCart}
            navigate={navigate}
          />
        )}
        {route.startsWith("product:") && (
          <ProductDetail
            product={products.find((item) => item.id === Number(route.split(":")[1]))}
            addToCart={addToCart}
            navigate={navigate}
          />
        )}
        {route === "cart" && (
          <CartPage
            cart={cart}
            products={products}
            updateCart={updateCart}
            checkout={checkout}
            navigate={navigate}
          />
        )}
        {route === "order" && <OrderConfirmation order={lastOrder} navigate={navigate} />}
        {route === "vendor" && (
          <VendorDashboard
            products={products}
            navigate={navigate}
            removeProduct={removeProduct}
          />
        )}
        {route === "vendor-create" && (
          <ProductForm
            title="Crear producto"
            initialProduct={emptyProduct}
            onSubmit={saveProduct}
            navigate={navigate}
          />
        )}
        {route.startsWith("vendor-edit:") && (
          <ProductForm
            title="Editar producto"
            initialProduct={products.find((item) => item.id === Number(route.split(":")[1])) || emptyProduct}
            onSubmit={saveProduct}
            navigate={navigate}
          />
        )}
        {route === "ui-kit" && <UiKit navigate={navigate} />}
      </main>
    </div>
  );
}

function Header({ auth, cartCount, navigate, logout }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => navigate(auth?.role === "vendedor" ? "vendor" : "catalog")}>
        <span className="brand-mark">LM</span>
        <span>LocalMarket</span>
      </button>
      <nav className="nav-actions">
        {auth?.role === "cliente" && (
          <>
            <button className="ghost-btn" onClick={() => navigate("catalog")}>Catalogo</button>
            <button className="icon-btn cart-btn" onClick={() => navigate("cart")} aria-label="Carrito">
              🛒
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </>
        )}
        {auth?.role === "vendedor" && (
          <>
            <button className="ghost-btn" onClick={() => navigate("vendor")}>Dashboard</button>
            <button className="primary-btn small" onClick={() => navigate("vendor-create")}>Crear producto</button>
          </>
        )}
        <button className="ghost-btn" onClick={() => navigate("ui-kit")}>UI Kit</button>
        <button className="outline-btn small" onClick={logout}>Salir</button>
      </nav>
    </header>
  );
}

function LoginPage({ onLogin, navigate }) {
  const [role, setRole] = useState("cliente");
  const [email, setEmail] = useState("cliente@localmarket.com");
  const [password, setPassword] = useState("123456");

  const submit = (event) => {
    event.preventDefault();
    onLogin({ email, password, role });
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo-box">
          <div className="logo-icon">LM</div>
          <h1>LocalMarket</h1>
          <p>Marketplace local para comprar y vender productos de la comunidad.</p>
        </div>
        <SegmentedControl value={role} onChange={(value) => {
          setRole(value);
          setEmail(value === "vendedor" ? "vendedor@localmarket.com" : "cliente@localmarket.com");
        }} />
        <Field label="Correo electronico">
          <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Contrasena">
          <input value={password} type="password" onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        <button className="primary-btn" type="submit">Iniciar Sesion</button>
        <p className="helper-text">
          No tienes cuenta? <button type="button" onClick={() => navigate("register")}>Registrate aqui</button>
        </p>
      </form>
    </section>
  );
}

function RegisterPage({ onRegister, navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente",
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={(event) => {
        event.preventDefault();
        onRegister(form);
      }}>
        <div className="logo-box">
          <div className="logo-icon accent">+</div>
          <h1>Crear cuenta</h1>
          <p>Activa tu acceso como cliente o vendedor local.</p>
        </div>
        <SegmentedControl value={form.role} onChange={(value) => update("role", value)} />
        <Field label="Nombre">
          <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </Field>
        <Field label="Correo electronico">
          <input value={form.email} type="email" onChange={(event) => update("email", event.target.value)} required />
        </Field>
        <Field label="Contrasena">
          <input value={form.password} type="password" minLength="6" onChange={(event) => update("password", event.target.value)} required />
        </Field>
        <button className="primary-btn" type="submit">Crear Cuenta</button>
        <p className="helper-text">
          Ya tienes cuenta? <button type="button" onClick={() => navigate("login")}>Inicia sesion aqui</button>
        </p>
      </form>
    </section>
  );
}

function SegmentedControl({ value, onChange }) {
  return (
    <div className="segmented">
      <button type="button" className={value === "cliente" ? "active" : ""} onClick={() => onChange("cliente")}>Cliente</button>
      <button type="button" className={value === "vendedor" ? "active" : ""} onClick={() => onChange("vendedor")}>Vendedor</button>
    </div>
  );
}

function CatalogPage({ products, addToCart, navigate }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description} ${product.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todos" || product.category === category;
    return matchesSearch && matchesCategory;
  }), [category, products, search]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catalogo local</span>
          <h1>Productos cerca de ti</h1>
        </div>
        <div className="toolbar">
          <input className="search-input" value={search} placeholder="Buscar producto, ciudad o categoria" onChange={(event) => setSearch(event.target.value)} />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} />
        ))}
      </div>
      {!filtered.length && <EmptyState title="No encontramos productos" action="Limpiar busqueda" onClick={() => { setSearch(""); setCategory("Todos"); }} />}
    </section>
  );
}

function ProductCard({ product, addToCart, navigate }) {
  return (
    <article className="product-card">
      <ProductImage product={product} />
      <div className="product-body">
        <div className="row between">
          <span className="badge">{product.category}</span>
          <span className={`status ${product.status}`}>{product.status}</span>
        </div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="row between">
          <strong>{money.format(product.price)}</strong>
          <span className="muted">{product.location}</span>
        </div>
        <div className="button-row">
          <button className="outline-btn" onClick={() => navigate(`product:${product.id}`)}>Ver</button>
          <button className="primary-btn" onClick={() => addToCart(product)}>Agregar</button>
        </div>
      </div>
    </article>
  );
}

function ProductDetail({ product, addToCart, navigate }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <EmptyState title="Producto no encontrado" action="Volver al catalogo" onClick={() => navigate("catalog")} />;
  }

  return (
    <section className="page detail-layout">
      <ProductImage product={product} large />
      <div className="detail-panel">
        <button className="back-btn" onClick={() => navigate("catalog")}>← Volver</button>
        <span className="badge">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <dl className="spec-list">
          <div><dt>Precio</dt><dd>{money.format(product.price)}</dd></div>
          <div><dt>Stock</dt><dd>{product.stock} unidades</dd></div>
          <div><dt>Ubicacion</dt><dd>{product.location}</dd></div>
          <div><dt>Estado</dt><dd>{product.status}</dd></div>
        </dl>
        <div className="quantity-control">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
        </div>
        <div className="button-row">
          <button className="primary-btn" onClick={() => {
            addToCart(product, quantity);
            navigate("cart");
          }}>Agregar al carrito</button>
          <button className="outline-btn" onClick={() => navigate("catalog")}>Continuar comprando</button>
        </div>
      </div>
    </section>
  );
}

function CartPage({ cart, products, updateCart, checkout, navigate }) {
  const lines = cart.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.productId),
  })).filter((item) => item.product);
  const total = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!lines.length) {
    return <EmptyState title="Tu carrito esta vacio" action="Ir al catalogo" onClick={() => navigate("catalog")} />;
  }

  return (
    <section className="page cart-layout">
      <div>
        <span className="eyebrow">Carrito</span>
        <h1>Resumen de compra</h1>
        <div className="cart-list">
          {lines.map((item) => (
            <article className="cart-item" key={item.productId}>
              <ProductImage product={item.product} />
              <div>
                <h2>{item.product.name}</h2>
                <p>{money.format(item.product.price)}</p>
              </div>
              <div className="quantity-control">
                <button onClick={() => updateCart(item.productId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCart(item.productId, item.quantity + 1)}>+</button>
              </div>
              <strong>{money.format(item.product.price * item.quantity)}</strong>
            </article>
          ))}
        </div>
      </div>
      <aside className="summary-box">
        <h2>Total</h2>
        <strong>{money.format(total)}</strong>
        <button className="primary-btn" onClick={checkout}>Finalizar Compra</button>
        <button className="outline-btn" onClick={() => navigate("catalog")}>Continuar comprando</button>
      </aside>
    </section>
  );
}

function OrderConfirmation({ order, navigate }) {
  return (
    <section className="page success-page">
      <div className="success-icon">✓</div>
      <span className="eyebrow">Orden confirmada</span>
      <h1>Compra realizada correctamente</h1>
      <p>Tu pedido fue registrado y el vendedor local coordinara la entrega.</p>
      {order && (
        <div className="summary-box compact">
          <div className="row between"><span>Orden</span><strong>#{order.id}</strong></div>
          <div className="row between"><span>Total</span><strong>{money.format(order.total)}</strong></div>
          <div className="row between"><span>Estado</span><strong>{order.status}</strong></div>
        </div>
      )}
      <button className="primary-btn" onClick={() => navigate("catalog")}>Volver al Catalogo</button>
    </section>
  );
}

function VendorDashboard({ products, navigate, removeProduct }) {
  const [confirmId, setConfirmId] = useState(null);
  const vendorProducts = products;
  const active = vendorProducts.filter((product) => product.status === "activo").length;
  const totalStock = vendorProducts.reduce((sum, product) => sum + Number(product.stock), 0);
  const totalValue = vendorProducts.reduce((sum, product) => sum + Number(product.stock) * Number(product.price), 0);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Panel vendedor</span>
          <h1>Gestion de productos</h1>
        </div>
        <button className="primary-btn" onClick={() => navigate("vendor-create")}>Crear Producto</button>
      </div>
      <div className="stats-grid">
        <Stat label="Productos" value={vendorProducts.length} />
        <Stat label="Activos" value={active} />
        <Stat label="Inventario" value={totalStock} />
        <Stat label="Valor stock" value={money.format(totalValue)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vendorProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{money.format(product.price)}</td>
                <td>{product.stock}</td>
                <td><span className={`status ${product.status}`}>{product.status}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="outline-btn small" onClick={() => navigate(`vendor-edit:${product.id}`)}>Editar</button>
                    <button className="danger-btn small" onClick={() => setConfirmId(product.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmId && (
        <Modal
          title="Eliminar producto"
          text="Esta accion quitara el producto del catalogo."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeProduct(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </section>
  );
}

function ProductForm({ title, initialProduct, onSubmit, navigate }) {
  const [form, setForm] = useState(initialProduct);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section className="page form-page">
      <form className="form-panel" onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}>
        <div className="page-heading">
          <div>
            <span className="eyebrow">Vendedor</span>
            <h1>{title}</h1>
          </div>
        </div>
        <Field label="Nombre">
          <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </Field>
        <div className="form-grid">
          <Field label="Categoria">
            <select value={form.category} onChange={(event) => update("category", event.target.value)}>
              {categories.filter((item) => item !== "Todos").map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.status} onChange={(event) => update("status", event.target.value)}>
              <option value="activo">activo</option>
              <option value="pausado">pausado</option>
            </select>
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Precio">
            <input value={form.price} type="number" min="1" onChange={(event) => update("price", event.target.value)} required />
          </Field>
          <Field label="Stock">
            <input value={form.stock} type="number" min="0" onChange={(event) => update("stock", event.target.value)} required />
          </Field>
        </div>
        <Field label="Ubicacion">
          <input value={form.location} onChange={(event) => update("location", event.target.value)} required />
        </Field>
        <Field label="Imagen URL">
          <input value={form.image} onChange={(event) => update("image", event.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Descripcion">
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} required />
        </Field>
        <div className="button-row">
          <button className="primary-btn" type="submit">{form.id ? "Actualizar Producto" : "Guardar Producto"}</button>
          <button className="outline-btn" type="button" onClick={() => navigate("vendor")}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}

function UiKit({ navigate }) {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Sistema visual</span>
          <h1>UI Kit LocalMarket</h1>
        </div>
        <button className="outline-btn" onClick={() => navigate("catalog")}>Volver</button>
      </div>
      <div className="ui-grid">
        <div className="kit-panel">
          <h2>Botones</h2>
          <button className="primary-btn">Primario</button>
          <button className="outline-btn">Secundario</button>
          <button className="danger-btn">Eliminar</button>
        </div>
        <div className="kit-panel">
          <h2>Estados</h2>
          <span className="status activo">activo</span>
          <span className="status pausado">pausado</span>
          <span className="badge">Alimentos</span>
        </div>
        <div className="kit-panel">
          <h2>Campos</h2>
          <Field label="Input">
            <input placeholder="Texto" />
          </Field>
          <Field label="Textarea">
            <textarea placeholder="Descripcion" />
          </Field>
        </div>
      </div>
    </section>
  );
}

function ProductImage({ product, large = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`image-box ${large ? "large" : ""}`}>
      {!failed && product.image ? (
        <img src={product.image} alt={product.name} onError={() => setFailed(true)} />
      ) : (
        <span>{product.name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function EmptyState({ title, action, onClick }) {
  return (
    <section className="page empty-state">
      <div className="success-icon muted-icon">!</div>
      <h1>{title}</h1>
      <button className="primary-btn" onClick={onClick}>{action}</button>
    </section>
  );
}

function Modal({ title, text, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="button-row">
          <button className="outline-btn" onClick={onCancel}>Cancelar</button>
          <button className="danger-btn" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default App;
