// Intervalos rápidos partilhados pelas páginas de Operações.
// Datas formatadas em hora LOCAL (evita o shift de fuso do toISOString).

function pad(n: number) { return String(n).padStart(2, "0"); }
export function isoLocal(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // segunda = 0
  x.setDate(x.getDate() - day);
  return x;
}

export type QuickRange = { id: string; label: string; calc: () => [string, string] };

export const OPERACOES_QUICK_RANGES: QuickRange[] = [
  { id: "today", label: "Hoje", calc: () => { const d = new Date(); return [isoLocal(d), isoLocal(d)]; } },
  { id: "tomorrow", label: "Amanhã", calc: () => { const d = new Date(); d.setDate(d.getDate() + 1); return [isoLocal(d), isoLocal(d)]; } },
  { id: "yesterday", label: "Ontem", calc: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [isoLocal(d), isoLocal(d)]; } },
  {
    id: "thisWeek", label: "Esta semana", calc: () => {
      const s = startOfWeek(new Date()); const e = new Date(s); e.setDate(s.getDate() + 6);
      return [isoLocal(s), isoLocal(e)];
    },
  },
  {
    id: "lastWeek", label: "Semana passada", calc: () => {
      const s = startOfWeek(new Date()); s.setDate(s.getDate() - 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return [isoLocal(s), isoLocal(e)];
    },
  },
  {
    id: "thisMonth", label: "Este mês", calc: () => {
      const n = new Date();
      return [isoLocal(new Date(n.getFullYear(), n.getMonth(), 1)), isoLocal(new Date(n.getFullYear(), n.getMonth() + 1, 0))];
    },
  },
  {
    id: "lastMonth", label: "Mês passado", calc: () => {
      const n = new Date();
      return [isoLocal(new Date(n.getFullYear(), n.getMonth() - 1, 1)), isoLocal(new Date(n.getFullYear(), n.getMonth(), 0))];
    },
  },
  {
    id: "thisYear", label: "Este ano", calc: () => {
      const y = new Date().getFullYear(); return [`${y}-01-01`, `${y}-12-31`];
    },
  },
  {
    id: "lastYear", label: "Ano passado", calc: () => {
      const y = new Date().getFullYear() - 1; return [`${y}-01-01`, `${y}-12-31`];
    },
  },
];

/** Intervalo por omissão das Operações: o mês corrente. */
export function thisMonthRange(): [string, string] {
  const n = new Date();
  return [isoLocal(new Date(n.getFullYear(), n.getMonth(), 1)), isoLocal(new Date(n.getFullYear(), n.getMonth() + 1, 0))];
}

/** Período anterior com a mesma duração (para comparação). */
export function previousPeriod(from: string, to: string): [string, string] {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const days = Math.round((t.getTime() - f.getTime()) / 86400000) + 1;
  const pf = new Date(f); pf.setDate(pf.getDate() - days);
  const pt = new Date(f); pt.setDate(pt.getDate() - 1);
  return [isoLocal(pf), isoLocal(pt)];
}

export function QuickRangeBar({
  active, onPick, className,
}: {
  active?: string;
  onPick: (from: string, to: string, id: string) => void;
  className?: string;
}) {
  return (
    <div className={"flex flex-wrap gap-1.5 " + (className ?? "")}>
      {OPERACOES_QUICK_RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => { const [f, t] = r.calc(); onPick(f, t, r.id); }}
          className={
            "text-xs px-2 py-1 rounded border transition-colors " +
            (active === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 hover:bg-muted")
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
