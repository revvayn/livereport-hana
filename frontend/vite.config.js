import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // TAMBAHKAN BLOK SERVER DI BAWAH INI
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Pastikan ini port server Node.js Anda
        changeOrigin: true,
        secure: false,
      },
    },
  },
});