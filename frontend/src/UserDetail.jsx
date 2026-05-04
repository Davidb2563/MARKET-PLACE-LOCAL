import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Chatwsp1 from "./CHATWSP1/Chat1wsp";

function UserDetail() {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/users/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setNewLink(data?.link || "");
      })
      .catch(console.error);
  }, [email]);

  const handleUpdate = () => {
    const clean = (newLink || "").trim();

    fetch(`http://localhost:3000/users/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: clean })
    })
      .then(res => res.json())
      .then(() => {
        // actualiza lo que se muestra en pantalla
        setUser(prev => ({ ...prev, link: clean }));
      })
      .catch(console.error);
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Detalle del usuario</h1>

      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>

      {/* 🔑 ESTE ID ES LA CLAVE */}
      <p>
        <strong>Link:</strong>{" "}
        {user.link ? (
          <a
            id="user-link"
            href={user.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.link}
          </a>
        ) : (
          <span id="user-link">No disponible</span>
        )}
      </p>

      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Editar link"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          style={{ padding: 8, width: 260 }}
        />
        <button onClick={handleUpdate} style={{ marginLeft: 8, padding: 8 }}>
          Guardar link
        </button>
      </div>

     
      <div style={{ marginTop: 24 }}>
        <Chatwsp1 />
      </div>
    </div>
  );
}

export default UserDetail;