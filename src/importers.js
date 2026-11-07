// ─── IMPORT LETTERBOXD / IMDb ─────────────────────────────────────────────────
// Les fichiers sont lus dans le navigateur. Seuls les titres (Letterboxd) ou
// les identifiants IMDb sont envoyes a /api/import, par lots, pour retrouver
// les films TMDB correspondants.

// Analyseur CSV : guillemets, virgules et retours a la ligne dans les champs,
// fins de ligne Windows, BOM UTF-8.
export function parseCSV(text) {
  const src = String(text || "").replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v !== "")) rows.push(row);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
}

const readText = (file) => file.text();

// Letterboxd : le ZIP d'export (ou directement watched.csv / watchlist.csv
// si le telephone l'a deja decompresse).
// -> { seen: [{ title, year }], wish: [{ title, year }] }
export async function readLetterboxd(file) {
  const toItems = (rows) => rows
    .filter((r) => r.Name)
    .map((r) => ({ title: r.Name, year: parseInt(r.Year, 10) || null, label: r.Year ? `${r.Name} (${r.Year})` : r.Name }));

  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".csv")) {
    const rows = parseCSV(await readText(file));
    if (rows.length && !("Name" in rows[0])) throw new Error("format");
    return name.includes("watchlist") ? { seen: [], wish: toItems(rows) } : { seen: toItems(rows), wish: [] };
  }

  const { default: JSZip } = await import("jszip");
  let zip;
  try { zip = await JSZip.loadAsync(file); } catch { throw new Error("format"); }
  // Fichiers a la racine du ZIP (on ignore les listes, likes, etc.)
  const find = (base) => Object.values(zip.files).find((f) => !f.dir && f.name.toLowerCase().split("/").pop() === base && !f.name.includes("deleted/"));
  const watched = find("watched.csv");
  const watchlist = find("watchlist.csv");
  if (!watched && !watchlist) throw new Error("format");
  return {
    seen: watched ? toItems(parseCSV(await watched.async("string"))) : [],
    wish: watchlist ? toItems(parseCSV(await watchlist.async("string"))) : [],
  };
}

// IMDb : export CSV des notes ou de la watchlist. Les series sont ignorees.
// -> { items: [{ imdbId }], skipped }
export async function readImdb(file) {
  const rows = parseCSV(await readText(file));
  if (rows.length && !("Const" in rows[0])) throw new Error("format");
  let skipped = 0;
  const items = [];
  for (const r of rows) {
    const type = (r["Title Type"] || r["Type"] || "").toLowerCase();
    if (type && !/movie|film/.test(type)) { skipped++; continue; }
    if (!/^tt\d+$/.test(r.Const)) continue;
    items.push({ imdbId: r.Const, label: r.Year ? `${r.Title} (${r.Year})` : (r.Title || r.Const) });
  }
  return { items, skipped };
}

// Retrouve les films TMDB par lots de 40. onProgress(fait, total).
// -> tableau aligne sur items : { id, title, year, poster } ou null
export async function resolveItems(items, onProgress) {
  const BATCH = 40;
  const out = new Array(items.length).fill(null);
  for (let start = 0; start < items.length; start += BATCH) {
    const chunk = items.slice(start, start + BATCH);
    let results = null;
    for (let attempt = 0; attempt < 2 && !results; attempt++) {
      try {
        const r = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: chunk.map(({ imdbId, title, year }) => (imdbId ? { imdbId } : { title, year })) }),
        });
        if (r.ok) results = (await r.json()).results;
      } catch {}
    }
    if (!results) throw new Error("network");
    results.forEach((m, i) => { out[start + i] = m; });
    onProgress?.(Math.min(start + BATCH, items.length), items.length);
  }
  return out;
}
