/**
 * VidSrc ME.ru — API + WASM decrypt + host JWT.
 * Fixes Hermes: WebAssembly.instantiate result shape, TextDecoder polyfill.
 */
var DATA_API = 'https://data.vidsrcme.ru/api.php';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
var REFERER = 'https://cloudorchestranova.com/';
var ORIGIN = 'https://cloudorchestranova.com';
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
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(u8);
    }
  } catch (e) {}
  var out = '';
  for (var i = 0; i < u8.length; i++) out += String.fromCharCode(u8[i]);
  try {
    return decodeURIComponent(escape(out));
  } catch (e2) {
    return out;
  }
}

function originOf(url) {
  var m = String(url || '').match(/^(https?:\/\/[^\/]+)/i);
  return m ? m[1] : '';
}

function applyToken(url, token) {
  if (!token) return url;
  if (String(url).indexOf('__TOKEN__') >= 0) {
    return String(url).split('__TOKEN__').join(token);
  }
  return url + (String(url).indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(token);
}

function getWasmInstance(wasmUrl) {
  if (wasmCache[wasmUrl]) return wasmCache[wasmUrl];
  var p = fetch(wasmUrl, {
    headers: {
      Accept: '*/*',
      'User-Agent': UA,
      Referer: REFERER,
      Origin: ORIGIN
    }
  })
    .then(function (res) {
      if (!res || !res.ok) throw new Error('wasm_http_' + (res && res.status));
      return res.arrayBuffer();
    })
    .then(function (buf) {
      if (!buf || !buf.byteLength) throw new Error('wasm_empty');
      // Prefer instantiate(buffer) — returns {instance, module}
      return WebAssembly.instantiate(buf, {});
    })
    .then(function (result) {
      // Hermes/Node shape: Instance OR { instance }
      if (result && result.exports) return result;
      if (result && result.instance && result.instance.exports) return result.instance;
      throw new Error('wasm_no_instance');
    });
  wasmCache[wasmUrl] = p;
  return p;
}

function decryptStreamUrls(encB64, vs) {
  if (!vs || !vs.wasm_url) return Promise.resolve([]);
  return getWasmInstance(String(vs.wasm_url))
    .then(function (inst) {
      var ex = inst.exports;
      if (!ex || typeof ex.alloc !== 'function' || typeof ex.decrypt !== 'function') {
        throw new Error('wasm_exports');
      }
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
      console.log('[VidSrcME] decrypt fail: ' + (err && err.message ? err.message : err));
      return [];
    });
}

function fetchHostToken(origin) {
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
      if (!res || !res.ok) return '';
      return res.text();
    })
    .then(function (text) {
      text = String(text || '').trim();
      if (!text || text.charAt(0) === '<') return '';
      if (text.charAt(0) === '{') {
        try {
          var j = JSON.parse(text);
          return String(j.token || j.data || j.string || j.result || '');
        } catch (e) {
          return '';
        }
      }
      return text;
    })
    .catch(function () {
      return '';
    });
}

function fetchPayload(id, isTv, season, episode) {
  var qs =
    'type=' +
    (isTv ? 'tv' : 'movie') +
    '&' +
    (/^tt\d+$/i.test(id) ? 'imdb=' + encodeURIComponent(id) : 'tmdb=' + encodeURIComponent(id));
  if (isTv) {
    qs +=
      '&season=' +
      encodeURIComponent(String(Number(season) || 1)) +
      '&episode=' +
      encodeURIComponent(String(Number(episode) || 1));
  }
  // bare key like the site: &stream_urls
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
      if (!res || !res.ok) {
        console.log('[VidSrcME] api HTTP ' + (res && res.status));
        return null;
      }
      return res.json();
    })
    .catch(function (err) {
      console.log('[VidSrcME] api err ' + (err && err.message));
      return null;
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    if (typeof WebAssembly === 'undefined' || typeof WebAssembly.instantiate !== 'function') {
      console.log('[VidSrcME] WebAssembly not available in this runtime');
      return Promise.resolve([]);
    }
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!id) return Promise.resolve([]);

    return fetchPayload(id, isTv, seasonNum, episodeNum).then(function (json) {
      if (!json || String(json.status_code || '') !== '200' || !json.data) {
        console.log('[VidSrcME] no data');
        return [];
      }
      var raw = json.data.stream_urls;
      var urlsP;
      if (Array.isArray(raw)) {
        urlsP = Promise.resolve(
          raw.filter(function (u) {
            return typeof u === 'string' && /^https?:\/\//i.test(u);
          })
        );
      } else if (typeof raw === 'string' && raw.length > 8) {
        urlsP = decryptStreamUrls(raw, json.vs);
      } else {
        urlsP = Promise.resolve([]);
      }

      return urlsP.then(function (urls) {
        if (!urls || !urls.length) {
          console.log('[VidSrcME] empty urls after decrypt');
          return [];
        }
        var origins = {};
        for (var i = 0; i < urls.length; i++) origins[originOf(urls[i])] = true;
        var originList = Object.keys(origins);
        return Promise.all(
          originList.map(function (o) {
            return fetchHostToken(o).then(function (t) {
              return { origin: o, token: t || '' };
            });
          })
        ).then(function (pairs) {
          var tokenMap = {};
          for (var j = 0; j < pairs.length; j++) {
            tokenMap[pairs[j].origin] = pairs[j].token;
          }
          var streams = [];
          for (var k = 0; k < urls.length; k++) {
            var o = originOf(urls[k]);
            streams.push({
              name: 'VidSrcME · S' + (k + 1),
              title: (json.data.title || 'VidSrcME') + ' · S' + (k + 1),
              url: applyToken(urls[k], tokenMap[o]),
              quality: '1080p',
              size: 'Unknown',
              headers: STREAM_HEADERS,
              provider: 'vidsrcme',
              sourceType: 'hls'
            });
          }
          console.log('[VidSrcME] → ' + streams.length);
          return streams;
        });
      });
    }).catch(function (err) {
      console.log('[VidSrcME] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[VidSrcME] sync: ' + (err && err.message ? err.message : err));
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
