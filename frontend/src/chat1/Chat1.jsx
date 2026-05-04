import { useState, useEffect, useRef } from "react";

import "./styleschat.css";


export default function Chat1() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola! ¿En qué puedo ayudarte?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const autoReply = (text) => {
    let reply = "No entendí, ¿puedes repetir?";
    const t = text.toLowerCase();
    if (t.includes("hola")) reply = "¡Hola! Encantado de hablar contigo.";
    else if (t.includes("adios")) reply = "Hasta luego 👋";
    else if (t.includes("gracias")) reply = "¡De nada!";
    addMessage(reply, "bot");
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage(text, "user");
    setInput("");
    setTimeout(() => autoReply(text), 500);
  };

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat1">
      {!open && (
        <button className="btn-open" onClick={() => setOpen(true)} aria-label="Abrir chat">
          💬 Chat
        </button>
      )}

      {open && (
        <div className="chat" role="dialog" aria-label="Chat Online">
          <header>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Chat Online</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}
            >
              ✕
            </button>
          </header>

          <div className="chat-area" ref={chatRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
              >
                {msg.sender === "bot" ? "🤖 " : ""}
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              aria-label="Mensaje"
            />
            <button onClick={handleSend} id="sendBtn" aria-label="Enviar">Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
