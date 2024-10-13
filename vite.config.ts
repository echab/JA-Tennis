import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
// import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    solid({
      // hot: false, // currently HMR breaks displaying components https://github.com/solidjs/solid-refresh/pull/41 will fix this
    }),
    devtools({
      autoname: true, // Will automatically add names when creating signals, memos, stores, or mutables
      locator: true,
    }),
    // eslint(),
  ],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    // sourcemap: true,
    // minify: false,
  },
});
