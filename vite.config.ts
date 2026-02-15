/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import tailwindcss from "@tailwindcss/vite";
// import eslint from 'vite-plugin-eslint'

export default defineConfig((env) => ({
  plugins: [
    solid({
      hot: env.mode !== 'test', // no HMR for tests
    }),
    devtools({
      autoname: true, // Will automatically add names when creating signals, memos, stores, or mutables
      locator: true,
    }),
    tailwindcss(),
    // eslint(),
  ],
  server: {
    port: 3001,
  },
  test: {
    // environment: 'happy-dom',
    // globals: true,
    // setupFiles: ['node_modules/@testing-library/jest-dom/vitest'], // to import DOM matchers
    // restoreMocks: true,
    // mockReset: true,
    clearMocks: true,

    // if you have few tests, try commenting this out to improve performance:
    // isolate: false,

    server: {
      deps: {
        inline: [/@solidjs\/router/], // https://github.com/solidjs/vite-plugin-solid/issues/157
      },
    },
  },
  build: {
    target: 'esnext',
    // sourcemap: true, // debug
    minify: false, // debug
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
}));
