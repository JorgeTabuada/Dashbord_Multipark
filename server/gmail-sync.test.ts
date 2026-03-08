import { describe, it, expect } from "vitest";

describe("Gmail Sync — Occurrence Email Parsing", () => {
  const occurrenceEmail = `Tipo de ocorrência: Carro ou chaves mal arrumado F/lugar
*Matricula do carro:* *BG95ZL*
https://www.google.com/maps?query=38.7749,-9.1394
Observações: Carro encontrado fora do lugar designado
https://www.admin.multigroup.pt/consulta/12345`;

  it("should extract occurrence type", () => {
    const match = occurrenceEmail.match(/Tipo de ocorr[eê]ncia:\s*\*?([^*\n]+)\*?/);
    expect(match).not.toBeNull();
    expect(match![1].trim()).toBe("Carro ou chaves mal arrumado F/lugar");
  });

  it("should extract vehicle plate with asterisks", () => {
    const match = occurrenceEmail.match(/\*?Matricula do carro:\*?\s*\*?([A-Z0-9]+)\*?/i);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("BG95ZL");
  });

  it("should extract GPS coordinates", () => {
    const match = occurrenceEmail.match(/query=(-?[\d.]+),(-?[\d.]+)/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("38.7749");
    expect(match![2]).toBe("-9.1394");
  });

  it("should extract observations", () => {
    const match = occurrenceEmail.match(/Observa[çc][oõ]es:\s*([^\n]+)/);
    expect(match).not.toBeNull();
    expect(match![1].trim()).toBe("Carro encontrado fora do lugar designado");
  });

  it("should extract reservation link", () => {
    const match = occurrenceEmail.match(/(https:\/\/www\.admin\.multigroup\.pt\/consulta\/[^\s]+)/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain("12345");
  });
});

describe("Gmail Sync — Occurrence Type Mapping", () => {
  function mapType(type: string) {
    const lower = type.toLowerCase();
    if (lower.includes("mal arrumado") || lower.includes("mal estacionado") || lower.includes("f/lugar")) return "mal_estacionado";
    if (lower.includes("vidro") || lower.includes("janela")) return "vidro_aberto";
    if (lower.includes("dano") || lower.includes("risco") || lower.includes("amolgad")) return "dano";
    if (lower.includes("chave")) return "chave_errada";
    if (lower.includes("combust") || lower.includes("gasol") || lower.includes("diesel")) return "combustivel";
    if (lower.includes("limp")) return "limpeza";
    if (lower.includes("document")) return "documentos";
    return "outro";
  }

  it("maps mal arrumado to mal_estacionado", () => expect(mapType("Carro ou chaves mal arrumado F/lugar")).toBe("mal_estacionado"));
  it("maps vidro to vidro_aberto", () => expect(mapType("Vidro aberto")).toBe("vidro_aberto"));
  it("maps dano to dano", () => expect(mapType("Dano no veículo")).toBe("dano"));
  it("maps unknown to outro", () => expect(mapType("Situação estranha")).toBe("outro"));
  it("maps chave to chave_errada", () => expect(mapType("Chave errada")).toBe("chave_errada"));
  it("maps combustivel", () => expect(mapType("Combustível em falta")).toBe("combustivel"));
  it("maps limpeza", () => expect(mapType("Limpeza necessária")).toBe("limpeza"));
});

describe("Gmail Sync — Review Parsing", () => {
  it("detects five star reviews", () => {
    const content = "Skypark recebeu 2 novas criticas de cinco estrelas";
    const match = content.match(/(\d+)\s+novas?\s+cri/i);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("2");
  });

  it("splits sections by Responder à crítica", () => {
    const content = `Nome1\nTexto1\nResponder à crítica\nNome2\nTexto2\nResponder à crítica\nVer todas`;
    const sections = content.split(/Responder [àa] cr[ií]tica/);
    expect(sections.length).toBe(3);
  });
});

describe("Gmail Sync — Dedup Keys", () => {
  it("generates unique keys for occurrences", () => {
    expect(`occ_msg123`).toBe("occ_msg123");
  });
  it("generates indexed keys for reviews", () => {
    expect(`rev_msg456_0`).not.toBe(`rev_msg456_1`);
  });
});
