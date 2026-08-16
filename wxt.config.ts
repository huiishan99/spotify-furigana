import { defineConfig } from "wxt";

export default defineConfig({
  vite: () => ({
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
  }),
  manifest: {
    name: "Spotify Furigana",
    short_name: "Furigana",
    description: "Show furigana above kanji in Japanese Spotify lyrics.",
    permissions: ["storage"],
    host_permissions: ["https://open.spotify.com/*"],
    web_accessible_resources: [
      {
        resources: ["kuromoji/*.dat.gz"],
        matches: ["https://open.spotify.com/*"],
      },
    ],
  },
});
