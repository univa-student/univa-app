import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";
import * as fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
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
})
