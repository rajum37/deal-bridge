import { Router, type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

const AICOO_BASE = "https://www.aicoo.io/api/v1";

// ── Rate limiter: 10 requests/sec per IP ─────────────────────────────────────
const aicooLimiter = rateLimit({
  windowMs: 1_000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
  validate: { xForwardedForHeader: false },
});

// ── Key helper ───────────────────────────────────────────────────────────────
function getKey(): string {
  const key = process.env.AICOO_API_KEY;
  if (!key) throw new Error("AICOO_API_KEY is not configured");
  return key;
}

function sanitizeKey(key: string): string {
  if (key.length <= 14) return "***";
  return `${key.slice(0, 10)}***${key.slice(-4)}`;
}

// ── Core proxy function ──────────────────────────────────────────────────────
async function proxyToAicoo(
  req: Request,
  res: Response,
  targetPath: string,
  method: string,
): Promise<void> {
  const key = getKey();
  const url = `${AICOO_BASE}${targetPath}`;
  const timestamp = new Date().toISOString();
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown";

  req.log.info(
    { method, path: `/api/aicoo${targetPath}`, ip, key: sanitizeKey(key) },
    `[${timestamp}] ${method} /api/aicoo${targetPath} from ${ip}`,
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  // Forward select headers from client
  if (req.headers["accept"]) headers["Accept"] = req.headers["accept"] as string;
  if (req.headers["x-request-id"])
    headers["X-Request-Id"] = req.headers["x-request-id"] as string;

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD" && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  // Append query string for GET requests
  const qs = new URLSearchParams(req.query as Record<string, string>).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;

  const upstreamRes = await fetch(fullUrl, fetchOptions);

  let body: unknown;
  const contentType = upstreamRes.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await upstreamRes.json();
  } else {
    body = { raw: await upstreamRes.text() };
  }

  if (upstreamRes.status === 401) {
    res.status(401).json({ error: "API key is invalid or missing" });
    return;
  }

  if (upstreamRes.status === 422) {
    const msg =
      typeof body === "object" &&
      body !== null &&
      "message" in body
        ? (body as { message: unknown }).message
        : body;
    res.status(422).json({ error: msg });
    return;
  }

  if (!upstreamRes.ok) {
    req.log.error({ status: upstreamRes.status, path: targetPath }, "Aicoo upstream error");
    res.status(upstreamRes.status >= 500 ? 500 : upstreamRes.status).json(
      upstreamRes.status >= 500 ? { error: "Server error" } : body,
    );
    return;
  }

  res.status(upstreamRes.status).json(body);
}

// ── Error handler for async proxy ────────────────────────────────────────────
function wrapAsync(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch((err: unknown) => {
      req.log.error({ err }, "Aicoo proxy error");
      if (!res.headersSent) {
        res.status(500).json({ error: "Server error" });
      }
      next(err);
    });
  };
}

// ── Parse NDJSON streaming response from Aicoo ───────────────────────────────
function parseAicooStream(rawText: string): string {
  const lines = rawText.split("\n").filter((l) => l.trim());
  let text = "";
  for (const line of lines) {
    try {
      const event = JSON.parse(line) as Record<string, unknown>;
      if (event.type === "text-delta" && typeof event.textDelta === "string") {
        text += event.textDelta;
      }
    } catch {
      // skip malformed lines
    }
  }
  // Strip <think>...</think> and <suggestions>...</suggestions> tags
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  text = text.replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "").trim();
  return text.trim();
}

// ── POST /api/chat — DealBridge AI COO chat (parsed, non-streaming) ───────────
router.post(
  "/chat",
  aicooLimiter,
  wrapAsync(async (req, res) => {
    const key = getKey();
    const body = req.body as { message?: string; systemPrompt?: string };

    if (!body.message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const upstreamRes = await fetch(`${AICOO_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ message: body.message }),
    });

    const rawText = await upstreamRes.text();

    if (!upstreamRes.ok) {
      req.log.error({ status: upstreamRes.status }, "Aicoo upstream error");
      res.status(502).json({ error: "Upstream AI error" });
      return;
    }

    const message = parseAicooStream(rawText);
    if (!message) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    res.json({ message });
  }),
);

// ── Named routes ─────────────────────────────────────────────────────────────
router.post(
  "/aicoo/chat",
  aicooLimiter,
  wrapAsync((req, res) => proxyToAicoo(req, res, "/chat", "POST")),
);

router.post(
  "/aicoo/accumulate",
  aicooLimiter,
  wrapAsync((req, res) => proxyToAicoo(req, res, "/accumulate", "POST")),
);

router.post(
  "/aicoo/share/create",
  aicooLimiter,
  wrapAsync((req, res) => proxyToAicoo(req, res, "/share/create", "POST")),
);

router.get(
  "/aicoo/tools",
  aicooLimiter,
  wrapAsync((req, res) => proxyToAicoo(req, res, "/tools", "GET")),
);

router.post(
  "/aicoo/tools",
  aicooLimiter,
  wrapAsync((req, res) => proxyToAicoo(req, res, "/tools", "POST")),
);

// ── Catch-all: /api/aicoo/* → https://www.aicoo.io/api/v1/* ─────────────────
router.all(
  "/aicoo/*catchAll",
  aicooLimiter,
  wrapAsync((req, res) => {
    const suffix = (req.params as Record<string, string>)["catchAll"] ?? "";
    return proxyToAicoo(req, res, `/${suffix}`, req.method);
  }),
);

export default router;
