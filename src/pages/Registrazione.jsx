import { useState } from "react";
import { supabase } from "../supabase";
import Campo from "../components/Campo";
import SelectCampo from "../components/SelectCampo";
import Card from "../components/Card";
import "./Registrazione.css";

const TIPI = ["CO2", "Fibra", "UV", "MOPA", "Altro"];

const PIANI = [
  "300x200",
  "400x400",
  "500x300",
  "600x400",
  "700x500",
  "900x600",
  "1000x800",
  "1300x900",
  "1600x1000",
  "1300x2500",
  "Altro",
];

const POTENZE = [
  "50W",
  "60W",
  "80W",
  "100W",
  "130W",
  "150W",
  "180W",
  "300W",
  "Altro",
];

const CONTROLLER = [
  "Ruida",
  "Trocen",
  "TopWisdom",
  "Leetro",
  "RichAuto",
  "Altro",
];

const iniziale = {
  nome: "",
  cognome: "",
  telefono: "",
  email: "",
  indirizzo: "",
  citta: "",
  provincia: "",
  cap: "",
  marca: "",
  tipo: "",
  modello: "",
  piano_lavoro: "",
  potenza: "",
  controller: "",
  note: "",
};

export default function Registrazione() {
  const [form, setForm] = useState(iniziale);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [ok, setOk] = useState(false);

  const [privacyAccettata, setPrivacyAccettata] =
    useState(false);

  const [mostraPrivacy, setMostraPrivacy] =
    useState(false);

  const cambia = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  async function registra(e) {
    e.preventDefault();

    setErrore("");

    if (
      !form.nome ||
      !form.cognome ||
      !form.telefono ||
      !form.indirizzo ||
      !form.citta
    ) {
      setErrore(
        "Compila Nome, Cognome, Telefono, Indirizzo e Città."
      );
      return;
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      setErrore("Email non valida.");
      return;
    }

    const cifre = form.telefono.replace(/\D/g, "");

    if (cifre.length < 8) {
      setErrore("Telefono non valido.");
      return;
    }

    if (!privacyAccettata) {
      setErrore(
        "Devi dichiarare di aver letto l'informativa privacy."
      );
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from("clienti")
      .select("id")
      .or(
        `telefono.eq.${form.telefono}${
          form.email
            ? `,email.eq.${form.email}`
            : ""
        }`
      )
      .limit(1);

    if (data && data.length) {
      setLoading(false);
      setErrore(
        "Esiste già un cliente con questi dati."
      );
      return;
    }

    const { error } = await supabase
      .from("clienti")
      .insert([
        {
          ...form,
          stato: "Attivo",
          data_installazione: new Date()
            .toISOString()
            .slice(0, 10),
        },
      ]);

    setLoading(false);

    if (error) {
      setErrore(error.message);
      return;
    }

    setOk(true);
  }

  if (ok) {
    return (
      <div className="reg-success">
        <Card>
          <div className="reg-success-box">
            <img
              src="/logo.png"
              alt="Logo"
              className="reg-success-logo"
            />

            <h1 className="reg-success-title">
              ✅ Registrazione completata
            </h1>

            <p>
              Grazie per aver registrato la tua
              macchina.
            </p>

            <p>
              I dati sono stati salvati correttamente
              nel nostro database.
            </p>

            <button
              className="reg-submit"
              onClick={() => {
                setForm(iniziale);
                setPrivacyAccettata(false);
                setMostraPrivacy(false);
                setOk(false);
              }}
            >
              Nuova registrazione
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <form
        onSubmit={registra}
        className="reg-form"
      >
        <div className="reg-header">
          <img
            src="/logo.png"
            alt="Logo"
            className="reg-logo"
          />

          <h1 className="reg-title">
            <span>Portale</span>
            <span>Registrazione Cliente</span>
          </h1>

          <p className="reg-subtitle">
            Compila il modulo per registrare la tua
            macchina.
          </p>
        </div>

        {errore && (
          <div className="reg-error">
            {errore}
          </div>
        )}

        <Card
          icon="👤"
          title="Dati Cliente"
        >
          <div className="reg-grid">
            <Campo
              label="Nome *"
              name="nome"
              value={form.nome}
              onChange={cambia}
            />

            <Campo
              label="Cognome *"
              name="cognome"
              value={form.cognome}
              onChange={cambia}
            />

            <Campo
              label="Telefono *"
              name="telefono"
              value={form.telefono}
              onChange={cambia}
            />

            <Campo
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={cambia}
            />

            <Campo
              label="Indirizzo *"
              name="indirizzo"
              value={form.indirizzo}
              onChange={cambia}
            />

            <Campo
              label="Città *"
              name="citta"
              value={form.citta}
              onChange={cambia}
            />

            <Campo
              label="Provincia"
              name="provincia"
              value={form.provincia}
              onChange={cambia}
            />

            <Campo
              label="CAP"
              name="cap"
              value={form.cap}
              onChange={cambia}
            />
          </div>
        </Card>

        <Card
          icon="🖨"
          title="Dati Macchina (facoltativi)"
        >
          <div className="reg-grid">
            <Campo
              label="Marca"
              name="marca"
              value={form.marca}
              onChange={cambia}
            />

            <Campo
              label="Modello"
              name="modello"
              value={form.modello}
              onChange={cambia}
            />

            <SelectCampo
              label="Tipo"
              name="tipo"
              value={form.tipo}
              onChange={cambia}
              options={TIPI}
            />

            <SelectCampo
              label="Piano di lavoro"
              name="piano_lavoro"
              value={form.piano_lavoro}
              onChange={cambia}
              options={PIANI}
            />

            <SelectCampo
              label="Potenza"
              name="potenza"
              value={form.potenza}
              onChange={cambia}
              options={POTENZE}
            />

            <SelectCampo
              label="Controller"
              name="controller"
              value={form.controller}
              onChange={cambia}
              options={CONTROLLER}
            />
          </div>
        </Card>

        <Card
          icon="📝"
          title="Note"
        >
          <textarea
            className="reg-textarea"
            name="note"
            value={form.note}
            onChange={cambia}
          />
        </Card>

        <Card
          icon="🔒"
          title="Privacy"
        >
          <div
            style={{
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            <p>
              I dati inseriti nel presente modulo sono
              utilizzati per la registrazione della
              macchina e per la gestione dei servizi
              di assistenza tecnica.
            </p>

            <button
              type="button"
              onClick={() =>
                setMostraPrivacy(!mostraPrivacy)
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                padding: 0,
                fontWeight: 700,
                textDecoration: "underline",
                fontSize: 15,
              }}
            >
              {mostraPrivacy
                ? "Nascondi informativa privacy"
                : "Leggi informativa privacy"}
            </button>

            {mostraPrivacy && (
              <div
                style={{
                  marginTop: 20,
                  padding: 20,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                }}
              >
                <h3>
                  Informativa sul trattamento dei dati
                  personali
                </h3>

                <p>
                  <strong>
                    Titolare del trattamento
                  </strong>
                  <br />
                  CO2 Che Passione
                  <br />
                  Email: co2chepassione@gmail.com
                </p>

                <p>
                  <strong>
                    Finalità del trattamento
                  </strong>
                  <br />
                  I dati personali forniti sono
                  trattati per registrare il cliente e
                  la macchina, gestire le richieste di
                  assistenza tecnica, organizzare e
                  documentare gli interventi e
                  mantenere lo storico tecnico della
                  macchina.
                </p>

                <p>
                  <strong>
                    Base giuridica del trattamento
                  </strong>
                  <br />
                  Il trattamento è effettuato per
                  gestire le richieste del cliente e
                  fornire i servizi di assistenza
                  tecnica richiesti.
                </p>

                <p>
                  <strong>Dati trattati</strong>
                  <br />
                  Possono essere trattati dati
                  identificativi e di contatto, dati
                  relativi all'indirizzo e dati tecnici
                  relativi alla macchina registrata e
                  agli interventi di assistenza.
                </p>

                <p>
                  <strong>
                    Modalità del trattamento
                  </strong>
                  <br />
                  I dati sono trattati mediante
                  strumenti informatici e sono
                  utilizzati esclusivamente per le
                  finalità di gestione del cliente e
                  dell'assistenza tecnica.
                </p>

                <p>
                  <strong>
                    Conservazione dei dati
                  </strong>
                  <br />
                  I dati sono conservati per il tempo
                  necessario alla gestione del
                  rapporto con il cliente,
                  dell'assistenza tecnica e dello
                  storico degli interventi, nonché per
                  gli eventuali periodi ulteriori
                  richiesti dagli obblighi di legge.
                </p>

                <p>
                  <strong>
                    Comunicazione dei dati
                  </strong>
                  <br />
                  I dati non sono utilizzati per
                  finalità di marketing attraverso
                  questo modulo. Possono essere
                  trattati mediante fornitori di
                  servizi informatici utilizzati per
                  il funzionamento e l'hosting del
                  sistema.
                </p>

                <p>
                  <strong>
                    Diritti dell'interessato
                  </strong>
                  <br />
                  L'interessato può richiedere,
                  nei casi previsti dalla normativa,
                  l'accesso ai propri dati, la
                  rettifica, la cancellazione, la
                  limitazione del trattamento o
                  esercitare gli altri diritti
                  riconosciuti dalla normativa
                  applicabile.
                </p>

                <p>
                  Per richieste relative ai dati
                  personali è possibile scrivere a:
                  <br />
                  <strong>
                    co2chepassione@gmail.com
                  </strong>
                </p>

                <p
                  style={{
                    marginBottom: 0,
                  }}
                >
                  L'interessato ha inoltre il diritto
                  di proporre reclamo all'Autorità
                  Garante per la protezione dei dati
                  personali.
                </p>
              </div>
            )}

            <label
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginTop: 25,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={privacyAccettata}
                onChange={(e) =>
                  setPrivacyAccettata(
                    e.target.checked
                  )
                }
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 2,
                  cursor: "pointer",
                }}
              />

              <span>
                Dichiaro di aver letto l'informativa
                sul trattamento dei dati personali. *
              </span>
            </label>
          </div>
        </Card>

        <button
          className="reg-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Registrazione in corso..."
            : "✓ REGISTRA CLIENTE"}
        </button>
      </form>
    </div>
  );
}