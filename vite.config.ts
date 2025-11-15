import react from "@vitejs/plugin-react-swc";
import path from "path";

const rootDir = process.cwd();

export default {
    plugins: [
        // React/TSX support
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(rootDir, "client", "src"),
            "@shared": path.resolve(rootDir, "shared"),
            "@assets": path.resolve(rootDir, "attached_assets"),
        },
    },
    root: path.resolve(rootDir, "client"),
    build: {
        outDir: path.resolve(rootDir, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
};
