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

    let body: {
      richiesta_id?: string | number;
    };

    try {
      body = await req.json();
    } catch {
      return rispostaJson(
        {
          error: "Dati richiesta non validi.",
        },
        400
      );
    }

    if (!body.richiesta_id) {
      return rispostaJson(
        {
          error: "ID richiesta mancante.",
        },
        400
      );
    }

    const {
      data: richiesta,
      error: erroreRichiesta,
    } = await supabaseAdmin
      .from("richieste_intervento")
      .select("*")
      .eq("id", body.richiesta_id)
      .single();

    if (erroreRichiesta || !richiesta) {
      return rispostaJson(
        {
          error: "Richiesta intervento non trovata.",
        },
        404
      );
    }

    if (
      richiesta.latitudine !== null &&
      richiesta.longitudine !== null
    ) {
      return rispostaJson({
        trovato: true,
        gia_geocodificata: true,
        richiesta_id: richiesta.id,
        latitudine: richiesta.latitudine,
        longitudine: richiesta.longitudine,
        message:
          "Richiesta già geocodificata.",
      });
    }

    let indirizzo = richiesta.indirizzo;
    let cap = richiesta.cap;
    let citta = richiesta.citta;
    let provincia = richiesta.provincia;
    let origineIndirizzo = "richiesta";

    if ((!indirizzo || !citta) && richiesta.cliente_id) {
      const { data: cliente, error: erroreCliente } =
        await supabaseAdmin
          .from("clienti")
          .select("id,indirizzo,cap,citta,provincia")
          .eq("id", richiesta.cliente_id)
          .single();

      if (erroreCliente) {
        console.error(
          `Errore recupero cliente ID ${richiesta.cliente_id}: ${erroreCliente.message}`
        );
      }

      if (cliente) {
        indirizzo = indirizzo || cliente.indirizzo;
        cap = cap || cliente.cap;
        citta = citta || cliente.citta;
        provincia = provincia || cliente.provincia;
        origineIndirizzo = "cliente";
      }
    }

    const partiIndirizzo = [
      indirizzo,
      cap,
      citta,
      provincia,
      "Italia",
    ].filter(Boolean);

    const indirizzoCompleto = partiIndirizzo.join(", ");

    if (!indirizzo || !citta) {
      const { error: erroreAggiornamento } =
        await supabaseAdmin
          .from("richieste_intervento")
          .update({
            geocodifica_stato: "dati_mancanti",
          })
          .eq("id", richiesta.id);

      if (erroreAggiornamento) {
        throw erroreAggiornamento;
      }

      return rispostaJson({
        trovato: false,
        richiesta_id: richiesta.id,
        indirizzo: indirizzoCompleto,
        stato: "dati_mancanti",
        message:
          "Indirizzo o città mancanti sia nella richiesta sia nel cliente collegato.",
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
      `Geocodifica richiesta ID ${richiesta.id}: ${indirizzoCompleto}`
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
        `Errore Nominatim richiesta ID ${richiesta.id}: ${messaggioErrore}`
      );

      return rispostaJson({
        trovato: false,
        richiesta_id: richiesta.id,
        stato: "errore_geocodifica",
        message:
          "Errore temporaneo durante la geocodifica.",
      });
    }

    if (!rispostaNominatim.ok) {
      console.error(
        `Nominatim HTTP ${rispostaNominatim.status} richiesta ID ${richiesta.id}`
      );

      return rispostaJson({
        trovato: false,
        richiesta_id: richiesta.id,
        stato: "errore_geocodifica",
        codice_http: rispostaNominatim.status,
        message:
          "Servizio geocodifica temporaneamente non disponibile.",
      });
    }

    const risultati = await rispostaNominatim.json();

    if (!Array.isArray(risultati) || risultati.length === 0) {
      const { error: erroreAggiornamento } =
        await supabaseAdmin
          .from("richieste_intervento")
          .update({
            geocodifica_stato: "non_trovato",
          })
          .eq("id", richiesta.id);

      if (erroreAggiornamento) {
        throw erroreAggiornamento;
      }

      return rispostaJson({
        trovato: false,
        richiesta_id: richiesta.id,
        indirizzo: indirizzoCompleto,
        stato: "non_trovato",
        message:
          "Indirizzo della richiesta non trovato.",
      });
    }

    const latitudine = Number(risultati[0].lat);

    const longitudine = Number(risultati[0].lon);

    if (
      !Number.isFinite(latitudine) ||
      !Number.isFinite(longitudine)
    ) {
      return rispostaJson({
        trovato: false,
        richiesta_id: richiesta.id,
        stato: "errore_geocodifica",
        message:
          "Coordinate ricevute non valide.",
      });
    }

    const { error: erroreAggiornamento } =
      await supabaseAdmin
        .from("richieste_intervento")
        .update({
          latitudine,
          longitudine,
          geocodifica_stato: "geocodificato",
        })
        .eq("id", richiesta.id);

    if (erroreAggiornamento) {
      throw erroreAggiornamento;
    }

    return rispostaJson({
      trovato: true,
      richiesta_id: richiesta.id,
      indirizzo: indirizzoCompleto,
      latitudine,
      longitudine,
      stato: "geocodificato",
      origine_indirizzo: origineIndirizzo,
      message:
        origineIndirizzo === "cliente"
          ? "Richiesta geocodificata usando l'indirizzo del cliente collegato."
          : "Richiesta geocodificata correttamente.",
    });
  } catch (error) {
    const messaggioErrore =
      error instanceof Error
        ? error.message
        : JSON.stringify(error);

    console.error(
      `ERRORE GEOCODE-RICHIESTA: ${messaggioErrore}`
    );

    return rispostaJson(
      {
        error: messaggioErrore,
      },
      500
    );
  }
});