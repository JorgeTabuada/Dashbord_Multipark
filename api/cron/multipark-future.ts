// Cron: Vercel chama /api/cron/multipark-future a cada 2 horas.
// Puxa janela das próximas 4 semanas (só checkin/checkout) para o /extras-dia
// planear escalas.

export default async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers["authorization"];
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  try {
    const { runFutureCronSync } = await import("../../server/jobs/multiparkBookingSync");
    const result = await runFutureCronSync(4);
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
