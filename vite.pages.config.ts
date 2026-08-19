import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "github-pages",
  base: "/game-museum/",
  plugins: [react()],
  publicDir: "../public",
  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
  },
});
