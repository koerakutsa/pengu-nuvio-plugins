/**
 * Vixsrc — fast path:
 *   GET /api/movie|tv/{id} → embed src
 *   GET embed → window.masterPlaylist → playlist URL
 * Promise only (VidZee style).
 */
var BASE = 'https://vixsrc.to';
var UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractMaster(html) {
  if (!html) return null;
  var urlM = html.match(/window\.masterPlaylist\s*=\s*\{[\s\S]*?url:\s*['"]([^'"]+)['"]/);
  var tokenM = html.match(/['"]?token['"]?\s*:\s*['"]([^'"]+)['"]/);
  var expM = html.match(/['"]?expires['"]?\s*:\s*['"]([^'"]+)['"]/);
  if (urlM && tokenM && expM) {
    var base = urlM[1];
    var sep = base.indexOf('?') >= 0 ? '&' : '?';
    return (
      base +
      sep +
      'token=' +
      encodeURIComponent(tokenM[1]) +
      '&expires=' +
      encodeURIComponent(expM[1]) +
      '&h=1&lang=en'
    );
  }
  var m3 = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
  return m3 ? m3[1] : null;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Vixsrc] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) {
      console.log('[Vixsrc] bad id');
      return Promise.resolve([]);
    }

    var apiUrl = isTv
      ? BASE +
        '/api/tv/' +
        id +
        '/' +
        (Number(seasonNum) || 1) +
        '/' +
        (Number(episodeNum) || 1)
      : BASE + '/api/movie/' + id;

    return fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': UA,
        Referer: BASE + '/'
      }
    })
      .then(function (res) {
        if (!res || !res.ok) {
          console.log('[Vixsrc] api HTTP ' + (res && res.status));
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.src) {
          console.log('[Vixsrc] no src');
          return [];
        }
        var embed =
          data.src.indexOf('http') === 0 ? data.src : BASE + data.src;
        return fetch(embed, {
          headers: {
            Accept: 'text/html',
            'User-Agent': UA,
            Referer: BASE + '/'
          }
        })
          .then(function (res) {
            if (!res || !res.ok) return '';
            return res.text();
          })
          .then(function (html) {
            var playlist = extractMaster(html);
            if (!playlist) {
              console.log('[Vixsrc] no playlist');
              return [];
            }
            console.log('[Vixsrc] → 1 stream');
            return [
              {
                name: 'Vixsrc · Auto',
                title: 'Vixsrc · HLS',
                url: playlist,
                quality: '1080p',
                size: 'Unknown',
                headers: {
                  'User-Agent': UA,
                  Referer: BASE + '/',
                  Origin: BASE
                },
                provider: 'vixsrc',
                sourceType: 'hls'
              }
            ];
          });
      })
      .catch(function (err) {
        console.log('[Vixsrc] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[Vixsrc] sync error: ' + (err && err.message ? err.message : err));
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
