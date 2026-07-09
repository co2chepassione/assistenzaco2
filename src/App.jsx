import { Routes, Route, Navigate, Link } from "react-router-dom";
import Clienti from "./pages/Clienti";
import Interventi from "./pages/Interventi";
import Registrazione from "./pages/Registrazione";
import { useState } from "react";

function Gestionale() {
  const [pagina, setPagina] = useState("clienti");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          width: 220,
          background: "#1f2937",
          color: "white",
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

      <Route path="/" element={<Navigate to="/admin" />} />

      <Route path="/admin" element={<Gestionale />} />

      <Route path="/registrazione" element={<Registrazione />} />

      <Route
        path="*"
        element={
          <div style={{ padding: 40 }}>
            <h2>Pagina non trovata</h2>
            <Link to="/admin">Vai al gestionale</Link>
          </div>
        }
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
};