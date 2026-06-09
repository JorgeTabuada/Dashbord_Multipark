import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as XLSX from "xlsx";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { getBookingHistory, getBookingsReport, getBookingTryAllParks } from "./multipark";
import {
  getExtrasDiaForecast,
  listAssignments,
  upsertAssignment,
  deleteAssignment,
  listDriverCandidates,
  getBookingsInSlot,
  getExtrasDiaCostForRange,
} from "./extrasDia";
import { importExtrasFromCsv } from "./extrasImport";
import {
  upsertUser,
  getUserByOpenId,
  getAllUsers,
  updateUserRole,
  createManualUser,
  getUserByEmail,
  checkExtraDocsCompliance,
  processExtraDiaNoShows,
  getOpenPenalties,
  clearPenalty,
  unblockEmployeeLogin,
  getEmployeeLeaves,
  createEmployeeLeave,
  deleteEmployeeLeave,
  getEmployeeSalaryHistory,
  getRhDashboardSummary,
  updateUser,
  toggleUserActive,
  getUserById,
  getSuperAdmins,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  moveProject,
  getProjectEmployees,
  getEmployeeProjects,
  assignEmployeeToProject,
  removeEmployeeFromProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getAllCategories,
  createCategory,
  seedDefaultCategories,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getUpcomingPayments,
  getOverdueExpenses,
  markOverdueExpenses,
  logActivity,
  getActivityLogs,
  // RH
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeDocuments,
  createEmployeeDocument,
  createEmployeeDocumentsBatch,
  deleteEmployeeDocument,
  getDocumentChecklistForEmployee,
  getAllEmployeesDocumentStatus,
  getEmployeeSchedules,
  upsertSchedule,
  deleteSchedule,
  getTimeRecords,
  createTimeRecord,
  getMonthlyHours,
  getExtraRates,
  seedExtraRates,
  updateExtraRate,
  getHRStats,
  // Marketing
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  getAllDailyStats,
  importDailyStats,
  deleteDailyStat,
  getMarketingExpenses,
  createMarketingExpense,
  updateMarketingExpense,
  deleteMarketingExpense,
  getMarketingDashboardStats,
  getBookingRevenueByProject,
  getCampaignByNameAndPlatform,
  getExistingStatsForCampaignAndDateRange,
  // Operacional
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleMovements,
  createVehicleMovement,
  getSpeedAlerts,
  createSpeedAlert,
  acknowledgeSpeedAlert,
  getRadioTranscriptions,
  createRadioTranscription,
  getOperationalStats,
  getVehicleDriverHistory,
  // API Keys
  getApiKeys,
  createApiKey,
  toggleApiKey,
  deleteApiKey,
  // Reclamações
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintMessages,
  addComplaintMessage,
  getComplaintPhotos,
  addComplaintPhoto,
  deleteComplaintPhoto,
  getComplaintStats,
  // Google Reviews
  createGoogleReview,
  getGoogleReviews,
  getGoogleReviewById,
  updateGoogleReview,
  getGoogleReviewStats,
  searchClientHistory,
  // Formação e Apoio
  getTrainingCategories,
  createTrainingCategory,
  deleteTrainingCategory,
  getTrainingVideos,
  createTrainingVideo,
  deleteTrainingVideo,
  getTrainingManuals,
  createTrainingManual,
  updateTrainingManual,
  deleteTrainingManual,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getQuizQuestions,
  getQuizQuestionsForPlayer,
  createQuizQuestion,
  deleteQuizQuestion,
  saveQuizAttempt,
  getQuizRanking,
  getCareerExams,
  createCareerExam,
  getCareerExamQuestions,
  getCareerExamQuestionsForPlayer,
  createCareerExamQuestion,
  saveCareerExamAttempt,
  getCareerExamAttempts,
  deleteCareerExam,
  // Perdidos e Achados
  createLostFoundItem,
  getLostFoundItems,
  getLostFoundItemById,
  updateLostFoundItem,
  deleteLostFoundItem,
  addLostFoundPhoto,
  getLostFoundPhotos,
  addLostFoundMessage,
  getLostFoundMessages,
  getLostFoundDriverRanking,
  getBookingHistoryByBookingId,
  getBookingHistoryByPlate,
  searchBookingHistory,
  getBookingHistoryDriverStats,
  getBookingHistoryCrossReference,
  // Incidents
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidentStats,
  getIncidentsByEmployee,
  // Performance Evaluations
  createPerformanceEvaluation,
  getPerformanceEvaluations,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
  generateWeeklyEvaluation,
  // Services
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceStats,
  // Invoices
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  getBillingData,
  getPartnershipAnalytics,
  // Partnerships
  createPartnership,
  getPartnerships,
  inferPartnersFromBookings,
  addPartnerAlias,
  listPartnerAliases,
  deletePartnerAlias,
  getPartnershipById,
  updatePartnership,
  deletePartnership,
  createPartnershipTransaction,
  getPartnershipTransactions,
  // Partnership Invoices
  createPartnershipInvoice,
  getPartnershipInvoices,
  updatePartnershipInvoice,
  deletePartnershipInvoice,
  markOverduePartnershipInvoices,
  getPartnershipDashboardStats,
  getBookingsByCampaign,
  // Annual Reports
  createAnnualReport,
  getAnnualReports,
  updateAnnualReport,
  deleteAnnualReport,
  generateAnnualSummary,
  getAnnualBreakdown,
  // MultiPark
  getMultiparkBookings,
  getMultiparkBookingByExternalId,
  upsertMultiparkBooking,
  getMultiparkBookingStats,
  createSyncLog,
  getSyncLogs,
  // MultiPark KPIs
  upsertDailySnapshot,
  getDailySnapshots,
  getSnapshotKPIs,
  deleteSnapshotsByDateRange,
  // Invites
  createInviteToken,
  getInviteByToken,
  acceptInviteToken,
  getInvitesByUser,
  getInvitesByEmail,
  linkInviteToOAuthUser,
  getPayrollData,
  getProjectCosts,
  savePayslipRecord,
  getPayslipHistoryList,
  deletePayslipRecord,
  getTaskAssignees,
  setTaskAssignees,
  getOverdueTasks,
  getRecentlyCompletedTasks,
  markTaskNotified,
  getProjectHierarchyManagers,
  // Speed monitoring
  getSpeedLimits,
  getDefaultSpeedLimit,
  createSpeedLimit,
  updateSpeedLimit,
  deleteSpeedLimit,
  recordSpeedViolation,
  getSpeedViolations,
  acknowledgeSpeedViolation,
  getSpeedViolationStats,
  // Daily driver history
  createDailyDriverHistory,
  getDailyDriverHistoryByDate,
  getDailyDriverHistoryByUser,
  getDailyDriverHistoryRange,
  getDailyDriverStats,
  // PDAs
  createPda,
  updatePda,
  deletePda,
  listPdas,
  getPdaById,
  // PDA Check-ins
  createPdaCheckin,
  checkoutPda,
  getActiveCheckins,
  getCheckinsByDate,
  getCheckinsByPda,
  // GPS Alerts
  createGpsAlert,
  getGpsAlerts,
  acknowledgeGpsAlert,
  getGpsAlertStats,
  getLocalBookingsByAction,
  searchBookingByRef,
} from "./db";
import { generatePayrollPdf } from "./payrollPdf";
import { generatePayslipPdf, generateAllPayslipsPdf } from "./payslipPdf";

import {
  healthCheck as mpHealthCheck,
  checkAvailability as mpCheckAvailability,
  listParks as mpListParks,
  testConnection as mpTestConnection,
  getBookingsReportAllParks,
  type ParkingType,
  type VehicleType,
  type BookingActionType,
} from "./multipark";
import { syncBookings, enrichBookingsBatch, syncBookingHistoryBatch } from "./jobs/multiparkBookingSync";

import {
  getZelloUsers,
  getZelloChannels,
  getZelloLocations,
  getZelloUserHistory,
  getZelloUserLocation,
} from "./zello";
import { collectDailyDriverData } from "./jobs/dailyDriverCollection";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 7,
  admin: 6,
  supervisor: 5,
  team_leader: 4,
  backoffice: 3,
  frontoffice: 2,
  extra: 1,
  user: 0,
};

function requireRole(userRole: string, minRole: string) {
  if ((ROLE_HIERARCHY[userRole] ?? -1) < (ROLE_HIERARCHY[minRole] ?? 0)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso não autorizado." });
  }
}

// ─── APP ROUTER ───────────────────────────────────────────────────────────────

// Migration runner one-shot (importado dentro do mutation para não puxar
// drizzle/mysql2 no top-level se a função getDb não estiver disponível)
async function applyMigration0044(): Promise<{ ok: number; skipped: number; failed: number; errors: string[] }> {
  const { getDb } = await import("./db");
  const { MIGRATION_0044_STATEMENTS, IDEMPOTENT_ERROR_CODES } = await import("./migrations/migration_0044");
  const { sql } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const stmt of MIGRATION_0044_STATEMENTS) {
    try {
      await db.execute(sql.raw(stmt));
      ok += 1;
    } catch (err: any) {
      if (err?.code && IDEMPOTENT_ERROR_CODES.has(err.code)) {
        skipped += 1;
      } else {
        failed += 1;
        errors.push(`${err?.code ?? "ERR"}: ${String(err?.message ?? err).slice(0, 200)}`);
      }
    }
  }
  return { ok, skipped, failed, errors };
}

async function applyMigration0046(): Promise<{ ok: number; skipped: number; failed: number; errors: string[] }> {
  const { getDb } = await import("./db");
  const { MIGRATION_0046_STATEMENTS, IDEMPOTENT_ERROR_CODES_0046 } = await import("./migrations/migration_0046");
  const { sql } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const stmt of MIGRATION_0046_STATEMENTS) {
    try {
      await db.execute(sql.raw(stmt));
      ok += 1;
    } catch (err: any) {
      if (err?.code && IDEMPOTENT_ERROR_CODES_0046.has(err.code)) {
        skipped += 1;
      } else {
        failed += 1;
        errors.push(`${err?.code ?? "ERR"}: ${String(err?.message ?? err).slice(0, 200)}`);
      }
    }
  }
  return { ok, skipped, failed, errors };
}

export const appRouter = router({
  system: systemRouter,

  // ── ADMIN (one-shot migrations) ───────────────────────────────────────────
  admin: router({
    runMigration0044: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      const report = await applyMigration0044();
      await logActivity({
        userId: ctx.user.id,
        action: "migration",
        entity: "schema",
        details: `0044_rh_revamp: ok=${report.ok} skipped=${report.skipped} failed=${report.failed}`,
      });
      return report;
    }),

    runMigration0046: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      const report = await applyMigration0046();
      await logActivity({
        userId: ctx.user.id,
        action: "migration",
        entity: "schema",
        details: `0046_multipark_report_extra_fields: ok=${report.ok} skipped=${report.skipped} failed=${report.failed}`,
      });
      return report;
    }),

    // Apaga um batch de duplicados em multipark_bookings. Cliente itera até
    // deleted === 0. Evita timeout do Vercel.
    fixMultiparkDuplicatesBatch: protectedProcedure
      .input(z.object({ batchSize: z.number().int().min(100).max(5000).optional() }).optional())
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const batch = input?.batchSize ?? 1000;

        // Stats antes
        const beforeRes = await db.execute(sql`SELECT COUNT(*) AS total FROM multipark_bookings`) as any;
        const before = Array.isArray(beforeRes[0]) ? beforeRes[0] : beforeRes;
        const totalBefore = Number(before[0]?.total ?? 0);

        // Apaga até `batch` linhas duplicadas (mantém a do updatedAt mais recente)
        const delRes = await db.execute(sql`
          DELETE FROM multipark_bookings WHERE id IN (
            SELECT id FROM (
              SELECT b1.id FROM multipark_bookings b1
              INNER JOIN multipark_bookings b2
                ON b1.externalId = b2.externalId
               AND (
                     b1.updatedAt < b2.updatedAt
                  OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
               )
              LIMIT ${sql.raw(String(batch))}
            ) AS t
          )
        `) as any;
        const meta = Array.isArray(delRes[0]) ? delRes[0] : delRes;
        const affectedRows = Number((meta as any)?.affectedRows ?? 0);

        const afterRes = await db.execute(sql`SELECT COUNT(*) AS total FROM multipark_bookings`) as any;
        const after = Array.isArray(afterRes[0]) ? afterRes[0] : afterRes;
        const totalAfter = Number(after[0]?.total ?? 0);

        return {
          totalBefore,
          totalAfter,
          deleted: affectedRows || (totalBefore - totalAfter),
          batchSize: batch,
        };
      }),

    // Backfill: atribui um projeto fallback (default = "Multipark" se existir,
    // senão o primeiro grupo top-level) a todos os colaboradores activos sem
    // projectId. Devolve quantos foram afectados e qual o projeto usado.
    backfillEmployeeProject: protectedProcedure
      .input(z.object({ projectId: z.number().optional(), onlyExtras: z.boolean().optional() }).optional())
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const { getDb } = await import("./db");
        const { sql, isNull, and: andOp, eq } = await import("drizzle-orm");
        const { employees, projects } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        // Resolve o projeto fallback
        let fallbackId = input?.projectId;
        let fallbackName = "";
        if (!fallbackId) {
          const allProjects = await db.select().from(projects);
          // Procura projeto "Multipark" (qualquer level)
          const mp = allProjects.find(p => /^multipark$/i.test(p.name.trim()));
          if (mp) {
            fallbackId = mp.id;
            fallbackName = mp.name;
          } else {
            // Sem "Multipark" → primeiro grupo (top-level)
            const top = allProjects.find(p => p.level === "group");
            if (top) {
              fallbackId = top.id;
              fallbackName = top.name;
            }
          }
        } else {
          const [p] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, fallbackId)).limit(1);
          fallbackName = p?.name ?? "";
        }

        if (!fallbackId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Não há projeto fallback. Cria um projeto top-level 'Multipark' ou indica projectId no input.",
          });
        }

        // Alvo: colaboradores activos sem centro de custos. Se onlyExtras,
        // restringe a position='extra' (não arrasta outros sem projeto).
        const conds = [eq(employees.isActive, 1), isNull(employees.projectId)];
        if (input?.onlyExtras) conds.push(eq(employees.position, "extra"));
        const targetWhere = andOp(...conds);

        // Conta antes
        const beforeRes = await db
          .select({ c: sql<number>`COUNT(*)` })
          .from(employees)
          .where(targetWhere);
        const before = Number(beforeRes[0]?.c ?? 0);

        // Update
        await db
          .update(employees)
          .set({ projectId: fallbackId })
          .where(targetWhere);

        await logActivity({
          userId: ctx.user.id,
          action: "backfill",
          entity: "employee",
          details: `Backfill projectId=${fallbackId} (${fallbackName})${input?.onlyExtras ? " [só extras]" : ""} em ${before} colaboradores`,
        });

        return { affected: before, projectId: fallbackId, projectName: fallbackName };
      }),

    // Backfill histórico: sincroniza UM dia (todas as actionTypes) +
    // enrich + history. Frontend itera dia-a-dia para o range pedido.
    // Cada chamada cabe nos 60s do Vercel para um dia tipico.
    runHistoricalDaySync: protectedProcedure
      .input(z.object({ date: z.string() })) // YYYY-MM-DD
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const { syncBookings, enrichBookingsBatch, syncBookingHistoryBatch } = await import("./jobs/multiparkBookingSync");
        const t0 = Date.now();
        // Fase 1: report do dia (todas as actionTypes). enrichTargets fica de
        // fora da resposta (lista de IDs grande e desnecessária no backfill).
        const { enrichTargets: _enrichTargets, ...report } = await syncBookings({
          startDate: input.date,
          endDate: input.date,
          triggeredById: ctx.user.id,
        });
        // Fase 2 e 3 em paralelo para reservas novas/sem enrich
        const [enrichRes, historyRes] = await Promise.allSettled([
          enrichBookingsBatch(100),
          syncBookingHistoryBatch(50),
        ]);
        return {
          date: input.date,
          report,
          enriched: enrichRes.status === "fulfilled" ? enrichRes.value.enriched : 0,
          enrichScanned: enrichRes.status === "fulfilled" ? enrichRes.value.scanned : 0,
          historyFetched: historyRes.status === "fulfilled" ? historyRes.value.fetched : 0,
          durationMs: Date.now() - t0,
        };
      }),

    // Reforça o UNIQUE depois dos batches terminarem.
    enforceMultiparkUnique: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      const { getDb } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      const steps: { step: string; ok: boolean; error?: string }[] = [];
      // DROP do índice (pode não existir)
      try {
        await db.execute(sql`ALTER TABLE multipark_bookings DROP INDEX multipark_bookings_externalId_unique`);
        steps.push({ step: "drop_index", ok: true });
      } catch (e: any) {
        steps.push({ step: "drop_index", ok: false, error: e?.code ?? e?.message });
      }
      // CREATE UNIQUE
      try {
        await db.execute(sql`ALTER TABLE multipark_bookings ADD UNIQUE INDEX multipark_bookings_externalId_unique (externalId)`);
        steps.push({ step: "create_unique", ok: true });
      } catch (e: any) {
        steps.push({ step: "create_unique", ok: false, error: e?.code ?? e?.message });
      }

      await logActivity({
        userId: ctx.user.id,
        action: "migration",
        entity: "schema",
        details: `enforceMultiparkUnique: ${JSON.stringify(steps)}`,
      });

      return { steps };
    }),
  }),

  // ── AUTH ────────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const u = opts.ctx.user;
      if (!u) return u;
      // Se houver ficha de colaborador, devolve também o estado dos docs
      // e bloqueio. Lazy check para extras: actualiza flags se passou tempo.
      try {
        const emp = await getEmployeeByUserId(u.id);
        if (!emp) return { ...u, employee: null, docsStatus: null };
        let docsStatus: { blocked: boolean; warning: boolean; missingDocs: string[]; daysSinceStart: number } | null = null;
        if (emp.employee.position === "extra") {
          docsStatus = await checkExtraDocsCompliance(emp.employee.id);
        }
        return {
          ...u,
          employee: {
            id: emp.employee.id,
            fullName: emp.employee.fullName,
            position: emp.employee.position,
            loginBlocked: Boolean(emp.employee.loginBlocked),
            loginBlockedReason: emp.employee.loginBlockedReason,
          },
          docsStatus,
        };
      } catch {
        return u;
      }
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── USERS ───────────────────────────────────────────────────────────────────
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return getAllUsers();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getUserById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        role: z.string().default("user"),
        department: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const newUser = await createManualUser(input);
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entity: "user",
          entityId: newUser?.id,
          details: `Utilizador criado: ${input.name} (${input.email}) - Role: ${input.role}`,
        });
        return newUser;
      }),
    update: protectedProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.string().optional(),
        department: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isSelf = ctx.user.id === input.userId;
        // Allow self-edit for name/email only; role/department changes require super_admin
        if (!isSelf) {
          requireRole(ctx.user.role, "super_admin");
        }
        const { userId, ...data } = input;
        // If self-edit, only allow name and email changes
        const safeData = isSelf && ctx.user.role !== "super_admin"
          ? { name: data.name, email: data.email }
          : data;
        await updateUser(userId, safeData);
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entity: "user",
          entityId: userId,
          details: `Utilizador atualizado: ${JSON.stringify(safeData)}`,
        });
        return { success: true };
      }),
    updateRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.string() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await updateUserRole(input.userId, input.role);
        await logActivity({
          userId: ctx.user.id,
          action: "update_role",
          entity: "user",
          entityId: input.userId,
          details: `Role alterado para ${input.role}`,
        });
        return { success: true };
      }),
    toggleActive: protectedProcedure
      .input(z.object({ userId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        if (input.userId === ctx.user.id) {
          throw new Error("Não podes desativar a tua própria conta");
        }
        await toggleUserActive(input.userId, input.isActive);
        await logActivity({
          userId: ctx.user.id,
          action: input.isActive ? "activate" : "deactivate",
          entity: "user",
          entityId: input.userId,
          details: input.isActive ? "Utilizador ativado" : "Utilizador desativado",
        });
         return { success: true };
      }),
    sendInvite: protectedProcedure
      .input(z.object({
        userId: z.number(),
        origin: z.string(), // frontend origin for building the invite link
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const targetUser = await getUserById(input.userId);
        if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "Utilizador não encontrado" });
        if (!targetUser.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Utilizador não tem email" });
        const invite = await createInviteToken({
          email: targetUser.email,
          userId: targetUser.id,
          invitedById: ctx.user.id,
        });
        const inviteLink = `${input.origin}/convite/${invite.token}`;
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entity: "invite",
          entityId: targetUser.id,
          details: `Convite enviado para ${targetUser.email}`,
        });
        return {
          success: true,
          email: targetUser.email,
          inviteLink,
          token: invite.token,
          expiresAt: invite.expiresAt,
        };
      }),
    getInvites: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getInvitesByUser(input.userId);
      }),
    acceptInvite: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invite = await getInviteByToken(input.token);
        if (!invite) return { valid: false, reason: "Token inválido" };
        if (invite.inviteStatus === "accepted") return { valid: false, reason: "Este convite já foi utilizado" };
        if (new Date() > new Date(invite.expiresAt)) return { valid: false, reason: "Este convite expirou" };
        return { valid: true, email: invite.email, userId: invite.userId };
      }),
    completeInvite: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Tens de fazer login primeiro" });
        const invite = await getInviteByToken(input.token);
        if (!invite) throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido" });
        if (invite.inviteStatus === "accepted") throw new TRPCError({ code: "BAD_REQUEST", message: "Convite já utilizado" });
        if (new Date() > new Date(invite.expiresAt)) throw new TRPCError({ code: "BAD_REQUEST", message: "Convite expirado" });
        // Link the OAuth user to the manually-created user record
        await linkInviteToOAuthUser(
          invite.userId,
          ctx.user.openId,
          ctx.user.name,
          ctx.user.email,
        );
        await acceptInviteToken(input.token);
        return { success: true };
      }),
  }),
  // ── PROJECTS ────────────────────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async () => getProjects()),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getProjectById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        parentId: z.number().optional(),
        level: z.enum(["group", "brand", "city", "project"]).default("project"),
        color: z.string().optional(),
        managerId: z.number().optional(),
        budget: z.string().optional(),
        partnerName: z.string().optional(),
        partnerPercent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await createProject({
          name: input.name,
          description: input.description ?? null,
          parentId: input.parentId ?? null,
          level: input.level,
          color: input.color ?? "#6366f1",
          managerId: input.managerId ?? null,
          budget: input.budget ?? null,
          partnerName: input.partnerName ?? null,
          partnerPercent: input.partnerPercent ?? null,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "project", details: input.name });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        level: z.enum(["group", "brand", "city", "project"]).optional(),
        color: z.string().optional(),
        managerId: z.number().nullable().optional(),
        budget: z.string().nullable().optional(),
        partnerName: z.string().nullable().optional(),
        partnerPercent: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { id, ...data } = input;
        await updateProject(id, data as any);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "project", entityId: id });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteProject(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "project", entityId: input.id });
        return { success: true };
      }),
    // Move project to another parent
    move: protectedProcedure
      .input(z.object({ id: z.number(), newParentId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await moveProject(input.id, input.newParentId);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "project", entityId: input.id, details: `moved to parent:${input.newParentId}` });
        return { success: true };
      }),
    // Employee assignments
    getEmployees: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => getProjectEmployees(input.projectId)),
    assignEmployee: protectedProcedure
      .input(z.object({ projectId: z.number(), employeeId: z.number(), role: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await assignEmployeeToProject({ projectId: input.projectId, employeeId: input.employeeId, role: input.role ?? "member" });
        await logActivity({ userId: ctx.user.id, action: "assign", entity: "project_employee", entityId: input.projectId, details: `emp:${input.employeeId}` });
        return { success: true };
      }),
    removeEmployee: protectedProcedure
      .input(z.object({ projectId: z.number(), employeeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await removeEmployeeFromProject(input.projectId, input.employeeId);
        return { success: true };
      }),
    costs: protectedProcedure
      .input(z.object({ year: z.number().optional(), month: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getProjectCosts(input?.year, input?.month);
      }),
  }),

  // ── TASKS (KANBAN) ────────────────────────────────────────────────────────────
  tasks: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number().optional(), assigneeId: z.number().optional(), status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const { getTasksWithAssignees } = await import("./db");
        return getTasksWithAssignees(input ?? {});
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const task = await getTaskById(input.id);
        if (!task) return null;
        const assignees = await getTaskAssignees(input.id);
        return { ...task, assignees };
      }),
    stats: protectedProcedure.query(async () => getTaskStats()),
    getAssignees: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => getTaskAssignees(input.taskId)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectId: z.number().optional(),
        assigneeId: z.number().optional(),
        assigneeIds: z.array(z.number()).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // O primeiro assignee passa para a coluna assigneeId (compat);
        // a lista completa fica em task_assignees.
        const primaryAssignee = input.assigneeIds?.[0] ?? input.assigneeId ?? null;
        const newId = await createTask({
          title: input.title,
          description: input.description ?? null,
          projectId: input.projectId ?? null,
          assigneeId: primaryAssignee,
          createdById: ctx.user.id,
          taskPriority: input.priority,
          dueDate: input.dueDate ? new Date(input.dueDate).toISOString().slice(0, 19).replace("T", " ") : null,
        });
        if (input.assigneeIds && input.assigneeIds.length > 0) {
          await setTaskAssignees(newId, input.assigneeIds);
        }
        await logActivity({ userId: ctx.user.id, action: "create", entity: "task", entityId: newId, details: input.title });
        return { id: newId };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        projectId: z.number().nullable().optional(),
        assigneeId: z.number().nullable().optional(),
        assigneeIds: z.array(z.number()).optional(),
        status: z.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, dueDate, assigneeIds, status, priority, ...rest } = input;
        const data: any = { ...rest };
        if (status !== undefined) data.taskStatus = status;
        if (priority !== undefined) data.taskPriority = priority;
        if (dueDate !== undefined) {
          data.dueDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace("T", " ") : null;
        }
        if (status === "done") {
          data.completedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
          data.notifiedComplete = 0;
        }
        // Se vem lista de assignees, o primeiro é o "principal" (assigneeId)
        if (assigneeIds !== undefined) {
          data.assigneeId = assigneeIds[0] ?? null;
        }
        await updateTask(id, data);
        if (assigneeIds !== undefined) {
          await setTaskAssignees(id, assigneeIds);
        }
        await logActivity({ userId: ctx.user.id, action: "update", entity: "task", entityId: id, details: input.status ?? "" });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTask(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "task", entityId: input.id });
        return { success: true };
      }),
    // Check and send notifications for overdue/completed tasks
    checkNotifications: protectedProcedure
      .mutation(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
        const { createNotification } = await import("./complaintsExtended");
        const { sendEmail } = await import("./_core/notification");
        const results: string[] = [];

        async function notifyAssignees(
          taskTitle: string,
          taskId: number,
          assignees: Array<{ employee?: { fullName?: string | null; userId?: number | null; email?: string | null } | null }>,
          kind: "overdue" | "complete",
        ) {
          const link = `/tarefas?focus=${taskId}`;
          const title = kind === "overdue"
            ? `⚠️ Tarefa em atraso: ${taskTitle}`
            : `✅ Tarefa concluída: ${taskTitle}`;
          for (const a of assignees) {
            const emp = a.employee;
            if (!emp) continue;
            if (emp.userId) {
              try {
                await createNotification({
                  userId: emp.userId,
                  title,
                  body: kind === "overdue"
                    ? `A tarefa "${taskTitle}" ultrapassou o prazo.`
                    : `A tarefa "${taskTitle}" foi marcada como concluída.`,
                  kind: "task",
                  link,
                });
              } catch (e) { console.warn("[tasks notify] in-app:", e); }
            }
            if (emp.email) {
              try {
                await sendEmail({
                  to: emp.email,
                  subject: title,
                  text: kind === "overdue"
                    ? `Olá ${emp.fullName ?? ""},\n\nA tarefa "${taskTitle}" ultrapassou o prazo. Por favor verifica o seu estado.`
                    : `Olá ${emp.fullName ?? ""},\n\nA tarefa "${taskTitle}" foi marcada como concluída. Obrigado!`,
                });
              } catch (e) { console.warn("[tasks notify] email:", e); }
            }
          }
        }

        // Check overdue tasks
        const overdue = await getOverdueTasks();
        for (const task of overdue) {
          const assignees = await getTaskAssignees(task.id);
          const assigneeNames = assignees.map(a => a.employee?.fullName ?? "?").join(", ");
          // Get hierarchy managers for notification
          let managers: string[] = [];
          if (task.projectId) {
            const hierarchy = await getProjectHierarchyManagers(task.projectId);
            for (const h of hierarchy) {
              if (h.managerId) {
                const mgr = await getUserById(h.managerId);
                if (mgr) managers.push(`${mgr.name} (${h.level})`);
              }
            }
          }
          await notifyOwner({
            title: `⚠️ Tarefa em atraso: ${task.title}`,
            content: `A tarefa "${task.title}" ultrapassou o prazo (${task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-PT") : "?"}).\nResponsáveis: ${assigneeNames || "Nenhum"}\nHierarquia: ${managers.join(" → ") || "N/A"}`,
          });
          await notifyAssignees(task.title, task.id, assignees as any, "overdue");
          await markTaskNotified(task.id, "notifiedOverdue");
          results.push(`Overdue: ${task.title}`);
        }

        // Check recently completed tasks
        const completed = await getRecentlyCompletedTasks();
        for (const task of completed) {
          const assignees = await getTaskAssignees(task.id);
          const assigneeNames = assignees.map(a => a.employee?.fullName ?? "?").join(", ");
          await notifyOwner({
            title: `✅ Tarefa concluída: ${task.title}`,
            content: `A tarefa "${task.title}" foi concluída.\nResponsáveis: ${assigneeNames || "Nenhum"}\nConcluída em: ${task.completedAt ? new Date(task.completedAt).toLocaleDateString("pt-PT") : "agora"}`,
          });
          await notifyAssignees(task.title, task.id, assignees as any, "complete");
          await markTaskNotified(task.id, "notifiedComplete");
          results.push(`Completed: ${task.title}`);
        }

        return { notified: results.length, details: results };
      }),
  }),

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure.query(async () => {
      await seedDefaultCategories();
      return getAllCategories();
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), department: z.string().optional(), color: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await createCategory({ ...input, department: input.department ?? null, color: input.color ?? "#6366f1" });
        return { success: true };
      }),
  }),

  // ── EXPENSES ────────────────────────────────────────────────────────────────
  expenses: router({
    list: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          projectId: z.number().optional(),
          categoryId: z.number().optional(),
          userId: z.number().optional(),
          status: z.string().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const filters: Record<string, any> = {};
        if (input?.startDate) filters.startDate = new Date(input.startDate);
        if (input?.endDate) filters.endDate = new Date(input.endDate);
        if (input?.projectId) filters.projectId = input.projectId;
        if (input?.categoryId) filters.categoryId = input.categoryId;
        if (input?.status) filters.status = input.status;
        if (input?.search) filters.search = input.search;

        // Non-admins only see their own expenses
        const role = ctx.user.role;
        if (!["super_admin", "admin", "supervisor"].includes(role)) {
          filters.userId = ctx.user.id;
        } else if (input?.userId) {
          filters.userId = input.userId;
        }

        return getExpenses(filters);
      }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getExpenseById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          supplier: z.string().optional(),
          description: z.string().optional(),
          amount: z.string(),
          currency: z.string().default("EUR"),
          paymentMethod: z.enum(["cash", "card", "transfer", "check", "other"]).optional(),
          expenseDate: z.string(),
          paymentDueDate: z.string().nullable().optional(),
          categoryId: z.number().optional(),
          // projectId obrigatório: cada despesa tem de ir para um centro
          // de custos (grupo / cidade / marca / projeto). O rollup
          // hierárquico do ProjectCostsDashboard agrega para cima.
          projectId: z.number(),
          buyerId: z.number().optional(),
          invoiceImageUrl: z.string().optional(),
          invoiceImageKey: z.string().optional(),
          extractedByAi: z.boolean().default(false),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const expense = await createExpense({
          supplier: input.supplier ?? null,
          description: input.description ?? null,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod ?? null,
          expenseDate: new Date(input.expenseDate).toISOString().slice(0, 19).replace("T", " "),
          paymentDueDate: (input.paymentDueDate && input.paymentDueDate !== 'null') ? new Date(input.paymentDueDate).toISOString().slice(0, 19).replace("T", " ") : null,
          categoryId: input.categoryId ?? null,
          projectId: input.projectId,
          buyerId: input.buyerId ?? null,
          insertedById: ctx.user.id,
          invoiceImageUrl: input.invoiceImageUrl ?? null,
          invoiceImageKey: input.invoiceImageKey ?? null,
          extractedByAi: input.extractedByAi ? 1 : 0,
          notes: input.notes ?? null,
          status: "pending",
        });

        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entity: "expense",
          entityId: undefined,
          details: `Despesa criada: ${input.supplier ?? "Sem fornecedor"} - ${input.amount}€`,
        });

        // Notify super admins if there's a payment due date
        if (input.paymentDueDate && input.paymentDueDate !== 'null') {
          const admins = await getSuperAdmins();
          for (const admin of admins) {
            await notifyOwner({
              title: "Nova despesa com data de pagamento",
              content: `Despesa de ${input.amount}€ (${input.supplier ?? "Sem fornecedor"}) com vencimento em ${new Date(input.paymentDueDate).toLocaleDateString("pt-PT")}.`,
            });
          }
        }

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          supplier: z.string().optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          paymentMethod: z.enum(["cash", "card", "transfer", "check", "other"]).optional(),
          expenseDate: z.string().optional(),
          paymentDueDate: z.string().optional(),
          categoryId: z.number().optional(),
          projectId: z.number().optional(),
          status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, expenseDate, paymentDueDate, ...rest } = input;
        const updateData: Record<string, any> = { ...rest };
        if (expenseDate) updateData.expenseDate = new Date(expenseDate);
        if (paymentDueDate) updateData.paymentDueDate = new Date(paymentDueDate);
        if (rest.status === "paid") updateData.paidAt = new Date();

        await updateExpense(id, updateData);
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entity: "expense",
          entityId: id,
          details: `Despesa #${id} atualizada`,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deleteExpense(input.id);
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entity: "expense",
          entityId: input.id,
          details: `Despesa #${input.id} eliminada`,
        });
        return { success: true };
      }),

    // ── UPLOAD INVOICE ───────────────────────────────────────────────────────
    uploadInvoice: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileBase64: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        const key = `invoices/${ctx.user.id}/${suffix}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url, key };
      }),

    // ── EXTRACT WITH LLM ─────────────────────────────────────────────────────
    extractFromImage: protectedProcedure
      .input(z.object({ imageBase64: z.string(), mimeType: z.string().default("image/jpeg") }))
      .mutation(async ({ input }) => {
        const imageUrl = `data:${input.mimeType};base64,${input.imageBase64}`;

        const llmMessages: import("./_core/llm").Message[] = [
          {
            role: "system",
            content: "És um assistente especializado em extrair dados de faturas. Analisa a imagem e extrai os dados estruturados. Responde APENAS em JSON válido, sem markdown.",
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } } as import("./_core/llm").ImageContent,
              { type: "text", text: 'Extrai os dados desta fatura e devolve em JSON com os campos: supplier (nome do fornecedor), description (descrição dos produtos/serviços), amount (valor total como string numérica, ex: "45.90"), currency (moeda, ex: "EUR"), paymentMethod (cash/card/transfer/check/other), expenseDate (data da fatura em formato ISO YYYY-MM-DD), paymentDueDate (data de vencimento em formato ISO YYYY-MM-DD, ou null se não existir). Se não conseguires extrair um campo, usa null.' } as import("./_core/llm").TextContent,
            ],
          },
        ];
        const response = await invokeLLM({
          messages: llmMessages,
          response_format: { type: "json_object" },
        });

        const rawContent = response.choices?.[0]?.message?.content;
        let content = typeof rawContent === "string" ? rawContent : null;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Sem resposta do LLM" });

        // Strip markdown code fences if present (e.g. ```json ... ```)
        content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();

        try {
          const parsed = JSON.parse(content);
          // Sanitize "null" strings returned by LLM
          const sanitize = (v: any) => (v === 'null' || v === 'undefined' || v === '' ? null : v);
          return {
            supplier: sanitize(parsed.supplier),
            description: sanitize(parsed.description),
            amount: sanitize(parsed.amount),
            currency: sanitize(parsed.currency) ?? 'EUR',
            paymentMethod: sanitize(parsed.paymentMethod),
            expenseDate: sanitize(parsed.expenseDate),
            paymentDueDate: sanitize(parsed.paymentDueDate),
          };
        } catch {
          return { supplier: null, description: null, amount: null, currency: "EUR", paymentMethod: null, expenseDate: null, paymentDueDate: null };
        }
      }),

    // ── DASHBOARD STATS ──────────────────────────────────────────────────────
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return getExpenseStats();
    }),

    // ── UPCOMING PAYMENTS ────────────────────────────────────────────────────
    upcomingPayments: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return getUpcomingPayments(7);
    }),

    // ── EXPORT EXCEL ─────────────────────────────────────────────────────────
    exportExcel: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          projectId: z.number().optional(),
          categoryId: z.number().optional(),
          userId: z.number().optional(),
          status: z.string().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .mutation(async ({ ctx, input }) => {
        const filters: Record<string, any> = {};
        if (input?.startDate) filters.startDate = new Date(input.startDate);
        if (input?.endDate) filters.endDate = new Date(input.endDate);
        if (input?.projectId) filters.projectId = input.projectId;
        if (input?.categoryId) filters.categoryId = input.categoryId;
        if (input?.status) filters.status = input.status;
        if (input?.search) filters.search = input.search;

        const role = ctx.user.role;
        if (!["super_admin", "admin", "supervisor"].includes(role)) {
          filters.userId = ctx.user.id;
        } else if (input?.userId) {
          filters.userId = input.userId;
        }

        const rows = await getExpenses(filters);

        const STATUS_MAP: Record<string, string> = {
          pending: "Pendente",
          paid: "Pago",
          overdue: "Em Atraso",
          cancelled: "Cancelado",
        };
        const METHOD_MAP: Record<string, string> = {
          cash: "Numerário",
          card: "Cartão",
          transfer: "Transferência",
          check: "Cheque",
          other: "Outro",
        };

        const data = rows.map((r) => ({
          "Data": r.expense.expenseDate ? new Date(r.expense.expenseDate).toLocaleDateString("pt-PT") : "",
          "Fornecedor": r.expense.supplier ?? "",
          "Descrição": r.expense.description ?? "",
          "Valor (€)": parseFloat(String(r.expense.amount ?? 0)),
          "Moeda": r.expense.currency ?? "EUR",
          "Método Pagamento": METHOD_MAP[r.expense.paymentMethod ?? ""] ?? r.expense.paymentMethod ?? "",
          "Estado": STATUS_MAP[r.expense.status ?? ""] ?? r.expense.status ?? "",
          "Categoria": r.category?.name ?? "",
          "Departamento": r.category?.department ?? "",
          "Projeto": r.project?.name ?? "",
          "Registado por": r.insertedBy?.name ?? "",
          "Data Vencimento": r.expense.paymentDueDate ? new Date(r.expense.paymentDueDate).toLocaleDateString("pt-PT") : "",
          "Data Pagamento": r.expense.paidAt ? new Date(r.expense.paidAt).toLocaleDateString("pt-PT") : "",
          "Extraído por IA": r.expense.extractedByAi ? "Sim" : "Não",
          "Notas": r.expense.notes ?? "",
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        // Auto-width columns
        const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
          wch: Math.max(key.length, ...data.map((r) => String((r as any)[key] ?? "").length)) + 2,
        }));
        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Despesas");

        // Add summary sheet
        const totalAmount = data.reduce((s, r) => s + (r["Valor (€)"] as number), 0);
        const summaryData = [
          { "Resumo": "Total de Registos", "Valor": data.length },
          { "Resumo": "Total (€)", "Valor": totalAmount },
          { "Resumo": "Exportado em", "Valor": new Date().toLocaleString("pt-PT") },
          { "Resumo": "Exportado por", "Valor": ctx.user.name ?? ctx.user.email ?? "" },
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        wsSummary["!cols"] = [{ wch: 20 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        const base64 = Buffer.from(buffer).toString("base64");

        return { base64, filename: `despesas-${new Date().toISOString().slice(0, 10)}.xlsx`, count: data.length };
      }),

    // ── CHECK OVERDUE ────────────────────────────────────────────────────────
    checkOverdue: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      await markOverdueExpenses();
      const overdue = await getOverdueExpenses();

      if (overdue.length > 0) {
        await notifyOwner({
          title: `⚠️ ${overdue.length} despesa(s) em atraso`,
          content: overdue
            .map(
              (o) =>
                `• ${o.expense.supplier ?? "Sem fornecedor"}: ${o.expense.amount}€ (venceu em ${o.expense.paymentDueDate ? new Date(o.expense.paymentDueDate).toLocaleDateString("pt-PT") : "—"})`
            )
            .join("\n"),
        });
      }

      return { updated: overdue.length };
    }),

    // Resumo de despesas de um período (para comparar períodos).
    summary: protectedProcedure
      .input(z.object({ from: z.string(), to: z.string(), projectId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const db = await getDb(); if (!db) return { total: 0, count: 0, byCategory: [] as any[] };
        const rows = (r: any) => (Array.isArray(r[0]) ? r[0] : r) as any[];
        const projCond = input.projectId ? sql` AND projectId = ${input.projectId}` : sql``;
        const tot = rows(await db.execute(sql`SELECT COALESCE(SUM(amount),0) total, COUNT(*) cnt FROM expenses WHERE status <> 'cancelled' AND expenseDate >= ${input.from + " 00:00:00"} AND expenseDate <= ${input.to + " 23:59:59"}${projCond}`))[0];
        const byCat = rows(await db.execute(sql`SELECT categoryId, COALESCE(SUM(amount),0) total, COUNT(*) cnt FROM expenses WHERE status <> 'cancelled' AND expenseDate >= ${input.from + " 00:00:00"} AND expenseDate <= ${input.to + " 23:59:59"}${projCond} GROUP BY categoryId ORDER BY total DESC`));
        return {
          total: Number(tot?.total ?? 0), count: Number(tot?.cnt ?? 0),
          byCategory: byCat.map((r) => ({ categoryId: r.categoryId ?? null, total: Number(r.total), count: Number(r.cnt) })),
        };
      }),

    // ── Despesas recorrentes (modelos) ──
    recurring: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb } = await import("./db");
        const { recurringExpenses } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        const db = await getDb(); if (!db) return [];
        return db.select().from(recurringExpenses).orderBy(desc(recurringExpenses.active));
      }),
      create: protectedProcedure
        .input(z.object({ description: z.string().optional(), supplier: z.string().optional(), amount: z.number(), paymentMethod: z.enum(["cash", "card", "transfer", "check", "other"]).optional(), categoryId: z.number().optional(), projectId: z.number().optional(), dayOfMonth: z.number().min(1).max(28).optional(), notes: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { recurringExpenses } = await import("../drizzle/schema");
          const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          await db.insert(recurringExpenses).values({ description: input.description ?? null, supplier: input.supplier ?? null, amount: String(input.amount), paymentMethod: input.paymentMethod ?? "transfer", categoryId: input.categoryId ?? null, projectId: input.projectId ?? null, dayOfMonth: input.dayOfMonth ?? 1, notes: input.notes ?? null, createdById: ctx.user.id } as any);
          return { success: true };
        }),
      update: protectedProcedure
        .input(z.object({ id: z.number(), description: z.string().optional(), supplier: z.string().optional(), amount: z.number().optional(), paymentMethod: z.enum(["cash", "card", "transfer", "check", "other"]).optional(), categoryId: z.number().nullable().optional(), projectId: z.number().nullable().optional(), dayOfMonth: z.number().min(1).max(28).optional(), active: z.boolean().optional(), notes: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { recurringExpenses } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          const { id, amount, active, ...rest } = input;
          const patch: any = { ...rest };
          if (amount !== undefined) patch.amount = String(amount);
          if (active !== undefined) patch.active = active ? 1 : 0;
          await db.update(recurringExpenses).set(patch).where(eq(recurringExpenses.id, id));
          return { success: true };
        }),
      remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { recurringExpenses } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db.delete(recurringExpenses).where(eq(recurringExpenses.id, input.id));
        return { success: true };
      }),
      // Idempotente: cria as despesas dos modelos ativos para o mês (se ainda não existem).
      generateMonth: protectedProcedure
        .input(z.object({ year: z.number(), month: z.number() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "frontoffice");
          const { getDb, createExpense } = await import("./db");
          const { recurringExpenses, expenses } = await import("../drizzle/schema");
          const { eq, and, gte, lte } = await import("drizzle-orm");
          const db = await getDb(); if (!db) return { created: 0 };
          const templates = await db.select().from(recurringExpenses).where(eq(recurringExpenses.active, 1));
          const monthStr = `${input.year}-${String(input.month).padStart(2, "0")}`;
          const lastDay = new Date(input.year, input.month, 0).getDate();
          let created = 0;
          for (const t of templates) {
            const existing = await db.select({ id: expenses.id }).from(expenses).where(and(
              eq(expenses.recurringTemplateId, t.id),
              gte(expenses.expenseDate, `${monthStr}-01 00:00:00`),
              lte(expenses.expenseDate, `${monthStr}-${String(lastDay).padStart(2, "0")} 23:59:59`),
            )).limit(1);
            if (existing.length) continue;
            const day = Math.min(t.dayOfMonth, lastDay);
            await createExpense({
              supplier: t.supplier, description: t.description, amount: t.amount, currency: t.currency,
              paymentMethod: t.paymentMethod, expenseDate: `${monthStr}-${String(day).padStart(2, "0")} 00:00:00`,
              status: "pending", categoryId: t.categoryId, projectId: t.projectId,
              insertedById: ctx.user.id, recurringTemplateId: t.id, notes: t.notes,
            } as any);
            created++;
          }
          return { created };
        }),
    }),
  }),

  // ── LOGSS ───────────────────────────────────────────────────────────────────────────────────
  logs: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(2000).optional(),
        entity: z.string().optional(),
        action: z.string().optional(),
        userId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        return getActivityLogs(input?.limit ?? 500, {
          entity: input?.entity,
          action: input?.action,
          userId: input?.userId,
        });
      }),
  }),

  // ── RH ───────────────────────────────────────────────────────────────────────────────────────
  rh: router({
    // ── MY PROFILE (for extra/low-role users) ──────────────────────────────────────────────────
    me: protectedProcedure.query(async ({ ctx }) => {
      return getEmployeeByUserId(ctx.user.id);
    }),

    // Resumo do mês actual para o próprio colaborador: horas + valor a receber.
    // Admin pode ver de outros passando employeeId; o próprio só vê o seu.
    myMonthSummary: protectedProcedure
      .input(z.object({ employeeId: z.number().optional(), year: z.number().optional(), month: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        let employeeId = input?.employeeId;
        if (!employeeId) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me) throw new TRPCError({ code: "NOT_FOUND", message: "Sem ficha de colaborador" });
          employeeId = me.employee.id;
        }
        // Restringe: se não és admin, só te vês a ti próprio
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== employeeId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
          }
        }
        const now = new Date();
        const year = input?.year ?? now.getFullYear();
        const month = input?.month ?? (now.getMonth() + 1);
        const payroll = await getPayrollData(year, month);
        const row = payroll.find((r: any) => r.employeeId === employeeId);
        if (!row) return null;
        return {
          year,
          month,
          fullName: row.fullName,
          isExtra: row.isExtra,
          totalHours: row.totalHours,
          daysWorked: row.daysWorked,
          hourlyRate: row.hourlyRate,
          baseSalary: row.baseSalary,
          extraPayment: row.extraPayment,
          overtimePayment: row.overtimePayment,
          nightPayment: row.nightPayment,
          weekendPayment: row.weekendPayment,
          mealAllowance: row.mealAllowance,
          totalPayment: row.totalPayment,
          tsuEmployee: row.tsuEmployee,
          irsEstimate: row.irsEstimate,
          netEstimate: row.netEstimate,
        };
      }),

    // ── ROSTER MÍNIMO ──────────────────────────────────────────────────────────────────────────
    // Lista pública (id + fullName) para selectors em qualquer página
    // (atribuir responsáveis, condutores envolvidos, etc.). Sem requireRole
    // para que frontoffice/team_leader/extra possam usar dropdowns também.
    roster: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        const rows = await getAllEmployees({ isActive: input?.activeOnly ?? true });
        return rows.map((row: any) => ({
          id: row.employee.id,
          fullName: row.employee.fullName,
        }));
      }),

    // ── STATS ──────────────────────────────────────────────────────────────────────────────────
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      await seedExtraRates();
      return getHRStats();
    }),

    // ── EMPLOYEES ─────────────────────────────────────────────────────────────────────────────────
    list: protectedProcedure
      .input(z.object({ isActive: z.boolean().optional(), position: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getAllEmployees({ isActive: input?.isActive, position: input?.position });
      }),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        // extras can view their own profile
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const myEmployee = await getEmployeeByUserId(ctx.user.id);
          if (!myEmployee || myEmployee.employee.id !== input.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
          }
        }
        return getEmployeeById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        multiparkAgentName: z.string().min(1, "Nome Multipark é obrigatório"),
        phone: z.string().optional(),
        nif: z.string().optional(),
        nib: z.string().optional(),
        address: z.string().optional(),
        birthDate: z.string().optional(),
        nationality: z.string().optional(),
        position: z.enum(["director","supervisor","team_leader","backoffice","frontoffice","senior_driver","driver","extra"]),
        extraLevel: z.number().min(1).max(4).optional(),
        department: z.string().optional(),
        projectId: z.number({ message: "Centro de custos obrigatório" }),
        contractType: z.enum(["permanent","fixed_term","extra"]).optional(),
        contractStart: z.string().optional(),
        contractEnd: z.string().optional(),
        monthlySalary: z.string().optional(),
        mealAllowancePerDay: z.string().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");

        // Se não foi indicado userId, cria um utilizador com o email do colaborador.
        // Role por defeito: extra para position=extra, user para os restantes.
        // Permissões superiores só podem ser dadas por super_admin via página Utilizadores.
        let userId = input.userId ?? null;
        if (!userId) {
          // Procura primeiro se já existe um user com este email
          const existing = await getUserByEmail(input.email);
          if (existing) {
            userId = existing.id;
          } else {
            const role = input.position === "extra" ? "extra" : "user";
            const created = await createManualUser({
              name: input.fullName,
              email: input.email,
              role,
            });
            userId = created?.id ?? null;
          }
        }

        await createEmployee({
          fullName: input.fullName,
          email: input.email,
          multiparkAgentName: input.multiparkAgentName,
          phone: input.phone ?? null,
          nif: input.nif ?? null,
          nib: input.nib ?? null,
          address: input.address ?? null,
          birthDate: input.birthDate ? new Date(input.birthDate).toISOString().slice(0, 19).replace("T", " ") : null,
          nationality: input.nationality ?? null,
          position: input.position,
          extraLevel: input.extraLevel ?? null,
          department: input.department ?? null,
          projectId: input.projectId,
          contractType: input.contractType ?? "permanent",
          contractStart: input.contractStart ? new Date(input.contractStart).toISOString().slice(0, 19).replace("T", " ") : null,
          contractEnd: input.contractEnd ? new Date(input.contractEnd).toISOString().slice(0, 19).replace("T", " ") : null,
          monthlySalary: input.monthlySalary ?? null,
          mealAllowancePerDay: input.mealAllowancePerDay ?? null,
          userId,
          isActive: 1,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "employee", details: `Colaborador criado: ${input.fullName}` });
        return { success: true, userId };
      }),

    importExtras: protectedProcedure
      .input(z.object({ csv: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const report = await importExtrasFromCsv(input.csv, ctx.user.id);
        await logActivity({
          userId: ctx.user.id,
          action: "import",
          entity: "employee",
          details: `Import extras CSV: ${report.created} criados, ${report.errors.length} erros (de ${report.parsed} linhas)`,
        });
        return report;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        nif: z.string().optional(),
        nib: z.string().optional(),
        address: z.string().optional(),
        birthDate: z.string().optional(),
        nationality: z.string().optional(),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
        position: z.enum(["director","supervisor","team_leader","backoffice","frontoffice","senior_driver","driver","extra"]).optional(),
        extraLevel: z.number().min(1).max(5).optional(),
        department: z.string().optional(),
        projectId: z.number().optional(),
        contractType: z.enum(["permanent","fixed_term","extra"]).optional(),
        contractStart: z.string().optional(),
        contractEnd: z.string().optional(),
        monthlySalary: z.string().optional(),
        mealAllowancePerDay: z.string().optional(),
        userId: z.number().nullable().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { id, birthDate, contractStart, contractEnd, ...rest } = input;
        const data: any = { ...rest };
        if (birthDate) data.birthDate = new Date(birthDate);
        if (contractStart) data.contractStart = new Date(contractStart);
        if (contractEnd) data.contractEnd = new Date(contractEnd);
        await updateEmployee(id, data);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "employee", entityId: id, details: `Colaborador atualizado: ${id}` });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteEmployee(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "employee", entityId: input.id, details: `Colaborador desativado: ${input.id}` });
        return { success: true };
      }),

    uploadPhoto: protectedProcedure
      .input(z.object({ employeeId: z.number(), fileBase64: z.string(), mimeType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.fileBase64, "base64");
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `employees/${input.employeeId}/photo-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updateEmployee(input.employeeId, { photoUrl: url, photoKey: key });
        return { url, key };
      }),

    // ── DOCUMENTS ─────────────────────────────────────────────────────────────────────────────────
    documents: router({
      list: protectedProcedure
        .input(z.object({ employeeId: z.number() }))
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getEmployeeDocuments(input.employeeId);
        }),

      upload: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          docType: z.enum(["id_card","residence_permit","driving_license","nib_proof","address_proof","contract","extra_contract","contract_annex","responsibility_term","work_accident_insurance","photo","other"]),
          label: z.string().optional(),
          fileBase64: z.string(),
          mimeType: z.string(),
          fileName: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { storagePut } = await import("./storage");
          const buffer = Buffer.from(input.fileBase64, "base64");
          const key = `employees/${input.employeeId}/docs/${input.docType}-${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(key, buffer, input.mimeType);
          await createEmployeeDocument({
            employeeId: input.employeeId,
            docType: input.docType,
            label: input.label ?? input.fileName,
            fileUrl: url,
            fileKey: key,
            mimeType: input.mimeType,
            uploadedById: ctx.user.id,
          });
          await logActivity({ userId: ctx.user.id, action: "upload", entity: "employee_document", entityId: input.employeeId, details: `Documento carregado: ${input.docType}` });
          return { url, key };
        }),

      uploadBatch: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          docType: z.enum(["id_card","residence_permit","driving_license","nib_proof","address_proof","contract","extra_contract","contract_annex","responsibility_term","work_accident_insurance","photo","other"]),
          files: z.array(z.object({
            fileBase64: z.string(),
            mimeType: z.string(),
            fileName: z.string(),
            label: z.string().optional(),
          })),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { storagePut } = await import("./storage");
          const results: { url: string; key: string }[] = [];
          for (const file of input.files) {
            const buffer = Buffer.from(file.fileBase64, "base64");
            const key = `employees/${input.employeeId}/docs/${input.docType}-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.fileName}`;
            const { url } = await storagePut(key, buffer, file.mimeType);
            await createEmployeeDocument({
              employeeId: input.employeeId,
              docType: input.docType,
              label: file.label ?? file.fileName,
              fileUrl: url,
              fileKey: key,
              mimeType: file.mimeType,
              uploadedById: ctx.user.id,
            });
            results.push({ url, key });
          }
          await logActivity({ userId: ctx.user.id, action: "upload", entity: "employee_document", entityId: input.employeeId, details: `${input.files.length} documentos carregados: ${input.docType}` });
          return results;
        }),
      checklist: protectedProcedure
        .input(z.object({ employeeId: z.number() }))
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getDocumentChecklistForEmployee(input.employeeId);
        }),
      allStatus: protectedProcedure
        .query(async ({ ctx }) => {
          requireRole(ctx.user.role, "admin");
          const map = await getAllEmployeesDocumentStatus();
          const MANDATORY = ["photo","id_card","driving_license","nib_proof","address_proof","contract","responsibility_term"];
          const result: Record<number, { total: number; present: number; missing: string[] }> = {};
          if (map instanceof Map) {
            map.forEach((types, empId) => {
              const missing = MANDATORY.filter(t => !types.has(t));
              result[empId] = { total: MANDATORY.length, present: MANDATORY.length - missing.length, missing };
            });
          }
          return result;
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await deleteEmployeeDocument(input.id);
          return { success: true };
        }),
    }),

    // ── SCHEDULES ─────────────────────────────────────────────────────────────────────────────────
    schedules: router({
      list: protectedProcedure
        .input(z.object({ employeeId: z.number() }))
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getEmployeeSchedules(input.employeeId);
        }),

      upsert: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          weekday: z.number().min(0).max(6),
          startTime: z.string(),
          endTime: z.string(),
          isWorkDay: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await upsertSchedule({ ...input, isWorkDay: input.isWorkDay ? 1 : 0 });
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ employeeId: z.number(), weekday: z.number().min(0).max(6) }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await deleteSchedule(input.employeeId, input.weekday);
          return { success: true };
        }),
    }),

    // ── TIME RECORDS ────────────────────────────────────────────────────────────────────────────────
    timeRecords: router({
      list: protectedProcedure
        .input(z.object({ employeeId: z.number(), startDate: z.string().optional(), endDate: z.string().optional() }))
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getTimeRecords(
            input.employeeId,
            input.startDate ? new Date(input.startDate) : undefined,
            input.endDate ? new Date(input.endDate) : undefined,
          );
        }),

      checkIn: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          photoBase64: z.string().optional(),
          mimeType: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          locationName: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          // admin pode picar a qualquer um; outros só ao próprio
          if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
            const me = await getEmployeeByUserId(ctx.user.id);
            if (!me || me.employee.id !== input.employeeId) {
              throw new TRPCError({ code: "FORBIDDEN", message: "Só podes picar o teu próprio ponto" });
            }
          }
          // Bloqueia dois check-ins seguidos sem check-out
          const recent = await getTimeRecords(input.employeeId);
          const last = recent[0];
          if (last && last.type === "check_in") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Já tens uma entrada em aberto. Faz check-out primeiro.",
            });
          }
          let photoUrl: string | null = null;
          let photoKey: string | null = null;
          if (input.photoBase64 && input.mimeType) {
            const { storagePut } = await import("./storage");
            const buffer = Buffer.from(input.photoBase64, "base64");
            const ext = input.mimeType.split("/")[1] ?? "jpg";
            const key = `employees/${input.employeeId}/ponto/${Date.now()}.${ext}`;
            const result = await storagePut(key, buffer, input.mimeType);
            photoUrl = result.url;
            photoKey = key;
          }
          await createTimeRecord({
            employeeId: input.employeeId,
            type: "check_in",
            recordedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            photoUrl,
            photoKey,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            locationName: input.locationName ?? null,
            notes: input.notes ?? null,
          });
          await logActivity({ userId: ctx.user.id, action: "check_in", entity: "time_record", entityId: input.employeeId, details: `Check-in: ${input.locationName ?? ""}` });
          return { success: true };
        }),

      checkOut: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          photoBase64: z.string().optional(),
          mimeType: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          locationName: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
            const me = await getEmployeeByUserId(ctx.user.id);
            if (!me || me.employee.id !== input.employeeId) {
              throw new TRPCError({ code: "FORBIDDEN", message: "Só podes picar o teu próprio ponto" });
            }
          }
          // Exige check-in aberto
          const records = await getTimeRecords(input.employeeId);
          const last = records[0];
          if (!last || last.type !== "check_in") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Não tens entrada em aberto. Faz check-in primeiro.",
            });
          }
          let photoUrl: string | null = null;
          let photoKey: string | null = null;
          if (input.photoBase64 && input.mimeType) {
            const { storagePut } = await import("./storage");
            const buffer = Buffer.from(input.photoBase64, "base64");
            const ext = input.mimeType.split("/")[1] ?? "jpg";
            const key = `employees/${input.employeeId}/ponto/${Date.now()}-out.${ext}`;
            const result = await storagePut(key, buffer, input.mimeType);
            photoUrl = result.url;
            photoKey = key;
          }
          const diff = (new Date().getTime() - new Date(last.recordedAt).getTime()) / 3600000;
          const hoursWorked = diff.toFixed(2);
          await createTimeRecord({
            employeeId: input.employeeId,
            type: "check_out",
            recordedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            photoUrl,
            photoKey,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            locationName: input.locationName ?? null,
            hoursWorked,
            notes: input.notes ?? null,
          });
          await logActivity({ userId: ctx.user.id, action: "check_out", entity: "time_record", entityId: input.employeeId, details: `Check-out: ${hoursWorked}h` });
          return { success: true, hoursWorked };
        }),

      monthlyHours: protectedProcedure
        .input(z.object({ employeeId: z.number(), year: z.number(), month: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
            const me = await getEmployeeByUserId(ctx.user.id);
            if (!me || me.employee.id !== input.employeeId) {
              throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
            }
          }
          return getMonthlyHours(input.employeeId, input.year, input.month);
        }),
    }),

    // ── PAYROLL ──────────────────────────────────────────────────────────────────────────────────
    payroll: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getPayrollData(input.year, input.month);
      }),

    payrollPdf: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const pdfBuffer = await generatePayrollPdf(input.year, input.month);
        const { storagePut } = await import("./storage");
        const fileName = `folha_ordenados_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
        const key = `payroll/${fileName}_${Date.now()}.pdf`;
        const { url } = await storagePut(key, pdfBuffer, "application/pdf");
        await savePayslipRecord({ year: input.year, month: input.month, payslipType: "payroll", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
        return { url, fileName };
      }),

    payslipPdf: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number().min(1).max(12), employeeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const pdfBuffer = await generatePayslipPdf(input.year, input.month, input.employeeId);
        const { storagePut } = await import("./storage");
        // Get employee name for history
        const payrollData = await getPayrollData(input.year, input.month);
        const emp = payrollData.find((e: any) => e.employeeId === input.employeeId);
        const empName = emp?.fullName ?? `Funcionário #${input.employeeId}`;
        const fileName = `recibo_${empName.replace(/[^a-zA-Z0-9]/g, "_")}_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
        const key = `payslips/${fileName}_${Date.now()}.pdf`;
        const { url } = await storagePut(key, pdfBuffer, "application/pdf");
        await savePayslipRecord({ employeeId: input.employeeId, employeeName: empName, year: input.year, month: input.month, payslipType: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
        return { url };
      }),

    allPayslipsPdf: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const payslips = await generateAllPayslipsPdf(input.year, input.month);
        const { storagePut } = await import("./storage");
        const results: Array<{ employeeId: number; fullName: string; url: string }> = [];
        for (const ps of payslips) {
          const safeName = ps.fullName.replace(/[^a-zA-Z0-9]/g, "_");
          const fileName = `recibo_${safeName}_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
          const key = `payslips/${fileName}_${Date.now()}.pdf`;
          const { url } = await storagePut(key, ps.buffer, "application/pdf");
          results.push({ employeeId: ps.employeeId, fullName: ps.fullName, url });
          await savePayslipRecord({ employeeId: ps.employeeId, employeeName: ps.fullName, year: input.year, month: input.month, payslipType: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
        }
        return { payslips: results, count: results.length };
      }),

    sendPayrollEmail: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number().min(1).max(12), email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        // Generate PDF and upload to S3
        const pdfBuffer = await generatePayrollPdf(input.year, input.month);
        const { storagePut } = await import("./storage");
        const monthNames = ["Janeiro","Fevereiro","Mar\u00e7o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        const monthName = monthNames[input.month - 1];
        const key = `payroll/folha_ordenados_${input.year}_${String(input.month).padStart(2, "0")}_${Date.now()}.pdf`;
        const { url } = await storagePut(key, pdfBuffer, "application/pdf");
        // Notify the owner with the PDF link so they can forward it
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `Folha de Ordenados - ${monthName} ${input.year}`,
          content: `A folha de ordenados de ${monthName} ${input.year} foi gerada e est\u00e1 pronta para enviar ao contabilista (${input.email}).\n\nLink do PDF: ${url}`,
        });
        return { url, email: input.email, monthName, year: input.year };
      }),

    // ── FÉRIAS / BAIXAS ────────────────────────────────────────────────────
    leaves: router({
      list: protectedProcedure
        .input(z.object({ employeeId: z.number(), year: z.number().optional() }))
        .query(async ({ ctx, input }) => {
          if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
            const me = await getEmployeeByUserId(ctx.user.id);
            if (!me || me.employee.id !== input.employeeId) throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
          }
          return getEmployeeLeaves(input.employeeId, input.year);
        }),
      create: protectedProcedure
        .input(z.object({
          employeeId: z.number(),
          leaveType: z.enum(["vacation", "sick", "unpaid", "other"]),
          fromDate: z.string(),
          toDate: z.string(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await createEmployeeLeave({ ...input, createdById: ctx.user.id });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "employee_leave", entityId: input.employeeId, details: `${input.leaveType} ${input.fromDate}→${input.toDate}` });
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await deleteEmployeeLeave(input.id);
          return { success: true };
        }),
    }),

    // ── HISTÓRICO SALARIAL ─────────────────────────────────────────────────
    salaryHistory: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return getEmployeeSalaryHistory(input.employeeId);
      }),

    // ── PENALIZAÇÕES ───────────────────────────────────────────────────────
    penalties: router({
      list: protectedProcedure
        .input(z.object({ employeeId: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
            const me = await getEmployeeByUserId(ctx.user.id);
            if (!me || me.employee.id !== input.employeeId) throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
          }
          return getOpenPenalties(input.employeeId);
        }),
      clear: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "supervisor");
          await clearPenalty(input.id, ctx.user.id);
          await logActivity({ userId: ctx.user.id, action: "clear", entity: "employee_penalty", entityId: input.id });
          return { success: true };
        }),
      processNoShows: protectedProcedure
        .input(z.object({ date: z.string() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const report = await processExtraDiaNoShows(input.date);
          await logActivity({ userId: ctx.user.id, action: "process_noshows", entity: "extras_dia", details: `${input.date}: ${report.created} penalties` });
          return report;
        }),
    }),

    // ── BLOQUEIO LOGIN ─────────────────────────────────────────────────────
    unblock: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "supervisor");
        await unblockEmployeeLogin(input.employeeId, ctx.user.id);
        return { success: true };
      }),

    checkDocs: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return checkExtraDocsCompliance(input.employeeId);
      }),

    // ── DASHBOARD RH (super_admin) ─────────────────────────────────────────
    dashboard: protectedProcedure
      .input(z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
        monthsLookback: z.number().min(1).max(12).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        const now = new Date();
        return getRhDashboardSummary(
          input?.year ?? now.getFullYear(),
          input?.month ?? (now.getMonth() + 1),
          input?.monthsLookback ?? 3,
        );
      }),

    // ── EXTRA RATES ─────────────────────────────────────────────────────────────────────────────────
    extraRates: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
        await seedExtraRates();
        return getExtraRates();
      }),

      update: protectedProcedure
        .input(z.object({ level: z.number(), hourlyRate: z.string() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "super_admin");
          await updateExtraRate(input.level, input.hourlyRate);
          return { success: true };
        }),
    }),
  }),

  // ─── MARKETING ────────────────────────────────────────────────────────────
  marketing: router({
    dashboard: protectedProcedure
      .input(z.object({ from: z.string().optional(), to: z.string().optional(), projectId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const from = input?.from ? new Date(input.from) : undefined;
        const to = input?.to ? new Date(input.to) : undefined;
        return getMarketingDashboardStats({ from, to, projectId: input?.projectId });
      }),

    bookingRevenue: protectedProcedure
      .input(z.object({ from: z.string().optional(), to: z.string().optional(), projectId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getBookingRevenueByProject({ from: input?.from, to: input?.to, projectId: input?.projectId });
      }),

    // ── CAMPAIGNS ──
    campaigns: router({
      list: protectedProcedure
        .input(z.object({ platform: z.string().optional(), projectId: z.number().optional(), status: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getCampaigns({ platform: input?.platform, projectId: input?.projectId, status: input?.status });
        }),
      get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getCampaignById(input.id);
      }),
      create: protectedProcedure
        .input(z.object({
          name: z.string().min(1),
          platform: z.enum(["google_ads", "meta_ads", "instagram", "other"]),
          projectId: z.number().optional(),
          status: z.enum(["active", "paused", "completed"]).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          budget: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const id = await createCampaign({
            name: input.name,
            platform: input.platform,
            projectId: input.projectId ?? null,
            campaignStatus: input.status ?? "active",
            startDate: input.startDate ? new Date(input.startDate).toISOString().slice(0, 19).replace("T", " ") : null,
            endDate: input.endDate ? new Date(input.endDate).toISOString().slice(0, 19).replace("T", " ") : null,
            budget: input.budget ?? null,
            notes: input.notes ?? null,
            createdById: ctx.user.id,
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "campaign", entityId: id, details: `Campanha: ${input.name}` });
          return { id };
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          platform: z.enum(["google_ads", "meta_ads", "instagram", "other"]).optional(),
          projectId: z.number().nullable().optional(),
          status: z.enum(["active", "paused", "completed"]).optional(),
          startDate: z.string().nullable().optional(),
          endDate: z.string().nullable().optional(),
          budget: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { id, ...data } = input;
          const updateData: any = { ...data };
          if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
          if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
          await updateCampaign(id, updateData);
          await logActivity({ userId: ctx.user.id, action: "update", entity: "campaign", entityId: id, details: `Campanha atualizada` });
          return { success: true };
        }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteCampaign(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "campaign", entityId: input.id, details: `Campanha eliminada` });
        return { success: true };
      }),
    }),

    // ── CAMPANHAS INTERNAS (das reservas Multipark) ──
    // Campanha lógica agrupa várias chaves (campaignId do link, nome, ou padrão
    // de URL). Atribuição "uma vez": detecta chaves novas, utilizador atribui.
    internalCampaigns: router({
      // Chaves ainda NÃO atribuídas: campaignId (do originUrl) + campaignName não-parceiro.
      detect: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return { ids: [], names: [] };
        const rows = (r: any) => (Array.isArray(r[0]) ? r[0] : r) as any[];
        // TODOS os links (originUrl) ainda não atribuídos — agrega reservas por link.
        const linksRes: any = await db.execute(sql`
          SELECT originUrl AS value, COUNT(*) AS bookings, COALESCE(SUM(totalPrice),0) AS revenue
          FROM multipark_bookings
          WHERE originUrl IS NOT NULL AND originUrl <> ''
            AND NOT EXISTS (
              SELECT 1 FROM internal_campaign_keys k
              WHERE k.keyType = 'url_pattern' AND multipark_bookings.originUrl LIKE k.keyValue
            )
          GROUP BY originUrl ORDER BY bookings DESC LIMIT 250`);
        const namesRes: any = await db.execute(sql`
          SELECT campaignName AS value, COUNT(*) AS bookings, COALESCE(SUM(totalPrice),0) AS revenue
          FROM multipark_bookings
          WHERE campaignName IS NOT NULL AND campaignName <> ''
            AND campaignName NOT IN (SELECT name FROM partnerships)
            AND campaignName NOT IN (SELECT keyValue FROM internal_campaign_keys WHERE keyType='campaign_name')
          GROUP BY campaignName ORDER BY bookings DESC`);
        return { links: rows(linksRes), names: rows(namesRes) };
      }),

      // Campanhas lógicas + chaves + custos + métricas (reservas/receita/gasto).
      list: protectedProcedure
        .input(z.object({ from: z.string().optional(), to: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { sql } = await import("drizzle-orm");
          const db = await getDb();
          if (!db) return [];
          const rows = (r: any) => (Array.isArray(r[0]) ? r[0] : r) as any[];
          // Campanhas vêm de DUAS fontes: internal_campaigns + campaigns (ad).
          const internal = rows(await db.execute(sql`SELECT id, name, projectId, dailyBudget, city, brand, campaignStatus FROM internal_campaigns ORDER BY name`))
            .map((c) => ({ ...c, campaignType: "internal" as const }));
          const ad = rows(await db.execute(sql`SELECT id, name, projectId, budget AS dailyBudget, platform AS brand, campaignStatus FROM campaigns ORDER BY name`))
            .map((c) => ({ ...c, city: null, campaignType: "ad" as const }));
          // nº de dias do período (para estimar gasto via dailyBudget)
          const periodDays = input?.from && input?.to
            ? Math.max(1, Math.floor((Date.parse(input.to) - Date.parse(input.from)) / 86400000) + 1)
            : 0;
          const projs = rows(await db.execute(sql`SELECT id, name FROM projects`));
          const projName = new Map(projs.map((p) => [p.id, p.name]));
          const camps = [...internal, ...ad].map((c) => ({ ...c, projectName: c.projectId ? projName.get(c.projectId) ?? null : null }));
          const allKeys = rows(await db.execute(sql`SELECT * FROM internal_campaign_keys`));
          const dateCond = input?.from && input?.to
            ? sql` AND checkIn >= ${input.from + " 00:00:00"} AND checkIn <= ${input.to + " 23:59:59"}`
            : sql``;
          const out: any[] = [];
          for (const c of camps) {
            const keys = allKeys.filter((k) => k.campaignType === c.campaignType && k.campaignId === c.id);
            const conds: any[] = [];
            const names = keys.filter((k) => k.keyType === "campaign_name").map((k) => k.keyValue);
            if (names.length) conds.push(sql`campaignName IN (${sql.join(names.map((v: string) => sql`${v}`), sql`, `)})`);
            for (const k of keys.filter((k) => k.keyType === "campaign_id")) conds.push(sql`originUrl LIKE ${"%campaignId=" + k.keyValue + "%"}`);
            for (const k of keys.filter((k) => k.keyType === "url_pattern")) conds.push(sql`originUrl LIKE ${k.keyValue}`);
            let bookings = 0, revenue = 0;
            if (conds.length) {
              const m = rows(await db.execute(sql`SELECT COUNT(*) AS c, COALESCE(SUM(totalPrice),0) AS rev FROM multipark_bookings WHERE (${sql.join(conds, sql` OR `)})${dateCond}`))[0];
              bookings = Number(m?.c ?? 0); revenue = Number(m?.rev ?? 0);
            }
            const costRow = rows(await db.execute(sql`SELECT COALESCE(SUM(amount),0) AS spend FROM internal_campaign_costs WHERE campaignType = ${c.campaignType} AND campaignId = ${c.id}${input?.from && input?.to ? sql` AND costDate >= ${input.from} AND costDate <= ${input.to}` : sql``}`))[0];
            const manualSpend = Number(costRow?.spend ?? 0);
            // Gasto real importado do Google Ads (campaign_daily_stats, só campanhas ad).
            let realStatsSpend = 0;
            if (c.campaignType === "ad" && input?.from && input?.to) {
              const r = rows(await db.execute(sql`SELECT COALESCE(SUM(spend),0) AS s FROM campaign_daily_stats WHERE campaignId = ${c.id} AND date >= ${input.from + " 00:00:00"} AND date <= ${input.to + " 23:59:59"}`))[0];
              realStatsSpend = Number(r?.s ?? 0);
            }
            // Prioridade: gasto real importado > custo manual > estimativa por orçamento×dias.
            const budgetSpend = c.dailyBudget && periodDays > 0 ? Number(c.dailyBudget) * periodDays : 0;
            const spend = realStatsSpend > 0 ? realStatsSpend : (manualSpend > 0 ? manualSpend : budgetSpend);
            const spendEstimated = realStatsSpend === 0 && manualSpend === 0 && budgetSpend > 0;
            out.push({ ...c, dailyBudget: c.dailyBudget != null ? Number(c.dailyBudget) : null, keys, bookings, revenue, spend, spendEstimated, costPerBooking: bookings > 0 ? spend / bookings : 0, roas: spend > 0 ? revenue / spend : null });
          }
          // Campanhas com chaves ou métricas primeiro
          out.sort((a, b) => (b.keys.length || b.bookings) - (a.keys.length || a.bookings));
          return out;
        }),

      create: protectedProcedure
        .input(z.object({ name: z.string().min(1), projectId: z.number().optional(), dailyBudget: z.number().optional(), city: z.string().optional(), brand: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { internalCampaigns } = await import("../drizzle/schema");
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          await db.insert(internalCampaigns).values({ name: input.name, projectId: input.projectId ?? null, dailyBudget: input.dailyBudget != null ? String(input.dailyBudget) : null, city: input.city ?? null, brand: input.brand ?? null, createdById: ctx.user.id } as any);
          return { success: true };
        }),

      update: protectedProcedure
        .input(z.object({ id: z.number(), name: z.string().optional(), projectId: z.number().nullable().optional(), dailyBudget: z.number().nullable().optional(), city: z.string().optional(), brand: z.string().optional(), campaignStatus: z.enum(["active", "paused", "completed"]).optional() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { internalCampaigns } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          const { id, ...rest } = input;
          await db.update(internalCampaigns).set(rest as any).where(eq(internalCampaigns.id, id));
          return { success: true };
        }),

      // Para ad campaigns só desliga (apaga chaves/custos desta vista); a campanha
      // em si é gerida na tab "Campanhas". Para internas apaga tudo.
      remove: protectedProcedure.input(z.object({ campaignType: z.enum(["internal", "ad"]), id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { internalCampaigns, internalCampaignKeys, internalCampaignCosts } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db.delete(internalCampaignKeys).where(and(eq(internalCampaignKeys.campaignType, input.campaignType), eq(internalCampaignKeys.campaignId, input.id)));
        await db.delete(internalCampaignCosts).where(and(eq(internalCampaignCosts.campaignType, input.campaignType), eq(internalCampaignCosts.campaignId, input.id)));
        if (input.campaignType === "internal") await db.delete(internalCampaigns).where(eq(internalCampaigns.id, input.id));
        return { success: true };
      }),

      // Atribui uma chave detetada a uma campanha (a tal "atribuição uma vez").
      assignKey: protectedProcedure
        .input(z.object({ campaignType: z.enum(["internal", "ad"]), campaignId: z.number(), keyType: z.enum(["campaign_id", "campaign_name", "url_pattern"]), keyValue: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { internalCampaignKeys } = await import("../drizzle/schema");
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          await db.insert(internalCampaignKeys).values({ campaignType: input.campaignType, campaignId: input.campaignId, keyType: input.keyType, keyValue: input.keyValue } as any);
          return { success: true };
        }),

      removeKey: protectedProcedure.input(z.object({ keyId: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { internalCampaignKeys } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db.delete(internalCampaignKeys).where(eq(internalCampaignKeys.id, input.keyId));
        return { success: true };
      }),

      addCost: protectedProcedure
        .input(z.object({ campaignType: z.enum(["internal", "ad"]), campaignId: z.number(), costDate: z.string(), amount: z.number(), notes: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { getDb } = await import("./db");
          const { sql } = await import("drizzle-orm");
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
          // upsert por (campaignType, campaignId, costDate)
          await db.execute(sql`
            INSERT INTO internal_campaign_costs (campaignType, campaignId, costDate, amount, notes, createdById)
            VALUES (${input.campaignType}, ${input.campaignId}, ${input.costDate}, ${input.amount}, ${input.notes ?? null}, ${ctx.user.id})
            ON DUPLICATE KEY UPDATE amount = ${input.amount}, notes = ${input.notes ?? null}`);
          return { success: true };
        }),

      costs: protectedProcedure.input(z.object({ campaignType: z.enum(["internal", "ad"]), campaignId: z.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { internalCampaignCosts } = await import("../drizzle/schema");
        const { eq, and, desc } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return [];
        return db.select().from(internalCampaignCosts).where(and(eq(internalCampaignCosts.campaignType, input.campaignType), eq(internalCampaignCosts.campaignId, input.campaignId))).orderBy(desc(internalCampaignCosts.costDate));
      }),

      removeCost: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { internalCampaignCosts } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db.delete(internalCampaignCosts).where(eq(internalCampaignCosts.id, input.id));
        return { success: true };
      }),
    }),

    // ── DAILY STATS ──
    stats: router({
      byCampaign: protectedProcedure.input(z.object({ campaignId: z.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getCampaignStats(input.campaignId);
      }),
      all: protectedProcedure
        .input(z.object({ from: z.string().optional(), to: z.string().optional(), projectId: z.number().optional() }).optional())
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const from = input?.from ? new Date(input.from) : undefined;
          const to = input?.to ? new Date(input.to) : undefined;
          return getAllDailyStats({ from, to, projectId: input?.projectId });
        }),
      import: protectedProcedure
        .input(z.object({
          campaignId: z.number(),
          rows: z.array(z.object({
            date: z.string(),
            spend: z.string(),
            impressions: z.number().optional(),
            clicks: z.number().optional(),
            conversions: z.number().optional(),
            conversionValue: z.string().optional(),
          })),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const rows = input.rows.map(r => ({
            campaignId: input.campaignId,
            date: new Date(r.date).toISOString().slice(0, 19).replace("T", " "),
            spend: r.spend,
            impressions: r.impressions ?? 0,
            clicks: r.clicks ?? 0,
            conversions: r.conversions ?? 0,
            conversionValue: r.conversionValue ?? "0",
            cpc: r.clicks && r.clicks > 0 ? (parseFloat(r.spend) / r.clicks).toFixed(4) : null,
            ctr: r.impressions && r.impressions > 0 ? ((r.clicks ?? 0) / r.impressions * 100).toFixed(4) : null,
            costPerConversion: r.conversions && r.conversions > 0 ? (parseFloat(r.spend) / r.conversions).toFixed(2) : null,
            importedById: ctx.user.id,
          }));
          await importDailyStats(rows);
          await logActivity({ userId: ctx.user.id, action: "import", entity: "campaign_stats", entityId: input.campaignId, details: `${rows.length} registos importados` });
          return { count: rows.length };
        }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteDailyStat(input.id);
        return { success: true };
      }),

      // ── IMPORTAÇÃO GOOGLE ADS CSV (com dedup) ──
      importGoogleAdsReport: protectedProcedure
        .input(z.object({
          dateRange: z.object({ start: z.string(), end: z.string() }),
          campaigns: z.array(z.object({
            name: z.string(),
            status: z.enum(["active", "paused", "completed"]),
            budget: z.number(),
            campaignType: z.string(),
            impressions: z.number(),
            interactions: z.number(),
            cost: z.number(),
            clicks: z.number(),
            conversions: z.number(),
            cpc: z.number(),
            ctr: z.number(),
            costPerConversion: z.number(),
          })),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const startDate = new Date(input.dateRange.start);
          const endDate = new Date(input.dateRange.end);
          let created = 0;
          let updated = 0;
          let skipped = 0;
          const details: string[] = [];

          for (const c of input.campaigns) {
            // Skip campaigns with no data at all
            if (c.cost === 0 && c.clicks === 0 && c.impressions === 0) {
              // Still create the campaign if it doesn't exist, but skip stats
              let campaign = await getCampaignByNameAndPlatform(c.name, "google_ads");
              if (!campaign) {
                const id = await createCampaign({
                  name: c.name,
                  platform: "google_ads",
                  campaignStatus: c.status,
                  budget: c.budget > 0 ? String(c.budget) : null,
                  notes: `Tipo: ${c.campaignType}`,
                  createdById: ctx.user.id,
                });
                details.push(`✅ Campanha criada (sem dados): ${c.name}`);
              }
              skipped++;
              continue;
            }

            // Find or create campaign
            let campaign = await getCampaignByNameAndPlatform(c.name, "google_ads");
            if (!campaign) {
              const id = await createCampaign({
                name: c.name,
                platform: "google_ads",
                campaignStatus: c.status,
                startDate: startDate.toISOString().slice(0, 19).replace("T", " "),
                endDate: endDate.toISOString().slice(0, 19).replace("T", " "),
                budget: c.budget > 0 ? String(c.budget) : null,
                notes: `Tipo: ${c.campaignType}`,
                createdById: ctx.user.id,
              });
              campaign = await getCampaignById(id);
              details.push(`✅ Campanha criada: ${c.name}`);
            } else {
              // Update campaign status and budget
              await updateCampaign(campaign.id, {
                campaignStatus: c.status,
                budget: c.budget > 0 ? String(c.budget) : campaign.budget,
              });
            }

            if (!campaign) { skipped++; continue; }

            // Distribui o total do período por cada dia. Reduz a granularidade
            // mas mantém os gráficos mensais corretos (em vez de carimbar tudo
            // numa só data). Verificação de duplicados por (campaign, day):
            // só insere os dias que ainda não existem.
            const daysMs = 86_400_000;
            const dayCount = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / daysMs) + 1);
            const spendPerDay = c.cost / dayCount;
            const impressionsPerDay = Math.floor(c.impressions / dayCount);
            const clicksPerDay = Math.floor(c.clicks / dayCount);
            const conversionsPerDay = c.conversions / dayCount;
            // Valor da conversão = conversões × custo por conversão (proxy razoável
            // quando o CSV não traz o valor explicitamente)
            const valuePerDay = (c.conversions * c.costPerConversion) / dayCount;

            const existing = await getExistingStatsForCampaignAndDateRange(campaign.id, startDate, endDate);
            const existingDays = new Set(
              existing.map((e: any) => new Date(e.date).toISOString().slice(0, 10)),
            );

            const newRows: any[] = [];
            for (let i = 0; i < dayCount; i++) {
              const d = new Date(startDate.getTime() + i * daysMs);
              const dayKey = d.toISOString().slice(0, 10);
              if (existingDays.has(dayKey)) continue;
              newRows.push({
                campaignId: campaign.id,
                date: d.toISOString().slice(0, 19).replace("T", " "),
                spend: spendPerDay.toFixed(2),
                impressions: impressionsPerDay,
                clicks: clicksPerDay,
                conversions: Math.round(conversionsPerDay),
                conversionValue: valuePerDay.toFixed(2),
                cpc: c.cpc > 0 ? String(c.cpc) : null,
                ctr: c.ctr > 0 ? String(c.ctr) : null,
                costPerConversion: c.costPerConversion > 0 ? String(c.costPerConversion) : null,
                importedById: ctx.user.id,
              });
            }

            if (newRows.length === 0) {
              details.push(`⚠️ ${c.name}: todos os dias do período já existiam — ignorado`);
              skipped++;
              continue;
            }

            await importDailyStats(newRows);
            created++;
            const skippedDays = dayCount - newRows.length;
            details.push(`📊 ${c.name}: ${newRows.length}/${dayCount} dias importados (${c.cost.toFixed(2)}€ total, ${c.clicks} cliques)${skippedDays > 0 ? ` — ${skippedDays} dias já existiam` : ""}`);
          }

          await logActivity({
            userId: ctx.user.id,
            action: "import",
            entity: "google_ads_report",
            entityId: 0,
            details: `Google Ads ${input.dateRange.start} a ${input.dateRange.end}: ${created} importados, ${skipped} ignorados`,
          });

          return { created, updated, skipped, details, total: input.campaigns.length };
        }),
    }),

    // ── MARKETING EXPENSES ──
    expenses: router({
      list: protectedProcedure
        .input(z.object({ category: z.string().optional(), projectId: z.number().optional(), from: z.string().optional(), to: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          return getMarketingExpenses({
            category: input?.category,
            projectId: input?.projectId,
            from: input?.from ? new Date(input.from) : undefined,
            to: input?.to ? new Date(input.to) : undefined,
          });
        }),
      create: protectedProcedure
        .input(z.object({
          description: z.string().min(1),
          category: z.enum(["google_ads", "meta_ads", "influencer", "print", "merchandise", "event", "other"]),
          amount: z.string(),
          date: z.string(),
          projectId: z.number().optional(),
          supplier: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const id = await createMarketingExpense({
            description: input.description,
            mktCategory: input.category,
            amount: input.amount,
            date: new Date(input.date).toISOString().slice(0, 19).replace("T", " "),
            projectId: input.projectId ?? null,
            supplier: input.supplier ?? null,
            notes: input.notes ?? null,
            createdById: ctx.user.id,
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "marketing_expense", entityId: id, details: `${input.description}: ${input.amount}€` });
          return { id };
        }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteMarketingExpense(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "marketing_expense", entityId: input.id, details: `Despesa marketing eliminada` });
        return { success: true };
      }),
    }),
   }),

  // ─── OPERACIONAL ──────────────────────────────────────────────────────────
  operational: router({
    dashboard: protectedProcedure.query(async () => {
      return getOperationalStats();
    }),

    vehicles: router({
      list: protectedProcedure.input(z.object({ status: z.string().optional(), projectId: z.number().optional() }).optional()).query(async ({ input }) => {
        return getVehicles(input ?? undefined);
      }),
      get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        return getVehicleById(input.id);
      }),
      create: protectedProcedure.input(z.object({
        plate: z.string().min(1),
        brand: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        color: z.string().optional(),
        status: z.enum(["active", "maintenance", "inactive"]).optional(),
        projectId: z.number().optional(),
        notes: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const id = await createVehicle({
          plate: input.plate,
          brand: input.brand ?? null,
          model: input.model ?? null,
          year: input.year ?? null,
          color: input.color ?? null,
          vehicleStatus: input.status ?? "active",
          projectId: input.projectId ?? null,
          notes: input.notes ?? null,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "vehicle", entityId: id, details: `Viatura ${input.plate}` });
        return { id };
      }),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        data: z.object({
          plate: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          year: z.number().optional(),
          color: z.string().optional(),
          status: z.enum(["active", "maintenance", "inactive"]).optional(),
          projectId: z.number().nullable().optional(),
          notes: z.string().optional(),
        }),
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { status, ...rest } = input.data;
        await updateVehicle(input.id, { ...rest, ...(status !== undefined && { vehicleStatus: status }) });
        await logActivity({ userId: ctx.user.id, action: "update", entity: "vehicle", entityId: input.id, details: "Viatura atualizada" });
        return { success: true };
      }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteVehicle(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "vehicle", entityId: input.id, details: "Viatura eliminada" });
        return { success: true };
      }),
      driverHistory: protectedProcedure.input(z.object({ vehicleId: z.number() })).query(async ({ input }) => {
        return getVehicleDriverHistory(input.vehicleId);
      }),
    }),

    movements: router({
      list: protectedProcedure.input(z.object({ vehicleId: z.number().optional(), employeeId: z.number().optional(), limit: z.number().optional() }).optional()).query(async ({ input }) => {
        return getVehicleMovements(input ?? undefined);
      }),
      create: protectedProcedure.input(z.object({
        vehicleId: z.number(),
        employeeId: z.number(),
        type: z.enum(["pickup", "return"]),
        kmReading: z.number().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        notes: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        const id = await createVehicleMovement({
          vehicleId: input.vehicleId,
          employeeId: input.employeeId,
          movementType: input.type,
          kmReading: input.kmReading ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          notes: input.notes ?? null,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "vehicle_movement", entityId: id, details: `${input.type === "pickup" ? "Recolha" : "Devolução"} viatura #${input.vehicleId}` });
        return { id };
      }),
    }),

    speedAlerts: router({
      list: protectedProcedure.input(z.object({ vehicleId: z.number().optional(), acknowledged: z.boolean().optional(), limit: z.number().optional() }).optional()).query(async ({ input }) => {
        return getSpeedAlerts(input ?? undefined);
      }),
      create: protectedProcedure.input(z.object({
        vehicleId: z.number(),
        employeeId: z.number().optional(),
        speed: z.number(),
        speedLimit: z.number(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        roadName: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        const id = await createSpeedAlert({
          vehicleId: input.vehicleId,
          employeeId: input.employeeId ?? null,
          speed: input.speed,
          speedLimit: input.speedLimit,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          roadName: input.roadName ?? null,
        });
        // Notify super admin
        const admins = await getSuperAdmins();
        if (admins.length > 0) {
          await notifyOwner({ title: "Alerta de Velocidade", content: `Viatura #${input.vehicleId} a ${input.speed} km/h (limite: ${input.speedLimit} km/h)${input.roadName ? " em " + input.roadName : ""}` });
        }
        await logActivity({ userId: ctx.user.id, action: "create", entity: "speed_alert", entityId: id, details: `${input.speed}km/h (limite ${input.speedLimit}km/h)` });
        return { id };
      }),
      acknowledge: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await acknowledgeSpeedAlert(input.id, ctx.user.id);
        return { success: true };
      }),
    }),

    radio: router({
      list: protectedProcedure.input(z.object({ employeeId: z.number().optional(), vehicleId: z.number().optional(), limit: z.number().optional() }).optional()).query(async ({ input }) => {
        return getRadioTranscriptions(input ?? undefined);
      }),
      transcribe: protectedProcedure.input(z.object({
        audioUrl: z.string(),
        employeeId: z.number().optional(),
        vehicleId: z.number().optional(),
        duration: z.number().optional(),
      })).mutation(async ({ ctx, input }) => {
        // Transcrição chama OpenAI (custo real). Restringir a team_leader+.
        requireRole(ctx.user.role, "team_leader");
        const result = await transcribeAudio({ audioUrl: input.audioUrl, language: "pt" });
        if ("error" in result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Transcrição falhou: ${result.error}` });
        }
        const transcriptionText = result.text;
        const summary = await invokeLLM({
          messages: [
            { role: "system", content: "Resume a seguinte transcrição de rádio em 1-2 frases curtas em português. Foca nos pontos operacionais relevantes." },
            { role: "user", content: transcriptionText },
          ],
        });
        const summaryText = typeof summary.choices[0].message.content === "string" ? summary.choices[0].message.content : "";
        const id = await createRadioTranscription({
          audioUrl: input.audioUrl,
          transcription: transcriptionText,
          summary: summaryText,
          employeeId: input.employeeId ?? null,
          vehicleId: input.vehicleId ?? null,
          duration: input.duration ?? null,
          transcribedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
          createdById: ctx.user.id,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "radio_transcription", entityId: id, details: "Transcrição de rádio" });
        return { id, transcription: result.text, summary: summaryText };
      }),
    }),

    // ─── ZELLO INTEGRATION ──────────────────────────────────────────────
    zello: router({
      users: protectedProcedure.query(async () => {
        return getZelloUsers();
      }),
      channels: protectedProcedure.query(async () => {
        return getZelloChannels();
      }),
      locations: protectedProcedure.query(async () => {
        return getZelloLocations();
      }),
      userLocation: protectedProcedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        return getZelloUserLocation(input.username);
      }),
      userHistory: protectedProcedure.input(z.object({
        username: z.string(),
        startTs: z.number(),
        endTs: z.number(),
      })).query(async ({ input }) => {
        return getZelloUserHistory(input.username, input.startTs, input.endTs);
      }),
    }),

    // ─── SPEED MONITORING ──────────────────────────────────────────────
    speedMonitoring: router({
      limits: router({
        list: protectedProcedure.query(async () => {
          return getSpeedLimits();
        }),
        create: protectedProcedure.input(z.object({
          name: z.string().min(1),
          maxSpeed: z.number().min(1),
          tolerancePercent: z.number().min(0).max(100).default(10),
          isDefault: z.boolean().default(false),
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const id = await createSpeedLimit({
            name: input.name,
            maxSpeed: input.maxSpeed,
            tolerancePercent: input.tolerancePercent,
            isDefault: input.isDefault ? 1 : 0,
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "speed_limit", entityId: id, details: `Limite ${input.name}: ${input.maxSpeed}km/h` });
          return { id };
        }),
        update: protectedProcedure.input(z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            maxSpeed: z.number().optional(),
            tolerancePercent: z.number().optional(),
            isDefault: z.boolean().optional(),
            isActive: z.boolean().optional(),
          }),
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { isDefault, isActive, ...rest } = input.data;
          const patch: Record<string, unknown> = { ...rest };
          if (isDefault !== undefined) patch.isDefault = isDefault ? 1 : 0;
          if (isActive !== undefined) patch.isActive = isActive ? 1 : 0;
          await updateSpeedLimit(input.id, patch);
          return { success: true };
        }),
        delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await deleteSpeedLimit(input.id);
          return { success: true };
        }),
      }),

      violations: router({
        list: protectedProcedure.input(z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          username: z.string().optional(),
          acknowledged: z.boolean().optional(),
        }).optional()).query(async ({ input }) => {
          return getSpeedViolations({
            startDate: input?.startDate ? new Date(input.startDate) : undefined,
            endDate: input?.endDate ? new Date(input.endDate) : undefined,
            username: input?.username,
            acknowledged: input?.acknowledged,
          });
        }),
        acknowledge: protectedProcedure.input(z.object({
          id: z.number(),
          notes: z.string().optional(),
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await acknowledgeSpeedViolation(input.id, ctx.user.id, input.notes);
          await logActivity({ userId: ctx.user.id, action: "update", entity: "speed_violation", entityId: input.id, details: "Infração reconhecida" });
          return { success: true };
        }),
        stats: protectedProcedure.input(z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }).optional()).query(async ({ input }) => {
          return getSpeedViolationStats(
            input?.startDate ? new Date(input.startDate) : undefined,
            input?.endDate ? new Date(input.endDate) : undefined,
          );
        }),
      }),

      /** Check all Zello locations and record violations */
      checkNow: protectedProcedure.mutation(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
        const locations = await getZelloLocations();
        const defaultLimit = await getDefaultSpeedLimit();
        if (!defaultLimit) return { checked: 0, violations: 0, message: "Nenhum limite de velocidade configurado" };

        const threshold = defaultLimit.maxSpeed * (1 + defaultLimit.tolerancePercent / 100);
        let violationCount = 0;

        for (const loc of locations) {
          if (loc.speed > threshold) {
            const excessPercent = ((loc.speed - defaultLimit.maxSpeed) / defaultLimit.maxSpeed) * 100;
            await recordSpeedViolation({
              zelloUsername: loc.username,
              displayName: loc.displayName || loc.username,
              speed: String(loc.speed),
              speedLimit: defaultLimit.maxSpeed,
              excessPercent: String(Math.round(excessPercent * 100) / 100),
              latitude: loc.latitude ? String(loc.latitude) : null,
              longitude: loc.longitude ? String(loc.longitude) : null,
              heading: loc.heading ? String(loc.heading) : null,
              notificationSent: 1,
              occurredAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            });
            violationCount++;
            // Send notification
            await notifyOwner({
              title: "\u26a0\ufe0f Excesso de Velocidade",
              content: `${loc.displayName || loc.username} a ${loc.speed.toFixed(1)} km/h (limite: ${defaultLimit.maxSpeed} km/h, +${excessPercent.toFixed(0)}%) - Lat: ${loc.latitude}, Lon: ${loc.longitude}`,
            });
          }
        }

        return { checked: locations.length, violations: violationCount, threshold };
      }),
    }),

    // ─── DAILY DRIVER HISTORY ──────────────────────────────────────────
    driverHistory: router({
      byDate: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ input }) => {
        return getDailyDriverHistoryByDate(input.date);
      }),
      byUser: protectedProcedure.input(z.object({ username: z.string(), limit: z.number().optional() })).query(async ({ input }) => {
        return getDailyDriverHistoryByUser(input.username, input.limit);
      }),
      range: protectedProcedure.input(z.object({ startDate: z.string(), endDate: z.string() })).query(async ({ input }) => {
        return getDailyDriverHistoryRange(input.startDate, input.endDate);
      }),
      stats: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ input }) => {
        return getDailyDriverStats(input.date);
      }),
      /** Manually trigger data collection for a specific date */
      collectDay: protectedProcedure.input(z.object({ date: z.string() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const targetDate = new Date(input.date);
        targetDate.setHours(0, 0, 0, 0);
        const result = await collectDailyDriverData(targetDate);
        await logActivity({ userId: ctx.user.id, action: "create", entity: "daily_driver_history", entityId: 0, details: `Recolha manual para ${input.date}: ${result.driversProcessed} motoristas` });
        return result;
      }),
    }),

    // ─── PDAs (DISPOSITIVOS) ──────────────────────────────────────────
    pdas: router({
      list: protectedProcedure.query(async () => {
        return listPdas();
      }),
      get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        return getPdaById(input.id);
      }),
      create: protectedProcedure.input(z.object({
        name: z.string().min(1),
        phoneNumber: z.string().optional(),
        imei: z.string().optional(),
        model: z.string().optional(),
        status: z.enum(["active", "inactive", "maintenance", "lost"]).optional(),
        photoUrl: z.string().optional(),
        simDataPlan: z.string().optional(),
        notes: z.string().optional(),
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        const id = await createPda({
          name: input.name,
          phoneNumber: input.phoneNumber ?? null,
          imei: input.imei ?? null,
          model: input.model ?? null,
          status: input.status ?? "active",
          photoUrl: input.photoUrl ?? null,
          simDataPlan: input.simDataPlan ?? null,
          notes: input.notes ?? null,
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "pda", entityId: id, details: `PDA ${input.name}` });
        return { id };
      }),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          phoneNumber: z.string().nullable().optional(),
          imei: z.string().nullable().optional(),
          model: z.string().nullable().optional(),
          status: z.enum(["active", "inactive", "maintenance", "lost"]).optional(),
          photoUrl: z.string().nullable().optional(),
          simDataPlan: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        }),
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        await updatePda(input.id, input.data);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "pda", entityId: input.id, details: "PDA atualizado" });
        return { success: true };
      }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deletePda(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "pda", entityId: input.id, details: "PDA eliminado" });
        return { success: true };
      }),
      // Check-ins
      checkins: router({
        active: protectedProcedure.query(async () => {
          return getActiveCheckins();
        }),
        byDate: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ input }) => {
          return getCheckinsByDate(input.date);
        }),
        byPda: protectedProcedure.input(z.object({ pdaId: z.number(), limit: z.number().optional() })).query(async ({ input }) => {
          return getCheckinsByPda(input.pdaId, input.limit);
        }),
        checkin: protectedProcedure.input(z.object({
          pdaId: z.number(),
          employeeId: z.number().optional(),
          zelloUsername: z.string().optional(),
          photoEntryUrl: z.string().optional(),
          mobileDataMbStart: z.number().optional(),
          notes: z.string().optional(),
        })).mutation(async ({ ctx, input }) => {
          const id = await createPdaCheckin({
            pdaId: input.pdaId,
            employeeId: input.employeeId ?? null,
            zelloUsername: input.zelloUsername ?? null,
            teamLeaderId: ctx.user.id,
            photoEntryUrl: input.photoEntryUrl ?? null,
            mobileDataMbStart: input.mobileDataMbStart ?? null,
            notes: input.notes ?? null,
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "pda_checkin", entityId: id, details: `Check-in PDA #${input.pdaId}` });
          return { id };
        }),
        checkout: protectedProcedure.input(z.object({
          id: z.number(),
          photoExitUrl: z.string().optional(),
          mobileDataMbEnd: z.number().optional(),
          notes: z.string().optional(),
        })).mutation(async ({ ctx, input }) => {
          await checkoutPda(input.id, {
            photoExitUrl: input.photoExitUrl,
            mobileDataMbEnd: input.mobileDataMbEnd,
            notes: input.notes,
          });
          await logActivity({ userId: ctx.user.id, action: "update", entity: "pda_checkin", entityId: input.id, details: "Check-out PDA" });
          return { success: true };
        }),
      }),
    }),

    // ─── GPS ALERTS ──────────────────────────────────────────────────────
    gpsAlerts: router({
      list: protectedProcedure.input(z.object({
        limit: z.number().optional(),
        unacknowledgedOnly: z.boolean().optional(),
      }).optional()).query(async ({ input }) => {
        return getGpsAlerts(input ?? {});
      }),
      stats: protectedProcedure.query(async () => {
        return getGpsAlertStats();
      }),
      acknowledge: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        await acknowledgeGpsAlert(input.id, ctx.user.id);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "gps_alert", entityId: input.id, details: "Alerta GPS reconhecido" });
        return { success: true };
      }),
      /** Check all users and create alerts for disabled GPS/Zello */
      checkNow: protectedProcedure.mutation(async ({ ctx }) => {
        requireRole(ctx.user.role, "team_leader");
        const users = await getZelloUsers();
        let alertsCreated = 0;
        for (const user of users) {
          if (user.admin) continue; // skip admins
          if (user.geotrackingOff) {
            await createGpsAlert({
              zelloUsername: user.name,
              displayName: user.fullName || user.name,
              alertType: "gps_off",
              message: `${user.fullName || user.name} tem o GPS desligado no Zello`,
              notificationSent: 1,
              occurredAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            });
            alertsCreated++;
            await notifyOwner({
              title: "\u26a0\ufe0f GPS Desligado",
              content: `${user.fullName || user.name} (${user.name}) tem o GPS desligado no Zello`,
            });
          }
        }
        // Also check for users with very low battery
        try {
          const locations = await getZelloLocations();
          for (const loc of locations) {
            if (loc.batteryLevel > 0 && loc.batteryLevel < 15) {
              await createGpsAlert({
                zelloUsername: loc.username,
                displayName: loc.displayName || loc.username,
                alertType: "battery_low",
                message: `${loc.displayName || loc.username} com bateria a ${loc.batteryLevel}%`,
                latitude: String(loc.latitude),
                longitude: String(loc.longitude),
                batteryLevel: loc.batteryLevel,
                notificationSent: 1,
                occurredAt: new Date().toISOString().slice(0, 19).replace("T", " "),
              });
              alertsCreated++;
            }
          }
        } catch (e) {
          // Locations may fail if no users are online
        }
        return { success: true, alertsCreated };
      }),
    }),
  }),

  // ─── API KEYS MANAGEMENT ──────────────────────────────────────────────────
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      return getApiKeys();
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      permissions: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const { nanoid } = await import("nanoid");
      const key = `mp_${nanoid(32)}`;
      const id = await createApiKey({
        name: input.name,
        apiKey: key,
        permissions: input.permissions ? JSON.stringify(input.permissions) : null,
        active: 1,
        createdById: ctx.user.id,
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "api_key", entityId: id, details: `API Key: ${input.name}` });
      return { id, key };
    }),
    toggle: protectedProcedure.input(z.object({
      id: z.number(),
      active: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await toggleApiKey(input.id, input.active);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "api_key", entityId: input.id, details: input.active ? "Ativada" : "Desativada" });
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteApiKey(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "api_key", entityId: input.id, details: "API Key eliminada" });
      return { success: true };
    }),
  }),

  // ─── RECLAMAÇÕES ────────────────────────────────────────────────────────────
  complaints: router({
    searchBooking: protectedProcedure
      .input(z.object({ search: z.string().min(2) }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return searchBookingByRef(input.search);
      }),
    fetchBookingDetails: protectedProcedure
      .input(z.object({ externalId: z.string() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getBooking } = await import("./multipark");
        try {
          return await getBooking(input.externalId);
        } catch {
          return null;
        }
      }),
    list: protectedProcedure.input(z.object({
      status: z.string().optional(),
      type: z.string().optional(),
      vehicleId: z.number().optional(),
      assignedToId: z.number().optional(),
      projectId: z.number().optional(),
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getComplaints(input ?? {});
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const complaint = await getComplaintById(input.id);
      if (!complaint) throw new TRPCError({ code: "NOT_FOUND" });
      const messages = await getComplaintMessages(input.id);
      const photos = await getComplaintPhotos(input.id);
      return { complaint, messages, photos };
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["damage", "dirt", "delay", "overcharge", "staff", "other"]),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z.string().optional(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      reservationRef: z.string().optional(),
      reservationStart: z.string().optional(),
      reservationEnd: z.string().optional(),
      vehicleId: z.number().optional(),
      vehiclePlate: z.string().optional(),
      driversInvolved: z.string().optional(),
      slaHours: z.number().optional(),
      projectId: z.number().optional(),
      assignedToId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const slaDeadline = input.slaHours ? new Date(Date.now() + input.slaHours * 3600000).toISOString().slice(0, 19).replace("T", " ") : null;
      const id = await createComplaint({
        title: input.title,
        description: input.description ?? null,
        complaintType: input.type,
        complaintPriority: input.priority ?? "medium",
        complaintStatus: "new",
        clientName: input.clientName ?? null,
        clientEmail: input.clientEmail ?? null,
        clientPhone: input.clientPhone ?? null,
        reservationRef: input.reservationRef ?? null,
        reservationStart: input.reservationStart ? new Date(input.reservationStart).toISOString().slice(0, 19).replace("T", " ") : null,
        reservationEnd: input.reservationEnd ? new Date(input.reservationEnd).toISOString().slice(0, 19).replace("T", " ") : null,
        vehicleId: input.vehicleId ?? null,
        vehiclePlate: input.vehiclePlate ?? null,
        driversInvolved: input.driversInvolved ?? null,
        slaDeadline,
        projectId: input.projectId ?? null,
        assignedToId: input.assignedToId ?? null,
        createdById: ctx.user.id,
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "complaint", entityId: id, details: `Reclamação: ${input.title}` });
      // Notifica admins/supervisores/TL via app
      try {
        const { notifyComplaintCreated } = await import("./complaintsExtended");
        await notifyComplaintCreated(id);
      } catch (err) {
        console.warn("[complaint create] notify failed:", err);
      }
      return { id };
    }),

    // ── Drivers em serviço (cruza com extras-dia + history) ────────────────
    findDriversOnDuty: protectedProcedure
      .input(z.object({ complaintId: z.number() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { findDriversOnDuty } = await import("./complaintsExtended");
        return findDriversOnDuty(input.complaintId);
      }),
    attachDriver: protectedProcedure
      .input(z.object({
        complaintId: z.number(),
        employeeId: z.number().nullable().optional(),
        employeeName: z.string().min(1).max(256),
        roleAtTime: z.string().max(64).nullable().optional(),
        source: z.enum(["assignment", "history", "manual"]),
        notes: z.string().max(512).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { attachDriverToComplaint } = await import("./complaintsExtended");
        await attachDriverToComplaint(input);
        return { success: true };
      }),
    listAttachedDrivers: protectedProcedure
      .input(z.object({ complaintId: z.number() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { listComplaintDrivers } = await import("./complaintsExtended");
        return listComplaintDrivers(input.complaintId);
      }),
    detachDriver: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { detachComplaintDriver } = await import("./complaintsExtended");
        await detachComplaintDriver(input.id);
        return { success: true };
      }),

    // ── Penalty config ──────────────────────────────────────────────────────
    listPenaltyConfig: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { listPenaltyConfig } = await import("./complaintsExtended");
      return listPenaltyConfig();
    }),
    updatePenaltyConfig: protectedProcedure
      .input(z.object({ complaintType: z.string().max(32), basePoints: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { updatePenaltyConfig } = await import("./complaintsExtended");
        await updatePenaltyConfig(input.complaintType, input.basePoints);
        return { success: true };
      }),

    // ── Email ao cliente ───────────────────────────────────────────────────
    sendEmailToClient: protectedProcedure
      .input(z.object({
        complaintId: z.number(),
        subject: z.string().min(1).max(255),
        body: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Envia email em nome da empresa — só frontoffice+ pode disparar
        requireRole(ctx.user.role, "frontoffice");
        const { sendComplaintEmailToClient } = await import("./complaintsExtended");
        const r = await sendComplaintEmailToClient(input);
        if (r.ok) {
          await logActivity({
            userId: ctx.user.id, action: "email_sent", entity: "complaint",
            entityId: input.complaintId, details: `Email para cliente: ${input.subject}`,
          });
        }
        return r;
      }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["damage", "dirt", "delay", "overcharge", "staff", "other"]).optional(),
      status: z.enum(["new", "analyzing", "waiting_client", "resolved", "closed"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z.string().optional(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      assignedToId: z.number().nullable().optional(),
      driversInvolved: z.string().optional(),
      slaHours: z.number().optional(),
      penaltyPoints: z.number().int().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, slaHours, type, status, priority, penaltyPoints, ...rest } = input;
      const updateData: any = { ...rest };
      // Map to actual DB column names
      if (type) updateData.complaintType = type;
      if (status) updateData.complaintStatus = status;
      if (priority) updateData.complaintPriority = priority;
      if (penaltyPoints !== undefined) updateData.penaltyPoints = penaltyPoints;
      // slaHours: 0 limpa o prazo, > 0 redefine. Antes 0 era ignorado.
      if (slaHours !== undefined) {
        updateData.slaDeadline = slaHours > 0
          ? new Date(Date.now() + slaHours * 3600000)
          : null;
      }
      if (status === "resolved") updateData.resolvedAt = new Date();
      await updateComplaint(id, updateData);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "complaint", entityId: id, details: `Reclamação atualizada` });
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deleteComplaint(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "complaint", entityId: input.id, details: "Reclamação eliminada" });
      return { success: true };
    }),
    addMessage: protectedProcedure.input(z.object({
      complaintId: z.number(),
      message: z.string().min(1),
      isInternal: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const id = await addComplaintMessage({
        complaintId: input.complaintId,
        message: input.message,
        isInternal: input.isInternal ? 1 : 0,
        authorId: ctx.user.id,
        authorName: ctx.user.name ?? "Desconhecido",
      });
      return { id };
    }),
    uploadPhoto: protectedProcedure.input(z.object({
      complaintId: z.number(),
      base64: z.string(),
      filename: z.string(),
      label: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.filename.split(".").pop() || "jpg";
      const key = `complaints/${input.complaintId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, `image/${ext}`);
      const id = await addComplaintPhoto({
        complaintId: input.complaintId,
        url,
        fileKey: key,
        label: input.label ?? null,
        uploadedById: ctx.user.id,
      });
      return { id, url };
    }),
    deletePhoto: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await deleteComplaintPhoto(input.id);
      return { success: true };
    }),
    stats: protectedProcedure.input(z.object({ projectId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getComplaintStats(input?.projectId);
    }),
    // Get vehicle driver history for a complaint
    vehicleHistory: protectedProcedure.input(z.object({ vehicleId: z.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getVehicleDriverHistory(input.vehicleId);
    }),
    // Booking timeline from Multipark API
    bookingTimeline: protectedProcedure.input(z.object({
      bookingId: z.string(),
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingHistory(input.bookingId);
    }),
  }),

  // ─── IN-APP NOTIFICATIONS ─────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional(), limit: z.number().int().min(1).max(200).optional() }).optional())
      .query(async ({ ctx, input }) => {
        const { listNotifications } = await import("./complaintsExtended");
        return listNotifications(ctx.user.id, input?.unreadOnly ?? false, input?.limit ?? 50);
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const { unreadCount } = await import("./complaintsExtended");
      return { count: await unreadCount(ctx.user.id) };
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { markNotificationRead } = await import("./complaintsExtended");
        await markNotificationRead(ctx.user.id, input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const { markAllNotificationsRead } = await import("./complaintsExtended");
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── GOOGLE REVIEWS ───────────────────────────────────────────────────────
  reviews: router({
    list: protectedProcedure.input(z.object({
      rating: z.number().optional(),
      status: z.string().optional(),
      projectId: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return getGoogleReviews(input ?? undefined);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getGoogleReviewById(input.id);
    }),
    stats: protectedProcedure.query(async () => {
      return getGoogleReviewStats();
    }),
    create: protectedProcedure.input(z.object({
      reviewerName: z.string().min(1),
      reviewerEmail: z.string().optional(),
      rating: z.number().min(1).max(5),
      reviewText: z.string().optional(),
      reviewDate: z.string().optional(),
      projectId: z.number().optional(),
      vehiclePlate: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      // create dispara OpenAI (resposta IA) e/ou cria reclamação automaticamente.
      // Custo real + acções com efeito — restringir a frontoffice+.
      requireRole(ctx.user.role, "frontoffice");
      const reviewDate = (input.reviewDate ? new Date(input.reviewDate) : new Date()).toISOString().slice(0, 19).replace("T", " ");
      const id = await createGoogleReview({
        ...input,
        reviewDate,
        createdById: ctx.user.id,
      });

      // Auto-process: if rating >= 4, generate AI response
      if (input.rating >= 4 && id) {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `És o gestor de atendimento ao cliente de um parque de estacionamento premium. Responde a avaliações positivas do Google de forma natural, calorosa e profissional em português. Não uses linguagem demasiado formal nem genérica. Personaliza a resposta com base no texto da avaliação. Máximo 3 frases.`
              },
              {
                role: "user",
                content: `Avaliação de ${input.rating} estrelas de ${input.reviewerName}: "${input.reviewText || 'Sem texto'}". Gera uma resposta de agradecimento.`
              }
            ],
          });
          const aiText = typeof response.choices[0].message.content === "string" ? response.choices[0].message.content : "";
          if (aiText) {
            await updateGoogleReview(id, { aiResponse: aiText, status: "ai_responded" });
          }
        } catch (e) {
          console.error("[Reviews] AI response failed:", e);
        }
      }

      // If rating <= 3, auto-convert to complaint
      if (input.rating <= 3 && id) {
        try {
          const complaintId = await createComplaint({
            title: `Crítica Google ${input.rating}\u2605 — ${input.reviewerName}`,
            description: `Avaliação negativa no Google (${input.rating} estrelas):\n\n"${input.reviewText || 'Sem texto'}"\n\nCliente: ${input.reviewerName}${input.reviewerEmail ? '\nEmail: ' + input.reviewerEmail : ''}${input.vehiclePlate ? '\nMatrícula: ' + input.vehiclePlate : ''}`,
            complaintType: "other",
            complaintPriority: input.rating === 1 ? "urgent" : "high",
            clientName: input.reviewerName,
            clientEmail: input.reviewerEmail || undefined,
            vehiclePlate: input.vehiclePlate || undefined,
            projectId: input.projectId || undefined,
            slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " "), // 24h SLA
            createdById: ctx.user.id,
          });
          await updateGoogleReview(id, { complaintId, status: "converted_complaint" });
          await logActivity({ userId: ctx.user.id, action: "review_to_complaint", entity: "google_review", entityId: id, details: `Review ${input.rating}\u2605 convertida em reclamação #${complaintId}` });
        } catch (e) {
          console.error("[Reviews] Complaint conversion failed:", e);
        }
      }

      await logActivity({ userId: ctx.user.id, action: "create", entity: "google_review", entityId: id ?? 0, details: `Review ${input.rating}\u2605 de ${input.reviewerName}` });
      return { id };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      aiResponse: z.string().optional(),
      status: z.enum(["pending_response", "ai_responded", "manually_responded", "converted_complaint", "dismissed"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      if (data.status === "manually_responded" || data.aiResponse) {
        (data as any).respondedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
        (data as any).respondedBy = ctx.user.id;
      }
      await updateGoogleReview(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "google_review", entityId: id, details: `Review atualizada` });
      return { success: true };
    }),
    generateResponse: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ ctx, input }) => {
      // Chama OpenAI por review — restringir a frontoffice+
      requireRole(ctx.user.role, "frontoffice");
      const review = await getGoogleReviewById(input.id);
      if (!review) throw new TRPCError({ code: "NOT_FOUND" });
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `És o gestor de atendimento ao cliente de um parque de estacionamento premium. Responde a avaliações do Google de forma natural, empática e profissional em português. Se a avaliação for positiva (4-5 estrelas), agradece calorosamente. Se for negativa (1-3 estrelas), pede desculpa, mostra empatia e oferece resolução. Personaliza com base no texto. Máximo 4 frases.`
          },
          {
            role: "user",
            content: `Avaliação de ${review.rating} estrelas de ${review.reviewerName}: "${review.reviewText || 'Sem texto'}". Gera uma resposta.`
          }
        ],
      });
      const aiText = typeof response.choices[0].message.content === "string" ? response.choices[0].message.content : "";
      await updateGoogleReview(input.id, { aiResponse: aiText, status: "ai_responded" });
      return { response: aiText };
    }),
    searchClient: protectedProcedure.input(z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      plate: z.string().optional(),
    })).query(async ({ ctx, input }) => {
      // PII de clientes — restringir
      requireRole(ctx.user.role, "frontoffice");
      return searchClientHistory(input.name, input.email, input.plate);
    }),
    approveResponse: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await updateGoogleReview(input.id, { aiResponseApproved: 1, respondedAt: new Date().toISOString().slice(0, 19).replace("T", " "), respondedBy: ctx.user.id, status: "manually_responded" });
      await logActivity({ userId: ctx.user.id, action: "approve", entity: "google_review", entityId: input.id, details: "Resposta aprovada" });
      return { success: true };
    }),
    syncFromGmail: protectedProcedure.mutation(async ({ ctx }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      // Gmail sync is handled externally via scheduled task (2x/day)
      // This endpoint just returns info about the sync status
      return {
        reviewsImported: 0,
        reviewsSkipped: 0,
        incidentsImported: 0,
        incidentsSkipped: 0,
        message: "A sincroniza\u00e7\u00e3o Gmail corre automaticamente 2x/dia (0h e 12h). Para for\u00e7ar manualmente, contacta o administrador.",
      };
    }),
    // Checkout drivers ranking (DB local — alimentada pelo sync da API Multipark)
    checkoutDrivers: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    })).query(async ({ input }) => {
      const { getCheckoutDriversFromDb } = await import("./db");
      return getCheckoutDriversFromDb(input.startDate, input.endDate);
    }),

    // Agent performance history (DB local — alimentada pelo sync da API Multipark)
    agentHistory: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      agentName: z.string().optional(),
      userId: z.string().optional(),
    })).query(async ({ input }) => {
      const { getAgentHistoryFromDb } = await import("./db");
      return getAgentHistoryFromDb({
        startDate: input.startDate,
        endDate: input.endDate,
        agentName: input.agentName,
        userId: input.userId,
      });
    }),
  }),

  // ─── FORMAÇÃO E APOIO ──────────────────────────────────────────────────────
  training: router({
    // Categories
    categories: protectedProcedure.query(async () => {
      return getTrainingCategories();
    }),
    createCategory: protectedProcedure.input(z.object({ name: z.string(), description: z.string().optional(), icon: z.string().optional(), sortOrder: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createTrainingCategory(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_category", entityId: result.id, details: input.name });
      return result;
    }),
    deleteCategory: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["super_admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteTrainingCategory(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_category", entityId: input.id, details: "" });
      return { success: true };
    }),

    // Videos
    videos: protectedProcedure.input(z.object({ categoryId: z.number().optional() })).query(async ({ input }) => {
      return getTrainingVideos(input.categoryId);
    }),
    createVideo: protectedProcedure.input(z.object({ categoryId: z.number(), title: z.string(), description: z.string().optional(), videoUrl: z.string(), thumbnailUrl: z.string().optional(), durationMinutes: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createTrainingVideo({ ...input, createdBy: ctx.user.id });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_video", entityId: result.id, details: input.title });
      return result;
    }),
    deleteVideo: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteTrainingVideo(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_video", entityId: input.id, details: "" });
      return { success: true };
    }),

    // Manuals / Blog
    manuals: protectedProcedure.input(z.object({ categoryId: z.number().optional(), type: z.string().optional() })).query(async ({ input }) => {
      return getTrainingManuals(input.categoryId, input.type);
    }),
    createManual: protectedProcedure.input(z.object({ categoryId: z.number().optional(), title: z.string(), content: z.string(), type: z.enum(["manual", "update", "news", "procedure"]).optional(), fileUrl: z.string().optional(), fileKey: z.string().optional(), fileName: z.string().optional(), fileMimeType: z.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createTrainingManual({ ...input, createdBy: ctx.user.id });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_manual", entityId: result.id, details: input.title });
      return result;
    }),
    uploadManualFile: protectedProcedure.input(z.object({ fileName: z.string(), fileBase64: z.string(), mimeType: z.string() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `training/manuals/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key, fileName: input.fileName, mimeType: input.mimeType };
    }),
    updateManual: protectedProcedure.input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), type: z.enum(["manual", "update", "news", "procedure"]).optional(), published: z.boolean().optional(), fileUrl: z.string().optional(), fileKey: z.string().optional(), fileName: z.string().optional(), fileMimeType: z.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      await updateTrainingManual(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "training_manual", entityId: id, details: data.title || "" });
      return { success: true };
    }),
    deleteManual: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteTrainingManual(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_manual", entityId: input.id, details: "" });
      return { success: true };
    }),

    // FAQs
    faqs: protectedProcedure.input(z.object({ categoryId: z.number().optional() })).query(async ({ input }) => {
      return getFAQs(input.categoryId);
    }),
    createFAQ: protectedProcedure.input(z.object({ categoryId: z.number().optional(), question: z.string(), answer: z.string(), sortOrder: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createFAQ(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "faq", entityId: result.id, details: input.question });
      return result;
    }),
    updateFAQ: protectedProcedure.input(z.object({ id: z.number(), question: z.string().optional(), answer: z.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      await updateFAQ(id, data);
      return { success: true };
    }),
    deleteFAQ: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteFAQ(input.id);
      return { success: true };
    }),

    // Quiz
    // ADMIN: tem acesso à correctOption (para edição)
    quizQuestions: protectedProcedure.input(z.object({ categoryId: z.number().optional() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Usa quizQuestionsForPlayer" });
      }
      return getQuizQuestions(input.categoryId);
    }),
    // PLAYER: sem correctOption (qualquer user pode jogar)
    quizQuestionsForPlayer: protectedProcedure.input(z.object({ categoryId: z.number().optional() })).query(async ({ input }) => {
      return getQuizQuestionsForPlayer(input.categoryId);
    }),
    createQuizQuestion: protectedProcedure.input(z.object({ categoryId: z.number().optional(), question: z.string(), optionA: z.string(), optionB: z.string(), optionC: z.string(), optionD: z.string(), correctOption: z.enum(["A", "B", "C", "D"]), explanation: z.string().optional(), difficulty: z.enum(["easy", "medium", "hard"]).optional(), points: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createQuizQuestion(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "quiz_question", entityId: result.id, details: input.question });
      return result;
    }),
    deleteQuizQuestion: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteQuizQuestion(input.id);
      return { success: true };
    }),
    submitQuiz: protectedProcedure.input(z.object({ answers: z.array(z.object({ questionId: z.number(), answer: z.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z.number().optional() })).mutation(async ({ ctx, input }) => {
      // employeeId derivado de ctx.user.id (não confiável o do cliente)
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) throw new TRPCError({ code: "NOT_FOUND", message: "Sem ficha de colaborador. Pede ao admin para te cadastrar primeiro." });
      const questions = await getQuizQuestions();
      const questionMap = new Map(questions.map(q => [q.id, q]));
      let correct = 0;
      let score = 0;
      for (const a of input.answers) {
        const q = questionMap.get(a.questionId);
        if (q && q.correctOption === a.answer) { correct++; score += q.points; }
      }
      const result = await saveQuizAttempt({ employeeId: me.employee.id, totalQuestions: input.answers.length, correctAnswers: correct, score, timeSpentSeconds: input.timeSpentSeconds });
      return { ...result, correct, score, total: input.answers.length };
    }),
    quizRanking: protectedProcedure.query(async () => {
      return getQuizRanking();
    }),

    // Career Exams
    careerExams: protectedProcedure.query(async () => {
      return getCareerExams();
    }),
    createCareerExam: protectedProcedure.input(z.object({ level: z.enum(["extra", "condutor", "senior", "team_leader", "supervisor"]), title: z.string(), description: z.string().optional(), passingScore: z.number(), timeLimitMinutes: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createCareerExam(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "career_exam", entityId: result.id, details: input.title });
      return result;
    }),
    deleteCareerExam: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["super_admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      await deleteCareerExam(input.id);
      return { success: true };
    }),
    careerExamQuestions: protectedProcedure.input(z.object({ examId: z.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Usa careerExamQuestionsForPlayer" });
      }
      return getCareerExamQuestions(input.examId);
    }),
    careerExamQuestionsForPlayer: protectedProcedure.input(z.object({ examId: z.number() })).query(async ({ input }) => {
      return getCareerExamQuestionsForPlayer(input.examId);
    }),
    createCareerExamQuestion: protectedProcedure.input(z.object({ examId: z.number(), question: z.string(), optionA: z.string(), optionB: z.string(), optionC: z.string(), optionD: z.string(), correctOption: z.enum(["A", "B", "C", "D"]), explanation: z.string().optional(), points: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError({ code: "FORBIDDEN" });
      const result = await createCareerExamQuestion(input);
      return result;
    }),
    submitCareerExam: protectedProcedure.input(z.object({ examId: z.number(), answers: z.array(z.object({ questionId: z.number(), answer: z.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z.number().optional() })).mutation(async ({ ctx, input }) => {
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) throw new TRPCError({ code: "NOT_FOUND", message: "Sem ficha de colaborador" });
      const questions = await getCareerExamQuestions(input.examId);
      const exams = await getCareerExams();
      const exam = exams.find(e => e.id === input.examId);
      if (!exam) throw new TRPCError({ code: "NOT_FOUND", message: "Exame n\u00e3o encontrado" });
      const questionMap = new Map(questions.map(q => [q.id, q]));
      let correct = 0;
      let score = 0;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      for (const a of input.answers) {
        const q = questionMap.get(a.questionId);
        if (q && q.correctOption === a.answer) { correct++; score += q.points; }
      }
      const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const passed = percentage >= exam.passingScore;
      const result = await saveCareerExamAttempt({ examId: input.examId, employeeId: me.employee.id, totalQuestions: questions.length, correctAnswers: correct, score: percentage, passed, timeSpentSeconds: input.timeSpentSeconds });
      if (passed) {
        await notifyOwner({ title: `Exame aprovado: ${exam.title}`, content: `${me.employee.fullName} passou no exame "${exam.title}" com ${percentage}% (m\u00ednimo: ${exam.passingScore}%)` });
      }
      return { ...result, correct, score: percentage, total: questions.length, passed, passingScore: exam.passingScore };
    }),

    myCareerExamAttempts: protectedProcedure.query(async ({ ctx }) => {
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) return [];
      return getCareerExamAttempts(me.employee.id);
    }),
    careerExamAttempts: protectedProcedure.input(z.object({ employeeId: z.number().optional(), examId: z.number().optional() })).query(async ({ input }) => {
      return getCareerExamAttempts(input.employeeId, input.examId);
    }),
  }),

  // ─── PERDIDOS E ACHADOS ────────────────────────────────────────────────────
  lostFound: router({
    list: protectedProcedure.input(z.object({
      status: z.string().optional(),
      itemType: z.string().optional(),
      projectId: z.number().optional(),
      search: z.string().optional(),
    }).optional()).query(({ input }) => getLostFoundItems(input)),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getLostFoundItemById(input.id)),

    create: protectedProcedure.input(z.object({
      projectId: z.number().optional(),
      vehiclePlate: z.string().optional(),
      clientName: z.string().min(1),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      bookingRef: z.string().optional(),
      itemType: z.enum(["money", "electronics", "clothing", "documents", "accessories", "other"]),
      description: z.string().min(1),
      estimatedValue: z.number().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const id = await createLostFoundItem({ ...input, createdBy: ctx.user.id, status: "new", priority: input.priority || "medium" } as any);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "lost_found", entityId: id || 0, details: `Perdido/Achado: ${input.description}` });
      // Notify super admin
      const admins = await getSuperAdmins();
      if (admins.length > 0) {
        await notifyOwner({ title: "Novo Perdido/Achado", content: `${input.clientName}: ${input.description} (Viatura: ${input.vehiclePlate || "N/A"})` });
      }
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
      resolution: z.string().optional(),
      clientName: z.string().optional(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      bookingRef: z.string().optional(),
      vehiclePlate: z.string().optional(),
      itemType: z.string().optional(),
      description: z.string().optional(),
      estimatedValue: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      await updateLostFoundItem(id, data as any);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "lost_found", entityId: id, details: `Atualizado: ${JSON.stringify(data)}` });
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const role = ctx.user.role || "user";
      if (role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
      await deleteLostFoundItem(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "lost_found", entityId: input.id, details: "Eliminado" });
      return { success: true };
    }),

    // Photos
    getPhotos: protectedProcedure.input(z.object({ itemId: z.number() })).query(({ input }) => getLostFoundPhotos(input.itemId)),

    uploadPhoto: protectedProcedure.input(z.object({
      itemId: z.number(),
      base64: z.string(),
      filename: z.string(),
      caption: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.filename.split(".").pop() || "jpg";
      const key = `lost-found/${input.itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, `image/${ext}`);
      await addLostFoundPhoto({ itemId: input.itemId, url, fileKey: key, caption: input.caption || null });
      return { url };
    }),

    // Messages
    getMessages: protectedProcedure.input(z.object({ itemId: z.number() })).query(({ input }) => getLostFoundMessages(input.itemId)),

    addMessage: protectedProcedure.input(z.object({
      itemId: z.number(),
      message: z.string().min(1),
      isInternal: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await addLostFoundMessage({ itemId: input.itemId, userId: ctx.user.id, userName: ctx.user.name || "Utilizador", message: input.message, isInternal: input.isInternal === false ? 0 : 1 });
      return { success: true };
    }),

    // Driver ranking (cruzamento de dados)
    driverRanking: protectedProcedure.query(() => getLostFoundDriverRanking()),

    // Agentes Multipark que mexeram na matrícula. Sinaliza os que tocaram
    // especificamente na reserva do caso aberto (currentBookingRef).
    vehicleAgents: protectedProcedure
      .input(z.object({ plate: z.string(), currentBookingRef: z.string().optional() }))
      .query(async ({ input }) => {
        const { getVehicleAgentsByPlate } = await import("./db");
        return getVehicleAgentsByPlate(input.plate, input.currentBookingRef);
      }),

    // ── Booking History (Multipark DB local, sincronizado pelo cron job) ──
    bookingHistory: protectedProcedure
      .input(z.object({ bookingId: z.string().optional(), plate: z.string().optional(), search: z.string().optional() }))
      .query(async ({ input }) => {
        if (input.bookingId) return getBookingHistoryByBookingId(input.bookingId);
        if (input.plate) return getBookingHistoryByPlate(input.plate);
        if (input.search) return searchBookingHistory(input.search);
        return [];
      }),

    bookingHistoryDriverStats: protectedProcedure.query(() => getBookingHistoryDriverStats()),

    bookingHistoryCrossRef: protectedProcedure.query(() => getBookingHistoryCrossReference()),
    // Booking timeline directo da API Multipark (para o caso aberto)
    bookingTimeline: protectedProcedure.input(z.object({
      bookingId: z.string(),
    })).query(async ({ input }) => {
      return getBookingHistory(input.bookingId);
    }),
  }),

  // ─── OCORRÊNCIAS (INCIDENTS) ──────────────────────────────────────────────
  incidents: router({
    list: protectedProcedure.input(z.object({
      status: z.string().optional(),
      severity: z.string().optional(),
      employeeId: z.number().optional(),
      weekNumber: z.number().optional(),
      yearNumber: z.number().optional(),
    }).optional()).query(({ input }) => getIncidents(input)),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getIncidentById(input.id)),

    create: protectedProcedure.input(z.object({
      projectId: z.number().optional(),
      vehiclePlate: z.string().optional(),
      employeeId: z.number().optional(),
      incidentType: z.enum(["vidro_aberto", "mal_estacionado", "dano", "chave_errada", "combustivel", "limpeza", "documentos", "outro"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      // Ocorrências afectam a avaliação dos condutores (pontos negativos) e o
      // sistema RH de penalizações — só frontoffice+ pode criar.
      requireRole(ctx.user.role, "frontoffice");
      const id = await createIncident({ ...input, reportedBy: ctx.user.id, status: "open" });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "incident", entityId: id || 0, details: `Ocorrência: ${input.description}` });
      if (input.severity === "critical") {
        await notifyOwner({ title: "Ocorrência Crítica", content: `${input.incidentType}: ${input.description} (Viatura: ${input.vehiclePlate || "N/A"})` });
      }
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string().optional(),
      severity: z.string().optional(),
      resolution: z.string().optional(),
      incidentType: z.string().optional(),
      description: z.string().optional(),
      vehiclePlate: z.string().optional(),
      employeeId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      if (data.status === "resolved") {
        (data as any).resolvedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
        (data as any).resolvedBy = ctx.user.id;
      }
      await updateIncident(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "incident", entityId: id });
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteIncident(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "incident", entityId: input.id });
      return { success: true };
    }),

    stats: protectedProcedure.input(z.object({
      weekNumber: z.number().optional(),
      yearNumber: z.number().optional(),
    }).optional()).query(({ input }) => getIncidentStats(input?.weekNumber, input?.yearNumber)),

    byEmployee: protectedProcedure.input(z.object({ employeeId: z.number() })).query(({ input }) => getIncidentsByEmployee(input.employeeId)),

    // Sincroniza ocorrências a partir do multipark_booking_history (remarks
    // dos agentes nos check-in/out/movements). Dedup por sourceEmailId.
    syncFromMultipark: protectedProcedure
      .input(z.object({ lookbackDays: z.number().int().min(1).max(180).optional() }).optional())
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        requireRole(ctx.user.role, "frontoffice");
        const { syncIncidentsFromMultiparkHistory } = await import("./db");
        const r = await syncIncidentsFromMultiparkHistory({
          lookbackDays: input?.lookbackDays ?? 30,
          reportedById: ctx.user.id,
        });
        await logActivity({
          userId: ctx.user.id, action: "sync", entity: "incident", entityId: 0,
          details: `Multipark sync: ${r.imported} importadas, ${r.skipped} já existiam, ${r.scanned} analisadas`,
        });
        return r;
      }),
  }),

  // ─── AVALIAÇÃO DE DESEMPENHO ─────────────────────────────────────────────
  performance: router({
    list: protectedProcedure.input(z.object({
      weekNumber: z.number().optional(),
      yearNumber: z.number().optional(),
      employeeId: z.number().optional(),
    }).optional()).query(({ input }) => getPerformanceEvaluations(input)),

    generate: protectedProcedure.input(z.object({
      weekNumber: z.number(),
      yearNumber: z.number(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      const results = await generateWeeklyEvaluation(input.weekNumber, input.yearNumber);
      await logActivity({ userId: ctx.user.id, action: "generate", entity: "performance_evaluation", details: `Semana ${input.weekNumber}/${input.yearNumber}: ${results.length} linhas` });
      return results;
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      positivePoints: z.number().optional(),
      negativePoints: z.number().optional(),
      notes: z.string().nullable().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      const { id, ...data } = input;
      // Lê o valor actual para preservar campos não enviados ao calcular totalPoints
      const current = await getPerformanceEvaluations({});
      const row = current.find((r: any) => r.id === id);
      const pos = data.positivePoints ?? row?.positivePoints ?? 0;
      const neg = data.negativePoints ?? row?.negativePoints ?? 0;
      (data as any).totalPoints = pos - neg;
      await updatePerformanceEvaluation(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "performance_evaluation", entityId: id });
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deletePerformanceEvaluation(input.id);
      return { success: true };
    }),
  }),

  // ─── SERVIÇOS ────────────────────────────────────────────────────────────
  services: router({
    list: protectedProcedure.input(z.object({
      serviceType: z.string().optional(),
      employeeId: z.number().optional(),
      projectId: z.number().optional(),
      month: z.number().optional(),
      year: z.number().optional(),
    }).optional()).query(({ input }) => getServices(input)),

    create: protectedProcedure.input(z.object({
      projectId: z.number().optional(),
      employeeId: z.number().optional(),
      serviceType: z.enum(["lavagem", "carregamento_eletrico", "valet_flex", "outro"]),
      clientName: z.string().optional(),
      vehiclePlate: z.string().optional(),
      bookingRef: z.string().optional(),
      revenue: z.number().optional(),
      cost: z.number().optional(),
      commission: z.number().optional(),
      notes: z.string().optional(),
      serviceDate: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const data = { ...input, serviceDate: input.serviceDate ? new Date(input.serviceDate) : new Date() };
      const id = await createService(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "service", entityId: id || 0, details: `Serviço: ${input.serviceType}` });
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      revenue: z.number().optional(),
      cost: z.number().optional(),
      commission: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, ...data } = input;
      await updateService(id, data);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteService(input.id);
      return { success: true };
    }),

    stats: protectedProcedure.input(z.object({
      month: z.number().optional(),
      year: z.number().optional(),
    }).optional()).query(({ input }) => getServiceStats(input?.month, input?.year)),

    // Extra services from Multipark bookings
    multiparkExtras: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    })).query(async ({ input }) => {
      const report = await getBookingsReport(input.startDate, input.endDate, "checkout");
      const services: Array<{
        bookingId: string;
        licensePlate: string;
        parkName: string;
        checkOut: string;
        serviceName: string;
        price: number;
        done: boolean;
      }> = [];
      for (const b of report.bookings || []) {
        const extras: any[] = b.extraServices || [];
        for (const s of extras) {
          services.push({
            bookingId: b.id,
            licensePlate: b.allocation || "",
            parkName: b.park?.name || "",
            checkOut: b.checkOutDate || "",
            serviceName: s.name,
            price: s.price || 0,
            done: s.done ?? true,
          });
        }
      }
      return { total: services.length, services };
    }),
  }),

  // ─── FATURAÇÃO ───────────────────────────────────────────────────────────
  invoices: router({
    list: protectedProcedure.input(z.object({
      status: z.string().optional(),
      projectId: z.number().optional(),
      search: z.string().optional(),
      month: z.number().optional(),
      year: z.number().optional(),
    }).optional()).query(({ input }) => getInvoices(input)),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getInvoiceById(input.id)),

    create: protectedProcedure.input(z.object({
      projectId: z.number().optional(),
      invoiceNumber: z.string().min(1),
      clientName: z.string().optional(),
      clientNif: z.string().optional(),
      issueDate: z.string(),
      dueDate: z.string().optional(),
      totalAmount: z.number(),
      taxAmount: z.number().optional(),
      status: z.enum(["draft", "issued", "paid", "overdue", "cancelled"]).optional(),
      paymentMethod: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data = {
        ...input,
        issueDate: new Date(input.issueDate),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdBy: ctx.user.id,
        status: input.status || "draft",
      };
      const id = await createInvoice(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "invoice", entityId: id || 0, details: `Fatura: ${input.invoiceNumber}` });
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string().optional(),
      totalAmount: z.number().optional(),
      taxAmount: z.number().optional(),
      paymentMethod: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      await updateInvoice(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "invoice", entityId: id });
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteInvoice(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "invoice", entityId: input.id });
      return { success: true };
    }),

    stats: protectedProcedure.input(z.object({
      month: z.number().optional(),
      year: z.number().optional(),
    }).optional()).query(({ input }) => getInvoiceStats(input?.month, input?.year)),

    // Diagnóstico cru: várias somas e breakdowns para isolar discrepâncias
    diagnose: protectedProcedure
      .input(z.object({ from: z.string(), to: z.string(), projectId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { diagnoseBilling } = await import("./db");
        return diagnoseBilling(input);
      }),

    billing: protectedProcedure.input(z.object({
      granularity: z.enum(["day", "week", "month", "year"]).optional(),
      from: z.string(),
      to: z.string(),
      projectId: z.number().optional(),
    })).query(({ input }) => getBillingData(input)),
  }),

  // ─── PARCERIAS ───────────────────────────────────────────────────────────
  partnerships: router({
    analytics: protectedProcedure.input(z.object({
      from: z.string(),
      to: z.string(),
      projectId: z.number().optional(),
    })).query(({ input }) => getPartnershipAnalytics(input)),

    list: protectedProcedure.input(z.object({
      partnerType: z.string().optional(),
      status: z.string().optional(),
    }).optional()).query(({ input }) => getPartnerships(input)),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getPartnershipById(input.id)),

    dashboardStats: protectedProcedure.query(async () => {
      await markOverduePartnershipInvoices();
      return getPartnershipDashboardStats();
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      campaignKey: z.string().optional(),
      partnerType: z.string().min(1).max(64),
      contactName: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      commissionRate: z.number().optional(),
      monthlyFee: z.number().optional(),
      nif: z.string().optional(),
      billingAgreement: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { nif, ...rest } = input;
      const id = await createPartnership({ ...rest, partnerNif: nif });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "partnership", entityId: id || 0, details: `Parceria: ${input.name}` });
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      campaignKey: z.string().optional(),
      partnerType: z.string().min(1).max(64).optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      commissionRate: z.number().optional(),
      monthlyFee: z.number().optional(),
      nif: z.string().optional(),
      billingAgreement: z.string().optional(),
      partnerStatus: z.enum(["active", "inactive", "pending"]).optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, nif, ...rest } = input;
      await updatePartnership(id, { ...rest, ...(nif !== undefined ? { partnerNif: nif } : {}) });
      await logActivity({ userId: ctx.user.id, action: "update", entity: "partnership", entityId: id });
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deletePartnership(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "partnership", entityId: input.id });
      return { success: true };
    }),

    // ── Inferência de parceiros a partir das reservas Multipark ──────────────
    inferList: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return inferPartnersFromBookings();
    }),

    addAlias: protectedProcedure
      .input(z.object({
        partnershipId: z.number(),
        aliasType: z.enum(["multipark_partner_id", "payment_method"]),
        aliasValue: z.string().min(1).max(128),
        applyToBookings: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const updated = await addPartnerAlias(
          input.partnershipId,
          input.aliasType,
          input.aliasValue,
          input.applyToBookings,
        );
        await logActivity({
          userId: ctx.user.id,
          action: "alias_add",
          entity: "partnership",
          entityId: input.partnershipId,
          details: `${input.aliasType}=${input.aliasValue} (${updated} reservas actualizadas)`,
        });
        return { updated };
      }),

    listAliases: protectedProcedure
      .input(z.object({ partnershipId: z.number() }))
      .query(({ input }) => listPartnerAliases(input.partnershipId)),

    // Aliases agregados por parceiro — mostra quantos códigos cada parceiro
    // já tem associados (cada parceiro tem normalmente 1 código por
    // cidade × marca, logo vários).
    aliasCounts: protectedProcedure.query(async () => {
      const { aliasCountsByPartner } = await import("./db");
      return aliasCountsByPartner();
    }),

    // Sumário de faturação por parceiro: a faturar / faturado / pendente / em atraso
    invoicingSummary: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
        partnerType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getPartnerInvoicingSummary } = await import("./db");
        return getPartnerInvoicingSummary(input);
      }),

    // Detalhe por tipo de parceiro — com colunas específicas do chargeModel
    invoicingDetailByType: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
        partnerType: z.string(),
      }))
      .query(async ({ input }) => {
        const { getPartnerInvoicingDetailByType } = await import("./db");
        return getPartnerInvoicingDetailByType(input);
      }),

    deleteAlias: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deletePartnerAlias(input.id);
        return { success: true };
      }),

    // Transactions
    getTransactions: protectedProcedure.input(z.object({ partnershipId: z.number() })).query(({ input }) => getPartnershipTransactions(input.partnershipId)),

    addTransaction: protectedProcedure.input(z.object({
      partnershipId: z.number(),
      projectId: z.number().optional(),
      transactionType: z.enum(["booking", "commission", "payment", "adjustment"]),
      description: z.string().optional(),
      amount: z.number(),
      transactionDate: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data = { ...input, transactionDate: input.transactionDate ? new Date(input.transactionDate) : new Date() };
      const id = await createPartnershipTransaction(data);
      return { id };
    }),

    // Invoices
    listInvoices: protectedProcedure.input(z.object({
      partnershipId: z.number().optional(),
      status: z.string().optional(),
      year: z.number().optional(),
      month: z.number().optional(),
    }).optional()).query(({ input }) => getPartnershipInvoices(input)),

    createInvoice: protectedProcedure.input(z.object({
      partnershipId: z.number(),
      invoiceNumber: z.string().optional(),
      amount: z.number(),
      referenceMonth: z.number().min(1).max(12),
      referenceYear: z.number(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data = { ...input, dueDate: input.dueDate ? new Date(input.dueDate) : undefined };
      const id = await createPartnershipInvoice(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "partnership_invoice", entityId: id || 0 });
      return { id };
    }),

    updateInvoice: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
      invoiceNumber: z.string().optional(),
      amount: z.number().optional(),
      dueDate: z.string().optional(),
      sentAt: z.string().optional(),
      paidAt: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...rest } = input;
      const data: any = { ...rest };
      if (rest.dueDate) data.dueDate = new Date(rest.dueDate);
      if (rest.sentAt) data.sentAt = new Date(rest.sentAt);
      if (rest.paidAt) data.paidAt = new Date(rest.paidAt);
      if (rest.status === "sent" && !rest.sentAt) data.sentAt = new Date();
      if (rest.status === "paid" && !rest.paidAt) data.paidAt = new Date();
      await updatePartnershipInvoice(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "partnership_invoice", entityId: id });
      return { success: true };
    }),

    deleteInvoice: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deletePartnershipInvoice(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "partnership_invoice", entityId: input.id });
      return { success: true };
    }),

    markOverdue: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const count = await markOverduePartnershipInvoices();
      return { updated: count };
    }),

    // Bookings by campaign key for monthly billing
    bookingsByCampaign: protectedProcedure.input(z.object({
      campaignKey: z.string(),
      from: z.string(),
      to: z.string(),
      projectId: z.number().optional(),
    })).query(({ input }) => getBookingsByCampaign(input)),
  }),

  // ─── ANUAL ───────────────────────────────────────────────────────────────
  annual: router({
    list: protectedProcedure.input(z.object({
      year: z.number().optional(),
      projectId: z.number().optional(),
    }).optional()).query(({ input }) => getAnnualReports(input)),

    breakdown: protectedProcedure.input(z.object({
      year: z.number(),
      projectId: z.number().optional(),
    })).query(({ input }) => getAnnualBreakdown(input.year, input.projectId)),

    generate: protectedProcedure.input(z.object({
      year: z.number(),
      projectId: z.number().optional(),
      splitPartner: z.number().min(0).max(100).optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const results = await generateAnnualSummary(input.year, input.projectId, input.splitPartner ?? 60);
      await logActivity({ userId: ctx.user.id, action: "generate", entity: "annual_report", details: `Relatório anual ${input.year}` });
      return results;
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      totalRevenue: z.number().optional(),
      totalExpenses: z.number().optional(),
      partnerShare: z.number().optional(),
      companyShare: z.number().optional(),
      splitRatio: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      await updateAnnualReport(id, data);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteAnnualReport(input.id);
      return { success: true };
    }),
  }),

  // ── MULTIPARK INTEGRATION ──────────────────────────────────────────────────
  multipark: router({
    // Pesquisa partilhada de reservas — usada por reclamações, perdidos/achados,
    // ocorrências e críticas Google. Procura por nº reserva / externalId /
    // matrícula / email / nome do cliente. DB local.
    searchBooking: protectedProcedure
      .input(z.object({ search: z.string().min(2) }))
      .query(async ({ input }) => {
        return searchBookingByRef(input.search);
      }),
    // Detalhe de uma reserva específica via API Multipark
    fetchBookingDetails: protectedProcedure
      .input(z.object({ externalId: z.string() }))
      .query(async ({ input }) => {
        const { getBooking } = await import("./multipark");
        try {
          return await getBooking(input.externalId);
        } catch {
          return null;
        }
      }),

    // Test API connection
    testConnection: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return mpTestConnection();
    }),

    // Inspect raw booking JSON from API (tries all parks). Admin-only debug tool.
    inspectBooking: protectedProcedure
      .input(z.object({ externalId: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const found = await getBookingTryAllParks(input.externalId);
        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reserva não encontrada em nenhum parque (ou chaves de API em falta).",
          });
        }
        return {
          park: `${found.parkConfig.name} (${found.parkConfig.city})`,
          parkId: found.parkConfig.id,
          booking: found.booking,
        };
      }),

    // Check availability
    checkAvailability: protectedProcedure
      .input(z.object({
        checkIn: z.string(),
        checkOut: z.string(),
        vehicleType: z.enum(["MOTORCYCLE", "CAR", "VAN", "TRUCK"]).default("CAR"),
        parkingType: z.enum(["COVERED", "UNCOVERED", "INDOOR", "VIP"]).default("COVERED"),
      }))
      .query(async ({ input }) => {
        return mpCheckAvailability(
          input.checkIn,
          input.checkOut,
          input.vehicleType as VehicleType,
          input.parkingType as ParkingType,
        );
      }),

    // List parks
    listParks: protectedProcedure.query(async () => {
      return mpListParks();
    }),

    // Get sync logs
    syncLogs: protectedProcedure.query(async () => {
      return getSyncLogs(50);
    }),

    // ── KPIs AGREGADOS ──
    kpis: protectedProcedure
      .input(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        city: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getSnapshotKPIs({
          from: input?.from ? new Date(input.from) : undefined,
          to: input?.to ? new Date(input.to) : undefined,
          city: input?.city,
        });
      }),

    // Get daily snapshots (raw data)
    snapshots: protectedProcedure
      .input(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        parkName: z.string().optional(),
        city: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getDailySnapshots({
          from: input?.from ? new Date(input.from) : undefined,
          to: input?.to ? new Date(input.to) : undefined,
          parkName: input?.parkName,
          city: input?.city,
          limit: input?.limit,
        });
      }),

    // ── IMPORT EXCEL ──
    importExcel: protectedProcedure
      .input(z.object({
        fileBase64: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const buffer = Buffer.from(input.fileBase64, "base64");
        const wb = XLSX.read(buffer, { type: "buffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) throw new Error("Ficheiro Excel vazio");
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });
        if (rows.length === 0) throw new Error("Nenhuma linha encontrada no ficheiro");

        // Parse helper
        const parsePrice = (val: any): number => {
          if (!val) return 0;
          const s = String(val).replace(/[^\d.,]/g, "").replace(",", ".");
          return Math.round(parseFloat(s) * 100) || 0; // cents
        };
        const parseDate = (val: any): Date | null => {
          if (!val) return null;
          const s = String(val);
          // Format: "03/03/2026, 16:25" or "2026-03-03"
          const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d;
        };

        // Detect column names (handle encoding issues)
        const colMap: Record<string, string> = {};
        const firstRow = rows[0];
        for (const key of Object.keys(firstRow)) {
          const k = key.toLowerCase();
          if (k.includes("estado")) colMap.status = key;
          if (k.includes("cria") || k === "data de cria\u00e7\u00e3o" || k.includes("cria\ufffd")) colMap.createdAt = key;
          if (k.includes("nome do parque") || k === "nome do parque") colMap.parkName = key;
          if (k === "parkname") colMap.parkName = colMap.parkName || key;
          if (k.includes("cidade")) colMap.city = key;
          if (k.includes("pre\u00e7o total") || k.includes("pre\ufffd") && k.includes("total")) colMap.totalPrice = key;
          if (k.includes("estacionamento") && k.includes("pre")) colMap.parkingPrice = key;
          if (k.includes("entrega") && k.includes("pre")) colMap.deliveryPrice = key;
          if (k.includes("extra") && k.includes("pre")) colMap.extrasPrice = key;
          if (k.includes("pagamento") && k.includes("todo")) colMap.paymentMethod = key;
          if (k.includes("externalcampaign") || k.includes("external")) colMap.campaign = key;
        }

        // Fallback: try to find columns by index position matching known export
        const keys = Object.keys(firstRow);
        if (!colMap.status && keys[1]) colMap.status = keys[1];
        if (!colMap.createdAt && keys[2]) colMap.createdAt = keys[2];
        if (!colMap.parkName && keys[5]) colMap.parkName = keys[5];
        if (!colMap.city && keys[8]) colMap.city = keys[8];
        if (!colMap.totalPrice && keys[28]) colMap.totalPrice = keys[28];
        if (!colMap.parkingPrice && keys[29]) colMap.parkingPrice = keys[29];
        if (!colMap.deliveryPrice && keys[30]) colMap.deliveryPrice = keys[30];
        if (!colMap.extrasPrice && keys[31]) colMap.extrasPrice = keys[31];
        if (!colMap.paymentMethod && keys[47]) colMap.paymentMethod = keys[47];
        if (!colMap.campaign && keys[65]) colMap.campaign = keys[65];

        // Group by date + park + city
        const grouped: Record<string, {
          date: Date;
          parkName: string;
          city: string;
          total: number;
          reserved: number;
          checkin: number;
          checkout: number;
          cancelled: number;
          revenue: number;
          parkingRev: number;
          deliveryRev: number;
          extrasRev: number;
          online: number;
          agent: number;
          campaigns: Record<string, number>;
        }> = {};

        let parsedRows = 0;
        for (const row of rows) {
          const createdDate = parseDate(row[colMap.createdAt]);
          if (!createdDate) continue;
          const dateKey = createdDate.toISOString().slice(0, 10);
          const parkName = String(row[colMap.parkName] || "Desconhecido").trim();
          const city = String(row[colMap.city] || "Desconhecida").trim();
          const status = String(row[colMap.status] || "").toLowerCase();
          const groupKey = `${dateKey}|${parkName}|${city}`;

          if (!grouped[groupKey]) {
            grouped[groupKey] = {
              date: createdDate,
              parkName,
              city,
              total: 0, reserved: 0, checkin: 0, checkout: 0, cancelled: 0,
              revenue: 0, parkingRev: 0, deliveryRev: 0, extrasRev: 0,
              online: 0, agent: 0, campaigns: {},
            };
          }
          const g = grouped[groupKey];
          g.total++;
          parsedRows++;

          if (status.includes("reserv")) g.reserved++;
          else if (status.includes("check-in") || status.includes("checkin")) g.checkin++;
          else if (status.includes("check-out") || status.includes("checkout")) g.checkout++;
          else if (status.includes("cancel")) g.cancelled++;

          g.revenue += parsePrice(row[colMap.totalPrice]);
          g.parkingRev += parsePrice(row[colMap.parkingPrice]);
          g.deliveryRev += parsePrice(row[colMap.deliveryPrice]);
          g.extrasRev += parsePrice(row[colMap.extrasPrice]);

          const method = String(row[colMap.paymentMethod] || "").toLowerCase();
          if (method.includes("online")) g.online++;

          const campaign = row[colMap.campaign];
          if (campaign && String(campaign).trim()) {
            const campName = String(campaign).trim();
            g.campaigns[campName] = (g.campaigns[campName] || 0) + 1;
            g.agent++;
          }
        }

        // Upsert snapshots
        let created = 0, updated = 0;
        for (const g of Object.values(grouped)) {
          const result = await upsertDailySnapshot({
            snapshotDate: new Date(g.date.toISOString().slice(0, 10) + "T00:00:00.000Z").toISOString().slice(0, 19).replace("T", " "),
            parkName: g.parkName,
            city: g.city,
            totalBookings: g.total,
            reservedCount: g.reserved,
            checkinCount: g.checkin,
            checkoutCount: g.checkout,
            cancelledCount: g.cancelled,
            totalRevenue: g.revenue,
            parkingRevenue: g.parkingRev,
            deliveryRevenue: g.deliveryRev,
            extrasRevenue: g.extrasRev,
            onlineCount: g.online,
            agentCount: g.agent,
            externalCampaigns: Object.keys(g.campaigns).length > 0 ? JSON.stringify(g.campaigns) : null,
            importSource: "excel",
            importedById: ctx.user.id,
          });
          if (result?.action === "created") created++;
          else if (result?.action === "updated") updated++;
        }

        await createSyncLog({
          syncType: "excel_import",
          status: "success",
          recordsProcessed: parsedRows,
          recordsCreated: created,
          recordsUpdated: updated,
          triggeredById: ctx.user.id,
          completedAt: new Date(),
        });

        await logActivity({
          userId: ctx.user.id,
          action: "import",
          entity: "multipark_kpis",
          details: `Excel importado: ${parsedRows} reservas → ${created + updated} snapshots (${input.filename})`,
        });

        return {
          success: true,
          rowsParsed: parsedRows,
          snapshotsCreated: created,
          snapshotsUpdated: updated,
          totalGroups: Object.keys(grouped).length,
        };
      }),

    // Manual sync trigger
    // Sync bookings from API (manual trigger with date range)
    triggerSync: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        actionTypes: z.array(z.enum(["creation", "checkin", "checkout", "cancelation"])).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        try {
          const result = await syncBookings({
            startDate: input.startDate,
            endDate: input.endDate,
            actionTypes: input.actionTypes as any,
            triggeredById: ctx.user.id,
          });
          await logActivity({
            userId: ctx.user.id,
            action: "sync",
            entity: "multipark",
            details: `Sync API: ${result.processed} processadas, ${result.created} novas, ${result.updated} atualizadas`,
          });
          return result;
        } catch (error: any) {
          await createSyncLog({
            syncType: "manual",
            status: "error",
            errorMessage: error.message,
            triggeredById: ctx.user.id,
            completedAt: new Date(),
          });
          return { success: false, processed: 0, created: 0, updated: 0, errors: [error.message] };
        }
      }),

    // Enrich a batch of unenriched bookings with /bookings/:id details
    // (deliveryType, returnFlight, departingFlight, remarks).
    enrichBatch: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(300).default(200) }).optional())
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const result = await enrichBookingsBatch(input?.limit ?? 200);
        await logActivity({
          userId: ctx.user.id,
          action: "enrich",
          entity: "multipark_bookings",
          details: `Enriquecidas ${result.enriched}/${result.scanned} (${result.errors} erros API, ${result.noKey} sem chave)`,
        });
        return result;
      }),

    // Fetch history (timeline) das reservas recentes ou futuras 30d
    syncHistoryBatch: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const result = await syncBookingHistoryBatch(input?.limit ?? 50);
        await logActivity({
          userId: ctx.user.id,
          action: "history_sync",
          entity: "multipark_bookings",
          details: `History: ${result.fetched}/${result.scanned} reservas (${result.errors} erros, ${result.noKey} sem chave)`,
        });
        return result;
      }),

    // Buscar history de um agente (por nome) num dia (chama /agent/history
    // por cada parque configurado e agrega resultados na DB).
    fetchAgentHistory: protectedProcedure
      .input(z.object({
        agentName: z.string().min(1).max(256),
        date: z.string(), // YYYY-MM-DD
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { fetchAgentHistoryByName } = await import("./jobs/multiparkBookingSync");
        return fetchAgentHistoryByName(input.agentName, input.date);
      }),

    // Avaliação operacional do dia: por extra (com métricas) + agregado
    // por turno + agregado total. TL recebe também score da equipa.
    dayEvaluation: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        const { evaluateDay } = await import("./multiparkEvaluation");
        return evaluateDay(input.date);
      }),

    // Dashboard por intervalo: daily series + per-person summary com
    // in-shift vs out-of-shift actions
    dashboardRange: protectedProcedure
      .input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(async ({ input }) => {
        const { getDashboardRange } = await import("./multiparkEvaluation");
        return getDashboardRange(input.startDate, input.endDate);
      }),

    // Set multipark mapping para um empregado (nome curto + userId)
    setMultiparkAgentMapping: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        multiparkAgentName: z.string().max(256).nullable().optional(),
        multiparkAgentUserId: z.string().max(128).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const db = await getDb(); if (!db) return { success: false };
        const { employees } = await import("../drizzle/schema");
        const { eq: deq } = await import("drizzle-orm");
        const patch: any = {};
        if (input.multiparkAgentName !== undefined) patch.multiparkAgentName = input.multiparkAgentName;
        if (input.multiparkAgentUserId !== undefined) patch.multiparkAgentUserId = input.multiparkAgentUserId;
        await db.update(employees).set(patch).where(deq(employees.id, input.employeeId));
        return { success: true };
      }),

    // Lista summary do que está guardado em multipark_booking_history para
    // um agente num dia (após fetchAgentHistory).
    agentHistorySummary: protectedProcedure
      .input(z.object({
        agentName: z.string().min(1).max(256),
        date: z.string(),
      }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb(); if (!db) return null;
        const { multiparkBookingHistory } = await import("../drizzle/schema");
        const { sql: dsql, and: dand, eq: deq, gte: dgte, lt: dlt } = await import("drizzle-orm");
        const start = `${input.date} 00:00:00`;
        const end = new Date(input.date + "T00:00:00");
        end.setDate(end.getDate() + 1);
        const endStr = end.toISOString().slice(0, 19).replace("T", " ");
        const rows = await db
          .select()
          .from(multiparkBookingHistory)
          .where(
            dand(
              deq(multiparkBookingHistory.agentName, input.agentName),
              dgte(multiparkBookingHistory.actionTime, start),
              dlt(multiparkBookingHistory.actionTime, endStr),
            ),
          )
          .orderBy(multiparkBookingHistory.actionTime);
        const byType: Record<string, number> = {};
        for (const r of rows) {
          const k = r.changeType ?? "?";
          byType[k] = (byType[k] ?? 0) + 1;
        }
        return { total: rows.length, byType, items: rows };
      }),

    // ── Atividade por agente (TODOS os agentes com atividade) + mapeamento ──
    // Lista os nomes de agente Multipark do histórico no período, com contagens
    // e o colaborador a que estão ligados (employees.multiparkAgentName).
    agentActivity: protectedProcedure
      .input(z.object({ from: z.string(), to: z.string() }))
      .query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const db = await getDb(); if (!db) return [];
        const rows = (r: any) => (Array.isArray(r[0]) ? r[0] : r) as any[];
        const acts = rows(await db.execute(sql`
          SELECT agentName,
            COUNT(*) AS total,
            SUM(changeType = 'CHECK_IN') AS checkin,
            SUM(changeType = 'CHECK_OUT') AS checkout,
            SUM(changeType = 'MOVEMENT') AS movement
          FROM multipark_booking_history
          WHERE agentName IS NOT NULL AND agentName <> ''
            AND actionTime >= ${input.from + " 00:00:00"} AND actionTime <= ${input.to + " 23:59:59"}
          GROUP BY agentName ORDER BY total DESC`));
        const emps = rows(await db.execute(sql`SELECT id, fullName, multiparkAgentName FROM employees WHERE multiparkAgentName IS NOT NULL AND multiparkAgentName <> ''`));
        const byAgent = new Map(emps.map((e: any) => [e.multiparkAgentName, e]));
        return acts.map((a: any) => {
          const e = byAgent.get(a.agentName);
          return {
            agentName: a.agentName,
            total: Number(a.total), checkin: Number(a.checkin), checkout: Number(a.checkout), movement: Number(a.movement),
            employeeId: e?.id ?? null, employeeName: e?.fullName ?? null,
          };
        });
      }),

    // Liga (ou desliga) um nome de agente Multipark a um colaborador. Único:
    // limpa o nome de qualquer outro colaborador que o tivesse.
    mapAgentToEmployee: protectedProcedure
      .input(z.object({ agentName: z.string().min(1), employeeId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        // limpa o agente de quem o tivesse
        await db.execute(sql`UPDATE employees SET multiparkAgentName = NULL WHERE multiparkAgentName = ${input.agentName}`);
        if (input.employeeId != null) {
          await db.execute(sql`UPDATE employees SET multiparkAgentName = ${input.agentName} WHERE id = ${input.employeeId}`);
        }
        return { success: true };
      }),

    // Lista leve de colaboradores ativos para o dropdown de mapeamento.
    employeesForMapping: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      const { getDb } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const db = await getDb(); if (!db) return [];
      const r: any = await db.execute(sql`SELECT id, fullName, multiparkAgentName FROM employees WHERE isActive = 1 ORDER BY fullName`);
      return (Array.isArray(r[0]) ? r[0] : r) as any[];
    }),

    // List synced bookings with filters
    bookings: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        parkingType: z.string().optional(),
        city: z.string().optional(),
        parkName: z.string().optional(),
        projectId: z.number().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getMultiparkBookings({
          status: input?.status,
          parkingType: input?.parkingType,
          from: input?.from ? new Date(input.from) : undefined,
          to: input?.to ? new Date(input.to) : undefined,
          search: input?.search,
          limit: input?.limit,
        });
      }),

    // Booking stats (with optional filters)
    bookingStats: protectedProcedure
      .input(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        projectId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getMultiparkBookingStats(input ?? undefined);
      }),

    // Query LOCAL DB by actionType + date range
    localBookingsByAction: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        actionType: z.enum(["creation", "checkin", "checkout", "cancelation"]),
        projectId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const bookings = await getLocalBookingsByAction(input);
        return {
          total: bookings.length,
          actionType: input.actionType,
          period: { startDate: input.startDate, endDate: input.endDate },
          bookings,
        };
      }),

    // Query API directly by actionType + date range (all parks)
    reportByAction: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        actionType: z.enum(["creation", "checkin", "checkout", "cancelation"]),
      }))
      .query(async ({ input }) => {
        const results = await getBookingsReportAllParks(
          input.startDate,
          input.endDate,
          input.actionType as BookingActionType,
        );
        // Flatten all bookings from all parks, tag each with park info
        let bookings = results.flatMap(r =>
          r.report.bookings.map(b => ({
            ...b,
            _parkName: r.park.name,
            _parkCity: r.park.city,
            _parkId: r.park.id,
          }))
        );
        // For checkin/checkout, exclude cancelled bookings
        if (input.actionType === "checkin" || input.actionType === "checkout") {
          bookings = bookings.filter((b: any) => b.status !== "CANCELLED");
        }
        return {
          total: bookings.length,
          actionType: input.actionType,
          period: { startDate: input.startDate, endDate: input.endDate },
          bookings,
        };
      }),
  }),

  // ── EXTRAS DIA — Daily forecast & driver allocation (Lisboa) ────────────────
  extrasDia: router({
    forecast: protectedProcedure
      .input(z.object({ baseDate: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getExtrasDiaForecast(input?.baseDate);
      }),

    candidates: protectedProcedure.query(async () => {
      return listDriverCandidates();
    }),

    assignments: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        return listAssignments(input.date);
      }),

    upsertAssignment: protectedProcedure
      .input(
        z.object({
          id: z.number().optional(),
          assignmentDate: z.string(),
          employeeId: z.number().nullable().optional(),
          personName: z.string().min(1).max(128),
          level: z.enum(["junior", "senior", "terminal", "master"]).nullable().optional(),
          isTeamLeader: z.boolean().optional(),
          shift: z.enum(["morning", "night"]),
          startHour: z.number().int().min(0).max(27),
          endHour: z.number().int().min(1).max(27),
          sentHomeHour: z.number().int().min(0).max(27).nullable().optional(),
          notes: z.string().max(255).nullable().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (input.endHour <= input.startHour) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Fim tem de ser depois do início" });
        }
        const span = input.endHour - input.startHour;
        if (span < 3) throw new TRPCError({ code: "BAD_REQUEST", message: "Mínimo 3h por turno" });
        if (span > 12) throw new TRPCError({ code: "BAD_REQUEST", message: "Máximo 12h por turno" });
        if (input.sentHomeHour != null) {
          if (input.sentHomeHour < input.startHour || input.sentHomeHour > input.endHour) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Hora 'mandar para casa' tem de estar dentro do turno",
            });
          }
        }
        if (input.isTeamLeader && !input.employeeId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team Leader tem de ser um funcionário registado (salário usado no custo).",
          });
        }
        try {
          return await upsertAssignment({ ...input, createdById: ctx.user.id });
        } catch (err: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: err.message || "Erro ao guardar" });
        }
      }),

    deleteAssignment: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAssignment(input.id);
        return { success: true };
      }),

    costForRange: protectedProcedure
      .input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(async ({ input }) => {
        return getExtrasDiaCostForRange(input.startDate, input.endDate);
      }),

    bookingsInSlot: protectedProcedure
      .input(
        z.object({
          date: z.string(),
          hour: z.number().int().min(3).max(26),
          slot: z.number().int().min(0).max(2),
          type: z.enum(["checkin", "checkout"]),
        }),
      )
      .query(async ({ input }) => {
        return getBookingsInSlot(input.date, input.hour, input.slot, input.type);
      }),
  }),
});
export type AppRouter = typeof appRouter;
