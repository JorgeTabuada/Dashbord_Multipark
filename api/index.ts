import express from "express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { createExternalApiRouter } from "../server/externalApi";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let initError: string | null = null;

try {
  registerOAuthRoutes(app);
  app.use("/api/external", createExternalApiRouter());

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
} catch (err: any) {
  initError = err.stack || err.message || String(err);
  console.error("[API Init Error]", initError);
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: !initError, error: initError, env: !!process.env.DATABASE_URL });
});

// Handler for Vercel serverless
const handler = async (req: any, res: any) => {
  if (initError && !req.url.includes("/api/health")) {
    return res.status(500).json({ error: "Server init failed", details: initError });
  }
  app(req, res);
};

export default handler;
