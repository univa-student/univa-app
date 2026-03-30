import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";
import * as fs from "node:fs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const ngrokHost = env.VITE_NGROK_HOST ?? '';

    return {
        plugins: [
            react(),
            tailwindcss(),
            {
                name: "dev-source-endpoint",
                apply: "serve",
                configureServer(server) {
                    server.middlewares.use("/__source", (req, res) => {
                        try {
                            const url = new URL(req.url ?? "", "http://localhost");
                            const file = url.searchParams.get("file");

                            if (!file) {
                                res.statusCode = 400;
                                res.end("Missing ?file=");
                                return;
                            }

                            const srcRoot = path.resolve(__dirname, "src");
                            const normalized = file.replace(/\\/g, "/");

                            const relativeFromSrc = normalized.startsWith("src/")
                                ? normalized.slice(4)
                                : normalized;

                            const abs = path.resolve(srcRoot, relativeFromSrc);

                            if (!abs.startsWith(srcRoot)) {
                                res.statusCode = 403;
                                res.end("Forbidden");
                                return;
                            }

                            const content = fs.readFileSync(abs, "utf8");
                            res.setHeader("Content-Type", "text/plain; charset=utf-8");
                            res.end(content);
                        } catch {
                            res.statusCode = 500;
                            res.end("Error reading source");
                        }
                    });
                },
            }
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        server: {
            host: true,
            // When VITE_NGROK_HOST is set we allow all hosts so any ngrok URL works.
            // Without this Vite rejects the request with "Blocked host" error.
            allowedHosts: ngrokHost
                ? true
                : [
                    "localhost",
                    "127.0.0.1",
                    "korbin-perigynous-metaphrastically.ngrok-free.dev",
                ],
            proxy: {
                "/api": {
                    target: "http://127.0.0.1:8000",
                    changeOrigin: true,
                    secure: false,
                },
                "/broadcasting": {
                    target: "http://127.0.0.1:8000",
                    changeOrigin: true,
                    secure: false,
                    // Also proxy WebSocket upgrade requests (used during broadcasting auth)
                    ws: true,
                },
                "/sanctum": {
                    target: "http://127.0.0.1:8000",
                    changeOrigin: true,
                    secure: false,
                },
                // Reverb WebSocket connections come in as /app/{key} — proxy them to
                // the Reverb server (port 8080 by default) with WebSocket upgrade support.
                "/app": {
                    target: `http://127.0.0.1:${env.VITE_REVERB_PORT ?? 8080}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
    };
});
