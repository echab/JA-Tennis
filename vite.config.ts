/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
// import eslint from 'vite-plugin-eslint'

export default defineConfig((env) => ({
  plugins: [
    solid({
      start: true,
      hot: env.mode !== 'test', // no HMR for tests
      diagnostics: false,
    }),
    tailwindcss(),
    // eslint(),
  ],
  base: './',
  server: {
    port: 3001,
  },
  test: {
    environment: 'happy-dom',
    // setupFiles: ['node_modules/@testing-library/jest-dom/vitest'], // to import DOM matchers

    // if you have few tests, try commenting this out to improve performance:
    // isolate: false,
  },
  build: {
    target: 'esnext',
    // sourcemap: true, // debug
    minify: false, // debug
  },
  // resolve: {
  //   conditions: ['development', 'browser'],
  // },
}));
