import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import ModificaCliente from "./ModificaCliente";

export default function ClienteScheda({
  cliente,
  onChiudi,
  onNuovoIntervento,
}) {
  const [tab, setTab] = useState("dati");
  const [modifica, setModifica] = useState(false);
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    if (cliente?.id) {
      caricaInterventi();
    }
  }, [cliente]);

  async function caricaInterventi() {
    const { data, error } = await supabase
      .from("interventi")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("data", { ascending: false });

    if (!error) {
      setInterventi(data || []);
    }
  }

  if (!cliente) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <h2>Seleziona un cliente</h2>

        <p>
          Premi <strong>APRI SCHEDA</strong> per visualizzare tutti i dati.
        </p>
      </div>
    );
  }

  if (modifica) {
    return (
      <ModificaCliente
        cliente={cliente}
        onSalvato={() => {
          setModifica(false);
        }}
        onAnnulla={() => setModifica(false)}
      />
    );
  }

  function Riga(titolo, valore) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          borderBottom: "1px solid #ececec",
        }}
      >
        <strong>{titolo}</strong>
        <span>{valore || "-"}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 25,
        boxShadow: "0 3px 12px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {cliente.cognome} {cliente.nome}
        </h2>

        <button
          onClick={onChiudi}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Chiudi
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 25,
          borderBottom: "1px solid #ddd",
          paddingBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {[
          ["dati", "👤 Dati"],
          ["macchina", "🖨 Macchina"],
          ["note", "📝 Note"],
          ["interventi", "🔧 Interventi"],
        ].map(([id, testo]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              background: tab === id ? "#2563eb" : "#e5e7eb",
              color: tab === id ? "#fff" : "#111827",
              fontWeight: 600,
            }}
          >
            {testo}
          </button>
        ))}
      </div>
      {tab === "dati" && (
        <>
          {Riga("Nome", cliente.nome)}
          {Riga("Cognome", cliente.cognome)}
          {Riga("Telefono", cliente.telefono)}
          {Riga("Email", cliente.email)}
          {Riga("Indirizzo", cliente.indirizzo)}
          {Riga("Città", cliente.citta)}
          {Riga("Provincia", cliente.provincia)}
          {Riga("CAP", cliente.cap)}
        </>
      )}

      {tab === "macchina" && (
        <>
          {Riga("Marca", cliente.marca)}
          {Riga("Modello", cliente.modello)}
          {Riga("Tipo", cliente.tipo)}
          {Riga("Piano", cliente.piano_lavoro)}
          {Riga("Potenza", cliente.potenza)}
          {Riga("Controller", cliente.controller)}
        </>
      )}

      {tab === "note" && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 20,
            minHeight: 180,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {cliente.note || "Nessuna nota"}
        </div>
      )}

      {tab === "interventi" && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 20,
            minHeight: 180,
            background: "#fafafa",
          }}
        >
          {interventi.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Nessun intervento registrato.
            </p>
          ) : (
            interventi.map((i) => (
              <div
                key={i.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 15,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  📅 {i.data}
                </div>

                <div style={{ marginTop: 8 }}>
                  🔧 {i.descrizione}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  {i.stato}
                </div>

                {i.note && (
                  <div
                    style={{
                      marginTop: 8,
                      color: "#6b7280",
                    }}
                  >
                    📝 {i.note}
                  </div>
                )}
              </div>
            ))
          )}

          <button
            onClick={() => onNuovoIntervento(cliente)}
            style={{
              marginTop: 20,
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + Nuovo intervento
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 30,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 20,
        }}
      >
        <button
          onClick={() => setModifica(true)}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#f59e0b",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✏️ Modifica Cliente
        </button>

        <button
          onClick={() => onNuovoIntervento(cliente)}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🔧 Nuovo Intervento
        </button>

        <button
          onClick={onChiudi}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ❌ Chiudi
        </button>
      </div>
    </div>
  );
}