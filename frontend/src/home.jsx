import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState(""); // 👈 NUEVO

  // cargar usuarios
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  // enviar datos
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, link }) // 👈 ENVÍAS LINK
    })
      .then(res => res.json())
      .then(newUser => {
        setUsers([...users, newUser]);
        setName("");
        setEmail("");
        setLink(""); // 👈 limpiar
      });
  };

  return (
    <div>
      <h1>Usuarios</h1>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

    
        <input
          type="text"
          placeholder="Link (opcional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <button type="submit">Agregar</button>
      </form>

      {/* LISTA */}
      {users.map(user => (
        <div key={user.id} style={{ marginBottom: "15px" }}>
          <p>{user.name}</p>

          <Link to={`/user/${encodeURIComponent(user.email)}`}>
            {user.email}
          </Link>

          {user.link && (
            <p>
              🔗{" "}
              <a
                href={
                  user.link.startsWith("http")
                    ? user.link
                    : `https://${user.link}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.link}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Home;