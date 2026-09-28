/**
 * PlayIMDb — Hermes-safe (Promise only, no async/await)
 */
var API = 'https://streamdata.vaplayer.ru/api.php';
var ORIGIN = 'https://nextgencloudfabric.com';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
var STREAM_HEADERS = {
  Origin: ORIGIN,
  Referer: ORIGIN + '/',
  'User-Agent': UA
};

function qualityFromName(fileName, title) {
  var text = String(fileName || '') + ' ' + String(title || '');
  text = text.toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  return '1080p';
}

function sourceType(url) {
  var u = String(url).toLowerCase();
  if (u.indexOf('.m3u8') >= 0) return 'hls';
  if (u.indexOf('.mp4') >= 0 || u.indexOf('.mkv') >= 0) return 'video';
  return 'hls';
}

function fetchApi(params) {
  var qs = [];
  for (var k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k) && params[k] != null) {
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])));
    }
  }
  var url = API + '?' + qs.join('&');
  return fetch(url, {
    headers: {
      Origin: ORIGIN,
      Referer: ORIGIN + '/',
      'User-Agent': UA,
      Accept: 'application/json,*/*'
    }
  }).then(function (res) {
    if (!res || !res.ok) {
      console.log('[PlayIMDb] HTTP ' + (res && res.status));
      return null;
    }
    return res.json();
  }).catch(function (err) {
    console.log('[PlayIMDb] fetch error: ' + (err && err.message ? err.message : err));
    return null;
  });
}

function mapStreams(data, id) {
  if (!data || String(data.status_code) !== '200' || !data.data) {
    console.log('[PlayIMDb] no data');
    return [];
  }
  var payload = data.data;
  var urls = Array.isArray(payload.stream_urls) ? payload.stream_urls : [];
  if (!urls.length) {
    console.log('[PlayIMDb] empty stream_urls');
    return [];
  }
  var quality = qualityFromName(payload.file_name, payload.title);
  var streams = [];
  var seen = {};
  for (var i = 0; i < urls.length; i++) {
    var url = String(urls[i] || '').trim();
    if (url.indexOf('http') !== 0) continue;
    var key = url.split('?')[0];
    if (seen[key]) continue;
    seen[key] = true;
    streams.push({
      name: 'PlayIMDb · ' + quality,
      title: 'PlayIMDb · ' + (payload.title || id) + ' · ' + quality,
      url: url,
      quality: quality,
      size: 'Unknown',
      headers: {
        Origin: ORIGIN,
        Referer: ORIGIN + '/',
        'User-Agent': UA
      },
      provider: 'playimdb',
      sourceType: sourceType(url)
    });
  }
  console.log('[PlayIMDb] → ' + streams.length + ' streams');
  return streams;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[PlayIMDb] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    var isImdb = /^tt\d+$/i.test(id);
    if (!isImdb && !/^\d+$/.test(id)) {
      console.log('[PlayIMDb] bad id: ' + id);
      return Promise.resolve([]);
    }
    var type = isTv ? 'tv' : 'movie';
    var params = isImdb ? { imdb: id, type: type } : { tmdb: id, type: type };
    if (isTv) {
      params.season = String(Number(seasonNum) || 1);
      params.episode = String(Number(episodeNum) || 1);
    }
    return fetchApi(params).then(function (data) {
      var hasUrls = data && data.data && data.data.stream_urls && data.data.stream_urls.length;
      if (!hasUrls && !isImdb && /^\d+$/.test(id)) {
        return fetch(
          'https://api.themoviedb.org/3/' + type + '/' + id + '/external_ids?api_key=68e094699525b18a70bab2f86b1fa706',
          { headers: { Accept: 'application/json' } }
        ).then(function (r) {
          return r && r.ok ? r.json() : null;
        }).then(function (ext) {
          if (ext && ext.imdb_id) {
            console.log('[PlayIMDb] retry imdb=' + ext.imdb_id);
            var retry = { imdb: ext.imdb_id, type: type };
            if (isTv) {
              retry.season = params.season;
              retry.episode = params.episode;
            }
            return fetchApi(retry).then(function (d2) {
              return mapStreams(d2, id);
            });
          }
          return mapStreams(data, id);
        }).catch(function () {
          return mapStreams(data, id);
        });
      }
      return mapStreams(data, id);
    }).catch(function (err) {
      console.log('[PlayIMDb] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[PlayIMDb] sync error: ' + (err && err.message ? err.message : err));
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
