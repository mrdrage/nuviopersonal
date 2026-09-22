/**
 * Diagnostic Nuvio provider for Eclipse.
 *
 * Returns a small public-domain MP4 test video for every request.
 * This isolates the Eclipse/Nuvio playback pipeline from HLS-specific issues.
 */
async function getStreams(tmdbId, mediaType, season, episode) {
  return [
    {
      title: "Eclipse Demo • MP4 480p",
      name: "Demo Source",
      url: "https://cdn.truefilesize.com/mp4/sample-1mb.mp4",
      quality: "480p",
      language: "en",
      provider: "mrdrage-demo",
      type: "mp4"
    }
  ];
}

module.exports = { getStreams };
