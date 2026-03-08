import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  // Dev login — skip Google OAuth in development mode
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/dev-login", async (req: Request, res: Response) => {
      try {
        const openId = "dev_admin_local";
        const name = "Admin Dev";
        const email = "admin@multipark.local";

        await db.upsertUser({
          openId,
          name,
          email,
          loginMethod: "google",
          role: "super_admin" as any,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        res.redirect(302, "/");
      } catch (error) {
        console.error("[Dev Login] Failed", error);
        res.status(500).json({ error: "Dev login failed", details: String(error) });
      }
    });
  }

  // Step 1: Redirect user to Google login
  app.get("/api/oauth/login", (_req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
      return;
    }

    const redirectUri = `${getOrigin(_req)}/api/oauth/callback`;
    const scope = "openid email profile";

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    res.redirect(302, url.toString());
  });

  // Step 2: Google redirects back here with code
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      const redirectUri = `${getOrigin(req)}/api/oauth/callback`;

      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);
      const userInfo = await sdk.getUserInfo(tokenResponse.access_token);

      if (!userInfo.sub) {
        res.status(400).json({ error: "Google user ID missing" });
        return;
      }

      // Use Google sub as openId
      const openId = `google_${userInfo.sub}`;

      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}
