// Electron-specific server entry point (no Vite imports to avoid bundling issues)
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { initializeDefaultData } from "./init-data";
import path from "path";

const app = express();

// Augment IncomingMessage with rawBody for signature verification
declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

// Desktop app: always use memory-based sessions (single user)
app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "athena-ai-desktop-secret-key-2024",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // no HTTPS for local desktop app
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
    })
);

app.use(
    express.json({
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        },
    })
);

app.use(express.urlencoded({ extended: false }));

// CORS for Electron custom protocol
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin === "app://athena" || origin === "http://localhost:5000") {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }

    next();
});

// Simple logging for production
app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (reqPath.startsWith("/api")) {
            console.log(
                `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`
            );
        }
    });

    next();
});

// Static file serving for production (no Vite dev server)
function serveStatic(app: express.Application) {
    // Bundled file lives in dist/, static assets in dist/public
    const distPath = path.resolve(__dirname, "public");

    app.use(
        express.static(distPath, {
            setHeaders: (res, filepath) => {
                if (filepath.endsWith(".js")) {
                    res.setHeader("Content-Type", "application/javascript");
                } else if (filepath.endsWith(".css")) {
                    res.setHeader("Content-Type", "text/css");
                }
            },
        })
    );

    // Client-side routing → always serve index.html
    app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

(async () => {
    await initializeDefaultData();

    const server = await registerRoutes(app);

    app.use(
        (err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            res.status(status).json({ message });
            console.error(err);
        }
    );

    serveStatic(app);

    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
        {
            port,
            host: "0.0.0.0",
            reusePort: true,
        },
        () => {
            console.log(`Electron server running on port ${port}`);
        }
    );
})();
