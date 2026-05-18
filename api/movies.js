const TMDB_KEY = "c61d7d8e6e2a2a3a64aa7a0390814eb2";
const TMDB_BASE = "https://api.themoviedb.org/3";

const GENRE_MAP = {
  action: 28, comedy: 35, thriller: 53, scifi: 878,
  horror: 27, drama: 18, romance: 10749, animation: 16,
  adventure: 12, documentary: 99,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { genre, page = 1 } = req.query;
  if (!genre || !GENRE_MAP[genre]) return res.status(400).json({ error: "Invalid genre" });

  try {
    const pages = await Promise.all(
      [1, 2, 3].map((p) =>
        fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc&vote_count.gte=100&language=fr-FR&page=${Number(page) + p - 1}`)
          .then((r) => r.json())
      )
    );

    const movies = pages
      .flatMap((p) => p.results || [])
      .filter((m) => m.poster_path)
      .map((m) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
        poster: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
        imdb: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
        synopsis: m.overview || "",
        popularity: m.popularity,
      }));

    movies.sort(() => Math.random() - 0.5);
    res.status(200).json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
