import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Interventi() {
  const [clienti, setClienti] = useState([]);
  const [interventi, setInterventi] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState("Da fare");
  const [note, setNote] = useState("");

  useEffect(() => {
    caricaClienti();
    caricaInterventi();
  }, []);

  async function caricaClienti() {
    const { data } = await supabase
      .from("clienti")
      .select("id,nome,cognome")
      .order("cognome");

    setClienti(data || []);
  }

  async function caricaInterventi() {
    const { data } = await supabase
      .from("interventi")
      .select(`
        *,
        clienti (
          nome,
          cognome
        )
      `)
      .order("data", { ascending: false });

    setInterventi(data || []);
  }

  async function salvaIntervento() {
    if (!clienteId || !data || !descrizione) {
      alert("Compila i campi obbligatori");
      return;
    }

    const { error } = await supabase
      .from("interventi")
      .insert({
        cliente_id: clienteId,
        data,
        descrizione,
        stato,
        note,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setClienteId("");
    setData("");
    setDescrizione("");
    setStato("Da fare");
    setNote("");

    caricaInterventi();
  }

  return (
    <div>

      <h1>Interventi</h1>

      <select
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
      >
        <option value="">Seleziona cliente</option>

        {clienti.map((c) => (
          <option key={c.id} value={c.id}>
            {c.cognome} {c.nome}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Descrizione intervento"
        rows="4"
        cols="50"
        value={descrizione}
        onChange={(e) => setDescrizione(e.target.value)}
      />

      <br /><br />

      <select
        value={stato}
        onChange={(e) => setStato(e.target.value)}
      >
        <option>Da fare</option>
        <option>In corso</option>
        <option>Completato</option>
      </select>

      <br /><br />

      <textarea
        placeholder="Note"
        rows="3"
        cols="50"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <br /><br />

      <button onClick={salvaIntervento}>
        Salva intervento
      </button>

      <hr />

      <h2>Storico interventi</h2>

      {interventi.map((i) => (
        <div
          key={i.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <strong>
            {i.clienti?.cognome} {i.clienti?.nome}
          </strong>

          <br />

          📅 {i.data}

          <br />

          🔧 {i.descrizione}

          <br />

          📌 {i.stato}

          <br />

          📝 {i.note}
        </div>
      ))}

    </div>
  );
}