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
const POTENZE = ["50W", "60W", "80W", "100W", "130W", "150W", "180W", "300W", "Altro"];
const CONTROLLER = ["Ruida", "Trocen", "TopWisdom", "Leetro", "RichAuto", "Altro"];

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

    setLoading(true);

    const { data } = await supabase
      .from("clienti")
      .select("id")
      .or(
        `telefono.eq.${form.telefono}${
          form.email ? `,email.eq.${form.email}` : ""
        }`
      )
      .limit(1);

    if (data && data.length) {
      setLoading(false);
      setErrore("Esiste già un cliente con questi dati.");
      return;
    }

    const { error } = await supabase.from("clienti").insert([
      {
        ...form,
        stato: "Attivo",
        data_installazione: new Date().toISOString().slice(0, 10),
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
              Grazie per aver registrato la tua macchina.
            </p>

            <p>
              I dati sono stati salvati correttamente nel nostro database.
            </p>

            <button
              className="reg-submit"
              onClick={() => {
                setForm(iniziale);
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
      <form onSubmit={registra} className="reg-form">

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
            Compila il modulo per registrare la tua macchina.
          </p>

        </div>

        {errore && (
          <div className="reg-error">
            {errore}
          </div>
        )}

        <Card icon="👤" title="Dati Cliente">
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

        <Card icon="🖨" title="Dati Macchina (facoltativi)">

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

        <Card icon="📝" title="Note">

          <textarea
            className="reg-textarea"
            name="note"
            value={form.note}
            onChange={cambia}
          />

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