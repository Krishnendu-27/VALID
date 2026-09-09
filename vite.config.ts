import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import https from "https";
import http from "http";
import { Resolver } from "dns";
import { defineConfig, loadEnv } from "vite";

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

function customLookup(
  hostname: string,
  options: any,
  callback: (err: Error | null, address?: any, family?: number) => void
) {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "object" ? options : {};

  resolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return cb(err || new Error("DNS resolution failed"));
    }
    if (opts && opts.all) {
      return cb(null, addresses.map((addr) => ({ address: addr, family: 4 })));
    }
    return cb(null, addresses[0], 4);
  });
}

const httpsAgent = new https.Agent({ lookup: customLookup as any, keepAlive: true });
const httpAgent = new http.Agent({ lookup: customLookup as any, keepAlive: true });

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = (env.VITE_BACKEND_URL || "https://valid-backend-production-10e9.up.railway.app").replace(/\/+$/, "");
  const isHttps = backendUrl.startsWith("https:");

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
          agent: isHttps ? httpsAgent : httpAgent,
        },
        "/inspections": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          agent: isHttps ? httpsAgent : httpAgent,
        },
      },
    },
  };
});

