/**
 * DuoPlay — duoplay:ID, duoplay:ID:ep:N, bare numeric, or TMDB title match.
 */
var API = 'https://tigu.kanal2.ee/duoplay/ee/et';
var SITE = 'https://duoplay.ee';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
var JSON_HEADERS = { Accept: 'application/json', 'User-Agent': UA, Referer: SITE + '/', Origin: SITE };
var HTML_HEADERS = { Accept: 'text/html,application/xhtml+xml', 'User-Agent': UA, Referer: SITE + '/' };

function decodeHtml(value) {
  return String(value || '')
    .replace(/"/g, '"')
    .replace(/&/g, '&')
    .replace(/&#039;|'/g, "'")
    .replace(/\\\//g, '/');
}
function normTitle(s) {
  return String(s || '').toLowerCase().replace(/["'«»„“']/g, '').replace(/\s+/g, ' ').trim();
}
function scoreMatch(itemTitle, want, year) {
  var a = normTitle(itemTitle), b = normTitle(want);
  if (!a || !b) return 0;
  var score = 0;
  if (a === b) score += 100;
  else if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) score += 70;
  else {
    var tokens = b.split(/[^a-z0-9äöüõšž]+/i).filter(function (t) { return t.length > 2; });
    var hits = 0;
    for (var i = 0; i < tokens.length; i++) if (a.indexOf(tokens[i]) >= 0) hits++;
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
  var quote = html.indexOf('"', end + 5);
  var plain = html.indexOf('"', end + 5);
  var stop = -1;
  if (quote >= 0 && plain >= 0) stop = Math.min(quote, plain);
  else if (quote >= 0) stop = quote;
  else stop = plain;
  return decodeHtml(html.slice(start, stop < 0 ? end + 5 : stop).replace(/\\\//g, '/'));
}
function pageTitle(html) {
  var m = html.match(/class="view-show__headline[^>]*>\s*([^<]+)/i);
  if (m) return decodeHtml(m[1]).trim();
  var og = html.match(/property="og:title" content="([^"]+)"/i);
  if (og) return decodeHtml(og[1]).trim();
  return 'DuoPlay';
}
function fetchJson(url) {
  return fetch(url, { headers: JSON_HEADERS }).then(function (res) {
    if (!res || !res.ok) return null;
    return res.json();
  }).catch(function () { return null; });
}
function fetchHtml(path) {
  return fetch(SITE + path, { headers: HTML_HEADERS }).then(function (res) {
    if (!res || !res.ok) return '';
    return res.text();
  }).catch(function () { return ''; });
}
function getTmdbMeta(tmdbId, isTv) {
  return fetchJson('https://api.themoviedb.org/3/' + (isTv ? 'tv' : 'movie') + '/' + tmdbId + '?api_key=' + TMDB_KEY).then(function (data) {
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
    return fetchJson(API + '/telecasts/search?q=' + encodeURIComponent(queries[qi]) + '&page=1&limit=30').then(function (data) {
      var rows = (data && data.data) || [];
      if (!rows.length) return trySearch(qi + 1);
      var best = null, bestScore = -1;
      for (var i = 0; i < rows.length; i++) {
        var cat = String(rows[i].category || '').toLowerCase();
        if (isTv && cat === 'movies') continue;
        if (!isTv && (cat === 'shows' || cat === 'series')) continue;
        var sc = scoreMatch(rows[i].title, meta.title, meta.year);
        if (meta.original) sc = Math.max(sc, scoreMatch(rows[i].title, meta.original, meta.year));
        if (sc > bestScore) { bestScore = sc; best = rows[i]; }
      }
      if (best && bestScore >= 50) return String(best.id);
      return trySearch(qi + 1);
    });
  }
  function tryListPages() {
    var path = isTv ? '/telecasts' : '/telecasts/movies';
    var jobs = [1, 2, 3, 4, 5].map(function (p) {
      return fetchJson(API + path + '?page=' + p + '&limit=100').then(function (d) {
        return (d && d.data) || [];
      });
    });
    return Promise.all(jobs).then(function (lists) {
      var best = null, bestScore = -1;
      for (var a = 0; a < lists.length; a++) {
        for (var i = 0; i < lists[a].length; i++) {
          var sc = scoreMatch(lists[a][i].title, meta.title, meta.year);
          if (meta.original) sc = Math.max(sc, scoreMatch(lists[a][i].title, meta.original, meta.year));
          if (sc > bestScore) { bestScore = sc; best = lists[a][i]; }
        }
      }
      if (best && bestScore >= 55) return String(best.id);
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
        return manifestUrl + (manifestUrl.indexOf('?') >= 0 ? '&' : '?') + 's=' + session;
      }
      return null;
    })
    .catch(function () {
      return null;
    });
}
function streamFromDuoId(duoId, epNum) {
  var path = '/' + duoId;
  if (epNum && epNum > 0) path += '?ep=' + epNum;
  return fetchHtml(path).then(function (html) {
    if (!html) {
      console.log('[DuoPlay] empty HTML id=' + duoId + ' ep=' + epNum);
      return [];
    }
    var manifest = extractStreamUrl(html);
    if (!manifest) {
      console.log('[DuoPlay] no m3u8 id=' + duoId + ' ep=' + epNum);
      return [];
    }
    if (manifest.indexOf('http') !== 0) manifest = 'https://' + manifest.replace(/^\/\//, '');
    return registerSession(manifest).then(function (signed) {
      var title = pageTitle(html);
      if (epNum && epNum > 0) title += ' · E' + epNum;
      return [
        {
          name: 'DuoPlay · HLS',
          title: title + ' · DuoPlay · EE',
          url: signed || manifest,
          quality: '1080p',
          size: 'Unknown',
          headers: { 'User-Agent': UA, Referer: SITE + '/', Origin: SITE },
          provider: 'duoplay',
          sourceType: 'hls'
        }
      ];
    });
  });
}
function normalizeRaw(raw) {
  var s = String(raw || '').trim();
  if (s.indexOf('/') >= 0) {
    var parts = s.split('/');
    s = parts[parts.length - 1] || s;
  }
  try { s = decodeURIComponent(s); } catch (e) {}
  try { s = decodeURIComponent(s); } catch (e2) {}
  s = s.replace(/\.json$/i, '').trim();
  return s;
}
function parseId(raw) {
  var s = normalizeRaw(raw);
  var m = s.match(/duoplay:(\d+)(?::ep:(\d+)|:(\d+):(\d+)|:(\d+))?/i);
  if (m) {
    var ep = 0;
    if (m[2]) ep = parseInt(m[2], 10);
    else if (m[4]) ep = parseInt(m[4], 10);
    else if (m[5]) ep = parseInt(m[5], 10);
    return { kind: 'duo', id: m[1], ep: ep || 0 };
  }
  s = s.replace(/^(?:tmdb(?::(?:tv|movie))?|tt|imdb):/i, '').trim();
  var m2 = s.match(/^(\d{1,6})(?::(\d+):(\d+))?$/);
  if (m2) return { kind: 'duo-or-tmdb', id: m2[1], ep: m2[3] ? parseInt(m2[3], 10) : 0 };
  if (/^\d+$/.test(s)) return { kind: 'tmdb', id: s, ep: 0 };
  return { kind: 'none', id: '', ep: 0 };
}
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[DuoPlay] getStreams raw=', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var parsed = parseId(tmdbId);
    var epFromArgs = episodeNum ? parseInt(episodeNum, 10) : 0;
    if (!epFromArgs || isNaN(epFromArgs)) epFromArgs = 0;
    console.log('[DuoPlay] parsed=', parsed.kind, parsed.id, 'ep=', parsed.ep || epFromArgs);

    if (parsed.kind === 'duo') {
      var ep = parsed.ep || epFromArgs;
      return streamFromDuoId(parsed.id, ep).catch(function (err) {
        console.log('[DuoPlay] error: ' + (err && err.message ? err.message : err));
        return [];
      });
    }

    if (parsed.kind === 'duo-or-tmdb') {
      return streamFromDuoId(parsed.id, epFromArgs)
        .then(function (streams) {
          if (streams && streams.length) return streams;
          return getTmdbMeta(parsed.id, isTv).then(function (meta) {
            if (!meta || !meta.title) return [];
            return findDuoId(meta, isTv).then(function (duoId) {
              return duoId ? streamFromDuoId(duoId, epFromArgs) : [];
            });
          });
        })
        .catch(function (err) {
          console.log('[DuoPlay] error: ' + (err && err.message ? err.message : err));
          return [];
        });
    }

    if (parsed.kind !== 'tmdb') {
      console.log('[DuoPlay] skip id');
      return Promise.resolve([]);
    }

    return getTmdbMeta(parsed.id, isTv)
      .then(function (meta) {
        if (!meta || !meta.title) {
          if (parsed.id.length <= 6) return streamFromDuoId(parsed.id, epFromArgs);
          return [];
        }
        return findDuoId(meta, isTv).then(function (duoId) {
          return duoId ? streamFromDuoId(duoId, epFromArgs) : [];
        });
      })
      .catch(function (err) {
        console.log('[DuoPlay] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[DuoPlay] sync: ' + (err && err.message ? err.message : err));
    return Promise.resolve([]);
  }
}
if (typeof module !== 'undefined' && module.exports) module.exports = { getStreams: getStreams };
if (typeof globalThis !== 'undefined') globalThis.getStreams = getStreams;
if (typeof global !== 'undefined') global.getStreams = getStreams;
