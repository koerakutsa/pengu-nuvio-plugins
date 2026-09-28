/**
 * Debug ping — always returns one dummy stream so you can verify plugins load.
 * Disable after testing.
 */
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  console.log('[DebugPing] called', tmdbId, mediaType, seasonNum, episodeNum);
  return Promise.resolve([
    {
      name: 'DebugPing · OK',
      title: 'Plugin runtime works · TMDB ' + String(tmdbId),
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '720p',
      size: 'Unknown',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      provider: 'debugping',
      sourceType: 'hls'
    }
  ]);
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
