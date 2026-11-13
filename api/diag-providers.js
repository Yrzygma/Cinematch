// TEMPORAIRE — diagnostic des plateformes françaises (à supprimer après décision).
// Ouvrir /api/diag-providers dans le navigateur : pour chaque plateforme candidate,
// nombre de films disponibles en France par type d'offre (abonnement, gratuit,
// gratuit avec pub), avec le plancher de 50 votes utilisé par l'appli.

const TMDB_KEY = process.env.TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";

// Plateformes a examiner (noms tels que TMDB les ecrit, en minuscules, partiels)
const WANTED = [
  "tf1", "m6", "france.tv", "francetv", "arte", "max", "hbo", "crunchyroll",
  "pluto", "rakuten", "molotov", "cine+", "ciné+", "ocs", "filmo", "universcine",
  "cinetek", "mubi", "youtube", "plex", "netflix", "amazon", "prime", "disney",
  "apple", "canal", "paramount", "tubi", "6play", "salto", "lacinetek",
];

async function count(id, type) {
  const url = `${TMDB}/discover/movie?api_key=${TMDB_KEY}&watch_region=FR&with_watch_providers=${id}&with_watch_monetization_types=${type}&vote_count.gte=50`;
  try {
    const d = await fetch(url).then((r) => r.json());
    return d.total_results ?? null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!TMDB_KEY) return res.status(500).json({ error: "TMDB_KEY manquante" });
  try {
    const list = await fetch(`${TMDB}/watch/providers/movie?api_key=${TMDB_KEY}&watch_region=FR&language=fr-FR`).then((r) => r.json());
    const candidates = (list.results || []).filter((p) => {
      const n = (p.provider_name || "").toLowerCase();
      return WANTED.some((w) => n.includes(w));
    });
    const rows = [];
    for (const p of candidates) {
      const [abonnement, gratuit, gratuit_pub] = await Promise.all([
        count(p.provider_id, "flatrate"), count(p.provider_id, "free"), count(p.provider_id, "ads"),
      ]);
      rows.push({ id: p.provider_id, nom: p.provider_name, abonnement, gratuit, gratuit_pub });
    }
    rows.sort((a, b) => ((b.abonnement || 0) + (b.gratuit || 0) + (b.gratuit_pub || 0)) - ((a.abonnement || 0) + (a.gratuit || 0) + (a.gratuit_pub || 0)));
    return res.status(200).json({ region: "FR", plancher_votes: 50, plateformes: rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
