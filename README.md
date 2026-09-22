# mrdrage Nuvio Personal

Personal Nuvio provider repository designed for Eclipse.

## Install in Eclipse

Add this repository URL:

```text
https://raw.githubusercontent.com/mrdrage/nuviopersonal/main/manifest.json
```

## Providers

### Eclipse Demo Source

A diagnostic provider that returns a small public MP4 test clip for every request. It verifies the complete chain:

```text
GitHub manifest -> provider JS -> Nuvio runtime -> Eclipse streams -> player
```

### AnimeSaturn Catalog

A catalog-only matcher. It:

1. receives the TMDB ID from Eclipse;
2. resolves a title through public metadata;
3. searches the public AnimeSaturn catalog;
4. chooses the best matching title/season;
5. verifies that the requested episode is listed on the anime page.

When a catalog match is confirmed, Eclipse shows a result named `AnimeSaturn catalog ✓ ...` and plays the same harmless public MP4 test clip used for diagnostics.

It deliberately does **not** resolve AnimeSaturn players, iframe hosts, `.m3u8` URLs or third-party video streams.

## Structure

```text
nuviopersonal/
├── manifest.json
├── README.md
├── .gitignore
└── providers/
    ├── demo.js
    ├── animesaturn-catalog.js
    └── template.js
```

## Provider interface

Eclipse calls:

```js
async function getStreams(tmdbId, mediaType, season, episode) {
  return [];
}

module.exports = { getStreams };
```

A normal authorized stream result can use fields such as `title`, `name`, `url`, `quality`, `language`, `provider`, `type`, `headers` and `subtitles`.
