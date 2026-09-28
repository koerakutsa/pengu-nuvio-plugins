/**
 * Videasy — stable fast path (cdn + hdmovie only).
 * No AbortController (broke Hermes). Soft 12s timeout per step.
 * Promise only — no async/await.
 */
var API = 'https://api.speedracelight.com';
var DEC = 'https://enc-dec.app/api/dec-videasy';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var PLAYER = 'https://player.videasy.to';
var SERVERS = ['cdn', 'hdmovie'];
var TIMEOUT_MS = 12000;

function dblEncode(s) {
  return encodeURIComponent(encodeURIComponent(String(s || ''))).replace(/%20/g, '%2520');
}

function softTimeout(promise, ms, fallback) {
  if (fallback === undefined) fallback = null;
  return new Promise(function (resolve) {
    var settled = false;
    var timer = setTimeout(function () {
      if (!settled) {
        settled = true;
        resolve(fallback);
      }
    }, ms);
    promise
      .then(function (value) {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(value);
        }
      })
      .catch(function () {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallback);
        }
      });
  });
}

function qualityLabel(src) {
  var q = String((src && src.quality) || '');
  var u = String((src && src.url) || '');
  var text = (q + ' ' + u).toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  if (text.indexOf('360') >= 0) return '360p';
  if (/hindi|tamil|telugu|english/i.test(q)) return '1080p';
  return '1080p';
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  var url =
    'https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY;
  return softTimeout(
    fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      if (!data) return null;
      return {
        title: (isTv ? data.name : data.title) || '',
        year: String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4),
        imdbId: data.imdb_id || ''
      };
    }),
    TIMEOUT_MS,
    null
  );
}

function getSeed(tmdbId) {
  return softTimeout(
    fetch(API + '/seed?mediaId=' + encodeURIComponent(tmdbId), {
      headers: { Accept: 'application/json', 'User-Agent': UA }
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      if (!data) return null;
      var seed = data.seed || data;
      return typeof seed === 'string' ? seed : null;
    }),
    TIMEOUT_MS,
    null
  );
}

function fetchServer(server, qs, seed, tmdbId) {
  var url = API + '/' + server + '/sources-with-title?' + qs;
  return softTimeout(
    fetch(url, {
      headers: {
        Accept: '*/*',
        'User-Agent': UA,
        Origin: PLAYER,
        Referer: PLAYER + '/'
      }
    })
      .then(function (res) {
        if (!res || !res.ok) return null;
        return res.text();
      })
      .then(function (encData) {
        if (!encData || encData.length < 20) return [];
        return fetch(DEC, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': UA
          },
          body: JSON.stringify({ text: encData, id: Number(tmdbId) || tmdbId, seed: seed })
        })
          .then(function (res) {
            if (!res || !res.ok) return [];
            return res.json();
          })
          .then(function (dec) {
            var sources = ((dec && dec.result) || {}).sources || [];
            var out = [];
            for (var i = 0; i < sources.length; i++) {
              var src = sources[i];
              if (!src || !src.url) continue;
              var streamUrl = String(src.url).trim();
              if (streamUrl.indexOf('http') !== 0) continue;
              var q = qualityLabel(src);
              var lang =
                src.quality && /hindi|tamil|telugu|english|auto/i.test(String(src.quality))
                  ? String(src.quality)
                  : 'Auto';
              out.push({
                name: 'Videasy ' + server + ' · ' + q,
                title: 'Videasy · ' + server + ' · ' + lang + ' · ' + q,
                url: streamUrl,
                quality: q,
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Origin: PLAYER,
                  Referer: PLAYER + '/',
                  Accept: '*/*'
                },
                provider: 'videasy',
                sourceType: streamUrl.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
              });
            }
            return out;
          });
      }),
    TIMEOUT_MS,
    []
  ).then(function (v) {
    return Array.isArray(v) ? v : [];
  });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Videasy] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  var start = Date.now();
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) {
      console.log('[Videasy] bad id');
      return Promise.resolve([]);
    }

    return Promise.all([getTmdbMeta(id, isTv), getSeed(id)])
      .then(function (pair) {
        var meta = pair[0];
        var seed = pair[1];
        if (!meta || !meta.title) {
          console.log('[Videasy] TMDB miss');
          return [];
        }
        if (!seed) {
          console.log('[Videasy] no seed');
          return [];
        }
        console.log('[Videasy] title=' + meta.title + ' seed ok');

        var media = isTv ? 'tv' : 'movie';
        var qs =
          'title=' +
          dblEncode(meta.title) +
          '&mediaType=' +
          media +
          '&year=' +
          encodeURIComponent(meta.year || '') +
          '&tmdbId=' +
          encodeURIComponent(id) +
          '&imdbId=' +
          encodeURIComponent(meta.imdbId || '') +
          '&enc=2&seed=' +
          encodeURIComponent(seed);
        if (isTv) {
          qs +=
            '&seasonId=' +
            encodeURIComponent(String(Number(seasonNum) || 1)) +
            '&episodeId=' +
            encodeURIComponent(String(Number(episodeNum) || 1));
        }

        var jobs = [];
        for (var i = 0; i < SERVERS.length; i++) {
          jobs.push(fetchServer(SERVERS[i], qs, seed, id));
        }

        return Promise.all(jobs).then(function (lists) {
          var streams = [];
          var seen = {};
          for (var a = 0; a < lists.length; a++) {
            var part = lists[a] || [];
            for (var b = 0; b < part.length; b++) {
              var s = part[b];
              if (!s || !s.url) continue;
              var key = s.url.split('?')[0];
              if (seen[key]) continue;
              seen[key] = true;
              streams.push(s);
            }
          }
          var rank = { '2160p': 5, '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
          streams.sort(function (x, y) {
            return (rank[y.quality] || 0) - (rank[x.quality] || 0);
          });
          console.log(
            '[Videasy] → ' + streams.length + ' streams in ' + (Date.now() - start) + 'ms'
          );
          return streams;
        });
      })
      .catch(function (err) {
        console.log('[Videasy] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[Videasy] sync error: ' + (err && err.message ? err.message : err));
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
