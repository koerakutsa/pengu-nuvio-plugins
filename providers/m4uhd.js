/**
 * M4uHD — prefers VidSrcME pipeline (same as vidsrcme.js) for reliability.
 * Optional site scrape only when CF allows. Promise only.
 */
var DATA_API = 'https://data.vidsrcme.ru/api.php';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
var REFERER = 'https://cloudorchestranova.com/';
var ORIGIN = 'https://cloudorchestranova.com';
var TMDB_KEY = '68e094699525b18a70bab2f86b1fa706';
var STREAM_HEADERS = {
  'User-Agent': UA,
  Referer: REFERER,
  Origin: ORIGIN,
  Accept: '*/*'
};
var wasmCache = {};

function b64ToBytes(s) {
  var bin = atob(String(s || ''));
  var u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function decodeUtf8(u8) {
  try {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(u8);
  } catch (e) {}
  var out = '';
  for (var i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i]);
  return out;
}
function originOf(url) {
  var m = String(url || '').match(/^(https?:\/\/[^\/]+)/i);
  return m ? m[1] : '';
}
function applyToken(url, token) {
  if (!token) return url;
  return url + (String(url).indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(token);
}

function getWasmInstance(wasmUrl) {
  if (wasmCache[wasmUrl]) return wasmCache[wasmUrl];
  var p = fetch(wasmUrl, {
    headers: { Accept: '*/*', 'User-Agent': UA, Referer: REFERER, Origin: ORIGIN }
  })
    .then(function (res) {
      if (!res || !res.ok) throw new Error('wasm_http');
      return res.arrayBuffer();
    })
    .then(function (buf) {
      if (!buf || !buf.byteLength) throw new Error('wasm_empty');
      return WebAssembly.instantiate(buf, {});
    })
    .then(function (result) {
      if (result && result.exports) return result;
      if (result && result.instance) return result.instance;
      throw new Error('wasm_shape');
    });
  wasmCache[wasmUrl] = p;
  return p;
}

function decryptUrls(encB64, vs) {
  if (!vs || !vs.wasm_url) return Promise.resolve([]);
  return getWasmInstance(String(vs.wasm_url))
    .then(function (inst) {
      var ex = inst.exports;
      var enc = b64ToBytes(encB64);
      var ptr = ex.alloc(enc.length);
      new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
      var outLen = ex.decrypt(ptr, enc.length);
      var text = decodeUtf8(new Uint8Array(ex.memory.buffer, ptr + 12, outLen));
      return text
        .split('\n')
        .map(function (s) {
          return String(s).trim();
        })
        .filter(function (s) {
          return /^https?:\/\//i.test(s);
        });
    })
    .catch(function (err) {
      console.log('[M4uHD] decrypt fail: ' + (err && err.message));
      return [];
    });
}

function fetchToken(origin) {
  if (!origin) return Promise.resolve('');
  return fetch(origin + '/generate.php', {
    headers: {
      'User-Agent': UA,
      Referer: REFERER,
      Origin: ORIGIN,
      Accept: 'text/plain,*/*'
    }
  })
    .then(function (res) {
      return res && res.ok ? res.text() : '';
    })
    .then(function (t) {
      return String(t || '').trim();
    })
    .catch(function () {
      return '';
    });
}

function getImdbIfNeeded(tmdbId, isTv) {
  if (/^tt\d+$/i.test(String(tmdbId))) return Promise.resolve(String(tmdbId));
  var ep = isTv ? 'tv' : 'movie';
  return fetch(
    'https://api.themoviedb.org/3/' +
      ep +
      '/' +
      tmdbId +
      '?api_key=' +
      TMDB_KEY +
      '&append_to_response=external_ids',
    { headers: { Accept: 'application/json' } }
  )
    .then(function (res) {
      return res && res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (!data) return String(tmdbId);
      return (
        (data.external_ids && data.external_ids.imdb_id) ||
        data.imdb_id ||
        String(tmdbId)
      );
    })
    .catch(function () {
      return String(tmdbId);
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[M4uHD] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    if (typeof WebAssembly === 'undefined') {
      console.log('[M4uHD] no WebAssembly');
      return Promise.resolve([]);
    }
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!id) return Promise.resolve([]);

    // Prefer IMDb for this backend when available
    return getImdbIfNeeded(id, isTv).then(function (mediaId) {
      var qs =
        'type=' +
        (isTv ? 'tv' : 'movie') +
        '&' +
        (/^tt\d+$/i.test(mediaId)
          ? 'imdb=' + encodeURIComponent(mediaId)
          : 'tmdb=' + encodeURIComponent(mediaId));
      if (isTv) {
        qs +=
          '&season=' +
          encodeURIComponent(String(Number(seasonNum) || 1)) +
          '&episode=' +
          encodeURIComponent(String(Number(episodeNum) || 1));
      }
      qs += '&stream_urls';

      return fetch(DATA_API + '?' + qs, {
        headers: {
          'User-Agent': UA,
          Accept: 'application/json',
          Referer: REFERER,
          Origin: ORIGIN
        }
      })
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json();
        })
        .then(function (json) {
          if (!json || String(json.status_code) !== '200' || !json.data) {
            console.log('[M4uHD] no data');
            return [];
          }
          var raw = json.data.stream_urls;
          if (typeof raw !== 'string' || raw.length < 8) {
            console.log('[M4uHD] no stream_urls');
            return [];
          }
          return decryptUrls(raw, json.vs).then(function (urls) {
            if (!urls.length) return [];
            var o = originOf(urls[0]);
            return fetchToken(o).then(function (token) {
              var streams = [];
              for (var i = 0; i < urls.length; i++) {
                streams.push({
                  name: 'M4uHD · S' + (i + 1),
                  title: (json.data.title || 'M4uHD') + ' · S' + (i + 1),
                  url: applyToken(urls[i], token),
                  quality: '1080p',
                  size: 'Unknown',
                  headers: STREAM_HEADERS,
                  provider: 'm4uhd',
                  sourceType: 'hls'
                });
              }
              console.log('[M4uHD] → ' + streams.length);
              return streams;
            });
          });
        });
    }).catch(function (err) {
      console.log('[M4uHD] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[M4uHD] sync: ' + (err && err.message ? err.message : err));
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
