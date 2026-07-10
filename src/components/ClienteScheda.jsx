export default function ClienteScheda({
  cliente,
  onChiudi,
}) {
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

  function Riga(titolo, valore) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #eee",
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
        borderRadius: 12,
        padding: 25,
        boxShadow: "0 3px 10px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>
          {cliente.cognome} {cliente.nome}
        </h2>

        <button onClick={onChiudi}>
          Chiudi
        </button>
      </div>

      <h3>Dati Cliente</h3>

      {Riga("Nome", cliente.nome)}
      {Riga("Cognome", cliente.cognome)}
      {Riga("Telefono", cliente.telefono)}
      {Riga("Email", cliente.email)}
      {Riga("Indirizzo", cliente.indirizzo)}
      {Riga("Città", cliente.citta)}
      {Riga("Provincia", cliente.provincia)}
      {Riga("CAP", cliente.cap)}

      <br />

      <h3>Macchina</h3>

      {Riga("Marca", cliente.marca)}
      {Riga("Modello", cliente.modello)}
      {Riga("Tipo", cliente.tipo)}
      {Riga("Piano", cliente.piano_lavoro)}
      {Riga("Potenza", cliente.potenza)}
      {Riga("Controller", cliente.controller)}

      <br />

      <h3>Note</h3>

      <div
        style={{
          background: "#f9fafb",
          padding: 15,
          borderRadius: 8,
          minHeight: 80,
        }}
      >
        {cliente.note || "Nessuna nota"}
      </div>

      <br />

      <button>
        ✏️ Modifica Cliente
      </button>

      {" "}

      <button>
        🔧 Nuovo Intervento
      </button>
    </div>
  );
}