// Notes IMDb et Rotten Tomatoes d'un film, via OMDb.
//
// Le quota OMDb gratuit est de 1 000 requetes par jour. Pour l'economiser :
// 1. chaque note recuperee est conservee dans la table Supabase `ratings` ;
// 2. on ne redemande a OMDb qu'apres expiration (60 jours si une note existe,
//    14 jours si le film n'en avait pas encore : les films recents en gagnent) ;
// 3. la reponse est aussi mise en cache par Vercel (s-maxage).
// Un film n'est donc demande a OMDb qu'une fois, tous utilisateurs confondus.
//
// Variables d'environnement Vercel : TMDB_KEY, OMDB_KEY, SUPABASE_SERVICE_KEY.
// La table `ratings` a le RLS active sans policy : seule la cle service
// (cote serveur, jamais dans le navigateur) peut la lire et l'ecrire.

const TMDB_KEY = process.env.TMDB_KEY;
const OMDB_KEY = process.env.OMDB_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://aljmfykhkhabzgxeutym.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const DAY = 24 * 60 * 60 * 1000;
const TTL_WITH_RATING = 60 * DAY;
const TTL_WITHOUT_RATING = 14 * DAY;

const sbHeaders = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

async function readCache(tmdbId) {
  if (!SUPABASE_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/ratings?tmdb_id=eq.${tmdbId}&select=*`, { headers: sbHeaders() });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function writeCache(row) {
  if (!SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/ratings?on_conflict=tmdb_id`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
  } catch {}
}

function isFresh(row) {
  if (!row?.fetched_at) return false;
  const age = Date.now() - new Date(row.fetched_at).getTime();
  return age < (row.imdb_rating != null ? TTL_WITH_RATING : TTL_WITHOUT_RATING);
}

const toPublic = (row) => ({
  imdb: row?.imdb_rating != null ? Number(row.imdb_rating) : null,
  rt: row?.rt_score != null ? Number(row.rt_score) : null,
});

// Interroge TMDB (identifiant IMDb) puis OMDb (notes).
// Renvoie la ligne a conserver, ou null si OMDb est indisponible (quota
// atteint, panne) : dans ce cas on ne conserve rien, pour reessayer plus tard.
async function fetchFresh(tmdbId) {
  const ext = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_KEY}`).then((r) => r.json());
  const imdbId = ext?.imdb_id || null;
  const row = { tmdb_id: tmdbId, imdb_id: imdbId, imdb_rating: null, imdb_votes: null, rt_score: null, fetched_at: new Date().toISOString() };
  if (!imdbId) return row; // film inconnu d'IMDb : aucune note possible

  const o = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbId}`).then((r) => r.json());
  if (o?.Response === "False") {
    // "Movie not found!" : reponse definitive. Tout le reste (quota, cle) : temporaire.
    return /not found/i.test(o.Error || "") ? row : null;
  }
  const rating = parseFloat(o?.imdbRating);
  const votes = parseInt(String(o?.imdbVotes || "").replace(/[^0-9]/g, ""), 10);
  const rt = (o?.Ratings || []).find((x) => x.Source === "Rotten Tomatoes");
  const rtScore = rt ? parseInt(rt.Value, 10) : NaN;
  row.imdb_rating = Number.isFinite(rating) ? rating : null;
  row.imdb_votes = Number.isFinite(votes) ? votes : null;
  row.rt_score = Number.isFinite(rtScore) ? rtScore : null;
  return row;
}

export default async function handler(req, res) {
  const tmdbId = parseInt(req.query.id, 10);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) return res.status(400).json({ error: "Invalid id" });

  const cached = await readCache(tmdbId);
  if (cached && isFresh(cached)) {
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(toPublic(cached));
  }

  if (!OMDB_KEY) return res.status(200).json(toPublic(cached));

  try {
    const fresh = await fetchFresh(tmdbId);
    if (!fresh) {
      // OMDb indisponible : on rend l'ancienne note si on en a une, sans cache CDN
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(toPublic(cached));
    }
    await writeCache(fresh);
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(toPublic(fresh));
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(toPublic(cached));
  }
}
