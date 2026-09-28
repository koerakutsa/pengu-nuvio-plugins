/**
 * VidLink — fast path via enc-dec.app + vidlink.pro API.
 * GET enc-vidlink → GET /api/b/movie|tv/{enc} → qualities.
 * Promise only (VidZee style).
 */
var ENC = 'https://enc-dec.app/api/enc-vidlink';
var API = 'https://vidlink.pro';
var UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36';

function qualityRank(q) {
  var n = parseInt(String(q).replace(/\D/g, ''), 10) || 0;
  return n;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidLink] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) {
      console.log('[VidLink] bad id');
      return Promise.resolve([]);
    }

    return fetch(ENC + '?text=' + encodeURIComponent(id), {
      headers: { Accept: 'application/json', 'User-Agent': UA }
    })
      .then(function (res) {
        if (!res || !res.ok) return null;
        return res.json();
      })
      .then(function (encJson) {
        var enc = encJson && encJson.result ? String(encJson.result) : '';
        if (!enc) {
          console.log('[VidLink] no enc');
          return [];
        }
        var path = isTv
          ? '/api/b/tv/' +
            enc +
            '/' +
            (Number(seasonNum) || 1) +
            '/' +
            (Number(episodeNum) || 1)
          : '/api/b/movie/' + enc;

        return fetch(API + path, {
          headers: {
            Accept: 'application/json',
            'User-Agent': UA,
            Referer: API + '/',
            Origin: API
          }
        })
          .then(function (res) {
            if (!res || !res.ok) {
              console.log('[VidLink] api HTTP ' + (res && res.status));
              return null;
            }
            return res.json();
          })
          .then(function (data) {
            if (!data) return [];
            var qualities =
              (data.stream && data.stream.qualities) || data.qualities || {};
            var streams = [];
            var keys = Object.keys(qualities);
            keys.sort(function (a, b) {
              return qualityRank(b) - qualityRank(a);
            });
            for (var i = 0; i < keys.length; i++) {
              var q = keys[i];
              var info = qualities[q] || {};
              var url = String(info.url || '').trim();
              if (url.indexOf('http') !== 0) continue;
              var label = /\d/.test(q) ? q + (String(q).indexOf('p') >= 0 ? '' : 'p') : q;
              streams.push({
                name: 'VidLink · ' + label,
                title: 'VidLink · ' + label,
                url: url,
                quality: label,
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Referer: API + '/',
                  Origin: API
                },
                provider: 'vidlink',
                sourceType: (info.type || '').toLowerCase() === 'mp4' ? 'video' : 'hls'
              });
            }
            // single stream fallback
            if (!streams.length && data.stream && data.stream.url) {
              streams.push({
                name: 'VidLink · Auto',
                title: 'VidLink · Auto',
                url: String(data.stream.url),
                quality: '1080p',
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Referer: API + '/',
                  Origin: API
                },
                provider: 'vidlink',
                sourceType: 'hls'
              });
            }
            console.log('[VidLink] → ' + streams.length + ' streams');
            return streams;
          });
      })
      .catch(function (err) {
        console.log('[VidLink] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[VidLink] sync error: ' + (err && err.message ? err.message : err));
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
