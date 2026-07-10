import { useState } from "react";
import { supabase } from "../supabase";

export default function NuovoInterventoModal({
  cliente,
  onChiudi,
  onSalvato,
}) {
  const oggi = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState(oggi);
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState("Da fare");
  const [note, setNote] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);

  async function salva() {
    if (!descrizione.trim()) {
      alert("Inserisci la descrizione dell'intervento");
      return;
    }

    setSalvataggio(true);

    const { error } = await supabase
      .from("interventi")
      .insert({
        cliente_id: cliente.id,
        data,
        descrizione,
        stato,
        note,
      });

    setSalvataggio(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (onSalvato) onSalvato();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 700,
          maxWidth: "95%",
          background: "#fff",
          borderRadius: 14,
          padding: 30,
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          🔧 Nuovo intervento
        </h2>

        <div
          style={{
            marginBottom: 20,
            padding: 15,
            borderRadius: 10,
            background: "#f3f4f6",
          }}
        >
          <strong>Cliente</strong>

          <br />

          {cliente.cognome} {cliente.nome}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label>Data</label>

          <br />

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label>Descrizione</label>

          <br />

          <textarea
            rows={5}
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label>Stato</label>

          <br />

          <select
            value={stato}
            onChange={(e) => setStato(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          >
            <option>Da fare</option>
            <option>In corso</option>
            <option>Completato</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Note</label>

          <br />

          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onChiudi}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              background: "#9ca3af",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Annulla
          </button>

          <button
            disabled={salvataggio}
            onClick={salva}
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
            {salvataggio ? "Salvataggio..." : "Salva intervento"}
          </button>
        </div>
      </div>
    </div>
  );
}