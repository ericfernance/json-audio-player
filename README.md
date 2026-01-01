# JSON Audio Player

A lightweight web component that loads and plays audio playlists from a remote JSON manifest.

## Overview

This is a naive implementation of an audio player that concatenates audio chunks from a playlist into a single playable file. It's designed for scenarios where you have control over the audio formatting, so the client-side simply concatenates media files rather than properly muxing them.

## Installation

### From Local Path

```bash
npm install ../json-audio-player
# or
yarn add ../json-audio-player
```

### From Git Repository

```bash
npm install https://github.com/yourusername/json-audio-player.git
# or
yarn add https://github.com/yourusername/json-audio-player.git
```

## Usage

### In a Vue/React/Vanilla JS Project

```typescript
import { defineJsonAudioPlayer } from 'json-audio-player';

// Register the custom element (do this once in your app)
defineJsonAudioPlayer();
```

Then use the custom element in your HTML or templates:

```html
<json-audio-player src="/path/to/playlist.json"></json-audio-player>
```

Custom headers can be passed as an object to the `headers` attribute:

```html
<json-audio-player src="/path/to/playlist.json" headers="{ 'Authorization': 'Bearer token' }"></json-audio-player>
```

### Vue Example

```vue
<template>
  <json-audio-player src="/api/playlist.json"></json-audio-player>
</template>

<script setup lang="ts">
import { defineJsonAudioPlayer } from 'json-audio-player';

// Register the web component
defineJsonAudioPlayer();
</script>
```

## Playlist Format

The player expects a JSON manifest at the URL specified in the `src` attribute:

```json
{
  "files": [
    "https://somefile.com/1.webm",
    "https://somefile.com/2.webm",
    "https://somefile.com/3.webm",
  ]
}
```

## Events

The component dispatches the following custom events:

- `ready` - Fired when the playlist has been loaded and muxed successfully
- `error` - Fired when there's an error loading or playing the playlist
- `playlistended` - Fired when playback of the entire playlist completes

### Event Example

```typescript
const player = document.querySelector('json-audio-player');

player.addEventListener('ready', () => {
  console.log('Player is ready');
});

player.addEventListener('error', (event) => {
  console.error('Player error:', event.detail);
});

player.addEventListener('playlistended', () => {
  console.log('Playlist finished');
});
```

## Development

### Build

```bash
npm run build
```

This will generate:
- `dist/json-audio-player.js` - The bundled JavaScript
- `dist/index.d.ts` - TypeScript type definitions
- `dist/json-audio-player.js.map` - Source map

### Dev Server

```bash
npm run dev
```

## Technical Details

This implementation concatenates audio chunks on the client-side rather than using proper audio muxing. This works when you have control over the audio format and can ensure all chunks are compatible (same codec, sample rate, etc.).

The player:
1. Fetches the JSON manifest from the provided URL
2. Downloads all audio chunks in parallel
3. Concatenates them into a single Blob
4. Creates an object URL for playback
5. Cleans up the blob URL when done

## License

MIT
