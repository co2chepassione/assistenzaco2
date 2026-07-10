import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import ClienteLista from "../components/ClienteLista";
import ClienteScheda from "../components/ClienteScheda";
import NuovoInterventoModal from "../components/NuovoInterventoModal";

export default function Clienti() {
  const [clienti, setClienti] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [clienteSelezionato, setClienteSelezionato] = useState(null);
  const [nuovoIntervento, setNuovoIntervento] = useState(null);

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

  function apriNuovoIntervento(cliente) {
    setNuovoIntervento(cliente);
  }

  function chiudiNuovoIntervento() {
    setNuovoIntervento(null);
  }

  return (
    <>
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
          onNuovoIntervento={apriNuovoIntervento}
        />
      </div>

      {nuovoIntervento && (
        <NuovoInterventoModal
          cliente={nuovoIntervento}
          onChiudi={chiudiNuovoIntervento}
          onSalvato={() => {
            chiudiNuovoIntervento();
            alert("Intervento salvato.");
          }}
        />
      )}
    </>
  );
}