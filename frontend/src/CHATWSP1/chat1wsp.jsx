import "./styleschat.css";

function Chatwsp1() {
  const handleClick = () => {
    const el = document.getElementById("user-link");

    if (!el) {
      alert("No se encontró el link en pantalla");
      return;
    }

    // Si es <a>, usamos href; si es <span>, usamos textContent
    let link = el.tagName === "A" ? el.href : el.textContent;

    link = (link || "").trim();

    console.log("LINK DESDE DOM:", link);

    if (!link || link.toLowerCase().includes("no disponible")) {
      alert("No hay link disponible");
      return;
    }

    // Si el usuario escribió sin protocolo, lo añadimos
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }

    window.open(link, "_blank");
  };

  return (
    <div className="chatwsp1">
      <button className="btn-wsp" onClick={handleClick}>
        <img
          src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg"
          alt="WhatsApp"
          style={{ width: 25, height: 25, filter: "invert(1)" }}
        />
        <span className="stext">Contactanos</span>
      </button>
    </div>
  );
}

export default Chatwsp1;