/**
 * DebugPing — always returns one stream so we can see if TV invokes plugins.
 */
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  var id = String(tmdbId == null ? '' : tmdbId);
  var label =
    'PING id=' + id +
    ' type=' + String(mediaType) +
    ' S' + String(seasonNum) +
    'E' + String(episodeNum);
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
