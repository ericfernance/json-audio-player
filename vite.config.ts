import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "JsonAudioPlayer",
      fileName: "json-audio-player",
      formats: ["es"],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
