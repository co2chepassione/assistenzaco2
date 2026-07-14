import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function rispostaJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function nomeCliente(cliente: {
  nome?: string | null;
  cognome?: string | null;
}) {
  return `${cliente.cognome || ""} ${
    cliente.nome || ""
  }`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const serviceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Configurazione Supabase non disponibile."
      );
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return rispostaJson(
        {
          error: "Accesso non autorizzato.",
        },
        401
      );
    }

    const token = authorization.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const {
      data: { user },
      error: erroreUtente,
    } = await supabaseAdmin.auth.getUser(token);

    if (erroreUtente || !user) {
      return rispostaJson(
        {
          error: "Sessione Admin non valida.",
        },
        401
      );
    }

    const {
      count: totaleClienti,
      error: erroreTotale,
    } = await supabaseAdmin
      .from("clienti")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (erroreTotale) {
      throw erroreTotale;
    }

    const {
      count: totaleCompletati,
      error: erroreCompletati,
    } = await supabaseAdmin
      .from("clienti")
      .select("*", {
        count: "exact",
        head: true,
      })
      .not("geocodifica_stato", "is", null);

    if (erroreCompletati) {
      throw erroreCompletati;
    }

    const {
      data: clienti,
      error: erroreClienti,
    } = await supabaseAdmin
      .from("clienti")
      .select(
        "id,nome,cognome,indirizzo,citta,provincia,cap,latitudine,longitudine,geocodifica_stato"
      )
      .is("geocodifica_stato", null)
      .order("id")
      .limit(1);

    if (erroreClienti) {
      throw erroreClienti;
    }

    if (!clienti || clienti.length === 0) {
      return rispostaJson({
        completato: true,
        totale: totaleClienti || 0,
        elaborati: totaleCompletati || 0,
        message:
          "Tutti i clienti sono stati elaborati.",
      });
    }

    const cliente = clienti[0];

    const clienteTesto = nomeCliente(cliente);

    console.log(
      `Geocodifica cliente ID ${cliente.id}: ${clienteTesto}`
    );

    if (
      cliente.latitudine !== null &&
      cliente.longitudine !== null
    ) {
      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "geocodificato",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      console.log(
        `Cliente ID ${cliente.id} già geocodificato.`
      );

      return rispostaJson({
        completato: false,
        trovato: true,
        gia_geocodificato: true,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        latitudine: cliente.latitudine,
        longitudine: cliente.longitudine,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "geocodificato",
        message:
          "Cliente già geocodificato. Stato aggiornato.",
      });
    }

    const partiIndirizzo = [
      cliente.indirizzo,
      cliente.cap,
      cliente.citta,
      cliente.provincia,
      "Italia",
    ].filter(Boolean);

    const indirizzoCompleto = partiIndirizzo.join(", ");

    if (!cliente.indirizzo || !cliente.citta) {
      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "dati_mancanti",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      console.log(
        `Cliente ID ${cliente.id}: dati mancanti.`
      );

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "dati_mancanti",
        message:
          "Indirizzo o città mancanti. Cliente saltato.",
      });
    }

    const url = new URL(
      "https://nominatim.openstreetmap.org/search"
    );

    url.searchParams.set("q", indirizzoCompleto);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "it");

    console.log(
      `Richiesta Nominatim cliente ID ${cliente.id}: ${indirizzoCompleto}`
    );

    let rispostaNominatim: Response;

    try {
      rispostaNominatim = await fetch(url.toString(), {
        headers: {
          "User-Agent":
            "AssistenzaCO2/1.0 (co2chepassione@gmail.com)",
          "Accept-Language": "it",
        },
      });
    } catch (erroreFetch) {
      const messaggioErrore =
        erroreFetch instanceof Error
          ? erroreFetch.message
          : "Errore fetch sconosciuto";

      console.error(
        `Errore fetch Nominatim cliente ID ${cliente.id}: ${messaggioErrore}`
      );

      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "errore_geocodifica",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "errore_geocodifica",
        message:
          "Errore temporaneo durante la geocodifica. Cliente saltato.",
      });
    }

    if (!rispostaNominatim.ok) {
      const testoRisposta = await rispostaNominatim
        .text()
        .catch(() => "");

      console.error(
        `Nominatim errore cliente ID ${cliente.id}. HTTP ${rispostaNominatim.status}. Risposta: ${testoRisposta}`
      );

      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "errore_geocodifica",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "errore_geocodifica",
        codice_http: rispostaNominatim.status,
        message: `Servizio geocodifica temporaneamente non disponibile. HTTP ${rispostaNominatim.status}. Cliente saltato.`,
      });
    }

    let risultati;

    try {
      risultati = await rispostaNominatim.json();
    } catch (erroreJson) {
      const messaggioErrore =
        erroreJson instanceof Error
          ? erroreJson.message
          : "Risposta JSON non valida";

      console.error(
        `Errore JSON Nominatim cliente ID ${cliente.id}: ${messaggioErrore}`
      );

      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "errore_geocodifica",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "errore_geocodifica",
        message:
          "Risposta geocodifica non valida. Cliente saltato.",
      });
    }

    if (!Array.isArray(risultati) || risultati.length === 0) {
      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "non_trovato",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      console.log(
        `Cliente ID ${cliente.id}: indirizzo non trovato.`
      );

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "non_trovato",
        message:
          "Indirizzo non trovato. Cliente saltato.",
      });
    }

    const latitudine = Number(risultati[0].lat);

    const longitudine = Number(risultati[0].lon);

    if (
      !Number.isFinite(latitudine) ||
      !Number.isFinite(longitudine)
    ) {
      console.error(
        `Coordinate non valide cliente ID ${cliente.id}. Lat: ${risultati[0].lat}, Lon: ${risultati[0].lon}`
      );

      const { error: erroreStato } = await supabaseAdmin
        .from("clienti")
        .update({
          geocodifica_stato: "errore_geocodifica",
        })
        .eq("id", cliente.id);

      if (erroreStato) {
        throw erroreStato;
      }

      return rispostaJson({
        completato: false,
        trovato: false,
        cliente_id: cliente.id,
        cliente: clienteTesto,
        indirizzo: indirizzoCompleto,
        elaborati: (totaleCompletati || 0) + 1,
        totale: totaleClienti || 0,
        stato: "errore_geocodifica",
        message:
          "Coordinate ricevute non valide. Cliente saltato.",
      });
    }

    const { error: erroreAggiornamento } =
      await supabaseAdmin
        .from("clienti")
        .update({
          latitudine,
          longitudine,
          geocodifica_stato: "geocodificato",
        })
        .eq("id", cliente.id);

    if (erroreAggiornamento) {
      throw erroreAggiornamento;
    }

    console.log(
      `Cliente ID ${cliente.id} geocodificato: ${latitudine}, ${longitudine}`
    );

    return rispostaJson({
      completato: false,
      trovato: true,
      cliente_id: cliente.id,
      cliente: clienteTesto,
      indirizzo: indirizzoCompleto,
      latitudine,
      longitudine,
      elaborati: (totaleCompletati || 0) + 1,
      totale: totaleClienti || 0,
      stato: "geocodificato",
      message: "Cliente geocodificato correttamente.",
    });
  } catch (error) {
    const messaggioErrore =
      error instanceof Error
        ? error.message
        : JSON.stringify(error);

    console.error(
      `ERRORE GENERALE GEOCODE-CLIENTI: ${messaggioErrore}`
    );

    return rispostaJson(
      {
        error: messaggioErrore,
      },
      500
    );
  }
});