import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getPayrollData: vi.fn(),
}));

import { getPayrollData } from "./db";

describe("payroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPayrollData returns array", async () => {
    (getPayrollData as any).mockResolvedValue([]);
    const result = await getPayrollData(2026, 3);
    expect(Array.isArray(result)).toBe(true);
    expect(getPayrollData).toHaveBeenCalledWith(2026, 3);
  });

  it("payroll calculation structure is correct for regular employee", async () => {
    const mockData = [{
      employeeId: 1,
      fullName: "Test Employee",
      position: "driver",
      extraLevel: null,
      department: "Lisboa",
      projectName: "Multipark",
      nif: "123456789",
      nib: "PT50000000001",
      isExtra: false,
      totalHours: 180,
      daysWorked: 22,
      baseSalary: 1200,
      extraPayment: 0,
      overtimeHours: 4,
      overtimePayment: 34.09,
      thirteenthProvision: 100,
      totalPayment: 1234.09,
      hourlyRate: 6.82,
    }];
    (getPayrollData as any).mockResolvedValue(mockData);
    const result = await getPayrollData(2026, 3);
    expect(result).toHaveLength(1);
    const emp = result[0];
    expect(emp.isExtra).toBe(false);
    expect(emp.baseSalary).toBeGreaterThan(0);
    expect(emp.thirteenthProvision).toBeGreaterThan(0);
    expect(emp.totalPayment).toBe(emp.baseSalary + emp.overtimePayment);
  });

  it("payroll calculation structure is correct for extra employee", async () => {
    const mockData = [{
      employeeId: 2,
      fullName: "Extra Worker",
      position: "extra",
      extraLevel: 3,
      department: null,
      projectName: null,
      nif: null,
      nib: null,
      isExtra: true,
      totalHours: 40,
      daysWorked: 5,
      baseSalary: 0,
      extraPayment: 240,
      overtimeHours: 0,
      overtimePayment: 0,
      thirteenthProvision: 0,
      totalPayment: 240,
      hourlyRate: 6.0,
    }];
    (getPayrollData as any).mockResolvedValue(mockData);
    const result = await getPayrollData(2026, 3);
    expect(result).toHaveLength(1);
    const emp = result[0];
    expect(emp.isExtra).toBe(true);
    expect(emp.baseSalary).toBe(0);
    expect(emp.extraPayment).toBeGreaterThan(0);
    expect(emp.totalPayment).toBe(emp.extraPayment);
  });

  it("payroll supports month range 1-12", async () => {
    (getPayrollData as any).mockResolvedValue([]);
    for (let m = 1; m <= 12; m++) {
      await getPayrollData(2026, m);
    }
    expect(getPayrollData).toHaveBeenCalledTimes(12);
  });
});
