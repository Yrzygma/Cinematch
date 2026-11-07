// Import Letterboxd / IMDb : retrouve les films TMDB correspondant aux lignes
// d'un export. Le fichier est lu dans le navigateur ; seuls les titres (ou les
// identifiants IMDb) arrivent ici, par lots, et rien n'est conserve.
//
// POST { items: [{ imdbId } | { title, year }] }  (50 maximum par appel)
// -> { results: [{ id, title, year, poster } | null] }  (meme ordre)

const TMDB_KEY = process.env.TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const MAX_ITEMS = 50;
const CONCURRENCY = 8;

const yearOf = (d) => (d ? parseInt(String(d).slice(0, 4), 10) || null : null);

function toMovie(m) {
  if (!m?.id) return null;
  return {
    id: m.id,
    title: m.title || m.original_title || "",
    year: yearOf(m.release_date),
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
  };
}

async function tmdb(path) {
  const r = await fetch(`${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}&language=fr-FR`);
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}

// IMDb : correspondance exacte par identifiant
async function byImdbId(imdbId) {
  if (!/^tt\d+$/.test(imdbId || "")) return null;
  const d = await tmdb(`/find/${imdbId}?external_source=imdb_id`);
  return toMovie(d.movie_results?.[0]);
}

// Letterboxd : recherche par titre, l'annee departage les homonymes
async function byTitle(title, year) {
  const q = String(title || "").trim();
  if (!q) return null;
  const enc = encodeURIComponent(q);
  if (year) {
    const exact = await tmdb(`/search/movie?query=${enc}&primary_release_year=${year}`);
    if (exact.results?.length) return toMovie(exact.results[0]);
  }
  // Les dates de sortie different parfois d'un an entre Letterboxd et TMDB
  const loose = await tmdb(`/search/movie?query=${enc}`);
  const list = loose.results || [];
  if (!year) return toMovie(list[0]);
  const near = list.find((m) => {
    const y = yearOf(m.release_date);
    return y && Math.abs(y - year) <= 1;
  });
  return toMovie(near);
}

async function resolve(item) {
  try {
    if (item?.imdbId) return await byImdbId(item.imdbId);
    return await byTitle(item?.title, parseInt(item?.year, 10) || null);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const items = Array.isArray(body?.items) ? body.items.slice(0, MAX_ITEMS) : null;
  if (!items) return res.status(400).json({ error: "Invalid body" });

  const results = new Array(items.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await resolve(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ results });
}
