import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow Vite dev server, localhost variants, and all Replit production domains
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
]);

// Replit production domains come in via REPLIT_DOMAINS (comma-separated)
const replitDomains = process.env.REPLIT_DOMAINS ?? "";
for (const domain of replitDomains.split(",")) {
  const d = domain.trim();
  if (d) {
    ALLOWED_ORIGINS.add(`https://${d}`);
    ALLOWED_ORIGINS.add(`http://${d}`);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin (no Origin header) and all allowed origins
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed — ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
