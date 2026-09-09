import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import https from "https";
import http from "http";
import { Resolver } from "dns";
import { defineConfig, loadEnv } from "vite";

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address?: string | Array<{ address: string; family: number }>,
  family?: number
) => void;

function customLookup(
  hostname: string,
  options: unknown,
  callback: LookupCallback
) {
  const cb = (typeof options === "function" ? options : callback) as LookupCallback;
  const opts = (typeof options === "object" && options !== null ? options : {}) as { all?: boolean };

  resolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return cb(err || new Error("DNS resolution failed"));
    }
    if (opts.all) {
      return cb(null, addresses.map((addr) => ({ address: addr, family: 4 })));
    }
    return cb(null, addresses[0], 4);
  });
}

const httpsAgent = new https.Agent({ lookup: customLookup as unknown as https.AgentOptions["lookup"], keepAlive: true });
const httpAgent = new http.Agent({ lookup: customLookup as unknown as http.AgentOptions["lookup"], keepAlive: true });

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
          timeout: 120000,
          proxyTimeout: 120000,
        },
        "/inspections": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          agent: isHttps ? httpsAgent : httpAgent,
          timeout: 120000,
          proxyTimeout: 120000,
        },
      },
    },
  };
});

