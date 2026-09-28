/**
 * Videasy — FAST path: only "cdn" server (multi-quality HLS).
 * Parallel TMDB + seed; 8s per-request timeout. Promise only.
 */
var API = 'https://api.speedracelight.com';
var DEC = 'https://enc-dec.app/api/dec-videasy';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var PLAYER = 'https://player.videasy.to';
// Single fast server — was waiting on 7 servers (neon2 etc. hung 15–20s)
var SERVERS = ['cdn'];
var REQ_MS = 8000;

function dblEncode(s) {
  return encodeURIComponent(encodeURIComponent(String(s || ''))).replace(/%20/g, '%2520');
}

function withTimeout(promise, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var t = setTimeout(function () {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, ms);
    promise
      .then(function (v) {
        if (!done) {
          done = true;
          clearTimeout(t);
          resolve(v);
        }
      })
      .catch(function () {
        if (!done) {
          done = true;
          clearTimeout(t);
          resolve(null);
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
  return '1080p';
}

function fetchJson(url, headers) {
  var opts = { headers: headers || { Accept: 'application/json', 'User-Agent': UA } };
  if (typeof AbortController !== 'undefined') {
    var ctrl = new AbortController();
    opts.signal = ctrl.signal;
    setTimeout(function () {
      try {
        ctrl.abort();
      } catch (e) {}
    }, REQ_MS);
  }
  return withTimeout(
    fetch(url, opts).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }),
    REQ_MS
  );
}

function fetchText(url, headers) {
  var opts = { headers: headers || { 'User-Agent': UA } };
  if (typeof AbortController !== 'undefined') {
    var ctrl = new AbortController();
    opts.signal = ctrl.signal;
    setTimeout(function () {
      try {
        ctrl.abort();
      } catch (e) {}
    }, REQ_MS);
  }
  return withTimeout(
    fetch(url, opts).then(function (res) {
      if (!res || !res.ok) return null;
      return res.text();
    }),
    REQ_MS
  );
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  // no append_to_response — one less payload
  return fetchJson(
    'https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY,
    { Accept: 'application/json' }
  ).then(function (data) {
    if (!data) return null;
    return {
      title: (isTv ? data.name : data.title) || '',
      year: String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4),
      imdbId: data.imdb_id || ''
    };
  });
}

function fetchServer(server, qs, seed, tmdbId) {
  var url = API + '/' + server + '/sources-with-title?' + qs;
  return fetchText(url, {
    Accept: '*/*',
    'User-Agent': UA,
    Origin: PLAYER,
    Referer: PLAYER + '/'
  }).then(function (encData) {
    if (!encData || encData.length < 20) return [];
    var opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': UA
      },
      body: JSON.stringify({ text: encData, id: tmdbId, seed: seed })
    };
    if (typeof AbortController !== 'undefined') {
      var ctrl = new AbortController();
      opts.signal = ctrl.signal;
      setTimeout(function () {
        try {
          ctrl.abort();
        } catch (e) {}
      }, REQ_MS);
    }
    return withTimeout(
      fetch(DEC, opts)
        .then(function (res) {
          if (!res || !res.ok) return null;
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
            out.push({
              name: 'Videasy · ' + q,
              title: 'Videasy · cdn · ' + q,
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
        }),
      REQ_MS
    ).then(function (v) {
      return v || [];
    });
  });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Videasy] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  var start = Date.now();
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) return Promise.resolve([]);

    // Parallel: TMDB meta + seed (was sequential)
    return Promise.all([
      getTmdbMeta(id, isTv),
      fetchJson(API + '/seed?mediaId=' + encodeURIComponent(id), {
        Accept: 'application/json',
        'User-Agent': UA
      })
    ]).then(function (pair) {
      var meta = pair[0];
      var seedJson = pair[1];
      if (!meta || !meta.title) {
        console.log('[Videasy] TMDB miss');
        return [];
      }
      var seed = (seedJson && seedJson.seed) || seedJson;
      if (!seed || typeof seed !== 'string') {
        console.log('[Videasy] no seed');
        return [];
      }

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

      // Only cdn — one sources + one decrypt
      return fetchServer('cdn', qs, seed, id).then(function (streams) {
        var rank = { '2160p': 5, '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
        streams.sort(function (a, b) {
          return (rank[b.quality] || 0) - (rank[a.quality] || 0);
        });
        console.log(
          '[Videasy] → ' + streams.length + ' streams in ' + (Date.now() - start) + 'ms'
        );
        return streams;
      });
    }).catch(function (err) {
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
