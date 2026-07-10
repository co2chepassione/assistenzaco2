import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import ClienteLista from "../components/ClienteLista";
import ClienteScheda from "../components/ClienteScheda";

export default function Clienti() {
  const [clienti, setClienti] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [clienteSelezionato, setClienteSelezionato] = useState(null);

  useEffect(() => {
    caricaClienti();
  }, []);

  async function caricaClienti() {
    const { data, error } = await supabase
      .from("clienti")
      .select("*")
      .order("cognome");

    if (!error) {
      setClienti(data || []);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 20,
        height: "100%",
      }}
    >
      <div
        style={{
          background: "#f8fafc",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <ClienteLista
          clienti={clienti}
          ricerca={ricerca}
          setRicerca={setRicerca}
          onApri={setClienteSelezionato}
        />
      </div>

      <ClienteScheda
        cliente={clienteSelezionato}
        onChiudi={() => setClienteSelezionato(null)}
      />
    </div>
  );
}