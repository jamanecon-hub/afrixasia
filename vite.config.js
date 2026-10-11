import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { attachApi } from "./server/api.mjs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "afrixasia-api",
      configureServer(server) {
        attachApi(server.middlewares);
      },
      configurePreviewServer(server) {
        attachApi(server.middlewares);
      },
    },
  ],
  server: { port: 3000 },
  preview: { port: 3000 },
});
