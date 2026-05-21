import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * BUILD_TARGET=lib  → Library-Mode (UMD/ESM), Output: dist/
 * BUILD_TARGET=demo → SPA-Mode (Senker-Landing als Static Site), Output: dist-demo/
 * Standard (kein BUILD_TARGET): lib.
 */
const buildTarget = (process.env.BUILD_TARGET ?? 'lib') as 'lib' | 'demo'

export default defineConfig(() => {
  if (buildTarget === 'demo') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist-demo',
        emptyOutDir: true,
        sourcemap: false,
      },
      server: {
        port: 5173,
        open: '/index.html',
      },
    }
  }

  return {
    plugins: [
      react(),
      dts({
        entryRoot: 'src',
        include: ['src/index.ts', 'src/widget/**/*', 'src/state/**/*'],
        exclude: ['**/*.test.*', '**/*.stub', 'src/demo/**/*'],
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'BookingWidget',
        formats: ['es', 'umd'],
        fileName: (format) =>
          format === 'es' ? 'booking-widget.es.js' : 'booking-widget.umd.js',
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
          inlineDynamicImports: true,
          exports: 'named',
        },
      },
      // Alle Brand-/Modell-Bilder unter 100KB werden als data-URI ins JS-Bundle
      // inlined. Damit bleibt die Library ein einziges Script-File und
      // funktioniert auf jeder Fremdseite ohne zusätzliche Asset-Requests.
      assetsInlineLimit: 100_000,
      sourcemap: true,
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      open: '/index.html',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      css: false,
    },
  }
})
