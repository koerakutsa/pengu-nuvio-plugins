/**
 * VidSrcME loader — fetches pure-JS decrypt parts (Hermes has no WASM).
 */
var VS_BASE = 'https://raw.githubusercontent.com/koerakutsa/pengu-nuvio-plugins/main/providers/';
var vsLoadPromise = null;

function loadVsReal() {
  if (typeof globalThis !== 'undefined' && globalThis.__vsReal) {
    return Promise.resolve(globalThis.__vsReal);
  }
  if (vsLoadPromise) return vsLoadPromise;
  vsLoadPromise = Promise.all([
    fetch(VS_BASE + 'vidsrcme.part1.js', { headers: { Accept: 'text/plain,*/*' } }).then(function (r) {
      if (!r || !r.ok) throw new Error('part1 ' + (r && r.status));
      return r.text();
    }),
    fetch(VS_BASE + 'vidsrcme.part2.js', { headers: { Accept: 'text/plain,*/*' } }).then(function (r) {
      if (!r || !r.ok) throw new Error('part2 ' + (r && r.status));
      return r.text();
    })
  ]).then(function (parts) {
    eval(parts[0] + parts[1]);
    if (typeof globalThis === 'undefined' || !globalThis.__vsReal) {
      throw new Error('__vsReal missing after eval');
    }
    return globalThis.__vsReal;
  }).catch(function (err) {
    console.log('[VidSrcME] load fail: ' + (err && err.message ? err.message : err));
    vsLoadPromise = null;
    return null;
  });
  return vsLoadPromise;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] loader getStreams', tmdbId, mediaType, seasonNum, episodeNum);
  return loadVsReal().then(function (fn) {
    if (!fn) return [];
    return fn(tmdbId, mediaType, seasonNum, episodeNum);
  }).catch(function (err) {
    console.log('[VidSrcME] error: ' + (err && err.message ? err.message : err));
    return [];
  });
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
