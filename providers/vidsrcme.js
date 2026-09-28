/**
 * VidSrcME temporary stub - pure-JS decrypt pending upload
 */
function getStreams() {
  console.log('[VidSrcME] stub - update pending');
  return Promise.resolve([]);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
}
if (typeof globalThis !== 'undefined') {
  globalThis.getStreams = getStreams;
}
