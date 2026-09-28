/**
 * Videasy — seed + sources-with-title + enc-dec.app decrypt.
 * Hermes-safe: Promise only, no async/await.
 * Prefer "cdn" server (multi-quality m3u8).
 */
var API = 'https://api.speedracelight.com';
var DEC = 'https://enc-dec.app/api/dec-videasy';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var PLAYER = 'https://player.videasy.to';
// Order: fastest / most reliable first (tested)
var SERVERS = ['cdn', 'hdmovie', 'neon2', 'superflix', 'lamovie', 'tejo', 'ym'];

var PLAY_HEADERS = {
  'User-Agent': UA,
  Origin: PLAYER,
  Referer: PLAYER + '/',
  Accept: '*/*'
};

function dblEncode(s) {
  return encodeURIComponent(encodeURIComponent(String(s || ''))).replace(/%20/g, '%2520');
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

function fetchJson(url, headers) {
  return fetch(url, { headers: headers || { Accept: 'application/json', 'User-Agent': UA } })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function fetchText(url, headers) {
  return fetch(url, { headers: headers || { 'User-Agent': UA } })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.text();
    })
    .catch(function () {
      return null;
    });
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  return fetchJson(
    'https://api.themoviedb.org/3/' +
      endpoint +
      '/' +
      tmdbId +
      '?api_key=' +
      TMDB_KEY +
      '&append_to_response=external_ids',
    { Accept: 'application/json' }
  ).then(function (data) {
    if (!data) return null;
    var title = (isTv ? data.name : data.title) || '';
    var year = String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4);
    var imdb =
      (data.external_ids && data.external_ids.imdb_id) || data.imdb_id || '';
    return { title: title, year: year, imdbId: imdb };
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
    return fetch(DEC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': UA
      },
      body: JSON.stringify({ text: encData, id: tmdbId, seed: seed })
    })
      .then(function (res) {
        if (!res || !res.ok) return null;
        return res.json();
      })
      .then(function (dec) {
        var result = (dec && dec.result) || {};
        var sources = result.sources || [];
        var out = [];
        for (var i = 0; i < sources.length; i++) {
          var src = sources[i];
          if (!src || !src.url) continue;
          var streamUrl = String(src.url).trim();
          if (streamUrl.indexOf('http') !== 0) continue;
          var q = qualityLabel(src);
          var lang = src.quality && /hindi|tamil|telugu|english|auto/i.test(src.quality)
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
            sourceType: streamUrl.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video',
            _server: server
          });
        }
        return out;
      })
      .catch(function () {
        return [];
      });
  });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Videasy] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) return Promise.resolve([]);

    return getTmdbMeta(id, isTv).then(function (meta) {
      if (!meta || !meta.title) {
        console.log('[Videasy] TMDB miss');
        return [];
      }
      console.log('[Videasy] title:', meta.title);

      return fetchJson(API + '/seed?mediaId=' + encodeURIComponent(id), {
        Accept: 'application/json',
        'User-Agent': UA
      }).then(function (seedJson) {
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

        var jobs = [];
        for (var i = 0; i < SERVERS.length; i++) {
          jobs.push(fetchServer(SERVERS[i], qs, seed, id));
        }

        return Promise.all(jobs).then(function (lists) {
          var streams = [];
          var seen = {};
          var order = {};
          for (var o = 0; o < SERVERS.length; o++) order[SERVERS[o]] = o;

          var flat = [];
          for (var a = 0; a < lists.length; a++) {
            var part = lists[a] || [];
            for (var b = 0; b < part.length; b++) flat.push(part[b]);
          }
          flat.sort(function (x, y) {
            var sx = order[x._server] != null ? order[x._server] : 99;
            var sy = order[y._server] != null ? order[y._server] : 99;
            if (sx !== sy) return sx - sy;
            var rq = { '2160p': 5, '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
            return (rq[y.quality] || 0) - (rq[x.quality] || 0);
          });

          for (var j = 0; j < flat.length; j++) {
            var s = flat[j];
            var key = s.url.split('?')[0];
            if (seen[key]) continue;
            seen[key] = true;
            delete s._server;
            streams.push(s);
          }
          console.log('[Videasy] → ' + streams.length + ' streams');
          return streams;
        });
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
