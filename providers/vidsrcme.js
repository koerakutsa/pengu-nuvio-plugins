/**
 * VidSrcME — temporarily disabled on device (Nuvio Hermes has no WebAssembly).
 * Pure-JS decrypt is prepared; needs full upload of wasm2js blob.
 */
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[VidSrcME] disabled: runtime has no WASM; pure-JS upload pending');
  return Promise.resolve([]);
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
