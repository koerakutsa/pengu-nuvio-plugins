/**
 * VidZee — core.vidzee.wtf
 */
var API_BASE = 'https://core.vidzee.wtf';
var PLAYER = 'https://player.vidzee.wtf';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var SERVERS = ['ipcloud', 'dcloud', 'tik', 'v6:Hindi'];
var STREAM_HEADERS = { Referer: PLAYER + '/', Origin: PLAYER, 'User-Agent': UA };
function streamName(server, language) {
  var lang = String(language || 'Auto');
  if (/hindi/i.test(lang) || /Hindi/i.test(server)) return 'VidZee Hindi · 1080p';
  return 'VidZee ' + server + ' · 1080p';
}
function fetchServer(tmdbId, type, season, episode, sr) {
  var path = type === 'tv'
    ? '/streams/tv/' + encodeURIComponent(tmdbId) + '/' + encodeURIComponent(season) + '/' + encodeURIComponent(episode)
    : '/streams/movie/' + encodeURIComponent(tmdbId);
  var url = API_BASE + path + '?s=' + encodeURIComponent(sr) + '&e=0';
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, 12000);
  return fetch(url, {
    signal: ctrl.signal,
    headers: { 'User-Agent': UA, Referer: PLAYER + '/', Origin: PLAYER, Accept: 'application/json,*/*' }
  }).then(function (res) {
    clearTimeout(t);
    if (!res.ok) { console.log('[VidZee] ' + sr + ' HTTP ' + res.status); return null; }
    return res.json();
  }).then(function (data) {
    if (!data) return null;
    var streamUrl = typeof data.url === 'string' ? data.url.trim() : '';
    if (!/^https?:\/\//i.test(streamUrl)) return null;
    return { url: streamUrl, language: data.language || 'Auto', apiHeaders: data.headers && typeof data.headers === 'object' ? data.headers : {}, server: sr };
  }).catch(function (err) {
    clearTimeout(t);
    console.log('[VidZee] ' + sr + ' error: ' + (err && err.message || err));
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
  if (!/^\d+$/.test(id)) {
    console.log('[VidZee] expected TMDB id, got: ' + id);
    return Promise.resolve([]);
  }
  var type = isTv ? 'tv' : 'movie';
  var se = isTv ? String(Number(season) || 1) : undefined;
  var ep = isTv ? String(Number(episode) || 1) : undefined;
  return Promise.all(SERVERS.map(function (sr) { return fetchServer(id, type, se, ep, sr); })).then(function (results) {
    var streams = [];
    var seen = {};
    for (var i = 0; i < results.length; i++) {
      var hit = results[i];
      if (!hit) continue;
      var key = hit.url.split('?')[0];
      if (seen[key]) continue;
      seen[key] = true;
      var headers = Object.assign({}, STREAM_HEADERS, hit.apiHeaders);
      streams.push({
        name: streamName(hit.server, hit.language),
        title: 'VidZee · ' + hit.server + ' · ' + hit.language + ' · 1080p',
        url: hit.url,
        quality: '1080p',
        headers: headers,
        sourceType: /\.m3u8(\?|$)/i.test(hit.url) ? 'hls' : 'video'
      });
    }
    streams.sort(function (a, b) {
      return (/hindi/i.test(a.title) ? 1 : 0) - (/hindi/i.test(b.title) ? 1 : 0);
    });
    console.log('[VidZee] → ' + streams.length + ' streams in ' + (Date.now() - start) + 'ms');
    return streams;
  }).catch(function (err) {
    console.log('[VidZee] error: ' + (err && err.message || err));
    return [];
  });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams };
} else if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
}
