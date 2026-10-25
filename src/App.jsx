import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { initAnalytics, track } from "./analytics.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://aljmfykhkhabzgxeutym.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsam1meWtoa2hhYnpneGV1dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjQxNjQsImV4cCI6MjA5NDcwMDE2NH0._O8bxcAcU9voDu0SB6cLGgXOgIa3joZMsGeiwj_kFvs"
);


// ─── THEME : ALLUMETTE ────────────────────────────────────────────────────────
// Charte « Allumette » (boite d'allumettes + risographie), validee le 25/10/2026.
// Ecrans clairs (papier creme) par defaut ; les ecrans de swipe passent en
// version « soir » (fond aubergine, cartes creme) pour ne pas eblouir.
const T = {
  paper: "#F4EBDD",     // Papier du soir
  surface: "#FBF6EE",   // champs, fonds de cartes secondaires
  ink: "#342A36",       // Encre aubergine
  night: "#2B2330",     // fond des ecrans de swipe
  coral: "#B83F2E",     // Allumette corail : accent principal
  blue: "#3157C8",      // Bleu imprimeur : accent secondaire
  yellow: "#E8B94F",    // Jaune soufre : etincelles, details
  green: "#24634F",     // Vert accord : succes
  red: "#A9344C",       // Rouge passage : erreurs
  white: "#FFFFFF",
  display: "'Bowlby One SC', sans-serif",
  body: "'Karla', sans-serif",
};

// Couleurs qui changent selon que l'ecran est clair ou « soir »
const LIGHT = {
  dark: false,
  bg: T.paper,
  ink: T.ink,
  mid: "#5E5260",
  sub: "#6E6270",
  line: "rgba(52,42,54,0.16)",
  lineStrong: T.ink,
  soft: "rgba(52,42,54,0.06)",
  accent: T.coral,
  link: T.blue,
};
const DARK = {
  dark: true,
  bg: T.night,
  ink: T.paper,
  mid: "#C9BFB3",
  sub: "#B3A99E",
  line: "rgba(244,235,221,0.18)",
  lineStrong: T.paper,
  soft: "rgba(244,235,221,0.07)",
  accent: T.yellow,
  link: T.yellow,
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
function Icon({ name, color = T.ink, size = 36, fill = false }) {
  const s = { width: size, height: size, viewBox: "0 0 32 32", fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const icons = {
    match: <svg {...s}><path d="M10 27L21 9"/><ellipse cx="22.5" cy="6.5" rx="3.2" ry="4.2" transform="rotate(32 22.5 6.5)" fill={color}/><path d="M27 3.5l2-1.5M28 9h2.5"/></svg>,
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
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.3 3 12 4.2 12 4.2C12 4.2 13.7 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z"/></svg>,
    x: <svg {...s} strokeWidth={3}><path d="M8 8l16 16M24 8L8 24"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>,
    bookmark: <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={color} strokeWidth={2.4} strokeLinejoin="round" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4V4z"/></svg>,
    back: <svg {...s}><path d="M20 8l-8 8 8 8"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5 4.8 1.3 7L12 17.8 5.7 21l1.3-7-5-4.8 7-.8z"/></svg>,
    share: <svg {...s}><circle cx="7" cy="16" r="3"/><circle cx="23" cy="8" r="3"/><circle cx="23" cy="24" r="3"/><path d="M10 14.5l10-5M10 17.5l10 5"/></svg>,
    check: <svg {...s} strokeWidth={3}><path d="M6 16l7 7L26 9"/></svg>,
  };
  return icons[name] || null;
}

// Logo : boite d'allumettes entrouverte, une allumette inclinee qui depasse.
function LogoMark({ size = 40, mono = null }) {
  const ink = mono || T.ink;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d="M14 42 L70 38 L72 90 L16 92 Z" fill={mono ? "none" : T.yellow} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 38 L84 31 L86 83 L72 90 Z" fill={mono ? ink : T.blue} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <line x1="36" y1="64" x2="56" y2="20" stroke={ink} strokeWidth="6.5" strokeLinecap="round" />
      <ellipse cx="58" cy="15" rx="7.5" ry="9.5" transform="rotate(25 58 15)" fill={mono ? ink : T.coral} stroke={ink} strokeWidth="3" />
      <line x1="70" y1="10" x2="79" y2="5" stroke={mono ? ink : T.yellow} strokeWidth="4.5" strokeLinecap="round" />
      <line x1="72" y1="20" x2="82" y2="21" stroke={mono ? ink : T.yellow} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark({ C, size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <LogoMark size={size + 14} />
      <div style={{ fontFamily: T.display, fontSize: size, lineHeight: 1, letterSpacing: 0.3 }}>
        <span style={{ color: C.dark ? T.yellow : T.coral }}>Ciné</span>
        <span style={{ color: C.dark ? T.paper : T.blue }}>Match</span>
      </div>
    </div>
  );
}

// Deux allumettes qui se rapprochent, avec etincelles. `animate` : arrivee du match.
function Matches({ size = 160, ink = T.ink, animate = false }) {
  const h = size * 0.75;
  return (
    <svg viewBox="0 0 180 135" width={size} height={h} aria-hidden="true" style={{ overflow: "visible" }}>
      <g className={animate ? "cm-left" : undefined}>
        <line x1="34" y1="128" x2="80" y2="52" stroke={T.blue} strokeWidth="9" strokeLinecap="round" opacity="0.5" transform="translate(3 2)" />
        <line x1="34" y1="128" x2="80" y2="52" stroke={ink} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="83" cy="45" rx="10" ry="13.5" transform="rotate(32 83 45)" fill={T.coral} stroke={ink} strokeWidth="3" />
      </g>
      <g className={animate ? "cm-right" : undefined}>
        <line x1="146" y1="128" x2="100" y2="52" stroke={T.blue} strokeWidth="9" strokeLinecap="round" opacity="0.5" transform="translate(3 2)" />
        <line x1="146" y1="128" x2="100" y2="52" stroke={ink} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="97" cy="45" rx="10" ry="13.5" transform="rotate(-32 97 45)" fill={T.coral} stroke={ink} strokeWidth="3" />
      </g>
      <g className={animate ? "cm-spark" : undefined} stroke={T.yellow} strokeWidth="5" strokeLinecap="round">
        <line x1="90" y1="24" x2="90" y2="8" />
        <line x1="73" y1="28" x2="63" y2="16" />
        <line x1="107" y1="28" x2="117" y2="16" />
        <line x1="61" y1="43" x2="47" y2="39" />
        <line x1="119" y1="43" x2="133" y2="39" />
      </g>
    </svg>
  );
}

// Grain de papier risographie (texture legere, jamais sur les affiches)
function Grain({ opacity = 0.04, dark = false }) {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, mixBlendMode: dark ? "normal" : "multiply", pointerEvents: "none" }}>
      <filter id={dark ? "cm-grain-d" : "cm-grain"}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${dark ? "cm-grain-d" : "cm-grain"})`} />
    </svg>
  );
}

// ─── GENRES ───────────────────────────────────────────────────────────────────
// Les accents tournent entre les trois encres de la charte
const GENRES = [
  { id: "action",      name: "Action",       icon: "action",      color: T.coral, desc: "Adrénaline et explosions" },
  { id: "comedy",      name: "Comédie",      icon: "comedy",      color: T.blue,  desc: "Rires garantis" },
  { id: "thriller",    name: "Thriller",     icon: "thriller",    color: T.ink,   desc: "Suspense et tension" },
  { id: "scifi",       name: "Sci-Fi",       icon: "scifi",       color: T.blue,  desc: "Futur et univers" },
  { id: "horror",      name: "Horreur",      icon: "horror",      color: T.coral, desc: "Frissons et terreur" },
  { id: "drama",       name: "Drame",        icon: "drama",       color: T.ink,   desc: "Émotions profondes" },
  { id: "romance",     name: "Romance",      icon: "romance",     color: T.coral, desc: "Feel-good et amour" },
  { id: "animation",   name: "Animation",    icon: "animation",   color: T.blue,  desc: "Tous publics" },
  { id: "adventure",   name: "Aventure",     icon: "adventure",   color: T.ink,   desc: "Exploration et épopée" },
  { id: "documentary", name: "Documentaire", icon: "documentary", color: T.blue,  desc: "Le monde réel" },
];


// ─── STREAMING PROVIDERS ──────────────────────────────────────────────────────
const PROVIDERS = [
  { id: 8,   name: "Netflix",      color: "#E50914" },
  { id: 119, name: "Amazon Prime", color: "#00A8E0" },
  { id: 337, name: "Disney+",      color: "#113CCF" },
  { id: 350, name: "Apple TV+",    color: "#555555" },
  { id: 381, name: "Canal+",       color: "#1A1A1A" },
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

const thumbCss = (cls, extra = "") => `
  .${cls}::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 22px; height: 22px; border-radius: 50%;
    background: ${T.coral}; border: 2.5px solid ${T.ink};
    cursor: pointer; ${extra}
  }
  .${cls}::-moz-range-thumb {
    width: 22px; height: 22px; border-radius: 50%;
    background: ${T.coral}; border: 2.5px solid ${T.ink};
    cursor: pointer; ${extra}
  }
`;

// Curseur de note minimum, sur 10 (meme echelle que les cartes de films)
function RatingSlider({ value, onChange, C }) {
  const MIN = 0;
  const MAX = 9;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div>
      <div style={{ position: "relative", height: 28 }}>
        <style>{thumbCss("rt")}</style>
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: C.line }} />
        <div style={{ position: "absolute", top: 12, left: 0, height: 4, borderRadius: 2, background: T.coral, width: `${pct}%` }} />
        <input className="rt" type="range" min={MIN} max={MAX} step={0.5} value={value} aria-label="Note minimum"
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", width: "100%", top: 0, height: 28, WebkitAppearance: "none", appearance: "none", background: "none", margin: 0 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 12, color: C.sub }}>Peu importe</span>
        <span style={{ fontSize: 12, color: C.sub }}>9 / 10</span>
      </div>
    </div>
  );
}

// Double curseur min/max
function RangeSlider({ min, max, step, valueMin, valueMax, onChange, C, label }) {
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
      <style>{thumbCss("rs", "pointer-events: auto;")}</style>
      <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: C.line }} />
      <div style={{ position: "absolute", top: 12, height: 4, borderRadius: 2, background: T.coral,
        left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }} />
      <input className="rs" type="range" min={min} max={max} step={step} value={valueMin} aria-label={`${label} minimum`}
        onChange={(e) => setLo(Number(e.target.value))} style={thumbStyle} />
      <input className="rs" type="range" min={min} max={max} step={step} value={valueMax} aria-label={`${label} maximum`}
        onChange={(e) => setHi(Number(e.target.value))} style={thumbStyle} />
    </div>
  );
}

function RatingBadge({ score }) {
  if (!score) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.paper, border: `2px solid ${T.ink}`, borderRadius: 999, padding: "3px 9px", fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: T.body }}>
      <Icon name="star" size={13} color={T.coral} /> {String(score).replace(".", ",")}/10
    </span>
  );
}

// Tampon affiche pendant le glisser
function Ind({ type }) {
  const like = type === "like";
  return (
    <div style={{ position: "absolute", top: 18, right: like ? 16 : "auto", left: like ? "auto" : 16, background: like ? T.coral : T.paper, border: `2.5px solid ${T.ink}`, borderRadius: 10, padding: "6px 14px", color: like ? T.white : T.ink, fontFamily: T.display, fontSize: 18, letterSpacing: 1, transform: like ? "rotate(5deg)" : "rotate(-5deg)", boxShadow: `3px 3px 0 ${T.ink}`, pointerEvents: "none", zIndex: 3 }}>
      {like ? "J'aime" : "Non"}
    </div>
  );
}

function Poster({ url, title, style }) {
  const [ok, setOk] = useState(false);
  const initials = (title || "").replace(/[^a-zA-ZÀ-ÿ ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
  return (
    <div style={{ position: "relative", background: `repeating-linear-gradient(135deg, #3B4A6B 0 14px, #34425F 14px 28px)`, overflow: "hidden", ...style }}>
      {url && <img src={url} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: ok ? 1 : 0, transition: "opacity 0.4s" }} onLoad={() => setOk(true)} />}
      {!ok && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: T.display, fontSize: 30, color: T.yellow }}>{initials}</div>
          <div style={{ fontSize: 11, color: T.paper, textAlign: "center", padding: "0 10px", lineHeight: 1.4 }}>{title}</div>
        </div>
      )}
    </div>
  );
}

function QRCode({ value }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&bgcolor=FBF6EE&color=342A36&margin=10`;
  return <img src={url} alt="QR code de la session" style={{ width: 180, height: 180, borderRadius: 12, border: `2px solid ${T.ink}`, boxShadow: `3px 3px 0 ${T.ink}` }} />;
}

function useSwipe(onSwipe) {
  const startX = useRef(null), currX = useRef(0), dragging = useRef(false);
  const [off, setOff] = useState(0), [rot, setRot] = useState(0), [ind, setInd] = useState(null), [out, setOut] = useState(null);
  const go = liked => { setOut(liked ? "r" : "l"); setTimeout(() => onSwipe(liked), 220); };
  const onStart = x => { startX.current = x; dragging.current = true; };
  const onMove = x => {
    if (!dragging.current) return;
    const d = x - startX.current; currX.current = d; setOff(d);
    // Rotation plafonnee a 5 degres (charte)
    setRot(Math.max(-5, Math.min(5, d * 0.04)));
    setInd(d > 50 ? "like" : d < -50 ? "nope" : null);
  };
  const onEnd = () => {
    dragging.current = false;
    if (Math.abs(currX.current) > 110) go(currX.current > 0);
    else { setOff(0); setRot(0); setInd(null); }
    startX.current = null; currX.current = 0;
  };
  const tx = out === "r" ? "translateX(160%) rotate(5deg)" : out === "l" ? "translateX(-160%) rotate(-5deg)" : `translateX(${off}px) rotate(${rot}deg)`;
  return { tx, out, ind, onStart, onMove, onEnd };
}

const cardBase = {
  position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden",
  background: T.paper, color: T.ink, border: `2px solid ${T.paper}`,
  boxShadow: `4px 4px 0 ${T.coral}`, touchAction: "none", cursor: "grab", userSelect: "none",
};

function GenreCard({ genre, onSwipe }) {
  const { tx, out, ind, onStart, onMove, onEnd } = useSwipe(onSwipe);
  return (
    <div style={{ ...cardBase, transform: tx, transition: out ? "transform 0.22s ease" : "none", pointerEvents: out ? "none" : "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => onMove(e.clientX)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
    >
      <Grain opacity={0.05} />
      <Icon name={genre.icon} size={84} color={genre.color} />
      <div style={{ fontFamily: T.display, fontSize: 34, lineHeight: 1.05, color: T.ink, textAlign: "center", padding: "0 16px" }}>{genre.name}</div>
      <div style={{ color: "#5E5260", fontSize: 16 }}>{genre.desc}</div>
      {ind && <Ind type={ind} />}
    </div>
  );
}

const chipBtn = (on) => ({
  background: on ? T.yellow : T.paper, border: `2px solid ${T.ink}`, color: T.ink,
  cursor: "pointer", fontFamily: T.body, fontWeight: 700,
});

function MovieCard({ movie, onSwipe, onDetail, seenIds, onToggleSeen, wishlist = [], onToggleWishlist }) {
  const { tx, out, ind, onStart, onMove, onEnd } = useSwipe(onSwipe);
  const isSeen = seenIds.has(movie.id);
  const inList = wishlist.some(m => m.id === movie.id);
  const stop = { onMouseDown: e => e.stopPropagation(), onTouchStart: e => e.stopPropagation() };
  return (
    <div style={{ ...cardBase, transform: tx, transition: out ? "transform 0.22s ease" : "none", pointerEvents: out ? "none" : "auto", display: "flex", flexDirection: "column" }}
      onMouseDown={e => onStart(e.clientX)} onMouseMove={e => onMove(e.clientX)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)} onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }} onTouchEnd={onEnd}
    >
      {/* Image paysage 16:9, sans texture */}
      <div style={{ position: "relative", aspectRatio: "16 / 9", flexShrink: 0, borderBottom: `2px solid ${T.ink}` }}>
        <Poster url={movie.backdrop || movie.poster} title={movie.title} style={{ position: "absolute", inset: 0 }} />
        {onToggleWishlist && (
          <button {...stop} onClick={e => { e.stopPropagation(); onToggleWishlist(movie); }}
            aria-label={inList ? "Retirer de ma liste" : "Ajouter à ma liste"} aria-pressed={inList}
            style={{ ...chipBtn(inList), position: "absolute", top: 10, left: 10, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bookmark" size={18} color={T.ink} fill={inList} />
          </button>
        )}
        <button {...stop} onClick={e => { e.stopPropagation(); onToggleSeen(movie.id); }} aria-pressed={isSeen}
          style={{ ...chipBtn(isSeen), position: "absolute", top: 10, right: 10, height: 40, borderRadius: 999, padding: "0 14px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          {isSeen && <Icon name="check" size={13} color={T.ink} />}
          {isSeen ? "Déjà vu" : "Déjà vu ?"}
        </button>
      </div>
      <div style={{ position: "relative", padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
        <Grain opacity={0.05} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.display, fontSize: 22, lineHeight: 1.05, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{movie.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 14, color: "#5E5260" }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.imdb && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 16, fontWeight: 700, color: T.ink }}><Icon name="star" size={15} color={T.coral} />{String(movie.imdb).replace(".", ",")}/10</span>}
            </div>
          </div>
          <button {...stop} onClick={e => { e.stopPropagation(); onDetail(); }}
            style={{ flexShrink: 0, background: "transparent", border: `2px solid ${T.blue}`, borderRadius: 10, height: 40, padding: "0 12px", color: T.blue, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.body }}>
            Infos
          </button>
        </div>
        <div style={{ color: T.ink, fontSize: 14, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{movie.synopsis}</div>
        {movie.streamingOn?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {movie.streamingOn.map(p => (
              <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, border: `1.5px solid rgba(52,42,54,0.25)`, borderRadius: 8, padding: "3px 8px 3px 4px", fontSize: 12, fontWeight: 600, color: T.ink }}>
                {p.logo && <img src={p.logo} alt="" style={{ width: 20, height: 20, borderRadius: 5, objectFit: "cover" }} />}
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: T.paper, color: T.ink, overflowY: "auto" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 9", borderBottom: `2px solid ${T.ink}` }}>
          <Poster url={movie.backdrop || movie.poster} title={movie.title} style={{ position: "absolute", inset: 0 }} />
          <button onClick={onClose} aria-label="Retour" style={{ position: "absolute", top: 14, left: 14, ...chipBtn(false), borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="back" size={20} color={T.ink} /></button>
        </div>
        <div style={{ padding: "20px 20px 48px", position: "relative" }}>
          <div style={{ fontFamily: T.display, fontSize: 26, lineHeight: 1.05, marginBottom: 12 }}>{movie.title}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
            <RatingBadge score={movie.imdb} />
            {movie.year && <span style={{ fontSize: 14, color: "#5E5260" }}>{movie.year}</span>}
          </div>
          {movie.streamingOn?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Disponible sur</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {movie.streamingOn.map(p => (
                  <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, border: `2px solid ${T.ink}`, borderRadius: 10, padding: "5px 12px 5px 6px", fontSize: 14, fontWeight: 600 }}>
                    {p.logo && <img src={p.logo} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />}
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {movie.trailerKey && (
            <a href={`https://www.youtube.com/watch?v=${movie.trailerKey}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: T.coral, borderRadius: 12, color: T.white, fontWeight: 700, fontSize: 16, textDecoration: "none", marginBottom: 20, boxShadow: `3px 3px 0 ${T.ink}` }}>
              <Icon name="play" size={18} color={T.white} /> Voir la bande-annonce
            </a>
          )}
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>{movie.synopsis}</p>
        </div>
      </div>
    </div>
  );
}

function MatchModal({ item, type, solo, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(43,35,48,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16, overflowY: "auto" }}>
      <div role="dialog" aria-modal="true" aria-label="C'est un match" className="cm-pop" style={{ position: "relative", overflow: "hidden", background: T.paper, color: T.ink, border: `2px solid ${T.ink}`, borderRadius: 18, boxShadow: `5px 5px 0 ${T.coral}`, padding: "24px 22px 22px", textAlign: "center", maxWidth: 360, width: "100%" }}>
        <Grain opacity={0.14} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Matches size={150} animate /></div>
          <div style={{ fontFamily: T.display, fontSize: 32, lineHeight: 1.05, color: T.coral, marginTop: 8 }}>C'est un match !</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.blue, marginTop: 6, marginBottom: 18 }}>Deux envies. Une étincelle.</div>
          {type === "genre" ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name={item.icon} size={56} color={item.color} /></div>
              <div style={{ fontFamily: T.display, fontSize: 22, marginBottom: 6 }}>{item.name}</div>
              <div style={{ fontSize: 16, marginBottom: 22 }}>{solo ? "Ce genre vous tente ce soir." : "Vous aimez tous les deux ce genre."}</div>
              <button onClick={onClose} style={{ height: 56, width: "100%", border: "none", borderRadius: 12, background: T.coral, color: T.white, fontFamily: T.body, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: `3px 3px 0 ${T.ink}` }}>Continuer</button>
            </>
          ) : (
            <>
              <div className="cm-poster" style={{ width: 132, height: 198, borderRadius: 12, overflow: "hidden", margin: "0 auto 14px", border: `2px solid ${T.ink}`, boxShadow: `3px 3px 0 ${T.ink}`, transform: "rotate(2deg)" }}>
                <Poster url={item.poster} title={item.title} style={{ width: "100%", height: "100%" }} />
              </div>
              <div style={{ fontFamily: T.display, fontSize: 21, lineHeight: 1.05, marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 14, marginBottom: 10 }}>
                {[item.year, item.imdb ? `${String(item.imdb).replace(".", ",")}/10` : null].filter(Boolean).join(" · ")}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 18 }}>
                {solo ? "Ce film vous plaît. Bonne pioche." : "Vous avez aimé le même film. Comme quoi, vous avez plutôt bon goût tous les deux."}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {item.trailerKey && (
                  <a href={`https://www.youtube.com/watch?v=${item.trailerKey}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 56, background: T.coral, borderRadius: 12, color: T.white, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: `3px 3px 0 ${T.ink}` }}>
                    <Icon name="play" size={16} color={T.white} /> Voir la bande-annonce
                  </a>
                )}
                <ShareMatchButton title={item.title} />
                <button onClick={onClose} style={{ height: 48, border: "none", borderRadius: 12, background: T.yellow, color: T.ink, fontFamily: T.body, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Terminer</button>
              </div>
            </>
          )}
        </div>
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
  const c = copied ? T.green : T.blue;
  return (
    <button onClick={share} style={{ height: 56, width: "100%", background: "transparent", color: c, border: `2px solid ${c}`, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: T.body }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name={copied ? "check" : "share"} size={18} color={c} />{copied ? "Lien copié" : "Partager le match"}</span>
    </button>
  );
}

function AlertIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" />
    </svg>
  );
}

function ErrorBox({ title, children }) {
  return (
    <div role="alert" style={{ display: "flex", gap: 14, alignItems: "flex-start", background: T.surface, border: `2px solid ${T.red}`, borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "left" }}>
      <AlertIcon />
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: T.ink, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink }}>{children}</div>
      </div>
    </div>
  );
}

// Boutons de swipe : « je passe » en contour neutre, « j'aime » en corail
function swipeBtn(like, C) {
  return like
    ? { width: 64, height: 64, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: T.coral, border: "none", boxShadow: `3px 3px 0 ${C.dark ? T.yellow : T.ink}` }
    : { width: 64, height: 64, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `2.5px solid ${C.ink}` };
}

function LegalScreen({ onBack, C }) {
  const H = ({ children }) => <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: C.ink, fontWeight: 700, margin: "24px 0 8px" }}>{children}</div>;
  const P = ({ children }) => <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{children}</p>;
  const A = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, fontWeight: 600 }}>{children}</a>;
  return (
    <div style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
        <div style={{ fontFamily: T.display, fontSize: 24, lineHeight: 1.05 }}>Mentions légales</div>
        <BackLink onClick={onBack} C={C} />
      </div>

      <H>Éditeur</H>
      <P>CinéMatch est un projet personnel édité par un particulier, à titre non professionnel et sans activité commerciale. Conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 (LCEN), l'éditeur a choisi de rester anonyme ; ses coordonnées ont été communiquées à l'hébergeur.</P>
      <P>Contact : <A href="https://github.com/Yrzygma/cin-match/issues">via la page du projet sur GitHub</A>.</P>

      <H>Hébergement</H>
      <P>Site : Vercel Inc., 440 North Barranca Avenue, Suite 4133, Covina, CA 91723, États-Unis — +1 (951) 383-6898.</P>
      <P>Base de données des sessions : Supabase Inc., San Francisco, États-Unis.</P>

      <H>Données collectées</H>
      <P><strong>Sur votre appareil.</strong> Votre liste, vos films déjà vus, vos plateformes et vos réglages Mood sont enregistrés uniquement dans le stockage local de votre navigateur. Ils ne quittent pas votre appareil. Vous pouvez les effacer à tout moment depuis l'app ou en vidant les données du site.</P>
      <P><strong>Pendant une session à deux.</strong> Le prénom saisi, le code de session et vos votes (genres et films) sont enregistrés sur Supabase pour permettre la synchronisation en temps réel. Ces données sont supprimées automatiquement au bout de 30 jours.</P>
      <P><strong>Mesure d'audience.</strong> Des statistiques d'usage anonymes (par exemple « session créée », « match trouvé ») sont envoyées à PostHog, hébergé dans l'Union européenne. Aucun cookie n'est déposé, aucun nom ni e-mail n'est collecté, aucune donnée n'est revendue ni utilisée à des fins publicitaires. Ces mesures servent uniquement à améliorer l'app.</P>
      <P>Conformément au RGPD, vous pouvez demander l'accès à vos données ou leur suppression via le contact ci-dessus.</P>

      <H>Crédits</H>
      <P>Données des films : <A href="https://www.themoviedb.org">TMDB</A>. Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.</P>
      <P>Disponibilités sur les plateformes de streaming : <A href="https://www.justwatch.com">JustWatch</A>.</P>
      <P>Les affiches, images et marques des films et des plateformes appartiennent à leurs détenteurs respectifs.</P>
    </div>
  );
}

function BackLink({ onClick, C }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: C.link, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.body, display: "inline-flex", alignItems: "center", gap: 4, minHeight: 44, flexShrink: 0 }}>
      <Icon name="back" size={16} color={C.link} /> Retour
    </button>
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

  // Ecrans de swipe en version « soir » (fond aubergine), le reste sur papier creme
  const C = ["genre", "movie", "loading"].includes(screen) ? DARK : LIGHT;
  // La barre d'etat du telephone suit la couleur de fond de l'ecran
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", C.bg);
  }, [C.bg]);

  // Boutons : principal (corail), secondaire (contour bleu, creme le soir), discret (jaune)
  const Btn = ({ onClick, children, outline, tertiary, disabled }) => {
    const base = { width: "100%", height: tertiary ? 48 : 56, borderRadius: 12, fontSize: 16, fontWeight: 700, fontFamily: T.body, cursor: disabled ? "default" : "pointer", marginBottom: 12, opacity: disabled ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" };
    const v = tertiary
      ? { background: T.yellow, color: T.ink, border: "none" }
      : outline
        ? { background: "transparent", color: C.dark ? T.paper : T.blue, border: `2px solid ${C.dark ? T.paper : T.blue}` }
        : { background: T.coral, color: T.white, border: "none", boxShadow: disabled ? "none" : `3px 3px 0 ${C.dark ? T.yellow : T.ink}` };
    return <button className="cm-btn" onClick={onClick} disabled={disabled} style={{ ...base, ...v }}>{children}</button>;
  };

  const inputStyle = { width: "100%", height: 52, background: T.surface, border: `2px solid ${T.ink}`, borderRadius: 10, padding: "0 15px", color: T.ink, fontSize: 16, fontFamily: T.body, marginBottom: 12 };
  const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: C.ink, fontWeight: 700 };
  const h2 = { fontFamily: T.display, fontSize: 26, lineHeight: 1.05, color: C.ink };
  const linkBtn = (active) => ({ background: "none", border: "none", color: active ? T.coral : T.blue, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.body, textDecoration: "underline", textUnderlineOffset: 3, minHeight: 44, padding: "0 4px" });
  const listRow = { display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `2px solid ${T.ink}`, borderRadius: 12, padding: "10px 12px" };
  const removeBtn = { background: "transparent", border: `2px solid ${T.ink}`, borderRadius: 10, width: 44, height: 44, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" };
  const stackBehind = (n) => ({ position: "absolute", inset: 0, borderRadius: 16, background: n === 2 ? "rgba(244,235,221,0.08)" : "rgba(244,235,221,0.16)", border: "2px solid rgba(244,235,221,0.2)", transform: n === 2 ? "scale(0.9) translateY(18px)" : "scale(0.95) translateY(9px)" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Karla:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg};color:${C.ink};font-family:'Karla',sans-serif;min-height:100vh;transition:background 0.22s}
        input::placeholder{color:#6E6270}
        :focus-visible{outline:3px solid ${C.dark ? T.yellow : T.ink};outline-offset:2px}
        .cm-btn:active:not(:disabled){transform:translate(2px,2px);box-shadow:none !important}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(52,42,54,0.2);border-radius:4px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.4);opacity:1}}
        @keyframes cmLeft{from{transform:translateX(-60px);opacity:0}to{transform:none;opacity:1}}
        @keyframes cmRight{from{transform:translateX(60px);opacity:0}to{transform:none;opacity:1}}
        @keyframes cmSpark{0%,55%{opacity:0;transform:scale(0.4)}100%{opacity:1;transform:scale(1)}}
        @keyframes cmPop{from{transform:scale(0.94);opacity:0}to{transform:none;opacity:1}}
        @keyframes cmPoster{from{transform:rotate(-6deg) translateY(16px);opacity:0}to{transform:rotate(2deg);opacity:1}}
        .cm-left{animation:cmLeft 0.36s ease-out both}
        .cm-right{animation:cmRight 0.36s ease-out both}
        .cm-spark{transform-origin:90px 40px;animation:cmSpark 0.6s ease-out both}
        .cm-pop{animation:cmPop 0.22s ease-out both}
        .cm-poster{animation:cmPoster 0.6s ease-out both}
        @media (prefers-reduced-motion: reduce){.cm-left,.cm-right,.cm-spark,.cm-pop,.cm-poster{animation:none}}
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", transition: "background 0.22s" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}><Grain opacity={C.dark ? 0.06 : 0.035} dark={C.dark} /></div>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 440, padding: "18px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <Wordmark C={C} />
          {screen !== "home" && (
            <div style={{ border: `2px solid ${C.line}`, borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 600, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
              {partnerConnected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.dark ? T.yellow : T.green }} />}
              {partnerConnected ? partnerName : (isSolo ? "Solo" : "En attente…")}
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 440, padding: "0 20px 48px", position: "relative", zIndex: 1 }}>

          {/* HOME */}
          {screen === "home" && (
            <div style={{ paddingTop: 12, padding: "12px 4px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, animation: "float 3.5s ease-in-out infinite" }}><Matches size={170} /></div>
              <h1 style={{ fontFamily: T.display, fontWeight: 400, fontSize: 36, lineHeight: 1.05, marginBottom: 12 }}>Ce soir, on regarde quoi ?</h1>
              <div style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 28 }}>Deux envies, quelques films, et une étincelle à trouver.</div>
              <Btn onClick={() => { setCreateError(null); setScreen("create"); }}>Créer une session</Btn>
              <Btn outline onClick={() => { setJoinError(null); setScreen("join"); }}>Rejoindre une session</Btn>
              <Btn tertiary onClick={() => { track("solo_started"); setScreen("genre"); }}>Mode solo</Btn>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => setScreen("mood")} style={linkBtn(isMoodActive(mood))}>Mood{isMoodActive(mood) ? " (actif)" : ""}</button>
                <button onClick={() => setScreen("providers")} style={linkBtn(selectedProviders.length > 0)}>Plateformes{selectedProviders.length > 0 ? ` (${selectedProviders.length})` : ""}</button>
                <button onClick={() => setScreen("wishlist")} style={linkBtn(false)}>Ma liste{wishlist.length > 0 ? ` (${wishlist.length})` : ""}</button>
                <button onClick={() => setScreen("seen")} style={linkBtn(false)}>Déjà vus{seenIds.size > 0 ? ` (${seenIds.size})` : ""}</button>
              </div>

              {/* Attribution TMDB (requise par les conditions d'utilisation de l'API) */}
              <div style={{ textAlign: "center", marginTop: 22, paddingTop: 16, borderTop: `2px solid ${C.line}` }}>
                <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                  <img
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                    alt="TMDB"
                    style={{ height: 11 }}
                  />
                  <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, maxWidth: 260, textAlign: "left" }}>
                    Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.
                  </span>
                </a>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>
                  Disponibilités sur les plateformes : <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" style={{ color: C.sub }}>JustWatch</a>
                </div>
                <button onClick={() => setScreen("legal")} style={{ ...linkBtn(false), color: C.sub, fontSize: 12, fontWeight: 600 }}>
                  Mentions légales et confidentialité
                </button>
              </div>
            </div>
          )}

          {/* CREATE SESSION */}
          {screen === "create" && (
            <div style={{ paddingTop: 28 }}>
              <div style={{ ...h2, marginBottom: 8 }}>Nouvelle session</div>
              <div style={{ fontSize: 16, marginBottom: 22 }}>Entrez votre prénom, puis invitez votre partenaire de canapé.</div>
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
            <div style={{ paddingTop: 24, textAlign: "center" }}>
              <div style={{ ...h2, marginBottom: 8 }}>Invitez votre partenaire</div>
              <div style={{ fontSize: 16, marginBottom: 22 }}>Partagez ce code ou ce lien.</div>

              {/* Big code */}
              <div style={{ position: "relative", overflow: "hidden", background: T.yellow, border: `2px solid ${T.ink}`, borderRadius: 16, boxShadow: `3px 3px 0 ${T.ink}`, padding: "16px 20px", marginBottom: 20 }}>
                <Grain opacity={0.12} />
                <div style={{ position: "relative", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>Code de session</div>
                <div style={{ position: "relative", fontFamily: T.display, fontSize: 40, letterSpacing: 6 }}>{sessionCode}</div>
              </div>

              {/* QR Code */}
              <div style={{ marginBottom: 20 }}>
                <QRCode value={`${window.location.origin}?join=${sessionCode}`} />
              </div>

              <Btn outline onClick={copyLink}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{copied && <Icon name="check" size={16} color={T.blue} />}{copied ? "Lien copié" : "Copier le lien"}</span>
              </Btn>

              {/* Waiting indicator */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 16, marginTop: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.coral, animation: "pulse 1.5s ease-in-out infinite" }} />
                Votre partenaire de canapé arrive…
              </div>
            </div>
          )}

          {/* JOIN SESSION */}
          {screen === "join" && (
            <div style={{ paddingTop: 28 }}>
              <div style={{ ...h2, marginBottom: 8 }}>Rejoindre une session</div>
              <div style={{ fontSize: 16, marginBottom: 22 }}>Entrez le code partagé par votre partenaire.</div>
              <input placeholder="Votre prénom" aria-label="Votre prénom" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              <input placeholder="Code (ex : ABC123)" aria-label="Code de session" aria-invalid={joinError === "notfound"} value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); if (joinError) setJoinError(null); }}
                style={{ ...inputStyle, height: 60, fontFamily: T.display, fontSize: 22, letterSpacing: 4, textAlign: "center", ...(joinError === "notfound" ? { border: `2px solid ${T.red}`, marginBottom: 8 } : {}) }} />
              {joinError === "notfound" && (
                <div role="alert" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5, color: T.red, fontWeight: 600, marginBottom: 18 }}>
                  <AlertIcon size={18} />
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
            <div style={{ textAlign: "center", paddingTop: 72 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, animation: "float 2s ease-in-out infinite" }}><Matches size={140} ink={T.paper} /></div>
              <div style={{ fontFamily: T.display, fontSize: 24, lineHeight: 1.05, marginBottom: 10 }}>On craque une allumette…</div>
              <div style={{ color: C.mid, fontSize: 16, marginBottom: 28 }}>Recherche des films{selGenre ? ` · ${selGenre.name}` : ""}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: T.yellow, animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}

          {/* GENRE SWIPE */}
          {screen === "genre" && !genreDone && !genreMatch && (
            <div>
              <div style={{ paddingTop: 10, marginBottom: 14 }}>
                <div style={{ ...eyebrow, marginBottom: 8 }}>Étape 1 · Genres</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 8, background: C.soft, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: T.yellow, borderRadius: 999, width: `${(genreIdx / GENRES.length) * 100}%`, transition: "width 0.22s" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{genreIdx} / {GENRES.length}</div>
                </div>
              </div>
              {partnerConnected && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: `2px solid ${C.line}`, borderRadius: 12, padding: "9px 14px", marginBottom: 14, fontSize: 14, color: C.mid }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.yellow, flexShrink: 0 }} />
                  <span><strong style={{ color: C.ink }}>{partnerName}</strong> swipe en même temps que vous</span>
                </div>
              )}
              <div style={{ position: "relative", height: 320, marginBottom: 24 }}>
                {genreIdx + 2 < GENRES.length && <div style={stackBehind(2)} />}
                {genreIdx + 1 < GENRES.length && <div style={stackBehind(1)} />}
                <GenreCard key={genreIdx} genre={GENRES[genreIdx]} onSwipe={onGenreSwipe} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 14 }}>
                <button onClick={() => onGenreSwipe(false)} aria-label="Je passe" style={swipeBtn(false, C)}><Icon name="x" size={28} color={C.ink} /></button>
                <button className="cm-btn" onClick={() => onGenreSwipe(true)} aria-label="J'aime" style={swipeBtn(true, C)}><Icon name="heart" size={30} color={T.white} /></button>
              </div>
              <div style={{ textAlign: "center", fontSize: 14, color: C.mid }}>Glissez la carte ou appuyez pour voter</div>
            </div>
          )}

          {/* GENRE DONE - no match */}
          {screen === "genre" && genreDone && matchedGenres.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 48 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, opacity: 0.85 }}><Matches size={130} ink={T.paper} /></div>
              <div style={{ ...h2, marginBottom: 10 }}>Pas encore d'étincelle…</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, color: C.mid, marginBottom: 26 }}>Aucun genre en commun cette fois. On recommence ?</div>
              <Btn onClick={() => { setGenreIdx(0); setMatchedGenres([]); setMyGenreLikes(new Set()); setPartnerGenreLikes(new Set()); }}>Recommencer</Btn>
            </div>
          )}

          {/* GENRE DONE - pick */}
          {screen === "genre" && genreDone && !genreMatch && matchedGenres.length > 0 && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ ...eyebrow, marginBottom: 8 }}>Genres en commun</div>
              <div style={{ ...h2, marginBottom: 8 }}><span style={{ color: T.yellow }}>{matchedGenres.length} genre{matchedGenres.length > 1 ? "s" : ""}</span> en commun</div>
              <div style={{ fontSize: 16, color: C.mid, marginBottom: 18 }}>Choisissez-en un pour voir les films.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {matchedGenres.map(g => (
                  <button key={g.id} onClick={() => startMovies(g)} className="cm-btn" style={{ borderRadius: 14, padding: "18px 12px", cursor: "pointer", border: `2px solid ${T.paper}`, background: T.paper, color: T.ink, boxShadow: `3px 3px 0 ${T.coral}`, textAlign: "center", fontFamily: T.body }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name={g.icon} size={36} color={g.color} /></div>
                    <div style={{ fontFamily: T.display, fontSize: 15 }}>{g.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MOVIE SWIPE */}
          {screen === "movie" && !movieDone && !movieMatch && cur && (
            <div>
              <div style={{ paddingTop: 10, marginBottom: 12 }}>
                <div style={{ ...eyebrow, marginBottom: 8 }}>
                  À vous de choisir{selGenre ? ` · ${selGenre.name}` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 8, background: C.soft, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: T.yellow, borderRadius: 999, width: `${movies.length > 0 ? (movieIdx / movies.length) * 100 : 0}%`, transition: "width 0.22s" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{movieIdx} / {movies.length}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `2px solid ${C.line}`, borderRadius: 12, padding: "6px 8px 6px 14px" }}>
                  <span style={{ fontSize: 14, color: C.mid }}>Passer les déjà vus {seenIds.size > 0 ? `(${seenIds.size})` : ""}</span>
                  <button role="switch" aria-checked={skipSeen} aria-label="Passer les déjà vus" onClick={() => {
                    const next = !skipSeen;
                    setSkipSeen(next);
                    if (next && cur && seenIds.has(cur.id)) advance(movieIdx, movies, next, seenIds);
                  }} style={{ width: 52, height: 32, padding: 0, borderRadius: 999, background: skipSeen ? T.coral : "transparent", border: `2px solid ${skipSeen ? T.coral : C.ink}`, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 4, left: skipSeen ? 24 : 4, width: 20, height: 20, borderRadius: "50%", background: skipSeen ? T.white : C.ink, transition: "left 0.2s" }} />
                  </button>
                </div>
              </div>
              <div style={{ position: "relative", height: 440, marginBottom: 20 }}>
                {movieIdx + 2 < movies.length && <div style={stackBehind(2)} />}
                {movieIdx + 1 < movies.length && <div style={stackBehind(1)} />}
                <MovieCard key={`${selGenre?.id}-${movieIdx}`} movie={cur} onSwipe={onMovieSwipe} onDetail={() => setDetail(cur)} seenIds={seenIds} onToggleSeen={toggleSeen} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 12 }}>
                <button onClick={() => onMovieSwipe(false)} aria-label="Je passe" style={swipeBtn(false, C)}><Icon name="x" size={28} color={C.ink} /></button>
                <button className="cm-btn" onClick={() => onMovieSwipe(true)} aria-label="J'aime" style={swipeBtn(true, C)}><Icon name="heart" size={30} color={T.white} /></button>
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setScreen("genre")} style={{ ...linkBtn(false), color: C.link }}>Changer de genre</button>
              </div>
            </div>
          )}

          {/* NO MATCH */}
          {screen === "movie" && movieDone && !movieMatch && (
            <div style={{ textAlign: "center", paddingTop: 48 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, opacity: 0.85 }}><Matches size={130} ink={T.paper} /></div>
              <div style={{ ...h2, marginBottom: 10 }}>Pas encore d'étincelle…</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, color: C.mid, marginBottom: 26 }}>Vos envies ne se sont pas croisées cette fois. Changez de genre ou relancez une sélection : le prochain film est peut-être le bon.</div>
              <Btn onClick={() => setScreen("genre")}>Choisir un autre genre</Btn>
              <Btn outline onClick={() => startMovies(selGenre)}>Relancer ce genre</Btn>
            </div>
          )}

          {/* PROVIDERS */}
          {screen === "providers" && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
                <div style={h2}>Mes plateformes</div>
                <BackLink onClick={() => setScreen("home")} C={C} />
              </div>
              <div style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>
                Sélectionnez vos plateformes pour ne voir que les films disponibles dessus. {selectedProviders.length === 0 && "Aucune sélection : tous les films."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {PROVIDERS.map(p => {
                  const selected = selectedProviders.includes(p.id);
                  return (
                    <button key={p.id} aria-pressed={selected} onClick={() => {
                      const next = selected ? selectedProviders.filter(id => id !== p.id) : [...selectedProviders, p.id];
                      setSelectedProviders(next);
                      localStorage.setItem('selectedProviders', JSON.stringify(next));
                    }} style={{ borderRadius: 12, padding: "12px", cursor: "pointer", border: `2px solid ${T.ink}`, background: selected ? T.yellow : T.surface, boxShadow: selected ? `3px 3px 0 ${T.ink}` : "none", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s", fontFamily: T.body, color: T.ink, textAlign: "left" }}>
                      {providerLogos[p.id]
                        ? <img src={providerLogos[p.id]} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: T.white, flexShrink: 0 }}>{p.name[0]}</div>}
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                      {selected && <div style={{ marginLeft: "auto", flexShrink: 0 }}><Icon name="check" size={18} color={T.ink} /></div>}
                    </button>
                  );
                })}
              </div>
              {selectedProviders.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <button onClick={() => { setSelectedProviders([]); localStorage.removeItem('selectedProviders'); }} style={linkBtn(false)}>
                    Tout désélectionner
                  </button>
                </div>
              )}
              <Btn onClick={() => setScreen("home")}>Valider</Btn>
              <div style={{ fontSize: 12, color: C.sub, textAlign: "center" }}>Disponibilités fournies par JustWatch, via TMDB.</div>
            </div>
          )}

          {/* MOOD FILTERS */}
          {screen === "mood" && (
            <div style={{ paddingTop: 16, paddingBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
                <div style={h2}>Mood</div>
                <BackLink onClick={() => setScreen("home")} C={C} />
              </div>
              <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.5 }}>
                Affinez le type de films proposés. Ces réglages s'appliquent à vos prochaines sessions.
              </div>

              {/* ANNEE */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={eyebrow}>Année de sortie</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{mood.yearMin} — {mood.yearMax}</div>
                </div>
                <RangeSlider C={C} label="Année"
                  min={YEAR_MIN} max={YEAR_MAX} step={1}
                  valueMin={mood.yearMin} valueMax={mood.yearMax}
                  onChange={(lo, hi) => saveMood({ ...mood, yearMin: lo, yearMax: hi })}
                />
              </div>

              {/* NOTE MINIMUM */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={eyebrow}>Note minimum</div>
                  <div style={{ fontSize: 15, color: mood.ratingMin > 0 ? C.ink : C.sub, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    {mood.ratingMin > 0
                      ? <><Icon name="star" size={15} color={T.coral} /> {mood.ratingMin.toFixed(1).replace(".", ",")} et plus</>
                      : "Peu importe"}
                  </div>
                </div>
                <RatingSlider C={C} value={mood.ratingMin} onChange={(v) => saveMood({ ...mood, ratingMin: v })} />
              </div>

              {/* DUREE */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={eyebrow}>Durée</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtDur(mood.runtimeMin)} — {fmtDur(mood.runtimeMax)}</div>
                </div>
                <RangeSlider C={C} label="Durée"
                  min={RUNTIME_MIN} max={RUNTIME_MAX} step={5}
                  valueMin={mood.runtimeMin} valueMax={mood.runtimeMax}
                  onChange={(lo, hi) => saveMood({ ...mood, runtimeMin: lo, runtimeMax: hi })}
                />
              </div>

              {/* PAYS */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div style={eyebrow}>Pays d'origine</div>
                  <div style={{ fontSize: 14, color: C.sub }}>{mood.countries.length === 0 ? "Tous" : `${mood.countries.length} sélectionné${mood.countries.length > 1 ? "s" : ""}`}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {COUNTRIES.map(co => {
                    const sel = mood.countries.includes(co.code);
                    return (
                      <button key={co.code} aria-pressed={sel}
                        onClick={() => saveMood({
                          ...mood,
                          countries: sel ? mood.countries.filter(x => x !== co.code) : [...mood.countries, co.code],
                        })}
                        style={{ borderRadius: 999, height: 40, padding: "0 14px", cursor: "pointer", border: `2px solid ${T.ink}`, background: sel ? T.yellow : "transparent", fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: T.body, transition: "all 0.15s" }}>
                        {co.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Btn onClick={() => setScreen("home")}>Valider</Btn>
              {isMoodActive(mood) && (
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => saveMood({ ...DEFAULT_MOOD })} style={linkBtn(false)}>
                    Réinitialiser les critères
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUCUN FILM TROUVE */}
          {screen === "empty" && (
            <div style={{ paddingTop: 40, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Matches size={130} /></div>
              <div style={{ ...h2, marginBottom: 12 }}>Pas encore d'étincelle…</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 26, padding: "0 6px" }}>
                {emptyInfo?.reason === "platform"
                  ? <>Des films correspondent à vos critères, mais aucun n'est disponible sur {selectedProviders.length > 1 ? "vos plateformes" : "votre plateforme"}. Ajoutez une plateforme ou assouplissez vos critères.</>
                  : <>Vos critères Mood sont trop stricts pour ce genre. Élargissez l'année, la durée ou la note minimum.</>}
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
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                <div style={h2}>Ma liste</div>
                <BackLink onClick={() => setScreen("home")} C={C} />
              </div>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 36, fontSize: 16, lineHeight: 1.5 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="bookmark" size={44} color={T.blue} /></div>
                  Votre liste est vide.<br/>
                  <span style={{ fontSize: 14, color: C.sub, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>Appuyez sur <Icon name="bookmark" size={14} color={C.sub} /> sur une carte pour garder un film.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 14, color: C.sub, marginBottom: 4 }}>
                    {wishlist.length} film{wishlist.length > 1 ? "s" : ""} gardé{wishlist.length > 1 ? "s" : ""}
                  </div>
                  {wishlist.map(m => (
                    <div key={m.id} style={listRow}>
                      <div style={{ width: 40, height: 60, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: `1.5px solid ${T.ink}` }}>
                        <Poster url={m.poster} title={m.title} style={{ width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                        <div style={{ fontSize: 14, color: C.sub, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>{m.year}{m.imdb ? <> · <Icon name="star" size={12} color={T.coral} /> {String(m.imdb).replace(".", ",")}</> : ""}</div>
                      </div>
                      <button onClick={() => removeWishlist(m.id)} style={removeBtn} aria-label={`Retirer ${m.title}`}><Icon name="x" size={16} color={T.ink} /></button>
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
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                <div style={h2}>Déjà vus</div>
                <BackLink onClick={() => setScreen("home")} C={C} />
              </div>
              {seenIds.size === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 36, fontSize: 16 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="check" size={44} color={T.blue} /></div>
                  Aucun film marqué comme déjà vu.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 14, color: C.sub, marginBottom: 4, lineHeight: 1.5 }}>
                    {seenIds.size} film{seenIds.size > 1 ? "s" : ""}. Ils sont exclus si vous activez « Passer les déjà vus ».
                  </div>
                  {seenMovies.length > 0 ? seenMovies.map(m => (
                    <div key={m.id} style={listRow}>
                      <div style={{ width: 40, height: 60, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: `1.5px solid ${T.ink}` }}>
                        <Poster url={m.poster} title={m.title} style={{ width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                        <div style={{ fontSize: 14, color: C.sub, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>{m.year}{m.imdb ? <> · <Icon name="star" size={12} color={T.coral} /> {String(m.imdb).replace(".", ",")}</> : ""}</div>
                      </div>
                      <button onClick={() => removeSeen(m.id)} style={removeBtn} aria-label={`Retirer ${m.title}`}><Icon name="x" size={16} color={T.ink} /></button>
                    </div>
                  )) : [...seenIds].map(id => (
                    <div key={id} style={{ ...listRow, justifyContent: "space-between" }}>
                      <div style={{ fontSize: 16 }}>Film n° {id}</div>
                      <button onClick={() => removeSeen(id)} style={removeBtn} aria-label="Retirer"><Icon name="x" size={16} color={T.ink} /></button>
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
          {screen === "legal" && <LegalScreen onBack={() => setScreen("home")} C={C} />}

          {/* FINAL */}
          {screen === "final" && (
            <div style={{ textAlign: "center", paddingTop: 44 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, animation: "float 3.5s ease-in-out infinite" }}><Matches size={170} /></div>
              <div style={{ fontFamily: T.display, fontSize: 34, lineHeight: 1.05, marginBottom: 10 }}>Bonne séance !</div>
              <div style={{ fontSize: 16, marginBottom: 30 }}>Éteignez les lumières, on s'occupe du reste.</div>
              <Btn onClick={reset}>Nouvelle session</Btn>
            </div>
          )}
        </div>

        {genreMatch && <MatchModal item={genreMatch} type="genre" solo={isSolo} onClose={() => { setGenreMatch(null); }} />}
        {movieMatch && <MatchModal item={movieMatch} type="movie" solo={isSolo} onClose={() => { setMovieMatch(null); setScreen("final"); }} />}
        {detail && <DetailPanel movie={detail} onClose={() => setDetail(null)} />}
      </div>
    </>
  );
}
