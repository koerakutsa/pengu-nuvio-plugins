/**
 * MovieBlast — Hermes-safe Promise only. crypto-js optional (try/catch).
 */
var BASE_URL = 'https://app.cloud-mb.xyz';
var TOKEN = 'jdvhhjv255vghhghdhvfch2565656jhdcghfdf';
var APP_ID = 'com.movieblast';
var SIGN_SECRET = 'GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var HEADERS = {
  'user-agent': 'okhttp/5.0.0-alpha.6',
  'x-request-x': APP_ID,
  Accept: 'application/json'
};
var SEARCH_HEADERS = {
  'user-agent': 'okhttp/5.0.0-alpha.6',
  'x-request-x': APP_ID,
  Accept: 'application/json',
  hash256: '86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30',
  packagename: APP_ID
};
var STREAM_HEADERS = {
  Referer: 'MovieBlast',
  'User-Agent': 'MovieBlast',
  'x-request-x': APP_ID
};

var CryptoJS = null;
try {
  if (typeof require === 'function') {
    CryptoJS = require('crypto-js');
  }
} catch (e) {
  console.log('[MovieBlast] crypto-js not available: ' + (e && e.message ? e.message : e));
}

function qualityFromText(text) {
  text = String(text || '').toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  return '1080p';
}

function generateSignedUrl(urlStr) {
  if (!CryptoJS) return urlStr;
  try {
    var url = new URL(urlStr);
    var path = url.pathname;
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var hash = CryptoJS.HmacSHA256(path + timestamp, SIGN_SECRET);
    var signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    var sep = urlStr.indexOf('?') >= 0 ? '&' : '?';
    return urlStr + sep + 'verify=' + timestamp + '-' + signature;
  } catch (e) {
    return urlStr;
  }
}

function fetchJson(url, headers) {
  return fetch(url, { headers: headers })
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  return fetchJson(
    'https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY,
    { Accept: 'application/json' }
  ).then(function (data) {
    if (!data) return null;
    var title = (isTv ? data.name : data.title) || '';
    var year = String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4);
    var original = (isTv ? data.original_name : data.original_title) || title;
    return { title: title, original: original, year: year };
  });
}

function scoreResult(item, meta) {
  var name = String(item.title || item.name || '').toLowerCase();
  var want = String(meta.title || '').toLowerCase();
  var orig = String(meta.original || '').toLowerCase();
  if (!name) return 0;
  var score = 0;
  if (name === want || name === orig) score += 80;
  else if (name.indexOf(want) >= 0 || want.indexOf(name) >= 0) score += 50;
  if (meta.year && String(item.year || item.release_date || '').indexOf(meta.year) >= 0) score += 20;
  return score;
}

function pickBestMatch(results, meta) {
  if (!results || !results.length) return null;
  var best = null;
  var bestScore = -1;
  for (var i = 0; i < results.length; i++) {
    var sc = scoreResult(results[i], meta);
    if (sc > bestScore) {
      bestScore = sc;
      best = results[i];
    }
  }
  if (bestScore < 20 && results.length > 1) return null;
  return best;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[MovieBlast] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').trim();
    if (!/^\d+$/.test(id)) {
      console.log('[MovieBlast] bad id: ' + id);
      return Promise.resolve([]);
    }
    return getTmdbMeta(id, isTv).then(function (meta) {
      if (!meta || !meta.title) {
        console.log('[MovieBlast] TMDB miss');
        return [];
      }
      console.log('[MovieBlast] title: ' + meta.title);
      var queries = [meta.title];
      if (meta.original && meta.original !== meta.title) queries.push(meta.original);

      function searchAt(qi) {
        if (qi >= queries.length) return Promise.resolve(null);
        var searchUrl =
          BASE_URL + '/api/search/' + encodeURIComponent(queries[qi]) + '/' + TOKEN;
        return fetchJson(searchUrl, SEARCH_HEADERS).then(function (searchData) {
          var results = (searchData && searchData.search) || [];
          var match = pickBestMatch(results, meta);
          if (match) return match;
          return searchAt(qi + 1);
        });
      }

      return searchAt(0).then(function (match) {
        if (!match || !match.id) {
          console.log('[MovieBlast] no search hit');
          return [];
        }
        var detailPath = isTv ? 'series/show' : 'media/detail';
        var detailUrl = BASE_URL + '/api/' + detailPath + '/' + match.id + '/' + TOKEN;
        return fetchJson(detailUrl, HEADERS).then(function (detailData) {
          if (!detailData) return [];
          var videos = [];
          if (isTv) {
            var seasons = detailData.seasons || [];
            var sNum = Number(seasonNum) || 1;
            var eNum = Number(episodeNum) || 1;
            var targetSeason = null;
            for (var si = 0; si < seasons.length; si++) {
              if (Number(seasons[si].season_number) === sNum) {
                targetSeason = seasons[si];
                break;
              }
            }
            var eps = (targetSeason && targetSeason.episodes) || [];
            for (var ei = 0; ei < eps.length; ei++) {
              if (Number(eps[ei].episode_number) === eNum) {
                videos = eps[ei].videos || [];
                break;
              }
            }
          } else {
            videos = detailData.videos || [];
          }
          var streams = [];
          var seen = {};
          for (var vi = 0; vi < videos.length; vi++) {
            var vid = videos[vi];
            var raw = vid && vid.link;
            if (!raw) continue;
            var httpsUrl = String(raw).indexOf('http') === 0 ? raw : 'https://' + raw;
            var signedUrl = generateSignedUrl(httpsUrl);
            var key = signedUrl.split('?')[0];
            if (seen[key]) continue;
            seen[key] = true;
            var label = String(vid.server || vid.quality || vid.label || 'Server');
            var quality = qualityFromText(label + ' ' + httpsUrl);
            streams.push({
              name: 'MovieBlast ' + quality,
              title: 'MovieBlast · ' + quality + ' · ' + label,
              url: signedUrl,
              quality: quality,
              size: 'Unknown',
              headers: {
                Referer: 'MovieBlast',
                'User-Agent': 'MovieBlast',
                'x-request-x': APP_ID
              },
              provider: 'movieblast',
              sourceType: httpsUrl.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
            });
          }
          console.log('[MovieBlast] → ' + streams.length + ' streams');
          return streams;
        });
      });
    }).catch(function (err) {
      console.log('[MovieBlast] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[MovieBlast] sync error: ' + (err && err.message ? err.message : err));
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
