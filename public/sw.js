// Service worker minimal de CinéMatch.
// Strategie "reseau d'abord" : l'app est toujours servie a jour depuis Vercel.
// Le cache ne sert qu'a afficher la page d'accueil si le reseau est coupe.
const CACHE = "cinematch-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // On n'intercepte que la navigation (chargement de la page), rien d'autre
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("/", copy));
        return res;
      })
      .catch(() => caches.match("/"))
  );
});
