import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Clienti from "./pages/Clienti";
import Interventi from "./pages/Interventi";
import Registrazione from "./pages/Registrazione";

function Gestionale() {
  const [pagina, setPagina] = useState("clienti");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          width: 220,
          background: "#1f2937",
          color: "#fff",
          padding: 20,
        }}
      >
        <h2>Gestionale</h2>

        <hr />

        <button
          style={stileBottone}
          onClick={() => setPagina("clienti")}
        >
          👤 Clienti
        </button>

        <button
          style={stileBottone}
          onClick={() => setPagina("interventi")}
        >
          🔧 Interventi
        </button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {pagina === "clienti" && <Clienti />}
        {pagina === "interventi" && <Interventi />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Registrazione />} />

      <Route
        path="/registrazione"
        element={<Registrazione />}
      />

      <Route
        path="/admin"
        element={<Gestionale />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

const stileBottone = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  cursor: "pointer",
  fontSize: 16,
  border: "none",
  borderRadius: 8,
  background: "#2563eb",
  color: "white",
};