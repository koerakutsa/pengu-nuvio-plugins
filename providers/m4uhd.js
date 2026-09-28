/**
 * M4uHD — search → watch → ajax → 9stream AES-GCM OR VidSrcME fallback.
 * Promise only. WebCrypto for AES-GCM.
 */
var BASE = 'https://ww1.m4uhd.page';
var DATA_API = 'https://data.vidsrcme.ru/api.php';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
var TMDB_KEY = '68e094699525b18a70bab2f86b1fa706';
var REFERER_VS = 'https://cloudorchestranova.com/';
var ORIGIN_VS = 'https://cloudorchestranova.com';

var NINE = {
  fileKey: '7bd30d612d2bb1bda34743f8608e68c1',
  fileIv: 'v3M9zQ2pX7k1',
  userKey: '7bd30d612d2bb1bda34743f8608e68c2',
  userIv: 'v3M9zQ2pX7k2',
  payloadKey: '7bd30d612d2bb1bda34743f8608e68c3',
  payloadIv: 'v3M9zQ2pX7k3'
};

var wasmCache = {};

function teEncode(str) {
  return new TextEncoder().encode(str);
}
function b64ToBytes(s) {
  var bin = atob(s);
  var u = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function bytesToB64(u8) {
  var s = '';
  for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function originOf(url) {
  try {
    var m = String(url).match(/^(https?:\/\/[^\/]+)/i);
    return m ? m[1] : '';
  } catch (e) {
    return '';
  }
}
function hostOf(url) {
  try {
    var m = String(url).match(/^https?:\/\/([^\/]+)/i);
    return m ? m[1] : '';
  } catch (e) {
    return '';
  }
}
function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function aesGcmDecrypt(b64Cipher, keyStr, ivStr) {
  return crypto.subtle
    .importKey('raw', teEncode(keyStr), { name: 'AES-GCM' }, false, ['decrypt'])
    .then(function (key) {
      return crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: teEncode(ivStr) },
        key,
        b64ToBytes(b64Cipher)
      );
    })
    .then(function (pt) {
      return new TextDecoder().decode(pt);
    });
}

function aesGcmEncrypt(plainStr, keyStr, ivStr) {
  return crypto.subtle
    .importKey('raw', teEncode(keyStr), { name: 'AES-GCM' }, false, ['encrypt'])
    .then(function (key) {
      return crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: teEncode(ivStr) },
        key,
        teEncode(plainStr)
      );
    })
    .then(function (ct) {
      return bytesToB64(new Uint8Array(ct));
    });
}

function getTmdbMeta(tmdbId, isTv) {
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
      if (!res || !res.ok) return null;
      return res.json();
    })
    .then(function (data) {
      if (!data) return null;
      return {
        title: (isTv ? data.name : data.title) || '',
        year: String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4),
        imdbId:
          (data.external_ids && data.external_ids.imdb_id) || data.imdb_id || '',
        tmdbId: String(tmdbId)
      };
    })
    .catch(function () {
      return null;
    });
}

function parseCsrf(html) {
  var m =
    html.match(/name=["']_token["']\s+value=["']([^"']+)["']/) ||
    html.match(/["']_token["']\s*:\s*["']([^"']+)["']/);
  return m ? m[1] : '';
}

function parseServers(html) {
  var out = [];
  var re = /data-m4u=["']([^"']+)["'][^>]*>\s*([^<]+)/gi;
  var m;
  while ((m = re.exec(html))) {
    out.push({ data: m[1], name: String(m[2]).trim() });
  }
  if (!out.length) {
    re = /["']m4u["']\s*:\s*["']([^"']+)["'][^}]*["']name["']\s*:\s*["']([^"']+)["']/gi;
    while ((m = re.exec(html))) {
      out.push({ data: m[1], name: m[2] });
    }
  }
  return out;
}

function searchWatchUrl(title, year, isTv) {
  var slug = slugify(title);
  var candidates = [];
  if (year) candidates.push(BASE + '/search/' + slug + '-' + year + '.html');
  candidates.push(BASE + '/search/' + slug + '.html');

  function tryOne(i) {
    if (i >= candidates.length) return Promise.resolve(null);
    return fetch(candidates[i], {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html',
        Referer: BASE + '/'
      }
    })
      .then(function (res) {
        if (!res || !res.ok) return tryOne(i + 1);
        return res.text().then(function (html) {
          if (/just a moment|cf-browser-verification|challenge-platform/i.test(html)) {
            console.log('[M4uHD] CF challenge on search');
            return tryOne(i + 1);
          }
          var re = /href=["']([^"']*watch-(?:movie|tvseries|tvshow|series)[^"']*)["']/gi;
          var best = null;
          var bestScore = -1;
          var m;
          while ((m = re.exec(html))) {
            var href = m[1];
            var low = href.toLowerCase();
            var sc = 0;
            if (isTv && /watch-tv/.test(low)) sc += 40;
            if (!isTv && /watch-movie/.test(low)) sc += 40;
            if (year && low.indexOf(year) >= 0) sc += 30;
            if (low.indexOf(slug) >= 0) sc += 30;
            if (sc > bestScore) {
              bestScore = sc;
              best = href.indexOf('http') === 0 ? href : BASE + '/' + href.replace(/^\//, '');
            }
          }
          if (best && bestScore >= 40) return best;
          return tryOne(i + 1);
        });
      })
      .catch(function () {
        return tryOne(i + 1);
      });
  }
  return tryOne(0);
}

function is9StreamEmbed(url) {
  return /9str|ppzj-youtube|if9\./i.test(String(url || ''));
}

function resolve9Stream(embedUrl, serverName) {
  return fetch(embedUrl, {
    headers: {
      'User-Agent': UA,
      Referer: BASE + '/',
      Accept: 'text/html'
    }
  })
    .then(function (res) {
      if (!res || !res.ok) return [];
      return res.text();
    })
    .then(function (html) {
      var fileEnc = (html.match(/idfile_enc\s*=\s*["']([^"']+)["']/) || [])[1];
      var userEnc = (html.match(/idUser_enc\s*=\s*["']([^"']+)["']/) || [])[1];
      var domainApi =
        (html.match(/DOMAIN_API\s*=\s*["']([^"']+)["']/) || [])[1] ||
        'https://api-play-9str.ppzj-youtube.cfd/api/getplay';
      if (!fileEnc || !userEnc) return [];
      if (!crypto || !crypto.subtle) return [];

      return Promise.all([
        aesGcmDecrypt(fileEnc, NINE.fileKey, NINE.fileIv),
        aesGcmDecrypt(userEnc, NINE.userKey, NINE.userIv)
      ]).then(function (ids) {
        var idfile = ids[0];
        var iduser = ids[1];
        var domainPlay = hostOf(embedUrl) || 'if9.ppzj-youtube.cfd';
        var payload = JSON.stringify({
          idfile: idfile,
          iduser: iduser,
          domain_play: domainPlay,
          unixTimestamp: Math.floor(Date.now() / 1000)
        });
        return aesGcmEncrypt(payload, NINE.payloadKey, NINE.payloadIv).then(
          function (enc) {
            return fetch(domainApi, {
              method: 'POST',
              headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json,*/*',
                Referer: originOf(embedUrl) + '/',
                Origin: originOf(embedUrl) || 'https://if9.ppzj-youtube.cfd'
              },
              body: 'data=' + encodeURIComponent(enc)
            })
              .then(function (res) {
                return res.text();
              })
              .then(function (apiText) {
                var playlist = null;
                try {
                  var j = JSON.parse(apiText);
                  playlist =
                    j.file ||
                    j.url ||
                    j.playlist ||
                    j.link ||
                    j.src ||
                    (j.data && j.data.file) ||
                    (j.data && j.data.url) ||
                    null;
                } catch (e) {
                  if (/^https?:\/\//i.test(String(apiText).trim())) {
                    playlist = String(apiText).trim();
                  }
                }
                if (!playlist || playlist.indexOf('http') !== 0) return [];
                return [
                  {
                    name: 'M4uHD · ' + (serverName || '#NM') + ' · 1080p',
                    title: 'M4uHD · 1080p',
                    url: playlist,
                    quality: '1080p',
                    size: 'Unknown',
                    headers: {
                      'User-Agent': UA,
                      Referer: originOf(embedUrl) + '/',
                      Origin: originOf(embedUrl),
                      Accept: '*/*'
                    },
                    provider: 'm4uhd',
                    sourceType: 'hls'
                  }
                ];
              });
          }
        );
      });
    })
    .catch(function () {
      return [];
    });
}

/* ---- VidSrcME fallback (shared pipeline) ---- */
function getWasmModule(wasmUrl) {
  if (wasmCache[wasmUrl]) return wasmCache[wasmUrl];
  var p = fetch(wasmUrl, { headers: { Accept: '*/*', 'User-Agent': UA } })
    .then(function (res) {
      if (!res || !res.ok) throw new Error('wasm');
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return WebAssembly.compile(buf);
    });
  wasmCache[wasmUrl] = p;
  return p;
}

function decryptUrls(encB64, vs) {
  if (!vs || !vs.wasm_url) return Promise.resolve([]);
  return getWasmModule(vs.wasm_url)
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
    .catch(function () {
      return [];
    });
}

function vidsrcFallback(id, isTv, season, episode) {
  if (typeof WebAssembly === 'undefined') return Promise.resolve([]);
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
      Referer: REFERER_VS
    }
  })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .then(function (json) {
      if (!json || String(json.status_code) !== '200' || !json.data) return [];
      var raw = json.data.stream_urls;
      var urlsP =
        typeof raw === 'string'
          ? decryptUrls(raw, json.vs)
          : Promise.resolve(Array.isArray(raw) ? raw : []);
      return urlsP.then(function (urls) {
        if (!urls.length) return [];
        var origin = originOf(urls[0]);
        return fetch(origin + '/generate.php', {
          headers: {
            'User-Agent': UA,
            Referer: REFERER_VS,
            Origin: ORIGIN_VS,
            Accept: 'text/plain,*/*'
          }
        })
          .then(function (res) {
            return res.ok ? res.text() : '';
          })
          .then(function (token) {
            token = String(token || '').trim();
            var streams = [];
            for (var i = 0; i < urls.length; i++) {
              var u = urls[i];
              if (token) u += (u.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(token);
              streams.push({
                name: 'M4uHD · BackUp · S' + (i + 1),
                title: 'M4uHD · VidSrc fallback',
                url: u,
                quality: '1080p',
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Referer: REFERER_VS,
                  Origin: ORIGIN_VS,
                  Accept: '*/*'
                },
                provider: 'm4uhd',
                sourceType: 'hls'
              });
            }
            return streams;
          });
      });
    })
    .catch(function () {
      return [];
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[M4uHD] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
      return Promise.resolve([]);
    }

    return getTmdbMeta(id, isTv).then(function (meta) {
      if (!meta || !meta.title) {
        return vidsrcFallback(id, isTv, seasonNum, episodeNum);
      }
      console.log('[M4uHD] title=' + meta.title);

      return searchWatchUrl(meta.title, meta.year, isTv).then(function (watchUrl) {
        if (!watchUrl) {
          console.log('[M4uHD] no watch page → fallback');
          return vidsrcFallback(meta.imdbId || id, isTv, seasonNum, episodeNum);
        }
        return fetch(watchUrl, {
          headers: {
            'User-Agent': UA,
            Accept: 'text/html',
            Referer: BASE + '/'
          }
        })
          .then(function (res) {
            if (!res || !res.ok) return '';
            return res.text();
          })
          .then(function (html) {
            if (!html || /cf-browser-verification|just a moment/i.test(html)) {
              console.log('[M4uHD] CF on watch');
              return vidsrcFallback(meta.imdbId || id, isTv, seasonNum, episodeNum);
            }
            var token = parseCsrf(html);
            var servers = parseServers(html);
            if (!servers.length || !token) {
              return vidsrcFallback(meta.imdbId || id, isTv, seasonNum, episodeNum);
            }
            // Prefer #NM first
            servers.sort(function (a, b) {
              var an = /nm/i.test(a.name) ? 0 : 1;
              var bn = /nm/i.test(b.name) ? 0 : 1;
              return an - bn;
            });
            var server = servers[0];
            var body =
              'm4u=' +
              encodeURIComponent(server.data) +
              '&_token=' +
              encodeURIComponent(token);
            return fetch(BASE + '/ajax', {
              method: 'POST',
              headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: watchUrl,
                Origin: BASE
              },
              body: body
            })
              .then(function (res) {
                return res.ok ? res.text() : '';
              })
              .then(function (ajaxHtml) {
                var iframe = (ajaxHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i) ||
                  [])[1];
                if (iframe && is9StreamEmbed(iframe)) {
                  return resolve9Stream(iframe, server.name).then(function (s) {
                    if (s.length) return s;
                    return vidsrcFallback(
                      meta.imdbId || id,
                      isTv,
                      seasonNum,
                      episodeNum
                    );
                  });
                }
                return vidsrcFallback(
                  meta.imdbId || id,
                  isTv,
                  seasonNum,
                  episodeNum
                );
              });
          });
      });
    }).catch(function (err) {
      console.log('[M4uHD] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[M4uHD] sync error: ' + (err && err.message ? err.message : err));
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
