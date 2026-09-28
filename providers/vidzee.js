/**
 * VidZee — prioritise servers that use fast CDNs (tik / Hindi often TikTok edge).
 * Hermes-safe: Promise only.
 */
var API_BASE = 'https://core.vidzee.wtf';
var PLAYER = 'https://player.vidzee.wtf';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// Order: user-proven fast first
var SERVERS = ['tik', 'v6:Hindi', 'v6:English', 'ipcloud', 'dcloud'];

function streamName(server, language) {
  var lang = String(language || 'Auto');
  if (/hindi/i.test(lang) || /Hindi/i.test(String(server))) return 'VidZee Hindi · 1080p';
  if (/english/i.test(lang) || /English/i.test(String(server))) return 'VidZee English · 720p';
  return 'VidZee ' + server + ' · 1080p';
}

function qualityFor(server, language, url) {
  if (/English/i.test(String(server)) || /english/i.test(String(language))) return '720p';
  if (/720/.test(String(url || ''))) return '720p';
  return '1080p';
}

function fetchServer(tmdbId, type, season, episode, sr) {
  var path =
    type === 'tv'
      ? '/streams/tv/' +
        encodeURIComponent(tmdbId) +
        '/' +
        encodeURIComponent(season) +
        '/' +
        encodeURIComponent(episode)
      : '/streams/movie/' + encodeURIComponent(tmdbId);
  var url = API_BASE + path + '?s=' + encodeURIComponent(sr) + '&e=0';
  return fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: PLAYER + '/',
      Origin: PLAYER,
      Accept: 'application/json,*/*'
    }
  })
    .then(function (res) {
      if (!res || !res.ok) {
        console.log('[VidZee] ' + sr + ' HTTP ' + (res && res.status));
        return null;
      }
      return res.json();
    })
    .then(function (data) {
      if (!data || data.error) return null;
      var streamUrl = typeof data.url === 'string' ? data.url.trim() : '';
      if (streamUrl.indexOf('http') !== 0) return null;
      return {
        url: streamUrl,
        language: data.language || 'Auto',
        apiHeaders: data.headers && typeof data.headers === 'object' ? data.headers : {},
        server: sr
      };
    })
    .catch(function (err) {
      console.log('[VidZee] ' + sr + ' error: ' + (err && err.message ? err.message : err));
      return null;
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidZee] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) return Promise.resolve([]);
    var type = isTv ? 'tv' : 'movie';
    var se = isTv ? String(Number(seasonNum) || 1) : '1';
    var ep = isTv ? String(Number(episodeNum) || 1) : '1';
    var jobs = [];
    for (var i = 0; i < SERVERS.length; i++) {
      jobs.push(fetchServer(id, type, se, ep, SERVERS[i]));
    }
    return Promise.all(jobs)
      .then(function (results) {
        var streams = [];
        var seen = {};
        // Preserve SERVERS order (fast first)
        for (var j = 0; j < results.length; j++) {
          var hit = results[j];
          if (!hit) continue;
          var key = hit.url.split('?')[0];
          if (seen[key]) continue;
          seen[key] = true;
          var headers = {
            Referer: PLAYER + '/',
            Origin: PLAYER,
            'User-Agent': UA
          };
          if (hit.apiHeaders) {
            for (var hk in hit.apiHeaders) {
              if (Object.prototype.hasOwnProperty.call(hit.apiHeaders, hk)) {
                headers[hk] = hit.apiHeaders[hk];
              }
            }
          }
          var q = qualityFor(hit.server, hit.language, hit.url);
          streams.push({
            name: streamName(hit.server, hit.language),
            title: 'VidZee · ' + hit.server + ' · ' + hit.language + ' · ' + q,
            url: hit.url,
            quality: q,
            size: 'Unknown',
            headers: headers,
            provider: 'vidzee',
            sourceType: hit.url.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
          });
        }
        console.log('[VidZee] → ' + streams.length + ' streams');
        return streams;
      })
      .catch(function (err) {
        console.log('[VidZee] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[VidZee] sync error: ' + (err && err.message ? err.message : err));
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
