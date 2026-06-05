import express from "express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { createExternalApiRouter } from "../externalApi";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sdk } from "./sdk";
import { getBookingTryAllParks } from "../multipark";

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

// Debug endpoint: fetch raw booking JSON straight from MultiPark API.
// Admin-only (session cookie). Usage: /api/debug/booking?id=cm...
app.get("/api/debug/booking", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden — admin only" });
    }
    const id = String(req.query.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "Missing ?id=<externalId>" });

    const found = await getBookingTryAllParks(id);
    if (!found) {
      return res.status(404).json({
        error: "Reserva não encontrada em nenhum parque",
        triedKeys: Object.keys(process.env).filter(k => k.startsWith("MULTIPARK_API_KEY_")),
      });
    }

    return res.json({
      park: `${found.parkConfig.name} (${found.parkConfig.city})`,
      parkId: found.parkConfig.id,
      booking: found.booking,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Health check com diagnóstico de env vars críticas (sem expor valores)
app.get("/api/health", (_req, res) => {
  res.json({
    ok: !initError,
    error: initError,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      VITE_APP_ID: !!process.env.VITE_APP_ID,
      NODE_ENV: process.env.NODE_ENV ?? null,
    },
  });
});

// Handler for Vercel serverless
const handler = async (req: any, res: any) => {
  if (initError && !req.url.includes("/api/health")) {
    return res.status(500).json({ error: "Server init failed", details: initError });
  }
  app(req, res);
};

export default handler;
