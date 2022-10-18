import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtoolsPlugin from "@solid-devtools/transform";

export default defineConfig({
  plugins: [
    devtoolsPlugin({
      wrapStores: true,
      // jsxLocation: true,
      name: true, // Will automatically add names when creating signals, memos, stores, or mutables
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
