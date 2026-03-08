import { describe, it, expect, vi } from "vitest";

describe("payslip PDF generation", () => {
  it("generatePayslipPdf should be importable", async () => {
    const mod = await import("./payslipPdf");
    expect(mod.generatePayslipPdf).toBeDefined();
    expect(typeof mod.generatePayslipPdf).toBe("function");
  });

  it("generateAllPayslipsPdf should be importable", async () => {
    const mod = await import("./payslipPdf");
    expect(mod.generateAllPayslipsPdf).toBeDefined();
    expect(typeof mod.generateAllPayslipsPdf).toBe("function");
  });

  it("payslip PDF should throw for non-existent employee", async () => {
    const { generatePayslipPdf } = await import("./payslipPdf");
    // Mock getPayrollData to return empty array
    const dbMod = await import("./db");
    const spy = vi.spyOn(dbMod, "getPayrollData").mockResolvedValue([]);
    await expect(generatePayslipPdf(2026, 3, 99999)).rejects.toThrow("Funcionário não encontrado");
    spy.mockRestore();
  });

  it("payslip PDF should generate buffer for valid employee", async () => {
    const { generatePayslipPdf } = await import("./payslipPdf");
    const dbMod = await import("./db");
    const mockData = [{
      employeeId: 1,
      fullName: "João Silva",
      position: "driver",
      extraLevel: null,
      department: "Operações",
      projectName: "Parque Central",
      nif: "123456789",
      nib: "PT50 0000 0000 0000 0000 0001",
      isExtra: false,
      totalHours: 176,
      daysWorked: 22,
      baseSalary: 900,
      extraPayment: 0,
      overtimeHours: 8,
      overtimePayment: 51.14,
      thirteenthProvision: 75,
      totalPayment: 951.14,
      hourlyRate: 5.11,
    }];
    const spy = vi.spyOn(dbMod, "getPayrollData").mockResolvedValue(mockData as any);
    const buffer = await generatePayslipPdf(2026, 3, 1);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    // Check it's a valid PDF (starts with %PDF)
    expect(buffer.toString("ascii", 0, 5)).toBe("%PDF-");
    spy.mockRestore();
  });

  it("payslip PDF for extra employee should work", async () => {
    const { generatePayslipPdf } = await import("./payslipPdf");
    const dbMod = await import("./db");
    const mockData = [{
      employeeId: 2,
      fullName: "Maria Extra",
      position: "extra",
      extraLevel: 2,
      department: null,
      projectName: null,
      nif: "987654321",
      nib: null,
      isExtra: true,
      totalHours: 40,
      daysWorked: 5,
      baseSalary: 0,
      extraPayment: 280,
      overtimeHours: 0,
      overtimePayment: 0,
      thirteenthProvision: 0,
      totalPayment: 280,
      hourlyRate: 7,
    }];
    const spy = vi.spyOn(dbMod, "getPayrollData").mockResolvedValue(mockData as any);
    const buffer = await generatePayslipPdf(2026, 3, 2);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString("ascii", 0, 5)).toBe("%PDF-");
    spy.mockRestore();
  });

  it("generateAllPayslipsPdf should skip employees with no activity", async () => {
    const { generateAllPayslipsPdf } = await import("./payslipPdf");
    const dbMod = await import("./db");
    const mockData = [
      {
        employeeId: 1, fullName: "João Silva", position: "driver", extraLevel: null,
        department: "Ops", projectName: null, nif: "123", nib: null, isExtra: false,
        totalHours: 176, daysWorked: 22, baseSalary: 900, extraPayment: 0,
        overtimeHours: 0, overtimePayment: 0, thirteenthProvision: 75, totalPayment: 900, hourlyRate: 5.11,
      },
      {
        employeeId: 3, fullName: "Carlos Inativo", position: "valet", extraLevel: null,
        department: null, projectName: null, nif: "456", nib: null, isExtra: false,
        totalHours: 0, daysWorked: 0, baseSalary: 0, extraPayment: 0,
        overtimeHours: 0, overtimePayment: 0, thirteenthProvision: 0, totalPayment: 0, hourlyRate: 0,
      },
    ];
    const spy = vi.spyOn(dbMod, "getPayrollData").mockResolvedValue(mockData as any);
    const results = await generateAllPayslipsPdf(2026, 3);
    expect(results.length).toBe(1); // Carlos skipped (0 hours, 0 payment)
    expect(results[0].fullName).toBe("João Silva");
    expect(results[0].buffer).toBeInstanceOf(Buffer);
    spy.mockRestore();
  });
});
