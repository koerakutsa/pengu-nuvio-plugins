/**
 * Vidrock — AES-256-GCM decrypt, same CDN family as VidZee (Atlas = ngcorp.dad).
 * Hermes-safe: Promise + WebCrypto subtle only (no async/await).
 */
var API = 'https://vidrock.net';
var KEY_HEX = '7f3e9c2a8b5d1f4e6a9c3b7d2e5f8a1c4b6d9e2f5a8c1b4d7e9f2a5c8b1d4e7f';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var HEADERS = {
  'User-Agent': UA,
  Accept: 'application/json, text/plain, */*',
  Referer: API + '/',
  Origin: API
};
var PLAY_HEADERS = {
  'User-Agent': UA,
  Referer: API + '/',
  Origin: API
};

function hexToBytes(hex) {
  var out = new Uint8Array(hex.length / 2);
  for (var i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return out;
}

function b64urlToBytes(payload) {
  var std = String(payload).replace(/-/g, '+').replace(/_/g, '/');
  while (std.length % 4 !== 0) std += '=';
  var bin = atob(std);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function getSubtle() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      return globalThis.crypto.subtle;
    }
    if (typeof crypto !== 'undefined' && crypto.subtle) return crypto.subtle;
  } catch (e) {}
  return null;
}

function decryptUrl(payload) {
  var sub = getSubtle();
  if (!sub || !payload) return Promise.resolve(null);
  try {
    var data = b64urlToBytes(payload);
    if (data.length <= 12) return Promise.resolve(null);
    var nonce = data.slice(0, 12);
    var ct = data.slice(12);
    var keyBytes = hexToBytes(KEY_HEX);
    return sub
      .importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
      .then(function (key) {
        return sub.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, key, ct);
      })
      .then(function (plain) {
        var text = new TextDecoder().decode(new Uint8Array(plain));
        if (text.indexOf('http') === 0) return text;
        return null;
      })
      .catch(function () {
        return null;
      });
  } catch (e) {
    return Promise.resolve(null);
  }
}

function qualityFromUrl(url) {
  var u = String(url || '').toLowerCase();
  if (u.indexOf('2160') >= 0 || u.indexOf('4k') >= 0) return '2160p';
  if (u.indexOf('1080') >= 0) return '1080p';
  if (u.indexOf('720') >= 0) return '720p';
  if (u.indexOf('480') >= 0) return '480p';
  return '1080p';
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Vidrock] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    if (!getSubtle()) {
      console.log('[Vidrock] WebCrypto subtle missing — cannot decrypt');
      return Promise.resolve([]);
    }
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) return Promise.resolve([]);

    var path = isTv
      ? '/api/tv/' +
        encodeURIComponent(id) +
        '/' +
        encodeURIComponent(String(Number(seasonNum) || 1)) +
        '/' +
        encodeURIComponent(String(Number(episodeNum) || 1))
      : '/api/movie/' + encodeURIComponent(id);

    // Also try underscore form used by some builds
    var pathAlt = isTv
      ? '/api/tv/' +
        encodeURIComponent(
          id +
            '_' +
            String(Number(seasonNum) || 1) +
            '_' +
            String(Number(episodeNum) || 1)
        )
      : null;

    function fetchJson(p) {
      return fetch(API + p, { headers: HEADERS })
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json();
        })
        .catch(function () {
          return null;
        });
    }

    return fetchJson(path)
      .then(function (data) {
        if (data) return data;
        if (pathAlt) return fetchJson(pathAlt);
        return null;
      })
      .then(function (data) {
        if (!data || typeof data !== 'object') {
          console.log('[Vidrock] no data');
          return [];
        }
        var servers = Object.keys(data);
        var jobs = [];
        for (var i = 0; i < servers.length; i++) {
          (function (server) {
            var obj = data[server];
            var enc = obj && typeof obj === 'object' ? obj.url : obj;
            if (!enc || typeof enc !== 'string') return;
            jobs.push(
              decryptUrl(enc).then(function (url) {
                if (!url) return null;
                var lang =
                  obj && typeof obj === 'object' && obj.language
                    ? obj.language
                    : 'Auto';
                var q = qualityFromUrl(url);
                return {
                  name: 'Vidrock ' + server + ' · ' + q,
                  title: 'Vidrock · ' + server + ' · ' + lang + ' · ' + q,
                  url: url,
                  quality: q,
                  size: 'Unknown',
                  headers: {
                    'User-Agent': UA,
                    Referer: API + '/',
                    Origin: API
                  },
                  provider: 'vidrock',
                  sourceType: url.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video',
                  _server: server
                };
              })
            );
          })(servers[i]);
        }
        if (!jobs.length) return [];
        return Promise.all(jobs).then(function (list) {
          var streams = [];
          var seen = {};
          // Prefer Atlas/Orion (fast CDNs) first
          var order = { Atlas: 0, Orion: 1, Luna: 2, Astra: 3, Nova: 4 };
          list = list.filter(Boolean);
          list.sort(function (a, b) {
            return (order[a._server] != null ? order[a._server] : 9) -
              (order[b._server] != null ? order[b._server] : 9);
          });
          for (var j = 0; j < list.length; j++) {
            var s = list[j];
            var key = s.url.split('?')[0];
            if (seen[key]) continue;
            seen[key] = true;
            delete s._server;
            streams.push(s);
          }
          console.log('[Vidrock] → ' + streams.length + ' streams');
          return streams;
        });
      })
      .catch(function (err) {
        console.log('[Vidrock] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[Vidrock] sync error: ' + (err && err.message ? err.message : err));
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
