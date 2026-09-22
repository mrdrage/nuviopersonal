/**
 * Diagnostic Nuvio provider for Eclipse.
 *
 * It intentionally returns the same public Apple HLS test stream for every
 * movie/TV request. Its only purpose is to verify that the repository,
 * manifest, JavaScript runtime and Eclipse player are wired correctly.
 */
async function getStreams(tmdbId, mediaType, season, episode) {
  return [
    {
      title: "Eclipse Demo • Apple HLS",
      name: "Demo Source",
      url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
      quality: "HLS",
      language: "en",
      provider: "mrdrage-demo",
      type: "hls"
    }
  ];
}

module.exports = { getStreams };
