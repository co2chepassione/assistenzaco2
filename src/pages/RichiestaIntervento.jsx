import { useState } from "react";
import { supabase } from "../supabase";
import Card from "../components/Card";
import Campo from "../components/Campo";
import SelectCampo from "../components/SelectCampo";
import "./Registrazione.css";

const PRIORITA = [
  "Bassa",
  "Normale",
  "Alta",
  "Urgente",
];

const iniziale = {
  nome: "",
  cognome: "",
  telefono: "",
  email: "",
  descrizione: "",
  priorita: "Normale",
  note: "",
};

export default function RichiestaIntervento() {
  const [form, setForm] = useState(iniziale);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [ok, setOk] = useState(false);
  const [privacyAccettata, setPrivacyAccettata] =
    useState(false);

  const cambia = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function inviaRichiesta(e) {
    e.preventDefault();

    setErrore("");

    if (
      !form.nome.trim() ||
      !form.cognome.trim() ||
      !form.telefono.trim() ||
      !form.descrizione.trim()
    ) {
      setErrore(
        "Compila Nome, Cognome, Telefono e Descrizione del problema."
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

    const { error } = await supabase
      .from("richieste_intervento")
      .insert([
        {
          nome: form.nome.trim(),
          cognome: form.cognome.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim() || null,
          descrizione: form.descrizione.trim(),
          priorita: form.priorita,
          note: form.note.trim() || null,
          stato: "Nuova",
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
              ✅ Richiesta inviata
            </h1>

            <p>
              La tua richiesta di intervento è stata
              registrata correttamente.
            </p>

            <p>
              Verrai ricontattato per la gestione
              dell'assistenza tecnica.
            </p>

            <button
              className="reg-submit"
              onClick={() => {
                setForm(iniziale);
                setPrivacyAccettata(false);
                setOk(false);
              }}
            >
              Nuova richiesta
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <form
        onSubmit={inviaRichiesta}
        className="reg-form"
      >
        <div className="reg-header">
          <img
            src="/logo.png"
            alt="Logo"
            className="reg-logo"
          />

          <h1 className="reg-title">
            <span>Richiesta</span>
            <span>Intervento Tecnico</span>
          </h1>

          <p className="reg-subtitle">
            Descrivi il problema riscontrato sulla tua
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
          </div>
        </Card>

        <Card
          icon="🔧"
          title="Problema riscontrato"
        >
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 7,
              }}
            >
              Descrizione del problema *
            </label>

            <textarea
              className="reg-textarea"
              name="descrizione"
              value={form.descrizione}
              onChange={cambia}
              rows={7}
              placeholder="Descrivi il problema, gli errori visualizzati e cosa succede durante l'utilizzo della macchina..."
            />
          </div>

          <SelectCampo
            label="Priorità"
            name="priorita"
            value={form.priorita}
            onChange={cambia}
            options={PRIORITA}
          />
        </Card>

        <Card
          icon="📝"
          title="Note aggiuntive"
        >
          <textarea
            className="reg-textarea"
            name="note"
            value={form.note}
            onChange={cambia}
            rows={5}
            placeholder="Inserisci eventuali altre informazioni utili..."
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
              I dati inseriti sono utilizzati per
              ricevere e gestire la richiesta di
              assistenza tecnica.
            </p>

            <p>
              Per informazioni sul trattamento dei
              dati personali o per esercitare i
              diritti previsti dalla normativa puoi
              scrivere a:
            </p>

            <p>
              <strong>
                co2chepassione@gmail.com
              </strong>
            </p>

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
            ? "Invio richiesta..."
            : "🔧 INVIA RICHIESTA INTERVENTO"}
        </button>
      </form>
    </div>
  );
}