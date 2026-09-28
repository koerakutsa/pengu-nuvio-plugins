/**
 * MP4Hydra — Hermes-safe Promise only
 */
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var API_URL = 'https://mp4hydra.org/info2?v=8';
var UA =
  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36';

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function qualityFrom(value) {
  var text = String(value || '').toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  return '1080p';
}

function getTmdbMeta(tmdbId, isTv) {
  var endpoint = isTv ? 'tv' : 'movie';
  return fetch(
    'https://api.themoviedb.org/3/' + endpoint + '/' + tmdbId + '?api_key=' + TMDB_KEY,
    { headers: { Accept: 'application/json' } }
  )
    .then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    })
    .then(function (data) {
      if (!data) return null;
      var title = (isTv ? data.name : data.title) || '';
      var original = (isTv ? data.original_name : data.original_title) || title;
      var year = String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4) || null;
      return {
        title: title,
        original: original,
        year: year,
        slug: generateSlug(title),
        originalSlug: generateSlug(original)
      };
    })
    .catch(function () {
      return null;
    });
}

function postInfo(slug, mediaType, seasonNum, episodeNum) {
  var body =
    'v=8&z=' +
    encodeURIComponent(
      JSON.stringify([{ s: slug, t: mediaType, se: seasonNum, ep: episodeNum }])
    );
  return fetch(API_URL, {
    method: 'POST',
    body: body,
    headers: {
      'User-Agent': UA,
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://mp4hydra.org',
      Referer: 'https://mp4hydra.org/' + mediaType + '/' + slug
    }
  })
    .then(function (res) {
      if (!res || !res.ok) return null;
      var ct = '';
      try {
        ct = (res.headers.get('content-type') || '').toLowerCase();
      } catch (e) {}
      if (ct.indexOf('text/html') >= 0) return null;
      return res.json();
    })
    .catch(function () {
      return null;
    });
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[MP4Hydra] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').trim();
    if (!/^\d+$/.test(id)) return Promise.resolve([]);
    return getTmdbMeta(id, isTv).then(function (meta) {
      if (!meta || !meta.title) return [];
      var type = isTv ? 'tv' : 'movie';
      var se = isTv ? Number(seasonNum) || 1 : null;
      var ep = isTv ? Number(episodeNum) || 1 : null;
      var slugs = [];
      if (!isTv && meta.year) slugs.push(meta.slug + '-' + meta.year);
      slugs.push(meta.slug);
      if (meta.originalSlug && meta.originalSlug !== meta.slug) {
        if (!isTv && meta.year) slugs.push(meta.originalSlug + '-' + meta.year);
        slugs.push(meta.originalSlug);
      }
      function trySlug(i) {
        if (i >= slugs.length) return Promise.resolve([]);
        return postInfo(slugs[i], type, se, ep).then(function (data) {
          if (!data || !data.playlist || !data.servers) return trySlug(i + 1);
          var streams = [];
          var serverNames = ['Beta', 'Beta#3'];
          var items = data.playlist;
          if (type === 'tv' && se && ep) {
            var seLabel =
              'S' +
              String(se).padStart(2, '0') +
              'E' +
              String(ep).padStart(2, '0');
            var hit = null;
            for (var j = 0; j < items.length; j++) {
              if (String(items[j].title || '').toUpperCase() === seLabel) {
                hit = items[j];
                break;
              }
            }
            if (!hit) return trySlug(i + 1);
            items = [hit];
          }
          for (var s = 0; s < serverNames.length; s++) {
            var base = data.servers[serverNames[s]];
            if (!base) continue;
            for (var k = 0; k < items.length; k++) {
              var src = items[k] && items[k].src;
              if (!src) continue;
              var videoUrl = String(src).indexOf('http') === 0 ? src : base + src;
              var quality = qualityFrom(items[k].quality || items[k].label || '1080p');
              streams.push({
                name: 'MP4Hydra ' + quality,
                title: meta.title + ' · MP4Hydra · ' + quality,
                url: videoUrl,
                quality: quality,
                size: 'Unknown',
                headers: {
                  Referer: 'https://mp4hydra.org/',
                  Origin: 'https://mp4hydra.org',
                  'User-Agent': UA
                },
                provider: 'mp4hydra',
                sourceType: videoUrl.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
              });
            }
          }
          if (!streams.length) return trySlug(i + 1);
          console.log('[MP4Hydra] → ' + streams.length + ' streams');
          return streams;
        });
      }
      return trySlug(0);
    }).catch(function (err) {
      console.log('[MP4Hydra] error: ' + (err && err.message ? err.message : err));
      return [];
    });
  } catch (err) {
    console.log('[MP4Hydra] sync error: ' + (err && err.message ? err.message : err));
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
