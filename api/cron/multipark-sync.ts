// Cron: Vercel chama /api/cron/multipark-sync a cada 15 minutos.
// Faz: report últimos 30min + enrich (50) + history (30) em paralelo.

export default async function handler(req: any, res: any) {
  // Autenticação: Vercel Cron envia Authorization: Bearer <CRON_SECRET>.
  // Se a env var existir, validamos. Em dev local, permite chamadas sem token.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  try {
    const { runRecentCronSync } = await import("../../server/jobs/multiparkBookingSync");
    const result = await runRecentCronSync(30);
    res.status(200).json({
      ok: true,
      ranAt: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: String(err?.message ?? err),
    });
  }
}
