/**
 * PlayIMDb — FAST path: one API call, return raw stream_urls.
 * No master.m3u8 expand (that doubled latency). VidZee-style Promise chain.
 */
var API = 'https://streamdata.vaplayer.ru/api.php';
var ORIGIN = 'https://nextgencloudfabric.com';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function qualityFromName(fileName, title) {
  var text = (String(fileName || '') + ' ' + String(title || '')).toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  return '1080p';
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
      title: 'PlayIMDb · ' + (payload.title || id) + ' · ' + quality + (urls.length > 1 ? ' · S' + (i + 1) : ''),
      url: url,
      quality: quality,
      size: 'Unknown',
      headers: {
        Origin: ORIGIN,
        Referer: ORIGIN + '/',
        'User-Agent': UA,
        Accept: '*/*'
      },
      provider: 'playimdb',
      sourceType: 'hls'
    });
  }
  console.log('[PlayIMDb] → ' + streams.length + ' streams');
  return streams;
}

function fetchApi(params) {
  var qs = [];
  for (var k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k) && params[k] != null) {
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])));
    }
  }
  return fetch(API + '?' + qs.join('&'), {
    headers: {
      Origin: ORIGIN,
      Referer: ORIGIN + '/',
      'User-Agent': UA,
      Accept: 'application/json,*/*'
    }
  })
    .then(function (res) {
      if (!res || !res.ok) {
        console.log('[PlayIMDb] HTTP ' + (res && res.status));
        return null;
      }
      return res.json();
    })
    .catch(function (err) {
      console.log('[PlayIMDb] fetch error: ' + (err && err.message ? err.message : err));
      return null;
    });
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

    // Single API call — no playlist expand, no TMDB external_ids hop
    return fetchApi(params)
      .then(function (data) {
        return mapStreams(data, id);
      })
      .catch(function (err) {
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
