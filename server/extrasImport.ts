/**
 * Importação CSV de extras (condutores casuais) para a tabela employees.
 *
 * Formato CSV esperado (cabeçalho em qualquer ordem):
 *   nome, nivel, salario_mensal, subsidio_alim_dia, nif, nib, telefone,
 *   email, morada, nacionalidade, data_nascimento
 *
 * Linhas em branco são ignoradas. Erros por linha são reportados.
 */

import { createEmployee } from "./db";

const NIVEL_TO_EXTRA: Record<string, number> = {
  junior: 1,
  júnior: 1,
  senior: 2,
  sénior: 2,
  terminal: 3,
  master: 4,
};

const KNOWN_COLUMNS = new Set([
  "nome",
  "nivel",
  "nível",
  "salario_mensal",
  "salário_mensal",
  "subsidio_alim_dia",
  "subsídio_alim_dia",
  "nif",
  "nib",
  "telefone",
  "email",
  "morada",
  "nacionalidade",
  "data_nascimento",
]);

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function normHeader(h: string): string {
  return h.toLowerCase().trim().replace(/\s+/g, "_");
}

function pick(row: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function parseDecimal(s: string | undefined): string | null {
  if (!s) return null;
  const normalized = s.replace(",", ".");
  const n = parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}

export interface ImportReport {
  parsed: number;
  created: number;
  errors: { rowIndex: number; nome?: string; reason: string }[];
  unknownColumns: string[];
}

export async function importExtrasFromCsv(csvText: string, createdById?: number | null): Promise<ImportReport> {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const report: ImportReport = { parsed: 0, created: 0, errors: [], unknownColumns: [] };

  if (lines.length < 2) {
    report.errors.push({ rowIndex: 0, reason: "CSV vazio ou sem linhas de dados." });
    return report;
  }

  const headers = parseCsvLine(lines[0]).map(normHeader);
  for (const h of headers) {
    if (!KNOWN_COLUMNS.has(h)) report.unknownColumns.push(h);
  }
  if (!headers.includes("nome")) {
    report.errors.push({ rowIndex: 0, reason: "Falta coluna obrigatória 'nome'." });
    return report;
  }
  if (!headers.includes("nivel") && !headers.includes("nível")) {
    report.errors.push({ rowIndex: 0, reason: "Falta coluna obrigatória 'nivel'." });
    return report;
  }

  for (let i = 1; i < lines.length; i++) {
    report.parsed++;
    const cols = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j] ?? "";

    const nome = pick(row, "nome");
    if (!nome) {
      report.errors.push({ rowIndex: i + 1, reason: "Nome em falta." });
      continue;
    }

    const nivelRaw = pick(row, "nivel", "nível")?.toLowerCase() ?? "";
    const extraLevel = NIVEL_TO_EXTRA[nivelRaw];
    if (!extraLevel) {
      report.errors.push({
        rowIndex: i + 1,
        nome,
        reason: `Nível inválido '${nivelRaw}'. Usa junior, senior, terminal ou master.`,
      });
      continue;
    }

    try {
      await createEmployee({
        fullName: nome,
        email: pick(row, "email") ?? null,
        phone: pick(row, "telefone") ?? null,
        nif: pick(row, "nif") ?? null,
        nib: pick(row, "nib") ?? null,
        address: pick(row, "morada") ?? null,
        birthDate: pick(row, "data_nascimento") ?? null,
        nationality: pick(row, "nacionalidade") ?? null,
        position: "extra",
        extraLevel,
        contractType: "extra",
        monthlySalary: parseDecimal(pick(row, "salario_mensal", "salário_mensal")),
        mealAllowancePerDay: parseDecimal(pick(row, "subsidio_alim_dia", "subsídio_alim_dia")),
        isActive: 1,
      } as any);
      report.created++;
    } catch (err: any) {
      report.errors.push({ rowIndex: i + 1, nome, reason: err.message || String(err) });
    }
  }

  return report;
}
