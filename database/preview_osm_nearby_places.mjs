#!/usr/bin/env node

const SOURCE = "OpenStreetMap / Nominatim / Overpass";
const SOURCE_DATE = new Date().toISOString().slice(0, 10);
const USER_AGENT = "universiteatlasi-osm-preview/1.0";
const CATEGORY_LIMIT = 6;

const universities = [
  { id: 241176, name: "KONYA GIDA VE TARIM ÜNİVERSİTESİ", lat: 37.8746284, lng: 32.4739562, radiusMeters: 3000 },
  { id: 339979, name: "KONYA TEKNİK ÜNİVERSİTESİ", lat: 38.0063993, lng: 32.5152564, radiusMeters: 3500 },
  { id: 166433, name: "KTO KARATAY ÜNİVERSİTESİ", lat: 37.8648232, lng: 32.5369246, radiusMeters: 3000 },
  { id: 173500, name: "NECMETTİN ERBAKAN ÜNİVERSİTESİ", lat: 37.8641078, lng: 32.4155536, radiusMeters: 3000 },
  { id: 123902, name: "SELÇUK ÜNİVERSİTESİ", lat: 38.0242069, lng: 32.5057052, radiusMeters: 3500 },
];

const categories = ["food", "cafe", "dormitory", "market", "transport", "library"];

function buildQuery({ lat, lng, radiusMeters }) {
  const node = (selector) => `node(around:${radiusMeters},${lat},${lng})${selector};`;
  const way = (selector) => `way(around:${radiusMeters},${lat},${lng})${selector};`;
  const selectors = [
    "[amenity=cafe]",
    "[amenity=restaurant]",
    "[amenity=fast_food]",
    "[amenity=food_court]",
    "[amenity=dormitory]",
    "[tourism=hostel]",
    "[amenity=library]",
    "[shop=supermarket]",
    "[shop=convenience]",
    "[shop=bakery]",
    "[shop=pastry]",
  ];

  return `[out:json][timeout:30];(${selectors.flatMap((selector) => [node(selector), way(selector)]).join("")}${node("[highway=bus_stop]")});out center 160;`;
}

function category(tags) {
  if (tags.amenity === "cafe") return "cafe";
  if (["restaurant", "fast_food", "food_court"].includes(tags.amenity)) return "food";
  if (tags.amenity === "dormitory" || tags.tourism === "hostel") return "dormitory";
  if (["supermarket", "convenience", "bakery", "pastry"].includes(tags.shop)) return "market";
  if (tags.highway === "bus_stop") return "transport";
  if (tags.amenity === "library") return "library";
  return null;
}

function distanceMeters(aLat, aLng, bLat, bLng) {
  const earth = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function fetchOverpass(university) {
  const body = new URLSearchParams({ data: buildQuery(university) });
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body,
  });
  if (!response.ok) throw new Error(`Overpass HTTP ${response.status} for ${university.name}`);
  return response.json();
}

function normalize(university, json) {
  const byNameCategory = new Map();
  for (const element of json.elements ?? []) {
    if (!element.tags?.name) continue;
    const lat = Number(element.lat ?? element.center?.lat);
    const lng = Number(element.lon ?? element.center?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const placeCategory = category(element.tags);
    if (!placeCategory) continue;

    const place = {
      name: element.tags.name,
      category: placeCategory,
      lat,
      lng,
      distanceMeters: distanceMeters(university.lat, university.lng, lat, lng),
      source: SOURCE,
      sourceDate: SOURCE_DATE,
      externalId: `${element.type}/${element.id}`,
    };

    const key = `${place.name}|${place.category}`;
    const previous = byNameCategory.get(key);
    if (!previous || place.distanceMeters < previous.distanceMeters) {
      byNameCategory.set(key, place);
    }
  }

  const places = [];
  for (const placeCategory of categories) {
    places.push(
      ...[...byNameCategory.values()]
        .filter((place) => place.category === placeCategory)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, CATEGORY_LIMIT),
    );
  }
  return places.sort((a, b) => a.category.localeCompare(b.category) || a.distanceMeters - b.distanceMeters);
}

const result = [];
for (const university of universities) {
  const json = await fetchOverpass(university);
  result.push({
    universityId: university.id,
    universityName: university.name,
    lat: university.lat,
    lng: university.lng,
    radiusMeters: university.radiusMeters,
    source: SOURCE,
    sourceDate: SOURCE_DATE,
    confidence: "PILOT",
    places: normalize(university, json),
  });
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), universities: result }, null, 2));
