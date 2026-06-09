/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext':
        'react-transition-group/esm/TransitionGroupContext.js',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['@mui/material', 'react-transition-group'],
      },
    },
  },
});
