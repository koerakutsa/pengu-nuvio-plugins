var CryptoJS = require('crypto-js');
/**
 * MovieBlast v2 — Nuvio plugin
 */
var BASE_URL = 'https://app.cloud-mb.xyz';
var TOKEN = 'jdvhhjv255vghhghdhvfch2565656jhdcghfdf';
var APP_ID = 'com.movieblast';
var SIGN_SECRET = 'GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var HEADERS = { 'user-agent': 'okhttp/5.0.0-alpha.6', 'x-request-x': APP_ID, Accept: 'application/json' };
var SEARCH_HEADERS = Object.assign({}, HEADERS, { hash256: '86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30', packagename: APP_ID });
var STREAM_HEADERS = { Referer: 'MovieBlast', 'User-Agent': 'MovieBlast', 'x-request-x': APP_ID };
function qualityFromText() {
  var text = Array.prototype.slice.call(arguments).filter(Boolean).join(' ').toLowerCase();
  if (/\b(2160p?|4k|uhd)\b/.test(text)) return '2160p';
  if (/\b(1080p?|fhd)\b/.test(text)) return '1080p';
  if (/\b720p?\b/.test(text)) return '720p';
  if (/\b480p?\b/.test(text)) return '480p';
  if (/\b360p?\b/.test(text)) return '360p';
  return 'Unknown';
}
function sizeFromText() {
  var text = Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
  var m = text.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
  return m ? m[1] + ' ' + m[2].toUpperCase() : undefined;
}
function generateSignedUrl(urlStr) {
  try {
    var url = new URL(urlStr);
    var path = url.pathname;
    var timestamp = Math.floor(Date.now() / 1e3).toString();
    var hash = CryptoJS.HmacSHA256(path + timestamp, SIGN_SECRET);
    var signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    var sep = urlStr.indexOf('?') >= 0 ? '&' : '?';
    return urlStr + sep + 'verify=' + timestamp + '-' + signature;
  } catch (e) { return urlStr; }
}
function fetchJson(url, headers, timeoutMs) {
  timeoutMs = timeoutMs || 12000;
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, timeoutMs);
  return fetch(url, { headers: headers, signal: ctrl.signal })
    .then(function (res) { if (!res.ok) return null; return res.json(); })
    .catch(function () { return null; })
    .then(function (data) { clearTimeout(t); return data; });
}
function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  return fetchJson('https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY, { Accept: 'application/json' }).then(function (data) {
    if (!data) return null;
    var title = (isTv ? data.name : data.title) || '';
    var year = String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4);
    var original = (isTv ? data.original_name : data.original_title) || title;
    return { title: title, original: original, year: year };
  });
}
function scoreResult(item, meta) {
  var name = String(item.title || item.name || '').toLowerCase();
  var want = (meta.title || '').toLowerCase();
  var orig = (meta.original || '').toLowerCase();
  if (!name) return 0;
  var score = 0;
  if (name === want || name === orig) score += 80;
  else if (name.indexOf(want) >= 0 || want.indexOf(name) >= 0) score += 50;
  else {
    var tokens = want.split(/[^a-z0-9]+/).filter(function (t) { return t.length > 2; });
    if (tokens.length) {
      var hits = 0;
      for (var i = 0; i < tokens.length; i++) if (name.indexOf(tokens[i]) >= 0) hits++;
      score += Math.round((hits / tokens.length) * 40);
    }
  }
  if (meta.year && String(item.year || item.release_date || '').indexOf(meta.year) >= 0) score += 20;
  return score;
}
function pickBestMatch(results, meta) {
  if (!Array.isArray(results) || !results.length) return null;
  var best = null, bestScore = -1;
  for (var i = 0; i < results.length; i++) {
    var sc = scoreResult(results[i], meta);
    if (sc > bestScore) { bestScore = sc; best = results[i]; }
  }
  if (bestScore < 20 && results.length > 1) return null;
  return best;
}
function getStreams(tmdbId, mediaType, season, episode) {
  mediaType = mediaType || 'movie';
  season = season || '1';
  episode = episode || '1';
  var start = Date.now();
  var isTv = mediaType === 'tv' || mediaType === 'series';
  var id = String(tmdbId || '').trim();
  if (!/^\d+$/.test(id)) {
    console.log('[MovieBlast] expected numeric TMDB id, got: ' + id);
    return Promise.resolve([]);
  }
  return getTmdbMeta(id, isTv).then(function (meta) {
    if (!meta || !meta.title) {
      console.log('[MovieBlast] TMDB miss for ' + id);
      return [];
    }
    var queries = [];
    if (meta.title) queries.push(meta.title);
    if (meta.original && meta.original !== meta.title) queries.push(meta.original);
    function searchNext(qi) {
      if (qi >= queries.length) return Promise.resolve(null);
      var searchUrl = BASE_URL + '/api/search/' + encodeURIComponent(queries[qi]) + '/' + TOKEN;
      return fetchJson(searchUrl, SEARCH_HEADERS).then(function (searchData) {
        var results = (searchData && searchData.search) || [];
        var match = pickBestMatch(results, meta);
        if (match) return match;
        return searchNext(qi + 1);
      });
    }
    return searchNext(0).then(function (match) {
      if (!match || !match.id) {
        console.log('[MovieBlast] no search hit for "' + meta.title + '"');
        return [];
      }
      var detailPath = isTv ? 'series/show' : 'media/detail';
      var detailUrl = BASE_URL + '/api/' + detailPath + '/' + match.id + '/' + TOKEN;
      return fetchJson(detailUrl, HEADERS).then(function (detailData) {
        if (!detailData) return [];
        var videos = [];
        if (isTv) {
          var seasons = detailData.seasons || [];
          var sNum = Number(season) || 1;
          var eNum = Number(episode) || 1;
          var targetSeason = null;
          for (var si = 0; si < seasons.length; si++) {
            if (Number(seasons[si].season_number) === sNum) { targetSeason = seasons[si]; break; }
          }
          var eps = (targetSeason && targetSeason.episodes) || [];
          for (var ei = 0; ei < eps.length; ei++) {
            if (Number(eps[ei].episode_number) === eNum) { videos = eps[ei].videos || []; break; }
          }
        } else {
          videos = detailData.videos || [];
        }
        var streams = [];
        var seen = {};
        for (var vi = 0; vi < videos.length; vi++) {
          var vid = videos[vi];
          var raw = vid && vid.link;
          if (!raw) continue;
          var httpsUrl = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
          var signedUrl = generateSignedUrl(httpsUrl);
          var key = signedUrl.split('?')[0];
          if (seen[key]) continue;
          seen[key] = true;
          var label = String(vid.server || vid.quality || vid.label || 'Server');
          var quality = qualityFromText(label, httpsUrl);
          var size = sizeFromText(label);
          var bits = ['MovieBlast', quality];
          if (size) bits.push(size);
          var entry = {
            name: 'MovieBlast ' + quality,
            title: bits.join(' · '),
            url: signedUrl,
            quality: quality,
            headers: Object.assign({}, STREAM_HEADERS),
            sourceType: /\.m3u8(\?|$)/i.test(httpsUrl) ? 'hls' : 'video'
          };
          if (size) entry.size = size;
          streams.push(entry);
        }
        var rank = { '2160p': 5, '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
        streams.sort(function (a, b) { return (rank[b.quality] || 0) - (rank[a.quality] || 0); });
        console.log('[MovieBlast] "' + meta.title + '" → ' + streams.length + ' streams in ' + (Date.now() - start) + 'ms');
        return streams;
      });
    });
  }).catch(function (err) {
    console.log('[MovieBlast] error: ' + (err && err.message || err));
    return [];
  });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams };
} else if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
}
