# mrdrage Nuvio Personal

Personal Nuvio provider repository designed for Eclipse.

## Structure

```text
nuviopersonal/
├── manifest.json
├── README.md
├── .gitignore
└── providers/
    ├── demo.js
    └── template.js
```

## Install in Eclipse

Add this repository URL:

```text
https://raw.githubusercontent.com/mrdrage/nuviopersonal/main/manifest.json
```

Enable `Eclipse Demo Source`, open any movie or TV title and request sources. The demo provider deliberately returns the same public Apple HLS test stream for every title so the full chain can be verified:

```text
GitHub manifest -> provider JS -> Nuvio runtime -> Eclipse streams -> player
```

Remove or disable the demo provider after testing.

## Adding a provider

Create a file in `providers/`, for example `providers/my-source.js`, exporting:

```js
async function getStreams(tmdbId, mediaType, season, episode) {
  return [];
}

module.exports = { getStreams };
```

Then add a matching scraper entry to `manifest.json` whose `filename` points to that file.

## Stream result shape

Eclipse can consume objects shaped like:

```js
{
  title: "1080p ITA",
  name: "My Source",
  url: "https://example.com/authorized/master.m3u8",
  quality: "1080p",
  language: "it",
  provider: "my-provider",
  type: "hls",
  headers: {},
  subtitles: []
}
```

Use only sources you are authorized to access and expose through the provider.
