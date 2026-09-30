/**
 * DebugPing — always returns one fake stream that shows the received ID.
 */
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  var label = 'ID=' + String(tmdbId) + ' type=' + String(mediaType) +
    ' S' + String(seasonNum) + 'E' + String(episodeNum);
  console.log('[DebugPing]', label);
  return Promise.resolve([
    {
      name: 'DebugPing',
      title: label,
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '720p',
      size: 'Unknown',
      headers: {},
      provider: 'debugping',
      sourceType: 'hls'
    }
  ]);
}
if (typeof module !== 'undefined' && module.exports) module.exports = { getStreams: getStreams };
if (typeof globalThis !== 'undefined') globalThis.getStreams = getStreams;
if (typeof global !== 'undefined') global.getStreams = getStreams;
