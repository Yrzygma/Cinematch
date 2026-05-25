const TMDB_KEY = "c61d7d8e6e2a2a3a64aa7a0390814eb2";
const TMDB_BASE = "https://api.themoviedb.org/3";

const GENRE_MAP = {
  action: 28, comedy: 35, thriller: 53, scifi: 878,
  horror: 27, drama: 18, romance: 10749, animation: 16,
  adventure: 12, documentary: 99,
};

// Map TMDB provider IDs to names/logos
const PROVIDER_INFO = {
  8:   { name: "Netflix",      logo: "🔴" },
  119: { name: "Amazon Prime", logo: "🔵" },
  337: { name: "Disney+",      logo: "⭐" },
  350: { name: "Apple TV+",    logo: "🍎" },
  190: { name: "Canal+",       logo: "⬛" },
  56:  { name: "OCS",          logo: "🟠" },
  531: { name: "Paramount+",   logo: "💫" },
  29:  { name: "Free",         logo: "📺" },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { genre, page = 1, providers } = req.query;
  if (!genre || !GENRE_MAP[genre]) return res.status(400).json({ error: "Invalid genre" });

  // Only flatrate (subscription), not rent/buy
  const providerParam = providers
    ? `&with_watch_providers=${providers}&watch_region=FR&with_watch_monetization_types=flatrate`
    : "";

  try {
    // Fetch movie lists
    const pages = await Promise.all(
      [1, 2, 3].map((p) =>
        fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc&vote_count.gte=100&language=fr-FR${providerParam}&page=${Number(page) + p - 1}`)
          .then((r) => r.json())
      )
    );

    const rawMovies = pages
      .flatMap((p) => p.results || [])
      .filter((m) => m.poster_path)
      .slice(0, 40); // limit to 40 to keep provider fetches fast

    // Fetch providers for each movie in parallel (batch of 40)
    const providerResults = await Promise.all(
      rawMovies.map((m) =>
        fetch(`${TMDB_BASE}/movie/${m.id}/watch/providers?api_key=${TMDB_KEY}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    );

    const movies = rawMovies.map((m, i) => {
      const frData = providerResults[i]?.results?.FR || {};
      // Only flatrate (subscription), not rent/buy/ads
      const flatrate = (frData.flatrate || [])
        .filter((p) => PROVIDER_INFO[p.provider_id])
        .map((p) => ({
          id: p.provider_id,
          name: PROVIDER_INFO[p.provider_id].name,
          logo: PROVIDER_INFO[p.provider_id].logo,
        }));

      return {
        id: m.id,
        title: m.title,
        year: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
        poster: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
        imdb: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
        synopsis: m.overview || "",
        popularity: m.popularity,
        streamingOn: flatrate,
      };
    });

    movies.sort(() => Math.random() - 0.5);
    res.status(200).json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
