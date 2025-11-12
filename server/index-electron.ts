// Electron-specific server entry point (no Vite imports to avoid bundling issues)
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { initializeDefaultData } from "./init-data";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Desktop app always uses memory-based sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'athena-ai-desktop-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Desktop app doesn't use HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Configure CORS for Electron custom protocol
app.use((req, res, next) => {
  // Allow requests from Electron app using custom protocol
  const origin = req.headers.origin;
  if (origin === 'app://athena' || origin === 'http://localhost:5000') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Simple logging for production
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Static file serving for production (no Vite)
function serveStatic(app: express.Application) {
  // Serve static files from dist/public
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  app.use(express.static(distPath, {
    setHeaders: (res, filepath) => {
      // Set appropriate headers for different file types
      if (filepath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filepath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // Handle client-side routing by serving index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

(async () => {
  // Initialize default data for first-time setup
  await initializeDefaultData();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // Serve static files for production
  serveStatic(app);

  // Listen on port 5000 (Electron will connect to this)
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`Electron server running on port ${port}`);
  });
})();