// Cron: Vercel chama /api/cron/multipark-cleanup às 3h da manhã.
// Safety net que apaga duplicados se algum aparecer (com UNIQUE constraint
// activo deve ser sempre 0, mas defensivo).

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
    const { getDb } = await import("../../server/db");
    const { sql } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) {
      res.status(500).json({ ok: false, error: "DB not available" });
      return;
    }

    // Apaga até 5000 duplicados (mantém o updatedAt mais recente)
    const result = await db.execute(sql`
      DELETE FROM multipark_bookings WHERE id IN (
        SELECT id FROM (
          SELECT b1.id FROM multipark_bookings b1
          INNER JOIN multipark_bookings b2
            ON b1.externalId = b2.externalId
           AND (
                 b1.updatedAt < b2.updatedAt
              OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
           )
          LIMIT 5000
        ) AS t
      )
    `) as any;
    const meta = Array.isArray(result[0]) ? result[0] : result;
    const deleted = Number((meta as any)?.affectedRows ?? 0);

    res.status(200).json({
      ok: true,
      ranAt: new Date().toISOString(),
      deleted,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: String(err?.message ?? err),
    });
  }
}
