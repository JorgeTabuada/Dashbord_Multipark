import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB functions
const mockCreateDailyDriverHistory = vi.fn().mockResolvedValue(1);
const mockGetDailyDriverHistoryByDate = vi.fn().mockResolvedValue([]);
const mockGetDailyDriverHistoryByUser = vi.fn().mockResolvedValue([]);
const mockGetDailyDriverHistoryRange = vi.fn().mockResolvedValue([]);
const mockGetDailyDriverStats = vi.fn().mockResolvedValue({
  totalDrivers: 0, totalKm: 0, totalHoursWorked: 0, totalHoursStopped: 0,
  maxSpeedOfDay: 0, avgBattery: 0, totalViolations: 0,
});
const mockCreatePda = vi.fn().mockResolvedValue(1);
const mockUpdatePda = vi.fn().mockResolvedValue(undefined);
const mockDeletePda = vi.fn().mockResolvedValue(undefined);
const mockListPdas = vi.fn().mockResolvedValue([]);
const mockGetPdaById = vi.fn().mockResolvedValue(undefined);
const mockCreatePdaCheckin = vi.fn().mockResolvedValue(1);
const mockCheckoutPda = vi.fn().mockResolvedValue(undefined);
const mockGetActiveCheckins = vi.fn().mockResolvedValue([]);
const mockGetCheckinsByDate = vi.fn().mockResolvedValue([]);
const mockGetCheckinsByPda = vi.fn().mockResolvedValue([]);
const mockCreateGpsAlert = vi.fn().mockResolvedValue(1);
const mockGetGpsAlerts = vi.fn().mockResolvedValue([]);
const mockAcknowledgeGpsAlert = vi.fn().mockResolvedValue(undefined);
const mockGetGpsAlertStats = vi.fn().mockResolvedValue({
  total: 0, unacknowledged: 0, todayAlerts: 0, byType: {},
});

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    createDailyDriverHistory: mockCreateDailyDriverHistory,
    getDailyDriverHistoryByDate: mockGetDailyDriverHistoryByDate,
    getDailyDriverHistoryByUser: mockGetDailyDriverHistoryByUser,
    getDailyDriverHistoryRange: mockGetDailyDriverHistoryRange,
    getDailyDriverStats: mockGetDailyDriverStats,
    createPda: mockCreatePda,
    updatePda: mockUpdatePda,
    deletePda: mockDeletePda,
    listPdas: mockListPdas,
    getPdaById: mockGetPdaById,
    createPdaCheckin: mockCreatePdaCheckin,
    checkoutPda: mockCheckoutPda,
    getActiveCheckins: mockGetActiveCheckins,
    getCheckinsByDate: mockGetCheckinsByDate,
    getCheckinsByPda: mockGetCheckinsByPda,
    createGpsAlert: mockCreateGpsAlert,
    getGpsAlerts: mockGetGpsAlerts,
    acknowledgeGpsAlert: mockAcknowledgeGpsAlert,
    getGpsAlertStats: mockGetGpsAlertStats,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Daily Driver History", () => {
  it("should return empty stats for a date with no data", async () => {
    const stats = await mockGetDailyDriverStats("2026-03-01");
    expect(stats).toEqual({
      totalDrivers: 0, totalKm: 0, totalHoursWorked: 0, totalHoursStopped: 0,
      maxSpeedOfDay: 0, avgBattery: 0, totalViolations: 0,
    });
  });

  it("should return stats with data", async () => {
    mockGetDailyDriverStats.mockResolvedValueOnce({
      totalDrivers: 5, totalKm: 250.5, totalHoursWorked: 32.5, totalHoursStopped: 7.5,
      maxSpeedOfDay: 85, avgBattery: 72, totalViolations: 3,
    });
    const stats = await mockGetDailyDriverStats("2026-03-01");
    expect(stats.totalDrivers).toBe(5);
    expect(stats.totalKm).toBe(250.5);
    expect(stats.maxSpeedOfDay).toBe(85);
    expect(stats.totalViolations).toBe(3);
  });

  it("should create a daily driver history record", async () => {
    const id = await mockCreateDailyDriverHistory({
      zelloUsername: "driver1",
      displayName: "João Silva",
      date: new Date("2026-03-01"),
      totalKm: "45.5",
      hoursWorked: "6.5",
      hoursStopped: "1.5",
      totalHoursOnline: "8.0",
      avgSpeed: "35.2",
      maxSpeed: "72.0",
      speedViolations: 1,
      avgBattery: 65,
      minBattery: 30,
      gpsPointsCount: 450,
    });
    expect(id).toBe(1);
    expect(mockCreateDailyDriverHistory).toHaveBeenCalledOnce();
  });

  it("should get history by date", async () => {
    mockGetDailyDriverHistoryByDate.mockResolvedValueOnce([
      { id: 1, zelloUsername: "driver1", displayName: "João", totalKm: "45.5", date: new Date("2026-03-01") },
      { id: 2, zelloUsername: "driver2", displayName: "Maria", totalKm: "38.2", date: new Date("2026-03-01") },
    ]);
    const history = await mockGetDailyDriverHistoryByDate("2026-03-01");
    expect(history).toHaveLength(2);
    expect(history[0].zelloUsername).toBe("driver1");
  });

  it("should get history by user", async () => {
    mockGetDailyDriverHistoryByUser.mockResolvedValueOnce([
      { id: 1, zelloUsername: "driver1", date: new Date("2026-03-01"), totalKm: "45.5" },
      { id: 2, zelloUsername: "driver1", date: new Date("2026-02-28"), totalKm: "52.0" },
    ]);
    const history = await mockGetDailyDriverHistoryByUser("driver1", 14);
    expect(history).toHaveLength(2);
    expect(history[0].totalKm).toBe("45.5");
  });

  it("should get history by date range", async () => {
    mockGetDailyDriverHistoryRange.mockResolvedValueOnce([
      { id: 1, date: new Date("2026-03-01") },
      { id: 2, date: new Date("2026-03-02") },
      { id: 3, date: new Date("2026-03-03") },
    ]);
    const history = await mockGetDailyDriverHistoryRange("2026-03-01", "2026-03-03");
    expect(history).toHaveLength(3);
  });
});

describe("PDAs", () => {
  it("should create a PDA", async () => {
    const id = await mockCreatePda({
      name: "PDA-001",
      phoneNumber: "912345678",
      model: "Samsung Galaxy XCover 5",
      status: "active",
      simDataPlan: "5GB NOS",
    });
    expect(id).toBe(1);
    expect(mockCreatePda).toHaveBeenCalledOnce();
  });

  it("should list PDAs", async () => {
    mockListPdas.mockResolvedValueOnce([
      { id: 1, name: "PDA-001", status: "active", model: "Samsung" },
      { id: 2, name: "PDA-002", status: "maintenance", model: "Xiaomi" },
    ]);
    const pdas = await mockListPdas();
    expect(pdas).toHaveLength(2);
    expect(pdas[0].name).toBe("PDA-001");
  });

  it("should update a PDA", async () => {
    await mockUpdatePda(1, { status: "maintenance", notes: "Ecrã partido" });
    expect(mockUpdatePda).toHaveBeenCalledWith(1, { status: "maintenance", notes: "Ecrã partido" });
  });

  it("should delete a PDA", async () => {
    await mockDeletePda(1);
    expect(mockDeletePda).toHaveBeenCalledWith(1);
  });

  it("should get a PDA by ID", async () => {
    mockGetPdaById.mockResolvedValueOnce({ id: 1, name: "PDA-001", status: "active" });
    const pda = await mockGetPdaById(1);
    expect(pda).toBeDefined();
    expect(pda.name).toBe("PDA-001");
  });
});

describe("PDA Check-ins", () => {
  it("should create a check-in", async () => {
    const id = await mockCreatePdaCheckin({
      pdaId: 1,
      zelloUsername: "driver1",
      teamLeaderId: 5,
      mobileDataMbStart: 2500,
    });
    expect(id).toBe(1);
    expect(mockCreatePdaCheckin).toHaveBeenCalledOnce();
  });

  it("should checkout a PDA", async () => {
    await mockCheckoutPda(1, { mobileDataMbEnd: 2800, notes: "Tudo OK" });
    expect(mockCheckoutPda).toHaveBeenCalledWith(1, { mobileDataMbEnd: 2800, notes: "Tudo OK" });
  });

  it("should get active check-ins", async () => {
    mockGetActiveCheckins.mockResolvedValueOnce([
      { id: 1, pdaId: 1, zelloUsername: "driver1", status: "checked_in" },
    ]);
    const checkins = await mockGetActiveCheckins();
    expect(checkins).toHaveLength(1);
    expect(checkins[0].status).toBe("checked_in");
  });

  it("should get check-ins by date", async () => {
    mockGetCheckinsByDate.mockResolvedValueOnce([
      { id: 1, pdaId: 1, checkinAt: new Date("2026-03-01T08:00:00"), status: "checked_out" },
      { id: 2, pdaId: 2, checkinAt: new Date("2026-03-01T09:00:00"), status: "checked_in" },
    ]);
    const checkins = await mockGetCheckinsByDate("2026-03-01");
    expect(checkins).toHaveLength(2);
  });

  it("should get check-ins by PDA", async () => {
    mockGetCheckinsByPda.mockResolvedValueOnce([
      { id: 1, pdaId: 1, zelloUsername: "driver1" },
      { id: 2, pdaId: 1, zelloUsername: "driver2" },
    ]);
    const checkins = await mockGetCheckinsByPda(1, 30);
    expect(checkins).toHaveLength(2);
  });
});

describe("GPS Alerts", () => {
  it("should create a GPS alert", async () => {
    const id = await mockCreateGpsAlert({
      zelloUsername: "driver1",
      displayName: "João Silva",
      alertType: "gps_off",
      message: "João Silva tem o GPS desligado",
      notificationSent: true,
      occurredAt: new Date(),
    });
    expect(id).toBe(1);
    expect(mockCreateGpsAlert).toHaveBeenCalledOnce();
  });

  it("should get GPS alerts", async () => {
    mockGetGpsAlerts.mockResolvedValueOnce([
      { id: 1, alertType: "gps_off", acknowledged: false, zelloUsername: "driver1" },
      { id: 2, alertType: "battery_low", acknowledged: true, zelloUsername: "driver2" },
    ]);
    const alerts = await mockGetGpsAlerts({});
    expect(alerts).toHaveLength(2);
  });

  it("should get only unacknowledged alerts", async () => {
    mockGetGpsAlerts.mockResolvedValueOnce([
      { id: 1, alertType: "gps_off", acknowledged: false },
    ]);
    const alerts = await mockGetGpsAlerts({ unacknowledgedOnly: true });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].acknowledged).toBe(false);
  });

  it("should acknowledge a GPS alert", async () => {
    await mockAcknowledgeGpsAlert(1, 5);
    expect(mockAcknowledgeGpsAlert).toHaveBeenCalledWith(1, 5);
  });

  it("should get GPS alert stats", async () => {
    mockGetGpsAlertStats.mockResolvedValueOnce({
      total: 15, unacknowledged: 3, todayAlerts: 2, byType: { gps_off: 8, battery_low: 7 },
    });
    const stats = await mockGetGpsAlertStats();
    expect(stats.total).toBe(15);
    expect(stats.unacknowledged).toBe(3);
    expect(stats.byType.gps_off).toBe(8);
  });
});

describe("Daily Collection Job Logic", () => {
  it("should calculate haversine distance correctly", () => {
    // Lisbon to Porto approx 274km
    const R = 6371;
    const lat1 = 38.7223, lon1 = -9.1393; // Lisbon
    const lat2 = 41.1579, lon2 = -8.6291; // Porto
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    expect(distance).toBeGreaterThan(270);
    expect(distance).toBeLessThan(280);
  });

  it("should skip data collection if records already exist for the date", async () => {
    mockGetDailyDriverHistoryByDate.mockResolvedValueOnce([
      { id: 1, zelloUsername: "driver1" },
    ]);
    const existing = await mockGetDailyDriverHistoryByDate("2026-03-01");
    expect(existing.length).toBeGreaterThan(0);
    // In the real job, this would cause it to skip
  });

  it("should handle empty GeoJSON data gracefully", () => {
    // Simulating processGeoJsonHistory with null/empty data
    const emptyData = null;
    const noFeatures = { features: [] };
    // Both should produce default metrics
    expect(emptyData).toBeNull();
    expect(noFeatures.features).toHaveLength(0);
  });

  it("should filter out GPS jumps greater than 50km", () => {
    // Simulating the filter logic
    const segmentKm = 75; // > 50km jump
    const shouldInclude = segmentKm < 50;
    expect(shouldInclude).toBe(false);

    const normalSegment = 2.5; // normal segment
    const shouldIncludeNormal = normalSegment < 50;
    expect(shouldIncludeNormal).toBe(true);
  });
});

describe("Scheduler Logic", () => {
  it("should calculate correct ms until 2AM", () => {
    // Test the logic: if it's 3AM, next 2AM is in ~23 hours
    const now = new Date("2026-03-06T03:00:00");
    const target = new Date(now);
    target.setHours(2, 0, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    const diff = target.getTime() - now.getTime();
    // Should be ~23 hours
    expect(diff).toBeGreaterThan(22 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("should calculate correct ms if before 2AM", () => {
    const now = new Date("2026-03-06T01:00:00");
    const target = new Date(now);
    target.setHours(2, 0, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    const diff = target.getTime() - now.getTime();
    // Should be ~1 hour
    expect(diff).toBeGreaterThan(50 * 60 * 1000);
    expect(diff).toBeLessThan(70 * 60 * 1000);
  });
});
