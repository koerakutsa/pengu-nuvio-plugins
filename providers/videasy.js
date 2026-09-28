/**
 * Videasy — plain Promise chain (same style as working VidZee).
 * Servers: cdn only (fast + multi quality).
 */
var API = 'https://api.speedracelight.com';
var DEC = 'https://enc-dec.app/api/dec-videasy';
var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
var UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
var PLAYER = 'https://player.videasy.to';

function dblEncode(s) {
  return encodeURIComponent(encodeURIComponent(String(s || ''))).replace(/%20/g, '%2520');
}

function qualityLabel(src) {
  var q = String((src && src.quality) || '');
  var u = String((src && src.url) || '');
  var text = (q + ' ' + u).toLowerCase();
  if (text.indexOf('2160') >= 0 || text.indexOf('4k') >= 0) return '2160p';
  if (text.indexOf('1080') >= 0) return '1080p';
  if (text.indexOf('720') >= 0) return '720p';
  if (text.indexOf('480') >= 0) return '480p';
  if (text.indexOf('360') >= 0) return '360p';
  return '1080p';
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[Videasy] getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  try {
    mediaType = mediaType || 'movie';
    var isTv = mediaType === 'tv' || mediaType === 'series';
    var id = String(tmdbId || '').replace(/^tmdb:/i, '').trim();
    if (!/^\d+$/.test(id)) {
      console.log('[Videasy] bad id: ' + id);
      return Promise.resolve([]);
    }

    var endpoint = isTv ? 'tv' : 'movie';
    var tmdbUrl =
      'https://api.themoviedb.org/3/' + endpoint + '/' + id + '?api_key=' + TMDB_KEY;

    return fetch(tmdbUrl, {
      headers: { Accept: 'application/json', 'User-Agent': UA }
    })
      .then(function (res) {
        if (!res || !res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        if (!data) {
          console.log('[Videasy] TMDB miss');
          return [];
        }
        var title = (isTv ? data.name : data.title) || '';
        var year = String((isTv ? data.first_air_date : data.release_date) || '').slice(0, 4);
        var imdbId = data.imdb_id || '';
        if (!title) {
          console.log('[Videasy] no title');
          return [];
        }
        console.log('[Videasy] title=' + title);

        return fetch(API + '/seed?mediaId=' + encodeURIComponent(id), {
          headers: { Accept: 'application/json', 'User-Agent': UA }
        })
          .then(function (res) {
            if (!res || !res.ok) return null;
            return res.json();
          })
          .then(function (seedJson) {
            var seed = seedJson && seedJson.seed ? seedJson.seed : null;
            if (!seed) {
              console.log('[Videasy] no seed');
              return [];
            }

            var media = isTv ? 'tv' : 'movie';
            var qs =
              'title=' +
              dblEncode(title) +
              '&mediaType=' +
              media +
              '&year=' +
              encodeURIComponent(year) +
              '&tmdbId=' +
              encodeURIComponent(id) +
              '&imdbId=' +
              encodeURIComponent(imdbId) +
              '&enc=2&seed=' +
              encodeURIComponent(seed);
            if (isTv) {
              qs +=
                '&seasonId=' +
                encodeURIComponent(String(Number(seasonNum) || 1)) +
                '&episodeId=' +
                encodeURIComponent(String(Number(episodeNum) || 1));
            }

            var srcUrl = API + '/cdn/sources-with-title?' + qs;
            return fetch(srcUrl, {
              headers: {
                Accept: '*/*',
                'User-Agent': UA,
                Origin: PLAYER,
                Referer: PLAYER + '/'
              }
            })
              .then(function (res) {
                if (!res || !res.ok) {
                  console.log('[Videasy] sources HTTP ' + (res && res.status));
                  return null;
                }
                return res.text();
              })
              .then(function (encData) {
                if (!encData || encData.length < 20) {
                  console.log('[Videasy] empty enc');
                  return [];
                }
                return fetch(DEC, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'User-Agent': UA
                  },
                  body: JSON.stringify({
                    text: encData,
                    id: id,
                    seed: seed
                  })
                })
                  .then(function (res) {
                    if (!res || !res.ok) {
                      console.log('[Videasy] decrypt HTTP ' + (res && res.status));
                      return null;
                    }
                    return res.json();
                  })
                  .then(function (dec) {
                    var sources = ((dec && dec.result) || {}).sources || [];
                    var streams = [];
                    var seen = {};
                    for (var i = 0; i < sources.length; i++) {
                      var src = sources[i];
                      if (!src || !src.url) continue;
                      var streamUrl = String(src.url).trim();
                      if (streamUrl.indexOf('http') !== 0) continue;
                      var key = streamUrl.split('?')[0];
                      if (seen[key]) continue;
                      seen[key] = true;
                      var q = qualityLabel(src);
                      streams.push({
                        name: 'Videasy · ' + q,
                        title: 'Videasy · cdn · ' + q,
                        url: streamUrl,
                        quality: q,
                        size: 'Unknown',
                        headers: {
                          'User-Agent': UA,
                          Origin: PLAYER,
                          Referer: PLAYER + '/',
                          Accept: '*/*'
                        },
                        provider: 'videasy',
                        sourceType:
                          streamUrl.toLowerCase().indexOf('.m3u8') >= 0 ? 'hls' : 'video'
                      });
                    }
                    var rank = {
                      '2160p': 5,
                      '1080p': 4,
                      '720p': 3,
                      '480p': 2,
                      '360p': 1
                    };
                    streams.sort(function (a, b) {
                      return (rank[b.quality] || 0) - (rank[a.quality] || 0);
                    });
                    console.log('[Videasy] → ' + streams.length + ' streams');
                    return streams;
                  });
              });
          });
      })
      .catch(function (err) {
        console.log('[Videasy] error: ' + (err && err.message ? err.message : err));
        return [];
      });
  } catch (err) {
    console.log('[Videasy] sync error: ' + (err && err.message ? err.message : err));
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
