// ─── MESURE D'AUDIENCE (PostHog, hebergement EU) ──────────────────────────────
// Configuration volontairement minimale :
// - aucun cookie PostHog (persistence "memory")
// - identifiant = l'identifiant local anonyme deja utilise par l'app
// - pas d'autocapture, pas d'enregistrement de session
// - seuls des evenements nommes ("session_created", "movie_match"...) sont envoyes

const POSTHOG_KEY = "phc_ttu9MGo2FWqpadLYyoJ6MWjqRay7DnnL4fLxaipsdLzJ";
const POSTHOG_HOST = "https://eu.i.posthog.com";

// PostHog est charge apres l'affichage de l'app (import dynamique) pour ne pas
// ralentir le premier chargement. Les evenements emis avant sont mis en attente.
let posthog = null;
let started = false;
const queue = [];

export function initAnalytics(userId) {
  if (started || typeof window === "undefined") return;
  // Pas de mesure en developpement local
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
  started = true;
  import("posthog-js").then(({ default: ph }) => {
    ph.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      persistence: "memory",
      bootstrap: { distinctID: userId },
      person_profiles: "always",
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
    });
    posthog = ph;
    queue.splice(0).forEach(([e, p]) => { try { ph.capture(e, p); } catch {} });
  }).catch(() => {
    // La mesure ne doit jamais casser l'app
  });
}

export function track(event, props = {}) {
  if (!started) return;
  if (!posthog) { if (queue.length < 50) queue.push([event, props]); return; }
  try { posthog.capture(event, props); } catch {}
}
