/**
 * VidSrcME — loads pure-JS decrypt from vidsrcme-plugin.js (Hermes has no WASM).
 */
var VS_PLUGIN_URL =
  'https://raw.githubusercontent.com/koerakutsa/pengu-nuvio-plugins/main/providers/vidsrcme-plugin.js';
var vsReal = null;
var vsLoading = null;

function loadPlugin() {
  if (vsReal) return Promise.resolve(vsReal);
  if (vsLoading) return vsLoading;
  vsLoading = fetch(VS_PLUGIN_URL, {
    headers: { Accept: 'text/plain,*/*' }
  })
    .then(function (res) {
      if (!res || !res.ok) throw new Error('plugin HTTP ' + (res && res.status));
      return res.text();
    })
    .then(function (code) {
      var mod = { exports: {} };
      var fn = new Function(
        'module',
        'exports',
        'globalThis',
        'global',
        code +
          '\n;return (module.exports && module.exports.getStreams) || ' +
          '(typeof globalThis !== "undefined" && globalThis.getStreams) || ' +
          '(typeof globalThis !== "undefined" && globalThis.__vsReal);'
      );
      var got = fn(
        mod,
        mod.exports,
        typeof globalThis !== 'undefined' ? globalThis : {},
        typeof global !== 'undefined' ? global : {}
      );
      vsReal = got || (mod.exports && mod.exports.getStreams);
      if (!vsReal) throw new Error('getStreams missing after load');
      return vsReal;
    })
    .catch(function (err) {
      console.log('[VidSrcME] load fail: ' + (err && err.message ? err.message : err));
      vsLoading = null;
      return null;
    });
  return vsLoading;
}

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] loader', tmdbId, mediaType, seasonNum, episodeNum);
  return loadPlugin()
    .then(function (fn) {
      if (!fn) return [];
      return fn(tmdbId, mediaType, seasonNum, episodeNum);
    })
    .catch(function (err) {
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
