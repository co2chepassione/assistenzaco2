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
  const [eliminazione, setEliminazione] = useState(false);

  const [interventoModifica, setInterventoModifica] =
    useState(null);

  const [salvataggioIntervento, setSalvataggioIntervento] =
    useState(false);

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

  async function salvaModificaIntervento() {
    if (!interventoModifica.descrizione.trim()) {
      alert("Inserisci la descrizione dell'intervento");
      return;
    }

    setSalvataggioIntervento(true);

    const { error } = await supabase
      .from("interventi")
      .update({
        data: interventoModifica.data,
        descrizione: interventoModifica.descrizione,
        stato: interventoModifica.stato,
        note: interventoModifica.note,
      })
      .eq("id", interventoModifica.id);

    setSalvataggioIntervento(false);

    if (error) {
      alert(
        `Errore durante la modifica dell'intervento:\n${error.message}`
      );

      return;
    }

    setInterventoModifica(null);

    await caricaInterventi();
  }

  async function eliminaIntervento(intervento) {
    const conferma = window.confirm(
      `ATTENZIONE\n\nStai per eliminare definitivamente questo intervento:\n\n${intervento.data}\n${intervento.descrizione}\n\nVuoi continuare?`
    );

    if (!conferma) {
      return;
    }

    const { error } = await supabase
      .from("interventi")
      .delete()
      .eq("id", intervento.id);

    if (error) {
      alert(
        `Errore durante l'eliminazione dell'intervento:\n${error.message}`
      );

      return;
    }

    await caricaInterventi();
  }

  async function eliminaCliente() {
    const conferma = window.confirm(
      `ATTENZIONE\n\nStai per eliminare definitivamente:\n\n${cliente.cognome} ${cliente.nome}\n\nSaranno eliminati anche tutti gli interventi associati.\n\nVuoi continuare?`
    );

    if (!conferma) {
      return;
    }

    setEliminazione(true);

    const { error: erroreInterventi } = await supabase
      .from("interventi")
      .delete()
      .eq("cliente_id", cliente.id);

    if (erroreInterventi) {
      setEliminazione(false);

      alert(
        `Errore durante l'eliminazione degli interventi:\n${erroreInterventi.message}`
      );

      return;
    }

    const { error: erroreCliente } = await supabase
      .from("clienti")
      .delete()
      .eq("id", cliente.id);

    if (erroreCliente) {
      setEliminazione(false);

      alert(
        `Errore durante l'eliminazione del cliente:\n${erroreCliente.message}`
      );

      return;
    }

    alert("Cliente eliminato correttamente.");

    onChiudi();

    window.location.reload();
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
    <>
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
                background:
                  tab === id ? "#2563eb" : "#e5e7eb",
                color:
                  tab === id ? "#fff" : "#111827",
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

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 15,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        setInterventoModifica({
                          ...i,
                        })
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: 8,
                        background: "#f59e0b",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✏️ Modifica
                    </button>

                    <button
                      onClick={() =>
                        eliminaIntervento(i)
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: 8,
                        background: "#dc2626",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() =>
                onNuovoIntervento(cliente)
              }
              disabled={eliminazione}
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
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setModifica(true)}
            disabled={eliminazione}
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
            onClick={() =>
              onNuovoIntervento(cliente)
            }
            disabled={eliminazione}
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
            onClick={eliminaCliente}
            disabled={eliminazione}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              background:
                eliminazione
                  ? "#fca5a5"
                  : "#991b1b",
              color: "#fff",
              cursor:
                eliminazione
                  ? "default"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            {eliminazione
              ? "Eliminazione..."
              : "🗑️ Elimina Cliente"}
          </button>

          <button
            onClick={onChiudi}
            disabled={eliminazione}
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

      {interventoModifica && (
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
              boxShadow:
                "0 20px 60px rgba(0,0,0,.25)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              ✏️ Modifica intervento
            </h2>

            <div style={{ marginBottom: 18 }}>
              <label>Data</label>

              <br />

              <input
                type="date"
                value={interventoModifica.data}
                onChange={(e) =>
                  setInterventoModifica({
                    ...interventoModifica,
                    data: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
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
                value={
                  interventoModifica.descrizione
                }
                onChange={(e) =>
                  setInterventoModifica({
                    ...interventoModifica,
                    descrizione: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 10,
                  marginTop: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Stato</label>

              <br />

              <select
                value={interventoModifica.stato}
                onChange={(e) =>
                  setInterventoModifica({
                    ...interventoModifica,
                    stato: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
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
                value={interventoModifica.note || ""}
                onChange={(e) =>
                  setInterventoModifica({
                    ...interventoModifica,
                    note: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
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
                onClick={() =>
                  setInterventoModifica(null)
                }
                disabled={salvataggioIntervento}
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
                onClick={salvaModificaIntervento}
                disabled={salvataggioIntervento}
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
                {salvataggioIntervento
                  ? "Salvataggio..."
                  : "Salva modifiche"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}