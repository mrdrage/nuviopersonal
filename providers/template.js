/**
 * Template for a future Nuvio provider.
 *
 * Eclipse calls getStreams(tmdbId, mediaType, season, episode).
 * Return an array of direct, authorized HTTP/HTTPS streams.
 */
async function getStreams(tmdbId, mediaType, season, episode) {
  // Example shape:
  // return [
  //   {
  //     title: "1080p",
  //     name: "My Source",
  //     url: "https://example.com/authorized/master.m3u8",
  //     quality: "1080p",
  //     language: "it",
  //     provider: "my-provider",
  //     type: "hls",
  //     headers: {},
  //     subtitles: []
  //   }
  // ];
  return [];
}

module.exports = { getStreams };
