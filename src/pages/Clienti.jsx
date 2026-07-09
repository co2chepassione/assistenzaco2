import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Clienti() {
  const [clienti, setClienti] = useState([]);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");

  const [ricerca, setRicerca] = useState("");

  const [modificaId, setModificaId] = useState(null);

  useEffect(() => {
    caricaClienti();
  }, []);

  async function caricaClienti() {
    const { data } = await supabase
      .from("clienti")
      .select("*")
      .order("cognome");

    setClienti(data || []);
  }

  async function salvaCliente() {
    if (!nome || !cognome) {
      alert("Inserisci nome e cognome");
      return;
    }

    if (modificaId) {
      const { error } = await supabase
        .from("clienti")
        .update({
          nome,
          cognome,
          telefono,
        })
        .eq("id", modificaId);

      if (error) {
        alert(error.message);
        return;
      }

      setModificaId(null);
    } else {
      const { error } = await supabase
        .from("clienti")
        .insert({
          nome,
          cognome,
          telefono,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }

    setNome("");
    setCognome("");
    setTelefono("");

    caricaClienti();
  }

  function modificaCliente(cliente) {
    setModificaId(cliente.id);
    setNome(cliente.nome);
    setCognome(cliente.cognome);
    setTelefono(cliente.telefono || "");
  }

  async function eliminaCliente(id) {
    if (!window.confirm("Eliminare il cliente?")) return;

    await supabase
      .from("clienti")
      .delete()
      .eq("id", id);

    caricaClienti();
  }

  const elenco = clienti.filter((c) => {
    const testo =
      `${c.nome} ${c.cognome} ${c.telefono || ""}`.toLowerCase();

    return testo.includes(ricerca.toLowerCase());
  });

  return (
    <div style={{ padding: 30, maxWidth: 700 }}>

      <h2>
        {modificaId ? "Modifica Cliente" : "Nuovo Cliente"}
      </h2>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Cognome"
        value={cognome}
        onChange={(e) => setCognome(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Telefono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      <br /><br />

      <button onClick={salvaCliente}>
        {modificaId ? "Aggiorna Cliente" : "Salva Cliente"}
      </button>

      <hr />

      <h2>Clienti</h2>

      <input
        placeholder="Cerca cliente..."
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 20
        }}
      />

      {elenco.map((cliente) => (
        <div
          key={cliente.id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6
          }}
        >
          <strong>
            {cliente.cognome} {cliente.nome}
          </strong>

          <br />

          {cliente.telefono}

          <br /><br />

          <button
            onClick={() => modificaCliente(cliente)}
          >
            Modifica
          </button>

          {" "}

          <button
            onClick={() => eliminaCliente(cliente.id)}
          >
            Elimina
          </button>

        </div>
      ))}

    </div>
  );
}