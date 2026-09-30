/**
 * ERR Jupiter / Arhiiv / Lasteekraan — direct err:ID / lasteekraan:ID OR TMDB title match.
 * Promise only. Nested seasonList + season/episode resolve.
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
    .replace(/["'«»']/g, '')
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

function parseErrId(raw) {
  var s = String(raw || '').trim();
  try {
    s = decodeURIComponent(s);
  } catch (e) {}
  s = s.replace(/\.json$/i, '').trim();
  var m = s.match(/(?:err-archive|lasteekraan|err):(\d+)/i);
  if (m) return m[1];
  s = s.replace(/^tmdb:/i, '').trim();
  if (/^\d{5,}$/.test(s)) return s;
  return '';
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
  var qs = 'type=video&options=' + encodeURIComponent(JSON.stringify(options));
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
      var contents = (json && json.video && json.video.contents) || [];
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
  if (best && bestScore >= 40) return String(best.id || '');
  return '';
}

function collectSeasonEpisodes(seasonList) {
  var out = [];
  var items = (seasonList && seasonList.items) || [];
  for (var si = 0; si < items.length; si++) {
    var s = items[si];
    var groups = s.items && s.items.length ? s.items : [s];
    for (var gi = 0; gi < groups.length; gi++) {
      var contents = groups[gi].contents || [];
      for (var ei = 0; ei < contents.length; ei++) {
        if (contents[ei] && contents[ei].id) out.push(contents[ei]);
      }
    }
  }
  return out;
}

function pickEpisodeContentId(seasonList, seasonNum, episodeNum) {
  var eps = collectSeasonEpisodes(seasonList);
  if (!eps.length) return '';
  var wantS = seasonNum ? parseInt(seasonNum, 10) : 0;
  var wantE = episodeNum ? parseInt(episodeNum, 10) : 0;
  if (isNaN(wantS)) wantS = 0;
  if (isNaN(wantE)) wantE = 0;
  if (wantS > 0 && wantE > 0) {
    for (var i = 0; i < eps.length; i++) {
      var c = eps[i];
      var s = parseInt(c.season, 10) || 0;
      var e = parseInt(c.episode, 10) || 0;
      if (s === wantS && e === wantE) return String(c.id);
    }
    var ord = 0;
    for (var j = 0; j < eps.length; j++) {
      var s2 = parseInt(eps[j].season, 10) || 0;
      if (wantS && s2 && s2 !== wantS) continue;
      ord++;
      if (ord === wantE) return String(eps[j].id);
    }
  }
  if (wantE > 0 && wantE <= eps.length) return String(eps[wantE - 1].id);
  return String(eps[0].id);
}

function fetchContentStreams(contentId, seasonNum, episodeNum) {
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
      var output = [];
      if (main) {
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
      }

      // Parent series: resolve S/E or first nested episode
      if (!output.length && json && json.data && json.data.seasonList) {
        var targetId = pickEpisodeContentId(json.data.seasonList, seasonNum, episodeNum);
        if (targetId && targetId !== String(contentId)) {
          console.log(
            '[ERR] resolve episode contentId=' + targetId + ' S' + seasonNum + 'E' + episodeNum
          );
          return fetchContentStreams(targetId);
        }
        var eps = collectSeasonEpisodes(json.data.seasonList);
        if (eps.length) {
          console.log('[ERR] fallback first ep ' + eps[0].id);
          return fetchContentStreams(String(eps[0].id));
        }
      }

      if (!main && !output.length) {
        console.log('[ERR] no mainContent');
        return [];
      }

      var seen = {};
      var uniq = [];
      for (var j = 0; j < output.length; j++) {
        if (seen[output[j].url]) continue;
        seen[output[j].url] = true;
        uniq.push(output[j]);
      }
      console.log('[ERR] → ' + uniq.length + ' streams id=' + contentId);
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
    var errId = parseErrId(tmdbId);

    if (errId) {
      console.log('[ERR] direct contentId=' + errId);
      return fetchContentStreams(errId, seasonNum, episodeNum);
    }

    var id = String(tmdbId || '')
      .replace(/^tmdb:/i, '')
      .trim();
    if (!/^\d+$/.test(id)) {
      console.log('[ERR] skip unknown id: ' + tmdbId);
      return Promise.resolve([]);
    }

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
              return contentId ? fetchContentStreams(contentId, seasonNum, episodeNum) : [];
            });
          }
          return contentId ? fetchContentStreams(contentId, seasonNum, episodeNum) : [];
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
