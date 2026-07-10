export default function ClienteLista({
  clienti,
  ricerca,
  setRicerca,
  onApri,
}) {
  const elenco = clienti.filter((c) => {
    const testo = `
      ${c.nome || ""}
      ${c.cognome || ""}
      ${c.telefono || ""}
      ${c.email || ""}
      ${c.citta || ""}
    `
      .toLowerCase()
      .replace(/\s+/g, " ");

    return testo.includes(ricerca.toLowerCase());
  });

  return (
    <div>

      <input
        type="text"
        placeholder="🔍 Cerca cliente..."
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      {elenco.length === 0 && (
        <p>Nessun cliente trovato.</p>
      )}

      {elenco.map((cliente) => (
        <div
          key={cliente.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,.05)",
          }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
            }}
          >
            {cliente.cognome} {cliente.nome}
          </h3>

          <div>📞 {cliente.telefono || "-"}</div>

          <div>✉️ {cliente.email || "-"}</div>

          <div>📍 {cliente.citta || "-"}</div>

          <button
            style={{
              marginTop: 14,
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => onApri(cliente)}
          >
            APRI SCHEDA
          </button>
        </div>
      ))}
    </div>
  );
}