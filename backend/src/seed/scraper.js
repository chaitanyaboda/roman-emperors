const axios = require('axios');
const cheerio = require('cheerio');

const WIKI_BASE = 'https://en.wikipedia.org';
const LIST_URL = `${WIKI_BASE}/wiki/List_of_Roman_emperors`;
const LIMIT = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseYear(str) {
  if (!str) return null;
  const cleaned = str.replace(/c\.\s*/i, '').replace(/fl\.\s*/i, '').trim();
  // "27 BC" or "63 BC"
  const bcMatch = cleaned.match(/(\d+)\s*BC/i);
  if (bcMatch) return -parseInt(bcMatch[1], 10);
  // "AD 14" or "AD 284"
  const adExplicit = cleaned.match(/AD\s*(\d+)/i);
  if (adExplicit) return parseInt(adExplicit[1], 10);
  // Prefer 3-4 digit numbers (years), fallback to any number
  const yearNums = [...cleaned.matchAll(/\b(\d{3,4})\b/g)];
  if (yearNums.length) return parseInt(yearNums[yearNums.length - 1][1], 10);
  const allNums = [...cleaned.matchAll(/\b(\d{1,4})\b/g)];
  if (allNums.length) return parseInt(allNums[allNums.length - 1][1], 10);
  return null;
}

function parseReignDates(text) {
  // e.g. "16 January 27 BC – 19 August AD 14" or "69–79"
  const clean = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
  // Split on en-dash, em-dash, or hyphen
  const parts = clean.split(/\s*[–—]\s*/);
  return {
    reignStart: parseYear(parts[0] || ''),
    reignEnd: parseYear(parts[1] || ''),
  };
}

function parseBirthDeath(text) {
  // e.g. "23 September 63 BC – 19 August AD 14\n(aged 75)\nDied..."
  // Take only the first line (before age/description)
  const firstLine = text.replace(/\[.*?\]/g, '').split(/\n/)[0].trim();
  const parts = firstLine.split(/\s*[–—]\s*/);
  return {
    birthYear: parseYear(parts[0] || ''),
    deathYear: parseYear(parts[1] || ''),
  };
}

async function fetchEmperorDetail(url) {
  try {
    await delay(400 + Math.random() * 400);
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'RomanEmperorsTimeline/1.0 (educational project)' },
    });
    const $ = cheerio.load(res.data);

    // Image: first image in infobox
    let imageUrl = null;
    const infoboxImg = $('.infobox img, .infobox-image img').first();
    if (infoboxImg.length) {
      const src = infoboxImg.attr('src');
      if (src) imageUrl = src.startsWith('//') ? `https:${src}` : src;
    }

    // Summary: first substantive paragraph
    let summary = null;
    const content = $('#mw-content-text .mw-parser-output');
    content.children('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 80 && !summary) {
        summary = text.replace(/\[\d+\]/g, '').trim();
      }
    });

    return { imageUrl, summary };
  } catch (err) {
    console.warn(`  Warning: could not fetch detail for ${url}: ${err.message}`);
    return { imageUrl: null, summary: null };
  }
}

async function scrapeEmperors() {
  console.log('Fetching list of Roman emperors from Wikipedia...');
  const res = await axios.get(LIST_URL, {
    timeout: 15000,
    headers: { 'User-Agent': 'RomanEmperorsTimeline/1.0 (educational project)' },
  });
  const $ = cheerio.load(res.data);

  const emperors = [];

  $('table.wikitable').each((tableIdx, table) => {
    // Get dynasty from the table's caption or preceding heading
    let dynasty = 'Unknown';
    const captionRaw = $(table).find('caption').text().trim();
    // Strip inline CSS blocks like ".mw-parser-output .sr-only{...}"
    const caption = captionRaw.replace(/\.[^{]+\{[^}]+\}/g, '').replace(/emperors?/i, '').replace(/dynasty/i, '').trim();
    if (caption && caption.length > 2 && caption.length < 60) {
      dynasty = caption;
    } else {
      // Walk backwards through siblings to find h2/h3
      let node = $(table)[0].previousSibling;
      while (node) {
        if (node.type === 'tag' && (node.name === 'h2' || node.name === 'h3')) {
          dynasty = $(node).find('.mw-headline').text().trim() || dynasty;
          break;
        }
        node = node.previousSibling;
      }
    }

    $(table).find('tr').each((_, row) => {
      // Name is in a <th scope="row"> element within the row
      const th = $(row).find('th[scope="row"]');
      if (!th.length) return;

      const nameLink = th.find('a').first();
      const name = nameLink.text().trim() || th.text().trim().split('\n')[0].trim();
      if (!name || name.length < 2) return;

      const wikiHref = nameLink.attr('href');
      // Skip non-article links (files, categories, etc.)
      if (wikiHref && (wikiHref.includes('File:') || wikiHref.includes('Category:'))) return;
      const wikipediaUrl = wikiHref ? `${WIKI_BASE}${wikiHref}` : null;

      const tds = $(row).find('td');
      // td[0] = portrait image, td[1] = reign dates, td[2] = notes, td[3] = birth/death
      let reignStart = null, reignEnd = null, birthYear = null, deathYear = null;

      if (tds.length >= 2) {
        // Reign text e.g. "16 January 27 BC – 19 August AD 14"
        const reignText = tds.eq(1).text().replace(/\(.*?\)/gs, '').trim();
        const parsed = parseReignDates(reignText);
        reignStart = parsed.reignStart;
        reignEnd = parsed.reignEnd;
      }

      if (tds.length >= 4) {
        // Birth/death text e.g. "23 September 63 BC – 19 August AD 14"
        const bdText = tds.eq(3).text().replace(/\(.*?\)/gs, '').replace(/\[.*?\]/g, '').trim();
        const parsed = parseBirthDeath(bdText);
        birthYear = parsed.birthYear;
        deathYear = parsed.deathYear;
      }

      emperors.push({ name, reignStart, reignEnd, birthYear, deathYear, dynasty, wikipediaUrl });
    });
  });

  // Deduplicate by name
  const seen = new Set();
  const unique = emperors.filter((e) => {
    if (!e.name || seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });

  // Filter to those with valid reign dates (real emperors)
  const valid = unique.filter(e => e.reignStart !== null || e.wikipediaUrl);

  const limited = valid.slice(0, LIMIT);
  console.log(`Found ${unique.length} emperors, seeding first ${limited.length}...`);

  const results = [];
  for (let i = 0; i < limited.length; i++) {
    const emp = limited[i];
    console.log(`  [${i + 1}/${limited.length}] ${emp.name}`);
    let detail = { imageUrl: null, summary: null };
    if (emp.wikipediaUrl) {
      detail = await fetchEmperorDetail(emp.wikipediaUrl);
    }
    results.push({
      name: emp.name,
      birth_year: emp.birthYear,
      death_year: emp.deathYear,
      reign_start: emp.reignStart,
      reign_end: emp.reignEnd,
      dynasty: emp.dynasty,
      wikipedia_url: emp.wikipediaUrl,
      image_url: detail.imageUrl,
      summary: detail.summary ? detail.summary.slice(0, 1000) : null,
    });
  }

  return results;
}

module.exports = { scrapeEmperors };
