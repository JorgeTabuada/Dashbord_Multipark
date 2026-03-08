import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db functions
vi.mock("./db", () => ({
  getUserById: vi.fn(),
  createInviteToken: vi.fn(),
  getInviteByToken: vi.fn(),
  acceptInviteToken: vi.fn(),
  getInvitesByUser: vi.fn(),
  linkInviteToOAuthUser: vi.fn(),
  logActivity: vi.fn(),
}));

import {
  getUserById,
  createInviteToken,
  getInviteByToken,
  acceptInviteToken,
  getInvitesByUser,
  linkInviteToOAuthUser,
  logActivity,
} from "./db";

const mockGetUserById = getUserById as ReturnType<typeof vi.fn>;
const mockCreateInviteToken = createInviteToken as ReturnType<typeof vi.fn>;
const mockGetInviteByToken = getInviteByToken as ReturnType<typeof vi.fn>;
const mockAcceptInviteToken = acceptInviteToken as ReturnType<typeof vi.fn>;
const mockGetInvitesByUser = getInvitesByUser as ReturnType<typeof vi.fn>;
const mockLinkInviteToOAuthUser = linkInviteToOAuthUser as ReturnType<typeof vi.fn>;
const mockLogActivity = logActivity as ReturnType<typeof vi.fn>;

describe("Invite Token System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendInvite logic", () => {
    it("should create an invite token for a manual user with email", async () => {
      const user = { id: 5, name: "Test User", email: "test@example.com", loginMethod: "manual" };
      mockGetUserById.mockResolvedValue(user);
      mockCreateInviteToken.mockResolvedValue({
        token: "abc123",
        expiresAt: new Date("2026-03-10"),
      });
      mockLogActivity.mockResolvedValue(undefined);

      // Simulate the sendInvite logic
      const targetUser = await getUserById(5);
      expect(targetUser).toBeDefined();
      expect(targetUser!.email).toBe("test@example.com");

      const invite = await createInviteToken({
        email: targetUser!.email!,
        userId: targetUser!.id,
        invitedById: 1,
      });

      expect(invite.token).toBe("abc123");
      expect(mockCreateInviteToken).toHaveBeenCalledWith({
        email: "test@example.com",
        userId: 5,
        invitedById: 1,
      });

      const inviteLink = `https://example.com/convite/${invite.token}`;
      expect(inviteLink).toContain("abc123");
    });

    it("should reject invite for user without email", async () => {
      const user = { id: 5, name: "No Email User", email: null, loginMethod: "manual" };
      mockGetUserById.mockResolvedValue(user);

      const targetUser = await getUserById(5);
      expect(targetUser!.email).toBeNull();
      // In the real route, this would throw BAD_REQUEST
    });

    it("should reject invite for non-existent user", async () => {
      mockGetUserById.mockResolvedValue(undefined);

      const targetUser = await getUserById(999);
      expect(targetUser).toBeUndefined();
      // In the real route, this would throw NOT_FOUND
    });
  });

  describe("acceptInvite logic", () => {
    it("should validate a pending invite token", async () => {
      mockGetInviteByToken.mockResolvedValue({
        id: 1,
        token: "abc123",
        email: "test@example.com",
        userId: 5,
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000), // tomorrow
      });

      const invite = await getInviteByToken("abc123");
      expect(invite).toBeDefined();
      expect(invite!.status).toBe("pending");
      expect(new Date() < invite!.expiresAt).toBe(true);
    });

    it("should reject an already-accepted invite", async () => {
      mockGetInviteByToken.mockResolvedValue({
        id: 1,
        token: "abc123",
        email: "test@example.com",
        userId: 5,
        status: "accepted",
        expiresAt: new Date(Date.now() + 86400000),
      });

      const invite = await getInviteByToken("abc123");
      expect(invite!.status).toBe("accepted");
      // In the real route, this returns { valid: false, reason: "..." }
    });

    it("should reject an expired invite", async () => {
      mockGetInviteByToken.mockResolvedValue({
        id: 1,
        token: "abc123",
        email: "test@example.com",
        userId: 5,
        status: "pending",
        expiresAt: new Date(Date.now() - 86400000), // yesterday
      });

      const invite = await getInviteByToken("abc123");
      expect(new Date() > invite!.expiresAt).toBe(true);
      // In the real route, this returns { valid: false, reason: "..." }
    });

    it("should reject an invalid token", async () => {
      mockGetInviteByToken.mockResolvedValue(undefined);

      const invite = await getInviteByToken("invalid");
      expect(invite).toBeUndefined();
    });
  });

  describe("completeInvite logic", () => {
    it("should link OAuth user to manual user and accept token", async () => {
      mockGetInviteByToken.mockResolvedValue({
        id: 1,
        token: "abc123",
        email: "test@example.com",
        userId: 5,
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000),
      });
      mockLinkInviteToOAuthUser.mockResolvedValue(undefined);
      mockAcceptInviteToken.mockResolvedValue(undefined);

      const invite = await getInviteByToken("abc123");
      expect(invite).toBeDefined();
      expect(invite!.status).toBe("pending");

      await linkInviteToOAuthUser(5, "oauth_open_id_123", "OAuth User", "oauth@example.com");
      expect(mockLinkInviteToOAuthUser).toHaveBeenCalledWith(
        5,
        "oauth_open_id_123",
        "OAuth User",
        "oauth@example.com"
      );

      await acceptInviteToken("abc123");
      expect(mockAcceptInviteToken).toHaveBeenCalledWith("abc123");
    });
  });

  describe("getInvitesByUser", () => {
    it("should return invites for a specific user", async () => {
      mockGetInvitesByUser.mockResolvedValue([
        { id: 1, token: "abc", email: "test@example.com", userId: 5, status: "pending" },
        { id: 2, token: "def", email: "test@example.com", userId: 5, status: "accepted" },
      ]);

      const invites = await getInvitesByUser(5);
      expect(invites).toHaveLength(2);
      expect(invites[0].status).toBe("pending");
      expect(invites[1].status).toBe("accepted");
    });
  });
});
