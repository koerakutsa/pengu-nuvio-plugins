/**
 * VidSrc ME.ru — data.vidsrcme.ru + ChaCha20 WASM decrypt + host JWT.
 * On device JWT matches device IP (no Vercel proxy needed).
 * Promise only — no async/await.
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
  var bin = atob(s);
  var u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function originOf(url) {
  try {
    var m = String(url).match(/^(https?:\/\/[^\/]+)/i);
    return m ? m[1] : '';
  } catch (e) {
    return '';
  }
}

function applyToken(url, token) {
  if (!token) return url;
  if (url.indexOf('__TOKEN__') >= 0) return url.split('__TOKEN__').join(token);
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(token);
}

function getWasmModule(wasmUrl) {
  if (wasmCache[wasmUrl]) return wasmCache[wasmUrl];
  var p = fetch(wasmUrl, {
    headers: { Accept: '*/*', 'User-Agent': UA }
  })
    .then(function (res) {
      if (!res || !res.ok) throw new Error('wasm_http');
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return WebAssembly.compile(buf);
    });
  wasmCache[wasmUrl] = p;
  return p;
}

function decryptStreamUrls(encB64, vs) {
  if (!vs || (!vs.wasm_url && !vs.wasm)) {
    return Promise.resolve([]);
  }
  var load = vs.wasm_url
    ? getWasmModule(vs.wasm_url)
    : WebAssembly.compile(b64ToBytes(vs.wasm));
  return load
    .then(function (mod) {
      return WebAssembly.instantiate(mod, {});
    })
    .then(function (inst) {
      var ex = inst.exports;
      var enc = b64ToBytes(encB64);
      var ptr = ex.alloc(enc.length);
      new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
      var outLen = ex.decrypt(ptr, enc.length);
      var text = new TextDecoder().decode(
        new Uint8Array(ex.memory.buffer, ptr + 12, outLen)
      );
      return text
        .split('\n')
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return /^https?:\/\//i.test(s);
        });
    })
    .catch(function (err) {
      console.log('[VidSrcME] wasm fail: ' + (err && err.message ? err.message : err));
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
  qs += '&stream_urls';
  return fetch(DATA_API + '?' + qs, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
      Referer: REFERER
    }
  })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    if (typeof WebAssembly === 'undefined') {
      console.log('[VidSrcME] no WebAssembly');
      return Promise.resolve([]);
    }
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!id) return Promise.resolve([]);

    return fetchPayload(id, isTv, seasonNum, episodeNum)
      .then(function (json) {
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
        } else if (typeof raw === 'string' && raw.length > 0) {
          urlsP = decryptStreamUrls(raw, json.vs);
        } else {
          urlsP = Promise.resolve([]);
        }

        return urlsP.then(function (urls) {
          if (!urls || !urls.length) {
            console.log('[VidSrcME] empty urls');
            return [];
          }

          // Tokens per origin in parallel
          var origins = {};
          for (var i = 0; i < urls.length; i++) {
            origins[originOf(urls[i])] = true;
          }
          var originList = Object.keys(origins);
          var tokenJobs = originList.map(function (o) {
            return fetchHostToken(o).then(function (t) {
              return { origin: o, token: t };
            });
          });

          return Promise.all(tokenJobs).then(function (pairs) {
            var tokenMap = {};
            for (var j = 0; j < pairs.length; j++) {
              tokenMap[pairs[j].origin] = pairs[j].token || '';
            }
            var streams = [];
            for (var k = 0; k < urls.length; k++) {
              var o = originOf(urls[k]);
              var finalUrl = applyToken(urls[k], tokenMap[o]);
              var label = urls.length <= 1 ? 'Auto' : 'S' + (k + 1);
              streams.push({
                name: 'VidSrcME · ' + label,
                title: (json.data.title || 'VidSrcME') + ' · ' + label,
                url: finalUrl,
                quality: '1080p',
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Referer: REFERER,
                  Origin: ORIGIN,
                  Accept: '*/*'
                },
                provider: 'vidsrcme',
                sourceType: 'hls'
              });
            }
            console.log('[VidSrcME] → ' + streams.length + ' streams');
            return streams;
          });
        });
      })
      .catch(function (err) {
        console.log('[VidSrcME] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[VidSrcME] sync error: ' + (err && err.message ? err.message : err));
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
