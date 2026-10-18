// Cle TMDB lue depuis les variables d'environnement Vercel (jamais dans le code)
const TMDB_KEY = process.env.TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

const GENRE_MAP = {
  action: 28, comedy: 35, thriller: 53, scifi: 878,
  horror: 27, drama: 18, romance: 10749, animation: 16,
  adventure: 12, documentary: 99,
};

// Plateformes proposees (Free et OCS retires)
const PROVIDER_INFO = {
  8:   { name: "Netflix" },
  119: { name: "Amazon Prime" },
  337: { name: "Disney+" },
  350: { name: "Apple TV+" },
  381: { name: "Canal+" },
  531: { name: "Paramount+" },
};

// Certains services ont plusieurs IDs TMDB. On interroge tous les IDs
// associes pour ne perdre aucun film, mais on n'affiche qu'une entree.
const PROVIDER_ALIASES = {
  381: [381, 190], // Canal+ : catalogue Canal+ (381) + myCanal (190)
};

function expandProviderIds(ids) {
  const out = new Set();
  ids.forEach((id) => {
    (PROVIDER_ALIASES[id] || [id]).forEach((x) => out.add(x));
  });
  return [...out];
}

// Plancher fixe de votes : garantit que les notes affichees reposent sur
// assez d'avis pour etre credibles, sans exposer de reglage a l'utilisateur.
const MIN_VOTE_COUNT = 50;

// Construit les parametres TMDB a partir des reglages Mood
function buildMoodParams(mood) {
  const base = `&vote_count.gte=${MIN_VOTE_COUNT}`;
  if (!mood) return base;
  let m;
  try {
    m = typeof mood === "string" ? JSON.parse(mood) : mood;
  } catch {
    return base;
  }

  const parts = [];

  // Annee min / max
  if (m.yearMin) parts.push(`&primary_release_date.gte=${m.yearMin}-01-01`);
  if (m.yearMax) parts.push(`&primary_release_date.lte=${m.yearMax}-12-31`);

  // Duree min / max (minutes)
  if (m.runtimeMin) parts.push(`&with_runtime.gte=${m.runtimeMin}`);
  if (m.runtimeMax) parts.push(`&with_runtime.lte=${m.runtimeMax}`);

  // Note minimum (deja sur 10, meme echelle que l'affichage des cartes)
  if (m.ratingMin) parts.push(`&vote_average.gte=${m.ratingMin}`);

  // Pays d'origine (multi-selection, OR)
  if (Array.isArray(m.countries) && m.countries.length > 0) {
    parts.push(`&with_origin_country=${m.countries.join("|")}`);
  }

  parts.push(`&vote_count.gte=${MIN_VOTE_COUNT}`);
  return parts.join("");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { genre, providers, mood, list } = req.query;

  if (!TMDB_KEY) {
    return res.status(500).json({ error: "TMDB_KEY manquante dans les variables d'environnement Vercel" });
  }

  // ── Mode : liste des plateformes avec les logos officiels TMDB ──
  if (list === "providers") {
    try {
      const r = await fetch(`${TMDB_BASE}/watch/providers/movie?api_key=${TMDB_KEY}&watch_region=FR&language=fr-FR`);
      const data = await r.json();
      const wanted = Object.keys(PROVIDER_INFO).map(Number);
      const result = (data.results || [])
        .filter((p) => wanted.includes(p.provider_id))
        .map((p) => ({
          id: p.provider_id,
          name: PROVIDER_INFO[p.provider_id].name,
          logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
        }))
        .sort((a, b) => wanted.indexOf(a.id) - wanted.indexOf(b.id));
      return res.status(200).json({ providers: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!genre || !GENRE_MAP[genre]) return res.status(400).json({ error: "Invalid genre" });

  const moodParam = buildMoodParams(mood);

  const expandedProviders = providers
    ? expandProviderIds(providers.split(",").map(Number)).join("|")
    : null;

  const providerParam = expandedProviders
    ? `&with_watch_providers=${expandedProviders}&watch_region=FR&with_watch_monetization_types=flatrate`
    : "";

  const baseQuery = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc&language=fr-FR${moodParam}`;

  try {
    // 1er appel : page 1, pour connaitre la taille reelle du catalogue.
    // Sans cette borne, la page aleatoire envoyee par le client peut viser
    // au-dela du catalogue (frequent sur les petites plateformes comme
    // Canal+) et renvoyer "aucun film" par intermittence.
    const first = await fetch(`${baseQuery}${providerParam}&page=1`).then((r) => r.json());
    const totalPages = Math.min(first.total_pages || 1, 500); // TMDB plafonne a 500

    const wantedCount = providers ? 5 : 3;
    // Fenetre de pages aleatoire, bornee au catalogue reel
    const maxStart = Math.max(1, totalPages - wantedCount + 1);
    const start = 1 + Math.floor(Math.random() * maxStart);
    const pageNums = [];
    for (let p = start; p < start + wantedCount && p <= totalPages; p++) pageNums.push(p);

    // La page 1 est deja chargee : on la reutilise si elle fait partie de la fenetre
    const pages = await Promise.all(
      pageNums.map((p) =>
        p === 1 ? Promise.resolve(first)
          : fetch(`${baseQuery}${providerParam}&page=${p}`).then((r) => r.json())
      )
    );

    const rawMovies = pages
      .flatMap((p) => p.results || [])
      .filter((m) => m.poster_path)
      .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
      .slice(0, 40);

    // ── Aucun film : on diagnostique la cause pour un message utile ──
    if (rawMovies.length === 0) {
      let reason = "criteria"; // les criteres Mood sont trop stricts
      if (providers) {
        // Les memes criteres, mais sans le filtre plateforme
        try {
          const r = await fetch(`${baseQuery}&page=1`);
          const d = await r.json();
          if ((d.total_results || 0) > 0) {
            // Des films existent : c'est la plateforme qui bloque
            reason = "platform";
            return res.status(200).json({
              movies: [],
              empty: { reason, availableElsewhere: d.total_results },
            });
          }
        } catch {}
      }
      return res.status(200).json({ movies: [], empty: { reason } });
    }

    // Providers + bandes-annonces en parallele
    const [providerResults, trailerResults] = await Promise.all([
      Promise.all(rawMovies.map((m) =>
        fetch(`${TMDB_BASE}/movie/${m.id}/watch/providers?api_key=${TMDB_KEY}`)
          .then((r) => r.json()).catch(() => null)
      )),
      Promise.all(rawMovies.map((m) =>
        fetch(`${TMDB_BASE}/movie/${m.id}/videos?api_key=${TMDB_KEY}&language=fr-FR`)
          .then((r) => r.json()).catch(() => null)
      )),
    ]);

    let movies = rawMovies.map((m, i) => {
      const frData = providerResults[i]?.results?.FR || {};
      const flatrate = (frData.flatrate || [])
        .filter((p) => PROVIDER_INFO[p.provider_id] || PROVIDER_ALIASES[381]?.includes(p.provider_id))
        .map((p) => {
          // Un alias (ex: myCanal 190) s'affiche sous le nom principal (Canal+)
          const mainId = Object.keys(PROVIDER_ALIASES)
            .map(Number)
            .find((k) => PROVIDER_ALIASES[k].includes(p.provider_id)) || p.provider_id;
          const info = PROVIDER_INFO[mainId];
          if (!info) return null;
          return {
            id: mainId,
            name: info.name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
          };
        })
        .filter(Boolean)
        // Dedoublonner (Canal+ et myCanal ne doivent pas apparaitre deux fois)
        .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

      const videos = trailerResults[i]?.results || [];
      const trailer =
        videos.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "fr") ||
        videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
        videos.find((v) => v.site === "YouTube");

      return {
        id: m.id,
        title: m.title,
        year: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
        poster: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
        backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        imdb: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
        synopsis: m.overview || "",
        popularity: m.popularity,
        streamingOn: flatrate,
        trailerKey: trailer?.key || null,
      };
    });

    // Filtre strict : seulement les films reellement sur les plateformes choisies
    if (providers) {
      const selectedIds = expandProviderIds(providers.split(",").map(Number));
      movies = movies.filter((m) =>
        m.streamingOn.some((p) =>
          selectedIds.includes(p.id) ||
          (PROVIDER_ALIASES[p.id] || []).some((a) => selectedIds.includes(a))
        )
      );
    }

    if (movies.length === 0) {
      return res.status(200).json({ movies: [], empty: { reason: "platform" } });
    }

    movies.sort(() => Math.random() - 0.5);
    res.status(200).json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
