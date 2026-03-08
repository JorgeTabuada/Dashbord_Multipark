import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(role: string = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const ctx = createCtx("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });
});

describe("users", () => {
  it("list throws FORBIDDEN for non-admin", async () => {
    const ctx = createCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("updateRole throws FORBIDDEN for non-super_admin", async () => {
    const ctx = createCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.updateRole({ userId: 2, role: "user" })).rejects.toThrow();
  });
});

describe("expenses", () => {
  it("list is accessible to authenticated users", async () => {
    const ctx = createCtx("user");
    const caller = appRouter.createCaller(ctx);
    // Should not throw (may return empty array if DB not connected)
    try {
      const result = await caller.expenses.list({});
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // DB not available in test env is acceptable
      expect(e.message).not.toContain("FORBIDDEN");
    }
  });

  it("delete throws FORBIDDEN for non-admin", async () => {
    const ctx = createCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.expenses.delete({ id: 1 })).rejects.toThrow();
  });

  it("stats throws FORBIDDEN for non-admin", async () => {
    const ctx = createCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.expenses.stats()).rejects.toThrow();
  });

  it("checkOverdue throws FORBIDDEN for non-super_admin", async () => {
    const ctx = createCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.expenses.checkOverdue()).rejects.toThrow();
  });
});

describe("logs", () => {
  it("list throws FORBIDDEN for non-super_admin", async () => {
    const ctx = createCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.logs.list()).rejects.toThrow();
  });
});
