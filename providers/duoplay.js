/**
 * DuoPlay (Eesti) — supports duoplay:ID from static catalogs OR TMDB title match.
 * Hermes-safe: Promise only.
 */
var API = 'https://tigu.kanal2.ee/duoplay/ee/et';
var SITE = 'https://duoplay.ee';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

var JSON_HEADERS = {
  Accept: 'application/json',
  'User-Agent': UA,
  Referer: SITE + '/',
  Origin: SITE
};
var HTML_HEADERS = {
  Accept: 'text/html,application/xhtml+xml',
  'User-Agent': UA,
  Referer: SITE + '/'
};

function decodeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/\\\//g, '/');
}

function normTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/["'«»„“']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(itemTitle, want, year) {
  var a = normTitle(itemTitle);
  var b = normTitle(want);
  if (!a || !b) return 0;
  var score = 0;
  if (a === b) score += 100;
  else if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) score += 70;
  else {
    var tokens = b.split(/[^a-z0-9äöüõšž]+/i).filter(function (t) {
      return t.length > 2;
    });
    var hits = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (a.indexOf(tokens[i]) >= 0) hits++;
    }
    if (tokens.length) score += Math.round((hits / tokens.length) * 50);
  }
  if (year && String(itemTitle).indexOf(String(year)) >= 0) score += 10;
  return score;
}

function extractStreamUrl(html) {
  var marker = 'router.euddn.net';
  var at = html.indexOf(marker);
  if (at < 0) return null;
  var start = html.lastIndexOf('https', at);
  if (start < 0) start = html.lastIndexOf('http', at);
  if (start < 0) return null;
  var end = html.indexOf('.m3u8', at);
  if (end < 0) return null;
  var quote = html.indexOf('&quot;', end + 5);
  var plain = html.indexOf('"', end + 5);
  var stop = -1;
  if (quote >= 0 && plain >= 0) stop = Math.min(quote, plain);
  else if (quote >= 0) stop = quote;
  else stop = plain;
  var raw = html.slice(start, stop < 0 ? end + 5 : stop);
  return decodeHtml(raw.replace(/\\\//g, '/'));
}

function pageTitle(html) {
  var m = html.match(/class="view-show__headline[^>]*>\s*([^<]+)/i);
  if (m) return decodeHtml(m[1]).trim();
  var og = html.match(/property="og:title" content="([^"]+)"/i);
  if (og) return decodeHtml(og[1]).trim();
  return 'DuoPlay';
}

function fetchJson(url) {
  return fetch(url, { headers: JSON_HEADERS })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function fetchHtml(path) {
  return fetch(SITE + path, { headers: HTML_HEADERS })
    .then(function (res) {
      if (!res || !res.ok) return '';
      return res.text();
    })
    .catch(function () {
      return '';
    });
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  return fetchJson(
    'https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY
  ).then(function (data) {
    if (!data) return null;
    return {
      title: (isTv ? data.name : data.title) || '',
      original: (isTv ? data.original_name : data.original_title) || '',
      year: String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4)
    };
  });
}

function findDuoId(meta, isTv) {
  var queries = [];
  if (meta.title) queries.push(meta.title);
  if (meta.original && meta.original !== meta.title) queries.push(meta.original);

  function trySearch(qi) {
    if (qi >= queries.length) return tryListPages();
    var q = encodeURIComponent(queries[qi]);
    return fetchJson(API + '/telecasts/search?q=' + q + '&page=1&limit=30').then(function (data) {
      var rows = (data && data.data) || [];
      if (!rows.length) return trySearch(qi + 1);
      var best = null;
      var bestScore = -1;
      for (var i = 0; i < rows.length; i++) {
        var cat = String(rows[i].category || '').toLowerCase();
        if (isTv && cat === 'movies') continue;
        if (!isTv && (cat === 'shows' || cat === 'series')) continue;
        var sc = scoreMatch(rows[i].title, meta.title, meta.year);
        if (meta.original) sc = Math.max(sc, scoreMatch(rows[i].title, meta.original, meta.year));
        if (sc > bestScore) {
          bestScore = sc;
          best = rows[i];
        }
      }
      if (best && bestScore >= 50) return String(best.id);
      return trySearch(qi + 1);
    });
  }

  function tryListPages() {
    var path = isTv ? '/telecasts' : '/telecasts/movies';
    var pages = [1, 2, 3, 4, 5];
    var jobs = [];
    for (var p = 0; p < pages.length; p++) {
      jobs.push(
        fetchJson(API + path + '?page=' + pages[p] + '&limit=100').then(function (data) {
          return (data && data.data) || [];
        })
      );
    }
    return Promise.all(jobs).then(function (lists) {
      var best = null;
      var bestScore = -1;
      for (var a = 0; a < lists.length; a++) {
        var rows = lists[a] || [];
        for (var i = 0; i < rows.length; i++) {
          var sc = scoreMatch(rows[i].title, meta.title, meta.year);
          if (meta.original) sc = Math.max(sc, scoreMatch(rows[i].title, meta.original, meta.year));
          if (sc > bestScore) {
            bestScore = sc;
            best = rows[i];
          }
        }
      }
      if (best && bestScore >= 55) {
        console.log('[DuoPlay] list match score=' + bestScore + ' id=' + best.id);
        return String(best.id);
      }
      console.log('[DuoPlay] no match (best=' + bestScore + ')');
      return null;
    });
  }

  return trySearch(0);
}

function registerSession(manifestUrl) {
  return fetch('https://sts.euddn.net/session/register', {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': UA,
      Referer: SITE + '/',
      Origin: SITE,
      'X-Original-URI': manifestUrl
    }
  })
    .then(function (res) {
      if (!res) return null;
      return res.json().catch(function () {
        return null;
      });
    })
    .then(function (data) {
      var session = data && data.session ? String(data.session) : '';
      if (/^[a-f0-9]{64}$/i.test(session)) {
        var sep = manifestUrl.indexOf('?') >= 0 ? '&' : '?';
        return manifestUrl + sep + 's=' + session;
      }
      return null;
    })
    .catch(function () {
      return null;
    });
}

function streamFromDuoId(duoId) {
  var path = '/' + duoId;
  return fetchHtml(path).then(function (html) {
    if (!html) {
      console.log('[DuoPlay] empty HTML');
      return [];
    }
    var manifest = extractStreamUrl(html);
    if (!manifest) {
      console.log('[DuoPlay] no m3u8 in HTML');
      return [];
    }
    if (manifest.indexOf('http') !== 0) {
      manifest = 'https://' + manifest.replace(/^\/\//, '');
    }
    console.log('[DuoPlay] manifest ok');
    return registerSession(manifest).then(function (signed) {
      var playUrl = signed || manifest;
      var title = pageTitle(html);
      return [
        {
          name: 'DuoPlay · HLS',
          title: title + ' · DuoPlay · EE',
          url: playUrl,
          quality: '1080p',
          size: 'Unknown',
          headers: {
            'User-Agent': UA,
            Referer: SITE + '/',
            Origin: SITE
          },
          provider: 'duoplay',
          sourceType: 'hls'
        }
      ];
    });
  });
}

function parseId(raw) {
  var s = String(raw || '').trim();
  var m = s.match(/duoplay:(\d+)/i);
  if (m) return { kind: 'duo', id: m[1] };
  s = s.replace(/^tmdb:/i, '').trim();
  if (/^\d+$/.test(s)) return { kind: 'tmdb', id: s };
  return { kind: 'none', id: '' };
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[DuoPlay] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var parsed = parseId(tmdbId);

    if (parsed.kind === 'duo') {
      console.log('[DuoPlay] direct id=' + parsed.id);
      return streamFromDuoId(parsed.id).catch(function (err) {
        console.log('[DuoPlay] error: ' + (err && err.message ? err.message : err));
        return [];
      });
    }

    if (parsed.kind !== 'tmdb') {
      console.log('[DuoPlay] skip non-tmdb/non-duo id: ' + tmdbId);
      return Promise.resolve([]);
    }

    return getTmdbMeta(parsed.id, isTv)
      .then(function (meta) {
        if (!meta || !meta.title) {
          console.log('[DuoPlay] TMDB miss');
          return [];
        }
        console.log('[DuoPlay] title=' + meta.title);
        return findDuoId(meta, isTv).then(function (duoId) {
          if (!duoId) return [];
          return streamFromDuoId(duoId);
        });
      })
      .catch(function (err) {
        console.log('[DuoPlay] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[DuoPlay] sync error: ' + (err && err.message ? err.message : err));
    return Promise.resolve([]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
}
if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
}
if (typeof global !== 'undefined') {
  global.getStreams = getStreams;
}
