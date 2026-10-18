import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { initAnalytics, track } from "./analytics.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://aljmfykhkhabzgxeutym.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsam1meWtoa2hhYnpneGV1dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjQxNjQsImV4cCI6MjA5NDcwMDE2NH0._O8bxcAcU9voDu0SB6cLGgXOgIa3joZMsGeiwj_kFvs"
);


// ─── THEME : NOIR CINEMA ──────────────────────────────────────────────────────
const T = {
  bg: "#0A0A0B",
  bgGrad: "radial-gradient(ellipse at top, #16140F 0%, #0A0A0B 55%)",
  card: "#16161A",
  cardSoft: "#1C1C20",
  border: "rgba(212,175,55,0.18)",
  borderSoft: "rgba(255,255,255,0.08)",
  accent: "#D4AF37",
  accentSoft: "rgba(212,175,55,0.12)",
  accentDark: "#0A0A0B",
  text: "#F5F0E6",
  textMid: "rgba(245,240,230,0.7)",
  sub: "rgba(245,240,230,0.45)",
  display: "'Fraunces', serif",
  body: "'DM Sans', sans-serif",
  btnGrad: "linear-gradient(135deg, #D4AF37, #C19B2E)",
  green: "#5FB97A",
  red: "#D9534F",
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, color = T.accent, size = 36, fill = false }) {
  const s = { width: size, height: size, viewBox: "0 0 32 32", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    clap: <svg {...s}><rect x="4" y="12" width="24" height="16" rx="2"/><path d="M4 12L6.5 5L28 8L26.5 15"/><path d="M14 6L8 13M16 7L14 14M22 8.5L20 15"/></svg>,
    action: <svg {...s}><path d="M13 2L5 18h7l-2 12 12-18h-7l2-10z"/></svg>,
    comedy: <svg {...s}><circle cx="16" cy="16" r="12"/><path d="M11 13h.01M21 13h.01"/><path d="M10 19c1.5 2 10.5 2 12 0"/></svg>,
    thriller: <svg {...s}><path d="M16 3l11 6v7c0 7-5 11-11 13C10 27 5 23 5 16V9l11-6z"/><path d="M16 12v5"/><path d="M16 21h.01"/></svg>,
    scifi: <svg {...s}><ellipse cx="16" cy="16" rx="13" ry="5"/><circle cx="16" cy="16" r="5"/></svg>,
    horror: <svg {...s}><path d="M16 4C9 4 6 9 6 15c0 4 2 6 2 9h16c0-3 2-5 2-9 0-6-3-11-10-11z"/><path d="M12 14h.01M20 14h.01"/><path d="M13 22v3M19 22v3M16 22v4"/></svg>,
    drama: <svg {...s}><path d="M6 6c0 10 2 16 10 16s10-6 10-16c-4-1-6-2-10-2s-6 1-10 2z"/><path d="M11 12h.01M21 12h.01"/><path d="M13 17c1 1.5 5 1.5 6 0"/></svg>,
    romance: <svg {...s}><path d="M16 27C16 27 4 20 4 11.5C4 7 7 4 11 4c2.5 0 4 1.5 5 3c1-1.5 2.5-3 5-3c4 0 7 3 7 7.5C28 20 16 27 16 27z"/></svg>,
    animation: <svg {...s}><path d="M16 3l3.5 7L27 11l-5.5 5.5L23 24l-7-4-7 4 1.5-7.5L5 11l7.5-1z"/></svg>,
    adventure: <svg {...s}><circle cx="16" cy="16" r="12"/><path d="M21 11l-3.5 7.5L10 22l3.5-7.5L21 11z"/></svg>,
    documentary: <svg {...s}><rect x="4" y="8" width="24" height="18" rx="2"/><circle cx="16" cy="17" r="4"/><path d="M9 8V5h6v3"/></svg>,
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.3 3 12 4.2 12 4.2C12 4.2 13.7 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z"/></svg>,
    x: <svg {...s}><path d="M8 8l16 16M24 8L8 24"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z"/></svg>,
    bookmark: <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={color} strokeWidth={2} strokeLinejoin="round"><path d="M6 4h12v16l-6-4-6 4V4z"/></svg>,
    back: <svg {...s}><path d="M20 8l-8 8 8 8"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l3 6.5 7 .8-5 4.8 1.3 7L12 17.8 5.7 21l1.3-7-5-4.8 7-.8z"/></svg>,
    share: <svg {...s}><circle cx="7" cy="16" r="3"/><circle cx="23" cy="8" r="3"/><circle cx="23" cy="24" r="3"/><path d="M10 14.5l10-5M10 17.5l10 5"/></svg>,
    check: <svg {...s}><path d="M6 16l7 7L26 9"/></svg>,
  };
  return icons[name] || null;
}

// ─── GENRES ───────────────────────────────────────────────────────────────────
const GENRES = [
  { id: "action",      name: "Action",       icon: "action",      color: "#D4AF37", desc: "Adrénaline & explosions" },
  { id: "comedy",      name: "Comédie",      icon: "comedy",      color: "#D4AF37", desc: "Rires garantis" },
  { id: "thriller",    name: "Thriller",     icon: "thriller",    color: "#D4AF37", desc: "Suspense & tension" },
  { id: "scifi",       name: "Sci-Fi",       icon: "scifi",       color: "#D4AF37", desc: "Futur & univers" },
  { id: "horror",      name: "Horreur",      icon: "horror",      color: "#D4AF37", desc: "Frissons & terreur" },
  { id: "drama",       name: "Drame",        icon: "drama",       color: "#D4AF37", desc: "Émotions profondes" },
  { id: "romance",     name: "Romance",      icon: "romance",     color: "#D4AF37", desc: "Feel-good & amour" },
  { id: "animation",   name: "Animation",    icon: "animation",   color: "#D4AF37", desc: "Tous publics" },
  { id: "adventure",   name: "Aventure",     icon: "adventure",   color: "#D4AF37", desc: "Exploration & épopée" },
  { id: "documentary", name: "Documentaire", icon: "documentary", color: "#D4AF37", desc: "Le monde réel" },
];


// ─── STREAMING PROVIDERS ──────────────────────────────────────────────────────
const PROVIDERS = [
  { id: 8,   name: "Netflix",      color: "#E50914" },
  { id: 119, name: "Amazon Prime", color: "#00A8E0" },
  { id: 337, name: "Disney+",      color: "#113CCF" },
  { id: 350, name: "Apple TV+",    color: "#888888" },
  { id: 381, name: "Canal+",       color: "#C4C4C4" },
  { id: 531, name: "Paramount+",   color: "#0064FF" },
];

// ─── MOOD : criteres de recherche ─────────────────────────────────────────────
const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "US", name: "États-Unis" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "KR", name: "Corée du Sud" },
  { code: "JP", name: "Japon" },
  { code: "IT", name: "Italie" },
  { code: "ES", name: "Espagne" },
  { code: "DE", name: "Allemagne" },
  { code: "IN", name: "Inde" },
];

const YEAR_MIN = 1950;
const YEAR_MAX = new Date().getFullYear();
const RUNTIME_MIN = 60;
const RUNTIME_MAX = 240;

const DEFAULT_MOOD = {
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  runtimeMin: RUNTIME_MIN,
  runtimeMax: RUNTIME_MAX,
  ratingMin: 0,
  countries: [],
  ratingScale10: true,
};

// Un mood est "actif" s'il differe des valeurs par defaut
function isMoodActive(m) {
  return (
    m.yearMin !== YEAR_MIN ||
    m.yearMax !== YEAR_MAX ||
    m.runtimeMin !== RUNTIME_MIN ||
    m.runtimeMax !== RUNTIME_MAX ||
    m.ratingMin > 0 ||
    m.countries.length > 0
  );
}


// ─── MOOD FILTERS ─────────────────────────────────────────────────────────────
// ─── HELPERS ──────────────────────────────────────────────────────────────────
const APP_URL = "https://cinematch-tau-eight.vercel.app";

// Les erreurs reseau (Supabase en pause, connexion coupee) ne renvoient pas de code
// Postgres : on les distingue d'un simple "code introuvable".
function isNetworkError(error) {
  if (!error) return false;
  if (error.code === "PGRST116") return false; // aucune ligne : code introuvable
  const msg = String(error.message || error).toLowerCase();
  return !error.code || msg.includes("fetch") || msg.includes("network");
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUserId() {
  return Math.random().toString(36).substring(2, 12);
}

async function fetchMovies(genreId, providers = [], mood = null) {
  const page = Math.floor(Math.random() * 5) + 1;
  const providerParam = providers.length > 0 ? `&providers=${providers.join(',')}` : '';
  const moodParam = mood ? `&mood=${encodeURIComponent(JSON.stringify(mood))}` : '';
  const res = await fetch(`/api/movies?genre=${genreId}&page=${page}${providerParam}${moodParam}`);
  const data = await res.json();
  // { movies: [...], empty?: { reason, availableElsewhere } }
  return { movies: data.movies || [], empty: data.empty || null };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

// Formate une duree en minutes -> "1h35"
function fmtDur(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

// Curseur de note minimum, sur 10 (meme echelle que les cartes de films)
function RatingSlider({ value, onChange }) {
  const MIN = 0;
  const MAX = 9;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div>
      <div style={{ position: "relative", height: 28 }}>
        <style>{`
          .rt::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 20px; height: 20px; border-radius: 50%;
            background: ${T.accent}; border: 2px solid ${T.bg};
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          }
          .rt::-moz-range-thumb {
            width: 20px; height: 20px; border-radius: 50%;
            background: ${T.accent}; border: 2px solid ${T.bg};
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          }
        `}</style>
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: T.borderSoft }} />
        <div style={{ position: "absolute", top: 12, left: 0, height: 4, borderRadius: 2, background: T.accent, width: `${pct}%` }} />
        <input className="rt" type="range" min={MIN} max={MAX} step={0.5} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", width: "100%", top: 0, height: 28, WebkitAppearance: "none", appearance: "none", background: "none", margin: 0 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 11, color: T.sub }}>Peu importe</span>
        <span style={{ fontSize: 11, color: T.sub }}>9 / 10</span>
      </div>
    </div>
  );
}

// Double curseur min/max
function RangeSlider({ min, max, step, valueMin, valueMax, onChange }) {
  const pct = (v) => ((v - min) / (max - min)) * 100;
  const setLo = (v) => onChange(Math.min(v, valueMax - step), valueMax);
  const setHi = (v) => onChange(valueMin, Math.max(v, valueMin + step));

  const thumbStyle = {
    position: "absolute", width: "100%", top: 0, height: 28,
    WebkitAppearance: "none", appearance: "none",
    background: "none", pointerEvents: "none", margin: 0,
  };

  return (
    <div style={{ position: "relative", height: 28 }}>
      <style>{`
        .rs::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: ${T.accent}; border: 2px solid ${T.bg};
          cursor: pointer; pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        .rs::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: ${T.accent}; border: 2px solid ${T.bg};
          cursor: pointer; pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
      `}</style>
      <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: T.borderSoft }} />
      <div style={{ position: "absolute", top: 12, height: 4, borderRadius: 2, background: T.accent,
        left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }} />
      <input className="rs" type="range" min={min} max={max} step={step} value={valueMin}
        onChange={(e) => setLo(Number(e.target.value))} style={thumbStyle} />
      <input className="rs" type="range" min={min} max={max} step={step} value={valueMax}
        onChange={(e) => setHi(Number(e.target.value))} style={thumbStyle} />
    </div>
  );
}

function RatingBadge({ score }) {
  if (!score) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,197,24,0.14)", border: "1px solid rgba(245,197,24,0.4)", borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#F5C518" }}>
      <Icon name="star" size={11} color="#F5C518" /> {score}/10
    </span>
  );
}

function Ind({ type }) {
  return (
    <div style={{ position: "absolute", top: 20, right: type === "like" ? 18 : "auto", left: type === "nope" ? 18 : "auto", background: type === "like" ? T.accentSoft : "rgba(217,83,79,0.16)", border: `2.5px solid ${type === "like" ? T.accent : T.red}`, borderRadius: 10, padding: "5px 14px", color: type === "like" ? T.accent : T.red, fontFamily: T.display, fontWeight: 700, fontSize: 18, letterSpacing: 1, transform: type === "like" ? "rotate(8deg)" : "rotate(-8deg)", pointerEvents: "none" }}>
      {type === "like" ? "MATCH" : "NON"}
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
          <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 34, color: `hsl(${hue},65%,65%)` }}>{initials}</div>
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
      <Icon name={genre.icon} size={84} />
      <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 36, color: genre.color, letterSpacing: "-1px" }}>{genre.name}</div>
      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15 }}>{genre.desc}</div>
      {ind && <Ind type={ind} />}
    </div>
  );
}

function MovieCard({ movie, onSwipe, onDetail, seenIds, onToggleSeen, wishlist = [], onToggleWishlist }) {
  const { tx, out, ind, onStart, onMove, onEnd } = useSwipe(onSwipe);
  const isSeen = seenIds.has(movie.id);
  const inList = wishlist.some(m => m.id === movie.id);
  return (
    <div style={{ transform: tx, transition: out ? "transform 0.3s ease" : "none", pointerEvents: out ? "none" : "auto", position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#13131A", boxShadow: "0 28px 64px rgba(0,0,0,0.65)", touchAction: "none", cursor: "grab", userSelect: "none" }}
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => onMove(e.clientX, 0.055)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, 0.055); }} onTouchEnd={onEnd}
    >
      <div style={{ position: "relative", height: 255 }}>
        <Poster url={movie.backdrop || movie.poster} title={movie.title} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 45%,#13131A 100%)" }} />
        <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onToggleSeen(movie.id); }}
          style={{ position: "absolute", top: 12, right: 12, background: isSeen ? "rgba(250,200,50,0.22)" : "rgba(0,0,0,0.55)", border: isSeen ? "1.5px solid rgba(250,200,50,0.65)" : "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: isSeen ? "#FAC832" : "rgba(255,255,255,0.5)", cursor: "pointer", backdropFilter: "blur(8px)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {isSeen && <Icon name="check" size={11} color="#FAC832" />}
            {isSeen ? "Déjà vu" : "Déjà vu ?"}
          </span>
        </button>
        {onToggleWishlist && (
          <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onToggleWishlist(movie); }}
            aria-label={inList ? "Retirer de ma liste" : "Ajouter à ma liste"}
            style={{ position: "absolute", top: 10, left: 12, width: 34, height: 34, borderRadius: "50%", background: inList ? "rgba(212,175,55,0.22)" : "rgba(0,0,0,0.55)", border: inList ? `1.5px solid ${T.accent}` : "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}>
            <Icon name="bookmark" size={15} color={inList ? T.accent : "rgba(255,255,255,0.75)"} fill={inList} />
          </button>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 12 }}>
          <RatingBadge score={movie.imdb} />
        </div>
      </div>
      <div style={{ padding: "13px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{movie.title}</div>
            <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, marginTop: 3 }}>{movie.year}</div>
          </div>
          <button onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDetail(); }}
            style={{ flexShrink: 0, background: T.accentSoft, border: `1px solid ${T.border}`, borderRadius: 9, padding: "6px 12px", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
            + Info
          </button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: movie.streamingOn?.length > 0 ? 8 : 0 }}>{movie.synopsis}</div>
        {movie.streamingOn?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {movie.streamingOn.map(p => (
              <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                {p.logo && <img src={p.logo} alt={p.name} style={{ width: 16, height: 16, borderRadius: 4, objectFit: "cover" }} />}
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {ind && <Ind type={ind} />}
    </div>
  );
}

function DetailPanel({ movie, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: T.bg, overflowY: "auto" }}>
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <Poster url={movie.backdrop || movie.poster} title={movie.title} style={{ position: "absolute", inset: 0, filter: "brightness(0.5)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 30%,#0A0A0B 100%)" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} aria-label="Retour"><Icon name="back" size={20} color="#fff" /></button>
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 24, lineHeight: 1.15, marginBottom: 10 }}>{movie.title}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <RatingBadge score={movie.imdb} />
            {movie.year && <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{movie.year}</span>}
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 22px 48px" }}>
        {movie.streamingOn?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: T.accent, fontWeight: 700, marginBottom: 10 }}>Disponible sur</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {movie.streamingOn.map(p => (
                <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                  {p.logo && <img src={p.logo} alt={p.name} style={{ width: 20, height: 20, borderRadius: 5, objectFit: "cover" }} />}
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {movie.trailerKey && (
          <a href={`https://www.youtube.com/watch?v=${movie.trailerKey}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", background: T.accentSoft, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 20px", color: T.accent, fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 18 }}>
            <Icon name="play" size={16} color={T.accent} /> Voir la bande-annonce
          </a>
        )}
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
        <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 28, color: T.accent, marginBottom: 18, letterSpacing: "-1px" }}>C'est un MATCH !</div>
        {type === "genre" ? (
          <>
            <div style={{ marginBottom: 10 }}><Icon name={item.icon} size={56} /></div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{item.name}</div>
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, marginBottom: 24 }}>Vous aimez tous les deux ce genre !</div>
          </>
        ) : (
          <>
            <div style={{ width: 110, height: 150, borderRadius: 12, overflow: "hidden", margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
              <Poster url={item.poster} title={item.title} style={{ width: "100%", height: "100%" }} />
            </div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 19, marginBottom: 8 }}>{item.title}</div>
            <RatingBadge score={item.imdb} />
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, margin: "12px 0 24px" }}>
              Ce soir : <strong style={{ color: "rgba(255,255,255,0.8)" }}>{item.title}</strong> !
            </div>
          </>
        )}
        <button onClick={onClose} style={{ background: T.btnGrad, color: T.accentDark, border: "none", borderRadius: 14, padding: "15px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: T.body, marginBottom: type === "movie" ? 10 : 0 }}>
          {type === "genre" ? "Continuer →" : "C'est parti !"}
        </button>
        {type === "movie" && (
          <ShareMatchButton title={item.title} />
        )}
      </div>
    </div>
  );
}

function ShareMatchButton({ title }) {
  const [copied, setCopied] = useState(false);
  const text = `On regarde « ${title} » ce soir ! Trouvé avec CinéMatch`;
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "CinéMatch", text, url: APP_URL });
        track("match_shared", { method: "native" });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(`${text}\n${APP_URL}`).then(() => {
      track("match_shared", { method: "clipboard" });
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={share} style={{ background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)", color: copied ? "#4ADE80" : "rgba(255,255,255,0.5)", border: copied ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "DM Sans, sans-serif", transition: "all 0.2s" }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name={copied ? "check" : "share"} size={16} color={copied ? "#4ADE80" : "rgba(255,255,255,0.6)"} />{copied ? "Lien copié" : "Partager le match"}</span>
    </button>
  );
}

function AlertIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8807C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" />
    </svg>
  );
}

function ErrorBox({ title, children }) {
  return (
    <div role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(217,83,79,0.08)", border: "1px solid rgba(217,83,79,0.35)", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "left" }}>
      <AlertIcon />
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T.textMid }}>{children}</div>
      </div>
    </div>
  );
}

function swipeBtn(like) {
  return {
    width: 64, height: 64, borderRadius: "50%", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: like ? T.accentSoft : T.card,
    border: like ? `1.5px solid ${T.border}` : `1.5px solid ${T.red}55`,
  };
}

function LegalScreen({ onBack }) {
  const H = ({ children }) => <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: T.accent, fontWeight: 700, margin: "24px 0 8px" }}>{children}</div>;
  const P = ({ children }) => <p style={{ color: T.textMid, fontSize: 13.5, lineHeight: 1.7, marginBottom: 8 }}>{children}</p>;
  const A = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{children}</a>;
  return (
    <div style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22 }}>Mentions légales</div>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.sub, fontSize: 13, cursor: "pointer", fontFamily: T.body }}>← Retour</button>
      </div>

      <H>Éditeur</H>
      <P>CinéMatch est un projet personnel édité par un particulier, à titre non professionnel et sans activité commerciale. Conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 (LCEN), l'éditeur a choisi de rester anonyme ; ses coordonnées ont été communiquées à l'hébergeur.</P>
      <P>Contact : <A href="https://github.com/Yrzygma/cin-match/issues">via la page du projet sur GitHub</A>.</P>

      <H>Hébergement</H>
      <P>Site : Vercel Inc., 440 North Barranca Avenue, Suite 4133, Covina, CA 91723, États-Unis — +1 (951) 383-6898.</P>
      <P>Base de données des sessions : Supabase Inc., San Francisco, États-Unis.</P>

      <H>Données collectées</H>
      <P><strong style={{ color: T.text }}>Sur votre appareil.</strong> Votre liste, vos films déjà vus, vos plateformes et vos réglages Mood sont enregistrés uniquement dans le stockage local de votre navigateur. Ils ne quittent pas votre appareil. Vous pouvez les effacer à tout moment depuis l'app ou en vidant les données du site.</P>
      <P><strong style={{ color: T.text }}>Pendant une session à deux.</strong> Le prénom saisi, le code de session et vos votes (genres et films) sont enregistrés sur Supabase pour permettre la synchronisation en temps réel. Ces données sont supprimées automatiquement au bout de 30 jours.</P>
      <P><strong style={{ color: T.text }}>Mesure d'audience.</strong> Des statistiques d'usage anonymes (par exemple « session créée », « match trouvé ») sont envoyées à PostHog, hébergé dans l'Union européenne. Aucun cookie n'est déposé, aucun nom ni e-mail n'est collecté, aucune donnée n'est revendue ni utilisée à des fins publicitaires. Ces mesures servent uniquement à améliorer l'app.</P>
      <P>Conformément au RGPD, vous pouvez demander l'accès à vos données ou leur suppression via le contact ci-dessus.</P>

      <H>Crédits</H>
      <P>Données des films : <A href="https://www.themoviedb.org">TMDB</A>. Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.</P>
      <P>Disponibilités sur les plateformes de streaming : <A href="https://www.justwatch.com">JustWatch</A>.</P>
      <P>Les affiches, images et marques des films et des plateformes appartiennent à leurs détenteurs respectifs.</P>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CineMatch() {
  const selGenreRef = useRef(null);

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
  const [createError, setCreateError] = useState(null); // "network" | null
  const [joinError, setJoinError] = useState(null);     // "notfound" | "network" | null
  const [busy, setBusy] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('selectedProviders') || '[]');
    // Migration : Canal+ est passe de l'ID 190 a 381 (meilleur catalogue)
    const migrated = [...new Set(saved.map((id) => (id === 190 ? 381 : id)))];
    if (JSON.stringify(saved) !== JSON.stringify(migrated)) {
      localStorage.setItem('selectedProviders', JSON.stringify(migrated));
    }
    return migrated;
  });
  const [providerLogos, setProviderLogos] = useState({});

  useEffect(() => {
    if (screen !== "providers" || Object.keys(providerLogos).length > 0) return;
    fetch("/api/movies?list=providers")
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        (data.providers || []).forEach((p) => { map[p.id] = p.logo; });
        setProviderLogos(map);
      })
      .catch(() => {});
  }, [screen]);
  const [mood, setMood] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mood') || 'null');
      if (!saved) return { ...DEFAULT_MOOD };
      const m = { ...DEFAULT_MOOD, ...saved };
      // Migration : la note etait sur 5, elle est desormais sur 10
      if (!saved.ratingScale10 && m.ratingMin > 0 && m.ratingMin <= 5) {
        m.ratingMin = m.ratingMin * 2;
      }
      m.ratingScale10 = true;
      localStorage.setItem('mood', JSON.stringify(m));
      return m;
    } catch {
      return { ...DEFAULT_MOOD };
    }
  });
  const [emptyInfo, setEmptyInfo] = useState(null);

  const saveMood = (next) => {
    setMood(next);
    localStorage.setItem('mood', JSON.stringify(next));
  };

  // Genre phase
  const [genreIdx, setGenreIdx] = useState(0);
  const [myGenreLikes, setMyGenreLikes] = useState(new Set());
  const [partnerGenreLikes, setPartnerGenreLikes] = useState(new Set());
  const [matchedGenres, setMatchedGenres] = useState([]);
  const [genreMatch, setGenreMatch] = useState(null);
  const [genreMatchQueue, setGenreMatchQueue] = useState([]);
  const [pendingGenreMatch, setPendingGenreMatch] = useState(null);

  // Movie phase
  const [selGenre, setSelGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [movieIdx, setMovieIdx] = useState(0);
  const [movieMatch, setMovieMatch] = useState(null);
  const [detail, setDetail] = useState(null);
  const seenKey = `seenIds_${userId}`;
  const seenMoviesKey = `seenMovies_${userId}`;
  const [seenIds, setSeenIds] = useState(() => new Set((JSON.parse(localStorage.getItem(`seenIds_${localStorage.getItem('userId') || 'guest'}`) || "[]")).map(Number)));
  const [seenMovies, setSeenMovies] = useState(() => JSON.parse(localStorage.getItem(`seenMovies_${localStorage.getItem('userId') || 'guest'}`) || "[]"));
  const [skipSeen, setSkipSeen] = useState(false);
  const wishlistKey = `wishlist_${userId}`;
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem(`wishlist_${localStorage.getItem('userId') || 'guest'}`) || "[]"));
  const [loading, setLoading] = useState(false);
  const [myMovieLikes, setMyMovieLikes] = useState(new Set());
  const [partnerMovieLikes, setPartnerMovieLikes] = useState(new Set());

  const genreDone = genreIdx >= GENRES.length;
  const movieDone = movies.length > 0 && movieIdx >= movies.length;
  const cur = movies[movieIdx];
  const isSolo = !sessionId;

  // ─── MESURE D'AUDIENCE ─────────────────────────────────────────────────────
  useEffect(() => { initAnalytics(userId); }, [userId]);
  useEffect(() => { if (genreMatch) track("genre_match", { genre: genreMatch.id, solo: !sessionId }); }, [genreMatch]);
  useEffect(() => { if (movieMatch) track("movie_match", { genre: selGenreRef.current?.id, solo: !sessionId }); }, [movieMatch]);

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

// Show genre matches from queue one by one
  useEffect(() => {
    if (!genreMatch && genreMatchQueue.length > 0) {
      setGenreMatch(genreMatchQueue[0]);
      setGenreMatchQueue(prev => prev.slice(1));
    }
  }, [genreMatch, genreMatchQueue]);

// Detect genre match when partner likes a genre we already liked
// lastPartnerGenre tracks only the most recently added genre to avoid re-triggering
  const lastPartnerGenreRef = useRef(-1);
  useEffect(() => {
    // Find the newest gIdx added by partner (highest value not yet processed)
    let newGIdx = -1;
    partnerGenreLikes.forEach(gIdx => {
      if (gIdx > lastPartnerGenreRef.current) newGIdx = Math.max(newGIdx, gIdx);
    });
    if (newGIdx === -1) return;
    lastPartnerGenreRef.current = newGIdx;

    if (myGenreLikes.has(newGIdx)) {
      const genre = GENRES[newGIdx];
      if (genre) {
        setMatchedGenres(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
        setGenreMatchQueue(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
      }
    }
  }, [partnerGenreLikes]);


  // Check for genre match when partner likes update
  useEffect(() => {
    if (!pendingGenreMatch) return;
    const { gIdx, genre } = pendingGenreMatch;
    if (partnerGenreLikes.has(gIdx)) {
      setMatchedGenres(prev => [...prev, genre]);
      setGenreMatch(genre);
      setPendingGenreMatch(null);
    }
  }, [partnerGenreLikes, pendingGenreMatch]);

  // Check for movie match when partner likes update
  useEffect(() => {
    if (!cur) return;
    // Only trigger if we already liked this movie
  }, [partnerMovieLikes]);

  // ─── SESSION CREATION ─────────────────────────────────────────────────────
  const createSession = async () => {
    if (busy) return;
    setBusy(true);
    setCreateError(null);
    const code = generateCode();
    setSessionCode(code);
    let error = null;
    try {
      ({ error } = await supabase.from("sessions").insert({
        id: code,
        status: "waiting",
        host_name: myName || "Vous",
      }));
    } catch (e) {
      error = e;
    }
    setBusy(false);
    if (error) {
      console.error("createSession error:", error);
      setCreateError("network");
      return;
    }
    track("session_created");
    setSessionId(code);
    setScreen("waiting");
  };

  const joinSession = async () => {
    if (busy) return;
    setBusy(true);
    setJoinError(null);
    const code = joinCode.toUpperCase().trim();
    let data = null, error = null;
    try {
      ({ data, error } = await supabase.from("sessions").select("*").eq("id", code).single());
    } catch (e) {
      error = e;
    }
    if (error || !data) {
      setBusy(false);
      setJoinError(isNetworkError(error) ? "network" : "notfound");
      return;
    }

    try {
      await supabase.from("sessions").update({ partner_name: myName || "Partenaire", status: "active" }).eq("id", code);
    } catch (e) {
      setBusy(false);
      setJoinError("network");
      return;
    }
    setBusy(false);
    track("session_joined");
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

  const onGenreSwipe = async (liked) => {
    const genre = GENRES[genreIdx];
    const gIdx = genreIdx;

    if (liked) {
      setMyGenreLikes(prev => { const n = new Set(prev); n.add(gIdx); return n; });
      await castVote(-(gIdx + 1), true);

      if (isSolo) {
        if (Math.random() > 0.5) {
          setMatchedGenres(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
          setGenreMatchQueue(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
          setGenreIdx(i => i + 1);
          return;
        }
      } else if (partnerGenreLikes.has(gIdx)) {
        setMatchedGenres(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
        setGenreMatchQueue(prev => prev.find(g => g.id === genre.id) ? prev : [...prev, genre]);
        setGenreIdx(i => i + 1);
        return;
      }
    } else {
      await castVote(-(gIdx + 1), false);
    }
    setGenreIdx(i => i + 1);
  };

  // ─── MOVIE SWIPE ──────────────────────────────────────────────────────────
  const onMovieSwipe = async (liked) => {
    const movie = movies[movieIdx];
    await castVote(movie.id, liked);

    if (liked) {
      setMyMovieLikes(prev => { const n = new Set(prev); n.add(movie.id); return n; });
      if (isSolo) {
        if (Math.random() > 0.6) { setMovieMatch(movie); return; }
      } else if (partnerMovieLikes.has(movie.id)) {
        setMovieMatch(movie); return;
      }
    }
    advance(movieIdx + 1);
  };

  // When partner likes a movie we already liked -> match
  useEffect(() => {
    if (!movies.length || screen !== "movie" || movieMatch) return;
    for (const movieId of partnerMovieLikes) {
      if (myMovieLikes.has(movieId)) {
        const movie = movies.find(m => m.id === movieId);
        if (movie) { setMovieMatch(movie); return; }
      }
    }
  }, [partnerMovieLikes]);

  const advance = (next, movieList, skip, seen) => {
    const list = movieList || movies;
    const doSkip = skip !== undefined ? skip : skipSeen;
    const seenSet = seen || seenIds;
    if (doSkip) {
      let i = next;
      while (i < list.length && seenSet.has(list[i].id)) i++;
      setMovieIdx(i);
    } else {
      setMovieIdx(next);
    }
  };

  const toggleSeen = (id) => {
    const movie = movies.find(m => m.id === id);
    setSeenIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        setSeenMovies(prev2 => {
          const updated = prev2.filter(m => m.id !== id);
          localStorage.setItem(seenMoviesKey, JSON.stringify(updated));
          return updated;
        });
      } else {
        n.add(id);
        if (movie) {
          setSeenMovies(prev2 => {
            if (prev2.find(m => m.id === id)) return prev2;
            const updated = [...prev2, { id: movie.id, title: movie.title, poster: movie.poster, year: movie.year, imdb: movie.imdb }];
            localStorage.setItem(seenMoviesKey, JSON.stringify(updated));
            return updated;
          });
        }
      }
      localStorage.setItem(seenKey, JSON.stringify([...n].map(Number)));
      return n;
    });
  };

  const removeSeen = (id) => {
    const numId = Number(id);
    setSeenIds(prev => {
      const n = new Set(prev);
      n.delete(numId);
      localStorage.setItem(seenKey, JSON.stringify([...n].map(Number)));
      return n;
    });
    setSeenMovies(prev => {
      const updated = prev.filter(m => m.id !== numId);
      localStorage.setItem(seenMoviesKey, JSON.stringify(updated));
      return updated;
    });
  };


  const startMovies = async (g) => {
    selGenreRef.current = g;
    setSelGenre(g);
    setLoading(true);
    setEmptyInfo(null);
    setScreen("loading");
    try {
      let movieList = [];
      let empty = null;

      if (!isSolo) {
        const { data } = await supabase
          .from("sessions")
          .select("movie_list, genre_id")
          .eq("id", sessionId)
          .single();

        if (data?.movie_list && data?.genre_id === g.id) {
          // La liste est deja generee : les deux swipent la meme
          movieList = JSON.parse(data.movie_list);
        } else {
          // Premier arrive : ses reglages Mood s'appliquent aux deux
          const r = await fetchMovies(g.id, selectedProviders, mood);
          movieList = r.movies;
          empty = r.empty;
          if (movieList.length > 0) {
            // Ecriture conditionnelle : seulement si personne n'a deja enregistre
            // une liste pour ce genre. Si les deux choisissent le genre en meme
            // temps, le premier gagne et le second reprend sa liste : les deux
            // swipent exactement les memes films.
            const { data: written } = await supabase.from("sessions").update({
              genre_id: g.id,
              movie_list: JSON.stringify(movieList),
            }).eq("id", sessionId)
              .or(`genre_id.is.null,genre_id.neq.${g.id}`)
              .select("id");
            if (!written || written.length === 0) {
              const { data: again } = await supabase
                .from("sessions")
                .select("movie_list, genre_id")
                .eq("id", sessionId)
                .single();
              if (again?.movie_list && again.genre_id === g.id) {
                movieList = JSON.parse(again.movie_list);
              }
            }
          }
        }
      } else {
        const r = await fetchMovies(g.id, selectedProviders, mood);
        movieList = r.movies;
        empty = r.empty;
      }

      if (movieList.length === 0) {
        track("movies_empty", { genre: g.id, reason: empty?.reason || "criteria", providers: selectedProviders.length });
        setEmptyInfo(empty || { reason: "criteria" });
        setScreen("empty");
        setLoading(false);
        return;
      }

      track("movies_loaded", { genre: g.id, count: movieList.length, solo: isSolo, providers: selectedProviders.length, mood_active: isMoodActive(mood) });
      setMovies(movieList);
      let startIdx = 0;
      if (skipSeen) {
        while (startIdx < movieList.length && seenIds.has(movieList[startIdx].id)) startIdx++;
      }
      setMovieIdx(startIdx);
      setMyMovieLikes(new Set());
      setPartnerMovieLikes(new Set());
      setGenreMatchQueue([]);
      setGenreMatch(null);
      setScreen("movie");
    } catch (e) {
      console.error("startMovies error:", e);
      track("movies_error", { genre: g?.id });
      setScreen("genre");
    }
    setLoading(false);
  };

  
  const toggleWishlist = (movie) => {
    setWishlist(prev => {
      const exists = prev.find(m => m.id === movie.id);
      let updated;
      if (exists) {
        updated = prev.filter(m => m.id !== movie.id);
      } else {
        updated = [...prev, { id: movie.id, title: movie.title, poster: movie.poster, year: movie.year, imdb: movie.imdb }];
        track("wishlist_added");
      }
      localStorage.setItem(wishlistKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeWishlist = (id) => {
    setWishlist(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem(wishlistKey, JSON.stringify(updated));
      return updated;
    });
  };

  const copyLink = () => {
    const url = `${window.location.origin}?join=${sessionCode}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const reset = () => {
    selGenreRef.current = null;
    setScreen("home"); setGenreIdx(0); setMatchedGenres([]); setMovies([]);
    setMovieMatch(null); setGenreMatch(null); setSessionId(null);
    setPartnerConnected(false); setMyGenreLikes(new Set()); setPartnerGenreLikes(new Set());
    setPartnerMovieLikes(new Set()); setPendingGenreMatch(null); setGenreMatchQueue([]); lastPartnerGenreRef.current = -1;
    setMovieIdx(0); setMyMovieLikes(new Set()); setSelGenre(null); setPartnerName(""); setSessionCode("");
    setCreateError(null); setJoinError(null);
  };

  // Auto-join from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("join");
    if (code) { setJoinCode(code); setScreen("join"); }
  }, []);

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
	  if (payload.new?.genre_id) {
	    const genre = GENRES.find(g => g.id === payload.new.genre_id);
	    if (genre) startMovies(genre);
	  }
	})
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId]);
  
  const Btn = ({ onClick, children, outline, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{ background: outline ? "transparent" : T.btnGrad, color: outline ? T.text : T.accentDark, border: outline ? `1.5px solid ${T.borderSoft}` : "none", borderRadius: 14, padding: "15px 24px", fontSize: 15, fontWeight: outline ? 600 : 700, cursor: disabled ? "default" : "pointer", width: "100%", fontFamily: T.body, marginBottom: 10, opacity: disabled ? 0.4 : 1 }}>{children}</button>
  );

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 15px", color: "#F0EEE8", fontSize: 15, fontFamily: "DM Sans, sans-serif", outline: "none", marginBottom: 12 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0A0B;color:#F5F0E6;font-family:'DM Sans',sans-serif;min-height:100vh}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.4);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bgGrad, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 20% 20%,rgba(212,175,55,0.06) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(212,175,55,0.04) 0%,transparent 55%)" }} />

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 440, padding: "22px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 24, letterSpacing: "-1px" }}>Ciné<span style={{ color: T.accent }}>Match</span></div>
          {screen !== "home" && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: partnerConnected ? "#4ADE80" : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
              {partnerConnected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />}
              {partnerConnected ? partnerName : (isSolo ? "Solo" : "En attente…")}
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 440, padding: "0 20px 48px", position: "relative", zIndex: 1 }}>

          {/* HOME */}
          {screen === "home" && (
            <div style={{ textAlign: "center", paddingTop: 36 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, animation: "float 3s ease-in-out infinite" }}><Icon name="clap" size={72} /></div>
              <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 36, lineHeight: 1.1, marginBottom: 12, letterSpacing: "-2px" }}>Trouvez votre<br /><span style={{ color: T.accent }}>film ce soir</span></div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>Swipez ensemble, matchez sur le même film.</div>
              <Btn onClick={() => { setCreateError(null); setScreen("create"); }}>Créer une session</Btn>
              <Btn outline onClick={() => { setJoinError(null); setScreen("join"); }}>Rejoindre une session</Btn>
              <div style={{ height: 8 }} />
              <Btn outline onClick={() => { track("solo_started"); setScreen("genre"); }}>Mode solo</Btn>
              <div style={{ height: 4 }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => setScreen("mood")} style={{ background: "none", border: "none", color: isMoodActive(mood) ? T.accent : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: T.body, textDecoration: "underline" }}>
                  Mood{isMoodActive(mood) ? " •" : ""}
                </button>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                <button onClick={() => setScreen("providers")} style={{ background: "none", border: "none", color: selectedProviders.length > 0 ? T.accent : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: T.body, textDecoration: "underline" }}>
                  Plateformes{selectedProviders.length > 0 ? ` (${selectedProviders.length})` : ""}
                </button>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                <button onClick={() => setScreen("wishlist")} style={{ background: "none", border: "none", color: wishlist.length > 0 ? T.accent : "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: T.body, textDecoration: "underline" }}>
                  Ma liste{wishlist.length > 0 ? ` (${wishlist.length})` : ""}
                </button>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                <button onClick={() => setScreen("seen")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: T.body, textDecoration: "underline" }}>
                  Déjà vus{seenIds.size > 0 ? ` (${seenIds.size})` : ""}
                </button>
              </div>

              {/* Attribution TMDB (requise par les conditions d'utilisation de l'API) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 26, paddingTop: 16, borderTop: `1px solid ${T.borderSoft}` }}>
                <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                  <img
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                    alt="TMDB"
                    style={{ height: 11, opacity: 0.55 }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", lineHeight: 1.5, maxWidth: 250 }}>
                    Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.
                  </span>
                </a>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>
                Disponibilités sur les plateformes : <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)" }}>JustWatch</a>
              </div>
              <button onClick={() => setScreen("legal")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer", fontFamily: T.body, textDecoration: "underline", marginTop: 8 }}>
                Mentions légales et confidentialité
              </button>
            </div>
          )}

          {/* CREATE SESSION */}
          {screen === "create" && (
            <div style={{ paddingTop: 36 }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 25, marginBottom: 6 }}>Nouvelle session</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 26 }}>Entrez votre prénom</div>
              <input placeholder="Votre prénom" aria-label="Votre prénom" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              {createError === "network" && (
                <ErrorBox title="Connexion impossible">Le service est momentanément indisponible. Réessayez dans une minute.</ErrorBox>
              )}
              <Btn onClick={createSession} disabled={!myName.trim() || busy}>{busy ? "Création…" : createError ? "Réessayer" : "Créer et inviter"}</Btn>
              <Btn outline onClick={() => setScreen("home")}>Retour</Btn>
            </div>
          )}

          {/* WAITING FOR PARTNER */}
          {screen === "waiting" && (
            <div style={{ paddingTop: 36, textAlign: "center" }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Invitez votre partenaire</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Partagez ce code ou ce lien</div>

              {/* Big code */}
              <div style={{ background: T.accentSoft, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: T.accent, marginBottom: 8 }}>Code de session</div>
                <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 42, letterSpacing: 8, color: T.accent }}>{sessionCode}</div>
              </div>

              {/* QR Code */}
              <div style={{ marginBottom: 20 }}>
                <QRCode value={`${window.location.origin}?join=${sessionCode}`} />
              </div>

              {/* Copy link button */}
              <button onClick={copyLink} style={{ background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)", color: copied ? "#4ADE80" : "rgba(255,255,255,0.6)", border: copied ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px", fontSize: 14, cursor: "pointer", fontFamily: "DM Sans, sans-serif", width: "100%", marginBottom: 12 }}>
                {copied ? "Lien copié" : "Copier le lien"}
              </button>

              {/* Waiting indicator */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.35)", fontSize: 14, marginTop: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFB347", animation: "pulse 1.5s ease-in-out infinite" }} />
                En attente de votre partenaire…
              </div>
            </div>
          )}

          {/* JOIN SESSION */}
          {screen === "join" && (
            <div style={{ paddingTop: 36 }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 25, marginBottom: 6 }}>Rejoindre une session</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 26 }}>Entrez le code partagé par votre partenaire</div>
              <input placeholder="Votre prénom" aria-label="Votre prénom" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              <input placeholder="Code de session (ex : ABC123)" aria-label="Code de session" aria-invalid={joinError === "notfound"} value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); if (joinError) setJoinError(null); }}
                style={{ ...inputStyle, fontFamily: T.display, fontWeight: 700, fontSize: 20, letterSpacing: 4, textAlign: "center", ...(joinError === "notfound" ? { border: `1.5px solid ${T.red}`, background: "rgba(217,83,79,0.06)", marginBottom: 8 } : {}) }} />
              {joinError === "notfound" && (
                <div role="alert" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.5, color: "#E8807C", marginBottom: 18 }}>
                  <AlertIcon size={16} />
                  <span>Ce code ne correspond à aucune session. Vérifiez-le auprès de votre partenaire.</span>
                </div>
              )}
              {joinError === "network" && (
                <ErrorBox title="Connexion impossible">Le service est momentanément indisponible. Réessayez dans une minute.</ErrorBox>
              )}
              <Btn onClick={joinSession} disabled={!joinCode.trim() || !myName.trim() || busy}>{busy ? "Connexion…" : joinError === "network" ? "Réessayer" : "Rejoindre"}</Btn>
              <Btn outline onClick={() => setScreen("home")}>Retour</Btn>
            </div>
          )}

          {/* LOADING */}
          {screen === "loading" && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ marginBottom: 20, animation: "float 2s ease-in-out infinite" }}><Icon name={selGenre?.icon || "clap"} size={64} /></div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Chargement des films…</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Recherche en cours sur TMDB</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}

          {/* GENRE SWIPE */}
          {screen === "genre" && !genreDone && !genreMatch && (
            <div>
              <div style={{ paddingTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: T.accent, fontWeight: 700, marginBottom: 6 }}>Étape 1 · Genres</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 2.5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: T.accent, borderRadius: 3, width: `${(genreIdx / GENRES.length) * 100}%`, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{genreIdx}/{GENRES.length}</div>
                </div>
              </div>
              {partnerConnected && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "9px 14px", marginBottom: 14, fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", flexShrink: 0 }} />
                  <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>{partnerName}</strong> est connecté et swipe en même temps</span>
                </div>
              )}
              <div style={{ position: "relative", height: 300, marginBottom: 22 }}>
                {genreIdx + 2 < GENRES.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transform: "scale(0.88) translateY(16px)" }} />}
                {genreIdx + 1 < GENRES.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transform: "scale(0.94) translateY(8px)" }} />}
                <GenreCard key={genreIdx} genre={GENRES[genreIdx]} onSwipe={onGenreSwipe} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 14 }}>
                <button onClick={() => onGenreSwipe(false)} aria-label="Je n'aime pas" style={swipeBtn(false)}><Icon name="x" size={24} color={T.red} /></button>
                <button onClick={() => onGenreSwipe(true)} aria-label="J'aime" style={swipeBtn(true)}><Icon name="heart" size={26} color={T.accent} /></button>
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>Glissez ou appuyez pour voter</div>
            </div>
          )}

          {/* GENRE DONE - no match */}
          {screen === "genre" && genreDone && matchedGenres.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="x" size={52} color={T.sub} /></div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Aucun genre en commun</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>Recommencez !</div>
              <Btn onClick={() => { setGenreIdx(0); setMatchedGenres([]); setMyGenreLikes(new Set()); setPartnerGenreLikes(new Set()); }}>Recommencer</Btn>
            </div>
          )}

          {/* GENRE DONE - pick */}
		 {screen === "genre" && genreDone && !genreMatch && matchedGenres.length > 0 && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: T.accent, fontWeight: 700, marginBottom: 4 }}>Genres matchés</div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20, marginBottom: 4 }}><span style={{ color: T.accent }}>{matchedGenres.length} genre{matchedGenres.length > 1 ? "s" : ""}</span> en commun</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 18 }}>Choisissez pour charger les films →</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {matchedGenres.map(g => (
                  <div key={g.id} onClick={() => startMovies(g)} style={{ borderRadius: 16, padding: "16px 12px", cursor: "pointer", border: `1px solid ${g.color}28`, background: `${g.color}0c`, textAlign: "center" }}>
                    <div style={{ marginBottom: 7 }}><Icon name={g.icon} size={34} /></div>
                    <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 13, color: g.color }}>{g.name}</div>
                  </div>
                ))}
                {screen !== "genrePick" && !genreDone && (
  <Btn outline onClick={() => setScreen("genre")}>Continuer à swiper →</Btn>
)}
              </div>
            </div>
          )}

          {/* MOVIE SWIPE */}
          {screen === "movie" && !movieDone && !movieMatch && cur && (
            <div>
              <div style={{ paddingTop: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.5, color: T.accent, fontWeight: 700, marginBottom: 6 }}>
                  Films · {selGenre && <span style={{ color: T.accent }}>{selGenre.name}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 2.5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: T.accent, borderRadius: 3, width: `${movies.length > 0 ? (movieIdx / movies.length) * 100 : 0}%`, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{movieIdx}/{movies.length}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Passer les déjà vus {seenIds.size > 0 ? `(${seenIds.size})` : ""}</span>
                  <div onClick={() => {
                    const next = !skipSeen;
                    setSkipSeen(next);
                    if (next && cur && seenIds.has(cur.id)) advance(movieIdx, movies, next, seenIds);
                  }} style={{ width: 38, height: 20, borderRadius: 10, background: skipSeen ? T.accent : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: skipSeen ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
              <div style={{ position: "relative", height: 430, marginBottom: 16 }}>
                {movieIdx + 2 < movies.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", transform: "scale(0.88) translateY(16px)" }} />}
                {movieIdx + 1 < movies.length && <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transform: "scale(0.94) translateY(8px)" }} />}
                <MovieCard key={`${selGenre?.id}-${movieIdx}`} movie={cur} onSwipe={onMovieSwipe} onDetail={() => setDetail(cur)} seenIds={seenIds} onToggleSeen={toggleSeen} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 12 }}>
                <button onClick={() => onMovieSwipe(false)} aria-label="Je n'aime pas" style={swipeBtn(false)}><Icon name="x" size={24} color={T.red} /></button>
                <button onClick={() => onMovieSwipe(true)} aria-label="J'aime" style={swipeBtn(true)}><Icon name="heart" size={26} color={T.accent} /></button>
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setScreen("genre")} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Changer de genre</button>
              </div>
            </div>
          )}

          {/* NO MATCH */}
          {screen === "movie" && movieDone && !movieMatch && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="clap" size={56} color={T.sub} /></div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Pas de match !</div>
              <div style={{ color: "rgba(255,255,255,0.33)", fontSize: 14, marginBottom: 28 }}>Essayez un autre genre !</div>
              <Btn onClick={() => setScreen("genre")}>Choisir un autre genre</Btn>
              <Btn outline onClick={() => startMovies(selGenre)}>Recharger ce genre</Btn>
            </div>
          )}

          {/* PROVIDERS */}
          {screen === "providers" && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22 }}>Mes plateformes</div>
                <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Retour</button>
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Sélectionnez vos plateformes pour ne voir que les films disponibles dessus. {selectedProviders.length === 0 && "Aucune sélection = tous les films."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {PROVIDERS.map(p => {
                  const selected = selectedProviders.includes(p.id);
                  return (
                    <div key={p.id} onClick={() => {
                      const next = selected ? selectedProviders.filter(id => id !== p.id) : [...selectedProviders, p.id];
                      setSelectedProviders(next);
                      localStorage.setItem('selectedProviders', JSON.stringify(next));
                    }} style={{ borderRadius: 14, padding: "14px 16px", cursor: "pointer", border: selected ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.1)", background: selected ? `${p.color}22` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s", userSelect: "none" }}>
                      {providerLogos[p.id]
                        ? <img src={providerLogos[p.id]} alt={p.name} style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ width: 30, height: 30, borderRadius: 7, background: `${p.color}22`, border: `1px solid ${p.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: p.color, flexShrink: 0 }}>{p.name[0]}</div>}
                      <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 13, color: selected ? "white" : "rgba(255,255,255,0.55)" }}>{p.name}</div>
                      {selected && <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" size={12} color="white" /></div>}
                    </div>
                  );
                })}
              </div>
              {selectedProviders.length > 0 && (
                <button onClick={() => { setSelectedProviders([]); localStorage.removeItem('selectedProviders'); }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif", textDecoration: "underline", width: "100%", textAlign: "center", marginBottom: 10 }}>
                  Tout désélectionner
                </button>
              )}
              <Btn onClick={() => setScreen("home")}>Valider</Btn>
              <div style={{ fontSize: 11, color: T.sub, textAlign: "center", marginTop: 6 }}>Disponibilités fournies par JustWatch, via TMDB.</div>
            </div>
          )}

          {/* MOOD FILTERS */}
          {screen === "mood" && (
            <div style={{ paddingTop: 20, paddingBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22 }}>Mood</div>
                <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: T.sub, fontSize: 13, cursor: "pointer", fontFamily: T.body }}>← Retour</button>
              </div>
              <div style={{ color: T.sub, fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
                Affinez le type de films proposés. Ces réglages s'appliquent à vos prochaines sessions.
              </div>

              {/* ANNEE */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: T.accent, fontWeight: 700 }}>Année de sortie</div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{mood.yearMin} — {mood.yearMax}</div>
                </div>
                <RangeSlider
                  min={YEAR_MIN} max={YEAR_MAX} step={1}
                  valueMin={mood.yearMin} valueMax={mood.yearMax}
                  onChange={(lo, hi) => saveMood({ ...mood, yearMin: lo, yearMax: hi })}
                />
              </div>

              {/* NOTE MINIMUM */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: T.accent, fontWeight: 700 }}>Note minimum</div>
                  <div style={{ fontSize: 13, color: mood.ratingMin > 0 ? T.text : T.sub, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    {mood.ratingMin > 0
                      ? <><Icon name="star" size={14} color={T.accent} /> {mood.ratingMin.toFixed(1)} et plus</>
                      : "Peu importe"}
                  </div>
                </div>
                <RatingSlider value={mood.ratingMin} onChange={(v) => saveMood({ ...mood, ratingMin: v })} />
              </div>

              {/* DUREE */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: T.accent, fontWeight: 700 }}>Durée</div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{fmtDur(mood.runtimeMin)} — {fmtDur(mood.runtimeMax)}</div>
                </div>
                <RangeSlider
                  min={RUNTIME_MIN} max={RUNTIME_MAX} step={5}
                  valueMin={mood.runtimeMin} valueMax={mood.runtimeMax}
                  onChange={(lo, hi) => saveMood({ ...mood, runtimeMin: lo, runtimeMax: hi })}
                />
              </div>

              {/* PAYS */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: T.accent, fontWeight: 700 }}>Pays d'origine</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{mood.countries.length === 0 ? "Tous" : `${mood.countries.length} sélectionné${mood.countries.length > 1 ? "s" : ""}`}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {COUNTRIES.map(co => {
                    const sel = mood.countries.includes(co.code);
                    return (
                      <div key={co.code}
                        onClick={() => saveMood({
                          ...mood,
                          countries: sel ? mood.countries.filter(x => x !== co.code) : [...mood.countries, co.code],
                        })}
                        style={{ borderRadius: 10, padding: "8px 13px", cursor: "pointer", userSelect: "none",
                          border: sel ? `1.5px solid ${T.accent}` : `1px solid ${T.borderSoft}`,
                          background: sel ? T.accentSoft : T.card,
                          fontSize: 12.5, fontWeight: 600, color: sel ? T.accent : T.textMid, transition: "all 0.15s" }}>
                        {co.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Btn onClick={() => setScreen("home")}>Valider</Btn>
              {isMoodActive(mood) && (
                <button onClick={() => saveMood({ ...DEFAULT_MOOD })}
                  style={{ background: "none", border: "none", color: T.sub, fontSize: 13, cursor: "pointer", fontFamily: T.body, textDecoration: "underline", width: "100%", textAlign: "center", marginTop: 4 }}>
                  Réinitialiser les critères
                </button>
              )}
            </div>
          )}

          {/* AUCUN FILM TROUVE */}
          {screen === "empty" && (
            <div style={{ paddingTop: 60, textAlign: "center" }}>
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                <Icon name="clap" size={56} color={T.sub} />
              </div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 21, marginBottom: 12 }}>
                Aucun film ne correspond
              </div>
              <div style={{ color: T.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 28, padding: "0 10px" }}>
                {emptyInfo?.reason === "platform"
                  ? <>Des films correspondent à vos critères, mais aucun n'est disponible sur {selectedProviders.length > 1 ? "vos plateformes" : "votre plateforme"}.<br/>Ajoutez une plateforme ou assouplissez vos critères.</>
                  : <>Vos critères Mood sont trop restrictifs pour ce genre.<br/>Essayez d'élargir l'année, la durée ou la note minimum.</>}
              </div>
              {emptyInfo?.reason === "platform" && (
                <Btn onClick={() => setScreen("providers")}>Modifier mes plateformes</Btn>
              )}
              <Btn outline={emptyInfo?.reason === "platform"} onClick={() => setScreen("mood")}>Ajuster le Mood</Btn>
              <Btn outline onClick={() => setScreen("genre")}>Choisir un autre genre</Btn>
            </div>
          )}

          {/* WISHLIST */}
          {screen === "wishlist" && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22 }}>Ma liste</div>
                <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Retour</button>
              </div>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 40, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="bookmark" size={44} color={T.sub} /></div>
                  Votre liste est vide<br/>
                  <span style={{ fontSize: 13, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>Appuyez sur <Icon name="bookmark" size={13} color={T.sub} /> sur une carte pour la sauvegarder</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                    {wishlist.length} film{wishlist.length > 1 ? "s" : ""} sauvegardé{wishlist.length > 1 ? "s" : ""}
                  </div>
                  {wishlist.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px" }}>
                      <div style={{ width: 40, height: 56, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                        <Poster url={m.poster} title={m.title} style={{ width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{m.year}{m.imdb ? <> · <Icon name="star" size={10} color="#F5C518" /> {m.imdb}</> : ""}</div>
                      </div>
                      <button onClick={() => removeWishlist(m.id)} style={{ background: `${T.red}1a`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "6px 10px", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans, sans-serif", flexShrink: 0, display: "flex", alignItems: "center" }} aria-label="Retirer"><Icon name="x" size={14} color={T.red} /></button>
                    </div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <Btn outline onClick={() => { setWishlist([]); localStorage.removeItem(wishlistKey); }}>Tout effacer</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEEN MOVIES */}
          {screen === "seen" && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22 }}>Mes films déjà vus</div>
                <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Retour</button>
              </div>
              {seenIds.size === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 40, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="clap" size={44} color={T.sub} /></div>
                  Aucun film marqué comme déjà vu
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                    {seenIds.size} film{seenIds.size > 1 ? "s" : ""} — ces films seront exclus si vous activez « Passer les déjà vus »
                  </div>
                  {seenMovies.length > 0 ? seenMovies.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px" }}>
                      <div style={{ width: 40, height: 56, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                        <Poster url={m.poster} title={m.title} style={{ width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{m.year}{m.imdb ? <> · <Icon name="star" size={10} color="#F5C518" /> {m.imdb}</> : ""}</div>
                      </div>
                      <button onClick={() => removeSeen(m.id)} style={{ background: `${T.red}1a`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "6px 10px", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans, sans-serif", flexShrink: 0, display: "flex", alignItems: "center" }} aria-label="Retirer"><Icon name="x" size={14} color={T.red} /></button>
                    </div>
                  )) : [...seenIds].map(id => (
                    <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Film #{id}</div>
                      <button onClick={() => removeSeen(id)} style={{ background: `${T.red}1a`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "5px 12px", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center" }} aria-label="Retirer"><Icon name="x" size={14} color={T.red} /></button>
                    </div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <Btn outline onClick={() => { setSeenIds(new Set()); setSeenMovies([]); localStorage.removeItem(seenKey); localStorage.removeItem(seenMoviesKey); }}>Tout effacer</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MENTIONS LEGALES */}
          {screen === "legal" && <LegalScreen onBack={() => setScreen("home")} />}

          {/* FINAL */}
          {screen === "final" && (
            <div style={{ textAlign: "center", paddingTop: 56 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, animation: "float 3s ease-in-out infinite" }}><Icon name="clap" size={72} /></div>
              <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 32, marginBottom: 10, letterSpacing: "-1px" }}>Bonne séance !</div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 15, marginBottom: 34 }}>Éteignez les lumières et profitez !</div>
              <Btn onClick={reset}>Nouvelle session</Btn>
            </div>
          )}
        </div>

        {genreMatch && <MatchModal item={genreMatch} type="genre" onClose={() => { setGenreMatch(null); }} />}
        {movieMatch && <MatchModal item={movieMatch} type="movie" onClose={() => { setMovieMatch(null); setScreen("final"); }} />}
        {detail && <DetailPanel movie={detail} onClose={() => setDetail(null)} />}
      </div>
    </>
  );
}
