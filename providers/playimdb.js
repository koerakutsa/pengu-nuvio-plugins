/**
 * PlayIMDb — expand master.m3u8 into absolute quality variants.
 * Hermes-safe: Promise only.
 */
var API = 'https://streamdata.vaplayer.ru/api.php';
var ORIGIN = 'https://nextgencloudfabric.com';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function qualityFromBandwidth(bw, resLine) {
  var text = String(resLine || '') + ' ' + String(bw || '');
  text = text.toLowerCase();
  if (text.indexOf('1920') >= 0 || Number(bw) >= 3500000) return '1080p';
  if (text.indexOf('1280') >= 0 || Number(bw) >= 1500000) return '720p';
  if (text.indexOf('640') >= 0 || Number(bw) >= 500000) return '480p';
  return '720p';
}

function qualityFromName(fileName, title) {
  var text = (String(fileName || '') + ' ' + String(title || '')).toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  return '1080p';
}

function absUrl(base, path) {
  if (!path) return null;
  path = String(path).trim();
  if (path.indexOf('http') === 0) return path;
  try {
    if (typeof URL !== 'undefined') return new URL(path, base).href;
  } catch (e) {}
  if (path.charAt(0) === '/') {
    var m = String(base).match(/^(https?:\/\/[^\/]+)/);
    return m ? m[1] + path : null;
  }
  var dir = String(base).replace(/\/[^\/]*$/, '/');
  return dir + path;
}

function parseMasterVariants(text, masterUrl) {
  var lines = String(text || '').split(/\r?\n/);
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf('#EXT-X-STREAM-INF') !== 0) continue;
    var bwMatch = line.match(/BANDWIDTH=(\d+)/i);
    var resMatch = line.match(/RESOLUTION=(\d+x\d+)/i);
    var next = null;
    for (var j = i + 1; j < lines.length; j++) {
      if (lines[j] && lines[j].charAt(0) !== '#') {
        next = lines[j].trim();
        break;
      }
    }
    if (!next) continue;
    var full = absUrl(masterUrl, next);
    if (!full) continue;
    out.push({
      url: full,
      quality: qualityFromBandwidth(bwMatch && bwMatch[1], resMatch && resMatch[1]),
      bandwidth: bwMatch ? Number(bwMatch[1]) : 0
    });
  }
  return out;
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
      if (!res || !res.ok) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function expandPlaylist(masterUrl) {
  return fetch(masterUrl, {
    headers: {
      Origin: ORIGIN,
      Referer: ORIGIN + '/',
      'User-Agent': UA,
      Accept: '*/*'
    }
  })
    .then(function (res) {
      if (!res || !res.ok) return [];
      return res.text();
    })
    .then(function (text) {
      if (!text || text.indexOf('#EXTM3U') < 0) return [];
      if (text.indexOf('#EXTINF') >= 0 && text.indexOf('#EXT-X-STREAM-INF') < 0) {
        return [{ url: masterUrl, quality: '1080p', bandwidth: 0 }];
      }
      return parseMasterVariants(text, masterUrl);
    })
    .catch(function () {
      return [];
    });
}

function mapPayload(data, id) {
  if (!data || String(data.status_code) !== '200' || !data.data) return Promise.resolve([]);
  var payload = data.data;
  var urls = Array.isArray(payload.stream_urls) ? payload.stream_urls : [];
  if (!urls.length) return Promise.resolve([]);
  var fallbackQ = qualityFromName(payload.file_name, payload.title);
  var jobs = [];
  var limit = Math.min(urls.length, 2);
  for (var i = 0; i < limit; i++) {
    var u = String(urls[i] || '').trim();
    if (u.indexOf('http') === 0) jobs.push(expandPlaylist(u));
  }
  if (!jobs.length) return Promise.resolve([]);
  return Promise.all(jobs).then(function (lists) {
    var streams = [];
    var seen = {};
    for (var a = 0; a < lists.length; a++) {
      var variants = lists[a] || [];
      for (var b = 0; b < variants.length; b++) {
        var v = variants[b];
        if (!v || !v.url) continue;
        var key = v.url.split('?')[0];
        if (seen[key]) continue;
        seen[key] = true;
        var q = v.quality || fallbackQ;
        streams.push({
          name: 'PlayIMDb · ' + q,
          title: 'PlayIMDb · ' + (payload.title || id) + ' · ' + q,
          url: v.url,
          quality: q,
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
    }
    var rank = { '720p': 3, '1080p': 2, '480p': 1, '360p': 0, '2160p': 4 };
    streams.sort(function (x, y) {
      return (rank[y.quality] || 0) - (rank[x.quality] || 0);
    });
    if (!streams.length) {
      for (var i2 = 0; i2 < urls.length; i2++) {
        var ru = String(urls[i2] || '').trim();
        if (ru.indexOf('http') !== 0) continue;
        streams.push({
          name: 'PlayIMDb · ' + fallbackQ,
          title: 'PlayIMDb · ' + (payload.title || id) + ' · ' + fallbackQ,
          url: ru,
          quality: fallbackQ,
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
    }
    console.log('[PlayIMDb] → ' + streams.length + ' streams');
    return streams;
  });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[PlayIMDb] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    var isImdb = /^tt\d+$/i.test(id);
    if (!isImdb && !/^\d+$/.test(id)) return Promise.resolve([]);
    var type = isTv ? 'tv' : 'movie';
    var params = isImdb ? { imdb: id, type: type } : { tmdb: id, type: type };
    if (isTv) {
      params.season = String(Number(seasonNum) || 1);
      params.episode = String(Number(episodeNum) || 1);
    }
    return fetchApi(params)
      .then(function (data) {
        var has = data && data.data && data.data.stream_urls && data.data.stream_urls.length;
        if (!has && !isImdb && /^\d+$/.test(id)) {
          return fetch(
            'https://api.themoviedb.org/3/' +
              type +
              '/' +
              id +
              '/external_ids?api_key=68e094699525b18a70bab2f86b1fa706',
            { headers: { Accept: 'application/json' } }
          )
            .then(function (r) {
              return r && r.ok ? r.json() : null;
            })
            .then(function (ext) {
              if (ext && ext.imdb_id) {
                var retry = { imdb: ext.imdb_id, type: type };
                if (isTv) {
                  retry.season = params.season;
                  retry.episode = params.episode;
                }
                return fetchApi(retry).then(function (d2) {
                  return mapPayload(d2, id);
                });
              }
              return mapPayload(data, id);
            })
            .catch(function () {
              return mapPayload(data, id);
            });
        }
        return mapPayload(data, id);
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
