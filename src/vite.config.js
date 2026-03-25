import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { base44VitePlugin } from '@base44/vite-plugin';

export default defineConfig({
  plugins: [
    base44VitePlugin(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
});