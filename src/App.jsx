import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://aljmfykhkhabzgxeutym.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsam1meWtoa2hhYnpneGV1dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjQxNjQsImV4cCI6MjA5NDcwMDE2NH0._O8bxcAcU9voDu0SB6cLGgXOgIa3joZMsGeiwj_kFvs"
);

// ─── GENRES ───────────────────────────────────────────────────────────────────
const GENRES = [
  { id: "action",      name: "Action",       emoji: "💥", color: "#FF4D4D", desc: "Adrenaline & explosions" },
  { id: "comedy",      name: "Comedie",      emoji: "😂", color: "#FFB347", desc: "Rires garantis" },
  { id: "thriller",    name: "Thriller",     emoji: "😰", color: "#8B5CF6", desc: "Suspense & tension" },
  { id: "scifi",       name: "Sci-Fi",       emoji: "🚀", color: "#06B6D4", desc: "Futur & univers" },
  { id: "horror",      name: "Horreur",      emoji: "👻", color: "#6366F1", desc: "Frissons & terreur" },
  { id: "drama",       name: "Drame",        emoji: "🎭", color: "#14B8A6", desc: "Emotions profondes" },
  { id: "romance",     name: "Romance",      emoji: "💕", color: "#FF69B4", desc: "Feel-good & amour" },
  { id: "animation",   name: "Animation",    emoji: "✨", color: "#84CC16", desc: "Tous publics" },
  { id: "adventure",   name: "Aventure",     emoji: "🗺️", color: "#38BDF8", desc: "Exploration & epopee" },
  { id: "documentary", name: "Documentaire", emoji: "🎥", color: "#F97316", desc: "Le monde reel" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUserId() {
  return Math.random().toString(36).substring(2, 12);
}

async function fetchMovies(genreId) {
  const page = Math.floor(Math.random() * 5) + 1;
  const res = await fetch(`/api/movies?genre=${genreId}&page=${page}`);
  const data = await res.json();
  return data.movies || [];
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function RatingBadge({ score }) {
  if (!score) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,197,24,0.14)", border: "1px solid rgba(245,197,24,0.4)", borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#F5C518" }}>
      ⭐ {score}/10
    </span>
  );
}

function Ind({ type }) {
  return (
    <div style={{ position: "absolute", top: 20, right: type === "like" ? 18 : "auto", left: type === "nope" ? 18 : "auto", background: type === "like" ? "rgba(74,222,128,0.14)" : "rgba(255,77,77,0.14)", border: `2.5px solid ${type === "like" ? "#4ADE80" : "#FF4D4D"}`, borderRadius: 10, padding: "5px 14px", color: type === "like" ? "#4ADE80" : "#FF4D4D", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 2, transform: type === "like" ? "rotate(8deg)" : "rotate(-8deg)", pointerEvents: "none" }}>
      {type === "like" ? "MATCH!" : "NOPE"}
    </div>
  );
}

function Poster({ url, title, style }) {
  const [ok, setOk] = useState(false);
  const hue = [...(title || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = (title || "").replace(/[^a-zA-Z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  return (
    <div style={{ position: "relative", background: `linear-gradient(135deg,hsl(${hue},35%,14%),hsl(${hue},25%,7%))`, overflow: "hidden", ...style }}>
      {url && <img src={url} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: ok ? 1 : 0, transition: "opacity 0.4s" }} onLoad={() => setOk(true)} />}
      {!ok && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 34, color: `hsl(${hue},65%,65%)` }}>{initials}</div>
          <div style={{ fontSize: 10, color: `hsl(${hue},30%,45%)`, textAlign: "center", padding: "0 10px", lineHeight: 1.4 }}>{title}</div>
        </div>
      )}
    </div>
  );
}

function QRCode({ value }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&bgcolor=13131A&color=F0EEE8&margin=10`;
  return <img src={url} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12 }} />;
}

function useSwipe(onSwipe) {
  const startX = useRef(null), currX = useRef(0), dragging = useRef(false);
  const [off, setOff] = useState(0), [rot, setRot] = useState(0), [ind, setInd] = useState(null), [out, setOut] = useState(null);
  const go = liked => { setOut(liked ? "r" : "l"); setTimeout(() => onSwipe(liked), 300); };
  const onStart = x => { startX.current = x; dragging.current = true; };
  const onMove = (x, rf = 0.07) => {
    if (!dragging.current) return;
    const d = x - startX.current; currX.current = d; setOff(d); setRot(d * rf);
    setInd(d > 50 ? "like" : d < -50 ? "nope" : null);
  };
  const onEnd = () => {
    dragging.current = false;
    if (Math.abs(currX.current) > 110) go(currX.current > 0);
    else { setOff(0); setRot(0); setInd(null); }
    startX.current = null; currX.current = 0;
  };
  const tx = out === "r" ? "translateX(160%) rotate(28deg)" : out === "l" ? "translateX(-160%) rotate(-28deg)" : `translateX(${off}px) rotate(${rot}deg)`;
  return { tx, out, ind, onStart, onMove, onEnd };
}

function GenreCard({ genre, onSwipe }) {
  const { tx, out, ind, onStart, onMove, onEnd } = useSwipe(onSwipe);
  return (
    <div style={{ transform: tx, transition: out ? "transform 0.3s ease" : "none", pointerEvents: out ? "none" : "auto", position: "absolute", inset: 0, borderRadius: 22, border: `1px solid ${genre.color}44`, background: `linear-gradient(145deg,${genre.color}12,${genre.color}28)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, cursor: "grab", userSelect: "none", touchAction: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => onMove(e.clientX, 0.08)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => onMove(e.touches[0].clientX, 0.08)} onTouchEnd={onEnd}
    >
      <div style={{ fontSize: 82 }}>{genre.emoji}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, color: genre.color, letterSpacing: "-1px" }}>{genre.name}</div>
      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15 }}>{genre.desc}</div>
      {ind && <Ind type={ind} />}
    </div>
  );
}

function MovieCard({ movie, onSwipe, onDetail, seenIds, onToggleSeen }) {
  const { tx, out, ind, onStart, onMove, onEnd } = useSwipe(onSwipe);
  const isSeen = seenIds.has(movie.id);
  return (
    <div style={{ transform: tx, transition: out ? "transform 0.3s ease" : "none", pointerEvents: out ? "none" : "auto", position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#13131A", boxShadow: "0 28px 64px rgba(0,0,0,0.65)", touchAction: "none", cursor: "grab", userSelect: "none" }}
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => onMove(e.clientX, 0.055)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, 0.055); }} onTouchEnd={onEnd}
    >
      <div style={{ position: "relative", height: 255 }}>
        <Poster url={movie.poster} title={movie.title} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 45%,#13131A 100%)" }} />
        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onToggleSeen(movie.id); }}
          style={{ position: "absolute", top: 12, right: 12, background: isSeen ? "rgba(250,200,50,0.22)" : "rgba(0,0,0,0.55)", border: isSeen ? "1.5px solid rgba(250,200,50,0.65)" : "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: isSeen ? "#FAC832" : "rgba(255,255,255,0.5)", cursor: "pointer", backdropFilter: "blur(8px)" }}>
          {isSeen ? "✓ Deja vu" : "Deja vu ?"}
        </button>
        <div style={{ position: "absolute", bottom: 10, left: 12 }}>
          <RatingBadge score={movie.imdb} />
        </div>
      </div>
      <div style={{ padding: "13px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{movie.title}</div>
            <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, marginTop: 3 }}>{movie.year}</div>
          </div>
          <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDetail(); }}
            style={{ flexShrink: 0, background: "rgba(255,75,75,0.1)", border: "1px solid rgba(255,75,75,0.28)", borderRadius: 9, padding: "6px 12px", color: "#FF4D4D", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
            + Info
          </button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{movie.synopsis}</div>
      </div>
      {ind && <Ind type={ind} />}
    </div>
  );
}

function DetailPanel({ movie, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#0A0A0F", overflowY: "auto" }}>
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <Poster url={movie.poster} title={movie.title} style={{ position: "absolute", inset: 0, filter: "brightness(0.5)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 30%,#0A0A0F 100%)" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>←</button>
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, lineHeight: 1.15, marginBottom: 10 }}>{movie.title}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <RatingBadge score={movie.imdb} />
            {movie.year && <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{movie.year}</span>}
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 22px 48px" }}>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.75 }}>{movie.synopsis}</p>
      </div>
    </div>
  );
}

function MatchModal({ item, type, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: "#13131A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 28, padding: "36px 28px", textAlign: "center", maxWidth: 340, width: "100%" }}>
        <div style={{ fontSize: 52, marginBottom: 6 }}>🎉</div>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#FF4D4D", marginBottom: 18, letterSpacing: "-1px" }}>C'est un MATCH !</div>
        {type === "genre" ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 10 }}>{item.emoji}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{item.name}</div>
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, marginBottom: 24 }}>Vous aimez tous les deux ce genre !</div>
          </>
        ) : (
          <>
            <div style={{ width: 110, height: 150, borderRadius: 12, overflow: "hidden", margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
              <Poster url={item.poster} title={item.title} style={{ width: "100%", height: "100%" }} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 19, marginBottom: 8 }}>{item.title}</div>
            <RatingBadge score={item.imdb} />
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, margin: "12px 0 24px" }}>
              Ce soir : <strong style={{ color: "rgba(255,255,255,0.8)" }}>{item.title}</strong> !
            </div>
          </>
        )}
        <button onClick={onClose} style={{ background: "#FF4D4D", color: "white", border: "none", borderRadius: 14, padding: "15px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "DM Sans, sans-serif" }}>
          {type === "genre" ? "Continuer →" : "🍿 C'est parti !"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CineMatch() {
  // Session
  const [userId] = useState(() => localStorage.getItem("userId") || (() => { const id = generateUserId(); localStorage.setItem("userId", id); return id; })());
  const [sessionId, setSessionId] = useState(null);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [screen, setScreen] = useState("home");
  const [joinCode, setJoinCode] = useState("");
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Genre phase
  const [genreIdx, setGenreIdx] = useState(0);
  const [myGenreLikes, setMyGenreLikes] = useState(new Set());
  const [partnerGenreLikes, setPartnerGenreLikes] = useState(new Set());
  const [matchedGenres, setMatchedGenres] = useState([]);
  const [genreMatch, setGenreMatch] = useState(null);
  const [pendingGenreMatch, setPendingGenreMatch] = useState(null);

  // Movie phase
  const [selGenre, setSelGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [movieIdx, setMovieIdx] = useState(0);
  const [movieMatch, setMovieMatch] = useState(null);
  const [detail, setDetail] = useState(null);
  const [seenIds, setSeenIds] = useState(() => new Set(JSON.parse(localStorage.getItem("seenIds") || "[]")));
  const [skipSeen, setSkipSeen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partnerMovieLikes, setPartnerMovieLikes] = useState(new Set());

  const genreDone = genreIdx >= GENRES.length;
  const movieDone = movieIdx >= movies.length;
  const cur = movies[movieIdx];
  const isSolo = !sessionId;

  // ─── SUPABASE REALTIME ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "votes",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const vote = payload.new;
        if (vote.user_id === userId) return; // ignore own votes

        if (vote.movie_id < 0) {
          // Genre vote: movie_id encodes genre index as negative
          const gIdx = Math.abs(vote.movie_id) - 1;
          if (vote.liked) {
            setPartnerGenreLikes(prev => {
              const next = new Set(prev);
              next.add(gIdx);
              return next;
            });
          }
        } else {
          // Movie vote
          if (vote.liked) {
            setPartnerMovieLikes(prev => {
              const next = new Set(prev);
              next.add(vote.movie_id);
              return next;
            });
          }
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const s = payload.new;
        if (s.partner_name && s.partner_name !== myName) {
          setPartnerName(s.partner_name);
          setPartnerConnected(true);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionId, userId, myName]);

  // Check for genre match when partner likes update
  useEffect(() => {
    if (!pendingGenreMatch) return;
    const { gIdx, genre } = pendingGenreMatch;
    if (partnerGenreLikes.has(gIdx)) {
      setMatchedGenres(prev => {
        if (prev.find(g => g.id === genre.id)) return prev;
        return [...prev, genre];
      });
      setGenreMatch(genre);
      setPendingGenreMatch(null);
      setGenreIdx(i => i + 1);
    }
  }, [partnerGenreLikes, pendingGenreMatch]);
  
  // Check for movie match when partner likes update
  useEffect(() => {
    if (!cur) return;
    // Only trigger if we already liked this movie
  }, [partnerMovieLikes]);

  // ─── SESSION CREATION ─────────────────────────────────────────────────────
  const createSession = async () => {
    const code = generateCode();
    setSessionCode(code);
    const { error } = await supabase.from("sessions").insert({
      id: code,
      status: "waiting",
      host_name: myName || "Vous",
    });
    if (!error) {
      setSessionId(code);
      setScreen("waiting");
    }
  };

  const joinSession = async () => {
    const code = joinCode.toUpperCase().trim();
    const { data, error } = await supabase.from("sessions").select("*").eq("id", code).single();
    if (error || !data) { alert("Code invalide !"); return; }

    await supabase.from("sessions").update({ partner_name: myName || "Partenaire", status: "active" }).eq("id", code);
    setSessionId(code);
    setPartnerName(data.host_name || "Votre partenaire");
    setPartnerConnected(true);
    setScreen("genre");
  };

  // ─── VOTE ─────────────────────────────────────────────────────────────────
  const castVote = async (movieId, liked) => {
    if (!sessionId) return;
    await supabase.from("votes").insert({
      session_id: sessionId,
      user_id: userId,
      movie_id: movieId,
      liked,
    });
  };

  // ─── GENRE SWIPE ──────────────────────────────────────────────────────────
  const onGenreSwipe = async (liked) => {
    const genre = GENRES[genreIdx];
    const gIdx = genreIdx;

    if (liked) {
      setMyGenreLikes(prev => { const n = new Set(prev); n.add(gIdx); return n; });
      await castVote(-(gIdx + 1), true);

      if (isSolo) {
        // Solo mode: 50% chance partner likes it
        if (Math.random() > 0.5) {
          setMatchedGenres(prev => [...prev, genre]);
          setGenreMatch(genre);
          return;
        }
      } else if (partnerGenreLikes.has(gIdx)) {
        setMatchedGenres(prev => [...prev, genre]);
        setGenreMatch(genre);
        return;
      } else {
        setPendingGenreMatch({ gIdx, genre });
      }
    } else {
      await castVote(-(gIdx + 1), false);
    }
    setGenreIdx(i => i + 1);
  };

  // ─── MOVIE SWIPE ──────────────────────────────────────────────────────────
  const onMovieSwipe = async (liked) => {
    const movie = movies[movieIdx];
    const [myMovieLikes, setMyMovieLikes] = useState(new Set());
    await castVote(movie.id, liked);

    if (liked) {
      if (isSolo) {
        if (Math.random() > 0.6) { setMovieMatch(movie); return; }
      } else if (partnerMovieLikes.has(movie.id)) {
        setMovieMatch(movie); return;
      }
      
      // Store our like so partner can match later
      setMyMovieLikes(prev => { const n = new Set(prev); n.add(movie.id); return n; });
    }
    advance(movieIdx + 1);
  };
  
  useEffect(() => {
    if (!partnerMovieLikes.size) return;
    // Check if partner just liked a movie we already liked
    for (const movieId of partnerMovieLikes) {
      if (myMovieLikes.has(movieId)) {
        const movie = movies.find(m => m.id === movieId);
        if (movie && !movieMatch) {
          setMovieMatch(movie);
          return;
        }
      }
    }
  }, [partnerMovieLikes]);
  
  // When partner likes a movie we already liked -> match
  useEffect(() => {
    if (!movies.length) return;
    const myLikedMovies = movies.slice(0, movieIdx).filter((_, i) => i < movieIdx);
    // Check if any movie partner just liked, we also liked
    // This is handled via the realtime callback above
  }, [partnerMovieLikes]);

  const advance = (next) => {
    if (skipSeen) { let i = next; while (i < movies.length && seenIds.has(movies[i].id)) i++; setMovieIdx(i); }
    else setMovieIdx(next);
  };

  const toggleSeen = (id) => {
    setSeenIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      localStorage.setItem("seenIds", JSON.stringify([...n]));
      return n;
    });
  };

  const startMovies = async (g) => {
    setSelGenre(g);
    setLoading(true);
    setScreen("loading");
    try {
      let movieList;
      if (!isSolo) {
        // Check if session already has a movie list
        const { data } = await supabase
          .from("sessions")
          .select("movie_list")
          .eq("id", sessionId)
          .single();

        if (data?.movie_list) {
          // Use existing list (same order for both)
          movieList = JSON.parse(data.movie_list);
        } else {
          // First to arrive generates the list and saves it
          movieList = await fetchMovies(g.id);
          await supabase.from("sessions").update({
            movie_list: JSON.stringify(movieList),
            genre_id: g.id,
          }).eq("id", sessionId);
        }
      } else {
        movieList = await fetchMovies(g.id);
      }
      setMovies(movieList);
      setMovieIdx(0);
      setMyMovieLikes(new Set());
      setScreen("movie");
    } catch {
      setScreen("genre");
    }
    setLoading(false);
  };
  
  const copyLink = () => {
    const url = `${window.location.origin}?join=${sessionCode}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const reset = () => {
    setScreen("home"); setGenreIdx(0); setMatchedGenres([]); setMovies([]);
    setMovieMatch(null); setGenreMatch(null); setSessionId(null);
    setPartnerConnected(false); setMyGenreLikes(new Set()); setPartnerGenreLikes(new Set());
    setPartnerMovieLikes(new Set()); setPendingGenreMatch(null);
  };

  // Auto-join from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("join");
    if (code) { setJoinCode(code); setScreen("join"); }
  }, []);

  // Watch for partner joining
  // Watch for partner joining
useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`waiting:${sessionId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new?.partner_name) {
          setPartnerName(payload.new.partner_name);
          setPartnerConnected(true);
          setScreen("genre");
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId]);
  
  const Btn = ({ onClick, children, outline, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{ background: outline ? "rgba(255,255,255,0.06)" : "#FF4D4D", color: outline ? "rgba(255,255,255,0.55)" : "white", border: outline ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: 14, padding: "15px 24px", fontSize: 15, fontWeight: 600, cursor: disabled ? "default" : "pointer", width: "100%", fontFamily: "DM Sans, sans-serif", marginBottom: 10, opacity: disabled ? 0.4 : 1 }}>{children}</button>
  );

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 15px", color: "#F0EEE8", fontSize: 15, fontFamily: "DM Sans, sans-serif", outline: "none", marginBottom: 12 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0F;color:#F0EEE8;font-family:'DM Sans',sans-serif;min-height:100vh}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.4);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 20%,rgba(255,75,75,0.07) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(100,80,255,0.07) 0%,transparent 55%)" }} />

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 440, padding: "22px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-1px" }}>Cine<span style={{ color: "#FF4D4D" }}>Match</span></div>
          {screen !== "home" && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: partnerConnected ? "#4ADE80" : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
              {partnerConnected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />}
              {partnerConnected ? partnerName : (isSolo ? "Solo" : "En attente...")}
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 440, padding: "0 20px 48px", position: "relative", zIndex: 1 }}>

          {/* HOME */}
          {screen === "home" && (
            <div style={{ textAlign: "center", paddingTop: 36 }}>
              <div style={{ fontSize: 72, marginBottom: 18, animation: "float 3s ease-in-out infinite" }}>🎬</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1.1, marginBottom: 12, letterSpacing: "-2px" }}>Trouvez votre<br /><span style={{ color: "#FF4D4D" }}>film ce soir</span></div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>Swipez ensemble, matchez sur le meme film.</div>
              <Btn onClick={() => setScreen("create")}>Creer une session 🚀</Btn>
              <Btn outline onClick={() => setScreen("join")}>Rejoindre une session</Btn>
              <div style={{ height: 8 }} />
              <Btn outline onClick={() => { setScreen("genre"); }}>Mode solo</Btn>
            </div>
          )}

          {/* CREATE SESSION */}
          {screen === "create" && (
            <div style={{ paddingTop: 36 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 25, marginBottom: 6 }}>Nouvelle session</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 26 }}>Entrez votre prenom</div>
              <input placeholder="Votre prenom" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              <Btn onClick={createSession} disabled={!myName.trim()}>Creer et inviter 🔗</Btn>
              <Btn outline onClick={() => setScreen("home")}>Retour</Btn>
            </div>
          )}

          {/* WAITING FOR PARTNER */}
          {screen === "waiting" && (
            <div style={{ paddingTop: 36, textAlign: "center" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Invitez votre partenaire</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Partagez ce code ou ce lien</div>

              {/* Big code */}
              <div style={{ background: "rgba(255,75,75,0.1)", border: "2px solid rgba(255,75,75,0.3)", borderRadius: 18, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,75,75,0.7)", marginBottom: 8 }}>Code de session</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 42, letterSpacing: 8, color: "#FF4D4D" }}>{sessionCode}</div>
              </div>

              {/* QR Code */}
              <div style={{ marginBottom: 20 }}>
                <QRCode value={`${window.location.origin}?join=${sessionCode}`} />
              </div>

              {/* Copy link button */}
              <button onClick={copyLink} style={{ background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)", color: copied ? "#4ADE80" : "rgba(255,255,255,0.6)", border: copied ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px", fontSize: 14, cursor: "pointer", fontFamily: "DM Sans, sans-serif", width: "100%", marginBottom: 12 }}>
                {copied ? "✓ Lien copie !" : "Copier le lien"}
              </button>

              {/* Waiting indicator */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.35)", fontSize: 14, marginTop: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFB347", animation: "pulse 1.5s ease-in-out infinite" }} />
                En attente de votre partenaire...
              </div>
            </div>
          )}

          {/* JOIN SESSION */}
          {screen === "join" && (
            <div style={{ paddingTop: 36 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 25, marginBottom: 6 }}>Rejoindre une session</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 26 }}>Entrez le code partagé par votre partenaire</div>
              <input placeholder="Votre prenom" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              <input placeholder="Code de session (ex: ABC123)" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                style={{ ...inputStyle, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: 4, textAlign: "center" }} />
              <Btn onClick={joinSession} disabled={!joinCode.trim() || !myName.trim()}>Rejoindre ✓</Btn>
              <Btn outline onClick={() => setScreen("home")}>Retour</Btn>
            </div>
          )}

          {/* LOADING */}
          {screen === "loading" && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 20, animation: "float 2s ease-in-out infinite" }}>{selGenre?.emoji || "🎬"}</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Chargement des films...</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Recherche en cours sur TMDB</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,75,75,0.4)", animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}

          {/* GENRE SWIPE */}
          {screen === "genre" && !genreDone && !genreMatch && (
            <div>
              <div style={{ paddingTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: "rgba(255,75,75,0.65)", fontWeight: 700, marginBottom: 6 }}>Etape 1 · Genres</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 2.5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#FF4D4D", borderRadius: 3, width: `${(genreIdx / GENRES.length) * 100}%`, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{genreIdx}/{GENRES.length}</div>
                </div>
              </div>
              {partnerConnected && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "9px 14px", marginBottom: 14, fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
                  <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>{partnerName}</strong> est connecte et swipe en meme temps</span>
                </div>
              )}
              <div style={{ position: "relative", height: 300, marginBottom: 22 }}>
                {genreIdx + 2 < GENRES.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transform: "scale(0.88) translateY(16px)" }} />}
                {genreIdx + 1 < GENRES.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transform: "scale(0.94) translateY(8px)" }} />}
                <GenreCard key={genreIdx} genre={GENRES[genreIdx]} onSwipe={onGenreSwipe} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 14 }}>
                <button onClick={() => onGenreSwipe(false)} style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,77,77,0.1)", border: "1.5px solid rgba(255,77,77,0.28)", fontSize: 24, cursor: "pointer" }}>✗</button>
                <button onClick={() => onGenreSwipe(true)} style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1.5px solid rgba(74,222,128,0.28)", fontSize: 24, cursor: "pointer" }}>♥</button>
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>Glissez ou appuyez pour voter</div>
            </div>
          )}

          {/* GENRE DONE - no match */}
          {screen === "genre" && genreDone && matchedGenres.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>😅</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Aucun genre en commun</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Recommencez !</div>
              <Btn onClick={() => { setGenreIdx(0); setMatchedGenres([]); setMyGenreLikes(new Set()); setPartnerGenreLikes(new Set()); }}>Recommencer</Btn>
            </div>
          )}

          {/* GENRE DONE - pick */}
          {screen === "genre" && genreDone && matchedGenres.length > 0 && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: "rgba(255,75,75,0.65)", fontWeight: 700, marginBottom: 4 }}>🎉 Genres matches</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 4 }}><span style={{ color: "#FF4D4D" }}>{matchedGenres.length} genre{matchedGenres.length > 1 ? "s" : ""}</span> en commun</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 18 }}>Choisissez pour charger les films →</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {matchedGenres.map(g => (
                  <div key={g.id} onClick={() => startMovies(g)} style={{ borderRadius: 16, padding: "16px 12px", cursor: "pointer", border: `1px solid ${g.color}28`, background: `${g.color}0c`, textAlign: "center" }}>
                    <div style={{ fontSize: 30, marginBottom: 7 }}>{g.emoji}</div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: g.color }}>{g.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MOVIE SWIPE */}
          {screen === "movie" && !movieDone && !movieMatch && cur && (
            <div>
              <div style={{ paddingTop: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: "rgba(255,75,75,0.65)", fontWeight: 700, marginBottom: 6 }}>
                  Films · {selGenre && <span style={{ color: selGenre.color }}>{selGenre.emoji} {selGenre.name}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 2.5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#FF4D4D", borderRadius: 3, width: `${movies.length > 0 ? (movieIdx / movies.length) * 100 : 0}%`, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{movieIdx}/{movies.length}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Passer les deja vus {seenIds.size > 0 ? `(${seenIds.size})` : ""}</span>
                  <div onClick={() => setSkipSeen(v => !v)} style={{ width: 38, height: 20, borderRadius: 10, background: skipSeen ? "#FF4D4D" : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: skipSeen ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
              <div style={{ position: "relative", height: 430, marginBottom: 16 }}>
                {movieIdx + 2 < movies.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", transform: "scale(0.88) translateY(16px)" }} />}
                {movieIdx + 1 < movies.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transform: "scale(0.94) translateY(8px)" }} />}
                <MovieCard key={`${selGenre?.id}-${movieIdx}`} movie={cur} onSwipe={onMovieSwipe} onDetail={() => setDetail(cur)} seenIds={seenIds} onToggleSeen={toggleSeen} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 12 }}>
                <button onClick={() => onMovieSwipe(false)} style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,77,77,0.1)", border: "1.5px solid rgba(255,77,77,0.28)", fontSize: 24, cursor: "pointer" }}>✗</button>
                <button onClick={() => onMovieSwipe(true)} style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1.5px solid rgba(74,222,128,0.28)", fontSize: 24, cursor: "pointer" }}>♥</button>
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setScreen("genre")} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Changer de genre</button>
              </div>
            </div>
          )}

          {/* NO MATCH */}
          {screen === "movie" && movieDone && !movieMatch && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🍿</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Pas de match !</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 28 }}>Essayez un autre genre !</div>
              <Btn onClick={() => setScreen("genre")}>Choisir un autre genre</Btn>
              <Btn outline onClick={() => startMovies(selGenre)}>Recharger ce genre</Btn>
            </div>
          )}

          {/* FINAL */}
          {screen === "final" && (
            <div style={{ textAlign: "center", paddingTop: 56 }}>
              <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🍿</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 10, letterSpacing: "-1px" }}>Bonne seance !</div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15, marginBottom: 34 }}>Eteignez les lumieres et profitez !</div>
              <Btn onClick={reset}>Nouvelle session</Btn>
            </div>
          )}
        </div>

        {genreMatch && <MatchModal item={genreMatch} type="genre" onClose={() => { setGenreMatch(null); setGenreIdx(i => i + 1); }} />}
        {movieMatch && <MatchModal item={movieMatch} type="movie" onClose={() => { setMovieMatch(null); setScreen("final"); }} />}
        {detail && <DetailPanel movie={detail} onClose={() => setDetail(null)} />}
      </div>
    </>
  );
}
