// Maintien en eveil de Supabase.
// Le projet Supabase gratuit se met en pause apres 7 jours sans activite : toute
// session a deux echoue alors. Vercel appelle cette route une fois par jour
// (voir "crons" dans vercel.json) ; une simple lecture suffit a garder le projet actif.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://aljmfykhkhabzgxeutym.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!SUPABASE_KEY) return res.status(500).json({ ok: false, error: "SUPABASE_SERVICE_KEY manquante" });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
