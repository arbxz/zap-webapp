#!/usr/bin/env node
// Builds src/constants/localityCoordinates.json: a position for every
// locality in src/constants/localities_output.json, the list people pick
// from when they save a location.
//
// Source: GeoNames gazetteer for Mauritius (CC BY 4.0, https://www.geonames.org).
// Download https://download.geonames.org/export/dump/MU.zip, unzip it, then:
//
//   node scripts/build-locality-coordinates.mjs path/to/MU.txt
//
// Each entry is [lat, lng, precision]:
//   "exact"    GeoNames has a place with this name in the same district
//   "near"     only part of the name matched, e.g. "BELLE RIVE CUREPIPE" -> Curepipe
//   "district" no match; the district's centre stands in

import { readFileSync, writeFileSync } from "node:fs";

const [gazetteerPath] = process.argv.slice(2);
if (!gazetteerPath) {
  console.error(
    "Usage: node scripts/build-locality-coordinates.mjs path/to/MU.txt",
  );
  process.exit(1);
}

/** Dataset district key -> GeoNames admin1 code. */
const ADMIN1 = {
  blackriver: "12",
  flacq: "13",
  grandport: "14",
  moka: "15",
  pamplemousses: "16",
  plainewilhems: "17",
  portlouis: "18",
  rivieredurempart: "19",
  savanne: "20",
  rodrigues: "23",
};

const normalise = (name) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\bSTE\b/g, "SAINTE")
    .replace(/\bST\b/g, "SAINT")
    .replace(/\bMT\b/g, "MONT")
    // The outage dataset abbreviates a few towns.
    .replace(/\bQ BORNES\b/g, "QUATRE BORNES")
    .replace(/\bR HILL\b/g, "ROSE HILL")
    .replace(/\s+/g, " ")
    .trim();

// Populated places first, then areas, spots and terrain. Water features
// (H: bays, rivers) are left out: a saved home can't sit in the sea.
const CLASS_RANK = { P: 0, L: 1, S: 2, T: 3 };

const places = readFileSync(gazetteerPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const f = line.split("\t");
    return {
      names: new Set(
        [f[1], f[2], ...f[3].split(",")].filter(Boolean).map(normalise),
      ),
      lat: Number(f[4]),
      lng: Number(f[5]),
      featureClass: f[6],
      featureCode: f[7],
      admin1: f[10],
      rank: CLASS_RANK[f[6]] ?? 9,
    };
  })
  .filter((p) => p.featureClass !== "H");

const districtCentres = Object.fromEntries(
  places
    .filter((p) => p.featureCode === "ADM1")
    .map((p) => [p.admin1, [p.lat, p.lng]]),
);

const best = (hits) => hits.filter(Boolean).sort((a, b) => a.rank - b.rank)[0];

// Rodrigues lies 560 km east of the main island. Places without a district
// code ("00") are matched only on the right island.
const RODRIGUES = "23";
const sameIsland = (p, admin1) => p.lng > 60 === (admin1 === RODRIGUES);

/** Best place in the district with exactly this (normalised) name. */
function find(name, admin1) {
  return places
    .filter(
      (p) =>
        p.names.has(name) &&
        (p.admin1 === admin1 || (p.admin1 === "00" && sameIsland(p, admin1))) &&
        p.featureClass !== "A",
    )
    .sort((a, b) => a.rank - b.rank || (a.admin1 === admin1 ? -1 : 1))[0];
}

/** Edit distance, for the dataset's typos ("ACCEUIL", "CHANPAGNE"). */
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length];
}

/** A place in the district whose name is one or two typos away. */
function findClose(name, admin1) {
  if (name.length < 6) return undefined;
  const allowed = name.length >= 10 ? 2 : 1;
  let best;
  for (const p of places) {
    if (p.admin1 !== admin1 || p.featureClass === "A") continue;
    for (const candidate of p.names) {
      const d = distance(name, candidate);
      if (
        d <= allowed &&
        (!best || d < best.d || (d === best.d && p.rank < best.p.rank))
      ) {
        best = { d, p };
      }
    }
  }
  return best?.p;
}

/** Spellings to try for a dataset locality, most specific first. */
function variants(locality) {
  const base = normalise(locality.replace(/\(.*?\)/g, " "));
  return [
    ...new Set([
      base,
      base.replace(/\bBAY\b/g, "BAIE"),
      base.replace(/^CENTRAL (.+)/, "CENTRE DE $1"),
      base.replace(/^CITE /, ""),
    ]),
  ].filter(Boolean);
}

/** Shorter runs of the name's words, longest first: "BELLE RIVE CUREPIPE" -> "BELLE RIVE", "RIVE CUREPIPE", ... */
function parts(name) {
  const words = name.split(" ");
  const out = [];
  for (let size = words.length - 1; size >= 1; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const part = words.slice(start, start + size).join(" ");
      // Single short words ("LA", "DE", "CITE") match far too much.
      if (size === 1 && part.length < 5) continue;
      out.push(part);
    }
  }
  return out;
}

const round = (n) => Math.round(n * 1e4) / 1e4;

const localities = JSON.parse(
  readFileSync("src/constants/localities_output.json", "utf8"),
).districts;

const result = {};
const counts = { exact: 0, near: 0, district: 0 };
const fallbacks = [];

for (const [district, names] of Object.entries(localities)) {
  const admin1 = ADMIN1[district];
  if (!admin1) throw new Error(`No GeoNames code for district ${district}`);
  result[district] = {};
  for (const locality of names) {
    let hit;
    let precision = "exact";
    // Every spelling is tried and the best kind of place wins, so "GRAND
    // BAY" finds the town of Grand Baie, not a bay of the same name.
    hit = best(variants(locality).map((name) => find(name, admin1)));
    if (!hit) {
      hit = best(variants(locality).map((name) => findClose(name, admin1)));
    }
    if (!hit) {
      precision = "near";
      const inBrackets = /\((.*?)\)/.exec(locality)?.[1];
      const tries = [
        ...(inBrackets ? [normalise(inBrackets)] : []),
        ...variants(locality).flatMap(parts),
      ];
      for (const name of tries) {
        hit = find(name, admin1);
        if (hit) break;
      }
    }
    if (hit) {
      result[district][locality] = [round(hit.lat), round(hit.lng), precision];
    } else {
      const [lat, lng] = districtCentres[admin1];
      result[district][locality] = [round(lat), round(lng), "district"];
      precision = "district";
      fallbacks.push(`${district}: ${locality}`);
    }
    counts[precision]++;
  }
}

writeFileSync(
  "src/constants/localityCoordinates.json",
  JSON.stringify(result, null, 0).replace(/\],"/g, '],\n"') + "\n",
);
console.log(counts);
if (fallbacks.length)
  console.log("District centre used for:\n" + fallbacks.join("\n"));
