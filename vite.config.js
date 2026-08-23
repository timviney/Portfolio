import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const gzContentTypes = [
  [".js.gz", "application/javascript"],
  [".wasm.gz", "application/wasm"],
  [".data.gz", "application/octet-stream"],
];

// Serves the Unity WebGL build (.gz assets in /public/tanks) with correct
// headers during development. In production, upload scripts set these headers.
function unityGzipHeaders() {
  return {
    name: "unity-gzip-dev-headers",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (path.endsWith(".gz")) {
          const match = gzContentTypes.find(([ext]) => path.endsWith(ext));
          if (match) res.setHeader("Content-Type", match[1]);
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Cache-Control", "no-store");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react({ include: /\.(js|jsx)$/ }),
    tailwindcss(),
    unityGzipHeaders(),
  ],
  build: {
    outDir: "build",
  },
});
