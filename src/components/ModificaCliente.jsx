import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function ModificaCliente({
  cliente,
  onSalvato,
  onAnnulla,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (cliente) {
      setForm(cliente);
    }
  }, [cliente]);

  function cambia(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function salva() {
    const { error } = await supabase
      .from("clienti")
      .update({
        nome: form.nome,
        cognome: form.cognome,
        telefono: form.telefono,
        email: form.email,
        indirizzo: form.indirizzo,
        citta: form.citta,
        provincia: form.provincia,
        cap: form.cap,
        marca: form.marca,
        modello: form.modello,
        tipo: form.tipo,
        piano_lavoro: form.piano_lavoro,
        potenza: form.potenza,
        controller: form.controller,
        note: form.note,
      })
      .eq("id", cliente.id);

    if (error) {
      alert(error.message);
      return;
    }

    onSalvato(form);
  }

  function Campo(label, name) {
    return (
      <div style={{ marginBottom: 15 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 5,
          }}
        >
          {label}
        </label>

        <input
          name={name}
          value={form[name] || ""}
          onChange={cambia}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        padding: 25,
        borderRadius: 12,
      }}
    >
      <h2>Modifica Cliente</h2>

      {Campo("Nome", "nome")}
      {Campo("Cognome", "cognome")}
      {Campo("Telefono", "telefono")}
      {Campo("Email", "email")}
      {Campo("Indirizzo", "indirizzo")}
      {Campo("Città", "citta")}
      {Campo("Provincia", "provincia")}
      {Campo("CAP", "cap")}
            {Campo("Marca", "marca")}
      {Campo("Modello", "modello")}
      {Campo("Tipo", "tipo")}
      {Campo("Piano di lavoro", "piano_lavoro")}
      {Campo("Potenza", "potenza")}
      {Campo("Controller", "controller")}

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 5,
          }}
        >
          Note
        </label>

        <textarea
          name="note"
          value={form.note || ""}
          onChange={cambia}
          rows={5}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          onClick={salva}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#16a34a",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          💾 Salva
        </button>

        <button
          onClick={onAnnulla}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ❌ Annulla
        </button>
      </div>
    </div>
  );
}