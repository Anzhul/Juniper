import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IIIFViewer',
      fileName: 'iiif-viewer',
    },
    rollupOptions: {
      external: ['gl-matrix'],
      output: {
        globals: {
          'gl-matrix': 'glMatrix',
        },
      },
    },
  },
  plugins: [
    {
      name: 'copy-theme',
      closeBundle() {
        // Ship the unminified theme file so consumers can copy and edit it
        copyFileSync(
          resolve(__dirname, 'src/IIIF/ui/iiif-theme.css'),
          resolve(__dirname, 'dist/iiif-theme.css')
        );
      },
    },
  ],
});
