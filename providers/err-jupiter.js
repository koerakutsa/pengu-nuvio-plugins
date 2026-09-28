/**
 * ERR Jupiter — TMDB title → getVodContents2 → content HLS.
 * Lower match threshold; broader search. Promise only.
 */
var ERR_API = 'https://services.err.ee';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var ROOT_CAT = 3905;
var API_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'PenguStream/1.0',
  Referer: 'https://jupiter.err.ee/'
};
var MEDIA_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'et-EE,et;q=0.9,en;q=0.8',
  Referer: 'https://jupiter.err.ee/',
  Origin: 'https://jupiter.err.ee'
};

function mediaUrl(value) {
  if (typeof value !== 'string' || !value) return '';
  if (value.indexOf('//') === 0) return 'https:' + value;
  return /^https?:\/\//i.test(value) ? value : '';
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/["'«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreTitle(a, b) {
  a = norm(a);
  b = norm(b);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return 80;
  var tokens = b.split(/[^a-z0-9äöüõšž]+/i).filter(function (t) {
    return t.length > 2;
  });
  if (!tokens.length) return 0;
  var hits = 0;
  for (var i = 0; i < tokens.length; i++) {
    if (a.indexOf(tokens[i]) >= 0) hits++;
  }
  return Math.round((hits / tokens.length) * 70);
}

function getTmdbTitle(tmdbId, isTv) {
  var ep = isTv ? 'tv' : 'movie';
  return fetch(
    'https://api.themoviedb.org/3/' + ep + '/' + tmdbId + '?api_key=' + TMDB_KEY,
    { headers: { Accept: 'application/json' } }
  )
    .then(function (res) {
      return res && res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (!data) return null;
      return {
        title: (isTv ? data.name : data.title) || '',
        original: (isTv ? data.original_name : data.original_title) || '',
        year: String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4)
      };
    })
    .catch(function () {
      return null;
    });
}

function searchErr(phrase, isTv) {
  // movie + series viewTypes both tried if first empty
  var viewTypes = isTv ? ['series', 'show', 'episode', 'movie'] : ['movie', 'series'];
  var options = {
    page: 1,
    limit: 40,
    offset: 0,
    category: ROOT_CAT,
    phrase: phrase,
    types: ['media'],
    searchTypes: ['video'],
    viewTypes: viewTypes,
    now: 0,
    order: 1
  };
  var qs =
    'type=video&options=' +
    encodeURIComponent(JSON.stringify(options));
  return fetch(ERR_API + '/api/search/getVodContents2/?' + qs, {
    headers: API_HEADERS
  })
    .then(function (res) {
      if (!res || !res.ok) {
        console.log('[ERR] search HTTP ' + (res && res.status));
        return [];
      }
      return res.json();
    })
    .then(function (json) {
      var contents =
        (json && json.video && json.video.contents) || [];
      console.log('[ERR] search hits ' + (contents && contents.length));
      return Array.isArray(contents) ? contents : [];
    })
    .catch(function (err) {
      console.log('[ERR] search err ' + (err && err.message));
      return [];
    });
}

function pickBest(contents, meta) {
  var best = null;
  var bestScore = -1;
  for (var i = 0; i < contents.length; i++) {
    var item = contents[i];
    var name = item.heading || item.name || item.title || '';
    var sc = scoreTitle(name, meta.title);
    if (meta.original) sc = Math.max(sc, scoreTitle(name, meta.original));
    if (meta.year && String(name).indexOf(meta.year) >= 0) sc += 5;
    if (sc > bestScore) {
      bestScore = sc;
      best = item;
    }
  }
  console.log('[ERR] best score=' + bestScore + (best ? ' id=' + best.id : ''));
  // Accept weaker matches for Estonian partial titles
  if (best && bestScore >= 40) return String(best.id || '');
  return '';
}

function fetchContentStreams(contentId) {
  return fetch(
    ERR_API +
      '/api/v2/vodContent/getContentPageData?contentId=' +
      encodeURIComponent(contentId) +
      '&rootId=' +
      ROOT_CAT +
      '&page=web',
    { headers: API_HEADERS }
  )
    .then(function (res) {
      if (!res || !res.ok) {
        console.log('[ERR] content HTTP ' + (res && res.status));
        return [];
      }
      return res.json();
    })
    .then(function (json) {
      var main = json && json.data && json.data.mainContent;
      if (!main) {
        console.log('[ERR] no mainContent');
        return [];
      }
      var output = [];
      var medias = main.medias || [];
      for (var i = 0; i < medias.length; i++) {
        var media = medias[i];
        if (media.restrictions && media.restrictions.drm) continue;
        var src = media.src || {};
        var candidates = [src.hls, src.hls2, src.hlsNew, src.file];
        for (var h = 0; h < candidates.length; h++) {
          var u = mediaUrl(candidates[h]);
          if (!u) continue;
          output.push({
            name: 'ERR Jupiter',
            title: (main.heading || 'ERR') + ' · HLS',
            url: u,
            quality: '1080p',
            size: 'Unknown',
            headers: MEDIA_HEADERS,
            provider: 'err-jupiter',
            sourceType: u.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
          });
        }
      }
      var seen = {};
      var uniq = [];
      for (var j = 0; j < output.length; j++) {
        if (seen[output[j].url]) continue;
        seen[output[j].url] = true;
        uniq.push(output[j]);
      }
      console.log('[ERR] → ' + uniq.length + ' streams');
      return uniq;
    })
    .catch(function (err) {
      console.log('[ERR] content err ' + (err && err.message));
      return [];
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[ERR Jupiter] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();

    if (/^\d{6,}$/.test(id)) {
      return fetchContentStreams(id);
    }
    if (!/^\d+$/.test(id)) return Promise.resolve([]);

    return getTmdbTitle(id, isTv)
      .then(function (meta) {
        if (!meta || !meta.title) {
          console.log('[ERR] TMDB miss');
          return [];
        }
        console.log('[ERR] title=' + meta.title);
        return searchErr(meta.title, isTv).then(function (contents) {
          var contentId = pickBest(contents, meta);
          if (!contentId && meta.original && meta.original !== meta.title) {
            return searchErr(meta.original, isTv).then(function (c2) {
              contentId = pickBest(c2, meta);
              return contentId ? fetchContentStreams(contentId) : [];
            });
          }
          return contentId ? fetchContentStreams(contentId) : [];
        });
      })
      .catch(function (err) {
        console.log('[ERR] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[ERR] sync: ' + (err && err.message ? err.message : err));
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
