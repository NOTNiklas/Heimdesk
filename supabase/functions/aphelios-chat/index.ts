// Aphelios — sichere Anthropic-Proxy-Funktion (Supabase Edge Function, Deno)
//
// Zweck: Der echte Anthropic-API-Key darf niemals im Browser landen. Diese
// Funktion hält ihn als Server-Secret, nimmt Chat-Anfragen vom HeimDesk-Client
// entgegen, ruft die Anthropic Messages API auf (inkl. Tool-Definitionen für
// Function-Calling) und streamt die Antwort unverändert als SSE zurück.
//
// Die Funktion selbst kennt keine Tickets/ToDos und führt keine Tool-Aufrufe
// aus - sie ist ein reiner, zustandsloser Relay. Ausgeführt werden Tools
// ausschließlich im Browser (dort leben die Daten und die Rollen-/Sichtbarkeits-
// Prüfungen), siehe AI.tools in index.html.
//
// Einrichtung (einmalig):
//   1. Supabase-CLI: `supabase functions deploy aphelios-chat --project-ref <ref>`
//      ODER im Supabase-Dashboard unter "Edge Functions" den Code einfügen.
//   2. Secret setzen: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
//      (Dashboard: Project Settings → Edge Functions → Secrets)
//   3. In HeimDesk (Einstellungen → Aphelios) nichts weiter nötig - die Funktion
//      wird automatisch unter <SUPABASE_URL>/functions/v1/aphelios-chat erreicht,
//      dieselbe URL/Anon-Key wie beim Cloud-Sync.

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt. Siehe supabase secrets set." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: { messages?: unknown[]; system?: string; tools?: unknown[]; model?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Ungültiges JSON im Request-Body." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages[] fehlt oder ist leer." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const upstreamBody: Record<string, unknown> = {
    model: body.model || DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: body.messages,
    stream: true,
  };
  if (body.system) upstreamBody.system = body.system;
  if (Array.isArray(body.tools) && body.tools.length) upstreamBody.tools = body.tools;

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Anthropic-API nicht erreichbar: " + String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(JSON.stringify({ error: "Anthropic-API-Fehler (" + upstream.status + "): " + text.slice(0, 500) }), {
      status: upstream.status || 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Roh-SSE 1:1 durchreichen - der Client parst die Anthropic-Streaming-Events selbst.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
