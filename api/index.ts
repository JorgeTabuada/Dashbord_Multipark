import express from "express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy-load heavy modules to catch import errors
let initialized = false;
let initError: string | null = null;

async function init() {
  if (initialized) return;
  try {
    const { registerOAuthRoutes } = await import("../server/_core/oauth");
    const { appRouter } = await import("../server/routers");
    const { createContext } = await import("../server/_core/context");
    const { createExternalApiRouter } = await import("../server/externalApi");
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");

    registerOAuthRoutes(app);
    app.use("/api/external", createExternalApiRouter());

    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    initialized = true;
  } catch (err: any) {
    initError = err.stack || err.message || String(err);
    console.error("[API Init Error]", initError);
  }
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: !initError, error: initError, env: !!process.env.DATABASE_URL });
});

// Wrap all requests to ensure init
const handler = async (req: any, res: any) => {
  await init();
  if (initError && !req.url.includes("/api/health")) {
    return res.status(500).json({ error: "Server init failed", details: initError });
  }
  app(req, res);
};

export default handler;
