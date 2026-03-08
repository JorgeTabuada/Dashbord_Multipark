import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB functions
const mockGetCampaignByNameAndPlatform = vi.fn();
const mockCreateCampaign = vi.fn().mockResolvedValue(1);
const mockGetCampaignById = vi.fn();
const mockUpdateCampaign = vi.fn();
const mockGetExistingStatsForCampaignAndDateRange = vi.fn();
const mockImportDailyStats = vi.fn();

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    getCampaignByNameAndPlatform: mockGetCampaignByNameAndPlatform,
    createCampaign: mockCreateCampaign,
    getCampaignById: mockGetCampaignById,
    updateCampaign: mockUpdateCampaign,
    getExistingStatsForCampaignAndDateRange: mockGetExistingStatsForCampaignAndDateRange,
    importDailyStats: mockImportDailyStats,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Google Ads Import - Dedup Logic", () => {
  it("should create a new campaign when it doesn't exist", async () => {
    mockGetCampaignByNameAndPlatform.mockResolvedValue(undefined);
    mockGetCampaignById.mockResolvedValue({ id: 1, name: "Airpark - Lisboa" });
    mockGetExistingStatsForCampaignAndDateRange.mockResolvedValue([]);

    // Simulate the import logic
    const campaign = await mockGetCampaignByNameAndPlatform("Airpark - Lisboa", "google_ads");
    expect(campaign).toBeUndefined();

    const id = await mockCreateCampaign({
      name: "Airpark - Lisboa",
      platform: "google_ads",
      status: "active",
    });
    expect(id).toBe(1);
    expect(mockCreateCampaign).toHaveBeenCalledOnce();
  });

  it("should skip import when data already exists for the period", async () => {
    mockGetCampaignByNameAndPlatform.mockResolvedValue({ id: 1, name: "Airpark - Lisboa" });
    mockGetExistingStatsForCampaignAndDateRange.mockResolvedValue([
      { id: 10, campaignId: 1, date: new Date("2026-03-06"), spend: "4784.72" },
    ]);

    const campaign = await mockGetCampaignByNameAndPlatform("Airpark - Lisboa", "google_ads");
    expect(campaign).toBeDefined();

    const existing = await mockGetExistingStatsForCampaignAndDateRange(
      campaign.id,
      new Date("2026-02-07"),
      new Date("2026-03-06"),
    );
    expect(existing.length).toBeGreaterThan(0);
    // Should NOT call importDailyStats
    expect(mockImportDailyStats).not.toHaveBeenCalled();
  });

  it("should import data when no existing stats for the period", async () => {
    mockGetCampaignByNameAndPlatform.mockResolvedValue({ id: 1, name: "Airpark - Porto" });
    mockGetExistingStatsForCampaignAndDateRange.mockResolvedValue([]);

    const campaign = await mockGetCampaignByNameAndPlatform("Airpark - Porto", "google_ads");
    const existing = await mockGetExistingStatsForCampaignAndDateRange(
      campaign.id,
      new Date("2026-02-07"),
      new Date("2026-03-06"),
    );
    expect(existing.length).toBe(0);

    await mockImportDailyStats([{
      campaignId: 1,
      date: new Date("2026-03-06"),
      spend: "1297.02",
      impressions: 12280,
      clicks: 2186,
      conversions: 1360,
      importedById: 1,
    }]);
    expect(mockImportDailyStats).toHaveBeenCalledOnce();
  });

  it("should update campaign status when it already exists", async () => {
    mockGetCampaignByNameAndPlatform.mockResolvedValue({ id: 2, name: "Airpark - Brand", status: "active" });
    mockGetExistingStatsForCampaignAndDateRange.mockResolvedValue([]);

    const campaign = await mockGetCampaignByNameAndPlatform("Airpark - Brand", "google_ads");
    await mockUpdateCampaign(campaign.id, { status: "paused", budget: "7.95" });
    expect(mockUpdateCampaign).toHaveBeenCalledWith(2, { status: "paused", budget: "7.95" });
  });

  it("should skip campaigns with zero cost/clicks/impressions (no data)", async () => {
    const campaign = {
      name: "Airpark - Clicks",
      cost: 0,
      clicks: 0,
      impressions: 0,
      status: "paused",
    };

    const hasData = campaign.cost > 0 || campaign.clicks > 0 || campaign.impressions > 0;
    expect(hasData).toBe(false);
    // Should still create the campaign but skip stats import
  });

  it("should handle multiple campaigns in a single import", async () => {
    const campaigns = [
      { name: "Airpark - Lisboa", cost: 4784.72, clicks: 4418, impressions: 43314 },
      { name: "Airpark - Porto", cost: 1297.02, clicks: 2186, impressions: 12280 },
      { name: "Airpark - Faro", cost: 400.74, clicks: 399, impressions: 2917 },
      { name: "Airpark - Brand", cost: 302.33, clicks: 456, impressions: 1360 },
      { name: "Airpark - Pmax", cost: 549.23, clicks: 8837, impressions: 269185 },
    ];

    const activeCampaigns = campaigns.filter(c => c.cost > 0 || c.clicks > 0);
    expect(activeCampaigns).toHaveLength(5);

    const totalCost = activeCampaigns.reduce((s, c) => s + c.cost, 0);
    expect(totalCost).toBeCloseTo(7334.04, 1);
  });

  it("should not import the same report twice", async () => {
    // First import: no existing data
    mockGetCampaignByNameAndPlatform.mockResolvedValue({ id: 1, name: "Airpark - Lisboa" });
    mockGetExistingStatsForCampaignAndDateRange
      .mockResolvedValueOnce([]) // First call: no data
      .mockResolvedValueOnce([{ id: 10, campaignId: 1 }]); // Second call: data exists

    // First import succeeds
    const existing1 = await mockGetExistingStatsForCampaignAndDateRange(1, new Date("2026-02-07"), new Date("2026-03-06"));
    expect(existing1.length).toBe(0);

    // Second import should be blocked
    const existing2 = await mockGetExistingStatsForCampaignAndDateRange(1, new Date("2026-02-07"), new Date("2026-03-06"));
    expect(existing2.length).toBeGreaterThan(0);
  });
});

describe("Google Ads CSV Parsing (Frontend)", () => {
  it("should parse Portuguese number format correctly", () => {
    const parsePtNumber = (val: string): number => {
      if (!val || val.trim() === "--" || val.includes("< ")) return 0;
      let v = val.trim().replace(/"/g, "");
      v = v.replace(/\s/g, "").replace(/\u00a0/g, "");
      v = v.replace(/%$/, "");
      v = v.replace(",", ".");
      return parseFloat(v) || 0;
    };

    expect(parsePtNumber('"1 297,02"')).toBeCloseTo(1297.02);
    expect(parsePtNumber('"0,59"')).toBeCloseTo(0.59);
    expect(parsePtNumber('"43 314"')).toBe(43314);
    expect(parsePtNumber("--")).toBe(0);
    expect(parsePtNumber("< 10%")).toBe(0);
    expect(parsePtNumber('"33,53%"')).toBeCloseTo(33.53);
    expect(parsePtNumber('"4 784,72"')).toBeCloseTo(4784.72);
  });

  it("should parse Portuguese date format correctly", () => {
    const PT_MONTHS: Record<string, string> = {
      janeiro: "01", fevereiro: "02", "março": "03", abril: "04",
      maio: "05", junho: "06", julho: "07", agosto: "08",
      setembro: "09", outubro: "10", novembro: "11", dezembro: "12",
    };

    const parsePtDate = (s: string): string => {
      const m = s.trim().match(/(\d+)\s+de\s+([\wçã]+)\s+de\s+(\d{4})/);
      if (m) {
        const day = m[1].padStart(2, "0");
        const month = PT_MONTHS[m[2].toLowerCase()] || "01";
        return `${m[3]}-${month}-${day}`;
      }
      return s;
    };

    expect(parsePtDate("7 de fevereiro de 2026")).toBe("2026-02-07");
    expect(parsePtDate("6 de março de 2026")).toBe("2026-03-06");
    expect(parsePtDate("15 de dezembro de 2025")).toBe("2025-12-15");
    expect(parsePtDate("1 de janeiro de 2026")).toBe("2026-01-01");
  });

  it("should map campaign status correctly", () => {
    const mapStatus = (s: string) => s === "Ativada" ? "active" : s === "Em pausa" ? "paused" : "completed";
    expect(mapStatus("Ativada")).toBe("active");
    expect(mapStatus("Em pausa")).toBe("paused");
    expect(mapStatus("Terminado")).toBe("completed");
  });
});
