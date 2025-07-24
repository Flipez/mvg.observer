import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    remix({
      ssr: false, // Enable SPA mode
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    outDir: "build/client",
    assetsDir: "assets",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Prevent file names from starting with underscore (Go embed ignores them)
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name.startsWith("_")
            ? chunkInfo.name.slice(1)
            : chunkInfo.name
          return `assets/${name}-[hash].js`
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.startsWith("_")
            ? chunkInfo.name.slice(1)
            : chunkInfo.name
          return `assets/${name}-[hash].js`
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
