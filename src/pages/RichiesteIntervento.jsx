import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function RichiesteIntervento() {
  const [richieste, setRichieste] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [elaborazione, setElaborazione] = useState(null);

  useEffect(() => {
    caricaDati();
  }, []);

  async function caricaDati() {
    setCaricamento(true);

    const { data: datiRichieste, error: erroreRichieste } =
      await supabase
        .from("richieste_intervento")
        .select("*")
        .order("created_at", { ascending: false });

    const { data: datiClienti, error: erroreClienti } =
      await supabase
        .from("clienti")
        .select("id,nome,cognome,telefono,email")
        .order("cognome");

    if (erroreRichieste) {
      alert(
        `Errore caricamento richieste:\n${erroreRichieste.message}`
      );
    }

    if (erroreClienti) {
      alert(
        `Errore caricamento clienti:\n${erroreClienti.message}`
      );
    }

    setRichieste(datiRichieste || []);
    setClienti(datiClienti || []);
    setCaricamento(false);
  }

  function trovaClienteAutomatico(richiesta) {
    return clienti.find((cliente) => {
      const telefonoCliente = (cliente.telefono || "")
        .replace(/\D/g, "");

      const telefonoRichiesta = (richiesta.telefono || "")
        .replace(/\D/g, "");

      const emailCliente = (cliente.email || "")
        .trim()
        .toLowerCase();

      const emailRichiesta = (richiesta.email || "")
        .trim()
        .toLowerCase();

      const telefonoUguale =
        telefonoCliente &&
        telefonoRichiesta &&
        telefonoCliente === telefonoRichiesta;

      const emailUguale =
        emailCliente &&
        emailRichiesta &&
        emailCliente === emailRichiesta;

      return telefonoUguale || emailUguale;
    });
  }

  async function trasformaInIntervento(richiesta) {
    const cliente = trovaClienteAutomatico(richiesta);

    if (!cliente) {
      alert(
        "Cliente non trovato automaticamente.\n\nControlla telefono o email nella scheda cliente."
      );

      return;
    }

    const conferma = window.confirm(
      `Trasformare la richiesta in intervento?\n\nCliente:\n${cliente.cognome} ${cliente.nome}\n\nProblema:\n${richiesta.descrizione}`
    );

    if (!conferma) {
      return;
    }

    setElaborazione(richiesta.id);

    const oggi = new Date().toISOString().split("T")[0];

    const noteIntervento = [
      `Richiesta cliente - Priorità: ${richiesta.priorita}`,
      richiesta.note
        ? `Note cliente: ${richiesta.note}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { data: nuovoIntervento, error: erroreIntervento } =
      await supabase
        .from("interventi")
        .insert({
          cliente_id: cliente.id,
          data: oggi,
          descrizione: richiesta.descrizione,
          stato: "Da fare",
          note: noteIntervento,
        })
        .select("id")
        .single();

    if (erroreIntervento) {
      setElaborazione(null);

      alert(
        `Errore creazione intervento:\n${erroreIntervento.message}`
      );

      return;
    }

    const { error: erroreRichiesta } = await supabase
      .from("richieste_intervento")
      .update({
        stato: "Trasformata",
        cliente_id: cliente.id,
        intervento_id: nuovoIntervento.id,
      })
      .eq("id", richiesta.id);

    setElaborazione(null);

    if (erroreRichiesta) {
      alert(
        `Intervento creato, ma errore aggiornamento richiesta:\n${erroreRichiesta.message}`
      );

      return;
    }

    alert("Richiesta trasformata in intervento.");

    await caricaDati();
  }

  async function eliminaRichiesta(richiesta) {
    const conferma = window.confirm(
      `Eliminare definitivamente la richiesta di ${richiesta.cognome} ${richiesta.nome}?`
    );

    if (!conferma) {
      return;
    }

    setElaborazione(richiesta.id);

    const { error } = await supabase
      .from("richieste_intervento")
      .delete()
      .eq("id", richiesta.id);

    setElaborazione(null);

    if (error) {
      alert(
        `Errore eliminazione richiesta:\n${error.message}`
      );

      return;
    }

    await caricaDati();
  }

  function colorePriorita(priorita) {
    if (priorita === "Urgente") {
      return "#dc2626";
    }

    if (priorita === "Alta") {
      return "#ea580c";
    }

    if (priorita === "Bassa") {
      return "#16a34a";
    }

    return "#2563eb";
  }

  if (caricamento) {
    return <div>Caricamento richieste...</div>;
  }

  return (
    <div>
      <h1>📩 Richieste Intervento</h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: 25,
        }}
      >
        Richieste di assistenza inviate dai clienti.
      </p>

      {richieste.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 25,
            boxShadow: "0 3px 12px rgba(0,0,0,.08)",
            color: "#6b7280",
          }}
        >
          Nessuna richiesta di intervento.
        </div>
      ) : (
        richieste.map((richiesta) => {
          const cliente = trovaClienteAutomatico(richiesta);
          const richiestaTrasformata =
            richiesta.stato === "Trasformata";

          return (
            <div
              key={richiesta.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 22,
                marginBottom: 18,
                boxShadow: "0 3px 12px rgba(0,0,0,.08)",
                borderLeft: `6px solid ${colorePriorita(
                  richiesta.priorita
                )}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                    }}
                  >
                    {richiesta.cognome} {richiesta.nome}
                  </h2>

                  <div>
                    📞 {richiesta.telefono}
                  </div>

                  <div style={{ marginTop: 5 }}>
                    ✉️ {richiesta.email || "-"}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "7px 12px",
                      borderRadius: 20,
                      background: colorePriorita(
                        richiesta.priorita
                      ),
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {richiesta.priorita}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontWeight: 700,
                      color: richiestaTrasformata
                        ? "#16a34a"
                        : "#2563eb",
                    }}
                  >
                    {richiesta.stato}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 18,
                  background: "#f9fafb",
                  borderRadius: 10,
                }}
              >
                <strong>Problema segnalato</strong>

                <div
                  style={{
                    marginTop: 10,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {richiesta.descrizione}
                </div>
              </div>

              {richiesta.note && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 15,
                    background: "#fffbeb",
                    borderRadius: 10,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong>📝 Note cliente</strong>

                  <div style={{ marginTop: 8 }}>
                    {richiesta.note}
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: 15,
                  fontWeight: 600,
                  color: cliente ? "#166534" : "#991b1b",
                }}
              >
                {cliente
                  ? `✅ Cliente trovato: ${cliente.cognome} ${cliente.nome}`
                  : "⚠️ Cliente non trovato automaticamente"}
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {!richiestaTrasformata && (
                  <button
                    onClick={() =>
                      trasformaInIntervento(richiesta)
                    }
                    disabled={
                      elaborazione === richiesta.id
                    }
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: 8,
                      background: cliente
                        ? "#2563eb"
                        : "#9ca3af",
                      color: "#fff",
                      cursor: cliente
                        ? "pointer"
                        : "default",
                      fontWeight: 700,
                    }}
                  >
                    🔧 Trasforma in intervento
                  </button>
                )}

                <button
                  onClick={() =>
                    eliminaRichiesta(richiesta)
                  }
                  disabled={
                    elaborazione === richiesta.id
                  }
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: 8,
                    background: "#dc2626",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  🗑️ Elimina richiesta
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}