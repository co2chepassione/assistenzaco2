import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabase } from "./supabase";

import Clienti from "./pages/Clienti";
import Interventi from "./pages/Interventi";
import Registrazione from "./pages/Registrazione";

function LoginAdmin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState("");

  async function accedi(e) {
    e.preventDefault();

    setErrore("");
    setCaricamento(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setCaricamento(false);

    if (error) {
      setErrore("Email o password non corrette.");
      return;
    }

    if (data.session) {
      onLogin(data.session);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: 20,
      }}
    >
      <form
        onSubmit={accedi}
        style={{
          width: 420,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 35,
          boxShadow: "0 10px 35px rgba(0,0,0,.12)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          AssistenzaCO2
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 30,
          }}
        >
          Accesso Gestionale Admin
        </p>

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 7,
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 16,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 7,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 16,
            }}
          />
        </div>

        {errore && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {errore}
          </div>
        )}

        <button
          type="submit"
          disabled={caricamento}
          style={{
            width: "100%",
            padding: 13,
            border: "none",
            borderRadius: 8,
            background: caricamento ? "#93c5fd" : "#2563eb",
            color: "#fff",
            cursor: caricamento ? "default" : "pointer",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {caricamento ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}

function Gestionale({ onLogout }) {
  const [pagina, setPagina] = useState("clienti");

  async function esci() {
    await supabase.auth.signOut();
    onLogout();
  }

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

        <button
          style={{
            ...stileBottone,
            background: "#ef4444",
            marginTop: 30,
          }}
          onClick={esci}
        >
          🚪 Esci
        </button>
      </div>

      <div style={{ flex: 1, padding: 30 }}>
        {pagina === "clienti" && <Clienti />}
        {pagina === "interventi" && <Interventi />}
      </div>
    </div>
  );
}

function AdminProtetto() {
  const [sessione, setSessione] = useState(null);
  const [controlloSessione, setControlloSessione] = useState(true);

  useEffect(() => {
    controllaSessione();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSessione(session);
      setControlloSessione(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function controllaSessione() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSessione(session);
    setControlloSessione(false);
  }

  if (controlloSessione) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Controllo accesso...
      </div>
    );
  }

  if (!sessione) {
    return <LoginAdmin onLogin={setSessione} />;
  }

  return <Gestionale onLogout={() => setSessione(null)} />;
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
        element={<AdminProtetto />}
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