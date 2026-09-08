import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = (env.VITE_BACKEND_URL || "https://valid-backend-production-10e9.up.railway.app").replace(/\/+$/, "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/user": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        "/inspections": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

