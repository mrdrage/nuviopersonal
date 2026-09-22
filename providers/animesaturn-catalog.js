/**
 * AnimeSaturn catalog matcher for Eclipse/Nuvio.
 *
 * This provider only matches TMDB content to AnimeSaturn catalog pages and
 * verifies episode presence. It does not resolve or extract AnimeSaturn video
 * players or third-party host streams.
 *
 * To make the match visible inside Eclipse, a harmless public MP4 test clip is
 * returned when a catalog match is confirmed.
 */

const cheerio = require("cheerio");

const BASE_URL = "https://www.animesaturn.net";
const TEST_VIDEO = "https://cdn.truefilesize.com/mp4/sample-1mb.mp4";

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(ita\)/g, "")
    .replace(/season\s*/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenScore(a, b) {
  const aa = new Set(normalizeTitle(a).split(/\s+/).filter(Boolean));
  const bb = new Set(normalizeTitle(b).split(/\s+/).filter(Boolean));
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  for (const token of aa) if (bb.has(token)) common += 1;
  return common / Math.max(aa.size, bb.size);
}

function candidateScore(candidateTitle, baseTitle, season) {
  const c = normalizeTitle(candidateTitle);
  const b = normalizeTitle(baseTitle);
  let score = tokenScore(candidateTitle, baseTitle) * 100;

  if (c === b) score += 45;
  if (c.startsWith(b) || b.startsWith(c)) score += 20;

  if (season && season > 1) {
    const seasonTokens = [
      ` ${season}`,
      ` s${season}`,
      ` ${season}nd`,
      ` ${season}rd`,
      ` ${season}th`
    ];
    if (seasonTokens.some((t) => c.includes(t.trim()))) score += 18;
  }

  return score;
}

async function fetchText(url, options) {
  const response = await fetch(url, options || {});
  if (!response || !response.ok) {
    throw new Error(`HTTP ${response ? response.status : "?"} for ${url}`);
  }
  return await response.text();
}

async function titleFromWikidata(tmdbId, mediaType) {
  const property = mediaType === "movie" ? "P4947" : "P4983";
  const sparql = `
    SELECT ?item ?itemLabel WHERE {
      ?item wdt:${property} "${String(tmdbId).replace(/[^0-9]/g, "")}".
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,it,ja". }
    }
    LIMIT 1
  `;

  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
  const text = await fetchText(url, {
    headers: {
      "Accept": "application/sparql-results+json"
    }
  });
  const json = JSON.parse(text);
  const row = json && json.results && json.results.bindings && json.results.bindings[0];
  return row && row.itemLabel && row.itemLabel.value ? row.itemLabel.value : null;
}

async function searchAnimeSaturn(query) {
  const url = `${BASE_URL}/filter/1?key=${encodeURIComponent(query)}`;
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const results = [];

  $(".ac.group").each((_, element) => {
    const el = $(element);
    const title = el.find("h3").first().text().trim();
    let href = el.attr("href") || "";
    if (!title || !href) return;
    if (!/^https?:\/\//i.test(href)) href = BASE_URL + href;
    results.push({ title, url: href });
  });

  return results;
}

async function chooseBestMatch(baseTitle, season) {
  const queries = [];
  if (season && season > 1) {
    queries.push(`${baseTitle} ${season}`);
    queries.push(`${baseTitle} Season ${season}`);
  }
  queries.push(baseTitle);

  const seen = new Map();
  for (const query of queries) {
    try {
      const results = await searchAnimeSaturn(query);
      for (const result of results) {
        const old = seen.get(result.url);
        const score = candidateScore(result.title, baseTitle, season);
        if (!old || score > old.score) seen.set(result.url, { ...result, score });
      }
    } catch (error) {
      console.warn(`AnimeSaturn search failed for ${query}: ${error}`);
    }
  }

  const ranked = Array.from(seen.values()).sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

async function inspectCatalogPage(match, episode) {
  const html = await fetchText(match.url);
  const $ = cheerio.load(html);

  const pageTitle = $("h1").first().text().trim() || match.title;
  const episodes = [];
  $("a.ep-tile").each((_, element) => {
    const text = $(element).text().trim();
    if (text) episodes.push(text);
  });

  let episodeFound = true;
  if (episode != null) {
    const requested = String(Number(episode));
    episodeFound = episodes.some((value) => {
      const n = String(Number(String(value).replace(/[^0-9.]/g, "")));
      return n === requested;
    });
  }

  return {
    title: pageTitle,
    episodeFound,
    episodeCountVisible: episodes.length
  };
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const title = await titleFromWikidata(tmdbId, mediaType);
    if (!title) {
      console.warn(`No Wikidata title for TMDB ${tmdbId}`);
      return [];
    }

    const match = await chooseBestMatch(title, season);
    if (!match || match.score < 45) {
      console.warn(`No confident AnimeSaturn catalog match for ${title}`);
      return [];
    }

    const info = await inspectCatalogPage(match, episode);
    if (!info.episodeFound) {
      console.warn(`AnimeSaturn match found but episode ${episode} is not listed: ${info.title}`);
      return [];
    }

    const episodeLabel = episode != null ? ` • Ep ${episode}` : "";
    const seasonLabel = season != null ? ` • S${season}` : "";
    const dubbed = /\(ita\)/i.test(match.title);

    console.log(`AnimeSaturn catalog match: ${title} -> ${match.title} -> ${match.url}`);

    return [
      {
        title: `AnimeSaturn catalog ✓ • ${info.title}${seasonLabel}${episodeLabel}`,
        name: "Catalog match only • demo playback",
        url: TEST_VIDEO,
        quality: "CATALOG",
        language: dubbed ? "it" : "ja",
        provider: "animesaturn-catalog",
        type: "mp4"
      }
    ];
  } catch (error) {
    console.error(`AnimeSaturn catalog provider error: ${error}`);
    return [];
  }
}

module.exports = { getStreams };
