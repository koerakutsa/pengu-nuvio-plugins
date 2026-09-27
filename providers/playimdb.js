/**
 * PlayIMDb — streamdata.vaplayer.ru
 */
var API = 'https://streamdata.vaplayer.ru/api.php';
var ORIGIN = 'https://nextgencloudfabric.com';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
var STREAM_HEADERS = { Origin: ORIGIN, Referer: ORIGIN + '/', 'User-Agent': UA };
function qualityFromName(fileName, title) {
  var text = ((fileName || '') + ' ' + (title || '')).toLowerCase();
  if (/\b(2160p|4k|uhd)\b/.test(text)) return '2160p';
  if (/\b1080p?\b/.test(text)) return '1080p';
  if (/\b720p?\b/.test(text)) return '720p';
  if (/\b480p?\b/.test(text)) return '480p';
  return '1080p';
}
function sourceType(url) {
  var u = String(url).toLowerCase().split('?')[0];
  if (u.indexOf('.m3u8') >= 0) return 'hls';
  if (/\.(mp4|mkv|webm)$/.test(u)) return 'video';
  return 'hls';
}
function fetchApi(params) {
  var qs = [];
  for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
  var url = API + '?' + qs.join('&');
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, 15000);
  return fetch(url, { signal: ctrl.signal, headers: Object.assign({}, STREAM_HEADERS, { Accept: 'application/json,*/*' }) })
    .then(function (res) {
      clearTimeout(t);
      if (!res.ok) { console.log('[PlayIMDb] HTTP ' + res.status); return null; }
      return res.json();
    })
    .catch(function (err) {
      clearTimeout(t);
      console.log('[PlayIMDb] fetch error: ' + (err && err.message || err));
      return null;
    });
}
function getStreams(tmdbId, mediaType, season, episode) {
  mediaType = mediaType || 'movie';
  season = season || '1';
  episode = episode || '1';
  var start = Date.now();
  var isTv = mediaType === 'tv' || mediaType === 'series';
  var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
  var isImdb = /^tt\d+$/i.test(id);
  if (!isImdb && !/^\d+$/.test(id)) {
    console.log('[PlayIMDb] expected TMDB/IMDb id, got: ' + id);
    return Promise.resolve([]);
  }
  var type = isTv ? 'tv' : 'movie';
  var params = isImdb ? { imdb: id, type: type } : { tmdb: id, type: type };
  if (isTv) {
    params.season = String(Number(season) || 1);
    params.episode = String(Number(episode) || 1);
  }
  return fetchApi(params).then(function (data) {
    function process(data) {
      if (!data || String(data.status_code) !== '200' || !data.data) {
        console.log('[PlayIMDb] no data');
        return [];
      }
      var payload = data.data;
      var urls = Array.isArray(payload.stream_urls) ? payload.stream_urls : [];
      if (!urls.length) return [];
      var quality = qualityFromName(payload.file_name, payload.title);
      var streams = [];
      var seen = {};
      for (var i = 0; i < urls.length; i++) {
        var url = String(urls[i] || '').trim();
        if (!/^https?:\/\//i.test(url)) continue;
        var key = url.split('?')[0];
        if (seen[key]) continue;
        seen[key] = true;
        streams.push({
          name: 'PlayIMDb · ' + quality,
          title: 'PlayIMDb · ' + (payload.title || id) + ' · ' + quality + ' · Server ' + (i + 1),
          url: url,
          quality: quality,
          headers: Object.assign({}, STREAM_HEADERS),
          sourceType: sourceType(url)
        });
      }
      console.log('[PlayIMDb] → ' + streams.length + ' streams in ' + (Date.now() - start) + 'ms');
      return streams;
    }
    if ((!data || String(data.status_code) !== '200' || !(data.data && data.data.stream_urls && data.data.stream_urls.length)) && !isImdb && /^\d+$/.test(id)) {
      return fetch('https://api.themoviedb.org/3/' + type + '/' + id + '/external_ids?api_key=68e094699525b18a70bab2f86b1fa706', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (ext) {
          if (ext && ext.imdb_id) {
            var retry = { imdb: ext.imdb_id, type: type };
            if (isTv) { retry.season = params.season; retry.episode = params.episode; }
            return fetchApi(retry).then(process);
          }
          return process(data);
        })
        .catch(function () { return process(data); });
    }
    return process(data);
  }).catch(function (err) {
    console.log('[PlayIMDb] error: ' + (err && err.message || err));
    return [];
  });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams };
} else if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
}
