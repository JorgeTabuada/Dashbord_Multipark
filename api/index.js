var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  annualReports: () => annualReports,
  apiKeys: () => apiKeys,
  appNotifications: () => appNotifications,
  bookingHistory: () => bookingHistory,
  campaignDailyStats: () => campaignDailyStats,
  campaigns: () => campaigns,
  careerExamAttempts: () => careerExamAttempts,
  careerExamQuestions: () => careerExamQuestions,
  careerExams: () => careerExams,
  complaintDriversOnDuty: () => complaintDriversOnDuty,
  complaintMessages: () => complaintMessages,
  complaintPenaltyConfig: () => complaintPenaltyConfig,
  complaintPhotos: () => complaintPhotos,
  complaints: () => complaints,
  dailyDriverHistory: () => dailyDriverHistory,
  employeeDocuments: () => employeeDocuments,
  employeeLeaves: () => employeeLeaves,
  employeePenalties: () => employeePenalties,
  employeeSalaryHistory: () => employeeSalaryHistory,
  employees: () => employees,
  expenseCategories: () => expenseCategories,
  expenses: () => expenses,
  extraRates: () => extraRates,
  extrasDiaAssignments: () => extrasDiaAssignments,
  faqs: () => faqs,
  googleReviews: () => googleReviews,
  gpsAlerts: () => gpsAlerts,
  incidents: () => incidents,
  internalCampaignCosts: () => internalCampaignCosts,
  internalCampaignKeys: () => internalCampaignKeys,
  internalCampaigns: () => internalCampaigns,
  inviteTokens: () => inviteTokens,
  invoices: () => invoices,
  lostFoundItems: () => lostFoundItems,
  lostFoundMessages: () => lostFoundMessages,
  lostFoundPhotos: () => lostFoundPhotos,
  marketingExpenses: () => marketingExpenses,
  multiparkBookingExtras: () => multiparkBookingExtras,
  multiparkBookingHistory: () => multiparkBookingHistory,
  multiparkBookings: () => multiparkBookings,
  multiparkDailySnapshots: () => multiparkDailySnapshots,
  multiparkSyncLogs: () => multiparkSyncLogs,
  partnerAliases: () => partnerAliases,
  partnershipInvoices: () => partnershipInvoices,
  partnershipTransactions: () => partnershipTransactions,
  partnerships: () => partnerships,
  payslipHistory: () => payslipHistory,
  pdaCheckins: () => pdaCheckins,
  pdas: () => pdas,
  performanceEvaluations: () => performanceEvaluations,
  projectEmployees: () => projectEmployees,
  projects: () => projects,
  quizAttempts: () => quizAttempts,
  quizQuestions: () => quizQuestions,
  radioTranscriptions: () => radioTranscriptions,
  recurringExpenses: () => recurringExpenses,
  schedules: () => schedules,
  services: () => services,
  speedAlerts: () => speedAlerts,
  speedLimits: () => speedLimits,
  speedViolations: () => speedViolations,
  taskAssignees: () => taskAssignees,
  tasks: () => tasks,
  timeRecords: () => timeRecords,
  trainingCategories: () => trainingCategories,
  trainingManuals: () => trainingManuals,
  trainingVideos: () => trainingVideos,
  users: () => users,
  vehicleMovements: () => vehicleMovements,
  vehicles: () => vehicles
});
import { mysqlTable, bigint, int, varchar, text, timestamp, index, uniqueIndex, decimal, mysqlEnum, tinyint } from "drizzle-orm/mysql-core";
var activityLogs, annualReports, apiKeys, campaignDailyStats, campaigns, internalCampaigns, internalCampaignKeys, internalCampaignCosts, careerExamAttempts, careerExamQuestions, careerExams, appNotifications, complaintDriversOnDuty, complaintPenaltyConfig, complaintMessages, complaintPhotos, complaints, dailyDriverHistory, employeeDocuments, employees, employeeLeaves, employeeSalaryHistory, employeePenalties, expenseCategories, expenses, recurringExpenses, extraRates, extrasDiaAssignments, faqs, googleReviews, gpsAlerts, incidents, inviteTokens, invoices, lostFoundItems, lostFoundMessages, lostFoundPhotos, bookingHistory, marketingExpenses, multiparkBookings, multiparkBookingExtras, multiparkDailySnapshots, multiparkSyncLogs, partnershipInvoices, partnershipTransactions, partnerships, multiparkBookingHistory, partnerAliases, payslipHistory, pdaCheckins, pdas, performanceEvaluations, projectEmployees, projects, quizAttempts, quizQuestions, radioTranscriptions, schedules, services, speedAlerts, speedLimits, speedViolations, taskAssignees, tasks, timeRecords, trainingCategories, trainingManuals, trainingVideos, users, vehicleMovements, vehicles;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    activityLogs = mysqlTable("activity_logs", {
      id: bigint({ mode: "number" }).autoincrement().primaryKey(),
      userId: int().notNull(),
      action: varchar({ length: 64 }).notNull(),
      entity: varchar({ length: 64 }).notNull(),
      entityId: int(),
      details: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    annualReports = mysqlTable("annual_reports", {
      id: int().autoincrement().primaryKey(),
      projectId: int(),
      month: int().notNull(),
      year: int().notNull(),
      totalRevenue: int().default(0),
      totalExpenses: int().default(0),
      partnerShare: int().default(0),
      companyShare: int().default(0),
      splitRatio: varchar({ length: 10 }).default("60/40"),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    apiKeys = mysqlTable(
      "api_keys",
      {
        id: int().autoincrement().primaryKey(),
        name: varchar({ length: 100 }).notNull(),
        apiKey: varchar({ length: 64 }).notNull(),
        permissions: text(),
        active: tinyint().default(1).notNull(),
        lastUsedAt: timestamp({ mode: "string" }),
        createdById: int(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("api_keys_apiKey_unique").on(table.apiKey)
      ]
    );
    campaignDailyStats = mysqlTable("campaign_daily_stats", {
      id: int().autoincrement().primaryKey(),
      campaignId: int().notNull(),
      date: timestamp({ mode: "string" }).notNull(),
      spend: decimal({ precision: 10, scale: 2 }).default("0").notNull(),
      impressions: int().default(0),
      clicks: int().default(0),
      conversions: int().default(0),
      conversionValue: decimal({ precision: 10, scale: 2 }).default("0"),
      cpc: decimal({ precision: 8, scale: 4 }),
      ctr: decimal({ precision: 6, scale: 4 }),
      costPerConversion: decimal({ precision: 10, scale: 2 }),
      importedById: int().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    campaigns = mysqlTable("campaigns", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 256 }).notNull(),
      platform: mysqlEnum(["google_ads", "meta_ads", "instagram", "other"]).notNull(),
      projectId: int(),
      campaignStatus: mysqlEnum(["active", "paused", "completed"]).default("active").notNull(),
      startDate: timestamp({ mode: "string" }),
      endDate: timestamp({ mode: "string" }),
      budget: decimal({ precision: 10, scale: 2 }),
      notes: text(),
      createdById: int().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    internalCampaigns = mysqlTable("internal_campaigns", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 256 }).notNull(),
      projectId: int(),
      // "para onde vai" — projeto/centro de custos
      dailyBudget: decimal({ precision: 10, scale: 2 }),
      // orçamento diário (Google Ads); gasto estimado = dailyBudget × dias
      city: varchar({ length: 64 }),
      brand: varchar({ length: 32 }),
      campaignStatus: mysqlEnum(["active", "paused", "completed"]).default("active").notNull(),
      notes: text(),
      createdById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    internalCampaignKeys = mysqlTable(
      "internal_campaign_keys",
      {
        id: int().autoincrement().primaryKey(),
        campaignType: mysqlEnum(["internal", "ad"]).default("internal").notNull(),
        // internal_campaigns ou campaigns
        campaignId: int().notNull(),
        // FK -> internal_campaigns.id OU campaigns.id (conforme campaignType)
        keyType: mysqlEnum(["campaign_id", "campaign_name", "url_pattern"]).notNull(),
        keyValue: varchar({ length: 512 }).notNull(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        uniqueIndex("internal_campaign_keys_type_value_unique").on(table.keyType, table.keyValue),
        index("idx_internal_campaign_keys_campaign").on(table.campaignId)
      ]
    );
    internalCampaignCosts = mysqlTable(
      "internal_campaign_costs",
      {
        id: int().autoincrement().primaryKey(),
        campaignType: mysqlEnum(["internal", "ad"]).default("internal").notNull(),
        campaignId: int().notNull(),
        // FK -> internal_campaigns.id OU campaigns.id
        costDate: varchar({ length: 10 }).notNull(),
        // YYYY-MM-DD
        amount: decimal({ precision: 10, scale: 2 }).notNull(),
        impressions: int(),
        clicks: int(),
        ctr: decimal({ precision: 7, scale: 3 }),
        // %
        conversions: decimal({ precision: 10, scale: 2 }),
        conversionValue: decimal({ precision: 10, scale: 2 }),
        notes: varchar({ length: 255 }),
        createdById: int(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        uniqueIndex("internal_campaign_costs_campaign_date_unique").on(table.campaignType, table.campaignId, table.costDate)
      ]
    );
    careerExamAttempts = mysqlTable("career_exam_attempts", {
      id: int().autoincrement().primaryKey(),
      examId: int().notNull(),
      employeeId: int().notNull(),
      totalQuestions: int().notNull(),
      correctAnswers: int().notNull(),
      score: int().notNull(),
      passed: tinyint().notNull(),
      timeSpentSeconds: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    careerExamQuestions = mysqlTable("career_exam_questions", {
      id: int().autoincrement().primaryKey(),
      examId: int().notNull(),
      question: text().notNull(),
      optionA: text().notNull(),
      optionB: text().notNull(),
      optionC: text().notNull(),
      optionD: text().notNull(),
      correctOption: mysqlEnum(["A", "B", "C", "D"]).notNull(),
      explanation: text(),
      points: int().default(10).notNull()
    });
    careerExams = mysqlTable("career_exams", {
      id: int().autoincrement().primaryKey(),
      level: mysqlEnum(["extra", "condutor", "senior", "team_leader", "supervisor"]).notNull(),
      title: varchar({ length: 255 }).notNull(),
      description: text(),
      passingScore: int().notNull(),
      timeLimitMinutes: int().default(30),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    appNotifications = mysqlTable(
      "app_notifications",
      {
        id: int().autoincrement().primaryKey(),
        userId: int().notNull(),
        title: varchar({ length: 255 }).notNull(),
        body: text(),
        kind: varchar({ length: 32 }).default("info"),
        link: varchar({ length: 512 }),
        isRead: tinyint().default(0).notNull(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_app_notifications_user_unread").on(table.userId, table.isRead, table.createdAt),
        index("idx_app_notifications_kind").on(table.kind)
      ]
    );
    complaintDriversOnDuty = mysqlTable(
      "complaint_drivers_on_duty",
      {
        id: int().autoincrement().primaryKey(),
        complaintId: int().notNull(),
        employeeId: int(),
        employeeName: varchar({ length: 256 }).notNull(),
        roleAtTime: varchar({ length: 64 }),
        source: varchar({ length: 32 }).notNull(),
        penaltyPointsApplied: int().default(0).notNull(),
        notes: varchar({ length: 512 }),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_cdod_complaint").on(table.complaintId),
        index("idx_cdod_employee").on(table.employeeId)
      ]
    );
    complaintPenaltyConfig = mysqlTable(
      "complaint_penalty_config",
      {
        id: int().autoincrement().primaryKey(),
        complaintType: varchar({ length: 32 }).notNull(),
        basePoints: int().default(0).notNull(),
        description: varchar({ length: 255 }),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("uq_complaint_type").on(table.complaintType)
      ]
    );
    complaintMessages = mysqlTable("complaint_messages", {
      id: int().autoincrement().primaryKey(),
      complaintId: int().notNull(),
      message: text().notNull(),
      isInternal: tinyint().default(0).notNull(),
      authorId: int(),
      authorName: varchar({ length: 200 }),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    complaintPhotos = mysqlTable("complaint_photos", {
      id: int().autoincrement().primaryKey(),
      complaintId: int().notNull(),
      url: varchar({ length: 500 }).notNull(),
      fileKey: varchar({ length: 500 }).notNull(),
      label: varchar({ length: 100 }),
      uploadedById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    complaints = mysqlTable("complaints", {
      id: int().autoincrement().primaryKey(),
      title: varchar({ length: 255 }).notNull(),
      description: text(),
      complaintType: mysqlEnum("complaint_type", ["damage", "dirt", "delay", "overcharge", "staff", "other"]).notNull(),
      complaintStatus: mysqlEnum("complaint_status", ["new", "analyzing", "waiting_client", "resolved", "closed"]).default("new").notNull(),
      complaintPriority: mysqlEnum("complaint_priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
      clientName: varchar({ length: 200 }),
      clientEmail: varchar({ length: 320 }),
      clientPhone: varchar({ length: 50 }),
      reservationRef: varchar({ length: 100 }),
      reservationStart: timestamp({ mode: "string" }),
      reservationEnd: timestamp({ mode: "string" }),
      vehicleId: int(),
      vehiclePlate: varchar({ length: 20 }),
      driversInvolved: text(),
      slaDeadline: timestamp({ mode: "string" }),
      resolvedAt: timestamp({ mode: "string" }),
      projectId: int(),
      assignedToId: int(),
      createdById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      penaltyPoints: int().default(0).notNull(),
      clientEmailSentAt: timestamp({ mode: "string" }),
      clientEmailSubject: varchar({ length: 255 }),
      clientEmailBody: text()
    });
    dailyDriverHistory = mysqlTable("daily_driver_history", {
      id: int().autoincrement().primaryKey(),
      zelloUsername: varchar({ length: 255 }).notNull(),
      displayName: varchar({ length: 255 }),
      employeeId: int(),
      date: timestamp({ mode: "string" }).notNull(),
      totalKm: decimal({ precision: 10, scale: 2 }).default("0"),
      hoursWorked: decimal({ precision: 6, scale: 2 }).default("0"),
      hoursStopped: decimal({ precision: 6, scale: 2 }).default("0"),
      totalHoursOnline: decimal({ precision: 6, scale: 2 }).default("0"),
      avgSpeed: decimal({ precision: 6, scale: 2 }).default("0"),
      maxSpeed: decimal({ precision: 6, scale: 2 }).default("0"),
      speedViolations: int().default(0),
      avgBattery: int().default(0),
      minBattery: int().default(0),
      gpsPointsCount: int().default(0),
      geoJsonUrl: text(),
      rawDataUrl: text(),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    employeeDocuments = mysqlTable("employee_documents", {
      id: int().autoincrement().primaryKey(),
      employeeId: int().notNull(),
      docType: mysqlEnum(["id_card", "residence_permit", "driving_license", "nib_proof", "address_proof", "contract", "extra_contract", "contract_annex", "responsibility_term", "work_accident_insurance", "photo", "other"]).notNull(),
      label: varchar({ length: 256 }),
      fileUrl: text().notNull(),
      fileKey: varchar({ length: 512 }).notNull(),
      mimeType: varchar({ length: 128 }),
      uploadedById: int().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    employees = mysqlTable("employees", {
      id: int().autoincrement().primaryKey(),
      fullName: varchar({ length: 256 }).notNull(),
      email: varchar({ length: 320 }),
      phone: varchar({ length: 32 }),
      nif: varchar({ length: 20 }),
      nib: varchar({ length: 30 }),
      address: text(),
      birthDate: timestamp({ mode: "string" }),
      nationality: varchar({ length: 64 }),
      photoUrl: text(),
      photoKey: varchar({ length: 512 }),
      position: mysqlEnum(["director", "supervisor", "team_leader", "backoffice", "frontoffice", "senior_driver", "driver", "extra"]).default("driver").notNull(),
      extraLevel: int(),
      department: varchar({ length: 128 }),
      projectId: int(),
      contractType: mysqlEnum(["permanent", "fixed_term", "extra"]).default("permanent"),
      contractStart: timestamp({ mode: "string" }),
      contractEnd: timestamp({ mode: "string" }),
      monthlySalary: decimal({ precision: 10, scale: 2 }),
      isActive: tinyint().default(1).notNull(),
      userId: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      mealAllowancePerDay: decimal({ precision: 6, scale: 2 }),
      multiparkAgentName: varchar({ length: 256 }),
      multiparkAgentUserId: varchar({ length: 128 }),
      docsWarningAt: timestamp({ mode: "string" }),
      loginBlocked: tinyint().default(0).notNull(),
      loginBlockedReason: varchar({ length: 255 })
    });
    employeeLeaves = mysqlTable(
      "employee_leaves",
      {
        id: int().autoincrement().primaryKey(),
        employeeId: int().notNull(),
        leaveType: mysqlEnum(["vacation", "sick", "unpaid", "other"]).default("vacation").notNull(),
        fromDate: varchar({ length: 10 }).notNull(),
        toDate: varchar({ length: 10 }).notNull(),
        notes: varchar({ length: 255 }),
        createdById: int(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_employee_leaves_emp").on(table.employeeId),
        index("idx_employee_leaves_dates").on(table.fromDate, table.toDate)
      ]
    );
    employeeSalaryHistory = mysqlTable(
      "employee_salary_history",
      {
        id: int().autoincrement().primaryKey(),
        employeeId: int().notNull(),
        monthlySalary: decimal({ precision: 10, scale: 2 }),
        mealAllowancePerDay: decimal({ precision: 6, scale: 2 }),
        effectiveFrom: varchar({ length: 10 }).notNull(),
        effectiveUntil: varchar({ length: 10 }),
        changedById: int(),
        notes: varchar({ length: 255 }),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_salary_history_emp").on(table.employeeId),
        index("idx_salary_history_from").on(table.effectiveFrom)
      ]
    );
    employeePenalties = mysqlTable(
      "employee_penalties",
      {
        id: int().autoincrement().primaryKey(),
        employeeId: int().notNull(),
        reason: mysqlEnum(["no_show_extra_dia", "speeding", "lost_found_investigation", "complaint_investigation", "other"]).notNull(),
        severity: mysqlEnum(["warning", "penalty", "serious"]).default("penalty").notNull(),
        points: int().default(1).notNull(),
        relatedId: int(),
        notes: varchar({ length: 512 }),
        clearedAt: timestamp({ mode: "string" }),
        clearedById: int(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_employee_penalties_emp").on(table.employeeId),
        index("idx_employee_penalties_open").on(table.employeeId, table.clearedAt)
      ]
    );
    expenseCategories = mysqlTable("expense_categories", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 128 }).notNull(),
      department: varchar({ length: 128 }),
      color: varchar({ length: 16 }).default("#6366f1"),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    expenses = mysqlTable("expenses", {
      id: int().autoincrement().primaryKey(),
      supplier: varchar({ length: 256 }),
      description: text(),
      amount: decimal({ precision: 10, scale: 2 }).notNull(),
      currency: varchar({ length: 8 }).default("EUR").notNull(),
      paymentMethod: mysqlEnum(["cash", "card", "transfer", "check", "other"]).default("card"),
      expenseDate: timestamp({ mode: "string" }).notNull(),
      paymentDueDate: timestamp({ mode: "string" }),
      paidAt: timestamp({ mode: "string" }),
      status: mysqlEnum(["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
      categoryId: int(),
      projectId: int(),
      buyerId: int(),
      insertedById: int().notNull(),
      invoiceImageUrl: text(),
      invoiceImageKey: varchar({ length: 512 }),
      extractedByAi: tinyint().default(0),
      notes: text(),
      recurringTemplateId: int(),
      // se gerada por um modelo recorrente
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    recurringExpenses = mysqlTable("recurring_expenses", {
      id: int().autoincrement().primaryKey(),
      description: text(),
      supplier: varchar({ length: 256 }),
      amount: decimal({ precision: 10, scale: 2 }).notNull(),
      currency: varchar({ length: 8 }).default("EUR").notNull(),
      paymentMethod: mysqlEnum(["cash", "card", "transfer", "check", "other"]).default("transfer"),
      categoryId: int(),
      projectId: int(),
      dayOfMonth: int().default(1).notNull(),
      active: tinyint().default(1).notNull(),
      notes: text(),
      createdById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    extraRates = mysqlTable(
      "extra_rates",
      {
        id: int().autoincrement().primaryKey(),
        level: int().notNull(),
        levelName: varchar({ length: 32 }),
        hourlyRate: decimal({ precision: 6, scale: 2 }).notNull(),
        label: varchar({ length: 64 }),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("extra_rates_level_unique").on(table.level),
        index("idx_extra_rates_levelname").on(table.levelName)
      ]
    );
    extrasDiaAssignments = mysqlTable(
      "extras_dia_assignments",
      {
        id: int().autoincrement().primaryKey(),
        assignmentDate: varchar({ length: 10 }).notNull(),
        employeeId: int(),
        personName: varchar({ length: 128 }).notNull(),
        level: mysqlEnum(["junior", "senior", "terminal", "master"]),
        isTeamLeader: tinyint().default(0).notNull(),
        shift: mysqlEnum(["morning", "night"]).default("morning").notNull(),
        startHour: int().notNull(),
        endHour: int().notNull(),
        sentHomeHour: int(),
        notes: varchar({ length: 255 }),
        createdById: int(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("idx_extras_dia_date").on(table.assignmentDate)
      ]
    );
    faqs = mysqlTable("faqs", {
      id: int().autoincrement().primaryKey(),
      categoryId: int(),
      question: text().notNull(),
      answer: text().notNull(),
      sortOrder: int().default(0),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    googleReviews = mysqlTable("google_reviews", {
      id: int().autoincrement().primaryKey(),
      reviewerName: varchar({ length: 200 }).notNull(),
      reviewerEmail: varchar({ length: 320 }),
      rating: int().notNull(),
      reviewText: text(),
      reviewDate: timestamp({ mode: "string" }),
      projectId: int(),
      vehiclePlate: varchar({ length: 20 }),
      aiResponse: text(),
      aiResponseApproved: tinyint().default(0),
      respondedAt: timestamp({ mode: "string" }),
      respondedBy: int(),
      complaintId: int(),
      status: mysqlEnum(["pending_response", "ai_responded", "manually_responded", "converted_complaint", "dismissed"]).default("pending_response").notNull(),
      createdById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      sourceEmailId: varchar({ length: 100 }),
      sourceEmailDate: timestamp({ mode: "string" }),
      importedAt: timestamp({ mode: "string" })
    });
    gpsAlerts = mysqlTable("gps_alerts", {
      id: int().autoincrement().primaryKey(),
      zelloUsername: varchar({ length: 255 }).notNull(),
      displayName: varchar({ length: 255 }),
      employeeId: int(),
      alertType: mysqlEnum(["gps_off", "zello_off", "battery_low", "no_signal"]).notNull(),
      message: text(),
      latitude: decimal({ precision: 10, scale: 7 }),
      longitude: decimal({ precision: 10, scale: 7 }),
      batteryLevel: int(),
      notificationSent: tinyint().default(0),
      acknowledged: tinyint().default(0),
      acknowledgedById: int(),
      acknowledgedAt: timestamp({ mode: "string" }),
      occurredAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    incidents = mysqlTable("incidents", {
      id: int().autoincrement().primaryKey(),
      projectId: int(),
      vehiclePlate: varchar({ length: 20 }),
      employeeId: int(),
      reportedBy: int(),
      incidentType: mysqlEnum(["vidro_aberto", "mal_estacionado", "dano", "chave_errada", "combustivel", "limpeza", "documentos", "outro"]).default("outro").notNull(),
      severity: mysqlEnum(["low", "medium", "high", "critical"]).default("medium").notNull(),
      description: text().notNull(),
      status: mysqlEnum(["open", "investigating", "resolved", "dismissed"]).default("open").notNull(),
      resolution: text(),
      resolvedAt: timestamp({ mode: "string" }),
      resolvedBy: int(),
      weekNumber: int(),
      yearNumber: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      sourceEmailId: varchar({ length: 100 }),
      sourceEmailDate: timestamp({ mode: "string" }),
      importedAt: timestamp({ mode: "string" }),
      gpsLatitude: varchar({ length: 20 }),
      gpsLongitude: varchar({ length: 20 }),
      reservationLink: text(),
      aiClassification: text(),
      aiSeverity: mysqlEnum(["low", "medium", "high", "critical"])
    });
    inviteTokens = mysqlTable(
      "invite_tokens",
      {
        id: int().autoincrement().primaryKey(),
        token: varchar({ length: 128 }).notNull(),
        email: varchar({ length: 320 }).notNull(),
        userId: int().notNull(),
        invitedById: int().notNull(),
        inviteStatus: mysqlEnum("invite_status", ["pending", "accepted", "expired"]).default("pending").notNull(),
        expiresAt: timestamp({ mode: "string" }).notNull(),
        acceptedAt: timestamp({ mode: "string" }),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("invite_tokens_token_unique").on(table.token)
      ]
    );
    invoices = mysqlTable("invoices", {
      id: int().autoincrement().primaryKey(),
      projectId: int(),
      invoiceNumber: varchar({ length: 100 }).notNull(),
      clientName: varchar({ length: 255 }),
      clientNif: varchar({ length: 20 }),
      issueDate: timestamp({ mode: "string" }).notNull(),
      dueDate: timestamp({ mode: "string" }),
      totalAmount: int().default(0).notNull(),
      taxAmount: int().default(0),
      status: mysqlEnum(["draft", "issued", "paid", "overdue", "cancelled"]).default("draft").notNull(),
      paymentMethod: varchar({ length: 50 }),
      notes: text(),
      fileUrl: text(),
      fileKey: text(),
      createdBy: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    lostFoundItems = mysqlTable("lost_found_items", {
      id: int().autoincrement().primaryKey(),
      projectId: int(),
      vehiclePlate: varchar({ length: 20 }),
      clientName: varchar({ length: 255 }).notNull(),
      clientEmail: varchar({ length: 320 }),
      clientPhone: varchar({ length: 50 }),
      bookingRef: varchar({ length: 100 }),
      itemType: mysqlEnum(["money", "electronics", "clothing", "documents", "accessories", "other"]).default("other").notNull(),
      description: text().notNull(),
      estimatedValue: int(),
      status: mysqlEnum(["new", "investigating", "found", "returned", "closed"]).default("new").notNull(),
      priority: mysqlEnum(["low", "medium", "high"]).default("medium").notNull(),
      assignedTo: int(),
      resolution: text(),
      createdBy: int().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    lostFoundMessages = mysqlTable("lost_found_messages", {
      id: int().autoincrement().primaryKey(),
      itemId: int().notNull(),
      userId: int().notNull(),
      userName: varchar({ length: 255 }).notNull(),
      message: text().notNull(),
      isInternal: tinyint().default(1).notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    lostFoundPhotos = mysqlTable("lost_found_photos", {
      id: int().autoincrement().primaryKey(),
      itemId: int().notNull(),
      url: text().notNull(),
      fileKey: text().notNull(),
      caption: varchar({ length: 255 }),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    bookingHistory = mysqlTable("booking_history", {
      id: int().autoincrement().primaryKey(),
      historyId: varchar({ length: 128 }).notNull(),
      bookingId: varchar({ length: 128 }).notNull(),
      changeType: varchar({ length: 128 }).notNull(),
      userName: varchar({ length: 128 }),
      userLastName: varchar({ length: 128 }),
      userEmail: varchar({ length: 320 }),
      remarks: text(),
      actionDate: timestamp({ mode: "string" }),
      parkName: varchar({ length: 128 }),
      licensePlate: varchar({ length: 32 }),
      bookingStatus: varchar({ length: 64 }),
      importedAt: timestamp({ mode: "string" }).defaultNow().notNull()
    }, (table) => [
      index("bh_booking_idx").on(table.bookingId),
      index("bh_plate_idx").on(table.licensePlate),
      index("bh_user_idx").on(table.userName),
      index("bh_type_idx").on(table.changeType)
    ]);
    marketingExpenses = mysqlTable("marketing_expenses", {
      id: int().autoincrement().primaryKey(),
      description: varchar({ length: 512 }).notNull(),
      mktCategory: mysqlEnum(["google_ads", "meta_ads", "influencer", "print", "merchandise", "event", "other"]).notNull(),
      amount: decimal({ precision: 10, scale: 2 }).notNull(),
      date: timestamp({ mode: "string" }).notNull(),
      projectId: int(),
      supplier: varchar({ length: 256 }),
      invoiceUrl: text(),
      invoiceKey: varchar({ length: 512 }),
      notes: text(),
      createdById: int().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    multiparkBookings = mysqlTable(
      "multipark_bookings",
      {
        id: int().autoincrement().primaryKey(),
        externalId: varchar({ length: 128 }).notNull(),
        bookingNumber: varchar({ length: 64 }),
        status: varchar({ length: 64 }),
        checkIn: timestamp({ mode: "string" }),
        checkOut: timestamp({ mode: "string" }),
        checkInTime: varchar({ length: 8 }),
        checkOutTime: varchar({ length: 8 }),
        parkingType: varchar({ length: 32 }),
        vehicleType: varchar({ length: 32 }),
        clientFirstName: varchar({ length: 128 }),
        clientLastName: varchar({ length: 128 }),
        clientEmail: varchar({ length: 320 }),
        clientPhone: varchar({ length: 64 }),
        clientNif: varchar({ length: 32 }),
        licensePlate: varchar({ length: 32 }),
        vehicleBrand: varchar({ length: 64 }),
        vehicleModel: varchar({ length: 64 }),
        vehicleColor: varchar({ length: 32 }),
        totalPrice: decimal({ precision: 10, scale: 2 }),
        currency: varchar({ length: 8 }).default("EUR"),
        parkId: varchar({ length: 128 }),
        parkName: varchar({ length: 128 }),
        city: varchar({ length: 64 }),
        projectId: int(),
        deliveryService: tinyint().default(0),
        deliveryAddress: varchar({ length: 256 }),
        pickupAddress: varchar({ length: 256 }),
        campaign: varchar({ length: 128 }),
        parkingPrice: decimal({ precision: 10, scale: 2 }),
        deliveryCharges: decimal({ precision: 10, scale: 2 }),
        extrasTotal: decimal({ precision: 10, scale: 2 }),
        discount: decimal({ precision: 10, scale: 2 }),
        remainingToPay: decimal({ precision: 10, scale: 2 }),
        arrivalFlight: varchar({ length: 32 }),
        departureFlight: varchar({ length: 32 }),
        deliveryType: varchar({ length: 64 }),
        returnFlight: varchar({ length: 32 }),
        departingFlight: varchar({ length: 32 }),
        remarks: varchar({ length: 512 }),
        enrichedAt: timestamp({ mode: "string" }),
        origin: varchar({ length: 64 }),
        originUrl: varchar({ length: 512 }),
        currentGarage: varchar({ length: 64 }),
        currentSpot: varchar({ length: 64 }),
        lastKnownMileage: int(),
        checkinAgentName: varchar({ length: 256 }),
        checkinAgentUserId: varchar({ length: 128 }),
        checkoutAgentName: varchar({ length: 256 }),
        checkoutAgentUserId: varchar({ length: 128 }),
        historyFetchedAt: timestamp({ mode: "string" }),
        spotType: mysqlEnum(["covered", "uncovered", "indoor", "unknown"]),
        parkBrand: varchar({ length: 16 }),
        paymentMethod: varchar({ length: 128 }),
        totalPaid: decimal({ precision: 10, scale: 2 }),
        pro: tinyint().default(0),
        partnerId: varchar({ length: 128 }),
        partnerName: varchar({ length: 256 }),
        campaignId: varchar({ length: 128 }),
        campaignName: varchar({ length: 256 }),
        cashValidatedByName: varchar({ length: 256 }),
        driverValidatedByName: varchar({ length: 256 }),
        cashierClosedByName: varchar({ length: 256 }),
        cancelledAt: timestamp({ mode: "string" }),
        cancelReason: text(),
        notes: text(),
        rawJson: text(),
        bookingCreatedAt: timestamp({ mode: "string" }),
        syncedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("multipark_bookings_externalId_unique").on(table.externalId)
      ]
    );
    multiparkBookingExtras = mysqlTable(
      "multipark_booking_extras",
      {
        id: int().autoincrement().primaryKey(),
        bookingExternalId: varchar({ length: 128 }).notNull(),
        extraId: varchar({ length: 128 }),
        name: varchar({ length: 256 }),
        description: varchar({ length: 512 }),
        price: decimal({ precision: 10, scale: 2 }),
        done: tinyint().default(0),
        syncedAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        index("idx_mp_booking_extras_booking").on(table.bookingExternalId)
      ]
    );
    multiparkDailySnapshots = mysqlTable("multipark_daily_snapshots", {
      id: int().autoincrement().primaryKey(),
      snapshotDate: timestamp({ mode: "string" }).notNull(),
      parkName: varchar({ length: 128 }).notNull(),
      city: varchar({ length: 64 }).notNull(),
      totalBookings: int().default(0).notNull(),
      reservedCount: int().default(0),
      checkinCount: int().default(0),
      checkoutCount: int().default(0),
      cancelledCount: int().default(0),
      totalRevenue: int().default(0).notNull(),
      parkingRevenue: int().default(0),
      deliveryRevenue: int().default(0),
      extrasRevenue: int().default(0),
      onlineCount: int().default(0),
      agentCount: int().default(0),
      externalCampaigns: text(),
      importSource: varchar({ length: 32 }).default("excel"),
      importedById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    multiparkSyncLogs = mysqlTable("multipark_sync_logs", {
      id: int().autoincrement().primaryKey(),
      syncType: varchar({ length: 64 }).notNull(),
      status: varchar({ length: 32 }).notNull(),
      recordsProcessed: int().default(0),
      recordsCreated: int().default(0),
      recordsUpdated: int().default(0),
      errorMessage: text(),
      triggeredById: int(),
      startedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      completedAt: timestamp({ mode: "string" })
    });
    partnershipInvoices = mysqlTable("partnership_invoices", {
      id: int().autoincrement().primaryKey(),
      partnershipId: int().notNull(),
      invoiceNumber: varchar({ length: 50 }),
      amount: int().default(0).notNull(),
      referenceMonth: int().notNull(),
      referenceYear: int().notNull(),
      invoiceStatus: mysqlEnum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
      sentAt: timestamp({ mode: "string" }),
      dueDate: timestamp({ mode: "string" }),
      paidAt: timestamp({ mode: "string" }),
      invoiceNotes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    partnershipTransactions = mysqlTable("partnership_transactions", {
      id: int().autoincrement().primaryKey(),
      partnershipId: int().notNull(),
      projectId: int(),
      transactionType: mysqlEnum(["booking", "commission", "payment", "adjustment"]).default("booking").notNull(),
      description: varchar({ length: 500 }),
      amount: int().default(0).notNull(),
      transactionDate: timestamp({ mode: "string" }).defaultNow().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    partnerships = mysqlTable("partnerships", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 255 }).notNull(),
      campaignKey: varchar({ length: 128 }),
      partnerType: varchar({ length: 64 }).default("other").notNull(),
      contactName: varchar({ length: 255 }),
      contactEmail: varchar({ length: 320 }),
      contactPhone: varchar({ length: 50 }),
      commissionRate: int().default(0),
      billingAgreement: text(),
      partnerStatus: mysqlEnum(["active", "inactive", "pending"]).default("active").notNull(),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      partnerNif: varchar("partner_nif", { length: 20 }),
      monthlyFee: int().default(0),
      multiparkPartnerId: varchar({ length: 128 })
    });
    multiparkBookingHistory = mysqlTable(
      "multipark_booking_history",
      {
        id: int().autoincrement().primaryKey(),
        bookingExternalId: varchar({ length: 128 }).notNull(),
        historyId: varchar({ length: 128 }).notNull(),
        changeType: varchar({ length: 32 }),
        actionTime: timestamp({ mode: "string" }),
        remarks: text(),
        agentName: varchar({ length: 256 }),
        agentUserId: varchar({ length: 128 }),
        agentEmail: varchar({ length: 320 }),
        modifiedFields: text(),
        platform: varchar({ length: 32 }),
        fetchedAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        uniqueIndex("uq_booking_history").on(table.bookingExternalId, table.historyId),
        index("idx_bh_booking").on(table.bookingExternalId),
        index("idx_bh_agent").on(table.agentUserId),
        index("idx_bh_actionTime").on(table.actionTime),
        index("idx_bh_changeType").on(table.changeType)
      ]
    );
    partnerAliases = mysqlTable(
      "partner_aliases",
      {
        id: int().autoincrement().primaryKey(),
        partnershipId: int().notNull(),
        aliasType: mysqlEnum(["multipark_partner_id", "payment_method"]).notNull(),
        aliasValue: varchar({ length: 128 }).notNull(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
      },
      (table) => [
        uniqueIndex("uq_alias").on(table.aliasType, table.aliasValue),
        index("idx_partner_aliases_partnership").on(table.partnershipId)
      ]
    );
    payslipHistory = mysqlTable("payslip_history", {
      id: int().autoincrement().primaryKey(),
      employeeId: int(),
      employeeName: varchar({ length: 255 }),
      year: int().notNull(),
      month: int().notNull(),
      payslipType: mysqlEnum("payslip_type", ["individual", "payroll", "timesheet"]).notNull(),
      url: text().notNull(),
      fileName: varchar({ length: 512 }),
      generatedById: int().notNull(),
      generatedByName: varchar({ length: 255 }),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    pdaCheckins = mysqlTable("pda_checkins", {
      id: int().autoincrement().primaryKey(),
      pdaId: int().notNull(),
      employeeId: int(),
      zelloUsername: varchar({ length: 255 }),
      teamLeaderId: int(),
      photoEntryUrl: text(),
      photoExitUrl: text(),
      mobileDataMbStart: int(),
      mobileDataMbEnd: int(),
      checkinAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      checkoutAt: timestamp({ mode: "string" }),
      checkinStatus: mysqlEnum("checkin_status", ["checked_in", "checked_out"]).default("checked_in").notNull(),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    pdas = mysqlTable("pdas", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 255 }).notNull(),
      phoneNumber: varchar({ length: 50 }),
      imei: varchar({ length: 50 }),
      model: varchar({ length: 255 }),
      status: mysqlEnum(["active", "inactive", "maintenance", "lost"]).default("active").notNull(),
      photoUrl: text(),
      simDataPlan: varchar({ length: 255 }),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    performanceEvaluations = mysqlTable("performance_evaluations", {
      id: int().autoincrement().primaryKey(),
      employeeId: int().notNull(),
      weekNumber: int().notNull(),
      yearNumber: int().notNull(),
      hoursWorked: int().default(0),
      movementsCount: int().default(0),
      movementsPerHour: int().default(0),
      speedAlerts: int().default(0),
      incidentsPositive: int().default(0),
      incidentsNegative: int().default(0),
      positivePoints: int().default(0),
      negativePoints: int().default(0),
      totalPoints: int().default(0),
      notes: text(),
      evaluatedBy: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    projectEmployees = mysqlTable("project_employees", {
      id: int().autoincrement().primaryKey(),
      projectId: int().notNull(),
      employeeId: int().notNull(),
      role: varchar({ length: 64 }).default("member"),
      assignedAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    projects = mysqlTable("projects", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 256 }).notNull(),
      description: text(),
      parentId: int(),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      level: mysqlEnum(["group", "brand", "city", "project"]).default("project").notNull(),
      color: varchar({ length: 16 }).default("#6366f1"),
      managerId: int(),
      budget: decimal({ precision: 12, scale: 2 }),
      partnerName: varchar({ length: 200 }),
      partnerPercent: decimal({ precision: 5, scale: 2 })
    });
    quizAttempts = mysqlTable("quiz_attempts", {
      id: int().autoincrement().primaryKey(),
      employeeId: int().notNull(),
      totalQuestions: int().notNull(),
      correctAnswers: int().notNull(),
      score: int().notNull(),
      timeSpentSeconds: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    quizQuestions = mysqlTable("quiz_questions", {
      id: int().autoincrement().primaryKey(),
      categoryId: int(),
      question: text().notNull(),
      optionA: text().notNull(),
      optionB: text().notNull(),
      optionC: text().notNull(),
      optionD: text().notNull(),
      correctOption: mysqlEnum(["A", "B", "C", "D"]).notNull(),
      explanation: text(),
      difficulty: mysqlEnum(["easy", "medium", "hard"]).default("medium").notNull(),
      points: int().default(10).notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    radioTranscriptions = mysqlTable("radio_transcriptions", {
      id: int().autoincrement().primaryKey(),
      audioUrl: text(),
      transcription: text(),
      summary: text(),
      employeeId: int(),
      vehicleId: int(),
      duration: int(),
      transcribedAt: timestamp({ mode: "string" }),
      createdById: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    schedules = mysqlTable("schedules", {
      id: int().autoincrement().primaryKey(),
      employeeId: int().notNull(),
      weekday: int().notNull(),
      startTime: varchar({ length: 8 }).notNull(),
      endTime: varchar({ length: 8 }).notNull(),
      isWorkDay: tinyint().default(1).notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    services = mysqlTable("services", {
      id: int().autoincrement().primaryKey(),
      projectId: int(),
      employeeId: int(),
      serviceType: mysqlEnum(["lavagem", "carregamento_eletrico", "valet_flex", "outro"]).default("lavagem").notNull(),
      clientName: varchar({ length: 255 }),
      vehiclePlate: varchar({ length: 20 }),
      bookingRef: varchar({ length: 100 }),
      revenue: int().default(0),
      cost: int().default(0),
      commission: int().default(0),
      notes: text(),
      serviceDate: timestamp({ mode: "string" }).defaultNow().notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    speedAlerts = mysqlTable("speed_alerts", {
      id: int().autoincrement().primaryKey(),
      vehicleId: int().notNull(),
      employeeId: int(),
      speed: int().notNull(),
      speedLimit: int().notNull(),
      latitude: decimal({ precision: 10, scale: 7 }),
      longitude: decimal({ precision: 10, scale: 7 }),
      roadName: varchar({ length: 255 }),
      acknowledged: tinyint().default(0),
      acknowledgedById: int(),
      acknowledgedAt: timestamp({ mode: "string" }),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    speedLimits = mysqlTable("speed_limits", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 255 }).notNull(),
      maxSpeed: int().notNull(),
      tolerancePercent: int().default(10).notNull(),
      isDefault: tinyint().default(0),
      isActive: tinyint().default(1),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    speedViolations = mysqlTable("speed_violations", {
      id: int().autoincrement().primaryKey(),
      zelloUsername: varchar({ length: 255 }).notNull(),
      displayName: varchar({ length: 255 }),
      speed: decimal({ precision: 8, scale: 2 }).notNull(),
      speedLimit: int().notNull(),
      excessPercent: decimal({ precision: 5, scale: 2 }).notNull(),
      latitude: decimal({ precision: 10, scale: 7 }),
      longitude: decimal({ precision: 10, scale: 7 }),
      heading: decimal({ precision: 6, scale: 2 }),
      notificationSent: tinyint().default(0),
      acknowledged: tinyint().default(0),
      acknowledgedById: int(),
      acknowledgedAt: timestamp({ mode: "string" }),
      notes: text(),
      occurredAt: timestamp({ mode: "string" }).notNull(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    taskAssignees = mysqlTable("task_assignees", {
      id: int().autoincrement().primaryKey(),
      taskId: int().notNull(),
      employeeId: int().notNull(),
      assignedAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    tasks = mysqlTable("tasks", {
      id: int().autoincrement().primaryKey(),
      title: varchar({ length: 256 }).notNull(),
      description: text(),
      projectId: int(),
      assigneeId: int(),
      createdById: int().notNull(),
      taskStatus: mysqlEnum(["backlog", "todo", "in_progress", "review", "done"]).default("todo").notNull(),
      taskPriority: mysqlEnum(["low", "medium", "high", "urgent"]).default("medium").notNull(),
      dueDate: timestamp({ mode: "string" }),
      completedAt: timestamp({ mode: "string" }),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      notifiedOverdue: tinyint().default(0),
      notifiedComplete: tinyint().default(0)
    });
    timeRecords = mysqlTable("time_records", {
      id: int().autoincrement().primaryKey(),
      employeeId: int().notNull(),
      type: mysqlEnum(["check_in", "check_out"]).notNull(),
      recordedAt: timestamp({ mode: "string" }).notNull(),
      photoUrl: text(),
      photoKey: varchar({ length: 512 }),
      latitude: decimal({ precision: 10, scale: 7 }),
      longitude: decimal({ precision: 10, scale: 7 }),
      locationName: varchar({ length: 256 }),
      hoursWorked: decimal({ precision: 6, scale: 2 }),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    trainingCategories = mysqlTable("training_categories", {
      id: int().autoincrement().primaryKey(),
      name: varchar({ length: 255 }).notNull(),
      description: text(),
      icon: varchar({ length: 50 }),
      sortOrder: int().default(0),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    trainingManuals = mysqlTable("training_manuals", {
      id: int().autoincrement().primaryKey(),
      categoryId: int(),
      title: varchar({ length: 255 }).notNull(),
      content: text().notNull(),
      type: mysqlEnum(["manual", "update", "news", "procedure"]).default("manual").notNull(),
      published: tinyint().default(1),
      createdBy: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
      fileUrl: text(),
      fileKey: text(),
      fileName: varchar({ length: 255 }),
      fileMimeType: varchar({ length: 100 })
    });
    trainingVideos = mysqlTable("training_videos", {
      id: int().autoincrement().primaryKey(),
      categoryId: int().notNull(),
      title: varchar({ length: 255 }).notNull(),
      description: text(),
      videoUrl: text().notNull(),
      thumbnailUrl: text(),
      durationMinutes: int(),
      sortOrder: int().default(0),
      createdBy: int(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    users = mysqlTable(
      "users",
      {
        id: int().autoincrement().primaryKey(),
        openId: varchar({ length: 64 }).notNull(),
        name: text(),
        email: varchar({ length: 320 }),
        loginMethod: varchar({ length: 64 }),
        role: mysqlEnum(["super_admin", "admin", "team_leader", "backoffice", "frontoffice", "supervisor", "extra", "user"]).default("user").notNull(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
        lastSignedIn: timestamp({ mode: "string" }).defaultNow().notNull(),
        department: varchar({ length: 128 }),
        isActive: tinyint().default(1).notNull()
      },
      (table) => [
        uniqueIndex("users_openId_unique").on(table.openId)
      ]
    );
    vehicleMovements = mysqlTable("vehicle_movements", {
      id: int().autoincrement().primaryKey(),
      vehicleId: int().notNull(),
      employeeId: int().notNull(),
      movementType: mysqlEnum(["pickup", "return"]).notNull(),
      kmReading: int(),
      latitude: decimal({ precision: 10, scale: 7 }),
      longitude: decimal({ precision: 10, scale: 7 }),
      notes: text(),
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull()
    });
    vehicles = mysqlTable(
      "vehicles",
      {
        id: int().autoincrement().primaryKey(),
        plate: varchar({ length: 20 }).notNull(),
        brand: varchar({ length: 100 }),
        model: varchar({ length: 100 }),
        year: int(),
        color: varchar({ length: 50 }),
        vehicleStatus: mysqlEnum(["active", "maintenance", "inactive"]).default("active").notNull(),
        projectId: int(),
        notes: text(),
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("vehicles_plate_unique").on(table.plate)
      ]
    );
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      multiparkApiKey: process.env.MULTIPARK_API_KEY ?? "",
      multiparkApiUrl: process.env.MULTIPARK_API_URL ?? "https://api.multipark.pt/api/v1/bookings-api",
      zelloApiKey: process.env.ZELLO_API_KEY ?? ""
    };
  }
});

// shared/partnerTypes.ts
var partnerTypes_exports = {};
__export(partnerTypes_exports, {
  PARTNER_TYPES: () => PARTNER_TYPES,
  PARTNER_TYPE_BY_ID: () => PARTNER_TYPE_BY_ID,
  getPartnerType: () => getPartnerType,
  parsePartnerConfig: () => parsePartnerConfig,
  partnerFormFields: () => partnerFormFields,
  serializePartnerConfig: () => serializePartnerConfig
});
function getPartnerType(id) {
  if (!id) return PARTNER_TYPE_BY_ID["outro"];
  return PARTNER_TYPE_BY_ID[id] ?? PARTNER_TYPE_BY_ID["outro"];
}
function partnerFormFields(typeId) {
  const cm = getPartnerType(typeId).chargeModel;
  return {
    commission: cm === "commission_on_revenue" || cm === "small_commission",
    invoiceTiming: cm === "commission_on_revenue" || cm === "monthly_invoice_discount",
    monthlyFee: cm === "monthly_fee" || cm === "yearly_fee",
    avencaDate: cm === "monthly_fee" || cm === "yearly_fee",
    discountApplied: cm === "prepaid_with_discount" || cm === "monthly_invoice_discount"
  };
}
function parsePartnerConfig(notes) {
  if (!notes) return {};
  const trimmed = notes.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}
function serializePartnerConfig(cfg, plainNotes = "") {
  const clean = {};
  if (Array.isArray(cfg.operatesProjects) && cfg.operatesProjects.length > 0) {
    clean.operatesProjects = cfg.operatesProjects.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  }
  if (typeof cfg.cashbackPercent === "number" && Number.isFinite(cfg.cashbackPercent)) {
    clean.cashbackPercent = cfg.cashbackPercent;
  }
  if (typeof cfg.prizeBudget === "number" && Number.isFinite(cfg.prizeBudget)) {
    clean.prizeBudget = cfg.prizeBudget;
  }
  if (typeof cfg.avencaDate === "string" && cfg.avencaDate.trim()) {
    clean.avencaDate = cfg.avencaDate.trim();
  }
  if (typeof cfg.invoiceDay === "number" && Number.isFinite(cfg.invoiceDay)) {
    clean.invoiceDay = cfg.invoiceDay;
  }
  if (Object.keys(clean).length === 0) return plainNotes;
  return JSON.stringify(clean);
}
var PARTNER_TYPES, PARTNER_TYPE_BY_ID;
var init_partnerTypes = __esm({
  "shared/partnerTypes.ts"() {
    "use strict";
    PARTNER_TYPES = [
      {
        id: "agregador",
        label: "Agregador",
        description: "Sites de venda (ex: Looking4Parking, Parkos). Recebem comiss\xE3o sobre a reserva.",
        chargeModel: "commission_on_revenue",
        appliesTo: "sale"
      },
      {
        id: "agencia_viagem",
        label: "Ag\xEAncia de viagem",
        description: "Ag\xEAncias que vendem o estacionamento como parte de um pacote.",
        chargeModel: "commission_on_revenue",
        appliesTo: "sale"
      },
      {
        id: "avenca_mensal",
        label: "Aven\xE7a mensal",
        description: "Valor fixo cobrado todos os meses. Definir em `monthlyFee` da parceria.",
        chargeModel: "monthly_fee",
        appliesTo: "sale"
      },
      {
        id: "avenca_anual",
        label: "Aven\xE7a anual",
        description: "Valor fixo cobrado uma vez por ano.",
        chargeModel: "yearly_fee",
        appliesTo: "sale"
      },
      {
        id: "cliente_pro",
        label: "Cliente Pro (Airpark)",
        description: "Empresas Pro \u2014 actualmente s\xF3 na marca Airpark. Faturam no fim do m\xEAs com desconto.",
        chargeModel: "monthly_invoice_discount",
        appliesTo: "sale"
      },
      {
        id: "hotel",
        label: "Hotel",
        description: "Parceria com hot\xE9is. Comiss\xE3o sobre a reserva trazida.",
        chargeModel: "commission_on_revenue",
        appliesTo: "sale"
      },
      {
        id: "companhia_aerea",
        label: "Companhia a\xE9rea",
        description: "Parceria com companhias a\xE9reas. Comiss\xE3o sobre a reserva.",
        chargeModel: "commission_on_revenue",
        appliesTo: "sale"
      },
      {
        id: "afiliado",
        label: "Afiliado",
        description: "Comiss\xE3o pequena. Cliente do afiliado tem desconto j\xE1 reflectido na fatura.",
        chargeModel: "small_commission",
        appliesTo: "sale"
      },
      {
        id: "enterprise",
        label: "Enterprise / Corporate",
        description: "Cliente corporate. Paga logo no acto. Desconto j\xE1 vem na reserva.",
        chargeModel: "prepaid_with_discount",
        appliesTo: "sale"
      },
      {
        id: "campanha_propria",
        label: "Campanha pr\xF3pria",
        description: "Promo\xE7\xF5es nossas com descontos, cashback ou pr\xE9mios \u2014 v\xE3o para o centro de custos.",
        chargeModel: "own_campaign",
        appliesTo: "sale"
      },
      {
        id: "operacional",
        label: "Operacional",
        description: "Parceiro que gere opera\xE7\xF5es (ex: Top Parking para marcas do Porto). Pagamos comiss\xE3o operacional.",
        chargeModel: "operational",
        appliesTo: "operational"
      },
      {
        id: "outro",
        label: "Outro",
        description: "Casos n\xE3o cobertos pelos tipos acima.",
        chargeModel: "manual",
        appliesTo: "both",
        isExtensible: true
      }
    ];
    PARTNER_TYPE_BY_ID = Object.fromEntries(
      PARTNER_TYPES.map((t2) => [t2.id, t2])
    );
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  acceptInviteToken: () => acceptInviteToken,
  acknowledgeGpsAlert: () => acknowledgeGpsAlert,
  acknowledgeSpeedAlert: () => acknowledgeSpeedAlert,
  acknowledgeSpeedViolation: () => acknowledgeSpeedViolation,
  addComplaintMessage: () => addComplaintMessage,
  addComplaintPhoto: () => addComplaintPhoto,
  addLostFoundMessage: () => addLostFoundMessage,
  addLostFoundPhoto: () => addLostFoundPhoto,
  addPartnerAlias: () => addPartnerAlias,
  aliasCountsByPartner: () => aliasCountsByPartner,
  assignEmployeeToProject: () => assignEmployeeToProject,
  checkExtraDocsCompliance: () => checkExtraDocsCompliance,
  checkoutPda: () => checkoutPda,
  clearPenalty: () => clearPenalty,
  createAnnualReport: () => createAnnualReport,
  createApiKey: () => createApiKey,
  createCampaign: () => createCampaign,
  createCareerExam: () => createCareerExam,
  createCareerExamQuestion: () => createCareerExamQuestion,
  createCategory: () => createCategory,
  createComplaint: () => createComplaint,
  createDailyDriverHistory: () => createDailyDriverHistory,
  createEmployee: () => createEmployee,
  createEmployeeDocument: () => createEmployeeDocument,
  createEmployeeDocumentsBatch: () => createEmployeeDocumentsBatch,
  createEmployeeLeave: () => createEmployeeLeave,
  createEmployeePenalty: () => createEmployeePenalty,
  createExpense: () => createExpense,
  createFAQ: () => createFAQ,
  createGoogleReview: () => createGoogleReview,
  createGpsAlert: () => createGpsAlert,
  createIncident: () => createIncident,
  createInviteToken: () => createInviteToken,
  createInvoice: () => createInvoice,
  createLostFoundItem: () => createLostFoundItem,
  createManualUser: () => createManualUser,
  createMarketingExpense: () => createMarketingExpense,
  createPartnership: () => createPartnership,
  createPartnershipInvoice: () => createPartnershipInvoice,
  createPartnershipTransaction: () => createPartnershipTransaction,
  createPda: () => createPda,
  createPdaCheckin: () => createPdaCheckin,
  createPerformanceEvaluation: () => createPerformanceEvaluation,
  createProject: () => createProject,
  createQuizQuestion: () => createQuizQuestion,
  createRadioTranscription: () => createRadioTranscription,
  createService: () => createService,
  createSpeedAlert: () => createSpeedAlert,
  createSpeedLimit: () => createSpeedLimit,
  createSyncLog: () => createSyncLog,
  createTask: () => createTask,
  createTimeRecord: () => createTimeRecord,
  createTrainingCategory: () => createTrainingCategory,
  createTrainingManual: () => createTrainingManual,
  createTrainingVideo: () => createTrainingVideo,
  createVehicle: () => createVehicle,
  createVehicleMovement: () => createVehicleMovement,
  deleteAnnualReport: () => deleteAnnualReport,
  deleteApiKey: () => deleteApiKey,
  deleteCampaign: () => deleteCampaign,
  deleteCareerExam: () => deleteCareerExam,
  deleteComplaint: () => deleteComplaint,
  deleteComplaintPhoto: () => deleteComplaintPhoto,
  deleteDailyStat: () => deleteDailyStat,
  deleteEmployee: () => deleteEmployee,
  deleteEmployeeDocument: () => deleteEmployeeDocument,
  deleteEmployeeLeave: () => deleteEmployeeLeave,
  deleteExpense: () => deleteExpense,
  deleteFAQ: () => deleteFAQ,
  deleteIncident: () => deleteIncident,
  deleteInvoice: () => deleteInvoice,
  deleteLostFoundItem: () => deleteLostFoundItem,
  deleteMarketingExpense: () => deleteMarketingExpense,
  deletePartnerAlias: () => deletePartnerAlias,
  deletePartnership: () => deletePartnership,
  deletePartnershipInvoice: () => deletePartnershipInvoice,
  deletePayslipRecord: () => deletePayslipRecord,
  deletePda: () => deletePda,
  deletePerformanceEvaluation: () => deletePerformanceEvaluation,
  deleteProject: () => deleteProject,
  deleteQuizQuestion: () => deleteQuizQuestion,
  deleteSchedule: () => deleteSchedule,
  deleteService: () => deleteService,
  deleteSnapshotsByDateRange: () => deleteSnapshotsByDateRange,
  deleteSpeedLimit: () => deleteSpeedLimit,
  deleteTask: () => deleteTask,
  deleteTrainingCategory: () => deleteTrainingCategory,
  deleteTrainingManual: () => deleteTrainingManual,
  deleteTrainingVideo: () => deleteTrainingVideo,
  deleteVehicle: () => deleteVehicle,
  diagnoseBilling: () => diagnoseBilling,
  generateAnnualSummary: () => generateAnnualSummary,
  generateWeeklyEvaluation: () => generateWeeklyEvaluation,
  getActiveCheckins: () => getActiveCheckins,
  getActivityLogs: () => getActivityLogs,
  getAgentHistoryFromDb: () => getAgentHistoryFromDb,
  getAllCategories: () => getAllCategories,
  getAllDailyStats: () => getAllDailyStats,
  getAllEmployees: () => getAllEmployees,
  getAllEmployeesDocumentStatus: () => getAllEmployeesDocumentStatus,
  getAllOpenPenaltiesByEmployee: () => getAllOpenPenaltiesByEmployee,
  getAllUsers: () => getAllUsers,
  getAnnualBreakdown: () => getAnnualBreakdown,
  getAnnualReports: () => getAnnualReports,
  getApiKeys: () => getApiKeys,
  getBillingData: () => getBillingData,
  getBookingHistoryByBookingId: () => getBookingHistoryByBookingId,
  getBookingHistoryByPlate: () => getBookingHistoryByPlate,
  getBookingHistoryCrossReference: () => getBookingHistoryCrossReference,
  getBookingHistoryDriverStats: () => getBookingHistoryDriverStats,
  getBookingRevenueByProject: () => getBookingRevenueByProject,
  getBookingsByCampaign: () => getBookingsByCampaign,
  getCampaignById: () => getCampaignById,
  getCampaignByNameAndPlatform: () => getCampaignByNameAndPlatform,
  getCampaignStats: () => getCampaignStats,
  getCampaigns: () => getCampaigns,
  getCareerExamAttempts: () => getCareerExamAttempts,
  getCareerExamQuestions: () => getCareerExamQuestions,
  getCareerExamQuestionsForPlayer: () => getCareerExamQuestionsForPlayer,
  getCareerExams: () => getCareerExams,
  getCheckinsByDate: () => getCheckinsByDate,
  getCheckinsByPda: () => getCheckinsByPda,
  getCheckoutDriversFromDb: () => getCheckoutDriversFromDb,
  getComplaintById: () => getComplaintById,
  getComplaintMessages: () => getComplaintMessages,
  getComplaintPhotos: () => getComplaintPhotos,
  getComplaintStats: () => getComplaintStats,
  getComplaints: () => getComplaints,
  getDailyDriverHistoryByDate: () => getDailyDriverHistoryByDate,
  getDailyDriverHistoryByUser: () => getDailyDriverHistoryByUser,
  getDailyDriverHistoryRange: () => getDailyDriverHistoryRange,
  getDailyDriverStats: () => getDailyDriverStats,
  getDailySnapshots: () => getDailySnapshots,
  getDb: () => getDb,
  getDefaultSpeedLimit: () => getDefaultSpeedLimit,
  getDocumentChecklistForEmployee: () => getDocumentChecklistForEmployee,
  getEmployeeById: () => getEmployeeById,
  getEmployeeByUserId: () => getEmployeeByUserId,
  getEmployeeDocuments: () => getEmployeeDocuments,
  getEmployeeLeaves: () => getEmployeeLeaves,
  getEmployeeProjects: () => getEmployeeProjects,
  getEmployeeSalaryAt: () => getEmployeeSalaryAt,
  getEmployeeSalaryHistory: () => getEmployeeSalaryHistory,
  getEmployeeSchedules: () => getEmployeeSchedules,
  getExistingStatsForCampaignAndDateRange: () => getExistingStatsForCampaignAndDateRange,
  getExpenseById: () => getExpenseById,
  getExpenseStats: () => getExpenseStats,
  getExpenses: () => getExpenses,
  getExtraRates: () => getExtraRates,
  getFAQs: () => getFAQs,
  getGoogleReviewById: () => getGoogleReviewById,
  getGoogleReviewStats: () => getGoogleReviewStats,
  getGoogleReviews: () => getGoogleReviews,
  getGpsAlertStats: () => getGpsAlertStats,
  getGpsAlerts: () => getGpsAlerts,
  getHRStats: () => getHRStats,
  getIncidentById: () => getIncidentById,
  getIncidentBySourceEmailId: () => getIncidentBySourceEmailId,
  getIncidentStats: () => getIncidentStats,
  getIncidents: () => getIncidents,
  getIncidentsByEmployee: () => getIncidentsByEmployee,
  getInviteByToken: () => getInviteByToken,
  getInvitesByEmail: () => getInvitesByEmail,
  getInvitesByUser: () => getInvitesByUser,
  getInvoiceById: () => getInvoiceById,
  getInvoiceStats: () => getInvoiceStats,
  getInvoices: () => getInvoices,
  getLastSyncSuccessAt: () => getLastSyncSuccessAt,
  getLeaveDaysForMonth: () => getLeaveDaysForMonth,
  getLocalBookingsByAction: () => getLocalBookingsByAction,
  getLostFoundDriverRanking: () => getLostFoundDriverRanking,
  getLostFoundItemById: () => getLostFoundItemById,
  getLostFoundItems: () => getLostFoundItems,
  getLostFoundMessages: () => getLostFoundMessages,
  getLostFoundPhotos: () => getLostFoundPhotos,
  getMarketingDashboardStats: () => getMarketingDashboardStats,
  getMarketingExpenses: () => getMarketingExpenses,
  getMonthlyHours: () => getMonthlyHours,
  getMultiparkBookingByExternalId: () => getMultiparkBookingByExternalId,
  getMultiparkBookingStats: () => getMultiparkBookingStats,
  getMultiparkBookings: () => getMultiparkBookings,
  getOpenPenalties: () => getOpenPenalties,
  getOperationalStats: () => getOperationalStats,
  getOverdueExpenses: () => getOverdueExpenses,
  getOverdueTasks: () => getOverdueTasks,
  getPartnerInvoicingDetailByType: () => getPartnerInvoicingDetailByType,
  getPartnerInvoicingSummary: () => getPartnerInvoicingSummary,
  getPartnershipAnalytics: () => getPartnershipAnalytics,
  getPartnershipById: () => getPartnershipById,
  getPartnershipDashboardStats: () => getPartnershipDashboardStats,
  getPartnershipInvoices: () => getPartnershipInvoices,
  getPartnershipTransactions: () => getPartnershipTransactions,
  getPartnerships: () => getPartnerships,
  getPayrollData: () => getPayrollData,
  getPayslipHistoryList: () => getPayslipHistoryList,
  getPdaById: () => getPdaById,
  getPerformanceEvaluations: () => getPerformanceEvaluations,
  getProjectById: () => getProjectById,
  getProjectCosts: () => getProjectCosts,
  getProjectEmployees: () => getProjectEmployees,
  getProjectHierarchyManagers: () => getProjectHierarchyManagers,
  getProjects: () => getProjects,
  getQuizQuestions: () => getQuizQuestions,
  getQuizQuestionsForPlayer: () => getQuizQuestionsForPlayer,
  getQuizRanking: () => getQuizRanking,
  getRadioTranscriptions: () => getRadioTranscriptions,
  getRecentlyCompletedTasks: () => getRecentlyCompletedTasks,
  getReviewBySourceEmailId: () => getReviewBySourceEmailId,
  getRhDashboardSummary: () => getRhDashboardSummary,
  getServiceStats: () => getServiceStats,
  getServices: () => getServices,
  getSnapshotKPIs: () => getSnapshotKPIs,
  getSpeedAlerts: () => getSpeedAlerts,
  getSpeedLimits: () => getSpeedLimits,
  getSpeedViolationStats: () => getSpeedViolationStats,
  getSpeedViolations: () => getSpeedViolations,
  getSuperAdmins: () => getSuperAdmins,
  getSyncLogs: () => getSyncLogs,
  getTaskAssignees: () => getTaskAssignees,
  getTaskById: () => getTaskById,
  getTaskStats: () => getTaskStats,
  getTasks: () => getTasks,
  getTasksWithAssignees: () => getTasksWithAssignees,
  getTimeRecords: () => getTimeRecords,
  getTrainingCategories: () => getTrainingCategories,
  getTrainingManuals: () => getTrainingManuals,
  getTrainingVideos: () => getTrainingVideos,
  getUpcomingPayments: () => getUpcomingPayments,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getVehicleAgentsByPlate: () => getVehicleAgentsByPlate,
  getVehicleById: () => getVehicleById,
  getVehicleDriverHistory: () => getVehicleDriverHistory,
  getVehicleMovements: () => getVehicleMovements,
  getVehicles: () => getVehicles,
  importBookingHistory: () => importBookingHistory,
  importDailyStats: () => importDailyStats,
  inferPartnersFromBookings: () => inferPartnersFromBookings,
  linkInviteToOAuthUser: () => linkInviteToOAuthUser,
  linkMultiparkPartnerId: () => linkMultiparkPartnerId,
  listPartnerAliases: () => listPartnerAliases,
  listPdas: () => listPdas,
  logActivity: () => logActivity,
  markOverdueExpenses: () => markOverdueExpenses,
  markOverduePartnershipInvoices: () => markOverduePartnershipInvoices,
  markTaskNotified: () => markTaskNotified,
  moveProject: () => moveProject,
  processExtraDiaNoShows: () => processExtraDiaNoShows,
  recordSpeedViolation: () => recordSpeedViolation,
  removeEmployeeFromProject: () => removeEmployeeFromProject,
  saveCareerExamAttempt: () => saveCareerExamAttempt,
  savePayslipRecord: () => savePayslipRecord,
  saveQuizAttempt: () => saveQuizAttempt,
  searchBookingByRef: () => searchBookingByRef,
  searchBookingHistory: () => searchBookingHistory,
  searchClientHistory: () => searchClientHistory,
  seedDefaultCategories: () => seedDefaultCategories,
  seedExtraRates: () => seedExtraRates,
  seedProjectHierarchy: () => seedProjectHierarchy,
  setTaskAssignees: () => setTaskAssignees,
  syncIncidentsFromMultiparkHistory: () => syncIncidentsFromMultiparkHistory,
  toggleApiKey: () => toggleApiKey,
  toggleUserActive: () => toggleUserActive,
  unblockEmployeeLogin: () => unblockEmployeeLogin,
  updateAnnualReport: () => updateAnnualReport,
  updateCampaign: () => updateCampaign,
  updateComplaint: () => updateComplaint,
  updateEmployee: () => updateEmployee,
  updateExpense: () => updateExpense,
  updateExtraRate: () => updateExtraRate,
  updateFAQ: () => updateFAQ,
  updateGoogleReview: () => updateGoogleReview,
  updateIncident: () => updateIncident,
  updateInvoice: () => updateInvoice,
  updateLostFoundItem: () => updateLostFoundItem,
  updateMarketingExpense: () => updateMarketingExpense,
  updatePartnership: () => updatePartnership,
  updatePartnershipInvoice: () => updatePartnershipInvoice,
  updatePda: () => updatePda,
  updatePerformanceEvaluation: () => updatePerformanceEvaluation,
  updateProject: () => updateProject,
  updateService: () => updateService,
  updateSpeedLimit: () => updateSpeedLimit,
  updateTask: () => updateTask,
  updateTrainingManual: () => updateTrainingManual,
  updateUser: () => updateUser,
  updateUserRole: () => updateUserRole,
  updateVehicle: () => updateVehicle,
  upsertBookingExtras: () => upsertBookingExtras,
  upsertDailySnapshot: () => upsertDailySnapshot,
  upsertMultiparkBooking: () => upsertMultiparkBooking,
  upsertSchedule: () => upsertSchedule,
  upsertUser: () => upsertUser
});
import { and, desc, eq, gte, lte, like, or, sql, aliasedTable, isNotNull, isNull, inArray, getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
function toMysqlDateTime(d) {
  if (d == null) return "";
  if (typeof d === "string") return d;
  return d.toISOString().slice(0, 19).replace("T", " ");
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db2 = await getDb();
  if (!db2) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    const value = user[field];
    if (value !== void 0) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.openId === ENV.ownerOpenId) {
    values.role = "super_admin";
    updateSet.role = "super_admin";
  } else if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  const nowMysql2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
  if (!values.lastSignedIn) values.lastSignedIn = nowMysql2;
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = nowMysql2;
  await db2.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getAllUsers() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(users).orderBy(desc(users.createdAt));
}
async function updateUserRole(userId, role) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(users).set({ role }).where(eq(users.id, userId));
}
async function getUserByEmail(email) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}
async function createManualUser(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const openId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db2.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department ?? null,
    loginMethod: "manual",
    isActive: 1
  });
  const result = await db2.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function updateUser(userId, data) {
  const db2 = await getDb();
  if (!db2) return;
  const updates = {};
  if (data.name !== void 0) updates.name = data.name;
  if (data.email !== void 0) updates.email = data.email;
  if (data.role !== void 0) updates.role = data.role;
  if (data.department !== void 0) updates.department = data.department;
  if (data.isActive !== void 0) updates.isActive = data.isActive ? 1 : 0;
  if (Object.keys(updates).length > 0) {
    await db2.update(users).set(updates).where(eq(users.id, userId));
  }
}
async function toggleUserActive(userId, isActive) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(users).set({ isActive: isActive ? 1 : 0 }).where(eq(users.id, userId));
}
async function getUserById(userId) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}
async function getSuperAdmins() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(users).where(eq(users.role, "super_admin"));
}
async function getAllCategories() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(expenseCategories).orderBy(expenseCategories.name);
}
async function createCategory(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(expenseCategories).values(data);
}
async function seedDefaultCategories() {
  const db2 = await getDb();
  if (!db2) return;
  const existing = await db2.select().from(expenseCategories).limit(1);
  if (existing.length > 0) {
    await db2.update(expenseCategories).set({ name: "Terminal" }).where(eq(expenseCategories.name, "Terminal de Pagamento"));
    for (const cat of [
      { name: "Bancos", department: "Financeiro", color: "#1d4ed8" },
      { name: "Impostos", department: "Financeiro", color: "#dc2626" },
      { name: "TI", department: "RH", color: "#0284c7" }
    ]) {
      const found = await db2.select().from(expenseCategories).where(eq(expenseCategories.name, cat.name)).limit(1);
      if (found.length === 0) await db2.insert(expenseCategories).values(cat);
    }
    return;
  }
  const defaults = [
    { name: "Combust\xEDvel", department: "Operacional", color: "#f59e0b" },
    { name: "Manuten\xE7\xE3o", department: "Operacional", color: "#10b981" },
    { name: "Marketing", department: "Marketing", color: "#8b5cf6" },
    { name: "Recursos Humanos", department: "RH", color: "#3b82f6" },
    { name: "Material de Escrit\xF3rio", department: "Administrativo", color: "#6366f1" },
    { name: "Alimenta\xE7\xE3o", department: "Geral", color: "#ec4899" },
    { name: "Transportes", department: "Operacional", color: "#14b8a6" },
    { name: "Tecnologia", department: "IT", color: "#0ea5e9" },
    { name: "Seguros", department: "Financeiro", color: "#f97316" },
    { name: "Rendas", department: "Financeiro", color: "#e11d48" },
    { name: "\xC1gua", department: "Instala\xE7\xF5es", color: "#06b6d4" },
    { name: "Eletricidade", department: "Instala\xE7\xF5es", color: "#eab308" },
    { name: "Telecomunica\xE7\xF5es", department: "Instala\xE7\xF5es", color: "#7c3aed" },
    { name: "Terminal", department: "Financeiro", color: "#059669" },
    { name: "Bancos", department: "Financeiro", color: "#1d4ed8" },
    { name: "Impostos", department: "Financeiro", color: "#dc2626" },
    { name: "TI", department: "RH", color: "#0284c7" },
    { name: "Despesas Operacionais", department: "Operacional", color: "#d97706" },
    { name: "Outros", department: "Geral", color: "#94a3b8" }
  ];
  await db2.insert(expenseCategories).values(defaults);
}
async function getExpenses(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.startDate) conditions.push(gte(expenses.expenseDate, toMysqlDateTime(filters.startDate)));
  if (filters.endDate) conditions.push(lte(expenses.expenseDate, toMysqlDateTime(filters.endDate)));
  if (filters.projectId) conditions.push(eq(expenses.projectId, filters.projectId));
  if (filters.categoryId) conditions.push(eq(expenses.categoryId, filters.categoryId));
  if (filters.userId) conditions.push(eq(expenses.insertedById, filters.userId));
  if (filters.status) conditions.push(eq(expenses.status, filters.status));
  if (filters.search) {
    conditions.push(
      or(
        like(expenses.supplier, `%${filters.search}%`),
        like(expenses.description, `%${filters.search}%`)
      )
    );
  }
  const query = db2.select({
    expense: expenses,
    category: expenseCategories,
    project: projects,
    insertedBy: users,
    buyer: buyerEmployees
  }).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(users, eq(expenses.insertedById, users.id)).leftJoin(buyerEmployees, eq(expenses.buyerId, buyerEmployees.id)).orderBy(desc(expenses.expenseDate));
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}
async function getExpenseById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select({
    expense: expenses,
    category: expenseCategories,
    project: projects,
    insertedBy: users,
    buyer: buyerEmployees
  }).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(users, eq(expenses.insertedById, users.id)).leftJoin(buyerEmployees, eq(expenses.buyerId, buyerEmployees.id)).where(eq(expenses.id, id)).limit(1);
  return result[0];
}
async function createExpense(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const result = await db2.insert(expenses).values(data);
  return result;
}
async function updateExpense(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(expenses).set(data).where(eq(expenses.id, id));
}
async function deleteExpense(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(expenses).where(eq(expenses.id, id));
}
async function getExpenseStats() {
  const db2 = await getDb();
  if (!db2) return null;
  const now = /* @__PURE__ */ new Date();
  const startOfDay2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [daily, weekly, monthly, yearly, byCategory, byProject, byUser, pending, overdue] = await Promise.all([
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, toMysqlDateTime(startOfDay2))),
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, toMysqlDateTime(startOfWeek))),
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, toMysqlDateTime(startOfMonth))),
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, toMysqlDateTime(startOfYear))),
    db2.select({
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      color: expenseCategories.color,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(gte(expenses.expenseDate, toMysqlDateTime(startOfMonth))).groupBy(expenses.categoryId, expenseCategories.name, expenseCategories.color).orderBy(desc(sql`SUM(expenses.amount)`)).limit(8),
    db2.select({
      projectId: expenses.projectId,
      projectName: projects.name,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).where(gte(expenses.expenseDate, toMysqlDateTime(startOfMonth))).groupBy(expenses.projectId, projects.name).orderBy(desc(sql`SUM(expenses.amount)`)).limit(5),
    db2.select({
      userId: expenses.insertedById,
      userName: users.name,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).where(gte(expenses.expenseDate, toMysqlDateTime(startOfMonth))).groupBy(expenses.insertedById, users.name).orderBy(desc(sql`SUM(expenses.amount)`)).limit(5),
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(eq(expenses.status, "pending")),
    db2.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(eq(expenses.status, "overdue"))
  ]);
  const monthlyTrend = await db2.select({
    month: sql`DATE_FORMAT(expenseDate, '%Y-%m')`,
    total: sql`COALESCE(SUM(amount), 0)`,
    count: sql`COUNT(*)`
  }).from(expenses).where(gte(expenses.expenseDate, toMysqlDateTime(new Date(now.getFullYear(), now.getMonth() - 5, 1)))).groupBy(sql`DATE_FORMAT(expenseDate, '%Y-%m')`).orderBy(sql`DATE_FORMAT(expenseDate, '%Y-%m')`);
  return {
    daily: { total: parseFloat(daily[0]?.total || "0"), count: daily[0]?.count || 0 },
    weekly: { total: parseFloat(weekly[0]?.total || "0"), count: weekly[0]?.count || 0 },
    monthly: { total: parseFloat(monthly[0]?.total || "0"), count: monthly[0]?.count || 0 },
    yearly: { total: parseFloat(yearly[0]?.total || "0"), count: yearly[0]?.count || 0 },
    byCategory: byCategory.map((c) => ({ ...c, total: parseFloat(c.total || "0") })),
    byProject: byProject.map((p) => ({ ...p, total: parseFloat(p.total || "0") })),
    byUser: byUser.map((u) => ({ ...u, total: parseFloat(u.total || "0") })),
    pending: { total: parseFloat(pending[0]?.total || "0"), count: pending[0]?.count || 0 },
    overdue: { total: parseFloat(overdue[0]?.total || "0"), count: overdue[0]?.count || 0 },
    monthlyTrend: monthlyTrend.map((m) => ({ ...m, total: parseFloat(m.total || "0") }))
  };
}
async function getUpcomingPayments(daysAhead = 7) {
  const db2 = await getDb();
  if (!db2) return [];
  const now = /* @__PURE__ */ new Date();
  const future = /* @__PURE__ */ new Date();
  future.setDate(future.getDate() + daysAhead);
  return db2.select({
    expense: expenses,
    insertedBy: users,
    project: projects
  }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).leftJoin(projects, eq(expenses.projectId, projects.id)).where(
    and(
      eq(expenses.status, "pending"),
      gte(expenses.paymentDueDate, toMysqlDateTime(now)),
      lte(expenses.paymentDueDate, toMysqlDateTime(future))
    )
  ).orderBy(expenses.paymentDueDate);
}
async function getOverdueExpenses() {
  const db2 = await getDb();
  if (!db2) return [];
  const now = /* @__PURE__ */ new Date();
  return db2.select({ expense: expenses, insertedBy: users }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).where(and(eq(expenses.status, "pending"), lte(expenses.paymentDueDate, toMysqlDateTime(now))));
}
async function markOverdueExpenses() {
  const db2 = await getDb();
  if (!db2) return;
  const now = /* @__PURE__ */ new Date();
  await db2.update(expenses).set({ status: "overdue" }).where(and(eq(expenses.status, "pending"), lte(expenses.paymentDueDate, toMysqlDateTime(now))));
}
async function logActivity(data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(activityLogs).values(data);
}
async function getActivityLogs(limit = 100, filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conds = [];
  if (filters.entity) conds.push(eq(activityLogs.entity, filters.entity));
  if (filters.action) conds.push(eq(activityLogs.action, filters.action));
  if (filters.userId) conds.push(eq(activityLogs.userId, filters.userId));
  return db2.select({ log: activityLogs, user: users }).from(activityLogs).leftJoin(users, eq(activityLogs.userId, users.id)).where(conds.length > 0 ? and(...conds) : void 0).orderBy(desc(activityLogs.createdAt)).limit(Math.min(Math.max(limit, 1), 2e3));
}
async function getAllEmployees(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.isActive !== void 0) conditions.push(eq(employees.isActive, filters.isActive ? 1 : 0));
  if (filters.position) conditions.push(eq(employees.position, filters.position));
  const q = db2.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).orderBy(employees.fullName);
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function getEmployeeById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.id, id)).limit(1);
  return result[0];
}
async function getEmployeeByUserId(userId) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.userId, userId)).limit(1);
  return result[0];
}
async function createEmployee(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  return db2.insert(employees).values(data);
}
async function updateEmployee(id, data, changedById) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  if (data.monthlySalary !== void 0 || data.mealAllowancePerDay !== void 0) {
    const [current] = await db2.select({ monthlySalary: employees.monthlySalary, mealAllowancePerDay: employees.mealAllowancePerDay }).from(employees).where(eq(employees.id, id)).limit(1);
    const newSalary = data.monthlySalary !== void 0 ? data.monthlySalary : current?.monthlySalary;
    const newMeal = data.mealAllowancePerDay !== void 0 ? data.mealAllowancePerDay : current?.mealAllowancePerDay;
    const changed = String(current?.monthlySalary ?? "") !== String(newSalary ?? "") || String(current?.mealAllowancePerDay ?? "") !== String(newMeal ?? "");
    if (changed) {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      await db2.update(employeeSalaryHistory).set({ effectiveUntil: yesterday }).where(and(eq(employeeSalaryHistory.employeeId, id), isNull(employeeSalaryHistory.effectiveUntil)));
      await db2.insert(employeeSalaryHistory).values({
        employeeId: id,
        monthlySalary: newSalary ?? null,
        mealAllowancePerDay: newMeal ?? null,
        effectiveFrom: today,
        changedById: changedById ?? null
      });
    }
  }
  await db2.update(employees).set(data).where(eq(employees.id, id));
}
async function getEmployeeSalaryAt(employeeId, dateStr) {
  const db2 = await getDb();
  if (!db2) return null;
  const [hist] = await db2.select().from(employeeSalaryHistory).where(and(
    eq(employeeSalaryHistory.employeeId, employeeId),
    lte(employeeSalaryHistory.effectiveFrom, dateStr),
    or(
      isNull(employeeSalaryHistory.effectiveUntil),
      gte(employeeSalaryHistory.effectiveUntil, dateStr)
    )
  )).orderBy(desc(employeeSalaryHistory.effectiveFrom)).limit(1);
  if (hist) return { monthlySalary: hist.monthlySalary, mealAllowancePerDay: hist.mealAllowancePerDay };
  const [emp] = await db2.select({ monthlySalary: employees.monthlySalary, mealAllowancePerDay: employees.mealAllowancePerDay }).from(employees).where(eq(employees.id, employeeId)).limit(1);
  return emp ?? null;
}
async function getEmployeeSalaryHistory(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(employeeSalaryHistory).where(eq(employeeSalaryHistory.employeeId, employeeId)).orderBy(desc(employeeSalaryHistory.effectiveFrom));
}
async function createEmployeeLeave(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(employeeLeaves).values({
    employeeId: data.employeeId,
    leaveType: data.leaveType,
    fromDate: data.fromDate,
    toDate: data.toDate,
    notes: data.notes ?? null,
    createdById: data.createdById ?? null
  });
}
async function getEmployeeLeaves(employeeId, year) {
  const db2 = await getDb();
  if (!db2) return [];
  const conds = [eq(employeeLeaves.employeeId, employeeId)];
  if (year) {
    conds.push(gte(employeeLeaves.toDate, `${year}-01-01`));
    conds.push(lte(employeeLeaves.fromDate, `${year}-12-31`));
  }
  return db2.select().from(employeeLeaves).where(and(...conds)).orderBy(desc(employeeLeaves.fromDate));
}
async function deleteEmployeeLeave(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(employeeLeaves).where(eq(employeeLeaves.id, id));
}
async function getLeaveDaysForMonth(employeeId, year, month) {
  const db2 = await getDb();
  const out = /* @__PURE__ */ new Set();
  if (!db2) return out;
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const rows = await db2.select({ fromDate: employeeLeaves.fromDate, toDate: employeeLeaves.toDate }).from(employeeLeaves).where(and(
    eq(employeeLeaves.employeeId, employeeId),
    lte(employeeLeaves.fromDate, end),
    gte(employeeLeaves.toDate, start)
  ));
  for (const r of rows) {
    const from = r.fromDate < start ? start : r.fromDate;
    const to = r.toDate > end ? end : r.toDate;
    const d = /* @__PURE__ */ new Date(from + "T00:00:00");
    const limit = /* @__PURE__ */ new Date(to + "T00:00:00");
    while (d <= limit) {
      out.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  }
  return out;
}
async function createEmployeePenalty(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(employeePenalties).values({
    employeeId: data.employeeId,
    reason: data.reason,
    severity: data.severity ?? "penalty",
    points: data.points ?? 1,
    relatedId: data.relatedId ?? null,
    notes: data.notes ?? null
  });
}
async function getOpenPenalties(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(employeePenalties).where(and(eq(employeePenalties.employeeId, employeeId), isNull(employeePenalties.clearedAt))).orderBy(desc(employeePenalties.createdAt));
}
async function getAllOpenPenaltiesByEmployee() {
  const db2 = await getDb();
  if (!db2) return /* @__PURE__ */ new Map();
  const rows = await db2.select({
    employeeId: employeePenalties.employeeId,
    totalPoints: sql`COALESCE(SUM(${employeePenalties.points}), 0)`
  }).from(employeePenalties).where(isNull(employeePenalties.clearedAt)).groupBy(employeePenalties.employeeId);
  return new Map(rows.map((r) => [r.employeeId, Number(r.totalPoints)]));
}
async function clearPenalty(id, clearedById) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(employeePenalties).set({ clearedAt: toMysqlDateTime(/* @__PURE__ */ new Date()), clearedById }).where(eq(employeePenalties.id, id));
}
async function unblockEmployeeLogin(employeeId, clearedById) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(employees).set({ loginBlocked: 0, loginBlockedReason: null, docsWarningAt: null }).where(eq(employees.id, employeeId));
  await logActivity({
    userId: clearedById,
    action: "unblock",
    entity: "employee",
    entityId: employeeId,
    details: "Login desbloqueado"
  });
}
async function checkExtraDocsCompliance(employeeId) {
  const db2 = await getDb();
  if (!db2) return null;
  const [emp] = await db2.select({
    id: employees.id,
    position: employees.position,
    contractStart: employees.contractStart,
    createdAt: employees.createdAt,
    loginBlocked: employees.loginBlocked,
    docsWarningAt: employees.docsWarningAt
  }).from(employees).where(eq(employees.id, employeeId)).limit(1);
  if (!emp || emp.position !== "extra") return null;
  const startDate = new Date(emp.contractStart ?? emp.createdAt ?? /* @__PURE__ */ new Date());
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / 864e5);
  const checklist = await getDocumentChecklistForEmployee(employeeId);
  const missingDocs = checklist.filter((c) => !c.present).map((c) => c.docType);
  if (missingDocs.length === 0) {
    if (emp.loginBlocked || emp.docsWarningAt) {
      await db2.update(employees).set({ loginBlocked: 0, loginBlockedReason: null, docsWarningAt: null }).where(eq(employees.id, employeeId));
    }
    return { blocked: false, warning: false, missingDocs: [], daysSinceStart };
  }
  if (daysSinceStart >= 21) {
    if (!emp.loginBlocked) {
      await db2.update(employees).set({
        loginBlocked: 1,
        loginBlockedReason: `Documentos obrigat\xF3rios em falta h\xE1 ${daysSinceStart} dias: ${missingDocs.join(", ")}`
      }).where(eq(employees.id, employeeId));
    }
    return { blocked: true, warning: true, missingDocs, daysSinceStart };
  }
  if (daysSinceStart >= 14 && !emp.docsWarningAt) {
    await db2.update(employees).set({ docsWarningAt: toMysqlDateTime(/* @__PURE__ */ new Date()) }).where(eq(employees.id, employeeId));
    return { blocked: false, warning: true, missingDocs, daysSinceStart };
  }
  return {
    blocked: Boolean(emp.loginBlocked),
    warning: Boolean(emp.docsWarningAt),
    missingDocs,
    daysSinceStart
  };
}
async function getRhDashboardSummary(year, month, monthsLookback = 3) {
  const db2 = await getDb();
  if (!db2) return [];
  const currentPayroll = await getPayrollData(year, month);
  const lookback = [];
  for (let i = 1; i <= monthsLookback; i++) {
    let m = month - i;
    let y = year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    lookback.push({ year: y, month: m });
  }
  const previousMonths = await Promise.all(
    lookback.map(({ year: y, month: m }) => getPayrollData(y, m).then((rows) => ({ y, m, rows })))
  );
  const penaltiesByEmp = await getAllOpenPenaltiesByEmployee();
  const out = [];
  for (const row of currentPayroll) {
    const empId = row.employeeId;
    const history = previousMonths.map(({ y, m, rows }) => {
      const r = rows.find((x) => x.employeeId === empId);
      return {
        year: y,
        month: m,
        totalHours: r?.totalHours ?? 0,
        totalPayment: r?.totalPayment ?? 0,
        netEstimate: r?.netEstimate ?? 0
      };
    });
    const totalReceived = history.reduce((s, h2) => s + h2.totalPayment, 0);
    const totalHoursLookback = history.reduce((s, h2) => s + h2.totalHours, 0);
    const avgPerHour = totalHoursLookback > 0 ? totalReceived / totalHoursLookback : 0;
    const openPoints = penaltiesByEmp.get(empId) ?? 0;
    out.push({
      employeeId: empId,
      fullName: row.fullName,
      position: row.position,
      isExtra: row.isExtra,
      department: row.department,
      projectName: row.projectName,
      currentMonth: {
        totalHours: row.totalHours,
        daysWorked: row.daysWorked,
        totalPayment: row.totalPayment,
        netEstimate: row.netEstimate
      },
      history,
      totalReceivedLookback: Math.round(totalReceived * 100) / 100,
      avgPerHourLookback: Math.round(avgPerHour * 100) / 100,
      openPenaltyPoints: openPoints,
      severity: openPoints >= 3 ? "red" : openPoints >= 1 ? "yellow" : "ok"
    });
  }
  return out;
}
async function processExtraDiaNoShows(dateStr) {
  const db2 = await getDb();
  if (!db2) return { scanned: 0, created: 0, blocked: [] };
  const rows = await db2.select({
    id: extrasDiaAssignments.id,
    employeeId: extrasDiaAssignments.employeeId,
    personName: extrasDiaAssignments.personName
  }).from(extrasDiaAssignments).where(
    and(
      eq(extrasDiaAssignments.assignmentDate, dateStr),
      eq(extrasDiaAssignments.isTeamLeader, 0),
      isNotNull(extrasDiaAssignments.employeeId)
    )
  );
  let created = 0;
  const affected = /* @__PURE__ */ new Set();
  for (const r of rows) {
    if (r.employeeId == null) continue;
    const [existing] = await db2.select({ id: employeePenalties.id }).from(employeePenalties).where(and(
      eq(employeePenalties.employeeId, r.employeeId),
      eq(employeePenalties.reason, "no_show_extra_dia"),
      eq(employeePenalties.relatedId, r.id)
    )).limit(1);
    if (existing) continue;
    const start = /* @__PURE__ */ new Date(`${dateStr}T00:00:00`);
    const end = /* @__PURE__ */ new Date(`${dateStr}T23:59:59`);
    const checkIns = await db2.select({ id: timeRecords.id }).from(timeRecords).where(and(
      eq(timeRecords.employeeId, r.employeeId),
      eq(timeRecords.type, "check_in"),
      gte(timeRecords.recordedAt, toMysqlDateTime(start)),
      lte(timeRecords.recordedAt, toMysqlDateTime(end))
    )).limit(1);
    if (checkIns.length > 0) continue;
    await db2.insert(employeePenalties).values({
      employeeId: r.employeeId,
      reason: "no_show_extra_dia",
      severity: "penalty",
      points: 1,
      relatedId: r.id,
      notes: `Faltou ao extras-dia em ${dateStr} (${r.personName})`
    });
    created += 1;
    affected.add(r.employeeId);
  }
  const blocked = [];
  for (const empId of affected) {
    const [agg] = await db2.select({ total: sql`COALESCE(SUM(${employeePenalties.points}), 0)` }).from(employeePenalties).where(and(eq(employeePenalties.employeeId, empId), isNull(employeePenalties.clearedAt)));
    const points = Number(agg?.total ?? 0);
    if (points >= 3) {
      await db2.update(employees).set({
        loginBlocked: 1,
        loginBlockedReason: `${points} faltas em extras-dia sem aviso. Contacta o supervisor.`
      }).where(eq(employees.id, empId));
      blocked.push(empId);
    }
  }
  return { scanned: rows.length, created, blocked };
}
async function deleteEmployee(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(employees).set({ isActive: 0 }).where(eq(employees.id, id));
}
async function getEmployeeDocuments(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId)).orderBy(desc(employeeDocuments.createdAt));
}
async function createEmployeeDocument(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  return db2.insert(employeeDocuments).values(data);
}
async function createEmployeeDocumentsBatch(docs) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  if (docs.length === 0) return;
  return db2.insert(employeeDocuments).values(docs);
}
async function deleteEmployeeDocument(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(employeeDocuments).where(eq(employeeDocuments.id, id));
}
async function getDocumentChecklistForEmployee(employeeId) {
  const docs = await getEmployeeDocuments(employeeId);
  const MANDATORY_TYPES = [
    "photo",
    "id_card",
    "driving_license",
    "nib_proof",
    "address_proof",
    "contract",
    "responsibility_term"
  ];
  const existing = new Set(docs.map((d) => d.docType));
  return MANDATORY_TYPES.map((t2) => ({ docType: t2, present: existing.has(t2) }));
}
async function getAllEmployeesDocumentStatus() {
  const db2 = await getDb();
  if (!db2) return [];
  const docs = await db2.select({
    employeeId: employeeDocuments.employeeId,
    docType: employeeDocuments.docType
  }).from(employeeDocuments);
  const map = /* @__PURE__ */ new Map();
  for (const d of docs) {
    if (!map.has(d.employeeId)) map.set(d.employeeId, /* @__PURE__ */ new Set());
    map.get(d.employeeId).add(d.docType);
  }
  return map;
}
async function getEmployeeSchedules(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(schedules).where(eq(schedules.employeeId, employeeId)).orderBy(schedules.weekday);
}
async function deleteSchedule(employeeId, weekday) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(schedules).where(and(eq(schedules.employeeId, employeeId), eq(schedules.weekday, weekday)));
}
async function upsertSchedule(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [existing] = await db2.select({ id: schedules.id }).from(schedules).where(and(eq(schedules.employeeId, data.employeeId), eq(schedules.weekday, data.weekday))).limit(1);
  if (existing) {
    await db2.update(schedules).set({ startTime: data.startTime, endTime: data.endTime, isWorkDay: data.isWorkDay }).where(eq(schedules.id, existing.id));
    return;
  }
  await db2.insert(schedules).values(data);
}
async function getTimeRecords(employeeId, startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [eq(timeRecords.employeeId, employeeId)];
  if (startDate) conditions.push(gte(timeRecords.recordedAt, toMysqlDateTime(startDate)));
  if (endDate) conditions.push(lte(timeRecords.recordedAt, toMysqlDateTime(endDate)));
  return db2.select().from(timeRecords).where(and(...conditions)).orderBy(desc(timeRecords.recordedAt));
}
async function createTimeRecord(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  return db2.insert(timeRecords).values(data);
}
async function getMonthlyHours(employeeId, year, month) {
  const db2 = await getDb();
  if (!db2) return { totalHours: 0, records: [] };
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await db2.select().from(timeRecords).where(and(eq(timeRecords.employeeId, employeeId), gte(timeRecords.recordedAt, toMysqlDateTime(start)), lte(timeRecords.recordedAt, toMysqlDateTime(end)))).orderBy(timeRecords.recordedAt);
  const totalHours = records.reduce((sum, r) => sum + parseFloat(String(r.hoursWorked ?? 0)), 0);
  return { totalHours, records };
}
async function getExtraRates() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(extraRates).orderBy(extraRates.level);
}
async function seedExtraRates() {
  const db2 = await getDb();
  if (!db2) return;
  const existing = await db2.select().from(extraRates).limit(1);
  if (existing.length > 0) return;
  const defaults = [
    { level: 1, hourlyRate: "8.50", label: "Extra N\xEDvel 1" },
    { level: 2, hourlyRate: "7.00", label: "Extra N\xEDvel 2" },
    { level: 3, hourlyRate: "6.00", label: "Extra N\xEDvel 3" },
    { level: 4, hourlyRate: "5.00", label: "Extra N\xEDvel 4" },
    { level: 5, hourlyRate: "4.00", label: "Extra N\xEDvel 5" }
  ];
  await db2.insert(extraRates).values(defaults);
}
async function updateExtraRate(level, hourlyRate) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(extraRates).set({ hourlyRate }).where(eq(extraRates.level, level));
}
async function getHRStats() {
  const db2 = await getDb();
  if (!db2) return null;
  const [total] = await db2.select({ count: sql`count(*)` }).from(employees).where(eq(employees.isActive, 1));
  const [extras] = await db2.select({ count: sql`count(*)` }).from(employees).where(and(eq(employees.isActive, 1), eq(employees.position, "extra")));
  const [permanent] = await db2.select({ count: sql`count(*)` }).from(employees).where(and(eq(employees.isActive, 1), eq(employees.contractType, "permanent")));
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [hoursRow] = await db2.select({ total: sql`COALESCE(SUM(${timeRecords.hoursWorked}), 0)` }).from(timeRecords).where(gte(timeRecords.recordedAt, toMysqlDateTime(monthStart)));
  return {
    totalActive: total?.count ?? 0,
    totalExtras: extras?.count ?? 0,
    totalPermanent: permanent?.count ?? 0,
    monthlyHours: parseFloat(String(hoursRow?.total ?? 0))
  };
}
async function getProjects() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(projects).orderBy(projects.name);
}
async function getProjectById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const rows = await db2.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}
async function createProject(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(projects).values(data);
}
async function updateProject(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(projects).set(data).where(eq(projects.id, id));
}
async function deleteProject(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(projects).where(eq(projects.parentId, id));
  await db2.delete(projects).where(eq(projects.id, id));
}
async function seedProjectHierarchy() {
  const db2 = await getDb();
  if (!db2) return;
  const existing = await db2.select().from(projects).where(and(eq(projects.name, "Multipark"), eq(projects.level, "group"))).limit(1);
  if (existing.length > 0) return;
  const [group] = await db2.insert(projects).values({
    name: "Multipark",
    level: "group",
    color: "#6366f1"
  }).$returningId();
  const cityCfg = [
    { name: "Lisboa", color: "#3b82f6" },
    { name: "Porto", color: "#10b981" },
    { name: "Faro", color: "#f59e0b" }
  ];
  const cityIds = {};
  for (const c of cityCfg) {
    const [row] = await db2.insert(projects).values({
      name: c.name,
      level: "city",
      parentId: group.id,
      color: c.color
    }).$returningId();
    cityIds[c.name] = row.id;
  }
  const brandCfg = [
    { name: "Airpark", cities: ["Lisboa", "Porto", "Faro"], color: "#ef4444" },
    { name: "Redpark", cities: ["Lisboa", "Porto", "Faro"], color: "#e11d48" },
    { name: "Skypark", cities: ["Lisboa", "Porto", "Faro"], color: "#8b5cf6" }
  ];
  const brandIds = {};
  for (const b of brandCfg) {
    for (const city of b.cities) {
      const [row] = await db2.insert(projects).values({
        name: b.name,
        level: "brand",
        parentId: cityIds[city],
        color: b.color
      }).$returningId();
      brandIds[`${b.name}:${city}`] = row.id;
    }
  }
  const parkCfg = [
    { name: "Airpark Lisboa", city: "Lisboa", brand: "Airpark", color: "#ef4444" },
    { name: "Redpark Lisboa", city: "Lisboa", brand: "Redpark", color: "#e11d48" },
    { name: "Skypark Lisboa", city: "Lisboa", brand: "Skypark", color: "#8b5cf6" },
    { name: "Lispark Lisboa", city: "Lisboa", color: "#ec4899" },
    // sem marca
    { name: "Top-Parking Lisboa", city: "Lisboa", color: "#14b8a6" },
    // sem marca
    { name: "Airpark Porto", city: "Porto", brand: "Airpark", color: "#ef4444" },
    { name: "Redpark Porto", city: "Porto", brand: "Redpark", color: "#e11d48" },
    { name: "Skypark Porto", city: "Porto", brand: "Skypark", color: "#8b5cf6" },
    { name: "Airpark Faro", city: "Faro", brand: "Airpark", color: "#ef4444" },
    { name: "Redpark Faro", city: "Faro", brand: "Redpark", color: "#e11d48" },
    { name: "Skypark Faro", city: "Faro", brand: "Skypark", color: "#8b5cf6" }
  ];
  for (const p of parkCfg) {
    const parentId = p.brand ? brandIds[`${p.brand}:${p.city}`] : cityIds[p.city];
    await db2.insert(projects).values({
      name: p.name,
      level: "project",
      parentId,
      color: p.color
    });
  }
  console.log("[Seed] Hierarchy created: Multipark \u2192 3 cities \u2192 brands \u2192 10 parks");
}
async function moveProject(id, newParentId) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  if (newParentId === id) throw new Error("N\xE3o pode mover para si pr\xF3prio");
  if (newParentId !== null) {
    let current = newParentId;
    while (current) {
      const [parent] = await db2.select({ id: projects.id, parentId: projects.parentId }).from(projects).where(eq(projects.id, current)).limit(1);
      if (!parent) break;
      if (parent.parentId === id) throw new Error("N\xE3o pode mover para um descendente");
      current = parent.parentId;
    }
  }
  await db2.update(projects).set({ parentId: newParentId }).where(eq(projects.id, id));
}
async function getProjectEmployees(projectId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(projectEmployees).where(eq(projectEmployees.projectId, projectId));
}
async function getEmployeeProjects(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(projectEmployees).where(eq(projectEmployees.employeeId, employeeId));
}
async function assignEmployeeToProject(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(projectEmployees).values(data);
}
async function removeEmployeeFromProject(projectId, employeeId) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(projectEmployees).where(
    and(eq(projectEmployees.projectId, projectId), eq(projectEmployees.employeeId, employeeId))
  );
}
async function getTasks(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conds = [];
  if (filters?.projectId) conds.push(eq(tasks.projectId, filters.projectId));
  if (filters?.assigneeId) conds.push(eq(tasks.assigneeId, filters.assigneeId));
  if (filters?.status) conds.push(eq(tasks.taskStatus, filters.status));
  return db2.select().from(tasks).where(conds.length ? and(...conds) : void 0).orderBy(desc(tasks.updatedAt));
}
async function getTaskById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const rows = await db2.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return rows[0];
}
async function createTask(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(tasks).values(data);
  return result.insertId;
}
async function updateTask(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(tasks).set(data).where(eq(tasks.id, id));
}
async function deleteTask(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(tasks).where(eq(tasks.id, id));
}
async function getTasksWithAssignees(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conds = [];
  if (filters?.projectId) conds.push(eq(tasks.projectId, filters.projectId));
  if (filters?.status) conds.push(eq(tasks.taskStatus, filters.status));
  const taskRows = await db2.select({ task: tasks, projectName: projects.name }).from(tasks).leftJoin(projects, eq(projects.id, tasks.projectId)).where(conds.length ? and(...conds) : void 0).orderBy(desc(tasks.updatedAt));
  if (taskRows.length === 0) return [];
  const taskIds = taskRows.map((r) => r.task.id);
  const assigneeRows = await db2.select({
    taskId: taskAssignees.taskId,
    employeeId: taskAssignees.employeeId,
    fullName: employees.fullName
  }).from(taskAssignees).innerJoin(employees, eq(employees.id, taskAssignees.employeeId)).where(inArray(taskAssignees.taskId, taskIds));
  const assigneesByTask = /* @__PURE__ */ new Map();
  for (const r of assigneeRows) {
    if (!assigneesByTask.has(r.taskId)) assigneesByTask.set(r.taskId, []);
    assigneesByTask.get(r.taskId).push({ id: r.employeeId, fullName: r.fullName });
  }
  let result = taskRows.map((r) => ({
    ...r.task,
    projectName: r.projectName,
    assignees: assigneesByTask.get(r.task.id) ?? []
  }));
  if (filters?.assigneeId) {
    const want = filters.assigneeId;
    result = result.filter((t2) => t2.assigneeId === want || t2.assignees.some((a) => a.id === want));
  }
  return result;
}
async function getTaskStats() {
  const db2 = await getDb();
  if (!db2) return { total: 0, backlog: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 };
  const all = await db2.select().from(tasks);
  const now = /* @__PURE__ */ new Date();
  return {
    total: all.length,
    backlog: all.filter((t2) => t2.taskStatus === "backlog").length,
    todo: all.filter((t2) => t2.taskStatus === "todo").length,
    inProgress: all.filter((t2) => t2.taskStatus === "in_progress").length,
    review: all.filter((t2) => t2.taskStatus === "review").length,
    done: all.filter((t2) => t2.taskStatus === "done").length,
    overdue: all.filter((t2) => t2.dueDate && new Date(t2.dueDate) < now && t2.taskStatus !== "done").length
  };
}
async function getCampaigns(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.platform) conditions.push(eq(campaigns.platform, filters.platform));
  if (filters.projectId) {
    const allProjects = await db2.select().from(projects);
    const ids = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      ids.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
    conditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(ids).join(",") || "0")})`);
  }
  if (filters.status) conditions.push(eq(campaigns.campaignStatus, filters.status));
  const q = db2.select({ campaign: campaigns, project: projects }).from(campaigns).leftJoin(projects, eq(campaigns.projectId, projects.id)).orderBy(desc(campaigns.createdAt));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function getCampaignById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}
async function createCampaign(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(campaigns).values(data);
  return result[0].insertId;
}
async function updateCampaign(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.update(campaigns).set(data).where(eq(campaigns.id, id));
}
async function deleteCampaign(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(campaignDailyStats).where(eq(campaignDailyStats.campaignId, id));
  await db2.delete(campaigns).where(eq(campaigns.id, id));
}
async function getCampaignStats(campaignId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(campaignDailyStats).where(eq(campaignDailyStats.campaignId, campaignId)).orderBy(desc(campaignDailyStats.date));
}
async function getAllDailyStats(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.from) conditions.push(gte(campaignDailyStats.date, toMysqlDateTime(filters.from)));
  if (filters.to) conditions.push(lte(campaignDailyStats.date, toMysqlDateTime(filters.to)));
  if (filters.projectId) {
    const allProjects = await db2.select().from(projects);
    const ids = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      ids.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
    conditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(ids).join(","))})`);
  }
  const q = db2.select({ stat: campaignDailyStats, campaign: campaigns, project: projects }).from(campaignDailyStats).leftJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id)).leftJoin(projects, eq(campaigns.projectId, projects.id)).orderBy(desc(campaignDailyStats.date));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function importDailyStats(rows) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  if (rows.length === 0) return;
  await db2.insert(campaignDailyStats).values(rows);
}
async function deleteDailyStat(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(campaignDailyStats).where(eq(campaignDailyStats.id, id));
}
async function getMarketingExpenses(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.category) conditions.push(eq(marketingExpenses.mktCategory, filters.category));
  if (filters.projectId) conditions.push(eq(marketingExpenses.projectId, filters.projectId));
  if (filters.from) conditions.push(gte(marketingExpenses.date, toMysqlDateTime(filters.from)));
  if (filters.to) conditions.push(lte(marketingExpenses.date, toMysqlDateTime(filters.to)));
  const q = db2.select({ expense: marketingExpenses, project: projects }).from(marketingExpenses).leftJoin(projects, eq(marketingExpenses.projectId, projects.id)).orderBy(desc(marketingExpenses.date));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function createMarketingExpense(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(marketingExpenses).values(data);
  return result[0].insertId;
}
async function updateMarketingExpense(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.update(marketingExpenses).set(data).where(eq(marketingExpenses.id, id));
}
async function deleteMarketingExpense(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(marketingExpenses).where(eq(marketingExpenses.id, id));
}
async function getMarketingDashboardStats(filters = {}) {
  const db2 = await getDb();
  if (!db2) return { totalSpend: 0, totalReservations: 0, costPerReservation: 0, avgConversionValue: 0, totalMktExpenses: 0, campaignCount: 0 };
  let projectIds = null;
  if (filters.projectId) {
    const allProjects = await db2.select().from(projects);
    projectIds = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      projectIds.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
  }
  const conditions = [];
  if (filters.from) conditions.push(gte(campaignDailyStats.date, toMysqlDateTime(filters.from)));
  if (filters.to) conditions.push(lte(campaignDailyStats.date, toMysqlDateTime(filters.to)));
  if (projectIds) conditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const statsQ = db2.select({
    totalSpend: sql`COALESCE(SUM(${campaignDailyStats.spend}), 0)`,
    totalReservations: sql`COALESCE(SUM(${campaignDailyStats.conversions}), 0)`,
    totalConversionValue: sql`COALESCE(SUM(${campaignDailyStats.conversionValue}), 0)`,
    totalImpressions: sql`COALESCE(SUM(${campaignDailyStats.impressions}), 0)`,
    totalClicks: sql`COALESCE(SUM(${campaignDailyStats.clicks}), 0)`
  }).from(campaignDailyStats).innerJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id));
  const statsResult = conditions.length > 0 ? await statsQ.where(and(...conditions)) : await statsQ;
  const s = statsResult[0];
  const mktConditions = [];
  if (filters.from) mktConditions.push(gte(marketingExpenses.date, toMysqlDateTime(filters.from)));
  if (filters.to) mktConditions.push(lte(marketingExpenses.date, toMysqlDateTime(filters.to)));
  if (projectIds) mktConditions.push(sql`${marketingExpenses.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const mktQ = db2.select({
    total: sql`COALESCE(SUM(${marketingExpenses.amount}), 0)`
  }).from(marketingExpenses);
  const mktResult = mktConditions.length > 0 ? await mktQ.where(and(...mktConditions)) : await mktQ;
  const campConditions = [];
  if (projectIds) campConditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const campQ = db2.select({ count: sql`COUNT(*)` }).from(campaigns);
  const campCount = campConditions.length > 0 ? await campQ.where(and(...campConditions)) : await campQ;
  const periodDays = filters.from && filters.to ? Math.max(1, Math.floor((filters.to.getTime() - filters.from.getTime()) / 864e5) + 1) : 30;
  const campRowsQ = db2.select({ id: campaigns.id, budget: campaigns.budget }).from(campaigns);
  const campRows = campConditions.length > 0 ? await campRowsQ.where(and(...campConditions)) : await campRowsQ;
  const campIdSet = new Set(campRows.map((c) => c.id));
  const budgetSpend = campRows.reduce((acc, c) => acc + parseFloat(c.budget || "0"), 0) * periodDays;
  const keysRaw = await db2.execute(sql`SELECT campaignId, keyType, keyValue FROM internal_campaign_keys WHERE campaignType = 'ad'`);
  const keys = (Array.isArray(keysRaw[0]) ? keysRaw[0] : keysRaw).filter((k) => campIdSet.has(k.campaignId));
  let linkReservations = 0, linkRevenue = 0;
  if (keys.length) {
    const conds = [];
    const names = keys.filter((k) => k.keyType === "campaign_name").map((k) => k.keyValue);
    if (names.length) conds.push(sql`campaignName IN (${sql.join(names.map((v) => sql`${v}`), sql`, `)})`);
    for (const k of keys.filter((k2) => k2.keyType === "campaign_id")) conds.push(sql`originUrl LIKE ${"%campaignId=" + k.keyValue + "%"}`);
    for (const k of keys.filter((k2) => k2.keyType === "url_pattern")) conds.push(sql`originUrl LIKE ${k.keyValue}`);
    if (conds.length) {
      const dateC = filters.from && filters.to ? sql` AND checkIn >= ${toMysqlDateTime(filters.from)} AND checkIn <= ${toMysqlDateTime(filters.to)}` : sql``;
      const r = await db2.execute(sql`SELECT COUNT(*) AS c, COALESCE(SUM(totalPrice),0) AS rev FROM multipark_bookings WHERE (${sql.join(conds, sql` OR `)})${dateC}`);
      const row = (Array.isArray(r[0]) ? r[0] : r)[0];
      linkReservations = Number(row?.c ?? 0);
      linkRevenue = Number(row?.rev ?? 0);
    }
  }
  const realSpend = parseFloat(s.totalSpend || "0");
  const totalSpend = realSpend > 0 ? realSpend : budgetSpend;
  const totalReservations = linkReservations > 0 ? linkReservations : s.totalReservations || 0;
  const conversionValue = linkRevenue > 0 ? linkRevenue : parseFloat(s.totalConversionValue || "0");
  const totalMktExpenses = parseFloat(mktResult[0].total || "0");
  return {
    totalSpend,
    spendEstimated: realSpend === 0 && budgetSpend > 0,
    totalReservations,
    totalRevenue: conversionValue,
    costPerReservation: totalReservations > 0 ? (totalSpend + totalMktExpenses) / totalReservations : 0,
    avgConversionValue: totalReservations > 0 ? conversionValue / totalReservations : 0,
    totalMktExpenses,
    campaignCount: campCount[0].count,
    totalImpressions: s.totalImpressions || 0,
    totalClicks: s.totalClicks || 0
  };
}
async function getBookingRevenueByProject(filters = {}) {
  const db2 = await getDb();
  if (!db2) return { total: 0, revenue: 0, byProject: [] };
  const conditions = [
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ];
  if (filters.from) conditions.push(gte(multiparkBookings.bookingCreatedAt, filters.from));
  if (filters.to) conditions.push(lte(multiparkBookings.bookingCreatedAt, filters.to + " 23:59:59"));
  if (filters.projectId) {
    const allProjects = await db2.select().from(projects);
    const ids = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      ids.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
    conditions.push(sql`${multiparkBookings.projectId} IN (${sql.raw(Array.from(ids).join(","))})`);
  }
  const rows = await db2.select({
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city,
    count: sql`COUNT(*)`,
    revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...conditions)).groupBy(multiparkBookings.parkName, multiparkBookings.city);
  const byProject = rows.map((r) => {
    const name = r.parkName || "Desconhecido";
    const city = r.city || "";
    const displayName = city && !name.includes(city) ? `${name} ${city}` : name;
    return {
      projectId: null,
      parkName: displayName,
      count: r.count,
      revenue: parseFloat(r.revenue || "0")
    };
  });
  return {
    total: byProject.reduce((s, r) => s + r.count, 0),
    revenue: byProject.reduce((s, r) => s + r.revenue, 0),
    byProject
  };
}
async function getVehicles(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  let query = db2.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  const conditions = [];
  if (filters?.status) conditions.push(eq(vehicles.vehicleStatus, filters.status));
  if (filters?.projectId) conditions.push(eq(vehicles.projectId, filters.projectId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  return query;
}
async function getVehicleById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result[0];
}
async function createVehicle(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const result = await db2.insert(vehicles).values(data);
  return result[0].insertId;
}
async function updateVehicle(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(vehicles).set(data).where(eq(vehicles.id, id));
}
async function deleteVehicle(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(vehicles).where(eq(vehicles.id, id));
}
async function getVehicleMovements(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  let query = db2.select().from(vehicleMovements).orderBy(desc(vehicleMovements.createdAt));
  const conditions = [];
  if (filters?.vehicleId) conditions.push(eq(vehicleMovements.vehicleId, filters.vehicleId));
  if (filters?.employeeId) conditions.push(eq(vehicleMovements.employeeId, filters.employeeId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createVehicleMovement(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const result = await db2.insert(vehicleMovements).values(data);
  return result[0].insertId;
}
async function getSpeedAlerts(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  let query = db2.select().from(speedAlerts).orderBy(desc(speedAlerts.createdAt));
  const conditions = [];
  if (filters?.vehicleId) conditions.push(eq(speedAlerts.vehicleId, filters.vehicleId));
  if (filters?.acknowledged !== void 0) conditions.push(eq(speedAlerts.acknowledged, filters.acknowledged ? 1 : 0));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createSpeedAlert(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const result = await db2.insert(speedAlerts).values(data);
  return result[0].insertId;
}
async function acknowledgeSpeedAlert(id, userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(speedAlerts).set({ acknowledged: 1, acknowledgedById: userId, acknowledgedAt: toMysqlDateTime(/* @__PURE__ */ new Date()) }).where(eq(speedAlerts.id, id));
}
async function getRadioTranscriptions(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  let query = db2.select().from(radioTranscriptions).orderBy(desc(radioTranscriptions.createdAt));
  const conditions = [];
  if (filters?.employeeId) conditions.push(eq(radioTranscriptions.employeeId, filters.employeeId));
  if (filters?.vehicleId) conditions.push(eq(radioTranscriptions.vehicleId, filters.vehicleId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createRadioTranscription(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const result = await db2.insert(radioTranscriptions).values(data);
  return result[0].insertId;
}
async function getOperationalStats() {
  const db2 = await getDb();
  if (!db2) return { totalVehicles: 0, activeVehicles: 0, todayAlerts: 0, unacknowledgedAlerts: 0, todayMovements: 0 };
  const allVehicles = await db2.select().from(vehicles);
  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter((v) => v.vehicleStatus === "active").length;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toMysqlDateTime(today);
  const allAlerts = await db2.select().from(speedAlerts).where(gte(speedAlerts.createdAt, todayStr));
  const todayAlerts = allAlerts.length;
  const allUnack = await db2.select().from(speedAlerts).where(eq(speedAlerts.acknowledged, 0));
  const unacknowledgedAlerts = allUnack.length;
  const allMovements = await db2.select().from(vehicleMovements).where(gte(vehicleMovements.createdAt, todayStr));
  const todayMovements = allMovements.length;
  return { totalVehicles, activeVehicles, todayAlerts, unacknowledgedAlerts, todayMovements };
}
async function getVehicleDriverHistory(vehicleId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(vehicleMovements).where(eq(vehicleMovements.vehicleId, vehicleId)).orderBy(desc(vehicleMovements.createdAt));
}
async function getApiKeys() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}
async function createApiKey(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(apiKeys).values(data);
  return Number(result[0].insertId);
}
async function toggleApiKey(id, active) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.update(apiKeys).set({ active: active ? 1 : 0 }).where(eq(apiKeys.id, id));
}
async function deleteApiKey(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(apiKeys).where(eq(apiKeys.id, id));
}
async function getComplaints(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(complaints.complaintStatus, filters.status));
  if (filters?.type) conditions.push(eq(complaints.complaintType, filters.type));
  if (filters?.vehicleId) conditions.push(eq(complaints.vehicleId, filters.vehicleId));
  if (filters?.assignedToId) conditions.push(eq(complaints.assignedToId, filters.assignedToId));
  if (filters?.projectId) conditions.push(eq(complaints.projectId, filters.projectId));
  return db2.select({ ...getTableColumns(complaints), assignedToName: employees.fullName }).from(complaints).leftJoin(employees, eq(complaints.assignedToId, employees.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(complaints.createdAt));
}
async function getComplaintById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select({ ...getTableColumns(complaints), assignedToName: employees.fullName }).from(complaints).leftJoin(employees, eq(complaints.assignedToId, employees.id)).where(eq(complaints.id, id)).limit(1);
  return result[0];
}
async function createComplaint(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(complaints).values(data);
  return Number(result[0].insertId);
}
async function updateComplaint(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.update(complaints).set(data).where(eq(complaints.id, id));
}
async function deleteComplaint(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(complaintPhotos).where(eq(complaintPhotos.complaintId, id));
  await db2.delete(complaintMessages).where(eq(complaintMessages.complaintId, id));
  await db2.delete(complaints).where(eq(complaints.id, id));
}
async function getComplaintMessages(complaintId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(complaintMessages).where(eq(complaintMessages.complaintId, complaintId)).orderBy(complaintMessages.createdAt);
}
async function addComplaintMessage(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(complaintMessages).values(data);
  return Number(result[0].insertId);
}
async function getComplaintPhotos(complaintId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(complaintPhotos).where(eq(complaintPhotos.complaintId, complaintId)).orderBy(complaintPhotos.createdAt);
}
async function addComplaintPhoto(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const result = await db2.insert(complaintPhotos).values(data);
  return Number(result[0].insertId);
}
async function deleteComplaintPhoto(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  await db2.delete(complaintPhotos).where(eq(complaintPhotos.id, id));
}
async function getComplaintStats(projectId) {
  const db2 = await getDb();
  if (!db2) return { total: 0, new: 0, analyzing: 0, waitingClient: 0, resolved: 0, closed: 0, overdue: 0 };
  const all = await db2.select().from(complaints).where(projectId !== void 0 ? eq(complaints.projectId, projectId) : void 0);
  const now = /* @__PURE__ */ new Date();
  return {
    total: all.length,
    new: all.filter((c) => c.complaintStatus === "new").length,
    analyzing: all.filter((c) => c.complaintStatus === "analyzing").length,
    waitingClient: all.filter((c) => c.complaintStatus === "waiting_client").length,
    resolved: all.filter((c) => c.complaintStatus === "resolved").length,
    closed: all.filter((c) => c.complaintStatus === "closed").length,
    overdue: all.filter((c) => c.slaDeadline && new Date(c.slaDeadline) < now && c.complaintStatus !== "resolved" && c.complaintStatus !== "closed").length
  };
}
async function createGoogleReview(data) {
  const db2 = await getDb();
  if (!db2) return;
  const result = await db2.insert(googleReviews).values(data);
  return result[0].insertId;
}
async function getGoogleReviews(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.rating) conditions.push(eq(googleReviews.rating, filters.rating));
  if (filters?.status) conditions.push(eq(googleReviews.status, filters.status));
  if (filters?.projectId) conditions.push(eq(googleReviews.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(googleReviews).where(where).orderBy(desc(googleReviews.createdAt));
}
async function getGoogleReviewById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(googleReviews).where(eq(googleReviews.id, id)).limit(1);
  return result[0];
}
async function updateGoogleReview(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(googleReviews).set(data).where(eq(googleReviews.id, id));
}
async function getGoogleReviewStats() {
  const db2 = await getDb();
  if (!db2) return { total: 0, avg: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0, pending: 0, responded: 0, complaints: 0 };
  const all = await db2.select().from(googleReviews);
  const total = all.length;
  const avg = total > 0 ? all.reduce((s, r) => s + r.rating, 0) / total : 0;
  const star1 = all.filter((r) => r.rating === 1).length;
  const star2 = all.filter((r) => r.rating === 2).length;
  const star3 = all.filter((r) => r.rating === 3).length;
  const star4 = all.filter((r) => r.rating === 4).length;
  const star5 = all.filter((r) => r.rating === 5).length;
  const pending = all.filter((r) => r.status === "pending_response").length;
  const responded = all.filter((r) => r.status === "ai_responded" || r.status === "manually_responded").length;
  const complaints2 = all.filter((r) => r.status === "converted_complaint").length;
  return { total, avg: Math.round(avg * 10) / 10, star1, star2, star3, star4, star5, pending, responded, complaints: complaints2 };
}
async function searchClientHistory(name, email, plate) {
  const db2 = await getDb();
  if (!db2) return { complaints: [], movements: [], reviews: [] };
  const results = { complaints: [], movements: [], reviews: [] };
  if (name || email || plate) {
    const conds = [];
    if (name) conds.push(sql`${complaints.clientName} LIKE ${"%" + name + "%"}`);
    if (email) conds.push(sql`${complaints.clientEmail} LIKE ${"%" + email + "%"}`);
    if (plate) conds.push(sql`${complaints.vehiclePlate} LIKE ${"%" + plate + "%"}`);
    results.complaints = await db2.select().from(complaints).where(or(...conds)).limit(20);
  }
  if (plate) {
    const vehs = await db2.select().from(vehicles).where(sql`${vehicles.plate} LIKE ${"%" + plate + "%"}`).limit(5);
    if (vehs.length > 0) {
      results.movements = await db2.select().from(vehicleMovements).where(eq(vehicleMovements.vehicleId, vehs[0].id)).orderBy(desc(vehicleMovements.createdAt)).limit(20);
    }
  }
  if (name || email) {
    const rConds = [];
    if (name) rConds.push(sql`${googleReviews.reviewerName} LIKE ${"%" + name + "%"}`);
    if (email) rConds.push(sql`${googleReviews.reviewerEmail} LIKE ${"%" + email + "%"}`);
    results.reviews = await db2.select().from(googleReviews).where(or(...rConds)).limit(20);
  }
  return results;
}
async function getTrainingCategories() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(trainingCategories).orderBy(trainingCategories.sortOrder);
}
async function createTrainingCategory(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(trainingCategories).values(data).$returningId();
  return result;
}
async function deleteTrainingCategory(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(trainingCategories).where(eq(trainingCategories.id, id));
}
async function getTrainingVideos(categoryId) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = categoryId ? [eq(trainingVideos.categoryId, categoryId)] : [];
  return db2.select().from(trainingVideos).where(conditions.length ? and(...conditions) : void 0).orderBy(trainingVideos.sortOrder);
}
async function createTrainingVideo(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(trainingVideos).values(data).$returningId();
  return result;
}
async function deleteTrainingVideo(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(trainingVideos).where(eq(trainingVideos.id, id));
}
async function getTrainingManuals(categoryId, type) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [eq(trainingManuals.published, 1)];
  if (categoryId) conditions.push(eq(trainingManuals.categoryId, categoryId));
  if (type) conditions.push(eq(trainingManuals.type, type));
  return db2.select().from(trainingManuals).where(and(...conditions)).orderBy(desc(trainingManuals.createdAt));
}
async function createTrainingManual(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(trainingManuals).values(data).$returningId();
  return result;
}
async function updateTrainingManual(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  const { published, ...rest } = data;
  const updates = { ...rest };
  if (published !== void 0) updates.published = published ? 1 : 0;
  await db2.update(trainingManuals).set(updates).where(eq(trainingManuals.id, id));
}
async function deleteTrainingManual(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(trainingManuals).where(eq(trainingManuals.id, id));
}
async function getFAQs(categoryId) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = categoryId ? [eq(faqs.categoryId, categoryId)] : [];
  return db2.select().from(faqs).where(conditions.length ? and(...conditions) : void 0).orderBy(faqs.sortOrder);
}
async function createFAQ(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(faqs).values(data).$returningId();
  return result;
}
async function updateFAQ(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(faqs).set(data).where(eq(faqs.id, id));
}
async function deleteFAQ(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(faqs).where(eq(faqs.id, id));
}
async function getQuizQuestions(categoryId) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = categoryId ? [eq(quizQuestions.categoryId, categoryId)] : [];
  return db2.select().from(quizQuestions).where(conditions.length ? and(...conditions) : void 0);
}
async function getQuizQuestionsForPlayer(categoryId) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = categoryId ? [eq(quizQuestions.categoryId, categoryId)] : [];
  return db2.select({
    id: quizQuestions.id,
    categoryId: quizQuestions.categoryId,
    question: quizQuestions.question,
    optionA: quizQuestions.optionA,
    optionB: quizQuestions.optionB,
    optionC: quizQuestions.optionC,
    optionD: quizQuestions.optionD,
    difficulty: quizQuestions.difficulty,
    points: quizQuestions.points
  }).from(quizQuestions).where(conditions.length ? and(...conditions) : void 0);
}
async function createQuizQuestion(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(quizQuestions).values(data).$returningId();
  return result;
}
async function deleteQuizQuestion(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(quizQuestions).where(eq(quizQuestions.id, id));
}
async function saveQuizAttempt(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(quizAttempts).values(data).$returningId();
  return result;
}
async function getQuizRanking() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select({
    employeeId: quizAttempts.employeeId,
    totalScore: sql`SUM(${quizAttempts.score})`,
    totalAttempts: sql`COUNT(*)`,
    bestScore: sql`MAX(${quizAttempts.score})`
  }).from(quizAttempts).groupBy(quizAttempts.employeeId).orderBy(desc(sql`SUM(${quizAttempts.score})`));
}
async function getCareerExams() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(careerExams).orderBy(careerExams.level);
}
async function createCareerExam(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(careerExams).values(data).$returningId();
  return result;
}
async function getCareerExamQuestions(examId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(careerExamQuestions).where(eq(careerExamQuestions.examId, examId));
}
async function getCareerExamQuestionsForPlayer(examId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select({
    id: careerExamQuestions.id,
    examId: careerExamQuestions.examId,
    question: careerExamQuestions.question,
    optionA: careerExamQuestions.optionA,
    optionB: careerExamQuestions.optionB,
    optionC: careerExamQuestions.optionC,
    optionD: careerExamQuestions.optionD,
    points: careerExamQuestions.points
  }).from(careerExamQuestions).where(eq(careerExamQuestions.examId, examId));
}
async function createCareerExamQuestion(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(careerExamQuestions).values(data).$returningId();
  return result;
}
async function saveCareerExamAttempt(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const { passed, ...rest } = data;
  const [result] = await db2.insert(careerExamAttempts).values({ ...rest, passed: passed ? 1 : 0 }).$returningId();
  return result;
}
async function getCareerExamAttempts(employeeId, examId) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (employeeId) conditions.push(eq(careerExamAttempts.employeeId, employeeId));
  if (examId) conditions.push(eq(careerExamAttempts.examId, examId));
  return db2.select().from(careerExamAttempts).where(conditions.length ? and(...conditions) : void 0).orderBy(desc(careerExamAttempts.createdAt));
}
async function deleteCareerExam(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(careerExamQuestions).where(eq(careerExamQuestions.examId, id));
  await db2.delete(careerExamAttempts).where(eq(careerExamAttempts.examId, id));
  await db2.delete(careerExams).where(eq(careerExams.id, id));
}
async function createLostFoundItem(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(lostFoundItems).values(data).$returningId();
  return result.id;
}
async function getLostFoundItems(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(lostFoundItems.status, filters.status));
  if (filters?.itemType) conditions.push(eq(lostFoundItems.itemType, filters.itemType));
  if (filters?.projectId) conditions.push(eq(lostFoundItems.projectId, filters.projectId));
  if (filters?.search) conditions.push(or(
    like(lostFoundItems.clientName, `%${filters.search}%`),
    like(lostFoundItems.description, `%${filters.search}%`),
    like(lostFoundItems.vehiclePlate, `%${filters.search}%`)
  ));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(lostFoundItems).where(where).orderBy(desc(lostFoundItems.createdAt));
}
async function getLostFoundItemById(id) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(lostFoundItems).where(eq(lostFoundItems.id, id)).limit(1);
  return rows[0] ?? null;
}
async function updateLostFoundItem(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(lostFoundItems).set(data).where(eq(lostFoundItems.id, id));
}
async function deleteLostFoundItem(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(lostFoundPhotos).where(eq(lostFoundPhotos.itemId, id));
  await db2.delete(lostFoundMessages).where(eq(lostFoundMessages.itemId, id));
  await db2.delete(lostFoundItems).where(eq(lostFoundItems.id, id));
}
async function addLostFoundPhoto(data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(lostFoundPhotos).values(data);
}
async function getLostFoundPhotos(itemId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(lostFoundPhotos).where(eq(lostFoundPhotos.itemId, itemId)).orderBy(desc(lostFoundPhotos.createdAt));
}
async function addLostFoundMessage(data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(lostFoundMessages).values(data);
}
async function getLostFoundMessages(itemId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(lostFoundMessages).where(eq(lostFoundMessages.itemId, itemId)).orderBy(lostFoundMessages.createdAt);
}
async function getLostFoundDriverRanking() {
  const db2 = await getDb();
  if (!db2) return [];
  const items = await db2.select().from(lostFoundItems).where(sql`${lostFoundItems.vehiclePlate} IS NOT NULL AND ${lostFoundItems.vehiclePlate} != ''`);
  if (items.length === 0) return [];
  const plates = items.map((i) => i.vehiclePlate);
  const allMovements = await db2.select().from(vehicleMovements);
  const relevantMovements = allMovements.filter((m) => {
    return true;
  });
  const allVehicles = await db2.select().from(vehicles);
  const vehiclePlateMap = new Map(allVehicles.map((v) => [v.id, v.plate]));
  const plateVehicleMap = new Map(allVehicles.map((v) => [v.plate, v.id]));
  const affectedVehicleIds = plates.map((p) => plateVehicleMap.get(p)).filter(Boolean);
  const movements = allMovements.filter((m) => affectedVehicleIds.includes(m.vehicleId));
  const { employees: employees2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allEmployees = await db2.select().from(employees2);
  const employeeMap = new Map(allEmployees.map((e) => [e.id, e.fullName]));
  const driverIncidents = /* @__PURE__ */ new Map();
  for (const mov of movements) {
    const plate = vehiclePlateMap.get(mov.vehicleId);
    if (!plate || !plates.includes(plate)) continue;
    const incidentsForPlate = items.filter((i) => i.vehiclePlate === plate).length;
    const existing = driverIncidents.get(mov.employeeId) || { name: employeeMap.get(mov.employeeId) || "Desconhecido", vehiclePlates: /* @__PURE__ */ new Set(), totalIncidents: 0 };
    existing.vehiclePlates.add(plate);
    existing.totalIncidents += incidentsForPlate;
    driverIncidents.set(mov.employeeId, existing);
  }
  return Array.from(driverIncidents.entries()).map(([employeeId, data]) => ({
    employeeId,
    employeeName: data.name,
    vehicleCount: data.vehiclePlates.size,
    incidentCount: data.totalIncidents,
    plates: Array.from(data.vehiclePlates)
  })).sort((a, b) => b.incidentCount - a.incidentCount);
}
async function createIncident(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const now = /* @__PURE__ */ new Date();
  const weekNum = getWeekNumber(now);
  const [result] = await db2.insert(incidents).values({ ...data, weekNumber: data.weekNumber || weekNum, yearNumber: data.yearNumber || now.getFullYear() }).$returningId();
  return result?.id;
}
async function getIncidents(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(incidents.status, filters.status));
  if (filters?.severity) conditions.push(eq(incidents.severity, filters.severity));
  if (filters?.employeeId) conditions.push(eq(incidents.employeeId, filters.employeeId));
  if (filters?.weekNumber) conditions.push(eq(incidents.weekNumber, filters.weekNumber));
  if (filters?.yearNumber) conditions.push(eq(incidents.yearNumber, filters.yearNumber));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(incidents).where(where).orderBy(desc(incidents.createdAt));
}
async function getIncidentById(id) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  return rows[0] || null;
}
async function updateIncident(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(incidents).set(data).where(eq(incidents.id, id));
}
async function deleteIncident(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(incidents).where(eq(incidents.id, id));
}
async function getIncidentStats(weekNumber, yearNumber) {
  const db2 = await getDb();
  if (!db2) return { total: 0, open: 0, resolved: 0, critical: 0, byType: {} };
  const conditions = [];
  if (weekNumber) conditions.push(eq(incidents.weekNumber, weekNumber));
  if (yearNumber) conditions.push(eq(incidents.yearNumber, yearNumber));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const all = await db2.select().from(incidents).where(where);
  const byType = {};
  let open = 0, resolved = 0, critical = 0;
  for (const i of all) {
    byType[i.incidentType] = (byType[i.incidentType] || 0) + 1;
    if (i.status === "open" || i.status === "investigating") open++;
    if (i.status === "resolved") resolved++;
    if (i.severity === "critical") critical++;
  }
  return { total: all.length, open, resolved, critical, byType };
}
async function getIncidentsByEmployee(employeeId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(incidents).where(eq(incidents.employeeId, employeeId)).orderBy(desc(incidents.createdAt));
}
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
function isoWeekRange(year, week) {
  const simple = new Date(Date.UTC(year, 0, 4));
  const dow = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - (dow - 1) + (week - 1) * 7);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}
function speedAlertPoints(speed, limit) {
  if (limit <= 0) return 5;
  const excess = (speed - limit) / limit;
  if (excess <= 0.1) return 2;
  if (excess <= 0.25) return 5;
  if (excess <= 0.5) return 10;
  return 15;
}
async function createPerformanceEvaluation(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(performanceEvaluations).values(data).$returningId();
  return result?.id;
}
async function getPerformanceEvaluations(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.weekNumber) conditions.push(eq(performanceEvaluations.weekNumber, filters.weekNumber));
  if (filters?.yearNumber) conditions.push(eq(performanceEvaluations.yearNumber, filters.yearNumber));
  if (filters?.employeeId) conditions.push(eq(performanceEvaluations.employeeId, filters.employeeId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(performanceEvaluations).where(where).orderBy(desc(performanceEvaluations.totalPoints));
}
async function updatePerformanceEvaluation(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(performanceEvaluations).set(data).where(eq(performanceEvaluations.id, id));
}
async function deletePerformanceEvaluation(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(performanceEvaluations).where(eq(performanceEvaluations.id, id));
}
async function generateWeeklyEvaluation(weekNumber, yearNumber) {
  const db2 = await getDb();
  if (!db2) return [];
  const { start, end } = isoWeekRange(yearNumber, weekNumber);
  const startStr = toMysqlDateTime(start);
  const endStr = toMysqlDateTime(end);
  const drivers = await db2.select({ id: employees.id, fullName: employees.fullName, position: employees.position }).from(employees).where(and(
    eq(employees.isActive, 1),
    inArray(employees.position, ["driver", "senior_driver", "extra"])
  ));
  if (drivers.length === 0) return [];
  const driverIds = drivers.map((d) => d.id);
  const hoursRows = await db2.select({
    employeeId: timeRecords.employeeId,
    hours: sql`COALESCE(SUM(${timeRecords.hoursWorked}), 0)`
  }).from(timeRecords).where(and(
    inArray(timeRecords.employeeId, driverIds),
    eq(timeRecords.type, "check_out"),
    gte(timeRecords.recordedAt, startStr),
    lte(timeRecords.recordedAt, endStr)
  )).groupBy(timeRecords.employeeId);
  const hoursMap = new Map(hoursRows.map((r) => [r.employeeId, Number(r.hours)]));
  const movRows = await db2.select({
    employeeId: employees.id,
    count: sql`COUNT(*)`
  }).from(multiparkBookingHistory).innerJoin(employees, eq(employees.multiparkAgentName, multiparkBookingHistory.agentName)).where(and(
    inArray(employees.id, driverIds),
    gte(multiparkBookingHistory.actionTime, startStr),
    lte(multiparkBookingHistory.actionTime, endStr)
  )).groupBy(employees.id);
  const movMap = new Map(movRows.map((r) => [Number(r.employeeId), Number(r.count)]));
  const alertRows = await db2.select({
    employeeId: speedAlerts.employeeId,
    speed: speedAlerts.speed,
    speedLimit: speedAlerts.speedLimit
  }).from(speedAlerts).where(and(
    inArray(speedAlerts.employeeId, driverIds),
    eq(speedAlerts.acknowledged, 0),
    gte(speedAlerts.createdAt, startStr),
    lte(speedAlerts.createdAt, endStr)
  ));
  const alertStats = /* @__PURE__ */ new Map();
  for (const a of alertRows) {
    const empId = Number(a.employeeId ?? 0);
    if (!empId) continue;
    const stats = alertStats.get(empId) ?? { count: 0, points: 0 };
    stats.count += 1;
    stats.points += speedAlertPoints(Number(a.speed), Number(a.speedLimit));
    alertStats.set(empId, stats);
  }
  const incidentRows = await db2.select({
    reportedBy: incidents.reportedBy,
    employeeId: incidents.employeeId,
    severity: incidents.severity
  }).from(incidents).where(and(
    gte(incidents.createdAt, startStr),
    lte(incidents.createdAt, endStr)
  ));
  const posIncidents = /* @__PURE__ */ new Map();
  const negIncidents = /* @__PURE__ */ new Map();
  for (const i of incidentRows) {
    const reporterId = Number(i.reportedBy ?? 0);
    const targetId = Number(i.employeeId ?? 0);
    if (reporterId && driverIds.includes(reporterId)) {
      posIncidents.set(reporterId, (posIncidents.get(reporterId) ?? 0) + 1);
    }
    if (targetId && driverIds.includes(targetId)) {
      const sev = String(i.severity ?? "medium");
      const pts = INCIDENT_SEVERITY_POINTS[sev] ?? 5;
      const cur = negIncidents.get(targetId) ?? { count: 0, points: 0 };
      cur.count += 1;
      cur.points += pts;
      negIncidents.set(targetId, cur);
    }
  }
  const penaltyRows = await db2.select({
    employeeId: employeePenalties.employeeId,
    totalPoints: sql`COALESCE(SUM(${employeePenalties.points}), 0)`
  }).from(employeePenalties).where(and(
    inArray(employeePenalties.employeeId, driverIds),
    gte(employeePenalties.createdAt, startStr),
    lte(employeePenalties.createdAt, endStr)
  )).groupBy(employeePenalties.employeeId);
  const PENALTY_WEIGHT = 5;
  const penaltyMap = new Map(penaltyRows.map((r) => [r.employeeId, Number(r.totalPoints) * PENALTY_WEIGHT]));
  const existingEvals = await db2.select().from(performanceEvaluations).where(and(
    eq(performanceEvaluations.weekNumber, weekNumber),
    eq(performanceEvaluations.yearNumber, yearNumber),
    inArray(performanceEvaluations.employeeId, driverIds)
  ));
  const existingMap = new Map(existingEvals.map((e) => [e.employeeId, e]));
  const MOV_POINTS = 2;
  const INCIDENT_REPORT_POINTS = 5;
  const results = [];
  for (const emp of drivers) {
    const hoursWorked = Math.round((hoursMap.get(emp.id) ?? 0) * 100) / 100;
    const movementsCount = movMap.get(emp.id) ?? 0;
    const movementsPerHour = hoursWorked > 0 ? Math.round(movementsCount / hoursWorked * 100) / 100 : 0;
    const alertCount = alertStats.get(emp.id)?.count ?? 0;
    const alertPoints = alertStats.get(emp.id)?.points ?? 0;
    const positiveIncidentsCount = posIncidents.get(emp.id) ?? 0;
    const negStats = negIncidents.get(emp.id) ?? { count: 0, points: 0 };
    const penaltyPts = penaltyMap.get(emp.id) ?? 0;
    const positivePoints = movementsCount * MOV_POINTS + positiveIncidentsCount * INCIDENT_REPORT_POINTS;
    const negativePoints = alertPoints + negStats.points + penaltyPts;
    const totalPoints = positivePoints - negativePoints;
    const evalData = {
      employeeId: emp.id,
      weekNumber,
      yearNumber,
      hoursWorked: Math.round(hoursWorked),
      movementsCount,
      movementsPerHour: Math.round(movementsPerHour),
      speedAlerts: alertCount,
      incidentsPositive: positiveIncidentsCount,
      incidentsNegative: negStats.count,
      positivePoints,
      negativePoints,
      totalPoints
    };
    const existing = existingMap.get(emp.id);
    if (existing) {
      await db2.update(performanceEvaluations).set(evalData).where(eq(performanceEvaluations.id, existing.id));
      results.push({ ...evalData, id: existing.id, employeeName: emp.fullName, notes: existing.notes });
    } else {
      const [result] = await db2.insert(performanceEvaluations).values(evalData).$returningId();
      results.push({ ...evalData, id: result?.id, employeeName: emp.fullName, notes: null });
    }
  }
  return results.sort((a, b) => b.totalPoints - a.totalPoints);
}
async function createService(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(services).values(data).$returningId();
  return result?.id;
}
async function getServices(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.serviceType) conditions.push(eq(services.serviceType, filters.serviceType));
  if (filters?.employeeId) conditions.push(eq(services.employeeId, filters.employeeId));
  if (filters?.projectId) conditions.push(eq(services.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const all = await db2.select().from(services).where(where).orderBy(desc(services.serviceDate));
  if (filters?.month && filters?.year) {
    return all.filter((s) => {
      const d = new Date(s.serviceDate);
      return d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year;
    });
  }
  return all;
}
async function updateService(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(services).set(data).where(eq(services.id, id));
}
async function deleteService(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(services).where(eq(services.id, id));
}
async function getServiceStats(month, year) {
  const db2 = await getDb();
  if (!db2) return { total: 0, revenue: 0, cost: 0, profit: 0, byType: {}, byEmployee: [] };
  let all = await db2.select().from(services).orderBy(desc(services.serviceDate));
  if (month && year) {
    all = all.filter((s) => {
      const d = new Date(s.serviceDate);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }
  const byType = {};
  const byEmp = {};
  let totalRevenue = 0, totalCost = 0;
  for (const s of all) {
    const t2 = s.serviceType;
    if (!byType[t2]) byType[t2] = { count: 0, revenue: 0, cost: 0 };
    byType[t2].count++;
    byType[t2].revenue += s.revenue || 0;
    byType[t2].cost += (s.cost || 0) + (s.commission || 0);
    totalRevenue += s.revenue || 0;
    totalCost += (s.cost || 0) + (s.commission || 0);
    if (s.employeeId) {
      if (!byEmp[s.employeeId]) byEmp[s.employeeId] = { count: 0, revenue: 0 };
      byEmp[s.employeeId].count++;
      byEmp[s.employeeId].revenue += s.revenue || 0;
    }
  }
  const { employees: empTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allEmps = await db2.select().from(empTable);
  const empMap = new Map(allEmps.map((e) => [e.id, e.fullName]));
  const byEmployee = Object.entries(byEmp).map(([id, data]) => ({
    employeeId: Number(id),
    employeeName: empMap.get(Number(id)) || "Desconhecido",
    ...data
  })).sort((a, b) => b.count - a.count);
  return { total: all.length, revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost, byType, byEmployee };
}
async function createInvoice(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(invoices).values(data).$returningId();
  return result?.id;
}
async function getInvoices(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(invoices.status, filters.status));
  if (filters?.projectId) conditions.push(eq(invoices.projectId, filters.projectId));
  if (filters?.search) {
    conditions.push(or(
      like(invoices.invoiceNumber, `%${filters.search}%`),
      like(invoices.clientName, `%${filters.search}%`),
      like(invoices.clientNif, `%${filters.search}%`)
    ));
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const all = await db2.select().from(invoices).where(where).orderBy(desc(invoices.issueDate));
  if (filters?.month && filters?.year) {
    return all.filter((i) => {
      const d = new Date(i.issueDate);
      return d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year;
    });
  }
  return all;
}
async function getInvoiceById(id) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return rows[0] || null;
}
async function updateInvoice(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(invoices).set(data).where(eq(invoices.id, id));
}
async function deleteInvoice(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(invoices).where(eq(invoices.id, id));
}
async function getInvoiceStats(month, year) {
  const db2 = await getDb();
  if (!db2) return { total: 0, totalAmount: 0, paid: 0, overdue: 0, draft: 0 };
  let all = await db2.select().from(invoices).orderBy(desc(invoices.issueDate));
  if (month && year) {
    all = all.filter((i) => {
      const d = new Date(i.issueDate);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }
  let totalAmount = 0, paid = 0, overdue = 0, draft = 0;
  for (const i of all) {
    totalAmount += i.totalAmount || 0;
    if (i.status === "paid") paid++;
    if (i.status === "overdue") overdue++;
    if (i.status === "draft") draft++;
  }
  return { total: all.length, totalAmount, paid, overdue, draft };
}
async function resolveProjectIds(projectId) {
  const db2 = await getDb();
  if (!db2) return [projectId];
  const allProjects = await db2.select().from(projects);
  const ids = /* @__PURE__ */ new Set();
  const addChildren = (pid) => {
    ids.add(pid);
    for (const p of allProjects) {
      if (p.parentId === pid) addChildren(p.id);
    }
  };
  addChildren(projectId);
  return Array.from(ids);
}
function bucketSqlExpr(col, granularity) {
  switch (granularity) {
    case "week":
      return sql`DATE_FORMAT(${col}, '%x-W%v')`;
    case "month":
      return sql`DATE_FORMAT(${col}, '%Y-%m')`;
    case "year":
      return sql`DATE_FORMAT(${col}, '%Y')`;
    default:
      return sql`DATE_FORMAT(${col}, '%Y-%m-%d')`;
  }
}
async function diagnoseBilling(filters) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB unavailable");
  const fromStr = toMysqlDateTime(new Date(filters.from));
  const toStr = toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59"));
  let projectIds = null;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const [a1] = await db2.select({
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(gte(multiparkBookings.checkOut, fromStr), lte(multiparkBookings.checkOut, toStr)));
  const [a2] = await db2.select({
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(gte(multiparkBookings.checkOut, fromStr), lte(multiparkBookings.checkOut, toStr), isNotNull(multiparkBookings.checkOut)));
  const [a3] = await db2.select({
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(
    gte(multiparkBookings.checkOut, fromStr),
    lte(multiparkBookings.checkOut, toStr),
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ));
  const filteredConds = [
    gte(multiparkBookings.checkOut, fromStr),
    lte(multiparkBookings.checkOut, toStr),
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ];
  if (projectIds) filteredConds.push(inArray(multiparkBookings.projectId, projectIds));
  const [a4] = await db2.select({
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...filteredConds));
  const distinctRow = await db2.select({
    total: sql`COUNT(*)`,
    distinct: sql`COUNT(DISTINCT ${multiparkBookings.externalId})`
  }).from(multiparkBookings).where(and(...filteredConds));
  const dup = distinctRow[0];
  const duplicates = await db2.select({
    externalId: multiparkBookings.externalId,
    count: sql`COUNT(*)`
  }).from(multiparkBookings).where(and(...filteredConds)).groupBy(multiparkBookings.externalId).having(sql`COUNT(*) > 1`).orderBy(desc(sql`COUNT(*)`)).limit(20);
  const byProj = await db2.select({
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(projects.id, multiparkBookings.projectId)).where(and(...filteredConds)).groupBy(multiparkBookings.projectId, projects.name).orderBy(desc(sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`));
  const byCamp = await db2.select({
    campaign: multiparkBookings.campaign,
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...filteredConds)).groupBy(multiparkBookings.campaign).orderBy(desc(sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`));
  const byStatus = await db2.select({
    status: multiparkBookings.status,
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...filteredConds)).groupBy(multiparkBookings.status);
  const cancelConds = [
    gte(multiparkBookings.checkOut, fromStr),
    lte(multiparkBookings.checkOut, toStr),
    isNotNull(multiparkBookings.checkOut),
    isNotNull(multiparkBookings.cancelledAt)
  ];
  if (projectIds) cancelConds.push(inArray(multiparkBookings.projectId, projectIds));
  const [cancelled] = await db2.select({
    count: sql`COUNT(*)`,
    sum: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...cancelConds));
  const top = await db2.select({
    id: multiparkBookings.id,
    externalId: multiparkBookings.externalId,
    bookingNumber: multiparkBookings.bookingNumber,
    projectName: projects.name,
    campaign: multiparkBookings.campaign,
    status: multiparkBookings.status,
    totalPrice: multiparkBookings.totalPrice,
    checkOut: multiparkBookings.checkOut,
    cancelledAt: multiparkBookings.cancelledAt
  }).from(multiparkBookings).leftJoin(projects, eq(projects.id, multiparkBookings.projectId)).where(and(...filteredConds)).orderBy(desc(multiparkBookings.totalPrice)).limit(20);
  return {
    range: { from: filters.from, to: filters.to },
    projectIds,
    sumByCheckoutPeriod: { count: Number(a1?.count ?? 0), sum: Number(a1?.sum ?? 0) },
    sumWithCheckoutNotNull: { count: Number(a2?.count ?? 0), sum: Number(a2?.sum ?? 0) },
    sumExcludingCancelled: { count: Number(a3?.count ?? 0), sum: Number(a3?.sum ?? 0) },
    sumWithProjectFilter: { count: Number(a4?.count ?? 0), sum: Number(a4?.sum ?? 0) },
    rowsCount: Number(dup?.total ?? 0),
    distinctExternalIds: Number(dup?.distinct ?? 0),
    duplicatedExternalIds: duplicates.map((d) => ({ externalId: d.externalId, count: Number(d.count ?? 0) })),
    byProject: byProj.map((p) => ({ projectId: p.projectId, projectName: p.projectName, count: Number(p.count ?? 0), sum: Number(p.sum ?? 0) })),
    byCampaign: byCamp.map((c) => ({ campaign: c.campaign, count: Number(c.count ?? 0), sum: Number(c.sum ?? 0) })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count ?? 0), sum: Number(s.sum ?? 0) })),
    cancelledCount: Number(cancelled?.count ?? 0),
    cancelledSum: Number(cancelled?.sum ?? 0),
    topBookings: top.map((t2) => ({
      id: t2.id,
      externalId: t2.externalId,
      bookingNumber: t2.bookingNumber,
      projectName: t2.projectName,
      campaign: t2.campaign,
      status: t2.status,
      totalPrice: Number(t2.totalPrice ?? 0),
      checkOut: t2.checkOut,
      cancelledAt: t2.cancelledAt
    }))
  };
}
async function getBillingData(filters) {
  const db2 = await getDb();
  const granularity = filters.granularity ?? "day";
  if (!db2) {
    return {
      summary: {
        produced: 0,
        invoiced: 0,
        expensesPaid: 0,
        expensesPending: 0,
        extrasDiaCost: 0,
        marketingCost: 0,
        partnerCommissionsPaid: 0,
        partnerCommissionsPending: 0,
        totalCostsPaid: 0,
        totalCostsAll: 0,
        marginRealized: 0,
        marginAll: 0
      },
      timeseries: [],
      deliveries: [],
      expensesPaid: [],
      expensesPending: [],
      forecast: [],
      invoices: [],
      extrasDia: [],
      marketing: [],
      partnerCommissions: [],
      forecastBookings: [],
      forecastExpenses: [],
      forecastExtrasDia: []
    };
  }
  const fromStr = toMysqlDateTime(new Date(filters.from));
  const toStr = toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59"));
  const fromDateOnly = filters.from;
  const toDateOnly = filters.to;
  let projectIds;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const deliveryConds = [
    gte(multiparkBookings.checkOut, fromStr),
    lte(multiparkBookings.checkOut, toStr),
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ];
  if (projectIds) deliveryConds.push(inArray(multiparkBookings.projectId, projectIds));
  const deliveryRows = await db2.select({
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`,
    parkingRevenue: sql`COALESCE(SUM(${multiparkBookings.parkingPrice}), 0)`,
    deliveryCharges: sql`COALESCE(SUM(${multiparkBookings.deliveryCharges}), 0)`,
    extrasRevenue: sql`COALESCE(SUM(${multiparkBookings.extrasTotal}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(multiparkBookings.projectId, projects.id)).where(and(...deliveryConds)).groupBy(multiparkBookings.projectId, projects.name);
  const revenueByProjectId = /* @__PURE__ */ new Map();
  for (const r of deliveryRows) {
    if (r.projectId != null) revenueByProjectId.set(r.projectId, Number(r.totalRevenue ?? 0));
  }
  const invConds = [
    gte(invoices.issueDate, fromStr),
    lte(invoices.issueDate, toStr),
    sql`${invoices.status} != 'cancelled'`
  ];
  if (projectIds) invConds.push(inArray(invoices.projectId, projectIds));
  const invoicedRows = await db2.select({
    projectId: invoices.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
    paidAmount: sql`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)`
  }).from(invoices).leftJoin(projects, eq(invoices.projectId, projects.id)).where(and(...invConds)).groupBy(invoices.projectId, projects.name);
  const insertedConds = [
    sql`${expenses.status} != 'cancelled'`,
    gte(expenses.expenseDate, fromStr),
    lte(expenses.expenseDate, toStr)
  ];
  if (projectIds) insertedConds.push(inArray(expenses.projectId, projectIds));
  const expPaidRows = await db2.select({
    projectId: expenses.projectId,
    projectName: projects.name,
    categoryName: expenseCategories.name,
    count: sql`COUNT(*)`,
    totalAmount: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(and(...insertedConds)).groupBy(expenses.projectId, projects.name, expenseCategories.name);
  const pendConds = [
    inArray(expenses.status, ["pending", "overdue"]),
    isNotNull(expenses.paymentDueDate),
    gte(expenses.paymentDueDate, fromStr),
    lte(expenses.paymentDueDate, toStr)
  ];
  if (projectIds) pendConds.push(inArray(expenses.projectId, projectIds));
  const expPendRows = await db2.select({
    projectId: expenses.projectId,
    projectName: projects.name,
    categoryName: expenseCategories.name,
    supplier: expenses.supplier,
    count: sql`COUNT(*)`,
    totalAmount: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(and(...pendConds)).groupBy(expenses.projectId, projects.name, expenseCategories.name, expenses.supplier);
  const extrasRows = await db2.select({
    level: extrasDiaAssignments.level,
    hours: sql`COALESCE(SUM(GREATEST(${extrasDiaAssignments.endHour} - ${extrasDiaAssignments.startHour}, 0)), 0)`,
    headcount: sql`COUNT(*)`
  }).from(extrasDiaAssignments).where(
    and(
      gte(extrasDiaAssignments.assignmentDate, fromDateOnly),
      lte(extrasDiaAssignments.assignmentDate, toDateOnly)
    )
  ).groupBy(extrasDiaAssignments.level);
  const extrasDiaSummary = extrasRows.map((r) => {
    const rate = EXTRAS_DIA_RATES[String(r.level ?? "junior")] ?? 4;
    const hours = Number(r.hours ?? 0);
    return {
      level: r.level ?? "junior",
      hours,
      headcount: Number(r.headcount ?? 0),
      cost: hours * rate
    };
  });
  const mktExpConds = [
    gte(marketingExpenses.date, fromStr),
    lte(marketingExpenses.date, toStr)
  ];
  if (projectIds) mktExpConds.push(inArray(marketingExpenses.projectId, projectIds));
  const mktExpRows = await db2.select({
    projectId: marketingExpenses.projectId,
    projectName: projects.name,
    category: marketingExpenses.mktCategory,
    totalAmount: sql`COALESCE(SUM(${marketingExpenses.amount}), 0)`,
    count: sql`COUNT(*)`
  }).from(marketingExpenses).leftJoin(projects, eq(marketingExpenses.projectId, projects.id)).where(and(...mktExpConds)).groupBy(marketingExpenses.projectId, projects.name, marketingExpenses.mktCategory);
  const mktAdsConds = [
    gte(campaignDailyStats.date, fromStr),
    lte(campaignDailyStats.date, toStr)
  ];
  if (projectIds) {
    mktAdsConds.push(inArray(campaigns.projectId, projectIds));
  }
  const mktAdsRows = await db2.select({
    projectId: campaigns.projectId,
    projectName: projects.name,
    totalSpend: sql`COALESCE(SUM(${campaignDailyStats.spend}), 0)`,
    conversions: sql`COALESCE(SUM(${campaignDailyStats.conversions}), 0)`
  }).from(campaignDailyStats).innerJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id)).leftJoin(projects, eq(campaigns.projectId, projects.id)).where(and(...mktAdsConds)).groupBy(campaigns.projectId, projects.name);
  const bookingsByCampaignRows = await db2.select({
    campaign: multiparkBookings.campaign,
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    bookingsCount: sql`COUNT(*)`,
    revenueGross: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(multiparkBookings.projectId, projects.id)).where(and(...deliveryConds, isNotNull(multiparkBookings.campaign))).groupBy(multiparkBookings.campaign, multiparkBookings.projectId, projects.name);
  const allPartners = await db2.select({
    id: partnerships.id,
    name: partnerships.name,
    campaignKey: partnerships.campaignKey,
    commissionRate: partnerships.commissionRate,
    updatedAt: partnerships.updatedAt
  }).from(partnerships);
  const allAliases = await db2.select({
    partnershipId: partnerAliases.partnershipId,
    aliasValue: partnerAliases.aliasValue
  }).from(partnerAliases);
  const partnersById = /* @__PURE__ */ new Map();
  for (const p of allPartners) {
    partnersById.set(p.id, {
      id: p.id,
      name: p.name,
      commissionRate: Number(p.commissionRate ?? 0),
      updatedAt: p.updatedAt ?? ""
    });
  }
  const partnerByCampaign = /* @__PURE__ */ new Map();
  function registerKey(rawKey, partnerId) {
    if (!rawKey) return;
    const key = rawKey.trim().toLowerCase();
    if (!key) return;
    const partner = partnersById.get(partnerId);
    if (!partner) return;
    const existing = partnerByCampaign.get(key);
    if (!existing || partner.updatedAt > existing.updatedAt) {
      partnerByCampaign.set(key, partner);
    }
  }
  for (const p of allPartners) {
    registerKey(p.campaignKey, p.id);
    registerKey(p.name, p.id);
  }
  for (const a of allAliases) {
    registerKey(a.aliasValue, a.partnershipId);
  }
  const salesAgg = /* @__PURE__ */ new Map();
  for (const r of bookingsByCampaignRows) {
    const cmpKey = (r.campaign ?? "").trim().toLowerCase();
    const partner = partnerByCampaign.get(cmpKey);
    if (!partner) continue;
    const revenueGross = Number(r.revenueGross ?? 0);
    const rate = partner.commissionRate / 100;
    const key = `${partner.id}|${r.projectId ?? "null"}`;
    const ex = salesAgg.get(key);
    if (ex) {
      ex.bookingsCount += Number(r.bookingsCount ?? 0);
      ex.revenueGross += revenueGross;
      ex.commission += revenueGross * rate;
    } else {
      salesAgg.set(key, {
        partnerId: partner.id,
        partnerName: partner.name,
        projectId: r.projectId,
        projectName: r.projectName,
        bookingsCount: Number(r.bookingsCount ?? 0),
        revenueGross,
        commissionRate: partner.commissionRate,
        commission: revenueGross * rate
      });
    }
  }
  const salesCommissions = Array.from(salesAgg.values()).sort((a, b) => b.commission - a.commission);
  const { parsePartnerConfig: parseOpPartnerConfig } = await Promise.resolve().then(() => (init_partnerTypes(), partnerTypes_exports));
  const opPartnerRows = await db2.select({
    id: partnerships.id,
    name: partnerships.name,
    partnerType: partnerships.partnerType,
    commissionRate: partnerships.commissionRate,
    notes: partnerships.notes
  }).from(partnerships).where(eq(partnerships.partnerType, "operacional"));
  const operationalPartners = [];
  for (const p of opPartnerRows) {
    const cfg = parseOpPartnerConfig(p.notes ?? null);
    const roots = cfg.operatesProjects ?? [];
    if (roots.length === 0) continue;
    const leaves = /* @__PURE__ */ new Set();
    for (const root of roots) {
      const ids = await resolveProjectIds(root);
      for (const pid of ids) {
        if (!projectIds || projectIds.includes(pid)) leaves.add(pid);
      }
    }
    if (leaves.size === 0) continue;
    let revenue = 0, bookingsCount = 0;
    const projNames = [];
    for (const dr of deliveryRows) {
      if (dr.projectId != null && leaves.has(dr.projectId)) {
        revenue += Number(dr.totalRevenue ?? 0);
        bookingsCount += Number(dr.count ?? 0);
        if (dr.projectName) projNames.push(dr.projectName);
      }
    }
    const rate = Number(p.commissionRate ?? 0);
    operationalPartners.push({
      partnershipId: p.id,
      partnerName: p.name,
      partnerType: p.partnerType,
      projectNames: projNames,
      bookingsCount,
      revenueGross: revenue,
      commissionRate: rate,
      commission: revenue * (rate / 100)
    });
  }
  operationalPartners.sort((a, b) => b.commission - a.commission);
  const operationalPartnersTotal = operationalPartners.reduce((s, p) => s + p.commission, 0);
  const allEmps = await db2.select({
    id: employees.id,
    fullName: employees.fullName,
    projectId: employees.projectId,
    contractType: employees.contractType,
    monthlySalary: employees.monthlySalary,
    isActive: employees.isActive
  }).from(employees).where(eq(employees.isActive, 1));
  const allProjectsForHierarchy = await db2.select({ id: projects.id, name: projects.name, parentId: projects.parentId, level: projects.level }).from(projects);
  const childrenMap = /* @__PURE__ */ new Map();
  for (const p of allProjectsForHierarchy) {
    if (p.parentId != null) {
      if (!childrenMap.has(p.parentId)) childrenMap.set(p.parentId, []);
      childrenMap.get(p.parentId).push(p.id);
    }
  }
  function leafDescendants(projectId) {
    const self = allProjectsForHierarchy.find((p) => p.id === projectId);
    if (!self) return [];
    if (self.level === "project") return [projectId];
    const kids = childrenMap.get(projectId) ?? [];
    if (kids.length === 0) return [projectId];
    const out = [];
    for (const kid of kids) out.push(...leafDescendants(kid));
    return out.length > 0 ? out : [projectId];
  }
  const msPerDay = 1e3 * 60 * 60 * 24;
  const periodDays = Math.max(
    1,
    Math.floor((new Date(filters.to).getTime() - new Date(filters.from).getTime()) / msPerDay) + 1
  );
  const salaryPerProject = /* @__PURE__ */ new Map();
  const salaryDetailRows = [];
  for (const e of allEmps) {
    const monthlySalary = parseFloat(String(e.monthlySalary ?? "0"));
    if (e.contractType === "extra" || monthlySalary <= 0) continue;
    const periodCost = monthlySalary / 30 * periodDays;
    const directProjectId = e.projectId ?? null;
    let targets;
    if (directProjectId == null) {
      targets = [];
    } else {
      targets = leafDescendants(directProjectId);
    }
    if (targets.length === 0) {
      salaryDetailRows.push({ employeeId: e.id, fullName: e.fullName, projectId: directProjectId, cost: periodCost, ratedTo: [] });
    } else if (targets.length === 1 && targets[0] === directProjectId) {
      const cur = salaryPerProject.get(targets[0]) ?? 0;
      salaryPerProject.set(targets[0], cur + periodCost);
      salaryDetailRows.push({ employeeId: e.id, fullName: e.fullName, projectId: directProjectId, cost: periodCost, ratedTo: targets });
    } else {
      const share = periodCost / targets.length;
      for (const t2 of targets) {
        const cur = salaryPerProject.get(t2) ?? 0;
        salaryPerProject.set(t2, cur + share);
      }
      salaryDetailRows.push({ employeeId: e.id, fullName: e.fullName, projectId: directProjectId, cost: periodCost, ratedTo: targets });
    }
  }
  const salariesByProject = Array.from(salaryPerProject.entries()).filter(([pid]) => !projectIds || projectIds.includes(pid)).map(([pid, cost]) => {
    const p = allProjectsForHierarchy.find((x) => x.id === pid);
    return { projectId: pid, projectName: p?.name ?? null, cost };
  }).sort((a, b) => b.cost - a.cost);
  const now = /* @__PURE__ */ new Date();
  const forecastFromDate = now > new Date(filters.from) ? now : new Date(filters.from);
  let forecastToDate = /* @__PURE__ */ new Date(filters.to + "T23:59:59");
  if (forecastToDate.getTime() <= now.getTime()) {
    forecastToDate = new Date(now.getTime() + 30 * msPerDay);
  }
  const forecastFrom = toMysqlDateTime(forecastFromDate);
  const forecastToStr = toMysqlDateTime(forecastToDate);
  const forecastConds = [
    gte(multiparkBookings.checkIn, forecastFrom),
    lte(multiparkBookings.checkIn, forecastToStr),
    isNull(multiparkBookings.checkOut),
    isNull(multiparkBookings.cancelledAt)
  ];
  if (projectIds) forecastConds.push(inArray(multiparkBookings.projectId, projectIds));
  const forecastRows = await db2.select({
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(multiparkBookings.projectId, projects.id)).where(and(...forecastConds)).groupBy(multiparkBookings.projectId, projects.name);
  const checkOutBucket = bucketSqlExpr(multiparkBookings.checkOut, granularity);
  const issueBucket = bucketSqlExpr(invoices.issueDate, granularity);
  const expenseDateBucket = bucketSqlExpr(expenses.expenseDate, granularity);
  const checkInBucket = bucketSqlExpr(multiparkBookings.checkIn, granularity);
  const mktDateBucket = bucketSqlExpr(marketingExpenses.date, granularity);
  const adsDateBucket = bucketSqlExpr(campaignDailyStats.date, granularity);
  const tsProduced = await db2.select({ bucket: checkOutBucket, total: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...deliveryConds)).groupBy(checkOutBucket);
  const tsInvoiced = await db2.select({ bucket: issueBucket, total: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` }).from(invoices).where(and(...invConds)).groupBy(issueBucket);
  const tsExpensesPaid = await db2.select({ bucket: expenseDateBucket, total: sql`COALESCE(SUM(${expenses.amount}), 0)` }).from(expenses).where(and(...insertedConds)).groupBy(expenseDateBucket);
  const tsForecast = await db2.select({ bucket: checkInBucket, total: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...forecastConds)).groupBy(checkInBucket);
  const tsMktExpenses = await db2.select({ bucket: mktDateBucket, total: sql`COALESCE(SUM(${marketingExpenses.amount}), 0)` }).from(marketingExpenses).where(and(...mktExpConds)).groupBy(mktDateBucket);
  const tsMktAds = await db2.select({ bucket: adsDateBucket, total: sql`COALESCE(SUM(${campaignDailyStats.spend}), 0)` }).from(campaignDailyStats).innerJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id)).where(and(...mktAdsConds)).groupBy(adsDateBucket);
  const tsSalariesTotal = Array.from(salaryPerProject.values()).reduce((s, v) => s + v, 0);
  const tsSalesTotal = salesCommissions.reduce((s, c) => s + c.commission, 0);
  const tsPartnersTotal = operationalPartnersTotal + tsSalesTotal;
  const tsExtrasTotal = extrasDiaSummary.reduce((s, r) => s + r.cost, 0);
  function emptyPoint(bk) {
    return { bucket: bk, produced: 0, invoiced: 0, expenses: 0, marketingCost: 0, salaries: 0, partners: 0, extrasCost: 0, revenueForecast: 0, totalCost: 0, margin: 0, expensesPaid: 0 };
  }
  const tsMap = /* @__PURE__ */ new Map();
  function bump(arr, key) {
    for (const r of arr) {
      const bk = r.bucket;
      if (!bk) continue;
      const ex = tsMap.get(bk) ?? emptyPoint(bk);
      ex[key] += Number(r.total ?? 0);
      tsMap.set(bk, ex);
    }
  }
  bump(tsProduced, "produced");
  bump(tsInvoiced, "invoiced");
  bump(tsExpensesPaid, "expenses");
  bump(tsForecast, "revenueForecast");
  bump(tsMktExpenses, "marketingCost");
  bump(tsMktAds, "marketingCost");
  const producedBuckets = tsProduced.filter((r) => r.bucket).map((r) => ({ bucket: r.bucket, weight: Number(r.total ?? 0) }));
  const producedWeightSum = producedBuckets.reduce((s, b) => s + b.weight, 0);
  function distribute(total, key) {
    if (!total) return;
    const useWeight = producedBuckets.length > 0 && producedWeightSum > 0;
    const targets = producedBuckets.length > 0 ? producedBuckets : Array.from(tsMap.keys()).map((bk) => ({ bucket: bk, weight: 1 }));
    if (targets.length === 0) return;
    const weightSum = useWeight ? producedWeightSum : targets.length;
    for (const t2 of targets) {
      const share = total * ((useWeight ? t2.weight : 1) / weightSum);
      const ex = tsMap.get(t2.bucket) ?? emptyPoint(t2.bucket);
      ex[key] += share;
      tsMap.set(t2.bucket, ex);
    }
  }
  distribute(tsSalariesTotal, "salaries");
  distribute(tsPartnersTotal, "partners");
  distribute(tsExtrasTotal, "extrasCost");
  for (const p of tsMap.values()) {
    p.totalCost = p.expenses + p.marketingCost + p.salaries + p.partners + p.extrasCost;
    p.margin = p.produced - p.totalCost;
    p.expensesPaid = p.expenses;
  }
  const timeseries = Array.from(tsMap.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
  const produced = deliveryRows.reduce((s, r) => s + Number(r.totalRevenue ?? 0), 0);
  const invoiced = invoicedRows.reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);
  const expensesPaidTotal = expPaidRows.reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);
  const expensesPendingTotal = expPendRows.reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);
  const extrasDiaCost = extrasDiaSummary.reduce((s, r) => s + r.cost, 0);
  const mktExpensesTotal = mktExpRows.reduce((s, r) => s + Number(r.totalAmount ?? 0), 0);
  const mktAdsSpend = mktAdsRows.reduce((s, r) => s + Number(r.totalSpend ?? 0), 0);
  const marketingCost = mktExpensesTotal + mktAdsSpend;
  const operationalPartnersPaid = operationalPartnersTotal;
  const operationalPartnersPending = 0;
  const salesCommissionsTotal = salesCommissions.reduce((s, r) => s + r.commission, 0);
  const totalSalaries = Array.from(salaryPerProject.values()).reduce((s, v) => s + v, 0);
  const totalCostsPaid = expensesPaidTotal + extrasDiaCost + marketingCost + operationalPartnersPaid + salesCommissionsTotal + totalSalaries;
  const totalCostsAll = totalCostsPaid + expensesPendingTotal + operationalPartnersPending;
  const summary = {
    produced,
    invoiced,
    expensesPaid: expensesPaidTotal,
    expensesPending: expensesPendingTotal,
    extrasDiaCost,
    marketingCost,
    salariesCost: totalSalaries,
    salesCommissions: salesCommissionsTotal,
    // back-compat
    partnerCommissionsPaid: operationalPartnersPaid,
    partnerCommissionsPending: operationalPartnersPending,
    operationalPartnersPaid,
    operationalPartnersPending,
    totalCostsPaid,
    totalCostsAll,
    marginRealized: produced - totalCostsPaid,
    marginAll: produced - totalCostsAll,
    periodDays
  };
  return {
    summary,
    timeseries,
    granularity,
    range: { from: filters.from, to: filters.to },
    // Mantém os blocos antigos para back-compat / drilldown
    deliveries: deliveryRows,
    expensesPaid: expPaidRows,
    expensesPending: expPendRows,
    forecast: forecastRows,
    // Novos blocos para drilldown
    invoices: invoicedRows,
    extrasDia: extrasDiaSummary,
    marketing: { expenses: mktExpRows, ads: mktAdsRows },
    partnerCommissions: [],
    // back-compat (deixou de vir de partnership_invoices)
    salesCommissions,
    // comissões parceiros de venda por projeto
    operationalPartners,
    // parceiros operacionais: comissão s/ reservas dos projetos operados
    salaries: {
      byProject: salariesByProject,
      details: salaryDetailRows,
      total: totalSalaries
    }
  };
}
async function getPartnershipAnalytics(filters) {
  const db2 = await getDb();
  if (!db2) return { partners: [], proBookings: [], totals: { partnerBookings: 0, partnerRevenue: 0, directBookings: 0, directRevenue: 0, proBookings: 0, proRevenue: 0 } };
  let projectIds;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const baseConds = [
    isNotNull(multiparkBookings.checkOut),
    gte(multiparkBookings.checkOut, toMysqlDateTime(new Date(filters.from))),
    lte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59")))
  ];
  if (projectIds) baseConds.push(inArray(multiparkBookings.projectId, projectIds));
  const partnerRows = await db2.select({
    campaign: multiparkBookings.campaign,
    city: multiparkBookings.city,
    parkName: multiparkBookings.parkName,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`,
    avgPrice: sql`COALESCE(AVG(${multiparkBookings.totalPrice}), 0)`,
    totalDiscount: sql`COALESCE(SUM(${multiparkBookings.discount}), 0)`
  }).from(multiparkBookings).where(and(...baseConds, isNotNull(multiparkBookings.campaign))).groupBy(multiparkBookings.campaign, multiparkBookings.city, multiparkBookings.parkName);
  const allRows = await db2.select({
    hasPartner: sql`CASE WHEN ${multiparkBookings.campaign} IS NOT NULL AND ${multiparkBookings.campaign} != '' THEN 1 ELSE 0 END`,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...baseConds)).groupBy(sql`CASE WHEN ${multiparkBookings.campaign} IS NOT NULL AND ${multiparkBookings.campaign} != '' THEN 1 ELSE 0 END`);
  const proRows = await db2.select({
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(
    ...baseConds,
    sql`JSON_EXTRACT(${multiparkBookings.rawJson}, '$.park.isPro') = true`
  )).groupBy(multiparkBookings.parkName, multiparkBookings.city);
  let partnerBookings = 0, partnerRevenue = 0, directBookings = 0, directRevenue = 0;
  for (const r of allRows) {
    if (Number(r.hasPartner) === 1) {
      partnerBookings = Number(r.count);
      partnerRevenue = Number(r.totalRevenue);
    } else {
      directBookings = Number(r.count);
      directRevenue = Number(r.totalRevenue);
    }
  }
  const proBookingsTotal = proRows.reduce((s, r) => s + Number(r.count), 0);
  const proRevenueTotal = proRows.reduce((s, r) => s + Number(r.totalRevenue), 0);
  return {
    partners: partnerRows.map((r) => ({
      campaign: r.campaign,
      city: r.city,
      parkName: r.parkName,
      count: Number(r.count),
      totalRevenue: Number(r.totalRevenue),
      avgPrice: Number(r.avgPrice),
      totalDiscount: Number(r.totalDiscount)
    })),
    proBookings: proRows.map((r) => ({
      parkName: r.parkName,
      city: r.city,
      count: Number(r.count),
      totalRevenue: Number(r.totalRevenue)
    })),
    totals: {
      partnerBookings,
      partnerRevenue,
      directBookings,
      directRevenue,
      proBookings: proBookingsTotal,
      proRevenue: proRevenueTotal
    }
  };
}
async function getBookingsByCampaign(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  let projectIds;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const conds = [
    eq(multiparkBookings.campaign, filters.campaignKey),
    isNotNull(multiparkBookings.checkOut),
    gte(multiparkBookings.checkOut, toMysqlDateTime(new Date(filters.from))),
    lte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59")))
  ];
  if (projectIds) conds.push(inArray(multiparkBookings.projectId, projectIds));
  const rows = await db2.select({
    id: multiparkBookings.id,
    bookingNumber: multiparkBookings.bookingNumber,
    clientFirstName: multiparkBookings.clientFirstName,
    clientLastName: multiparkBookings.clientLastName,
    licensePlate: multiparkBookings.licensePlate,
    checkIn: multiparkBookings.checkIn,
    checkOut: multiparkBookings.checkOut,
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city,
    totalPrice: multiparkBookings.totalPrice,
    discount: multiparkBookings.discount,
    parkingPrice: multiparkBookings.parkingPrice,
    deliveryCharges: multiparkBookings.deliveryCharges,
    extrasTotal: multiparkBookings.extrasTotal
  }).from(multiparkBookings).where(and(...conds)).orderBy(desc(multiparkBookings.checkOut));
  return rows.map((r) => ({
    ...r,
    totalPrice: Number(r.totalPrice ?? 0),
    discount: Number(r.discount ?? 0),
    parkingPrice: Number(r.parkingPrice ?? 0),
    deliveryCharges: Number(r.deliveryCharges ?? 0),
    extrasTotal: Number(r.extrasTotal ?? 0)
  }));
}
async function createPartnership(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(partnerships).values(data).$returningId();
  return result?.id;
}
async function getPartnerships(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.partnerType) conditions.push(eq(partnerships.partnerType, filters.partnerType));
  if (filters?.status) conditions.push(eq(partnerships.partnerStatus, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(partnerships).where(where).orderBy(desc(partnerships.createdAt));
}
async function inferPartnersFromBookings() {
  const db2 = await getDb();
  if (!db2) return [];
  const [rawRows] = await db2.execute(sql`
    SELECT
      JSON_UNQUOTE(JSON_EXTRACT(rawJson, '$.partnerId')) AS partnerId,
      paymentMethod,
      remarks,
      totalPrice
    FROM multipark_bookings
    WHERE (rawJson LIKE '%partnerId%' AND JSON_EXTRACT(rawJson, '$.partnerId') IS NOT NULL)
       OR paymentMethod IS NOT NULL
  `);
  const byPartner = /* @__PURE__ */ new Map();
  const byPaymentNoPartner = /* @__PURE__ */ new Map();
  for (const r of rawRows) {
    const pid = r.partnerId;
    const tp = r.totalPrice ? parseFloat(String(r.totalPrice)) : 0;
    const tpVal = Number.isFinite(tp) ? tp : 0;
    if (pid) {
      let agg = byPartner.get(pid);
      if (!agg) {
        agg = { bookings: 0, totalValue: 0, paymentMethods: /* @__PURE__ */ new Map(), remarksSample: null };
        byPartner.set(pid, agg);
      }
      agg.bookings++;
      agg.totalValue += tpVal;
      if (r.paymentMethod) {
        agg.paymentMethods.set(r.paymentMethod, (agg.paymentMethods.get(r.paymentMethod) ?? 0) + 1);
      }
      if (!agg.remarksSample && r.remarks) agg.remarksSample = r.remarks;
    } else if (r.paymentMethod) {
      const key = r.paymentMethod;
      let agg = byPaymentNoPartner.get(key);
      if (!agg) {
        agg = { bookings: 0, totalValue: 0, paymentMethods: /* @__PURE__ */ new Map(), remarksSample: null };
        byPaymentNoPartner.set(key, agg);
      }
      agg.bookings++;
      agg.totalValue += tpVal;
      if (!agg.remarksSample && r.remarks) agg.remarksSample = r.remarks;
    }
  }
  const aliasIndex = /* @__PURE__ */ new Map();
  const aliases = await db2.select({
    partnershipId: partnerAliases.partnershipId,
    aliasType: partnerAliases.aliasType,
    aliasValue: partnerAliases.aliasValue
  }).from(partnerAliases);
  const partnersById = /* @__PURE__ */ new Map();
  const partnersAll = await db2.select({ id: partnerships.id, name: partnerships.name }).from(partnerships);
  for (const p of partnersAll) partnersById.set(p.id, p.name);
  for (const a of aliases) {
    const key = `${a.aliasType}:${a.aliasValue}`;
    const name = partnersById.get(a.partnershipId);
    if (name) aliasIndex.set(key, { id: a.partnershipId, name });
  }
  function firstAlphaToken(s) {
    if (!s) return null;
    const m = s.match(/^\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9_-]+)/);
    return m ? m[1] : null;
  }
  function topPayment(m) {
    let best = null;
    for (const [k, v] of m) if (!best || v > best[1]) best = [k, v];
    return best ? best[0] : null;
  }
  const GENERIC = /^(online|multibanco|numerário|numerario|dinheiro|no pay|stripe|wallet|allowance|pro_plan|cash|multbanco|sibs|transferencia)/i;
  const result = [];
  for (const [pid, agg] of byPartner) {
    const top = topPayment(agg.paymentMethods);
    const fromPayment = top && !GENERIC.test(top.trim()) ? top : null;
    const fromRemarks = firstAlphaToken(agg.remarksSample);
    const suggestedName = fromPayment ?? fromRemarks ?? "Desconhecido";
    const linked = aliasIndex.get(`multipark_partner_id:${pid}`);
    result.push({
      aliasType: "multipark_partner_id",
      aliasValue: pid,
      suggestedName,
      paymentMethod: top,
      remarksSample: agg.remarksSample,
      bookings: agg.bookings,
      totalValue: Math.round(agg.totalValue * 100) / 100,
      linkedPartnershipId: linked?.id ?? null,
      linkedPartnershipName: linked?.name ?? null
    });
  }
  for (const [pm, agg] of byPaymentNoPartner) {
    if (GENERIC.test(pm.trim())) continue;
    const linked = aliasIndex.get(`payment_method:${pm}`);
    result.push({
      aliasType: "payment_method",
      aliasValue: pm,
      suggestedName: pm,
      paymentMethod: pm,
      remarksSample: agg.remarksSample,
      bookings: agg.bookings,
      totalValue: Math.round(agg.totalValue * 100) / 100,
      linkedPartnershipId: linked?.id ?? null,
      linkedPartnershipName: linked?.name ?? null
    });
  }
  result.sort((a, b) => b.bookings - a.bookings);
  return result;
}
async function addPartnerAlias(partnershipId, aliasType, aliasValue, applyToBookings) {
  const db2 = await getDb();
  if (!db2) return 0;
  try {
    await db2.insert(partnerAliases).values({ partnershipId, aliasType, aliasValue });
  } catch (err) {
    if (!String(err.message).includes("Duplicate")) throw err;
  }
  if (!applyToBookings) return 0;
  const [p] = await db2.select({ name: partnerships.name }).from(partnerships).where(eq(partnerships.id, partnershipId)).limit(1);
  if (!p) return 0;
  if (aliasType === "multipark_partner_id") {
    const [r] = await db2.execute(sql`
      UPDATE multipark_bookings
      SET campaign = ${p.name}
      WHERE JSON_UNQUOTE(JSON_EXTRACT(rawJson, '$.partnerId')) = ${aliasValue}
    `);
    return r.affectedRows ?? 0;
  } else {
    const [r] = await db2.execute(sql`
      UPDATE multipark_bookings
      SET campaign = ${p.name}
      WHERE paymentMethod = ${aliasValue}
        AND (rawJson NOT LIKE '%partnerId%' OR JSON_EXTRACT(rawJson, '$.partnerId') IS NULL)
    `);
    return r.affectedRows ?? 0;
  }
}
async function getPartnerInvoicingSummary(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const fromStr = toMysqlDateTime(new Date(filters.from));
  const toStr = toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59"));
  const msPerDay = 1e3 * 60 * 60 * 24;
  const periodDays = Math.max(
    1,
    Math.floor((new Date(filters.to).getTime() - new Date(filters.from).getTime()) / msPerDay) + 1
  );
  const monthFraction = periodDays / 30;
  const yearFraction = periodDays / 365;
  const partnerRows = await db2.select({
    id: partnerships.id,
    name: partnerships.name,
    partnerType: partnerships.partnerType,
    commissionRate: partnerships.commissionRate,
    monthlyFee: partnerships.monthlyFee,
    notes: partnerships.notes
  }).from(partnerships).where(filters.partnerType ? eq(partnerships.partnerType, filters.partnerType) : void 0);
  if (partnerRows.length === 0) return [];
  const { parsePartnerConfig: parsePartnerConfig2 } = await Promise.resolve().then(() => (init_partnerTypes(), partnerTypes_exports));
  const aliasRows = await db2.select({
    partnershipId: partnerAliases.partnershipId,
    aliasValue: partnerAliases.aliasValue
  }).from(partnerAliases);
  const bookingRows = await db2.select({
    campaign: multiparkBookings.campaign,
    bookingsCount: sql`COUNT(*)`,
    revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(
    and(
      isNotNull(multiparkBookings.campaign),
      sql`${multiparkBookings.status} != 'CANCELLED'`,
      gte(multiparkBookings.checkOut, fromStr),
      lte(multiparkBookings.checkOut, toStr)
    )
  ).groupBy(multiparkBookings.campaign);
  const keyToPartner = /* @__PURE__ */ new Map();
  function reg(rawKey, partnerId) {
    if (!rawKey) return;
    const k = rawKey.trim().toLowerCase();
    if (k && !keyToPartner.has(k)) keyToPartner.set(k, partnerId);
  }
  for (const p of partnerRows) {
    reg(p.name, p.id);
  }
  for (const a of aliasRows) {
    reg(a.aliasValue, a.partnershipId);
  }
  const bookingsByPartner = /* @__PURE__ */ new Map();
  for (const b of bookingRows) {
    const k = (b.campaign ?? "").trim().toLowerCase();
    const pid = keyToPartner.get(k);
    if (!pid) continue;
    const existing = bookingsByPartner.get(pid) ?? { count: 0, revenue: 0 };
    existing.count += Number(b.bookingsCount ?? 0);
    existing.revenue += Number(b.revenue ?? 0);
    bookingsByPartner.set(pid, existing);
  }
  const invRows = await db2.select({
    partnershipId: partnershipInvoices.partnershipId,
    status: partnershipInvoices.invoiceStatus,
    total: sql`COALESCE(SUM(${partnershipInvoices.amount}), 0)`,
    count: sql`COUNT(*)`
  }).from(partnershipInvoices).where(
    and(
      gte(partnershipInvoices.sentAt, fromStr),
      lte(partnershipInvoices.sentAt, toStr),
      sql`${partnershipInvoices.invoiceStatus} != 'cancelled'`
    )
  ).groupBy(partnershipInvoices.partnershipId, partnershipInvoices.invoiceStatus);
  const invByPartner = /* @__PURE__ */ new Map();
  for (const r of invRows) {
    const ex = invByPartner.get(r.partnershipId) ?? { faturado: 0, emAtraso: 0, emAtrasoCount: 0 };
    const amount = Number(r.total ?? 0);
    ex.faturado += amount;
    if (r.status === "overdue") {
      ex.emAtraso += amount;
      ex.emAtrasoCount += Number(r.count ?? 0);
    }
    invByPartner.set(r.partnershipId, ex);
  }
  const operationalPartners = partnerRows.filter((p) => (p.partnerType ?? "outro") === "operacional").map((p) => ({ p, cfg: parsePartnerConfig2(p.notes ?? null) })).filter(({ cfg }) => Array.isArray(cfg.operatesProjects) && cfg.operatesProjects.length > 0);
  const operationalRevenueByPartner = /* @__PURE__ */ new Map();
  if (operationalPartners.length > 0) {
    const allOperatedRaw = /* @__PURE__ */ new Set();
    for (const { cfg } of operationalPartners) {
      for (const pid of cfg.operatesProjects ?? []) allOperatedRaw.add(pid);
    }
    const expanded = /* @__PURE__ */ new Set();
    for (const root of allOperatedRaw) {
      const ids = await resolveProjectIds(root);
      for (const pid of ids) expanded.add(pid);
    }
    if (expanded.size > 0) {
      const opBookings = await db2.select({
        projectId: multiparkBookings.projectId,
        count: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(
        and(
          sql`${multiparkBookings.status} != 'CANCELLED'`,
          gte(multiparkBookings.checkOut, fromStr),
          lte(multiparkBookings.checkOut, toStr),
          inArray(multiparkBookings.projectId, Array.from(expanded))
        )
      ).groupBy(multiparkBookings.projectId);
      const revenueByProject = /* @__PURE__ */ new Map();
      for (const r of opBookings) {
        if (r.projectId == null) continue;
        revenueByProject.set(r.projectId, {
          count: Number(r.count ?? 0),
          revenue: Number(r.revenue ?? 0)
        });
      }
      for (const { p, cfg } of operationalPartners) {
        let count = 0;
        let revenue = 0;
        const cover = /* @__PURE__ */ new Set();
        for (const root of cfg.operatesProjects ?? []) {
          const ids = await resolveProjectIds(root);
          for (const pid of ids) cover.add(pid);
        }
        for (const pid of cover) {
          const r = revenueByProject.get(pid);
          if (r) {
            count += r.count;
            revenue += r.revenue;
          }
        }
        operationalRevenueByPartner.set(p.id, { count, revenue });
      }
    }
  }
  return partnerRows.map((p) => {
    const bk = bookingsByPartner.get(p.id) ?? { count: 0, revenue: 0 };
    const inv = invByPartner.get(p.id) ?? { faturado: 0, emAtraso: 0, emAtrasoCount: 0 };
    const opRev = operationalRevenueByPartner.get(p.id);
    const commissionRate = Number(p.commissionRate ?? 0);
    const monthlyFee = Number(p.monthlyFee ?? 0);
    const partnerType = p.partnerType ?? "outro";
    let aFaturar = 0;
    let displayBookingsCount = bk.count;
    let displayRevenue = bk.revenue;
    if (partnerType === "avenca_mensal") {
      aFaturar = monthlyFee * monthFraction;
    } else if (partnerType === "avenca_anual") {
      aFaturar = monthlyFee * yearFraction;
    } else if (partnerType === "operacional") {
      const revenue = opRev?.revenue ?? bk.revenue;
      displayRevenue = revenue;
      displayBookingsCount = opRev?.count ?? bk.count;
      aFaturar = revenue * commissionRate / 100;
    } else if (partnerType === "agregador" || partnerType === "agencia_viagem" || partnerType === "hotel" || partnerType === "companhia_aerea" || partnerType === "afiliado") {
      aFaturar = bk.revenue * commissionRate / 100;
    } else if (partnerType === "cliente_pro") {
      aFaturar = bk.revenue;
    }
    const pendente = Math.max(0, aFaturar - inv.faturado);
    return {
      partnershipId: p.id,
      partnerName: p.name,
      partnerType,
      commissionRate,
      monthlyFee,
      bookingsCount: displayBookingsCount,
      revenueGross: displayRevenue,
      aFaturar,
      faturado: inv.faturado,
      emAtraso: inv.emAtraso,
      pendente,
      faturasEmAtrasoCount: inv.emAtrasoCount
    };
  }).sort((a, b) => b.aFaturar - a.aFaturar);
}
async function getPartnerInvoicingDetailByType(filters) {
  const db2 = await getDb();
  if (!db2) return { partnerType: filters.partnerType, partners: [] };
  const fromStr = toMysqlDateTime(new Date(filters.from));
  const toStr = toMysqlDateTime(/* @__PURE__ */ new Date(filters.to + "T23:59:59"));
  const msPerDay = 1e3 * 60 * 60 * 24;
  const periodDays = Math.max(
    1,
    Math.floor((new Date(filters.to).getTime() - new Date(filters.from).getTime()) / msPerDay) + 1
  );
  const monthFraction = periodDays / 30;
  const yearFraction = periodDays / 365;
  const { parsePartnerConfig: parsePartnerConfig2 } = await Promise.resolve().then(() => (init_partnerTypes(), partnerTypes_exports));
  const partnerRows = await db2.select({
    id: partnerships.id,
    name: partnerships.name,
    partnerType: partnerships.partnerType,
    commissionRate: partnerships.commissionRate,
    monthlyFee: partnerships.monthlyFee,
    notes: partnerships.notes
  }).from(partnerships).where(eq(partnerships.partnerType, filters.partnerType));
  if (partnerRows.length === 0) return { partnerType: filters.partnerType, partners: [] };
  const aliasRows = await db2.select({
    partnershipId: partnerAliases.partnershipId,
    aliasValue: partnerAliases.aliasValue
  }).from(partnerAliases);
  const keyToPartner = /* @__PURE__ */ new Map();
  function reg(k, pid) {
    if (!k) return;
    const x = k.trim().toLowerCase();
    if (x && !keyToPartner.has(x)) keyToPartner.set(x, pid);
  }
  for (const p of partnerRows) reg(p.name, p.id);
  for (const a of aliasRows) reg(a.aliasValue, a.partnershipId);
  const bookingRows = await db2.select({
    campaign: multiparkBookings.campaign,
    projectId: multiparkBookings.projectId,
    count: sql`COUNT(*)`,
    revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`,
    discount: sql`COALESCE(SUM(${multiparkBookings.discount}), 0)`,
    extras: sql`COALESCE(SUM(${multiparkBookings.extrasTotal}), 0)`
  }).from(multiparkBookings).where(
    and(
      isNotNull(multiparkBookings.campaign),
      sql`${multiparkBookings.status} != 'CANCELLED'`,
      gte(multiparkBookings.checkOut, fromStr),
      lte(multiparkBookings.checkOut, toStr)
    )
  ).groupBy(multiparkBookings.campaign, multiparkBookings.projectId);
  const byPartner = /* @__PURE__ */ new Map();
  for (const b of bookingRows) {
    const k = (b.campaign ?? "").trim().toLowerCase();
    const pid = keyToPartner.get(k);
    if (!pid) continue;
    const ex = byPartner.get(pid) ?? { count: 0, revenue: 0, discount: 0, extras: 0 };
    ex.count += Number(b.count ?? 0);
    ex.revenue += Number(b.revenue ?? 0);
    ex.discount += Number(b.discount ?? 0);
    ex.extras += Number(b.extras ?? 0);
    byPartner.set(pid, ex);
  }
  const operationalRevenueByPartner = /* @__PURE__ */ new Map();
  if (filters.partnerType === "operacional") {
    for (const p of partnerRows) {
      const cfg = parsePartnerConfig2(p.notes ?? null);
      const operatedRoots = cfg.operatesProjects ?? [];
      if (operatedRoots.length === 0) continue;
      const expanded = /* @__PURE__ */ new Set();
      for (const root of operatedRoots) {
        const ids = await resolveProjectIds(root);
        for (const pid of ids) expanded.add(pid);
      }
      if (expanded.size === 0) continue;
      const rows = await db2.select({
        count: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(
        and(
          sql`${multiparkBookings.status} != 'CANCELLED'`,
          gte(multiparkBookings.checkOut, fromStr),
          lte(multiparkBookings.checkOut, toStr),
          inArray(multiparkBookings.projectId, Array.from(expanded))
        )
      );
      operationalRevenueByPartner.set(p.id, {
        count: Number(rows[0]?.count ?? 0),
        revenue: Number(rows[0]?.revenue ?? 0)
      });
    }
  }
  const partners = partnerRows.map((p) => {
    const cfg = parsePartnerConfig2(p.notes ?? null);
    const cashbackPercent = Number(cfg.cashbackPercent ?? 0);
    const prizeBudget = Number(cfg.prizeBudget ?? 0);
    const commissionRate = Number(p.commissionRate ?? 0);
    const monthlyFee = Number(p.monthlyFee ?? 0);
    const bk = byPartner.get(p.id) ?? { count: 0, revenue: 0, discount: 0, extras: 0 };
    const opRev = operationalRevenueByPartner.get(p.id);
    let bookingsCount = bk.count;
    let revenueGross = bk.revenue;
    let aFaturar = 0;
    const cashbackAmount = bk.revenue * cashbackPercent / 100;
    if (filters.partnerType === "operacional" && opRev) {
      bookingsCount = opRev.count;
      revenueGross = opRev.revenue;
      aFaturar = opRev.revenue * commissionRate / 100;
    } else if (filters.partnerType === "avenca_mensal") {
      aFaturar = monthlyFee * monthFraction;
    } else if (filters.partnerType === "avenca_anual") {
      aFaturar = monthlyFee * yearFraction;
    } else if (filters.partnerType === "agregador" || filters.partnerType === "agencia_viagem" || filters.partnerType === "hotel" || filters.partnerType === "companhia_aerea" || filters.partnerType === "afiliado") {
      aFaturar = bk.revenue * commissionRate / 100;
    } else if (filters.partnerType === "cliente_pro") {
      aFaturar = bk.revenue;
    }
    return {
      partnershipId: p.id,
      partnerName: p.name,
      commissionRate,
      monthlyFee,
      bookingsCount,
      revenueGross,
      discountTotal: bk.discount,
      extrasTotal: bk.extras,
      cashbackPercent,
      cashbackAmount,
      prizeBudget,
      operatesProjectsCount: (cfg.operatesProjects ?? []).length,
      aFaturar,
      notes: p.notes ?? null
    };
  }).sort((a, b) => b.aFaturar - a.aFaturar);
  return { partnerType: filters.partnerType, partners };
}
async function listPartnerAliases(partnershipId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(partnerAliases).where(eq(partnerAliases.partnershipId, partnershipId));
}
async function aliasCountsByPartner() {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    partnershipId: partnerAliases.partnershipId,
    aliasType: partnerAliases.aliasType,
    aliasValue: partnerAliases.aliasValue,
    partnershipName: partnerships.name
  }).from(partnerAliases).leftJoin(partnerships, eq(partnerships.id, partnerAliases.partnershipId));
  const map = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const entry = map.get(r.partnershipId) ?? { partnershipName: r.partnershipName, partnerIds: [], paymentMethods: [] };
    if (r.aliasType === "multipark_partner_id") entry.partnerIds.push(r.aliasValue);
    else entry.paymentMethods.push(r.aliasValue);
    map.set(r.partnershipId, entry);
  }
  return Array.from(map.entries()).map(([id, v]) => ({
    partnershipId: id,
    partnershipName: v.partnershipName,
    partnerIds: v.partnerIds,
    paymentMethods: v.paymentMethods,
    total: v.partnerIds.length + v.paymentMethods.length
  })).sort((a, b) => b.total - a.total);
}
async function deletePartnerAlias(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(partnerAliases).where(eq(partnerAliases.id, id));
}
async function linkMultiparkPartnerId(partnershipId, multiparkPartnerId, applyToBookings) {
  const db2 = await getDb();
  if (!db2) return 0;
  await db2.update(partnerships).set({ multiparkPartnerId }).where(eq(partnerships.id, partnershipId));
  if (!applyToBookings) return 0;
  const [p] = await db2.select({ name: partnerships.name }).from(partnerships).where(eq(partnerships.id, partnershipId)).limit(1);
  if (!p) return 0;
  const [result] = await db2.execute(sql`
    UPDATE multipark_bookings
    SET campaign = ${p.name}
    WHERE JSON_UNQUOTE(JSON_EXTRACT(rawJson, '$.partnerId')) = ${multiparkPartnerId}
  `);
  return result.affectedRows ?? 0;
}
async function getPartnershipById(id) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(partnerships).where(eq(partnerships.id, id)).limit(1);
  return rows[0] || null;
}
async function updatePartnership(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(partnerships).set(data).where(eq(partnerships.id, id));
}
async function deletePartnership(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(partnershipTransactions).where(eq(partnershipTransactions.partnershipId, id));
  await db2.delete(partnerships).where(eq(partnerships.id, id));
}
async function createPartnershipTransaction(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(partnershipTransactions).values(data).$returningId();
  return result?.id;
}
async function getPartnershipTransactions(partnershipId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(partnershipTransactions).where(eq(partnershipTransactions.partnershipId, partnershipId)).orderBy(desc(partnershipTransactions.transactionDate));
}
async function createPartnershipInvoice(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(partnershipInvoices).values(data).$returningId();
  return result?.id;
}
async function getPartnershipInvoices(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.partnershipId) conditions.push(eq(partnershipInvoices.partnershipId, filters.partnershipId));
  if (filters?.status) conditions.push(eq(partnershipInvoices.invoiceStatus, filters.status));
  if (filters?.year) conditions.push(eq(partnershipInvoices.referenceYear, filters.year));
  if (filters?.month) conditions.push(eq(partnershipInvoices.referenceMonth, filters.month));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(partnershipInvoices).where(where).orderBy(desc(partnershipInvoices.createdAt));
}
async function updatePartnershipInvoice(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(partnershipInvoices).set(data).where(eq(partnershipInvoices.id, id));
}
async function deletePartnershipInvoice(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(partnershipInvoices).where(eq(partnershipInvoices.id, id));
}
async function markOverduePartnershipInvoices() {
  const db2 = await getDb();
  if (!db2) return 0;
  const now = /* @__PURE__ */ new Date();
  const result = await db2.update(partnershipInvoices).set({ invoiceStatus: "overdue" }).where(
    and(
      eq(partnershipInvoices.invoiceStatus, "sent"),
      sql`${partnershipInvoices.dueDate} < ${toMysqlDateTime(now)}`
    )
  );
  return result[0]?.affectedRows || 0;
}
async function getPartnershipDashboardStats() {
  const db2 = await getDb();
  if (!db2) return null;
  const allPartners = await db2.select().from(partnerships);
  const allInvoices = await db2.select().from(partnershipInvoices);
  const allTx = await db2.select().from(partnershipTransactions);
  const totalPartners = allPartners.length;
  const activePartners = allPartners.filter((p) => p.partnerStatus === "active").length;
  const byType = {};
  allPartners.forEach((p) => {
    byType[p.partnerType] = (byType[p.partnerType] || 0) + 1;
  });
  const pendingInvoices = allInvoices.filter((i) => i.invoiceStatus === "sent");
  const overdueInvoices = allInvoices.filter((i) => i.invoiceStatus === "overdue");
  const paidInvoices = allInvoices.filter((i) => i.invoiceStatus === "paid");
  const totalPending = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = paidInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalBookings = allTx.filter((t2) => t2.transactionType === "booking").reduce((s, t2) => s + (t2.amount || 0), 0);
  const partnerSummaries = allPartners.map((p) => {
    const pInvoices = allInvoices.filter((i) => i.partnershipId === p.id);
    const pTx = allTx.filter((t2) => t2.partnershipId === p.id);
    const pending = pInvoices.filter((i) => i.invoiceStatus === "sent").reduce((s, i) => s + (i.amount || 0), 0);
    const overdue = pInvoices.filter((i) => i.invoiceStatus === "overdue").reduce((s, i) => s + (i.amount || 0), 0);
    const paid = pInvoices.filter((i) => i.invoiceStatus === "paid").reduce((s, i) => s + (i.amount || 0), 0);
    const bookings = pTx.filter((t2) => t2.transactionType === "booking").reduce((s, t2) => s + (t2.amount || 0), 0);
    return {
      ...p,
      invoicesPending: pending,
      invoicesOverdue: overdue,
      invoicesPaid: paid,
      totalBookings: bookings,
      invoiceCount: pInvoices.length,
      hasOverdue: overdue > 0
    };
  });
  return {
    totalPartners,
    activePartners,
    byType,
    totalPending,
    totalOverdue,
    totalPaid,
    totalBookings,
    pendingCount: pendingInvoices.length,
    overdueCount: overdueInvoices.length,
    partnerSummaries
  };
}
async function createAnnualReport(data) {
  const db2 = await getDb();
  if (!db2) return null;
  const [result] = await db2.insert(annualReports).values(data).$returningId();
  return result?.id;
}
async function getAnnualReports(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.year) conditions.push(eq(annualReports.year, filters.year));
  if (filters?.projectId) conditions.push(eq(annualReports.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(annualReports).where(where).orderBy(annualReports.month);
}
async function updateAnnualReport(id, data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(annualReports).set(data).where(eq(annualReports.id, id));
}
async function deleteAnnualReport(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(annualReports).where(eq(annualReports.id, id));
}
async function getAnnualBreakdown(year, projectId) {
  const db2 = await getDb();
  if (!db2) return [];
  const VAT_RATE = 0.23;
  let projectIds;
  if (projectId) projectIds = await resolveProjectIds(projectId);
  const revConds = [
    gte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-01-01`))),
    lte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-12-31T23:59:59`))),
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ];
  if (projectIds) revConds.push(inArray(multiparkBookings.projectId, projectIds));
  const revenueRows = await db2.select({
    month: sql`MONTH(${multiparkBookings.checkOut})`,
    total: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...revConds)).groupBy(sql`MONTH(${multiparkBookings.checkOut})`);
  const expConds = [
    sql`${expenses.status} != 'cancelled'`,
    gte(expenses.expenseDate, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-01-01`))),
    lte(expenses.expenseDate, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-12-31T23:59:59`)))
  ];
  if (projectIds) expConds.push(inArray(expenses.projectId, projectIds));
  const expenseRows = await db2.select({
    month: sql`MONTH(${expenses.expenseDate})`,
    total: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).where(and(...expConds)).groupBy(sql`MONTH(${expenses.expenseDate})`);
  const mktExpConds = [
    gte(marketingExpenses.date, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-01-01`))),
    lte(marketingExpenses.date, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-12-31T23:59:59`)))
  ];
  if (projectIds) mktExpConds.push(inArray(marketingExpenses.projectId, projectIds));
  const mktExpRows = await db2.select({
    month: sql`MONTH(${marketingExpenses.date})`,
    total: sql`COALESCE(SUM(${marketingExpenses.amount}), 0)`
  }).from(marketingExpenses).where(and(...mktExpConds)).groupBy(sql`MONTH(${marketingExpenses.date})`);
  const adsConds = [
    gte(campaignDailyStats.date, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-01-01`))),
    lte(campaignDailyStats.date, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-12-31T23:59:59`)))
  ];
  if (projectIds) adsConds.push(inArray(campaigns.projectId, projectIds));
  const adsRows = await db2.select({
    month: sql`MONTH(${campaignDailyStats.date})`,
    total: sql`COALESCE(SUM(${campaignDailyStats.spend}), 0)`
  }).from(campaignDailyStats).innerJoin(campaigns, eq(campaigns.id, campaignDailyStats.campaignId)).where(and(...adsConds)).groupBy(sql`MONTH(${campaignDailyStats.date})`);
  const extrasRows = await db2.select({
    date: extrasDiaAssignments.assignmentDate,
    level: extrasDiaAssignments.level,
    hours: sql`COALESCE(SUM(GREATEST(${extrasDiaAssignments.endHour} - ${extrasDiaAssignments.startHour}, 0)), 0)`
  }).from(extrasDiaAssignments).where(
    and(
      gte(extrasDiaAssignments.assignmentDate, `${year}-01-01`),
      lte(extrasDiaAssignments.assignmentDate, `${year}-12-31`),
      eq(extrasDiaAssignments.isTeamLeader, 0)
    )
  ).groupBy(extrasDiaAssignments.assignmentDate, extrasDiaAssignments.level);
  const extrasDiaByMonth = {};
  for (const r of extrasRows) {
    const rate = EXTRAS_DIA_RATES[String(r.level ?? "junior")] ?? 4;
    const m = Number((r.date ?? "").slice(5, 7));
    if (!m) continue;
    extrasDiaByMonth[m] = (extrasDiaByMonth[m] ?? 0) + Number(r.hours) * rate;
  }
  const allPartners = await db2.select({
    id: partnerships.id,
    name: partnerships.name,
    campaignKey: partnerships.campaignKey,
    commissionRate: partnerships.commissionRate,
    partnerType: partnerships.partnerType,
    notes: partnerships.notes,
    updatedAt: partnerships.updatedAt
  }).from(partnerships);
  const allAliases = await db2.select({ partnershipId: partnerAliases.partnershipId, aliasValue: partnerAliases.aliasValue }).from(partnerAliases);
  const partnerByCampaign = /* @__PURE__ */ new Map();
  const registerKey = (k, id, name, rate, updatedAt) => {
    if (!k) return;
    const key = k.trim().toLowerCase();
    if (!key) return;
    const ex = partnerByCampaign.get(key);
    if (!ex || updatedAt > ex.updatedAt) {
      partnerByCampaign.set(key, { id, name, rate, updatedAt });
    }
  };
  for (const p of allPartners) {
    const rate = Number(p.commissionRate ?? 0);
    const updatedAt = p.updatedAt ?? "";
    registerKey(p.campaignKey, p.id, p.name, rate, updatedAt);
    registerKey(p.name, p.id, p.name, rate, updatedAt);
  }
  const partnerById = new Map(allPartners.map((p) => [p.id, p]));
  for (const a of allAliases) {
    const p = partnerById.get(a.partnershipId);
    if (!p) continue;
    registerKey(a.aliasValue, p.id, p.name, Number(p.commissionRate ?? 0), p.updatedAt ?? "");
  }
  const bookingsByMonthCampaign = await db2.select({
    month: sql`MONTH(${multiparkBookings.checkOut})`,
    campaign: multiparkBookings.campaign,
    revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...revConds, isNotNull(multiparkBookings.campaign))).groupBy(sql`MONTH(${multiparkBookings.checkOut})`, multiparkBookings.campaign);
  const salesCommissionByMonth = {};
  for (const r of bookingsByMonthCampaign) {
    const key = (r.campaign ?? "").trim().toLowerCase();
    const partner = partnerByCampaign.get(key);
    if (!partner) continue;
    const m = Number(r.month);
    salesCommissionByMonth[m] = (salesCommissionByMonth[m] ?? 0) + Number(r.revenue) * (partner.rate / 100);
  }
  const { parsePartnerConfig: parsePartnerConfig2 } = await Promise.resolve().then(() => (init_partnerTypes(), partnerTypes_exports));
  const operationalPartnersList = allPartners.filter((p) => (p.partnerType ?? "outro") === "operacional").map((p) => ({ p, cfg: parsePartnerConfig2(p.notes ?? null) })).filter(({ cfg }) => Array.isArray(cfg.operatesProjects) && cfg.operatesProjects.length > 0);
  const operationalCommissionByMonth = {};
  for (const { p, cfg } of operationalPartnersList) {
    const expanded = /* @__PURE__ */ new Set();
    for (const root of cfg.operatesProjects ?? []) {
      const ids = await resolveProjectIds(root);
      for (const pid of ids) expanded.add(pid);
    }
    if (expanded.size === 0) continue;
    const rows = await db2.select({
      month: sql`MONTH(${multiparkBookings.checkOut})`,
      revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
    }).from(multiparkBookings).where(
      and(
        gte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-01-01`))),
        lte(multiparkBookings.checkOut, toMysqlDateTime(/* @__PURE__ */ new Date(`${year}-12-31T23:59:59`))),
        sql`${multiparkBookings.status} != 'CANCELLED'`,
        inArray(multiparkBookings.projectId, Array.from(expanded))
      )
    ).groupBy(sql`MONTH(${multiparkBookings.checkOut})`);
    const rate = Number(p.commissionRate ?? 0) / 100;
    for (const r of rows) {
      const m = Number(r.month);
      operationalCommissionByMonth[m] = (operationalCommissionByMonth[m] ?? 0) + Number(r.revenue) * rate;
    }
  }
  const allProjsForRateio = await db2.select({ id: projects.id, name: projects.name, parentId: projects.parentId, level: projects.level }).from(projects);
  const childrenMap = /* @__PURE__ */ new Map();
  for (const p of allProjsForRateio) {
    if (p.parentId != null) {
      if (!childrenMap.has(p.parentId)) childrenMap.set(p.parentId, []);
      childrenMap.get(p.parentId).push(p.id);
    }
  }
  function leafDescendants(pid) {
    const self = allProjsForRateio.find((x) => x.id === pid);
    if (!self) return [pid];
    if (self.level === "project") return [pid];
    const kids = childrenMap.get(pid) ?? [];
    if (kids.length === 0) return [pid];
    const out = [];
    for (const k of kids) out.push(...leafDescendants(k));
    return out.length > 0 ? out : [pid];
  }
  const TSU_EMPLOYER = 0.2375;
  const monthIds = Array.from({ length: 12 }, (_, i) => i + 1);
  const payrollResults = await Promise.all(monthIds.map(async (m) => {
    try {
      const payroll = await getPayrollData(year, m);
      let totalSalaries = 0;
      let totalEmployerTax = 0;
      for (const p of payroll) {
        const taxableBase = p.isExtra ? p.extraPayment : p.baseSalary + p.overtimePayment + p.nightPayment + p.weekendPayment;
        const employerTaxForEmp = taxableBase * TSU_EMPLOYER;
        const empProjectId = p.projectId ?? null;
        if (empProjectId == null) {
          if (!projectIds) {
            totalSalaries += p.totalPayment;
            totalEmployerTax += employerTaxForEmp;
          }
          continue;
        }
        const targets = leafDescendants(empProjectId);
        const matching = projectIds ? targets.filter((t2) => projectIds.includes(t2)) : targets;
        if (matching.length === 0) continue;
        const share = matching.length / targets.length;
        totalSalaries += p.totalPayment * share;
        totalEmployerTax += employerTaxForEmp * share;
      }
      return [m, { salaries: Math.round(totalSalaries * 100) / 100, employerTax: Math.round(totalEmployerTax * 100) / 100 }];
    } catch {
      return [m, { salaries: 0, employerTax: 0 }];
    }
  }));
  const payrollByMonth = {};
  for (const [m, v] of payrollResults) payrollByMonth[m] = v;
  const revMap = new Map(revenueRows.map((r) => [Number(r.month), Number(r.total)]));
  const expMap = new Map(expenseRows.map((e) => [Number(e.month), Number(e.total)]));
  const mktExpMap = new Map(mktExpRows.map((r) => [Number(r.month), Number(r.total)]));
  const adsMap = new Map(adsRows.map((r) => [Number(r.month), Number(r.total)]));
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const revenueGrossWithVat = revMap.get(m) ?? 0;
    const salesCommissions = Math.round((salesCommissionByMonth[m] ?? 0) * 100) / 100;
    const operationalCommissions = Math.round((operationalCommissionByMonth[m] ?? 0) * 100) / 100;
    const revenueWithVat = revenueGrossWithVat - salesCommissions - operationalCommissions;
    const expensesWithVat = expMap.get(m) ?? 0;
    const marketingCost = (mktExpMap.get(m) ?? 0) + (adsMap.get(m) ?? 0);
    const extrasDiaCost = extrasDiaByMonth[m] ?? 0;
    const salaries = payrollByMonth[m]?.salaries ?? 0;
    const employerTax = payrollByMonth[m]?.employerTax ?? 0;
    const vatRevenue = Math.round(revenueWithVat * VAT_RATE / (1 + VAT_RATE) * 100) / 100;
    const vatExpenses = Math.round(expensesWithVat * VAT_RATE / (1 + VAT_RATE) * 100) / 100;
    const vatToPay = Math.round((vatRevenue - vatExpenses) * 100) / 100;
    const revenueNoVat = Math.round((revenueWithVat - vatRevenue) * 100) / 100;
    const expensesNoVat = Math.round((expensesWithVat - vatExpenses) * 100) / 100;
    const totalCosts = expensesNoVat + marketingCost + extrasDiaCost + salaries + employerTax;
    const profit = Math.round((revenueNoVat - totalCosts) * 100) / 100;
    months.push({
      month: m,
      revenueGrossWithVat: Math.round(revenueGrossWithVat * 100) / 100,
      salesCommissions,
      operationalCommissions,
      revenueWithVat: Math.round(revenueWithVat * 100) / 100,
      revenueNoVat,
      vatRevenue,
      expensesWithVat,
      expensesNoVat,
      vatExpenses,
      vatToPay,
      marketingCost: Math.round(marketingCost * 100) / 100,
      extrasDiaCost: Math.round(extrasDiaCost * 100) / 100,
      salaries,
      employerTax,
      totalCosts: Math.round(totalCosts * 100) / 100,
      profit
    });
  }
  return months;
}
async function generateAnnualSummary(year, projectId, splitPartner = 60) {
  const db2 = await getDb();
  if (!db2) return [];
  const allInvoices = await db2.select().from(invoices);
  const yearInvoices = allInvoices.filter((i) => {
    const d = new Date(i.issueDate);
    return d.getFullYear() === year && (!projectId || i.projectId === projectId);
  });
  const allServices = await db2.select().from(services);
  const yearServices = allServices.filter((s) => {
    const d = new Date(s.serviceDate);
    return d.getFullYear() === year;
  });
  const allExpenses = await db2.select().from(expenses);
  const yearExpenses = allExpenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === year && (!projectId || e.projectId === projectId);
  });
  const monthly = {};
  for (let m = 1; m <= 12; m++) monthly[m] = { invoiceRevenue: 0, serviceRevenue: 0, serviceCost: 0, expenses: 0 };
  for (const inv of yearInvoices) {
    const m = new Date(inv.issueDate).getMonth() + 1;
    monthly[m].invoiceRevenue += inv.totalAmount || 0;
  }
  for (const svc of yearServices) {
    const m = new Date(svc.serviceDate).getMonth() + 1;
    monthly[m].serviceRevenue += svc.revenue || 0;
    monthly[m].serviceCost += svc.cost || 0;
  }
  for (const exp of yearExpenses) {
    const m = new Date(exp.createdAt).getMonth() + 1;
    monthly[m].expenses += parseFloat(exp.amount) || 0;
  }
  const partnerPct = splitPartner / 100;
  const companyPct = 1 - partnerPct;
  const splitLabel = `${splitPartner}/${100 - splitPartner}`;
  const results = [];
  for (let m = 1; m <= 12; m++) {
    const revenue = monthly[m].invoiceRevenue + monthly[m].serviceRevenue;
    const expenseTotal = monthly[m].expenses + monthly[m].serviceCost;
    const profit = revenue - expenseTotal;
    const partnerShare = Math.round(profit * partnerPct);
    const companyShare = Math.round(profit * companyPct);
    const existing = await db2.select().from(annualReports).where(
      and(
        eq(annualReports.month, m),
        eq(annualReports.year, year),
        projectId ? eq(annualReports.projectId, projectId) : sql`1=1`
      )
    );
    const reportData = {
      projectId: projectId || null,
      month: m,
      year,
      totalRevenue: revenue,
      totalExpenses: expenseTotal,
      partnerShare,
      companyShare,
      splitRatio: splitLabel
    };
    if (existing.length > 0) {
      await db2.update(annualReports).set(reportData).where(eq(annualReports.id, existing[0].id));
      results.push({ ...reportData, id: existing[0].id });
    } else {
      const [result] = await db2.insert(annualReports).values(reportData).$returningId();
      results.push({ ...reportData, id: result?.id });
    }
  }
  return results;
}
async function getMultiparkBookings(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(multiparkBookings.status, filters.status));
  if (filters?.parkingType) conditions.push(eq(multiparkBookings.parkingType, filters.parkingType));
  if (filters?.city) conditions.push(eq(multiparkBookings.city, filters.city));
  if (filters?.parkId) conditions.push(eq(multiparkBookings.parkId, filters.parkId));
  if (filters?.from) conditions.push(gte(multiparkBookings.checkIn, toMysqlDateTime(filters.from)));
  if (filters?.to) conditions.push(lte(multiparkBookings.checkIn, toMysqlDateTime(filters.to)));
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conditions.push(
      or(
        like(multiparkBookings.clientFirstName, s),
        like(multiparkBookings.clientLastName, s),
        like(multiparkBookings.licensePlate, s),
        like(multiparkBookings.bookingNumber, s),
        like(multiparkBookings.clientEmail, s)
      )
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(multiparkBookings).where(where).orderBy(desc(multiparkBookings.checkIn)).limit(filters?.limit ?? 100).offset(filters?.offset ?? 0);
}
async function getLocalBookingsByAction(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  const endWithTime = filters.endDate + " 23:59:59";
  switch (filters.actionType) {
    case "creation":
      conditions.push(gte(multiparkBookings.bookingCreatedAt, filters.startDate));
      conditions.push(lte(multiparkBookings.bookingCreatedAt, endWithTime));
      conditions.push(sql`${multiparkBookings.status} != 'CANCELLED'`);
      break;
    case "checkin":
      conditions.push(gte(multiparkBookings.checkIn, filters.startDate));
      conditions.push(lte(multiparkBookings.checkIn, endWithTime));
      conditions.push(sql`${multiparkBookings.status} != 'CANCELLED'`);
      break;
    case "checkout":
      conditions.push(gte(multiparkBookings.checkOut, filters.startDate));
      conditions.push(lte(multiparkBookings.checkOut, endWithTime));
      conditions.push(sql`${multiparkBookings.status} != 'CANCELLED'`);
      break;
    case "cancelation":
      conditions.push(gte(multiparkBookings.cancelledAt, filters.startDate));
      conditions.push(lte(multiparkBookings.cancelledAt, endWithTime));
      break;
  }
  if (filters.projectId) {
    const allProjects = await db2.select().from(projects);
    const ids = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      ids.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
    conditions.push(sql`${multiparkBookings.projectId} IN (${sql.raw(Array.from(ids).join(","))})`);
  }
  return db2.select().from(multiparkBookings).where(and(...conditions)).orderBy(desc(multiparkBookings.bookingCreatedAt)).limit(5e3);
}
async function searchBookingByRef(search) {
  const db2 = await getDb();
  if (!db2) return [];
  const s = `%${search.trim()}%`;
  return db2.select({
    id: multiparkBookings.id,
    externalId: multiparkBookings.externalId,
    bookingNumber: multiparkBookings.bookingNumber,
    status: multiparkBookings.status,
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city,
    projectId: multiparkBookings.projectId,
    checkIn: multiparkBookings.checkIn,
    checkOut: multiparkBookings.checkOut,
    totalPrice: multiparkBookings.totalPrice,
    clientFirstName: multiparkBookings.clientFirstName,
    clientLastName: multiparkBookings.clientLastName,
    clientEmail: multiparkBookings.clientEmail,
    clientPhone: multiparkBookings.clientPhone,
    licensePlate: multiparkBookings.licensePlate
  }).from(multiparkBookings).where(or(
    like(multiparkBookings.bookingNumber, s),
    like(multiparkBookings.externalId, s),
    like(multiparkBookings.clientEmail, s),
    like(multiparkBookings.licensePlate, s),
    like(multiparkBookings.clientFirstName, s),
    like(multiparkBookings.clientLastName, s)
  )).orderBy(desc(multiparkBookings.bookingCreatedAt)).limit(10);
}
async function getMultiparkBookingByExternalId(externalId) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const rows = await db2.select().from(multiparkBookings).where(eq(multiparkBookings.externalId, externalId)).limit(1);
  return rows[0];
}
async function upsertMultiparkBooking(data) {
  const db2 = await getDb();
  if (!db2) return;
  const { externalId, ...rest } = data;
  const before = await db2.select({ id: multiparkBookings.id, status: multiparkBookings.status }).from(multiparkBookings).where(eq(multiparkBookings.externalId, externalId)).limit(1);
  const existed = before.length > 0;
  const statusChanged = existed && (before[0].status ?? null) !== (data.status ?? null);
  const setOnDup = statusChanged ? { ...rest, enrichedAt: null } : rest;
  await db2.insert(multiparkBookings).values(data).onDuplicateKeyUpdate({ set: setOnDup });
  if (existed) {
    return { id: before[0].id, action: "updated", statusChanged };
  }
  const [row] = await db2.select({ id: multiparkBookings.id }).from(multiparkBookings).where(eq(multiparkBookings.externalId, externalId)).limit(1);
  return { id: row?.id, action: "created", statusChanged: false };
}
async function upsertBookingExtras(bookingExternalId, extras) {
  const db2 = await getDb();
  if (!db2) return;
  if (!Array.isArray(extras) || extras.length === 0) return;
  await db2.delete(multiparkBookingExtras).where(eq(multiparkBookingExtras.bookingExternalId, bookingExternalId));
  await db2.insert(multiparkBookingExtras).values(
    extras.map((e) => ({
      bookingExternalId,
      extraId: e.id ? String(e.id).slice(0, 128) : null,
      name: typeof e.name === "string" ? e.name.slice(0, 256) : null,
      description: typeof e.description === "string" ? e.description.slice(0, 512) : null,
      price: e.price != null ? String(e.price) : null,
      done: e.done ? 1 : 0
    }))
  );
}
async function getMultiparkBookingStats(filters) {
  const db2 = await getDb();
  const empty = { total: 0, reservasHoje: 0, checkinHoje: 0, checkoutHoje: 0, canceladosHoje: 0, reservasMes: 0, checkinMes: 0, checkoutMes: 0, canceladosMes: 0, receitaHoje: 0, receitaMes: 0, receitaPeriodo: 0, byCity: [], byDay: [], byBrand: [] };
  if (!db2) return empty;
  let projectFilter = void 0;
  if (filters?.projectId) {
    const allProjects = await db2.select().from(projects);
    const ids = /* @__PURE__ */ new Set();
    const addChildren = (parentId) => {
      ids.add(parentId);
      for (const p of allProjects) {
        if (p.parentId === parentId) addChildren(p.id);
      }
    };
    addChildren(filters.projectId);
    projectFilter = sql`${multiparkBookings.projectId} IN (${sql.raw(Array.from(ids).join(",") || "0")})`;
  }
  const now = /* @__PURE__ */ new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayEnd = todayStr + " 23:59:59";
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const countQuery = (dateCol, start, end, excludeCancelled = true) => {
    const conds = [gte(dateCol, start), lte(dateCol, end)];
    if (excludeCancelled) conds.push(sql`${multiparkBookings.status} != 'CANCELLED'`);
    if (projectFilter) conds.push(projectFilter);
    return db2.select({
      count: sql`COUNT(*)`,
      revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
    }).from(multiparkBookings).where(and(...conds));
  };
  const periodFrom = filters?.from || monthStart;
  const periodTo = (filters?.to || todayStr) + " 23:59:59";
  const [
    [totalRow],
    [resHoje],
    [resMonth],
    [ciHoje],
    [ciMonth],
    [coHoje],
    [coMonth],
    [canHoje],
    [canMonth],
    [periodRevRow],
    byCityRows,
    byDayRows,
    byBrandRows
  ] = await Promise.all([
    db2.select({ count: sql`COUNT(*)` }).from(multiparkBookings).where(projectFilter ? and(projectFilter) : void 0),
    countQuery(multiparkBookings.bookingCreatedAt, todayStr, todayEnd),
    countQuery(multiparkBookings.bookingCreatedAt, monthStart, todayEnd),
    countQuery(multiparkBookings.checkIn, todayStr, todayEnd),
    countQuery(multiparkBookings.checkIn, monthStart, todayEnd),
    countQuery(multiparkBookings.checkOut, todayStr, todayEnd),
    countQuery(multiparkBookings.checkOut, monthStart, todayEnd),
    countQuery(multiparkBookings.cancelledAt, todayStr, todayEnd, false),
    countQuery(multiparkBookings.cancelledAt, monthStart, todayEnd, false),
    // Revenue for the full filter period
    (() => {
      const conds = [gte(multiparkBookings.checkIn, periodFrom), lte(multiparkBookings.checkIn, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({ revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)` }).from(multiparkBookings).where(and(...conds));
    })(),
    // By city
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({
        name: multiparkBookings.city,
        bookings: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(and(...conds)).groupBy(multiparkBookings.city);
    })(),
    // By day
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({
        date: sql`DATE(${multiparkBookings.bookingCreatedAt})`,
        reservas: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.bookingCreatedAt})`).orderBy(sql`DATE(${multiparkBookings.bookingCreatedAt})`);
    })(),
    // By brand (parkName)
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({
        name: multiparkBookings.parkName,
        bookings: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(and(...conds)).groupBy(multiparkBookings.parkName);
    })()
  ]);
  const [ciByDay, coByDay, canByDay] = await Promise.all([
    (() => {
      const conds = [gte(multiparkBookings.checkIn, periodFrom), lte(multiparkBookings.checkIn, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({ date: sql`DATE(${multiparkBookings.checkIn})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.checkIn})`);
    })(),
    (() => {
      const conds = [gte(multiparkBookings.checkOut, periodFrom), lte(multiparkBookings.checkOut, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({ date: sql`DATE(${multiparkBookings.checkOut})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.checkOut})`);
    })(),
    (() => {
      const conds = [gte(multiparkBookings.cancelledAt, periodFrom), lte(multiparkBookings.cancelledAt, periodTo)];
      if (projectFilter) conds.push(projectFilter);
      return db2.select({ date: sql`DATE(${multiparkBookings.cancelledAt})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.cancelledAt})`);
    })()
  ]);
  const ciMap = new Map(ciByDay.map((r) => [r.date, r.count]));
  const coMap = new Map(coByDay.map((r) => [r.date, r.count]));
  const canMap = new Map(canByDay.map((r) => [r.date, r.count]));
  const byDay = byDayRows.map((r) => ({
    date: r.date,
    reservas: r.reservas,
    checkins: ciMap.get(r.date) ?? 0,
    checkouts: coMap.get(r.date) ?? 0,
    cancelados: canMap.get(r.date) ?? 0,
    revenue: parseFloat(String(r.revenue ?? 0))
  }));
  return {
    total: totalRow?.count ?? 0,
    reservasHoje: resHoje?.count ?? 0,
    checkinHoje: ciHoje?.count ?? 0,
    checkoutHoje: coHoje?.count ?? 0,
    canceladosHoje: canHoje?.count ?? 0,
    reservasMes: resMonth?.count ?? 0,
    checkinMes: ciMonth?.count ?? 0,
    checkoutMes: coMonth?.count ?? 0,
    canceladosMes: canMonth?.count ?? 0,
    receitaHoje: parseFloat(String(ciHoje?.revenue ?? 0)),
    receitaMes: parseFloat(String(ciMonth?.revenue ?? 0)),
    receitaPeriodo: parseFloat(String(periodRevRow?.revenue ?? 0)),
    byCity: byCityRows.map((r) => ({ name: r.name ?? "Desconhecido", bookings: r.bookings, revenue: parseFloat(String(r.revenue ?? 0)) })),
    byDay,
    byBrand: byBrandRows.map((r) => ({ name: r.name ?? "Desconhecido", bookings: r.bookings, revenue: parseFloat(String(r.revenue ?? 0)) }))
  };
}
async function createSyncLog(data) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(multiparkSyncLogs).values(data);
}
async function getSyncLogs(limit = 20) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(multiparkSyncLogs).orderBy(desc(multiparkSyncLogs.startedAt)).limit(limit);
}
async function getLastSyncSuccessAt(syncType = "api_sync") {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select({ startedAt: multiparkSyncLogs.startedAt }).from(multiparkSyncLogs).where(and(
    eq(multiparkSyncLogs.syncType, syncType),
    inArray(multiparkSyncLogs.status, ["success", "partial"])
  )).orderBy(desc(multiparkSyncLogs.startedAt)).limit(1);
  return rows[0]?.startedAt ?? null;
}
async function upsertDailySnapshot(data) {
  const db2 = await getDb();
  if (!db2) return;
  const existing = await db2.select({ id: multiparkDailySnapshots.id }).from(multiparkDailySnapshots).where(
    and(
      eq(multiparkDailySnapshots.snapshotDate, data.snapshotDate),
      eq(multiparkDailySnapshots.parkName, data.parkName),
      eq(multiparkDailySnapshots.city, data.city)
    )
  ).limit(1);
  if (existing.length > 0) {
    const { id, ...updateData } = data;
    await db2.update(multiparkDailySnapshots).set(updateData).where(eq(multiparkDailySnapshots.id, existing[0].id));
    return { id: existing[0].id, action: "updated" };
  } else {
    const [result] = await db2.insert(multiparkDailySnapshots).values(data).$returningId();
    return { id: result?.id, action: "created" };
  }
}
async function getDailySnapshots(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.from) conditions.push(gte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(filters.from)));
  if (filters?.to) conditions.push(lte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(filters.to)));
  if (filters?.parkName) conditions.push(eq(multiparkDailySnapshots.parkName, filters.parkName));
  if (filters?.city) conditions.push(eq(multiparkDailySnapshots.city, filters.city));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db2.select().from(multiparkDailySnapshots).where(where).orderBy(desc(multiparkDailySnapshots.snapshotDate)).limit(filters?.limit ?? 500);
}
async function getSnapshotKPIs(filters) {
  const db2 = await getDb();
  if (!db2) return { totalBookings: 0, totalRevenue: 0, checkins: 0, checkouts: 0, cancelled: 0, reserved: 0, byPark: [], byCity: [], byDay: [], campaigns: {} };
  const conditions = [];
  if (filters?.from) conditions.push(gte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(filters.from)));
  if (filters?.to) conditions.push(lte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(filters.to)));
  if (filters?.city) conditions.push(eq(multiparkDailySnapshots.city, filters.city));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const rows = await db2.select().from(multiparkDailySnapshots).where(where).orderBy(multiparkDailySnapshots.snapshotDate);
  let totalBookings = 0, totalRevenue = 0, checkins = 0, checkouts = 0, cancelled = 0, reserved = 0;
  const parkMap = {};
  const cityMap = {};
  const dayMap = {};
  const campaignMap = {};
  for (const r of rows) {
    totalBookings += r.totalBookings;
    totalRevenue += r.totalRevenue ?? 0;
    checkins += r.checkinCount ?? 0;
    checkouts += r.checkoutCount ?? 0;
    cancelled += r.cancelledCount ?? 0;
    reserved += r.reservedCount ?? 0;
    if (!parkMap[r.parkName]) parkMap[r.parkName] = { bookings: 0, revenue: 0, checkins: 0, checkouts: 0 };
    parkMap[r.parkName].bookings += r.totalBookings;
    parkMap[r.parkName].revenue += r.totalRevenue ?? 0;
    parkMap[r.parkName].checkins += r.checkinCount ?? 0;
    parkMap[r.parkName].checkouts += r.checkoutCount ?? 0;
    if (!cityMap[r.city]) cityMap[r.city] = { bookings: 0, revenue: 0 };
    cityMap[r.city].bookings += r.totalBookings;
    cityMap[r.city].revenue += r.totalRevenue ?? 0;
    const dayKey = r.snapshotDate ? new Date(r.snapshotDate).toISOString().slice(0, 10) : "unknown";
    if (!dayMap[dayKey]) dayMap[dayKey] = { bookings: 0, revenue: 0, checkins: 0, checkouts: 0 };
    dayMap[dayKey].bookings += r.totalBookings;
    dayMap[dayKey].revenue += r.totalRevenue ?? 0;
    dayMap[dayKey].checkins += r.checkinCount ?? 0;
    dayMap[dayKey].checkouts += r.checkoutCount ?? 0;
    if (r.externalCampaigns) {
      try {
        const camps = JSON.parse(r.externalCampaigns);
        for (const [name, count] of Object.entries(camps)) {
          campaignMap[name] = (campaignMap[name] || 0) + count;
        }
      } catch {
      }
    }
  }
  return {
    totalBookings,
    totalRevenue,
    checkins,
    checkouts,
    cancelled,
    reserved,
    byPark: Object.entries(parkMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue),
    byCity: Object.entries(cityMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue),
    byDay: Object.entries(dayMap).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)),
    campaigns: campaignMap
  };
}
async function deleteSnapshotsByDateRange(from, to) {
  const db2 = await getDb();
  if (!db2) return 0;
  const result = await db2.delete(multiparkDailySnapshots).where(
    and(
      gte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(from)),
      lte(multiparkDailySnapshots.snapshotDate, toMysqlDateTime(to))
    )
  );
  return result?.[0]?.affectedRows ?? 0;
}
async function createInviteToken(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
  await db2.insert(inviteTokens).values({
    token,
    email: data.email,
    userId: data.userId,
    invitedById: data.invitedById,
    inviteStatus: "pending",
    expiresAt: toMysqlDateTime(expiresAt)
  });
  return { token, expiresAt };
}
async function getInviteByToken(token) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(inviteTokens).where(eq(inviteTokens.token, token)).limit(1);
  return result[0];
}
async function acceptInviteToken(token) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(inviteTokens).set({ inviteStatus: "accepted", acceptedAt: toMysqlDateTime(/* @__PURE__ */ new Date()) }).where(eq(inviteTokens.token, token));
}
async function getInvitesByUser(userId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(inviteTokens).where(eq(inviteTokens.userId, userId)).orderBy(desc(inviteTokens.createdAt));
}
async function getInvitesByEmail(email) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(inviteTokens).where(eq(inviteTokens.email, email)).orderBy(desc(inviteTokens.createdAt));
}
async function linkInviteToOAuthUser(manualUserId, oauthOpenId, oauthName, oauthEmail) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const updates = { openId: oauthOpenId, loginMethod: "oauth" };
  if (oauthName) updates.name = oauthName;
  if (oauthEmail) updates.email = oauthEmail;
  await db2.update(users).set(updates).where(eq(users.id, manualUserId));
}
async function getPayrollData(year, month) {
  const db2 = await getDb();
  if (!db2) return [];
  const emps = await db2.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.isActive, 1)).orderBy(employees.fullName);
  const rates = await db2.select().from(extraRates).orderBy(extraRates.level);
  const rateMap = new Map(rates.map((r) => [r.level, parseFloat(String(r.hourlyRate))]));
  const rateByName = new Map(rates.map((r) => [String(r.levelName ?? ""), parseFloat(String(r.hourlyRate))]));
  const monthFirstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await db2.select().from(timeRecords).where(and(gte(timeRecords.recordedAt, toMysqlDateTime(start)), lte(timeRecords.recordedAt, toMysqlDateTime(end))));
  const hoursByEmployee = /* @__PURE__ */ new Map();
  for (const r of records) {
    if (!hoursByEmployee.has(r.employeeId)) {
      hoursByEmployee.set(r.employeeId, { totalHours: 0, days: /* @__PURE__ */ new Set(), records: [] });
    }
    const entry = hoursByEmployee.get(r.employeeId);
    entry.totalHours += parseFloat(String(r.hoursWorked ?? 0));
    entry.days.add(new Date(r.recordedAt).toISOString().split("T")[0]);
    entry.records.push(r);
  }
  const STANDARD_MONTHLY_HOURS = 176;
  const STANDARD_DAILY_HOURS = 8;
  const OVERTIME_RATE_FIRST_HOUR = 1.25;
  const OVERTIME_RATE_SUBSEQUENT = 1.375;
  const NIGHT_RATE_MULTIPLIER = 1.25;
  const WEEKEND_RATE_MULTIPLIER = 1.5;
  const empIds = emps.map(({ employee }) => employee.id);
  const histAll = empIds.length ? await db2.select().from(employeeSalaryHistory).where(and(
    inArray(employeeSalaryHistory.employeeId, empIds),
    lte(employeeSalaryHistory.effectiveFrom, monthFirstDay),
    or(isNull(employeeSalaryHistory.effectiveUntil), gte(employeeSalaryHistory.effectiveUntil, monthFirstDay))
  )).orderBy(desc(employeeSalaryHistory.effectiveFrom)) : [];
  const snapshotByEmp = /* @__PURE__ */ new Map();
  for (const h2 of histAll) {
    if (!snapshotByEmp.has(h2.employeeId)) snapshotByEmp.set(h2.employeeId, { monthlySalary: h2.monthlySalary, mealAllowancePerDay: h2.mealAllowancePerDay });
  }
  const lastDayNum = new Date(year, month, 0).getDate();
  const monthEndStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;
  const leavesAll = empIds.length ? await db2.select({ employeeId: employeeLeaves.employeeId, fromDate: employeeLeaves.fromDate, toDate: employeeLeaves.toDate }).from(employeeLeaves).where(and(
    inArray(employeeLeaves.employeeId, empIds),
    lte(employeeLeaves.fromDate, monthEndStr),
    gte(employeeLeaves.toDate, monthFirstDay)
  )) : [];
  const leavesByEmp = /* @__PURE__ */ new Map();
  for (const r of leavesAll) {
    let set = leavesByEmp.get(r.employeeId);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      leavesByEmp.set(r.employeeId, set);
    }
    const from = r.fromDate < monthFirstDay ? monthFirstDay : r.fromDate;
    const to = r.toDate > monthEndStr ? monthEndStr : r.toDate;
    const d = /* @__PURE__ */ new Date(from + "T00:00:00");
    const limit = /* @__PURE__ */ new Date(to + "T00:00:00");
    while (d <= limit) {
      set.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  }
  const empMeta = emps.map(({ employee: emp }) => ({
    empId: emp.id,
    snapshot: snapshotByEmp.get(emp.id) ?? { monthlySalary: emp.monthlySalary, mealAllowancePerDay: emp.mealAllowancePerDay },
    leaveDays: leavesByEmp.get(emp.id) ?? /* @__PURE__ */ new Set()
  }));
  const metaById = new Map(empMeta.map((m) => [m.empId, m]));
  return emps.map(({ employee: emp, project }) => {
    const empHours = hoursByEmployee.get(emp.id) ?? { totalHours: 0, days: /* @__PURE__ */ new Set(), records: [] };
    const totalHours = Math.round(empHours.totalHours * 100) / 100;
    const daysWorked = empHours.days.size;
    const isExtra = emp.position === "extra";
    const meta = metaById.get(emp.id);
    const snapshot = meta?.snapshot;
    const leaveDays = meta?.leaveDays ?? /* @__PURE__ */ new Set();
    let baseSalary = 0;
    let extraPayment = 0;
    let overtimeHours = 0;
    let overtimePayment = 0;
    let thirteenthProvision = 0;
    let fourteenthProvision = 0;
    let nightHours = 0;
    let nightPayment = 0;
    let weekendHours = 0;
    let weekendPayment = 0;
    let mealAllowance = 0;
    const mealAllowancePerDay = parseFloat(String(snapshot?.mealAllowancePerDay ?? emp.mealAllowancePerDay ?? 0));
    if (isExtra) {
      const levelNum = emp.extraLevel ?? 1;
      const NAME_BY_LEVEL = { 1: "junior", 2: "senior", 3: "terminal", 4: "master" };
      const fromName = rateByName.get(NAME_BY_LEVEL[levelNum] ?? "junior");
      const hourlyRate = fromName ?? rateMap.get(levelNum) ?? 4.5;
      extraPayment = Math.round(totalHours * hourlyRate * 100) / 100;
    } else {
      baseSalary = parseFloat(String(snapshot?.monthlySalary ?? emp.monthlySalary ?? 0));
      const hourlyBase = baseSalary > 0 ? baseSalary / STANDARD_MONTHLY_HOURS : 0;
      let normalHours = 0;
      for (const rec of empHours.records) {
        const recDate = new Date(rec.recordedAt);
        const hours = parseFloat(String(rec.hoursWorked ?? 0));
        if (hours <= 0) continue;
        const dayOfWeek = recDate.getDay();
        const hour = recDate.getHours();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isNight = hour >= 22 || hour < 7;
        if (isWeekend) weekendHours += hours;
        else if (isNight) nightHours += hours;
        else normalHours += hours;
      }
      nightHours = Math.round(nightHours * 100) / 100;
      weekendHours = Math.round(weekendHours * 100) / 100;
      normalHours = Math.round(normalHours * 100) / 100;
      nightPayment = Math.round(nightHours * hourlyBase * (NIGHT_RATE_MULTIPLIER - 1) * 100) / 100;
      weekendPayment = Math.round(weekendHours * hourlyBase * (WEEKEND_RATE_MULTIPLIER - 1) * 100) / 100;
      if (normalHours > STANDARD_MONTHLY_HOURS) {
        overtimeHours = Math.round((normalHours - STANDARD_MONTHLY_HOURS) * 100) / 100;
        const firstHourPortion = Math.min(overtimeHours, daysWorked);
        const subsequentPortion = Math.max(0, overtimeHours - firstHourPortion);
        overtimePayment = Math.round(
          (firstHourPortion * hourlyBase * OVERTIME_RATE_FIRST_HOUR + subsequentPortion * hourlyBase * OVERTIME_RATE_SUBSEQUENT) * 100
        ) / 100;
      }
      thirteenthProvision = Math.round(baseSalary / 12 * 100) / 100;
      fourteenthProvision = Math.round(baseSalary / 12 * 100) / 100;
      let workedDaysExcludingLeave = 0;
      for (const day of empHours.days) {
        if (!leaveDays.has(day)) workedDaysExcludingLeave += 1;
      }
      mealAllowance = Math.round(mealAllowancePerDay * workedDaysExcludingLeave * 100) / 100;
    }
    const totalPayment = isExtra ? extraPayment : baseSalary + overtimePayment + nightPayment + weekendPayment + thirteenthProvision + fourteenthProvision + mealAllowance;
    const TSU_EMPLOYEE = 0.11;
    const IRS_RATE = 0.15;
    const taxableBase = isExtra ? extraPayment : baseSalary + overtimePayment + nightPayment + weekendPayment;
    const tsuEmployee = Math.round(taxableBase * TSU_EMPLOYEE * 100) / 100;
    const irsEstimate = Math.round(taxableBase * IRS_RATE * 100) / 100;
    const netEstimate = Math.round((totalPayment - tsuEmployee - irsEstimate) * 100) / 100;
    return {
      employeeId: emp.id,
      fullName: emp.fullName,
      position: emp.position,
      extraLevel: emp.extraLevel,
      department: emp.department,
      projectName: project?.name ?? null,
      projectId: emp.projectId,
      nif: emp.nif,
      nib: emp.nib,
      isExtra,
      totalHours,
      daysWorked,
      baseSalary,
      extraPayment,
      overtimeHours,
      overtimePayment,
      nightHours,
      nightPayment,
      weekendHours,
      weekendPayment,
      thirteenthProvision,
      fourteenthProvision,
      mealAllowance,
      mealAllowancePerDay,
      totalPayment,
      // Estimativa líquido (não fiscal)
      tsuEmployee,
      irsEstimate,
      netEstimate,
      hourlyRate: isExtra ? (() => {
        const NAME_BY_LEVEL = { 1: "junior", 2: "senior", 3: "terminal", 4: "master" };
        return rateByName.get(NAME_BY_LEVEL[emp.extraLevel ?? 1] ?? "junior") ?? rateMap.get(emp.extraLevel ?? 1) ?? 4.5;
      })() : baseSalary > 0 ? Math.round(baseSalary / STANDARD_MONTHLY_HOURS * 100) / 100 : 0
    };
  });
}
async function savePayslipRecord(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.insert(payslipHistory).values(data);
}
async function getPayslipHistoryList(filters = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters.year) conditions.push(eq(payslipHistory.year, filters.year));
  if (filters.month) conditions.push(eq(payslipHistory.month, filters.month));
  if (filters.employeeId) conditions.push(eq(payslipHistory.employeeId, filters.employeeId));
  if (filters.type) conditions.push(eq(payslipHistory.payslipType, filters.type));
  const query = db2.select().from(payslipHistory).orderBy(desc(payslipHistory.createdAt));
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}
async function deletePayslipRecord(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(payslipHistory).where(eq(payslipHistory.id, id));
}
async function getTaskAssignees(taskId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select({ assignee: taskAssignees, employee: employees }).from(taskAssignees).leftJoin(employees, eq(taskAssignees.employeeId, employees.id)).where(eq(taskAssignees.taskId, taskId));
}
async function setTaskAssignees(taskId, employeeIds) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
  if (employeeIds.length > 0) {
    await db2.insert(taskAssignees).values(
      employeeIds.map((employeeId) => ({ taskId, employeeId }))
    );
  }
}
async function getOverdueTasks() {
  const db2 = await getDb();
  if (!db2) return [];
  const now = /* @__PURE__ */ new Date();
  return db2.select().from(tasks).where(and(
    lte(tasks.dueDate, toMysqlDateTime(now)),
    eq(tasks.notifiedOverdue, 0),
    sql`${tasks.taskStatus} != 'done'`
  ));
}
async function getRecentlyCompletedTasks() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(tasks).where(and(
    eq(tasks.taskStatus, "done"),
    eq(tasks.notifiedComplete, 0)
  ));
}
async function markTaskNotified(taskId, field) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(tasks).set({ [field]: 1 }).where(eq(tasks.id, taskId));
}
async function getProjectHierarchyManagers(projectId) {
  const db2 = await getDb();
  if (!db2) return [];
  const allProjects = await db2.select().from(projects);
  const managers = [];
  let current = allProjects.find((p) => p.id === projectId);
  while (current) {
    managers.push({
      projectId: current.id,
      projectName: current.name,
      level: current.level,
      managerId: current.managerId
    });
    current = current.parentId ? allProjects.find((p) => p.id === current.parentId) : void 0;
  }
  return managers;
}
async function getProjectCosts(year, month) {
  const db2 = await getDb();
  if (!db2) return [];
  const allProjects = await db2.select().from(projects).orderBy(projects.name);
  const allAssignments = await db2.select().from(projectEmployees);
  const allEmployees = await db2.select().from(employees);
  const conditions = [];
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    conditions.push(gte(expenses.expenseDate, toMysqlDateTime(startDate)));
    conditions.push(lte(expenses.expenseDate, toMysqlDateTime(endDate)));
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    conditions.push(gte(expenses.expenseDate, toMysqlDateTime(startDate)));
    conditions.push(lte(expenses.expenseDate, toMysqlDateTime(endDate)));
  }
  conditions.push(sql`${expenses.status} != 'cancelled'`);
  const expenseRows = await db2.select({
    projectId: expenses.projectId,
    totalExpenses: sql`COALESCE(SUM(${expenses.amount}), 0)`,
    expenseCount: sql`COUNT(*)`,
    pendingExpenses: sql`COALESCE(SUM(CASE WHEN ${expenses.status} = 'pending' THEN ${expenses.amount} ELSE 0 END), 0)`,
    paidExpenses: sql`COALESCE(SUM(CASE WHEN ${expenses.status} = 'paid' THEN ${expenses.amount} ELSE 0 END), 0)`
  }).from(expenses).where(and(...conditions)).groupBy(expenses.projectId);
  const expenseMap = /* @__PURE__ */ new Map();
  for (const row of expenseRows) {
    expenseMap.set(row.projectId, {
      total: parseFloat(row.totalExpenses) || 0,
      count: row.expenseCount,
      pending: parseFloat(row.pendingExpenses) || 0,
      paid: parseFloat(row.paidExpenses) || 0
    });
  }
  const timeConditions = [];
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    timeConditions.push(gte(timeRecords.recordedAt, toMysqlDateTime(startDate)));
    timeConditions.push(lte(timeRecords.recordedAt, toMysqlDateTime(endDate)));
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    timeConditions.push(gte(timeRecords.recordedAt, toMysqlDateTime(startDate)));
    timeConditions.push(lte(timeRecords.recordedAt, toMysqlDateTime(endDate)));
  }
  const timeRows = await db2.select({
    employeeId: timeRecords.employeeId,
    totalHours: sql`COALESCE(SUM(${timeRecords.hoursWorked}), 0)`
  }).from(timeRecords).where(timeConditions.length > 0 ? and(...timeConditions) : void 0).groupBy(timeRecords.employeeId);
  const hoursMap = /* @__PURE__ */ new Map();
  for (const row of timeRows) {
    hoursMap.set(row.employeeId, row.totalHours || 0);
  }
  const rates = await db2.select().from(extraRates).orderBy(extraRates.level);
  const salaryCostMap = /* @__PURE__ */ new Map();
  for (const proj of allProjects) {
    const assignedEmployeeIds = allAssignments.filter((a) => a.projectId === proj.id).map((a) => a.employeeId);
    const directEmployeeIds = allEmployees.filter((e) => e.projectId === proj.id).map((e) => e.id);
    const uniqueIds = Array.from(/* @__PURE__ */ new Set([...assignedEmployeeIds, ...directEmployeeIds]));
    let totalSalary = 0;
    for (const empId of uniqueIds) {
      const emp = allEmployees.find((e) => e.id === empId);
      if (!emp) continue;
      if (emp.contractType === "extra") {
        const hours = hoursMap.get(empId) || 0;
        const rate = rates.find((r) => r.level === Number(emp.position || 1));
        const hourlyRate = rate ? parseFloat(String(rate.hourlyRate)) : 6;
        totalSalary += hours * hourlyRate;
      } else {
        totalSalary += parseFloat(String(emp.monthlySalary || 0));
      }
    }
    salaryCostMap.set(proj.id, { totalSalary, employeeCount: uniqueIds.length });
  }
  const allUsers = await db2.select().from(users);
  const userMap = /* @__PURE__ */ new Map();
  for (const u of allUsers) userMap.set(u.id, u.name || u.email || "\u2014");
  return allProjects.map((proj) => {
    const expData = expenseMap.get(proj.id) || { total: 0, count: 0, pending: 0, paid: 0 };
    const salData = salaryCostMap.get(proj.id) || { totalSalary: 0, employeeCount: 0 };
    const budget = parseFloat(String(proj.budget || 0));
    const totalCost = expData.total + salData.totalSalary;
    const remaining = budget - totalCost;
    const percentUsed = budget > 0 ? totalCost / budget * 100 : 0;
    return {
      id: proj.id,
      name: proj.name,
      level: proj.level,
      parentId: proj.parentId,
      color: proj.color,
      managerId: proj.managerId,
      managerName: proj.managerId ? userMap.get(proj.managerId) || "\u2014" : "\u2014",
      budget,
      expenses: expData.total,
      expenseCount: expData.count,
      pendingExpenses: expData.pending,
      paidExpenses: expData.paid,
      salaryCost: salData.totalSalary,
      employeeCount: salData.employeeCount,
      totalCost,
      remaining,
      percentUsed
    };
  });
}
async function getSpeedLimits() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(speedLimits).where(eq(speedLimits.isActive, 1));
}
async function getDefaultSpeedLimit() {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(speedLimits).where(eq(speedLimits.isDefault, 1)).limit(1);
  return rows[0] || null;
}
async function createSpeedLimit(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(speedLimits).values(data);
  return result.insertId;
}
async function updateSpeedLimit(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(speedLimits).set({ ...data, updatedAt: toMysqlDateTime(/* @__PURE__ */ new Date()) }).where(eq(speedLimits.id, id));
}
async function deleteSpeedLimit(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(speedLimits).where(eq(speedLimits.id, id));
}
async function recordSpeedViolation(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(speedViolations).values(data);
  return result.insertId;
}
async function getSpeedViolations(filters) {
  const db2 = await getDb();
  if (!db2) return [];
  const conditions = [];
  if (filters?.startDate) conditions.push(gte(speedViolations.occurredAt, toMysqlDateTime(filters.startDate)));
  if (filters?.endDate) conditions.push(lte(speedViolations.occurredAt, toMysqlDateTime(filters.endDate)));
  if (filters?.username) conditions.push(eq(speedViolations.zelloUsername, filters.username));
  if (filters?.acknowledged !== void 0) conditions.push(eq(speedViolations.acknowledged, filters.acknowledged ? 1 : 0));
  return db2.select().from(speedViolations).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(speedViolations.occurredAt));
}
async function acknowledgeSpeedViolation(id, userId, notes) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(speedViolations).set({
    acknowledged: 1,
    acknowledgedById: userId,
    acknowledgedAt: toMysqlDateTime(/* @__PURE__ */ new Date()),
    notes: notes || null
  }).where(eq(speedViolations.id, id));
}
async function getSpeedViolationStats(startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return { total: 0, unacknowledged: 0, topOffenders: [] };
  const conditions = [];
  if (startDate) conditions.push(gte(speedViolations.occurredAt, toMysqlDateTime(startDate)));
  if (endDate) conditions.push(lte(speedViolations.occurredAt, toMysqlDateTime(endDate)));
  const allViolations = await db2.select().from(speedViolations).where(conditions.length > 0 ? and(...conditions) : void 0);
  const total = allViolations.length;
  const unacknowledged = allViolations.filter((v) => !v.acknowledged).length;
  const byUser = {};
  for (const v of allViolations) {
    if (!byUser[v.zelloUsername]) {
      byUser[v.zelloUsername] = { count: 0, displayName: v.displayName || v.zelloUsername, avgExcess: 0 };
    }
    byUser[v.zelloUsername].count++;
    byUser[v.zelloUsername].avgExcess += parseFloat(String(v.excessPercent));
  }
  const topOffenders = Object.entries(byUser).map(([username, data]) => ({
    username,
    displayName: data.displayName,
    count: data.count,
    avgExcess: Math.round(data.avgExcess / data.count * 100) / 100
  })).sort((a, b) => b.count - a.count).slice(0, 10);
  return { total, unacknowledged, topOffenders };
}
async function createDailyDriverHistory(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(dailyDriverHistory).values(data);
  return result.insertId;
}
async function getDailyDriverHistoryByDate(dateStr) {
  const db2 = await getDb();
  if (!db2) return [];
  const startOfDay2 = new Date(dateStr);
  startOfDay2.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  return db2.select().from(dailyDriverHistory).where(and(gte(dailyDriverHistory.date, toMysqlDateTime(startOfDay2)), lte(dailyDriverHistory.date, toMysqlDateTime(endOfDay)))).orderBy(desc(dailyDriverHistory.totalKm));
}
async function getDailyDriverHistoryByUser(username, limit = 30) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(dailyDriverHistory).where(eq(dailyDriverHistory.zelloUsername, username)).orderBy(desc(dailyDriverHistory.date)).limit(limit);
}
async function getDailyDriverHistoryRange(startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(dailyDriverHistory).where(and(
    gte(dailyDriverHistory.date, toMysqlDateTime(new Date(startDate))),
    lte(dailyDriverHistory.date, toMysqlDateTime(new Date(endDate)))
  )).orderBy(desc(dailyDriverHistory.date));
}
async function getDailyDriverStats(dateStr) {
  const db2 = await getDb();
  if (!db2) return { totalDrivers: 0, totalKm: 0, totalHoursWorked: 0, totalHoursStopped: 0, maxSpeedOfDay: 0, avgBattery: 0, totalViolations: 0 };
  const startOfDay2 = new Date(dateStr);
  startOfDay2.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  const rows = await db2.select().from(dailyDriverHistory).where(and(gte(dailyDriverHistory.date, toMysqlDateTime(startOfDay2)), lte(dailyDriverHistory.date, toMysqlDateTime(endOfDay))));
  const totalDrivers = rows.length;
  const totalKm = rows.reduce((s, r) => s + parseFloat(String(r.totalKm || "0")), 0);
  const totalHoursWorked = rows.reduce((s, r) => s + parseFloat(String(r.hoursWorked || "0")), 0);
  const totalHoursStopped = rows.reduce((s, r) => s + parseFloat(String(r.hoursStopped || "0")), 0);
  const maxSpeedOfDay = Math.max(...rows.map((r) => parseFloat(String(r.maxSpeed || "0"))), 0);
  const avgBattery = totalDrivers > 0 ? Math.round(rows.reduce((s, r) => s + (r.avgBattery || 0), 0) / totalDrivers) : 0;
  const totalViolations = rows.reduce((s, r) => s + (r.speedViolations || 0), 0);
  return { totalDrivers, totalKm, totalHoursWorked, totalHoursStopped, maxSpeedOfDay, avgBattery, totalViolations };
}
async function createPda(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(pdas).values(data);
  return result.insertId;
}
async function updatePda(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(pdas).set(data).where(eq(pdas.id, id));
}
async function deletePda(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.delete(pdas).where(eq(pdas.id, id));
}
async function listPdas() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(pdas).orderBy(pdas.name);
}
async function getPdaById(id) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const [pda] = await db2.select().from(pdas).where(eq(pdas.id, id));
  return pda;
}
async function createPdaCheckin(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(pdaCheckins).values(data);
  return result.insertId;
}
async function checkoutPda(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(pdaCheckins).set({
    ...data,
    checkoutAt: toMysqlDateTime(/* @__PURE__ */ new Date()),
    checkinStatus: "checked_out"
  }).where(eq(pdaCheckins.id, id));
}
async function getActiveCheckins() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(pdaCheckins).where(eq(pdaCheckins.checkinStatus, "checked_in")).orderBy(desc(pdaCheckins.checkinAt));
}
async function getCheckinsByDate(dateStr) {
  const db2 = await getDb();
  if (!db2) return [];
  const startOfDay2 = new Date(dateStr);
  startOfDay2.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  return db2.select().from(pdaCheckins).where(and(gte(pdaCheckins.checkinAt, toMysqlDateTime(startOfDay2)), lte(pdaCheckins.checkinAt, toMysqlDateTime(endOfDay)))).orderBy(desc(pdaCheckins.checkinAt));
}
async function getCheckinsByPda(pdaId, limit = 30) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(pdaCheckins).where(eq(pdaCheckins.pdaId, pdaId)).orderBy(desc(pdaCheckins.checkinAt)).limit(limit);
}
async function createGpsAlert(data) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  const [result] = await db2.insert(gpsAlerts).values(data);
  return result.insertId;
}
async function getGpsAlerts(opts = {}) {
  const db2 = await getDb();
  if (!db2) return [];
  let query = db2.select().from(gpsAlerts).orderBy(desc(gpsAlerts.occurredAt)).limit(opts.limit || 50);
  if (opts.unacknowledgedOnly) {
    return db2.select().from(gpsAlerts).where(eq(gpsAlerts.acknowledged, 0)).orderBy(desc(gpsAlerts.occurredAt)).limit(opts.limit || 50);
  }
  return query;
}
async function acknowledgeGpsAlert(id, userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  await db2.update(gpsAlerts).set({
    acknowledged: 1,
    acknowledgedById: userId,
    acknowledgedAt: toMysqlDateTime(/* @__PURE__ */ new Date())
  }).where(eq(gpsAlerts.id, id));
}
async function getGpsAlertStats() {
  const db2 = await getDb();
  if (!db2) return { total: 0, unacknowledged: 0, todayAlerts: 0, byType: {} };
  const all = await db2.select().from(gpsAlerts).orderBy(desc(gpsAlerts.occurredAt)).limit(200);
  const total = all.length;
  const unacknowledged = all.filter((a) => !a.acknowledged).length;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayAlerts = all.filter((a) => new Date(a.occurredAt) >= today).length;
  const byType = {};
  all.forEach((a) => {
    byType[a.alertType] = (byType[a.alertType] || 0) + 1;
  });
  return { total, unacknowledged, todayAlerts, byType };
}
async function getCampaignByNameAndPlatform(name, platform) {
  const db2 = await getDb();
  if (!db2) return void 0;
  const result = await db2.select().from(campaigns).where(and(eq(campaigns.name, name), eq(campaigns.platform, platform))).limit(1);
  return result[0];
}
async function getExistingStatsForCampaignAndDateRange(campaignId, startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(campaignDailyStats).where(and(
    eq(campaignDailyStats.campaignId, campaignId),
    gte(campaignDailyStats.date, toMysqlDateTime(startDate)),
    lte(campaignDailyStats.date, toMysqlDateTime(endDate))
  ));
}
async function getReviewBySourceEmailId(sourceEmailId) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(googleReviews).where(eq(googleReviews.sourceEmailId, sourceEmailId)).limit(1);
  return rows[0] || null;
}
async function getIncidentBySourceEmailId(sourceEmailId) {
  const db2 = await getDb();
  if (!db2) return null;
  const rows = await db2.select().from(incidents).where(eq(incidents.sourceEmailId, sourceEmailId)).limit(1);
  return rows[0] || null;
}
async function importBookingHistory(rows) {
  const db2 = await getDb();
  if (!db2) throw new Error("DB not available");
  let imported = 0;
  let skipped = 0;
  for (const row of rows) {
    try {
      await db2.insert(bookingHistory).values({
        historyId: row.historyId,
        bookingId: row.bookingId,
        changeType: row.changeType,
        userName: row.userName ?? null,
        userLastName: row.userLastName ?? null,
        userEmail: row.userEmail ?? null,
        remarks: row.remarks ?? null,
        actionDate: row.actionDate ?? null,
        parkName: row.parkName ?? null,
        licensePlate: row.licensePlate ?? null,
        bookingStatus: row.bookingStatus ?? null
      });
      imported++;
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY" || err.message?.includes("Duplicate")) {
        skipped++;
      } else {
        throw err;
      }
    }
  }
  return { imported, skipped };
}
function splitAgentName(full) {
  if (!full) return { first: null, last: null };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}
async function getLostFoundBookingRefSet() {
  const db2 = await getDb();
  if (!db2) return /* @__PURE__ */ new Set();
  const items = await db2.select({ bookingRef: lostFoundItems.bookingRef }).from(lostFoundItems);
  const refs = /* @__PURE__ */ new Set();
  for (const it of items) {
    const r = it.bookingRef?.trim();
    if (r) refs.add(r);
  }
  return refs;
}
async function mapMultiparkHistoryRows(rows) {
  const flaggedRefs = await getLostFoundBookingRefSet();
  return rows.map((r) => {
    const { first, last } = splitAgentName(r.agentName);
    return {
      id: r.id,
      historyId: r.historyId,
      bookingId: r.bookingExternalId,
      changeType: r.changeType ?? "",
      userName: first,
      userLastName: last,
      userEmail: r.agentEmail,
      remarks: r.remarks,
      actionDate: r.actionTime,
      parkName: r.parkName,
      licensePlate: r.licensePlate,
      bookingStatus: r.bookingStatus,
      flagged: flaggedRefs.has(r.bookingExternalId) ? 1 : 0
    };
  });
}
async function getBookingHistoryByBookingId(bookingId) {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    id: multiparkBookingHistory.id,
    historyId: multiparkBookingHistory.historyId,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime,
    remarks: multiparkBookingHistory.remarks,
    agentName: multiparkBookingHistory.agentName,
    agentEmail: multiparkBookingHistory.agentEmail,
    parkName: multiparkBookings.parkName,
    licensePlate: multiparkBookings.licensePlate,
    bookingStatus: multiparkBookings.status
  }).from(multiparkBookingHistory).leftJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(eq(multiparkBookingHistory.bookingExternalId, bookingId)).orderBy(desc(multiparkBookingHistory.actionTime)).limit(500);
  return mapMultiparkHistoryRows(rows);
}
async function getBookingHistoryByPlate(plate) {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    id: multiparkBookingHistory.id,
    historyId: multiparkBookingHistory.historyId,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime,
    remarks: multiparkBookingHistory.remarks,
    agentName: multiparkBookingHistory.agentName,
    agentEmail: multiparkBookingHistory.agentEmail,
    parkName: multiparkBookings.parkName,
    licensePlate: multiparkBookings.licensePlate,
    bookingStatus: multiparkBookings.status
  }).from(multiparkBookingHistory).innerJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(like(multiparkBookings.licensePlate, `%${plate}%`)).orderBy(desc(multiparkBookingHistory.actionTime)).limit(500);
  return mapMultiparkHistoryRows(rows);
}
async function searchBookingHistory(search) {
  const db2 = await getDb();
  if (!db2) return [];
  const s = `%${search}%`;
  const rows = await db2.select({
    id: multiparkBookingHistory.id,
    historyId: multiparkBookingHistory.historyId,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime,
    remarks: multiparkBookingHistory.remarks,
    agentName: multiparkBookingHistory.agentName,
    agentEmail: multiparkBookingHistory.agentEmail,
    parkName: multiparkBookings.parkName,
    licensePlate: multiparkBookings.licensePlate,
    bookingStatus: multiparkBookings.status
  }).from(multiparkBookingHistory).leftJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(or(
    like(multiparkBookingHistory.bookingExternalId, s),
    like(multiparkBookings.licensePlate, s),
    like(multiparkBookingHistory.agentName, s),
    like(multiparkBookingHistory.changeType, s)
  )).orderBy(desc(multiparkBookingHistory.actionTime)).limit(200);
  return mapMultiparkHistoryRows(rows);
}
async function getBookingHistoryCrossReference() {
  const db2 = await getDb();
  if (!db2) return [];
  const flaggedRefs = await getLostFoundBookingRefSet();
  if (flaggedRefs.size === 0) return [];
  const refs = Array.from(flaggedRefs);
  const rows = await db2.select({
    agentName: multiparkBookingHistory.agentName,
    changeType: multiparkBookingHistory.changeType,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    licensePlate: multiparkBookings.licensePlate
  }).from(multiparkBookingHistory).leftJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(inArray(multiparkBookingHistory.bookingExternalId, refs));
  const driverMap = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!r.agentName) continue;
    const entry = driverMap.get(r.agentName) ?? { cases: /* @__PURE__ */ new Set(), plates: /* @__PURE__ */ new Set(), total: 0, checkins: 0, checkouts: 0, movements: 0 };
    entry.cases.add(r.bookingExternalId);
    if (r.licensePlate) entry.plates.add(r.licensePlate);
    entry.total++;
    const ct = (r.changeType ?? "").toUpperCase();
    if (ct === "CHECK_IN") entry.checkins++;
    else if (ct === "CHECK_OUT") entry.checkouts++;
    else if (ct === "MOVEMENT") entry.movements++;
    driverMap.set(r.agentName, entry);
  }
  return Array.from(driverMap.entries()).map(([userName, data]) => ({
    userName,
    caseCount: data.cases.size,
    plates: Array.from(data.plates),
    totalActions: data.total,
    checkins: data.checkins,
    checkouts: data.checkouts,
    movements: data.movements,
    flagged: 1
  })).sort((a, b) => b.caseCount - a.caseCount);
}
async function getBookingHistoryDriverStats() {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    userName: multiparkBookingHistory.agentName,
    total: sql`COUNT(*)`,
    checkins: sql`SUM(CASE WHEN UPPER(${multiparkBookingHistory.changeType}) = 'CHECK_IN' THEN 1 ELSE 0 END)`,
    checkouts: sql`SUM(CASE WHEN UPPER(${multiparkBookingHistory.changeType}) = 'CHECK_OUT' THEN 1 ELSE 0 END)`,
    movements: sql`SUM(CASE WHEN UPPER(${multiparkBookingHistory.changeType}) = 'MOVEMENT' THEN 1 ELSE 0 END)`
  }).from(multiparkBookingHistory).groupBy(multiparkBookingHistory.agentName).orderBy(desc(sql`COUNT(*)`));
  const cross = await getBookingHistoryCrossReference();
  const caseMap = new Map(cross.map((c) => [c.userName, c.caseCount]));
  return rows.map((r) => {
    const caseCount = caseMap.get(r.userName ?? "") ?? 0;
    return {
      userName: r.userName,
      total: Number(r.total),
      checkins: Number(r.checkins),
      checkouts: Number(r.checkouts),
      movements: Number(r.movements),
      caseCount,
      flagged: caseCount > 0 ? 1 : 0
    };
  });
}
async function getVehicleAgentsByPlate(plate, currentBookingRef) {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    agentName: multiparkBookingHistory.agentName,
    agentEmail: multiparkBookingHistory.agentEmail,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime,
    bookingExternalId: multiparkBookingHistory.bookingExternalId
  }).from(multiparkBookingHistory).innerJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(eq(multiparkBookings.licensePlate, plate)).orderBy(desc(multiparkBookingHistory.actionTime)).limit(2e3);
  const map = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!r.agentName) continue;
    const e = map.get(r.agentName) ?? {
      agentName: r.agentName,
      agentEmail: r.agentEmail ?? null,
      actions: 0,
      checkins: 0,
      checkouts: 0,
      movements: 0,
      lastActionAt: null,
      bookings: /* @__PURE__ */ new Set(),
      touchedRef: false
    };
    if (!e.agentEmail && r.agentEmail) e.agentEmail = r.agentEmail;
    e.actions++;
    const ct = (r.changeType ?? "").toUpperCase();
    if (ct === "CHECK_IN") e.checkins++;
    else if (ct === "CHECK_OUT") e.checkouts++;
    else if (ct === "MOVEMENT") e.movements++;
    if (r.actionTime && (!e.lastActionAt || r.actionTime > e.lastActionAt)) e.lastActionAt = r.actionTime;
    e.bookings.add(r.bookingExternalId);
    if (currentBookingRef && r.bookingExternalId === currentBookingRef) e.touchedRef = true;
    map.set(r.agentName, e);
  }
  return Array.from(map.values()).map((e) => ({
    agentName: e.agentName,
    agentEmail: e.agentEmail,
    actions: e.actions,
    checkins: e.checkins,
    checkouts: e.checkouts,
    movements: e.movements,
    lastActionAt: e.lastActionAt,
    bookings: Array.from(e.bookings),
    flagged: e.touchedRef ? 1 : 0
  })).sort((a, b) => b.flagged - a.flagged || b.actions - a.actions);
}
async function getCheckoutDriversFromDb(startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return { total: 0, period: { startDate, endDate }, drivers: [] };
  const startStr = toMysqlDateTime(new Date(startDate));
  const endStr = toMysqlDateTime(/* @__PURE__ */ new Date(endDate + "T23:59:59"));
  const rows = await db2.select({
    agentName: multiparkBookingHistory.agentName,
    agentUserId: multiparkBookingHistory.agentUserId,
    count: sql`COUNT(*)`
  }).from(multiparkBookingHistory).where(
    and(
      sql`UPPER(${multiparkBookingHistory.changeType}) = 'CHECK_OUT'`,
      gte(multiparkBookingHistory.actionTime, startStr),
      lte(multiparkBookingHistory.actionTime, endStr),
      isNotNull(multiparkBookingHistory.agentName)
    )
  ).groupBy(multiparkBookingHistory.agentName, multiparkBookingHistory.agentUserId).orderBy(desc(sql`COUNT(*)`));
  const drivers = rows.filter((r) => r.agentName).map((r) => ({
    name: r.agentName,
    userId: r.agentUserId ?? void 0,
    count: Number(r.count)
  }));
  const total = drivers.reduce((s, d) => s + d.count, 0);
  return { total, period: { startDate, endDate }, drivers };
}
async function getAgentHistoryFromDb(opts) {
  const db2 = await getDb();
  const empty = {
    total: 0,
    period: { startDate: opts.startDate, endDate: opts.endDate },
    agentName: opts.agentName ?? "",
    agentUserId: opts.userId ?? "",
    history: []
  };
  if (!db2) return empty;
  if (!opts.agentName && !opts.userId) return empty;
  const startStr = toMysqlDateTime(new Date(opts.startDate));
  const endStr = toMysqlDateTime(/* @__PURE__ */ new Date(opts.endDate + "T23:59:59"));
  const conds = [
    gte(multiparkBookingHistory.actionTime, startStr),
    lte(multiparkBookingHistory.actionTime, endStr)
  ];
  if (opts.userId) {
    conds.push(eq(multiparkBookingHistory.agentUserId, opts.userId));
  } else if (opts.agentName) {
    conds.push(sql`LOWER(${multiparkBookingHistory.agentName}) LIKE LOWER(${"%" + opts.agentName + "%"})`);
  }
  const rows = await db2.select({
    id: multiparkBookingHistory.historyId,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime,
    remarks: multiparkBookingHistory.remarks,
    agentName: multiparkBookingHistory.agentName,
    agentUserId: multiparkBookingHistory.agentUserId,
    modifiedFields: multiparkBookingHistory.modifiedFields,
    platform: multiparkBookingHistory.platform,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    bookingStatus: multiparkBookings.status,
    bookingCheckIn: multiparkBookings.checkIn,
    bookingCheckOut: multiparkBookings.checkOut,
    bookingParkName: multiparkBookings.parkName,
    bookingLicensePlate: multiparkBookings.licensePlate
  }).from(multiparkBookingHistory).leftJoin(multiparkBookings, eq(multiparkBookings.externalId, multiparkBookingHistory.bookingExternalId)).where(and(...conds)).orderBy(desc(multiparkBookingHistory.actionTime)).limit(500);
  const history = rows.map((r) => ({
    id: r.id,
    changeType: r.changeType ?? "",
    actionTime: r.actionTime ?? "",
    remarks: r.remarks ?? void 0,
    agentName: r.agentName ?? "",
    userId: r.agentUserId ?? "",
    modifiedFields: r.modifiedFields ?? void 0,
    platform: r.platform ?? void 0,
    booking: r.bookingExternalId ? {
      id: r.bookingExternalId,
      status: r.bookingStatus ?? "",
      checkIn: r.bookingCheckIn ?? "",
      checkOut: r.bookingCheckOut ?? void 0,
      parkName: r.bookingParkName ?? "",
      licensePlate: r.bookingLicensePlate ?? ""
    } : void 0
  }));
  const first = rows[0];
  return {
    total: history.length,
    period: { startDate: opts.startDate, endDate: opts.endDate },
    agentName: first?.agentName ?? opts.agentName ?? "",
    agentUserId: first?.agentUserId ?? opts.userId ?? "",
    history
  };
}
function classifyRemarks(remarks) {
  const r = remarks.toLowerCase();
  if (/\bdano|amassad|risc|batid|embat|colis|raspad|partid|partiu|partir/.test(r)) {
    return { incidentType: "dano", severity: "high" };
  }
  if (/\bvidro|janela\b/.test(r)) {
    return { incidentType: "vidro_aberto", severity: "medium" };
  }
  if (/\bmal\s*estacion|fora\s*do\s*lugar|posi[cç][aã]o\s*errad/.test(r)) {
    return { incidentType: "mal_estacionado", severity: "medium" };
  }
  if (/\bchav/.test(r)) {
    return { incidentType: "chave_errada", severity: "medium" };
  }
  if (/\bcombust[ií]vel|gasolina|diesel|gas[oó]leo|tanque\s*vazio|sem\s*combust|reserva\s*combust/.test(r)) {
    return { incidentType: "combustivel", severity: "medium" };
  }
  if (/\bsuj|limpez|limpar|nodoa|n[oó]doa|mancha/.test(r)) {
    return { incidentType: "limpeza", severity: "low" };
  }
  if (/\bdocument|carta\s*de\s*condu|livrete|seguro/.test(r)) {
    return { incidentType: "documentos", severity: "low" };
  }
  return { incidentType: "outro", severity: "low" };
}
async function syncIncidentsFromMultiparkHistory(opts = {}) {
  const db2 = await getDb();
  const empty = { scanned: 0, imported: 0, skipped: 0, errors: [], details: [] };
  if (!db2) return empty;
  const lookbackDays = opts.lookbackDays ?? 30;
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - lookbackDays);
  const sinceStr = toMysqlDateTime(since);
  const rows = await db2.select({
    historyId: multiparkBookingHistory.historyId,
    bookingExternalId: multiparkBookingHistory.bookingExternalId,
    remarks: multiparkBookingHistory.remarks,
    actionTime: multiparkBookingHistory.actionTime,
    agentName: multiparkBookingHistory.agentName,
    changeType: multiparkBookingHistory.changeType
  }).from(multiparkBookingHistory).where(
    and(
      isNotNull(multiparkBookingHistory.remarks),
      gte(multiparkBookingHistory.actionTime, sinceStr)
    )
  ).orderBy(desc(multiparkBookingHistory.actionTime)).limit(500);
  const result = { ...empty };
  for (const row of rows) {
    const remarks = (row.remarks ?? "").trim();
    if (!remarks || remarks.length < 3) continue;
    result.scanned++;
    const sourceKey = `mp:${row.historyId}`;
    try {
      const existing = await db2.select({ id: incidents.id }).from(incidents).where(eq(incidents.sourceEmailId, sourceKey)).limit(1);
      if (existing.length > 0) {
        result.skipped++;
        continue;
      }
    } catch (e) {
      result.errors.push(`Lookup ${row.historyId}: ${e.message}`);
      continue;
    }
    const cls = classifyRemarks(remarks);
    let vehiclePlate;
    try {
      const [booking] = await db2.select({ plate: multiparkBookings.licensePlate }).from(multiparkBookings).where(eq(multiparkBookings.externalId, row.bookingExternalId)).limit(1);
      vehiclePlate = booking?.plate ?? void 0;
    } catch {
    }
    const importedAtStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
    try {
      const id = await createIncident({
        incidentType: cls.incidentType,
        severity: cls.severity,
        status: "open",
        description: remarks.slice(0, 1e3),
        vehiclePlate,
        reportedBy: opts.reportedById ?? null,
        sourceEmailId: sourceKey,
        // reaproveita para dedup (Multipark history id)
        reservationLink: row.bookingExternalId,
        aiClassification: `Multipark \xB7 ${row.changeType ?? ""} \xB7 ${row.agentName ?? ""}`.trim(),
        importedAt: importedAtStr
      });
      result.imported++;
      result.details.push(`${cls.incidentType} (${cls.severity}) \u2014 ${remarks.slice(0, 60)}${remarks.length > 60 ? "\u2026" : ""}`);
    } catch (e) {
      result.errors.push(`Create ${row.historyId}: ${e.message}`);
    }
  }
  return result;
}
var _db, buyerEmployees, INCIDENT_SEVERITY_POINTS, EXTRAS_DIA_RATES;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    init_schema();
    _db = null;
    buyerEmployees = aliasedTable(employees, "buyer");
    INCIDENT_SEVERITY_POINTS = {
      low: 2,
      medium: 5,
      high: 10,
      critical: 20
    };
    EXTRAS_DIA_RATES = {
      junior: 4.5,
      senior: 5,
      terminal: 5.5,
      master: 6
    };
  }
});

// server/_core/notification.ts
var notification_exports = {};
__export(notification_exports, {
  notifyOwner: () => notifyOwner,
  sendEmail: () => sendEmail
});
import { TRPCError } from "@trpc/server";
import { createTransport } from "nodemailer";
function getTransporter() {
  if (_transporter) return _transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn("[Notification] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)");
    return null;
  }
  _transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return _transporter;
}
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  const transporter = getTransporter();
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!transporter || !ownerEmail) {
    console.log(`[Notification] ${title}: ${content}`);
    return true;
  }
  try {
    await transporter.sendMail({
      from: `"Dashboard Multipark" <${fromEmail}>`,
      to: ownerEmail,
      subject: `[Dashboard Multipark] ${title}`,
      text: content,
      html: `<h2>${title}</h2><p>${content.replace(/\n/g, "<br>")}</p>`
    });
    return true;
  } catch (error) {
    console.warn("[Notification] Failed to send email:", error);
    return false;
  }
}
async function sendEmail(options) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!transporter) {
    console.warn("[Email] SMTP not configured, cannot send email");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"Dashboard Multipark" <${fromEmail}>`,
      ...options
    });
    return true;
  } catch (error) {
    console.warn("[Email] Failed to send:", error);
    return false;
  }
}
var TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString2, _transporter, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
    _transporter = null;
    validatePayload = (input) => {
      if (!isNonEmptyString2(input.title)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification title is required."
        });
      }
      if (!isNonEmptyString2(input.content)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Notification content is required."
        });
      }
      const title = trimValue(input.title);
      const content = trimValue(input.content);
      if (title.length > TITLE_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
        });
      }
      if (content.length > CONTENT_MAX_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
        });
      }
      return { title, content };
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
import { put, head } from "@vercel/blob";
import fs from "fs";
import path from "path";
function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = relKey.replace(/^\/+/, "");
  const body = typeof data === "string" ? Buffer.from(data) : data;
  if (!isBlobConfigured()) {
    ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, path.sep));
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, body);
    const url = `/uploads/${key}`;
    return { key, url };
  }
  const blob = await put(key, body, {
    access: "public",
    contentType,
    addRandomSuffix: false
  });
  return { key, url: blob.url };
}
async function storageGet(relKey) {
  const key = relKey.replace(/^\/+/, "");
  if (!isBlobConfigured()) {
    const url = `/uploads/${key}`;
    return { key, url };
  }
  try {
    const blob = await head(key);
    return { key, url: blob.url };
  } catch {
    return { key, url: "" };
  }
}
var UPLOADS_DIR;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    UPLOADS_DIR = path.join(process.cwd(), "uploads");
  }
});

// server/multipark.ts
var multipark_exports = {};
__export(multipark_exports, {
  PARK_CONFIGS: () => PARK_CONFIGS,
  calculatePricing: () => calculatePricing,
  cancelBooking: () => cancelBooking,
  checkAvailability: () => checkAvailability,
  createBooking: () => createBooking,
  getAgentHistory: () => getAgentHistory,
  getBooking: () => getBooking,
  getBookingHistory: () => getBookingHistory,
  getBookingTryAllParks: () => getBookingTryAllParks,
  getBookingsReport: () => getBookingsReport,
  getBookingsReportAllParks: () => getBookingsReportAllParks,
  getBookingsReportForPark: () => getBookingsReportForPark,
  getCheckoutDrivers: () => getCheckoutDrivers,
  getConfiguredParks: () => getConfiguredParks,
  getParkApiKey: () => getParkApiKey,
  healthCheck: () => healthCheck,
  isMultiparkConfigured: () => isMultiparkConfigured,
  listParks: () => listParks,
  testConnection: () => testConnection,
  updateBooking: () => updateBooking
});
function getParkApiKey(parkConfig) {
  return process.env[parkConfig.envKey];
}
function getConfiguredParks() {
  return PARK_CONFIGS.filter((p) => !p.closed && !!process.env[p.envKey]);
}
async function multiparkRequest(opts) {
  const { method = "GET", path: path2, body, params, baseUrl } = opts;
  const base = baseUrl || ENV.multiparkApiUrl;
  const apiKey = opts.apiKey || ENV.multiparkApiKey;
  if (!apiKey) throw new Error("MULTIPARK_API_KEY n\xE3o configurada");
  let url = `${base}${path2}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : void 0,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      });
      if (res.status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1e3;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) {
        let errorBody = null;
        try {
          errorBody = await res.json();
        } catch {
        }
        const msg = errorBody?.error?.message || errorBody?.message || `HTTP ${res.status}`;
        const err = new Error(`MultiPark API: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
        err.status = res.status;
        err.details = errorBody?.error?.details || errorBody?.details;
        throw err;
      }
      if (res.status === 204) return {};
      return await res.json();
    } catch (error) {
      if (error.status) throw error;
      if (attempt === MAX_RETRIES - 1) throw error;
    }
  }
  throw new Error("MultiPark API: max retries exceeded");
}
async function healthCheck() {
  return multiparkRequest({ path: "/health" });
}
async function checkAvailability(checkIn, checkOut, vehicleType = "CAR", parkingType = "COVERED") {
  return multiparkRequest({
    path: "/availability",
    params: { checkIn, checkOut, vehicleType, parkingType }
  });
}
async function createBooking(data) {
  return multiparkRequest({ method: "POST", path: "/bookings", body: data });
}
async function updateBooking(id, data) {
  return multiparkRequest({ method: "PUT", path: `/bookings/${id}`, body: data });
}
async function getBooking(id, apiKey) {
  return multiparkRequest({ path: `/bookings/${id}`, apiKey });
}
async function getBookingTryAllParks(id) {
  const parks = getConfiguredParks();
  for (const park of parks) {
    try {
      const apiKey = getParkApiKey(park);
      if (!apiKey) continue;
      const booking = await multiparkRequest({
        path: `/bookings/${id}`,
        apiKey
      });
      if (booking?.id) return { booking, parkConfig: park };
    } catch {
    }
  }
  return null;
}
function isMultiparkConfigured() {
  return !!ENV.multiparkApiKey;
}
async function listParks() {
  if (!isMultiparkConfigured()) return { parks: [] };
  return multiparkRequest({
    path: "/parks",
    baseUrl: "https://api.multipark.pt/api/v1"
  });
}
async function getBookingsReport(startDate, endDate, actionType, apiKey) {
  return multiparkRequest({
    path: "/bookings/report",
    params: { startDate, endDate, actionType },
    apiKey
  });
}
async function getBookingsReportForPark(parkConfig, startDate, endDate, actionType) {
  const apiKey = getParkApiKey(parkConfig);
  if (!apiKey) throw new Error(`API key not configured for ${parkConfig.name} - ${parkConfig.city}`);
  const report = await getBookingsReport(startDate, endDate, actionType, apiKey);
  return { ...report, parkConfig };
}
async function getBookingsReportAllParks(startDate, endDate, actionType) {
  const parks = getConfiguredParks();
  const results = [];
  for (const park of parks) {
    try {
      const report = await getBookingsReport(startDate, endDate, actionType, getParkApiKey(park));
      results.push({ park, report });
    } catch (err) {
      console.error(`[MultiPark] Report failed for ${park.name} ${park.city}: ${err.message}`);
    }
  }
  return results;
}
async function cancelBooking(id, reason) {
  return multiparkRequest({
    method: "PUT",
    path: `/bookings/${id}/status`,
    body: { status: "CANCELLED", reason }
  });
}
async function calculatePricing(data) {
  return multiparkRequest({ method: "POST", path: "/pricing", body: data });
}
async function testConnection() {
  try {
    const health = await healthCheck();
    return { ok: true, message: `API OK (v${health.version})`, version: health.version };
  } catch (error) {
    return { ok: false, message: `Erro: ${error.message}` };
  }
}
async function getBookingHistory(bookingId, apiKey) {
  return multiparkRequest({
    path: `/bookings/${bookingId}/history`,
    apiKey
  });
}
async function getAgentHistory(opts) {
  const params = {
    startDate: opts.startDate,
    endDate: opts.endDate
  };
  if (opts.userId) params.userId = opts.userId;
  else if (opts.agentName) params.agentName = opts.agentName;
  else throw new Error("Either userId or agentName must be provided");
  return multiparkRequest({
    path: "/agent/history",
    params,
    apiKey: opts.apiKey
  });
}
async function getCheckoutDrivers(startDate, endDate, apiKey) {
  return multiparkRequest({
    path: "/bookings/checkoutDrivers",
    params: { startDate, endDate },
    apiKey
  });
}
var MAX_RETRIES, FETCH_TIMEOUT_MS, PARK_CONFIGS;
var init_multipark = __esm({
  "server/multipark.ts"() {
    "use strict";
    init_env();
    MAX_RETRIES = 3;
    FETCH_TIMEOUT_MS = Number(process.env.MULTIPARK_FETCH_TIMEOUT_MS || 15e3);
    PARK_CONFIGS = [
      { id: "LISBON_AIRPARK", name: "Airpark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_AIRPARK" },
      { id: "LISBON_REDPARK", name: "Redpark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_REDPARK" },
      { id: "LISBON_SKYPARK", name: "Skypark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_SKYPARK" },
      { id: "LISBON_TOP_PARKING", name: "Top-Parking", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_TOP_PARKING", closed: true },
      { id: "FARO_AIRPARK", name: "Airpark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_AIRPARK" },
      { id: "FARO_REDPARK", name: "Redpark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_REDPARK" },
      { id: "FARO_SKYPARK", name: "Skypark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_SKYPARK" },
      { id: "PORTO_AIRPARK", name: "Airpark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_AIRPARK" },
      { id: "PORTO_REDPARK", name: "Redpark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_REDPARK" },
      { id: "PORTO_SKYPARK", name: "Skypark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_SKYPARK" },
      { id: "LISBON_BOARDINGPARK", name: "Boardingpark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_BOARDINGPARK" },
      { id: "LISBON_PARKDIRECT", name: "Parkdirect", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_PARKDIRECT" },
      { id: "LISBON_PREMIUM_PARK", name: "Premium Park", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_PREMIUM_PARK" },
      { id: "LISBON_READYPARK", name: "Readypark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_READYPARK" },
      { id: "LISBON_STOP_FLY_PARK", name: "Stop & Fly Park", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_STOP_FLY_PARK" },
      { id: "LISBON_TRAVELPARKING", name: "Travelparking", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_TRAVELPARKING" },
      { id: "LISBON_VIAGENSPARKING", name: "Viagensparking", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_VIAGENSPARKING" },
      // closed até haver chave válida — a fornecida devolve 401 Invalid API key (2026-06-11)
      { id: "FARO_BOARDINGPARK", name: "Boardingpark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_BOARDINGPARK", closed: true },
      { id: "FARO_PARKDIRECT", name: "Parkdirect", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_PARKDIRECT" },
      { id: "FARO_PREMIUM_PARK", name: "Premium Park", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_PREMIUM_PARK" },
      { id: "FARO_READYPARK", name: "Readypark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_READYPARK" },
      { id: "FARO_STOP_FLY_PARK", name: "Stop & Fly Park", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_STOP_FLY_PARK" },
      { id: "FARO_TRAVELPARKING", name: "Travelparking", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_TRAVELPARKING" },
      { id: "FARO_VIAGENSPARKING", name: "Viagensparking", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_VIAGENSPARKING" },
      { id: "PORTO_BOARDINGPARK", name: "Boardingpark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_BOARDINGPARK" },
      { id: "PORTO_PARKDIRECT", name: "Parkdirect", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_PARKDIRECT" },
      { id: "PORTO_PREMIUM_PARK", name: "Premium Park", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_PREMIUM_PARK" },
      { id: "PORTO_READYPARK", name: "Readypark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_READYPARK" },
      { id: "PORTO_STOP_FLY_PARK", name: "Stop & Fly Park", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_STOP_FLY_PARK" },
      { id: "PORTO_TRAVELPARKING", name: "Travelparking", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_TRAVELPARKING" },
      { id: "PORTO_VIAGENSPARKING", name: "Viagensparking", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_VIAGENSPARKING" }
    ];
  }
});

// server/extrasDia.ts
import { and as and2, asc, eq as eq2, gte as gte2, lte as lte2, sql as sql2 } from "drizzle-orm";
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function dateKey(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toMysqlDateTime2(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function hourOf(ts) {
  if (!ts) return null;
  const d = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours();
}
function minuteOf(ts) {
  if (!ts) return null;
  const d = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.getMinutes();
}
function parseScheduledHM(timeStr, fallbackIso) {
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [hh, mm] = timeStr.split(":");
    const h3 = parseInt(hh, 10);
    const m2 = parseInt(mm, 10);
    if (h3 >= 0 && h3 < 24 && m2 >= 0 && m2 < 60) return { hour: h3, minute: m2 };
  }
  const h2 = hourOf(fallbackIso);
  const m = minuteOf(fallbackIso);
  if (h2 !== null && m !== null) return { hour: h2, minute: m };
  return null;
}
function bookingHasLavagem(rawJson) {
  if (!rawJson) return false;
  try {
    const data = JSON.parse(rawJson);
    const extras = data?.extraServices;
    if (!Array.isArray(extras)) return false;
    return extras.some((e) => {
      const name = typeof e === "string" ? e : e?.name;
      return typeof name === "string" && LAVAGEM_RE.test(name);
    });
  } catch {
    return false;
  }
}
function suggestShifts(hourlyCars, level = "junior") {
  const rateInfo = DRIVER_LEVELS.find((l) => l.id === level);
  const driversPerHour = hourlyCars.map((c) => Math.ceil(c / CARS_PER_HOUR_PER_DRIVER));
  const peak = Math.max(0, ...driversPerHour);
  if (peak === 0) {
    return { shifts: [], totalCost: 0, peakDrivers: 0, totalDriverHours: 0 };
  }
  const shifts = [];
  for (let slot = 0; slot < peak; slot++) {
    const active = [];
    for (let h2 = 0; h2 < driversPerHour.length; h2++) if (driversPerHour[h2] > slot) active.push(h2);
    if (active.length === 0) continue;
    const start = active[0];
    const end = active[active.length - 1] + 1;
    let span = end - start;
    if (span < MIN_SHIFT_HOURS) span = MIN_SHIFT_HOURS;
    let cursor = start;
    while (span > 0) {
      const chunk = Math.min(span, MAX_SHIFT_HOURS);
      shifts.push({
        startHour: cursor,
        endHour: cursor + chunk,
        hours: chunk,
        level: rateInfo.id,
        label: rateInfo.label,
        hourlyRate: rateInfo.hourlyRate,
        cost: chunk * rateInfo.hourlyRate
      });
      cursor += chunk;
      span -= chunk;
    }
  }
  const totalDriverHours = shifts.reduce((s, x) => s + x.hours, 0);
  const totalCost = shifts.reduce((s, x) => s + x.cost, 0);
  return { shifts, totalCost, peakDrivers: peak, totalDriverHours };
}
function classifyDeliveryType(dt) {
  if (!dt) return "unknown";
  const x = dt.toLowerCase();
  if (x.includes("terminal 1")) return "t1";
  if (x.includes("terminal 2")) return "t2";
  if (x === "vip" || x.endsWith(" vip")) return "vip";
  return "other";
}
async function fetchBookingsInRange(field, startInclusive, endExclusive) {
  const db2 = await getDb();
  if (!db2) return [];
  const col = field === "checkIn" ? multiparkBookings.checkIn : multiparkBookings.checkOut;
  const startStr = toMysqlDateTime2(startInclusive);
  const endStr = toMysqlDateTime2(endExclusive);
  return db2.select({
    id: multiparkBookings.id,
    externalId: multiparkBookings.externalId,
    bookingNumber: multiparkBookings.bookingNumber,
    clientFirstName: multiparkBookings.clientFirstName,
    clientLastName: multiparkBookings.clientLastName,
    licensePlate: multiparkBookings.licensePlate,
    checkIn: multiparkBookings.checkIn,
    checkOut: multiparkBookings.checkOut,
    checkInTime: multiparkBookings.checkInTime,
    checkOutTime: multiparkBookings.checkOutTime,
    rawJson: multiparkBookings.rawJson,
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city,
    deliveryType: multiparkBookings.deliveryType,
    enrichedAt: multiparkBookings.enrichedAt,
    spotType: multiparkBookings.spotType,
    extrasTotal: multiparkBookings.extrasTotal
  }).from(multiparkBookings).where(
    and2(
      gte2(col, startStr),
      lte2(col, endStr),
      sql2`${multiparkBookings.status} != 'CANCELLED'`,
      sql2`(LOWER(${multiparkBookings.city}) LIKE ${CITY_PATTERN} OR ${multiparkBookings.parkId} LIKE ${PARK_ID_PREFIX})`
    )
  ).limit(2e4);
}
function deriveShortName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 1]}`;
}
function computeAssignmentCost(row) {
  const end = row.sentHomeHour ?? row.endHour;
  const hours = Math.max(0, end - row.startHour);
  if (row.isTeamLeader) {
    return { hoursBilled: hours, cost: row.tlDailyCost ?? 0 };
  }
  const rate = DRIVER_LEVELS.find((l) => l.id === row.level)?.hourlyRate ?? 0;
  return { hoursBilled: hours, cost: hours * rate };
}
function rowToAssignment(r, tlDailyCost, multiparkAgentName, multiparkAgentUserId) {
  const isTL = r.isTeamLeader === 1;
  const level = r.level ?? null;
  const computed = computeAssignmentCost({
    level,
    isTeamLeader: isTL,
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
    tlDailyCost
  });
  return {
    id: r.id,
    assignmentDate: r.assignmentDate,
    employeeId: r.employeeId,
    personName: r.personName,
    level,
    isTeamLeader: isTL,
    shift: r.shift ?? "morning",
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
    notes: r.notes,
    multiparkAgentName: multiparkAgentName ?? null,
    multiparkAgentUserId: multiparkAgentUserId ?? null,
    ...computed
  };
}
async function getEmployeeDailyCost(employeeId) {
  if (!employeeId) return 0;
  const db2 = await getDb();
  if (!db2) return 0;
  const [row] = await db2.select({ monthlySalary: employees.monthlySalary }).from(employees).where(eq2(employees.id, employeeId)).limit(1);
  if (!row?.monthlySalary) return 0;
  const monthly = parseFloat(String(row.monthlySalary));
  if (!Number.isFinite(monthly)) return 0;
  return monthly / TL_WORKING_DAYS_PER_MONTH;
}
async function listAssignments(date) {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select().from(extrasDiaAssignments).where(eq2(extrasDiaAssignments.assignmentDate, date)).orderBy(asc(extrasDiaAssignments.startHour));
  const empIds = Array.from(new Set(rows.map((r) => r.employeeId).filter((x) => x !== null)));
  const empMap = /* @__PURE__ */ new Map();
  if (empIds.length > 0) {
    const empRows = await db2.select({
      id: employees.id,
      multiparkAgentName: employees.multiparkAgentName,
      multiparkAgentUserId: employees.multiparkAgentUserId
    }).from(employees).where(sql2`${employees.id} IN (${sql2.raw(empIds.join(","))})`);
    for (const e of empRows) {
      empMap.set(e.id, {
        multiparkAgentName: e.multiparkAgentName,
        multiparkAgentUserId: e.multiparkAgentUserId
      });
    }
  }
  const result = [];
  for (const r of rows) {
    let tlCost;
    if (r.isTeamLeader === 1) {
      tlCost = await getEmployeeDailyCost(r.employeeId);
    }
    const map = r.employeeId ? empMap.get(r.employeeId) : void 0;
    result.push(rowToAssignment(r, tlCost, map?.multiparkAgentName, map?.multiparkAgentUserId));
  }
  return result;
}
async function upsertAssignment(input) {
  const db2 = await getDb();
  if (!db2) return null;
  const isTL = !!input.isTeamLeader;
  if (isTL) {
    const existing = await db2.select({ id: extrasDiaAssignments.id }).from(extrasDiaAssignments).where(
      and2(
        eq2(extrasDiaAssignments.assignmentDate, input.assignmentDate),
        eq2(extrasDiaAssignments.shift, input.shift),
        eq2(extrasDiaAssignments.isTeamLeader, 1)
      )
    );
    const other = existing.find((e) => e.id !== (input.id ?? -1));
    if (other) {
      const label = input.shift === "morning" ? "manh\xE3" : "noite";
      throw new Error(`J\xE1 existe um Team Leader para o turno da ${label} deste dia.`);
    }
  }
  const payload = {
    assignmentDate: input.assignmentDate,
    employeeId: input.employeeId ?? null,
    personName: input.personName,
    level: isTL ? null : input.level ?? "junior",
    isTeamLeader: isTL ? 1 : 0,
    shift: input.shift,
    startHour: input.startHour,
    endHour: input.endHour,
    sentHomeHour: input.sentHomeHour ?? null,
    notes: input.notes ?? null
  };
  if (input.id) {
    await db2.update(extrasDiaAssignments).set(payload).where(eq2(extrasDiaAssignments.id, input.id));
    const [row2] = await db2.select().from(extrasDiaAssignments).where(eq2(extrasDiaAssignments.id, input.id)).limit(1);
    if (!row2) return null;
    const tlCost2 = row2.isTeamLeader === 1 ? await getEmployeeDailyCost(row2.employeeId) : void 0;
    return rowToAssignment(row2, tlCost2);
  }
  const [result] = await db2.insert(extrasDiaAssignments).values({ ...payload, createdById: input.createdById ?? null }).$returningId();
  const newId = result.id;
  const [row] = await db2.select().from(extrasDiaAssignments).where(eq2(extrasDiaAssignments.id, newId)).limit(1);
  if (!row) return null;
  const tlCost = row.isTeamLeader === 1 ? await getEmployeeDailyCost(row.employeeId) : void 0;
  return rowToAssignment(row, tlCost);
}
async function deleteAssignment(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(extrasDiaAssignments).where(eq2(extrasDiaAssignments.id, id));
}
async function getExtrasDiaCostForRange(startDate, endDate) {
  const db2 = await getDb();
  if (!db2) return { real: 0, estimate: 0, total: 0, days: 0, daysWithReal: 0, daysWithEstimate: 0 };
  const start = startOfDay(/* @__PURE__ */ new Date(startDate + "T00:00:00"));
  const end = startOfDay(/* @__PURE__ */ new Date(endDate + "T00:00:00"));
  const todayStart = startOfDay(/* @__PURE__ */ new Date());
  let real = 0;
  let estimate = 0;
  let days = 0;
  let daysWithReal = 0;
  let daysWithEstimate = 0;
  async function forecastCheapestFor(d) {
    const baseDate = new Date(d);
    baseDate.setDate(baseDate.getDate() - 1);
    try {
      const forecast = await getExtrasDiaForecast(dateKey(baseDate));
      return forecast.allocation.cheapest.totalCost;
    } catch {
      return 0;
    }
  }
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    const dateKey_ = dateKey(d);
    days++;
    if (d.getTime() < todayStart.getTime()) {
      const assignments = await listAssignments(dateKey_);
      if (assignments.length > 0) {
        for (const a of assignments) real += a.cost;
        daysWithReal++;
      } else {
        estimate += await forecastCheapestFor(d);
        daysWithEstimate++;
      }
    } else {
      estimate += await forecastCheapestFor(d);
      daysWithEstimate++;
    }
  }
  return { real, estimate, total: real + estimate, days, daysWithReal, daysWithEstimate };
}
async function getBookingsInSlot(targetDate, hour, slot, type) {
  const day = /* @__PURE__ */ new Date(targetDate + "T00:00:00");
  const targetStartLocal = startOfDay(day);
  const dayOffset = Math.floor(hour / 24);
  const dayStart = addDays(targetStartLocal, dayOffset);
  const dayEnd = addDays(dayStart, 1);
  const hourLocal = hour % 24;
  const field = type === "checkin" ? "checkIn" : "checkOut";
  const rows = await fetchBookingsInRange(field, dayStart, dayEnd);
  const slotStart = slot * SLOT_MINUTES;
  const slotEnd = slotStart + SLOT_MINUTES;
  const pendings = [];
  for (const r of rows) {
    const hm = type === "checkin" ? parseScheduledHM(r.checkInTime, r.checkIn) : parseScheduledHM(r.checkOutTime, r.checkOut);
    if (!hm || hm.hour !== hourLocal) continue;
    if (hm.minute < slotStart || hm.minute >= slotEnd) continue;
    const name = [r.clientFirstName, r.clientLastName].filter(Boolean).join(" ").trim();
    const pad = (n) => String(n).padStart(2, "0");
    pendings.push({
      row: r,
      summary: {
        id: r.id,
        externalId: r.externalId,
        bookingNumber: r.bookingNumber,
        clientName: name || "\u2014",
        licensePlate: r.licensePlate,
        parkName: r.parkName,
        time: `${pad(hm.hour)}:${pad(hm.minute)}`,
        deliveryType: r.deliveryType
      }
    });
  }
  const toEnrich = pendings.filter((p) => !p.row.enrichedAt);
  if (toEnrich.length > 0) {
    await Promise.allSettled(toEnrich.map(async (p) => {
      const enriched = await enrichBookingFromApi(p.row.externalId);
      if (enriched?.deliveryType) p.summary.deliveryType = enriched.deliveryType;
    }));
  }
  return pendings.map((p) => p.summary).sort((a, b) => a.time.localeCompare(b.time));
}
async function enrichBookingFromApi(externalId) {
  try {
    const found = await getBookingTryAllParks(externalId);
    if (!found) return null;
    const b = found.booking;
    const deliveryType = typeof b.deliveryType === "string" ? b.deliveryType : null;
    const returnFlight = typeof b.returnFlight === "string" && b.returnFlight ? b.returnFlight : null;
    const departingFlight = typeof b.departingFlight === "string" && b.departingFlight ? b.departingFlight : null;
    const remarks = typeof b.remarks === "string" && b.remarks ? b.remarks.slice(0, 512) : null;
    const db2 = await getDb();
    if (db2) {
      await db2.update(multiparkBookings).set({
        deliveryType,
        returnFlight,
        departingFlight,
        remarks,
        enrichedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
      }).where(eq2(multiparkBookings.externalId, externalId));
    }
    return { deliveryType, returnFlight, departingFlight, remarks };
  } catch {
    return null;
  }
}
function suggestLevel(position, extraLevel) {
  if (typeof extraLevel === "number") {
    if (extraLevel >= 4) return "master";
    if (extraLevel >= 3) return "terminal";
    if (extraLevel >= 2) return "senior";
    return "junior";
  }
  return POSITION_TO_LEVEL[(position ?? "").toLowerCase()] ?? "junior";
}
async function listDriverCandidates() {
  const db2 = await getDb();
  if (!db2) return [];
  const rows = await db2.select({
    id: employees.id,
    fullName: employees.fullName,
    position: employees.position,
    extraLevel: employees.extraLevel,
    isActive: employees.isActive
  }).from(employees).where(eq2(employees.isActive, 1)).orderBy(asc(employees.fullName));
  return rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    position: r.position,
    extraLevel: r.extraLevel,
    suggestedLevel: suggestLevel(r.position, r.extraLevel)
  }));
}
function countWashes(rows) {
  let n = 0;
  for (const r of rows) if (bookingHasLavagem(r.rawJson)) n++;
  return n;
}
async function getExtrasDiaForecast(baseDateInput) {
  const baseDate = baseDateInput ? new Date(baseDateInput) : /* @__PURE__ */ new Date();
  const baseStart = startOfDay(baseDate);
  const targetStart = addDays(baseStart, 1);
  const nextStart = addDays(baseStart, 2);
  const nextEnd = addDays(baseStart, 3);
  const targetEndPlus3h = new Date(targetStart.getTime() + FORECAST_HOURS * 60 * 60 * 1e3);
  const [targetCheckins, baseCheckouts, targetCheckouts, nextCheckouts] = await Promise.all([
    fetchBookingsInRange("checkIn", targetStart, targetEndPlus3h),
    fetchBookingsInRange("checkOut", baseStart, targetStart),
    fetchBookingsInRange("checkOut", targetStart, targetEndPlus3h),
    fetchBookingsInRange("checkOut", nextStart, nextEnd)
  ]);
  const hourly = Array.from({ length: FORECAST_HOURS }, (_, h2) => ({
    hour: h2,
    checkins: 0,
    checkouts: 0,
    driversNeeded: 0,
    hasT2: false,
    hasOther: false,
    slots: Array.from({ length: SLOTS_PER_HOUR }, (_2, s) => ({
      hour: h2,
      slot: s,
      checkins: 0,
      checkouts: 0,
      weightedDemand: 0,
      driversNeeded: 0
    }))
  }));
  const weightedBySlot = Array.from({ length: FORECAST_SLOTS }, () => 0);
  function bookingEffectiveHM(timeStr, fallbackIso) {
    const hm = parseScheduledHM(timeStr, fallbackIso);
    if (!hm) return null;
    if (!fallbackIso) return hm.hour >= 3 ? hm : null;
    const date = new Date(fallbackIso.includes("T") ? fallbackIso : fallbackIso.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return hm.hour >= 3 ? hm : null;
    const dayStartLocal = startOfDay(date);
    const offsetDays = Math.round((dayStartLocal.getTime() - targetStart.getTime()) / (24 * 60 * 60 * 1e3));
    const effectiveHour = hm.hour + 24 * offsetDays;
    if (effectiveHour < 3 || effectiveHour >= FORECAST_HOURS) return null;
    return { hour: effectiveHour, minute: hm.minute };
  }
  function addToSlot(startHour, startMinute, deliveryType, type) {
    const startSlot = startHour * SLOTS_PER_HOUR + Math.floor(startMinute / SLOT_MINUTES);
    const cls = classifyDeliveryType(deliveryType);
    let spread;
    if (cls === "t2" && type === "checkin") spread = [1, 0.5];
    else if (cls === "other") spread = [1, 1, 1];
    else spread = [1];
    for (let i = 0; i < spread.length; i++) {
      const s = startSlot + i;
      if (s >= 0 && s < FORECAST_SLOTS) weightedBySlot[s] += spread[i];
    }
  }
  function markHourClass(hour, deliveryType, type) {
    const cls = classifyDeliveryType(deliveryType);
    if (cls === "t2" && type === "checkin") hourly[hour].hasT2 = true;
    else if (cls === "other") hourly[hour].hasOther = true;
  }
  for (const r of targetCheckins) {
    const hm = bookingEffectiveHM(r.checkInTime, r.checkIn);
    if (hm) {
      const slot = Math.floor(hm.minute / SLOT_MINUTES);
      hourly[hm.hour].checkins++;
      hourly[hm.hour].slots[slot].checkins++;
      addToSlot(hm.hour, hm.minute, r.deliveryType, "checkin");
      markHourClass(hm.hour, r.deliveryType, "checkin");
    }
  }
  for (const r of targetCheckouts) {
    const hm = bookingEffectiveHM(r.checkOutTime, r.checkOut);
    if (hm) {
      const slot = Math.floor(hm.minute / SLOT_MINUTES);
      hourly[hm.hour].checkouts++;
      hourly[hm.hour].slots[slot].checkouts++;
      addToSlot(hm.hour, hm.minute, r.deliveryType, "checkout");
      markHourClass(hm.hour, r.deliveryType, "checkout");
    }
  }
  for (const row of hourly) {
    let hourWeighted = 0;
    for (const s of row.slots) {
      const idx = s.hour * SLOTS_PER_HOUR + s.slot;
      s.weightedDemand = weightedBySlot[idx];
      s.driversNeeded = Math.ceil(s.weightedDemand);
      hourWeighted += s.weightedDemand;
    }
    row.driversNeeded = Math.ceil(hourWeighted / SLOTS_PER_HOUR);
  }
  const hourlyCars = hourly.map((h2) => h2.slots.reduce((acc, s) => acc + s.weightedDemand, 0));
  const cheapest = suggestShifts(hourlyCars, "junior");
  const bySingleLevel = DRIVER_LEVELS.map((l) => {
    const r = suggestShifts(hourlyCars, l.id);
    return { level: l.id, label: l.label, totalCost: r.totalCost, totalHours: r.totalDriverHours };
  });
  const allParks = /* @__PURE__ */ new Set();
  for (const r of [...targetCheckins, ...baseCheckouts, ...targetCheckouts, ...nextCheckouts]) {
    const label = [r.parkName, r.city].filter(Boolean).join(" / ");
    if (label) allParks.add(label);
  }
  const spotTypeCounts = { covered: 0, uncovered: 0, indoor: 0, unknown: 0 };
  const spotTypeByDirection = {
    checkin: { covered: 0, uncovered: 0, indoor: 0, unknown: 0 },
    checkout: { covered: 0, uncovered: 0, indoor: 0, unknown: 0 }
  };
  const seenForSpot = /* @__PURE__ */ new Set();
  for (const r of targetCheckins) {
    const st = r.spotType ?? "unknown";
    if (st in spotTypeByDirection.checkin) spotTypeByDirection.checkin[st]++;
    if (!seenForSpot.has(r.externalId)) {
      seenForSpot.add(r.externalId);
      if (st in spotTypeCounts) spotTypeCounts[st]++;
    }
  }
  for (const r of targetCheckouts) {
    const st = r.spotType ?? "unknown";
    if (st in spotTypeByDirection.checkout) spotTypeByDirection.checkout[st]++;
    if (!seenForSpot.has(r.externalId)) {
      seenForSpot.add(r.externalId);
      if (st in spotTypeCounts) spotTypeCounts[st]++;
    }
  }
  const extrasValue = { estimate: 0, real: 0, total: 0 };
  const seenForExtras = /* @__PURE__ */ new Set();
  const nowMs = Date.now();
  function addExtras(r, dateStr) {
    if (seenForExtras.has(r.externalId)) return;
    seenForExtras.add(r.externalId);
    const v = r.extrasTotal ? parseFloat(r.extrasTotal) : 0;
    if (!Number.isFinite(v) || v === 0) return;
    const d = dateStr ? new Date(dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T")) : null;
    const isFuture = d && d.getTime() > nowMs;
    if (isFuture) extrasValue.estimate += v;
    else extrasValue.real += v;
    extrasValue.total += v;
  }
  for (const r of targetCheckins) addExtras(r, r.checkIn);
  for (const r of targetCheckouts) addExtras(r, r.checkOut);
  return {
    baseDate: dateKey(baseStart),
    targetDate: dateKey(targetStart),
    city: "Lisboa",
    source: "db",
    parksQueried: Array.from(allParks).sort(),
    parksFailed: [],
    hourly,
    totals: {
      checkins: hourly.reduce((s, h2) => s + h2.checkins, 0),
      checkouts: hourly.reduce((s, h2) => s + h2.checkouts, 0),
      operations: hourly.reduce((s, h2) => s + h2.checkins + h2.checkouts, 0)
    },
    spotTypeCounts,
    spotTypeByDirection,
    extrasValue,
    washes: {
      base: { date: dateKey(baseStart), exitsWithWash: countWashes(baseCheckouts) },
      target: { date: dateKey(targetStart), exitsWithWash: countWashes(targetCheckouts) },
      next: { date: dateKey(nextStart), exitsWithWash: countWashes(nextCheckouts) }
    },
    allocation: { cheapest, bySingleLevel }
  };
}
var DRIVER_LEVELS, CARS_PER_HOUR_PER_DRIVER, MIN_SHIFT_HOURS, MAX_SHIFT_HOURS, TL_WORKING_DAYS_PER_MONTH, SLOT_MINUTES, SLOTS_PER_HOUR, SLOTS_PER_DAY, FORECAST_HOURS, FORECAST_SLOTS, CITY_PATTERN, PARK_ID_PREFIX, LAVAGEM_RE, POSITION_TO_LEVEL;
var init_extrasDia = __esm({
  "server/extrasDia.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_multipark();
    DRIVER_LEVELS = [
      { id: "junior", label: "J\xFAnior", hourlyRate: 4.5 },
      { id: "senior", label: "S\xE9nior", hourlyRate: 5 },
      { id: "terminal", label: "Terminal", hourlyRate: 5.5 },
      { id: "master", label: "Master", hourlyRate: 6 }
    ];
    CARS_PER_HOUR_PER_DRIVER = 3;
    MIN_SHIFT_HOURS = 3;
    MAX_SHIFT_HOURS = 12;
    TL_WORKING_DAYS_PER_MONTH = 15;
    SLOT_MINUTES = 20;
    SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
    SLOTS_PER_DAY = 24 * SLOTS_PER_HOUR;
    FORECAST_HOURS = 27;
    FORECAST_SLOTS = FORECAST_HOURS * SLOTS_PER_HOUR;
    CITY_PATTERN = "%lisb%";
    PARK_ID_PREFIX = "LISBON_%";
    LAVAGEM_RE = /lavag|wash/i;
    POSITION_TO_LEVEL = {
      driver: "junior",
      senior_driver: "senior",
      team_leader: "terminal",
      supervisor: "master",
      director: "master"
    };
  }
});

// server/spotClassification.ts
function classifyAllocation(allocation) {
  if (!allocation || typeof allocation !== "string") {
    return { parkBrand: "other", spotType: "unknown" };
  }
  const trimmed = allocation.trim();
  if (!/^\d{4,6}$/.test(trimmed)) {
    return { parkBrand: "other", spotType: "unknown" };
  }
  const num = parseInt(trimmed, 10);
  const brandDigit = Math.floor(num / 1e4);
  let parkBrand;
  if (brandDigit === 1) parkBrand = "airpark";
  else if (brandDigit === 2) parkBrand = "redpark";
  else if (brandDigit === 3) parkBrand = "skypark";
  else return { parkBrand: "other", spotType: "unknown" };
  const lowFour = num % 1e4;
  let spotType;
  if (lowFour < 5e3) spotType = "uncovered";
  else if (lowFour < 8e3) spotType = "covered";
  else spotType = "indoor";
  return { parkBrand, spotType };
}
var init_spotClassification = __esm({
  "server/spotClassification.ts"() {
    "use strict";
  }
});

// server/jobs/multiparkBookingSync.ts
var multiparkBookingSync_exports = {};
__export(multiparkBookingSync_exports, {
  enrichBookingsBatch: () => enrichBookingsBatch,
  fetchAgentHistoryByName: () => fetchAgentHistoryByName,
  runFutureCronSync: () => runFutureCronSync,
  runRecentCronSync: () => runRecentCronSync,
  startBookingSyncScheduler: () => startBookingSyncScheduler,
  syncBookingHistory: () => syncBookingHistory,
  syncBookingHistoryBatch: () => syncBookingHistoryBatch,
  syncBookings: () => syncBookings
});
import { eq as eq3 } from "drizzle-orm";
async function getProjectMap() {
  if (projectMapCache && Date.now() - projectMapCacheTime < CACHE_TTL) {
    return projectMapCache;
  }
  const projects2 = await getProjects();
  const map = /* @__PURE__ */ new Map();
  for (const p of projects2) {
    const key = p.name.toLowerCase().trim();
    map.set(key, p.id);
  }
  projectMapCache = map;
  projectMapCacheTime = Date.now();
  return map;
}
async function getAliasResolver() {
  if (aliasResolverCache && Date.now() - aliasResolverCacheTime < CACHE_TTL) {
    return aliasResolverCache;
  }
  const db2 = await getDb();
  const map = /* @__PURE__ */ new Map();
  if (!db2) {
    aliasResolverCache = map;
    aliasResolverCacheTime = Date.now();
    return map;
  }
  const { partnerAliases: partnerAliases2, partnerships: partnerships2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq8 } = await import("drizzle-orm");
  const rows = await db2.select({
    aliasType: partnerAliases2.aliasType,
    aliasValue: partnerAliases2.aliasValue,
    partnerName: partnerships2.name
  }).from(partnerAliases2).leftJoin(partnerships2, eq8(partnerships2.id, partnerAliases2.partnershipId));
  for (const r of rows) {
    if (!r.partnerName) continue;
    const key = `${r.aliasType}:${(r.aliasValue ?? "").trim().toLowerCase()}`;
    map.set(key, r.partnerName);
  }
  aliasResolverCache = map;
  aliasResolverCacheTime = Date.now();
  return map;
}
function resolvePartnerCampaign(booking, pricing, aliases, fallback) {
  const partnerId = booking.partnerId ?? booking.partner?.id ?? null;
  if (partnerId) {
    const hit = aliases.get(`multipark_partner_id:${String(partnerId).trim().toLowerCase()}`);
    if (hit) return hit;
  }
  const pm = typeof pricing?.paymentMethod === "string" ? pricing.paymentMethod : null;
  if (pm) {
    const hit = aliases.get(`payment_method:${pm.trim().toLowerCase()}`);
    if (hit) return hit;
  }
  return fallback;
}
function findProjectId(parkName, city, projectMap) {
  if (!parkName) return void 0;
  const parkLower = parkName.toLowerCase().trim();
  const parkNorm = parkLower.replace(/\s*-\s*/g, " ");
  if (city) {
    const cityRaw = city.toLowerCase().trim();
    const cityNorm = CITY_TO_PT[cityRaw] ?? cityRaw;
    for (const c of /* @__PURE__ */ new Set([cityNorm, cityRaw])) {
      const composite = `${parkNorm} ${c}`;
      if (projectMap.has(composite)) return projectMap.get(composite);
      const composite2 = `${parkLower} ${c}`;
      if (projectMap.has(composite2)) return projectMap.get(composite2);
    }
  }
  if (projectMap.has(parkNorm)) return projectMap.get(parkNorm);
  if (projectMap.has(parkLower)) return projectMap.get(parkLower);
  let bestMatch = null;
  for (const [key, id] of projectMap) {
    if (key.includes(parkNorm) || parkNorm.includes(key)) {
      if (!bestMatch || key.length > bestMatch.key.length) {
        bestMatch = { key, id };
      }
    }
  }
  if (bestMatch) return bestMatch.id;
  if (city) {
    const cityLower = city.toLowerCase().trim();
    for (const [key, id] of projectMap) {
      if (key.includes(parkNorm) && key.includes(cityLower)) return id;
    }
  }
  return void 0;
}
function parseMultiparkDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  let d = null;
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  } else {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  return d ? d.toISOString().slice(0, 19).replace("T", " ") : null;
}
function bookingToRecord(booking, projectMap, aliasResolver) {
  const client = booking.customer || booking.client;
  const pricing = booking.pricing;
  const park = booking.park;
  const parkName = park?.name || booking.parkName;
  const city = park?.city;
  const projectId = findProjectId(parkName, city, projectMap);
  const rawFallback = booking.partnerName || booking.discountCode || booking.campaign || null;
  const isUnknown = typeof rawFallback === "string" && /unknown/i.test(rawFallback);
  const effectiveFallback = isUnknown ? null : rawFallback;
  const resolvedCampaign = resolvePartnerCampaign(booking, pricing, aliasResolver, effectiveFallback);
  return {
    externalId: booking.id,
    bookingNumber: booking.bookingNumber || booking.allocation || null,
    status: booking.status || null,
    checkIn: parseMultiparkDate(booking.checkInDate || booking.checkIn),
    checkOut: parseMultiparkDate(booking.checkOutDate || booking.checkOut),
    checkInTime: booking.checkInTime || null,
    checkOutTime: booking.checkOutTime || null,
    parkingType: booking.parkingType || park?.types?.[0] || null,
    vehicleType: booking.vehicle?.type || booking.vehicleType || null,
    clientFirstName: client?.firstName || null,
    clientLastName: client?.lastName || null,
    clientEmail: client?.email || null,
    clientPhone: client?.phoneNumber || null,
    clientNif: client?.nif || null,
    licensePlate: booking.vehicle?.licensePlate || null,
    vehicleBrand: booking.vehicle?.brand || null,
    vehicleModel: booking.vehicle?.model || null,
    vehicleColor: booking.vehicle?.color || null,
    totalPrice: pricing?.totalPrice?.toString() ?? pricing?.total?.toString() ?? null,
    currency: pricing?.currency || "EUR",
    parkId: park?.id || booking.parkId || null,
    parkName: parkName || null,
    city: city || null,
    projectId: projectId || null,
    deliveryService: booking.deliveryService ? 1 : 0,
    deliveryAddress: booking.deliveryAddress || null,
    pickupAddress: booking.pickupAddress || null,
    campaign: resolvedCampaign,
    parkingPrice: pricing?.parkingPrice?.toString() ?? null,
    deliveryCharges: pricing?.deliveryCharges?.toString() ?? null,
    extrasTotal: pricing?.extraServicesTotal?.toString() ?? null,
    discount: pricing?.discount?.toString() ?? null,
    remainingToPay: pricing?.remainingToPay?.toString() ?? null,
    arrivalFlight: booking.flightInfo?.arrivalFlight || booking.arrivalFlight || null,
    departureFlight: booking.flightInfo?.departureFlight || booking.departureFlight || null,
    cancelledAt: parseMultiparkDate(booking.cancelledAt),
    cancelReason: booking.cancelReason || null,
    notes: booking.notes || null,
    rawJson: JSON.stringify(booking),
    bookingCreatedAt: parseMultiparkDate(booking.createdAt),
    paymentMethod: typeof pricing?.paymentMethod === "string" ? pricing.paymentMethod.slice(0, 128) : null,
    totalPaid: pricing?.totalPaid?.toString() ?? null,
    pro: booking.pro ? 1 : 0,
    partnerId: booking.partnerId ? String(booking.partnerId).slice(0, 128) : null,
    // partnerName no /report vem mascarado ("Unknown User") — filtra-o; o nome
    // real (quando existe) vem do enrichment. partnerId é o que casa com o alias.
    partnerName: (() => {
      const pn = booking.partnerName;
      return typeof pn === "string" && pn && !/unknown/i.test(pn) ? pn.slice(0, 256) : null;
    })(),
    // campaignId/campaignName NÃO existem no /report — só no /bookings/:id.
    // São preenchidos no enrichment (não aqui, senão o sync sobrescrevia-os com null).
    cashValidatedByName: typeof booking.cashValidatedByName === "string" ? booking.cashValidatedByName.slice(0, 256) : null,
    driverValidatedByName: typeof booking.driverValidatedByName === "string" ? booking.driverValidatedByName.slice(0, 256) : null,
    cashierClosedByName: typeof booking.cashierClosedByName === "string" ? booking.cashierClosedByName.slice(0, 256) : null,
    ...classifyAllocation(booking.allocation)
  };
}
function nowMysql() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
}
async function enrichBookingIfNeeded(externalId, apiKey) {
  const db2 = await getDb();
  if (!db2) return false;
  const [current] = await db2.select({ enrichedAt: multiparkBookings.enrichedAt }).from(multiparkBookings).where(eq3(multiparkBookings.externalId, externalId)).limit(1);
  if (current?.enrichedAt) return false;
  try {
    const detailed = await getBooking(externalId, apiKey);
    const b = detailed;
    const update = {
      deliveryType: typeof b.deliveryType === "string" && b.deliveryType ? b.deliveryType : null,
      returnFlight: typeof b.returnFlight === "string" && b.returnFlight ? b.returnFlight : null,
      departingFlight: typeof b.departingFlight === "string" && b.departingFlight ? b.departingFlight : null,
      remarks: typeof b.remarks === "string" && b.remarks ? b.remarks.slice(0, 512) : null,
      enrichedAt: nowMysql()
    };
    if (b.client?.firstName) update.clientFirstName = b.client.firstName;
    if (b.client?.lastName) update.clientLastName = b.client.lastName;
    if (b.client?.email) update.clientEmail = b.client.email;
    if (b.client?.phoneNumber) update.clientPhone = b.client.phoneNumber;
    if (b.vehicle?.licensePlate) update.licensePlate = b.vehicle.licensePlate;
    if (b.vehicle?.brand) update.vehicleBrand = b.vehicle.brand;
    if (b.vehicle?.model) update.vehicleModel = b.vehicle.model;
    if (b.vehicle?.color) update.vehicleColor = b.vehicle.color;
    if (b.vehicle?.vehicleType) update.vehicleType = b.vehicle.vehicleType;
    if (typeof b.origin === "string" && b.origin) update.origin = b.origin.slice(0, 64);
    if (typeof b.originUrl === "string" && b.originUrl) update.originUrl = b.originUrl.slice(0, 512);
    if (typeof b.campaignId === "string" && b.campaignId) update.campaignId = b.campaignId.slice(0, 128);
    if (typeof b.campaignName === "string" && b.campaignName) update.campaignName = b.campaignName.slice(0, 256);
    if (typeof b.partnerId === "string" && b.partnerId) update.partnerId = b.partnerId.slice(0, 128);
    if (typeof b.partnerName === "string" && b.partnerName && !/unknown/i.test(b.partnerName)) update.partnerName = b.partnerName.slice(0, 256);
    await db2.update(multiparkBookings).set(update).where(eq3(multiparkBookings.externalId, externalId));
    return true;
  } catch {
    try {
      await db2.update(multiparkBookings).set({ enrichedAt: nowMysql() }).where(eq3(multiparkBookings.externalId, externalId));
    } catch {
    }
    return false;
  }
}
async function runConcurrent(items, limit, fn, deadlineAt) {
  let idx = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (idx < items.length) {
        if (deadlineAt && Date.now() >= deadlineAt) break;
        const i = idx++;
        try {
          await fn(items[i]);
        } catch {
        }
      }
    })
  );
}
function parseMpDate(s) {
  if (!s || typeof s !== "string") return null;
  if (s.includes("T")) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace("T", " ");
  }
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`;
}
async function syncBookingHistory(externalId, apiKey) {
  const db2 = await getDb();
  if (!db2) return false;
  try {
    const response = await getBookingHistory(externalId, apiKey);
    const items = response?.history ?? [];
    let checkinAgentName = null;
    let checkinAgentUserId = null;
    let checkoutAgentName = null;
    let checkoutAgentUserId = null;
    let currentGarage = null;
    let currentSpot = null;
    let lastKnownMileage = null;
    for (const item of items) {
      const historyId = item.id ?? null;
      if (!historyId) continue;
      const actionTime = parseMpDate(item.actionTime);
      const agentName = item.agentName ?? null;
      const agentUserId = item.userId ?? item.user?.id ?? null;
      const agentEmail = item.user?.email ?? null;
      const modifiedFields = item.modifiedFields ? String(item.modifiedFields) : null;
      const changeType = item.changeType ?? null;
      const platform = item.platform ?? null;
      const remarks = item.remarks ?? null;
      try {
        await db2.insert(multiparkBookingHistory).values({
          bookingExternalId: externalId,
          historyId: String(historyId).slice(0, 128),
          changeType: changeType ? String(changeType).slice(0, 32) : null,
          actionTime,
          remarks,
          agentName: agentName ? String(agentName).slice(0, 256) : null,
          agentUserId: agentUserId ? String(agentUserId).slice(0, 128) : null,
          agentEmail,
          modifiedFields,
          platform: platform ? String(platform).slice(0, 32) : null
        });
      } catch (err) {
        if (!String(err.message).includes("Duplicate")) throw err;
      }
      if (changeType === "CHECK_IN") {
        if (agentName) checkinAgentName = agentName;
        if (agentUserId) checkinAgentUserId = agentUserId;
      } else if (changeType === "CHECK_OUT") {
        if (agentName) checkoutAgentName = agentName;
        if (agentUserId) checkoutAgentUserId = agentUserId;
      }
      if (modifiedFields) {
        try {
          const mf = JSON.parse(modifiedFields);
          if (mf.garagem) currentGarage = String(mf.garagem).slice(0, 64);
          if (mf.lugar) currentSpot = String(mf.lugar).slice(0, 64);
          if (mf.km !== void 0) {
            const km = parseInt(String(mf.km), 10);
            if (Number.isFinite(km)) lastKnownMileage = km;
          }
        } catch {
        }
      }
    }
    const update = { historyFetchedAt: nowMysql() };
    if (checkinAgentName) update.checkinAgentName = checkinAgentName;
    if (checkinAgentUserId) update.checkinAgentUserId = checkinAgentUserId;
    if (checkoutAgentName) update.checkoutAgentName = checkoutAgentName;
    if (checkoutAgentUserId) update.checkoutAgentUserId = checkoutAgentUserId;
    if (currentGarage) update.currentGarage = currentGarage;
    if (currentSpot) update.currentSpot = currentSpot;
    if (lastKnownMileage !== null) update.lastKnownMileage = lastKnownMileage;
    await db2.update(multiparkBookings).set(update).where(eq3(multiparkBookings.externalId, externalId));
    return true;
  } catch {
    try {
      await db2.update(multiparkBookings).set({ historyFetchedAt: nowMysql() }).where(eq3(multiparkBookings.externalId, externalId));
    } catch {
    }
    return false;
  }
}
async function enrichBookingsBatch(arg = 100) {
  const db2 = await getDb();
  if (!db2) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };
  const opts = typeof arg === "number" ? { limit: arg } : arg;
  const limit = opts.limit ?? 100;
  const targetIds = opts.externalIds;
  const deadlineAt = opts.deadlineAt;
  if (targetIds && targetIds.length === 0) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };
  const { isNull: isNull3, and: and7, inArray: inArray2 } = await import("drizzle-orm");
  const whereCond = targetIds && targetIds.length ? and7(isNull3(multiparkBookings.enrichedAt), inArray2(multiparkBookings.externalId, targetIds)) : isNull3(multiparkBookings.enrichedAt);
  const pending = await db2.select({
    externalId: multiparkBookings.externalId,
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city
  }).from(multiparkBookings).where(whereCond).limit(limit);
  if (pending.length === 0) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };
  const parks = getConfiguredParks();
  const CITY_NORMALIZE = {
    lisbon: "lisboa",
    lisboa: "lisboa",
    oporto: "porto",
    porto: "porto",
    faro: "faro"
  };
  const keyCache = /* @__PURE__ */ new Map();
  function pickApiKey(parkName, city) {
    if (!parkName) return null;
    const cacheKey = `${parkName.toLowerCase()}|${(city ?? "").toLowerCase()}`;
    if (keyCache.has(cacheKey)) return keyCache.get(cacheKey) ?? null;
    const pl = parkName.toLowerCase();
    const cityNorm = city ? CITY_NORMALIZE[city.toLowerCase()] ?? city.toLowerCase() : "";
    let match = parks.find(
      (p) => pl.includes(p.name.toLowerCase()) && pl.includes(p.city.toLowerCase())
    );
    if (!match && cityNorm) {
      match = parks.find(
        (p) => pl.includes(p.name.toLowerCase()) && p.city.toLowerCase() === cityNorm
      );
    }
    const key = match ? getParkApiKey(match) ?? null : null;
    keyCache.set(cacheKey, key);
    return key;
  }
  let enriched = 0;
  let errs = 0;
  let noKey = 0;
  await runConcurrent(pending, ENRICH_CONCURRENCY, async (p) => {
    const apiKey = pickApiKey(p.parkName, p.city);
    if (!apiKey) {
      noKey++;
      const db3 = await getDb();
      if (db3) {
        try {
          await db3.update(multiparkBookings).set({ enrichedAt: nowMysql() }).where(eq3(multiparkBookings.externalId, p.externalId));
        } catch {
        }
      }
      return;
    }
    const ok = await enrichBookingIfNeeded(p.externalId, apiKey);
    if (ok) enriched++;
    else errs++;
  }, deadlineAt);
  return { scanned: pending.length, enriched, errors: errs, noKey };
}
async function fetchAgentHistoryByName(agentName, date) {
  const db2 = await getDb();
  const parks = getConfiguredParks();
  const byType = {};
  let totalEntries = 0;
  const perPark = [];
  await runConcurrent(parks, ENRICH_CONCURRENCY, async (park) => {
    const apiKey = getParkApiKey(park);
    if (!apiKey) return;
    try {
      const response = await getAgentHistory({
        agentName,
        startDate: date,
        endDate: date,
        apiKey
      });
      const items = response?.history ?? [];
      perPark.push({ park: `${park.name} ${park.city}`, entries: items.length });
      totalEntries += items.length;
      if (!db2 || items.length === 0) return;
      for (const item of items) {
        const historyId = item.id ?? null;
        const bookingExternalId = item.booking?.id ?? null;
        if (!historyId || !bookingExternalId) continue;
        const changeType = item.changeType ?? null;
        if (changeType) byType[changeType] = (byType[changeType] ?? 0) + 1;
        try {
          await db2.insert(multiparkBookingHistory).values({
            bookingExternalId: String(bookingExternalId).slice(0, 128),
            historyId: String(historyId).slice(0, 128),
            changeType: changeType ? String(changeType).slice(0, 32) : null,
            actionTime: parseMpDate(item.actionTime),
            remarks: item.remarks ?? null,
            agentName: item.agentName ?? agentName,
            agentUserId: item.userId ?? item.user?.id ?? null,
            agentEmail: item.user?.email ?? null,
            modifiedFields: item.modifiedFields ? String(item.modifiedFields) : null,
            platform: item.platform ?? null
          });
        } catch (err) {
          if (!String(err.message).includes("Duplicate")) throw err;
        }
      }
    } catch {
      perPark.push({ park: `${park.name} ${park.city}`, entries: 0 });
    }
  });
  return { parks: parks.length, totalEntries, byType, perPark };
}
async function syncBookingHistoryBatch(limit = 50, deadlineAt) {
  const db2 = await getDb();
  if (!db2) return { scanned: 0, fetched: 0, errors: 0, noKey: 0 };
  const { isNull: isNull3, and: andOp, gte: gte5 } = await import("drizzle-orm");
  const now = /* @__PURE__ */ new Date();
  const cutPast = new Date(now);
  cutPast.setDate(cutPast.getDate() - 7);
  const cutFuture = new Date(now);
  cutFuture.setDate(cutFuture.getDate() + 30);
  const fmt3 = (d) => d.toISOString().slice(0, 19).replace("T", " ");
  const pending = await db2.select({
    externalId: multiparkBookings.externalId,
    parkName: multiparkBookings.parkName,
    city: multiparkBookings.city
  }).from(multiparkBookings).where(
    andOp(
      isNull3(multiparkBookings.historyFetchedAt),
      gte5(multiparkBookings.checkIn, fmt3(cutPast))
    )
  ).limit(limit);
  if (pending.length === 0) return { scanned: 0, fetched: 0, errors: 0, noKey: 0 };
  const parks = getConfiguredParks();
  const CITY_NORMALIZE = {
    lisbon: "lisboa",
    lisboa: "lisboa",
    porto: "porto",
    oporto: "porto",
    faro: "faro"
  };
  const keyCache = /* @__PURE__ */ new Map();
  function pickApiKey(parkName, city) {
    if (!parkName) return null;
    const cacheKey = `${parkName.toLowerCase()}|${(city ?? "").toLowerCase()}`;
    if (keyCache.has(cacheKey)) return keyCache.get(cacheKey) ?? null;
    const pl = parkName.toLowerCase();
    const cityNorm = city ? CITY_NORMALIZE[city.toLowerCase()] ?? city.toLowerCase() : "";
    let match = parks.find(
      (p) => pl.includes(p.name.toLowerCase()) && pl.includes(p.city.toLowerCase())
    );
    if (!match && cityNorm) {
      match = parks.find(
        (p) => pl.includes(p.name.toLowerCase()) && p.city.toLowerCase() === cityNorm
      );
    }
    const key = match ? getParkApiKey(match) ?? null : null;
    keyCache.set(cacheKey, key);
    return key;
  }
  let fetched = 0;
  let errs = 0;
  let noKey = 0;
  await runConcurrent(pending, ENRICH_CONCURRENCY, async (p) => {
    const apiKey = pickApiKey(p.parkName, p.city);
    if (!apiKey) {
      noKey++;
      try {
        await db2.update(multiparkBookings).set({ historyFetchedAt: nowMysql() }).where(eq3(multiparkBookings.externalId, p.externalId));
      } catch {
      }
      return;
    }
    const ok = await syncBookingHistory(p.externalId, apiKey);
    if (ok) fetched++;
    else errs++;
  }, deadlineAt);
  return { scanned: pending.length, fetched, errors: errs, noKey };
}
async function syncBookings(opts) {
  const actionTypes = opts.actionTypes || ["creation", "checkin", "checkout", "cancelation"];
  const projectMap = await getProjectMap();
  const aliasResolver = await getAliasResolver();
  const errors = [];
  const parks = getConfiguredParks();
  const parksToSync = parks.length > 0 ? parks : [null];
  const jobs = [];
  for (const park of parksToSync) {
    for (const actionType of actionTypes) {
      jobs.push({ park, actionType });
    }
  }
  const perParkResults = await Promise.allSettled(jobs.map(async ({ park, actionType }) => {
    const apiKey = park ? getParkApiKey(park) : void 0;
    const parkLabel = park ? `${park.name} ${park.city}` : "global";
    let processed = 0, created = 0, updated = 0;
    const parkErrors = [];
    const enrichIds = [];
    try {
      const report = await getBookingsReport(opts.startDate, opts.endDate, actionType, apiKey);
      if (report?.bookings?.length) {
        for (const booking of report.bookings) {
          try {
            const record = bookingToRecord(booking, projectMap, aliasResolver);
            const result = await upsertMultiparkBooking(record);
            await upsertBookingExtras(booking.id, booking.extraServices);
            processed++;
            if (result?.action === "created") created++;
            else updated++;
            if (result?.action === "created" || result?.statusChanged) {
              enrichIds.push(booking.id);
            }
          } catch (err) {
            parkErrors.push(`Booking ${booking.id}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      parkErrors.push(`${parkLabel}/${actionType}: ${err.message}`);
    }
    return { processed, created, updated, errors: parkErrors, enrichIds };
  }));
  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  const enrichTargets = /* @__PURE__ */ new Set();
  for (const r of perParkResults) {
    if (r.status === "fulfilled") {
      totalProcessed += r.value.processed;
      totalCreated += r.value.created;
      totalUpdated += r.value.updated;
      errors.push(...r.value.errors);
      for (const id of r.value.enrichIds) enrichTargets.add(id);
    } else {
      errors.push(`Park task failed: ${r.reason?.message ?? r.reason}`);
    }
  }
  await createSyncLog({
    syncType: "api_sync",
    status: errors.length === 0 ? "success" : "partial",
    recordsProcessed: totalProcessed,
    recordsCreated: totalCreated,
    recordsUpdated: totalUpdated - totalCreated,
    errorMessage: errors.length > 0 ? errors.join("; ") : void 0,
    triggeredById: opts.triggeredById ?? void 0
  });
  return {
    success: errors.length === 0,
    processed: totalProcessed,
    created: totalCreated,
    updated: totalUpdated - totalCreated,
    errors,
    enrichTargets: Array.from(enrichTargets)
  };
}
function startBookingSyncScheduler() {
  async function runSync() {
    if (!isMultiparkConfigured()) {
      console.log("[BookingSync] Skipped \u2014 MULTIPARK_API_KEY not configured");
      return;
    }
    try {
      const today = /* @__PURE__ */ new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const thirtyDaysAhead = new Date(today);
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
      const pastStart = twoDaysAgo.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];
      const futureEnd = thirtyDaysAhead.toISOString().split("T")[0];
      console.log(`[BookingSync] Past window ${pastStart} \u2192 ${todayStr}`);
      const past = await syncBookings({ startDate: pastStart, endDate: todayStr });
      console.log(
        `[BookingSync] Past done: ${past.processed} processed, ${past.created} new, ${past.updated} updated` + (past.errors.length > 0 ? `, ${past.errors.length} errors` : "")
      );
      console.log(`[BookingSync] Future window ${todayStr} \u2192 ${futureEnd}`);
      const future = await syncBookings({
        startDate: todayStr,
        endDate: futureEnd,
        actionTypes: ["checkin", "checkout"]
      });
      console.log(
        `[BookingSync] Future done: ${future.processed} processed, ${future.created} new, ${future.updated} updated` + (future.errors.length > 0 ? `, ${future.errors.length} errors` : "")
      );
    } catch (error) {
      console.error("[BookingSync] Scheduler error:", error);
    }
  }
  setTimeout(runSync, 1e4);
  setInterval(runSync, SYNC_INTERVAL);
  console.log("[BookingSync] Scheduler started \u2014 runs every 15 minutes");
}
async function runRecentCronSync(windowMinutes = 30) {
  const t0 = Date.now();
  const deadlineAt = t0 + CRON_BUDGET_MS;
  const now = /* @__PURE__ */ new Date();
  let since = new Date(now.getTime() - windowMinutes * 6e4);
  try {
    const last = await getLastSyncSuccessAt("api_sync");
    if (last) {
      const lastDate = /* @__PURE__ */ new Date(String(last).replace(" ", "T") + "Z");
      if (!Number.isNaN(lastDate.getTime())) {
        const candidate = new Date(lastDate.getTime() - 60 * 6e4);
        if (candidate < since) since = candidate;
      }
    }
  } catch {
  }
  const clampStart = new Date(now.getTime() - 3 * 864e5);
  if (since < clampStart) since = clampStart;
  const fmt3 = (d) => d.toISOString().slice(0, 10);
  const report = await syncBookings({
    startDate: fmt3(since),
    endDate: fmt3(now)
  });
  const targeted = Date.now() < deadlineAt - 5e3 ? await enrichBookingsBatch({
    externalIds: report.enrichTargets,
    // Cap num burst; o resto fica enrichedAt NULL e é apanhado pelo
    // backlog nos ciclos seguintes.
    limit: Math.min(Math.max(report.enrichTargets.length, 1), 120),
    deadlineAt
  }) : { scanned: 0, enriched: 0, errors: 0, noKey: 0 };
  let backlogEnriched = 0;
  let historyFetched = 0;
  if (Date.now() < deadlineAt - 5e3) {
    const [backlogResult, historyResult] = await Promise.allSettled([
      enrichBookingsBatch({ limit: 20, deadlineAt }),
      syncBookingHistoryBatch(30, deadlineAt)
    ]);
    backlogEnriched = backlogResult.status === "fulfilled" ? backlogResult.value.enriched : 0;
    historyFetched = historyResult.status === "fulfilled" ? historyResult.value.fetched : 0;
  }
  return {
    report,
    enriched: targeted.enriched + backlogEnriched,
    historyFetched,
    durationMs: Date.now() - t0,
    windowStart: fmt3(since),
    partial: Date.now() >= deadlineAt - 5e3
  };
}
async function runFutureCronSync(weeksAhead = 4) {
  const t0 = Date.now();
  const now = /* @__PURE__ */ new Date();
  const end = new Date(now.getTime() + weeksAhead * 7 * 864e5);
  const fmt3 = (d) => d.toISOString().slice(0, 10);
  const report = await syncBookings({
    startDate: fmt3(now),
    endDate: fmt3(end),
    actionTypes: ["checkin", "checkout"]
  });
  return { report, durationMs: Date.now() - t0 };
}
var projectMapCache, projectMapCacheTime, CACHE_TTL, aliasResolverCache, aliasResolverCacheTime, CITY_TO_PT, ENRICH_CONCURRENCY, SYNC_INTERVAL, CRON_BUDGET_MS;
var init_multiparkBookingSync = __esm({
  "server/jobs/multiparkBookingSync.ts"() {
    "use strict";
    init_multipark();
    init_db();
    init_schema();
    init_spotClassification();
    projectMapCache = null;
    projectMapCacheTime = 0;
    CACHE_TTL = 5 * 60 * 1e3;
    aliasResolverCache = null;
    aliasResolverCacheTime = 0;
    CITY_TO_PT = {
      lisbon: "lisboa",
      lisboa: "lisboa",
      oporto: "porto",
      porto: "porto",
      faro: "faro"
    };
    ENRICH_CONCURRENCY = 5;
    SYNC_INTERVAL = 15 * 60 * 1e3;
    CRON_BUDGET_MS = Number(process.env.CRON_BUDGET_MS || 5e4);
  }
});

// server/zello.ts
import crypto3 from "crypto";
async function getToken() {
  const res = await fetch(`${BASE_URL}/user/gettoken`);
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Zello gettoken failed: ${data.status}`);
  return { token: data.token, sid: data.sid };
}
async function authenticate() {
  if (currentSid && Date.now() < sidExpiresAt) return currentSid;
  const apiKey = ENV.zelloApiKey;
  if (!apiKey) throw new Error("ZELLO_API_KEY not configured");
  if (!USERNAME) throw new Error("ZELLO_USERNAME not configured");
  if (!PASSWORD) throw new Error("ZELLO_PASSWORD not configured");
  const { token, sid } = await getToken();
  const md5pass = crypto3.createHash("md5").update(PASSWORD).digest("hex");
  const combined = md5pass + token + apiKey;
  const authHash = crypto3.createHash("md5").update(combined).digest("hex");
  const params = new URLSearchParams({ username: USERNAME, password: authHash });
  const res = await fetch(`${BASE_URL}/user/login?sid=${sid}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const data = await res.json();
  if (data.status !== "OK") throw new Error(`Zello login failed: ${data.status}`);
  currentSid = sid;
  sidExpiresAt = Date.now() + 8 * 60 * 1e3;
  return sid;
}
async function zelloGet(path2, params) {
  const sid = await authenticate();
  const url = new URL(`${BASE_URL}/${path2}`);
  url.searchParams.set("sid", sid);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.code === "301") {
    currentSid = null;
    sidExpiresAt = 0;
    const newSid = await authenticate();
    url.searchParams.set("sid", newSid);
    const retryRes = await fetch(url.toString());
    return retryRes.json();
  }
  return data;
}
function isZelloConfigured() {
  return !!(ENV.zelloApiKey && USERNAME && PASSWORD);
}
async function getZelloUsers() {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("user/get");
  if (data.status !== "OK") throw new Error(`Zello user/get failed: ${data.status}`);
  return (data.users || []).map((u) => ({
    name: u.name,
    email: u.email || "",
    phone: u.phone || u.profile_phone || "",
    fullName: u.full_name || u.name,
    job: u.job || "",
    admin: !!u.admin,
    channels: u.channels || [],
    geotrackingOff: !!u.geotracking_off
  }));
}
async function getZelloChannels() {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("channel/get");
  if (data.status !== "OK") throw new Error(`Zello channel/get failed: ${data.status}`);
  return (data.channels || []).map((c) => ({
    name: c.name,
    count: parseInt(c.count, 10) || 0,
    isShared: !!c.is_shared,
    isDispatch: !!c.is_dispatch
  }));
}
async function getZelloLocations() {
  if (!isZelloConfigured()) return [];
  const data = await zelloGet("location/get", { filter: "none", max: "100" });
  if (data.status !== "OK") throw new Error(`Zello location/get failed: ${data.status}`);
  return (data.locations || []).map((l) => ({
    username: l.username || l.name || "",
    displayName: l.display_name || l.username || "",
    latitude: parseFloat(l.latitude) || 0,
    longitude: parseFloat(l.longitude) || 0,
    speed: (parseFloat(l.speed) || 0) * 3.6,
    // m/s to km/h
    heading: parseFloat(l.heading) || 0,
    altitude: parseFloat(l.altitude) || 0,
    batteryLevel: parseInt(l.battery_level, 10) || 0,
    chargingStatus: parseInt(l.charging_status, 10) || 0,
    signalStrength: parseInt(l.signal_strength, 10) || 0,
    accuracy: parseFloat(l.accuracy) || 0,
    status: l.status || "unknown",
    lastReport: parseInt(l.last_report, 10) || 0,
    lastReportDelay: parseInt(l.last_report_delay, 10) || 0
  }));
}
async function getZelloUserHistory(username, startTs, endTs) {
  if (!isZelloConfigured()) return { locations: [] };
  const data = await zelloGet(`location/getuser/${encodeURIComponent(username)}/history`, {
    start_ts: String(startTs),
    end_ts: String(endTs),
    format: "geojson",
    speedUnits: "kmh"
  });
  return data;
}
async function getZelloUserLocation(username) {
  if (!isZelloConfigured()) return { locations: [] };
  const data = await zelloGet(`location/getuser/${encodeURIComponent(username)}`);
  return data;
}
var NETWORK, BASE_URL, USERNAME, PASSWORD, currentSid, sidExpiresAt;
var init_zello = __esm({
  "server/zello.ts"() {
    "use strict";
    init_env();
    NETWORK = process.env.ZELLO_NETWORK ?? "airpark";
    BASE_URL = `https://${NETWORK}.zellowork.com`;
    USERNAME = process.env.ZELLO_USERNAME ?? "";
    PASSWORD = process.env.ZELLO_PASSWORD ?? "";
    currentSid = null;
    sidExpiresAt = 0;
  }
});

// server/jobs/dailyDriverCollection.ts
var dailyDriverCollection_exports = {};
__export(dailyDriverCollection_exports, {
  collectDailyDriverData: () => collectDailyDriverData,
  startDailyCollectionScheduler: () => startDailyCollectionScheduler
});
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function processGeoJsonHistory(data) {
  const defaultResult = {
    totalKm: 0,
    hoursWorked: 0,
    hoursStopped: 0,
    totalHoursOnline: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    avgBattery: 0,
    minBattery: 100,
    gpsPointsCount: 0,
    geojson: null
  };
  if (!data || !data.features || !Array.isArray(data.features)) {
    return defaultResult;
  }
  let totalKm = 0;
  let maxSpeed = 0;
  let speedSum = 0;
  let speedCount = 0;
  let batterySum = 0;
  let batteryCount = 0;
  let minBattery = 100;
  let gpsPointsCount = 0;
  let firstTimestamp = null;
  let lastTimestamp = null;
  let movingSeconds = 0;
  let stoppedSeconds = 0;
  const STOPPED_SPEED_THRESHOLD = 2;
  for (const feature of data.features) {
    if (!feature.geometry) continue;
    if (feature.geometry.type === "Point") {
      gpsPointsCount++;
      const props = feature.properties || {};
      const rawSpeed = parseFloat(props.speed) || 0;
      const speed = rawSpeed * 3.6;
      const battery = parseInt(props.battery_level || props.batteryLevel) || 0;
      const ts = parseInt(props.timestamp || props.time || props.lastReport) || 0;
      if (speed > 0 && speed <= 150) {
        speedSum += speed;
        speedCount++;
      }
      if (speed > maxSpeed && speed <= 150) maxSpeed = speed;
      if (battery > 0) {
        batterySum += battery;
        batteryCount++;
        if (battery < minBattery) minBattery = battery;
      }
      if (ts > 0) {
        if (!firstTimestamp || ts < firstTimestamp) firstTimestamp = ts;
        if (!lastTimestamp || ts > lastTimestamp) lastTimestamp = ts;
      }
    }
    if (feature.geometry.type === "LineString" && feature.geometry.coordinates) {
      const coords = feature.geometry.coordinates;
      for (let i = 1; i < coords.length; i++) {
        const [lon1, lat1] = coords[i - 1];
        const [lon2, lat2] = coords[i];
        const segmentKm = haversineKm(lat1, lon1, lat2, lon2);
        if (segmentKm < 50) {
          totalKm += segmentKm;
        }
        gpsPointsCount++;
      }
    }
  }
  const timestamps = [];
  for (const feature of data.features) {
    const props = feature.properties || {};
    const ts = parseInt(props.timestamp || props.time || props.lastReport) || 0;
    const rawSpd = parseFloat(props.speed) || 0;
    const speed = rawSpd * 3.6;
    if (ts > 0) {
      timestamps.push({ ts, speed });
    }
  }
  timestamps.sort((a, b) => a.ts - b.ts);
  for (let i = 1; i < timestamps.length; i++) {
    const dt = timestamps[i].ts - timestamps[i - 1].ts;
    if (dt > 0 && dt < 3600) {
      if (timestamps[i - 1].speed > STOPPED_SPEED_THRESHOLD) {
        movingSeconds += dt;
      } else {
        stoppedSeconds += dt;
      }
    }
  }
  const totalOnlineSeconds = firstTimestamp && lastTimestamp ? lastTimestamp - firstTimestamp : 0;
  return {
    totalKm: Math.round(totalKm * 100) / 100,
    hoursWorked: Math.round(movingSeconds / 3600 * 100) / 100,
    hoursStopped: Math.round(stoppedSeconds / 3600 * 100) / 100,
    totalHoursOnline: Math.round(totalOnlineSeconds / 3600 * 100) / 100,
    avgSpeed: speedCount > 0 ? Math.round(speedSum / speedCount * 100) / 100 : 0,
    maxSpeed: Math.round(maxSpeed * 100) / 100,
    avgBattery: batteryCount > 0 ? Math.round(batterySum / batteryCount) : 0,
    minBattery: batteryCount > 0 ? minBattery : 0,
    gpsPointsCount,
    geojson: data
  };
}
async function collectDailyDriverData(targetDate) {
  const errors = [];
  let driversProcessed = 0;
  try {
    const dateStr = targetDate.toISOString().split("T")[0];
    const existing = await getDailyDriverHistoryByDate(dateStr);
    if (existing.length > 0) {
      console.log(`[DailyCollection] Data already exists for ${dateStr} (${existing.length} records). Skipping.`);
      return { success: true, driversProcessed: existing.length, errors: [] };
    }
    const users2 = await getZelloUsers();
    const nonAdminUsers = users2.filter((u) => !u.admin);
    const startOfDay2 = new Date(targetDate);
    startOfDay2.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const startTs = Math.floor(startOfDay2.getTime() / 1e3);
    const endTs = Math.floor(endOfDay.getTime() / 1e3);
    const speedLimit = await getDefaultSpeedLimit();
    const threshold = speedLimit ? speedLimit.maxSpeed * (1 + speedLimit.tolerancePercent / 100) : 999;
    console.log(`[DailyCollection] Processing ${nonAdminUsers.length} users for ${dateStr}`);
    for (const user of nonAdminUsers) {
      try {
        const historyData = await getZelloUserHistory(user.name, startTs, endTs);
        const metrics = processGeoJsonHistory(historyData);
        let violations = 0;
        if (historyData?.features) {
          for (const feature of historyData.features) {
            const rawSpd = parseFloat(feature.properties?.speed) || 0;
            const speedKmh = rawSpd * 3.6;
            if (speedKmh > threshold && speedKmh <= 150) violations++;
          }
        }
        let geoJsonUrl = null;
        if (metrics.gpsPointsCount > 0 && metrics.geojson) {
          try {
            const key = `driver-history/${dateStr}/${user.name}.geojson`;
            const result = await storagePut(
              key,
              JSON.stringify(metrics.geojson),
              "application/geo+json"
            );
            geoJsonUrl = result.url;
          } catch (e) {
            console.warn(`[DailyCollection] Failed to upload GeoJSON for ${user.name}:`, e);
          }
        }
        await createDailyDriverHistory({
          zelloUsername: user.name,
          displayName: user.fullName || user.name,
          date: targetDate.toISOString().slice(0, 19).replace("T", " "),
          totalKm: String(metrics.totalKm),
          hoursWorked: String(metrics.hoursWorked),
          hoursStopped: String(metrics.hoursStopped),
          totalHoursOnline: String(metrics.totalHoursOnline),
          avgSpeed: String(metrics.avgSpeed),
          maxSpeed: String(metrics.maxSpeed),
          speedViolations: violations,
          avgBattery: metrics.avgBattery,
          minBattery: metrics.minBattery,
          gpsPointsCount: metrics.gpsPointsCount,
          geoJsonUrl
        });
        driversProcessed++;
        if (user.geotrackingOff) {
          await createGpsAlert({
            zelloUsername: user.name,
            displayName: user.fullName || user.name,
            alertType: "gps_off",
            message: `${user.fullName || user.name} tinha o GPS desligado em ${dateStr}`,
            notificationSent: 1,
            occurredAt: targetDate.toISOString().slice(0, 19).replace("T", " ")
          });
        }
      } catch (userError) {
        errors.push(`${user.name}: ${userError.message}`);
        console.error(`[DailyCollection] Error processing ${user.name}:`, userError);
      }
    }
    console.log(`[DailyCollection] Completed: ${driversProcessed}/${nonAdminUsers.length} users processed for ${dateStr}`);
    if (driversProcessed > 0) {
      await notifyOwner({
        title: "Relat\xF3rio Di\xE1rio de Motoristas",
        content: `Recolha autom\xE1tica para ${dateStr}: ${driversProcessed} motoristas processados${errors.length > 0 ? `, ${errors.length} erros` : ""}`
      });
    }
    return { success: true, driversProcessed, errors };
  } catch (error) {
    console.error("[DailyCollection] Fatal error:", error);
    errors.push(`Fatal: ${error.message}`);
    return { success: false, driversProcessed, errors };
  }
}
function startDailyCollectionScheduler() {
  function msUntilNext2AM() {
    const now = /* @__PURE__ */ new Date();
    const lisbonNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
    const target = new Date(lisbonNow);
    target.setHours(2, 0, 0, 0);
    if (target <= lisbonNow) {
      target.setDate(target.getDate() + 1);
    }
    const diff = target.getTime() - lisbonNow.getTime();
    return diff;
  }
  function scheduleNext() {
    const delay = msUntilNext2AM();
    const nextRun = new Date(Date.now() + delay);
    console.log(`[DailyCollection] Next run scheduled for ${nextRun.toISOString()} (in ${Math.round(delay / 6e4)} minutes)`);
    setTimeout(async () => {
      try {
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        console.log(`[DailyCollection] Starting collection for ${yesterday.toISOString().split("T")[0]}`);
        const result = await collectDailyDriverData(yesterday);
        console.log(`[DailyCollection] Result:`, result);
      } catch (error) {
        console.error("[DailyCollection] Scheduler error:", error);
      }
      scheduleNext();
    }, delay);
  }
  scheduleNext();
  console.log("[DailyCollection] Scheduler started \u2014 runs daily at 2:00 AM Lisbon time");
}
var init_dailyDriverCollection = __esm({
  "server/jobs/dailyDriverCollection.ts"() {
    "use strict";
    init_zello();
    init_db();
    init_storage();
    init_notification();
  }
});

// server/migrations/migration_0044.ts
var migration_0044_exports = {};
__export(migration_0044_exports, {
  IDEMPOTENT_ERROR_CODES: () => IDEMPOTENT_ERROR_CODES,
  MIGRATION_0044_NAME: () => MIGRATION_0044_NAME,
  MIGRATION_0044_STATEMENTS: () => MIGRATION_0044_STATEMENTS
});
var MIGRATION_0044_NAME, MIGRATION_0044_STATEMENTS, IDEMPOTENT_ERROR_CODES;
var init_migration_0044 = __esm({
  "server/migrations/migration_0044.ts"() {
    "use strict";
    MIGRATION_0044_NAME = "0044_rh_revamp";
    MIGRATION_0044_STATEMENTS = [
      // ── 1. Férias / baixas ────────────────────────────────────────────────────
      `CREATE TABLE IF NOT EXISTS \`employee_leaves\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`leaveType\` ENUM('vacation','sick','unpaid','other') NOT NULL DEFAULT 'vacation',
    \`fromDate\` VARCHAR(10) NOT NULL,
    \`toDate\` VARCHAR(10) NOT NULL,
    \`notes\` VARCHAR(255) NULL,
    \`createdById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_employee_leaves_emp\` (\`employeeId\`),
    INDEX \`idx_employee_leaves_dates\` (\`fromDate\`, \`toDate\`)
  )`,
      // ── 2. Histórico salários ─────────────────────────────────────────────────
      `CREATE TABLE IF NOT EXISTS \`employee_salary_history\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`monthlySalary\` DECIMAL(10, 2) NULL,
    \`mealAllowancePerDay\` DECIMAL(6, 2) NULL,
    \`effectiveFrom\` VARCHAR(10) NOT NULL,
    \`effectiveUntil\` VARCHAR(10) NULL,
    \`changedById\` INT NULL,
    \`notes\` VARCHAR(255) NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_salary_history_emp\` (\`employeeId\`),
    INDEX \`idx_salary_history_from\` (\`effectiveFrom\`)
  )`,
      // Snapshot inicial: copia o salário actual de cada colaborador.
      // INSERT IGNORE evita falhar se a migration correr 2× (não duplica).
      `INSERT INTO \`employee_salary_history\` (\`employeeId\`, \`monthlySalary\`, \`mealAllowancePerDay\`, \`effectiveFrom\`, \`notes\`)
   SELECT e.\`id\`, e.\`monthlySalary\`, e.\`mealAllowancePerDay\`,
          COALESCE(DATE_FORMAT(e.\`contractStart\`, '%Y-%m-%d'), '2024-01-01'),
          'Snapshot inicial (migra\xE7\xE3o 0044)'
   FROM \`employees\` e
   LEFT JOIN \`employee_salary_history\` h ON h.\`employeeId\` = e.\`id\`
   WHERE e.\`isActive\` = 1
     AND (e.\`monthlySalary\` IS NOT NULL OR e.\`mealAllowancePerDay\` IS NOT NULL)
     AND h.\`id\` IS NULL`,
      // ── 3. Penalizações ──────────────────────────────────────────────────────
      `CREATE TABLE IF NOT EXISTS \`employee_penalties\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`reason\` ENUM('no_show_extra_dia','speeding','lost_found_investigation','complaint_investigation','other') NOT NULL,
    \`severity\` ENUM('warning','penalty','serious') NOT NULL DEFAULT 'penalty',
    \`points\` INT NOT NULL DEFAULT 1,
    \`relatedId\` INT NULL,
    \`notes\` VARCHAR(512) NULL,
    \`clearedAt\` TIMESTAMP NULL,
    \`clearedById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_employee_penalties_emp\` (\`employeeId\`),
    INDEX \`idx_employee_penalties_open\` (\`employeeId\`, \`clearedAt\`)
  )`,
      // ── 4. extra_rates: adicionar levelName se não existir ───────────────────
      // MySQL antigo não tem IF NOT EXISTS em ADD COLUMN. Verificamos via
      // information_schema antes (statement separado mais à frente, na app).
      // Para tornar idempotente, fazemos um UPDATE seguro depois.
      // 1ª tentativa: ADD COLUMN. Se já existir, o runner ignora o erro.
      `ALTER TABLE \`extra_rates\` ADD COLUMN \`levelName\` VARCHAR(32) NULL`,
      // Limpa e regrava os 4 níveis canónicos
      `DELETE FROM \`extra_rates\``,
      `INSERT INTO \`extra_rates\` (\`level\`, \`levelName\`, \`hourlyRate\`, \`label\`) VALUES
    (1, 'junior',   4.50, 'Extra Junior'),
    (2, 'senior',   5.00, 'Extra Senior'),
    (3, 'terminal', 5.50, 'Extra Terminal'),
    (4, 'master',   6.00, 'Extra Master')`,
      // CREATE INDEX falha se já existe — wrapped em try/catch no runner
      `CREATE INDEX \`idx_extra_rates_levelname\` ON \`extra_rates\` (\`levelName\`)`,
      // Migra extras de nível 5 para 1 (junior)
      `UPDATE \`employees\` SET \`extraLevel\` = 1 WHERE \`extraLevel\` = 5`,
      // ── 5. employees: flags de bloqueio por docs ─────────────────────────────
      `ALTER TABLE \`employees\` ADD COLUMN \`docsWarningAt\` TIMESTAMP NULL`,
      `ALTER TABLE \`employees\` ADD COLUMN \`loginBlocked\` TINYINT NOT NULL DEFAULT 0`,
      `ALTER TABLE \`employees\` ADD COLUMN \`loginBlockedReason\` VARCHAR(255) NULL`
    ];
    IDEMPOTENT_ERROR_CODES = /* @__PURE__ */ new Set([
      "ER_DUP_FIELDNAME",
      // ADD COLUMN onde já existe
      "ER_DUP_KEYNAME",
      // CREATE INDEX onde já existe
      "ER_TABLE_EXISTS_ERROR",
      // CREATE TABLE (mesmo com IF NOT EXISTS é seguro)
      "ER_DUP_ENTRY"
      // INSERT duplicado
    ]);
  }
});

// server/migrations/migration_0046.ts
var migration_0046_exports = {};
__export(migration_0046_exports, {
  IDEMPOTENT_ERROR_CODES_0046: () => IDEMPOTENT_ERROR_CODES_0046,
  MIGRATION_0046_NAME: () => MIGRATION_0046_NAME,
  MIGRATION_0046_STATEMENTS: () => MIGRATION_0046_STATEMENTS
});
var MIGRATION_0046_NAME, MIGRATION_0046_STATEMENTS, IDEMPOTENT_ERROR_CODES_0046;
var init_migration_0046 = __esm({
  "server/migrations/migration_0046.ts"() {
    "use strict";
    MIGRATION_0046_NAME = "0046_multipark_report_extra_fields";
    MIGRATION_0046_STATEMENTS = [
      // ── 1. Novas colunas em multipark_bookings ────────────────────────────────
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`totalPaid\` DECIMAL(10,2) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`pro\` TINYINT DEFAULT 0`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`partnerId\` VARCHAR(128) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`partnerName\` VARCHAR(256) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`campaignId\` VARCHAR(128) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`campaignName\` VARCHAR(256) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`cashValidatedByName\` VARCHAR(256) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`driverValidatedByName\` VARCHAR(256) NULL`,
      `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`cashierClosedByName\` VARCHAR(256) NULL`,
      // ── 2. Tabela-filha dos extraServices itemizados ──────────────────────────
      `CREATE TABLE IF NOT EXISTS \`multipark_booking_extras\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`bookingExternalId\` VARCHAR(128) NOT NULL,
    \`extraId\` VARCHAR(128) NULL,
    \`name\` VARCHAR(256) NULL,
    \`description\` VARCHAR(512) NULL,
    \`price\` DECIMAL(10,2) NULL,
    \`done\` TINYINT DEFAULT 0,
    \`syncedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_mp_booking_extras_booking\` (\`bookingExternalId\`)
  )`
    ];
    IDEMPOTENT_ERROR_CODES_0046 = /* @__PURE__ */ new Set([
      "ER_DUP_FIELDNAME",
      // ADD COLUMN onde já existe
      "ER_DUP_KEYNAME",
      // CREATE INDEX onde já existe
      "ER_TABLE_EXISTS_ERROR",
      // CREATE TABLE (mesmo com IF NOT EXISTS é seguro)
      "ER_DUP_ENTRY"
      // INSERT duplicado
    ]);
  }
});

// server/migrations/migration_0048.ts
var migration_0048_exports = {};
__export(migration_0048_exports, {
  IDEMPOTENT_ERROR_CODES_0048: () => IDEMPOTENT_ERROR_CODES_0048,
  MIGRATION_0048_NAME: () => MIGRATION_0048_NAME,
  MIGRATION_0048_STATEMENTS: () => MIGRATION_0048_STATEMENTS
});
var MIGRATION_0048_NAME, MIGRATION_0048_STATEMENTS, IDEMPOTENT_ERROR_CODES_0048;
var init_migration_0048 = __esm({
  "server/migrations/migration_0048.ts"() {
    "use strict";
    MIGRATION_0048_NAME = "0048_campaign_daily_metrics";
    MIGRATION_0048_STATEMENTS = [
      "ALTER TABLE `internal_campaign_costs` ADD COLUMN `impressions` INT NULL AFTER `amount`",
      "ALTER TABLE `internal_campaign_costs` ADD COLUMN `clicks` INT NULL AFTER `impressions`",
      "ALTER TABLE `internal_campaign_costs` ADD COLUMN `ctr` DECIMAL(7,3) NULL AFTER `clicks`",
      "ALTER TABLE `internal_campaign_costs` ADD COLUMN `conversions` DECIMAL(10,2) NULL AFTER `ctr`",
      "ALTER TABLE `internal_campaign_costs` ADD COLUMN `conversionValue` DECIMAL(10,2) NULL AFTER `conversions`"
    ];
    IDEMPOTENT_ERROR_CODES_0048 = /* @__PURE__ */ new Set([
      "ER_DUP_FIELDNAME",
      "ER_DUP_KEYNAME"
    ]);
  }
});

// server/complaintsExtended.ts
var complaintsExtended_exports = {};
__export(complaintsExtended_exports, {
  attachDriverToComplaint: () => attachDriverToComplaint,
  createNotification: () => createNotification,
  detachComplaintDriver: () => detachComplaintDriver,
  findDriversOnDuty: () => findDriversOnDuty,
  listComplaintDrivers: () => listComplaintDrivers,
  listNotifications: () => listNotifications,
  listPenaltyConfig: () => listPenaltyConfig,
  markAllNotificationsRead: () => markAllNotificationsRead,
  markNotificationRead: () => markNotificationRead,
  notifyComplaintCreated: () => notifyComplaintCreated,
  sendComplaintEmailToClient: () => sendComplaintEmailToClient,
  unreadCount: () => unreadCount,
  updatePenaltyConfig: () => updatePenaltyConfig
});
import { and as and3, desc as desc2, eq as eq4, gte as gte3, lte as lte3, sql as sql3 } from "drizzle-orm";
async function createNotification(input) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(appNotifications).values({
    userId: input.userId,
    title: input.title.slice(0, 255),
    body: input.body ?? null,
    kind: (input.kind ?? "info").slice(0, 32),
    link: input.link?.slice(0, 512) ?? null
  });
}
async function listNotifications(userId, unreadOnly = false, limit = 50) {
  const db2 = await getDb();
  if (!db2) return [];
  const cond = unreadOnly ? and3(eq4(appNotifications.userId, userId), eq4(appNotifications.isRead, 0)) : eq4(appNotifications.userId, userId);
  return db2.select().from(appNotifications).where(cond).orderBy(desc2(appNotifications.createdAt)).limit(limit);
}
async function unreadCount(userId) {
  const db2 = await getDb();
  if (!db2) return 0;
  const [row] = await db2.select({ n: sql3`COUNT(*)` }).from(appNotifications).where(and3(eq4(appNotifications.userId, userId), eq4(appNotifications.isRead, 0)));
  return Number(row?.n ?? 0);
}
async function markNotificationRead(userId, id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(appNotifications).set({ isRead: 1 }).where(and3(eq4(appNotifications.id, id), eq4(appNotifications.userId, userId)));
}
async function markAllNotificationsRead(userId) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(appNotifications).set({ isRead: 1 }).where(eq4(appNotifications.userId, userId));
}
async function findDriversOnDuty(complaintId) {
  const db2 = await getDb();
  if (!db2) return [];
  const [c] = await db2.select({
    reservationRef: complaints.reservationRef,
    reservationStart: complaints.reservationStart,
    reservationEnd: complaints.reservationEnd
  }).from(complaints).where(eq4(complaints.id, complaintId)).limit(1);
  if (!c) return [];
  const drivers = [];
  const seen = /* @__PURE__ */ new Set();
  if (c.reservationRef) {
    const histRows = await db2.select({
      agentName: multiparkBookingHistory.agentName,
      agentEmail: multiparkBookingHistory.agentEmail,
      changeType: multiparkBookingHistory.changeType
    }).from(multiparkBookingHistory).where(eq4(multiparkBookingHistory.bookingExternalId, c.reservationRef));
    const grouped = /* @__PURE__ */ new Map();
    for (const h2 of histRows) {
      if (!h2.agentName) continue;
      let g = grouped.get(h2.agentName);
      if (!g) {
        g = { actions: [], email: h2.agentEmail ?? null };
        grouped.set(h2.agentName, g);
      }
      if (h2.changeType) g.actions.push(h2.changeType);
      if (!g.email && h2.agentEmail) g.email = h2.agentEmail;
    }
    for (const [name, info] of Array.from(grouped.entries())) {
      const empCandidates = await db2.select({ id: employees.id, fullName: employees.fullName }).from(employees).where(
        info.email ? eq4(employees.email, info.email) : sql3`LOWER(${employees.fullName}) LIKE LOWER(${"%" + name + "%"})`
      ).limit(1);
      const emp = empCandidates[0];
      const k = `${emp?.id ?? "?"}|${name}`;
      if (seen.has(k)) continue;
      seen.add(k);
      drivers.push({
        source: "history",
        employeeId: emp?.id ?? null,
        employeeName: emp?.fullName ?? name,
        roleAtTime: null,
        notes: `Ac\xE7\xF5es: ${info.actions.join(", ") || "\u2014"}`,
        alreadyLinked: false
      });
    }
  }
  if (c.reservationStart || c.reservationEnd) {
    const startDate = (c.reservationStart ?? c.reservationEnd ?? "").slice(0, 10);
    const endDate = (c.reservationEnd ?? c.reservationStart ?? "").slice(0, 10);
    if (startDate && endDate) {
      const assignmentRows = await db2.select({
        employeeId: extrasDiaAssignments.employeeId,
        personName: extrasDiaAssignments.personName,
        isTeamLeader: extrasDiaAssignments.isTeamLeader,
        shift: extrasDiaAssignments.shift,
        assignmentDate: extrasDiaAssignments.assignmentDate
      }).from(extrasDiaAssignments).where(
        and3(
          gte3(extrasDiaAssignments.assignmentDate, startDate),
          lte3(extrasDiaAssignments.assignmentDate, endDate)
        )
      );
      for (const a of assignmentRows) {
        const k = `${a.employeeId ?? "?"}|${a.personName}`;
        if (seen.has(k)) continue;
        seen.add(k);
        const role = a.isTeamLeader === 1 ? "team_leader" : a.shift ?? "driver";
        drivers.push({
          source: "assignment",
          employeeId: a.employeeId,
          employeeName: a.personName,
          roleAtTime: role,
          notes: `Escalado ${a.assignmentDate} (${a.shift})`,
          alreadyLinked: false
        });
      }
    }
  }
  const existing = await db2.select({ employeeName: complaintDriversOnDuty.employeeName, employeeId: complaintDriversOnDuty.employeeId }).from(complaintDriversOnDuty).where(eq4(complaintDriversOnDuty.complaintId, complaintId));
  const existingSet = new Set(existing.map((e) => `${e.employeeId ?? "?"}|${e.employeeName}`));
  for (const d of drivers) {
    if (existingSet.has(`${d.employeeId ?? "?"}|${d.employeeName}`)) d.alreadyLinked = true;
  }
  return drivers;
}
async function attachDriverToComplaint(input) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(complaintDriversOnDuty).values({
    complaintId: input.complaintId,
    employeeId: input.employeeId ?? null,
    employeeName: input.employeeName.slice(0, 256),
    roleAtTime: input.roleAtTime?.slice(0, 64) ?? null,
    source: input.source,
    penaltyPointsApplied: 0,
    notes: input.notes?.slice(0, 512) ?? null
  });
}
async function listComplaintDrivers(complaintId) {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(complaintDriversOnDuty).where(eq4(complaintDriversOnDuty.complaintId, complaintId));
}
async function detachComplaintDriver(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.delete(complaintDriversOnDuty).where(eq4(complaintDriversOnDuty.id, id));
}
async function listPenaltyConfig() {
  const db2 = await getDb();
  if (!db2) return [];
  return db2.select().from(complaintPenaltyConfig);
}
async function updatePenaltyConfig(complaintType, basePoints) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.insert(complaintPenaltyConfig).values({ complaintType, basePoints }).onDuplicateKeyUpdate({ set: { basePoints } });
}
async function sendComplaintEmailToClient(input) {
  const db2 = await getDb();
  if (!db2) return { ok: false, error: "DB indispon\xEDvel" };
  const [c] = await db2.select({
    clientEmail: complaints.clientEmail,
    clientName: complaints.clientName
  }).from(complaints).where(eq4(complaints.id, input.complaintId)).limit(1);
  if (!c) return { ok: false, error: "Reclama\xE7\xE3o n\xE3o encontrada" };
  if (!c.clientEmail) return { ok: false, error: "Reclama\xE7\xE3o sem email de cliente" };
  const greeting = c.clientName ? `Ol\xE1 ${c.clientName},

` : "Ol\xE1,\n\n";
  const fullBody = greeting + input.body;
  const ok = await sendEmail({
    to: c.clientEmail,
    subject: input.subject,
    text: fullBody,
    html: `<p>${fullBody.replace(/\n/g, "<br>")}</p>`
  });
  if (ok) {
    await db2.update(complaints).set({
      clientEmailSentAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
      clientEmailSubject: input.subject.slice(0, 255),
      clientEmailBody: input.body
    }).where(eq4(complaints.id, input.complaintId));
    return { ok: true };
  }
  return { ok: false, error: "Falha ao enviar email (SMTP)" };
}
async function notifyComplaintCreated(complaintId) {
  const db2 = await getDb();
  if (!db2) return;
  const [c] = await db2.select({
    id: complaints.id,
    title: complaints.title,
    complaintType: complaints.complaintType,
    complaintPriority: complaints.complaintPriority,
    assignedToId: complaints.assignedToId,
    clientName: complaints.clientName
  }).from(complaints).where(eq4(complaints.id, complaintId)).limit(1);
  if (!c) return;
  const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const recipients = await db2.select({ id: users2.id }).from(users2).where(sql3`${users2.role} IN ('admin','super_admin','supervisor','team_leader')`);
  const title = `Nova reclama\xE7\xE3o: ${c.title}`;
  const body = `Tipo: ${c.complaintType} \xB7 Prioridade: ${c.complaintPriority}${c.clientName ? ` \xB7 Cliente: ${c.clientName}` : ""}`;
  const link = `/reclamacoes/${complaintId}`;
  const userIds = new Set(recipients.map((r) => r.id));
  if (c.assignedToId) userIds.add(c.assignedToId);
  for (const userId of Array.from(userIds)) {
    try {
      await createNotification({ userId, title, body, kind: "complaint", link });
    } catch {
    }
  }
}
var init_complaintsExtended = __esm({
  "server/complaintsExtended.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_notification();
  }
});

// server/multiparkEvaluation.ts
var multiparkEvaluation_exports = {};
__export(multiparkEvaluation_exports, {
  evaluateDay: () => evaluateDay,
  getDashboardRange: () => getDashboardRange
});
import { and as and4, gte as gte4, lt, lte as lte4, sql as sql4 } from "drizzle-orm";
async function evaluateDay(date) {
  const db2 = await getDb();
  if (!db2) {
    return {
      date,
      shifts: [],
      totals: { people: 0, totalActions: 0, totalCost: 0, byType: {}, costPerAction: 0 }
    };
  }
  const assignments = await listAssignments(date);
  const startStr = `${date} 00:00:00`;
  const endDate = /* @__PURE__ */ new Date(date + "T00:00:00");
  endDate.setDate(endDate.getDate() + 1);
  const endStr = endDate.toISOString().slice(0, 19).replace("T", " ");
  const historyRows = await db2.select({
    agentName: multiparkBookingHistory.agentName,
    changeType: multiparkBookingHistory.changeType
  }).from(multiparkBookingHistory).where(
    and4(
      gte4(multiparkBookingHistory.actionTime, startStr),
      lt(multiparkBookingHistory.actionTime, endStr)
    )
  );
  const normalize = (s) => s.toLowerCase().trim();
  const byAgent = /* @__PURE__ */ new Map();
  for (const h2 of historyRows) {
    if (!h2.agentName) continue;
    const key = normalize(h2.agentName);
    let c = byAgent.get(key);
    if (!c) {
      c = { total: 0, byType: {} };
      byAgent.set(key, c);
    }
    c.total++;
    const ct = h2.changeType ?? "?";
    c.byType[ct] = (c.byType[ct] ?? 0) + 1;
  }
  const people = assignments.map((a) => {
    const shortName = a.multiparkAgentName || deriveShortName(a.personName);
    const counts = byAgent.get(normalize(shortName)) ?? { total: 0, byType: {} };
    return {
      assignmentId: a.id,
      personName: a.personName,
      resolvedAgentName: shortName,
      isTeamLeader: a.isTeamLeader,
      shift: a.shift,
      level: a.level,
      hoursPaid: a.hoursBilled,
      cost: a.cost,
      totalActions: counts.total,
      byType: counts.byType,
      costPerAction: counts.total > 0 ? a.cost / counts.total : 0
    };
  });
  const shifts = ["morning", "night"].map((shift) => {
    const shiftPeople = people.filter((p) => p.shift === shift);
    const tl = shiftPeople.find((p) => p.isTeamLeader) ?? null;
    const drivers = shiftPeople.filter((p) => !p.isTeamLeader);
    const driverActions = drivers.reduce((s, d) => s + d.totalActions, 0);
    const driverCost = drivers.reduce((s, d) => s + d.cost, 0);
    const driverByType = {};
    for (const d of drivers) {
      for (const [k, v] of Object.entries(d.byType)) driverByType[k] = (driverByType[k] ?? 0) + v;
    }
    if (tl) {
      tl.teamAggregate = {
        drivers: drivers.length,
        totalActions: driverActions,
        totalCost: driverCost,
        costPerAction: driverActions > 0 ? driverCost / driverActions : 0,
        byType: driverByType
      };
    }
    const totalActions = shiftPeople.reduce((s, p) => s + p.totalActions, 0);
    const totalCost = shiftPeople.reduce((s, p) => s + p.cost, 0);
    const byType = {};
    for (const p of shiftPeople) {
      for (const [k, v] of Object.entries(p.byType)) byType[k] = (byType[k] ?? 0) + v;
    }
    return {
      shift,
      drivers: shiftPeople.length,
      totalActions,
      totalCost,
      byType,
      costPerAction: totalActions > 0 ? totalCost / totalActions : 0,
      tl,
      members: drivers
    };
  });
  const dayActions = people.reduce((s, p) => s + p.totalActions, 0);
  const dayCost = people.reduce((s, p) => s + p.cost, 0);
  const dayByType = {};
  for (const p of people) {
    for (const [k, v] of Object.entries(p.byType)) dayByType[k] = (dayByType[k] ?? 0) + v;
  }
  return {
    date,
    shifts,
    totals: {
      people: people.length,
      totalActions: dayActions,
      totalCost: dayCost,
      byType: dayByType,
      costPerAction: dayActions > 0 ? dayCost / dayActions : 0
    }
  };
}
function actionTimeToOffsetHours(actionTime, assignmentDate) {
  if (!actionTime) return null;
  const aDate = new Date(actionTime.includes("T") ? actionTime : actionTime.replace(" ", "T"));
  if (Number.isNaN(aDate.getTime())) return null;
  const baseDate = /* @__PURE__ */ new Date(assignmentDate + "T00:00:00");
  const diffMs = aDate.getTime() - baseDate.getTime();
  return diffMs / (60 * 60 * 1e3);
}
async function getDashboardRange(startDate, endDate) {
  const db2 = await getDb();
  const empty = {
    startDate,
    endDate,
    daily: [],
    byPerson: [],
    totals: {
      days: 0,
      drivers: 0,
      totalCost: 0,
      totalActions: 0,
      inShift: 0,
      outOfShift: 0,
      byType: {},
      costPerAction: 0
    }
  };
  if (!db2) return empty;
  const assignmentRows = await db2.select().from(extrasDiaAssignments).where(
    and4(
      gte4(extrasDiaAssignments.assignmentDate, startDate),
      lte4(extrasDiaAssignments.assignmentDate, endDate)
    )
  );
  const empIds = Array.from(new Set(assignmentRows.map((r) => r.employeeId).filter((x) => x !== null)));
  const empMap = /* @__PURE__ */ new Map();
  if (empIds.length > 0) {
    const empRows = await db2.select({
      id: employees.id,
      multiparkAgentName: employees.multiparkAgentName,
      monthlySalary: employees.monthlySalary
    }).from(employees).where(sql4`${employees.id} IN (${sql4.raw(empIds.join(","))})`);
    for (const e of empRows) {
      empMap.set(e.id, {
        multiparkAgentName: e.multiparkAgentName,
        monthlySalary: e.monthlySalary ? String(e.monthlySalary) : null
      });
    }
  }
  const assignmentsPlus = assignmentRows.map((r) => {
    const isTL = r.isTeamLeader === 1;
    const effectiveEnd = r.sentHomeHour ?? r.endHour;
    const hours = Math.max(0, effectiveEnd - r.startHour);
    const map = r.employeeId ? empMap.get(r.employeeId) : void 0;
    let cost = 0;
    if (isTL && map?.monthlySalary) {
      const monthly = parseFloat(map.monthlySalary);
      if (Number.isFinite(monthly)) cost = monthly / TL_WORKING_DAYS_PER_MONTH;
    } else if (!isTL && r.level) {
      const rate = DRIVER_LEVELS.find((l) => l.id === r.level)?.hourlyRate ?? 0;
      cost = hours * rate;
    }
    const resolvedAgentName = map?.multiparkAgentName ?? deriveShortName(r.personName);
    return {
      id: r.id,
      assignmentDate: r.assignmentDate,
      personName: r.personName,
      resolvedAgentName,
      isTeamLeader: isTL,
      shift: r.shift ?? "morning",
      startHour: r.startHour,
      endHour: r.endHour,
      sentHomeHour: r.sentHomeHour,
      hoursPaid: hours,
      cost
    };
  });
  const startStr = `${startDate} 00:00:00`;
  const endPlus = /* @__PURE__ */ new Date(endDate + "T00:00:00");
  endPlus.setDate(endPlus.getDate() + 2);
  const endStr = endPlus.toISOString().slice(0, 19).replace("T", " ");
  const historyRows = await db2.select({
    agentName: multiparkBookingHistory.agentName,
    changeType: multiparkBookingHistory.changeType,
    actionTime: multiparkBookingHistory.actionTime
  }).from(multiparkBookingHistory).where(
    and4(
      gte4(multiparkBookingHistory.actionTime, startStr),
      lt(multiparkBookingHistory.actionTime, endStr)
    )
  );
  const normalize = (s) => s.toLowerCase().trim();
  const personByName = /* @__PURE__ */ new Map();
  for (const a of assignmentsPlus) {
    const key = normalize(a.resolvedAgentName);
    let p = personByName.get(key);
    if (!p) {
      p = {
        personName: a.personName,
        resolvedAgentName: a.resolvedAgentName,
        isTeamLeader: a.isTeamLeader,
        daysWorked: /* @__PURE__ */ new Set(),
        hoursPaid: 0,
        totalCost: 0,
        totalActions: 0,
        inShiftActions: 0,
        outOfShiftActions: 0,
        byType: {}
      };
      personByName.set(key, p);
    }
    p.daysWorked.add(a.assignmentDate);
    p.hoursPaid += a.hoursPaid;
    p.totalCost += a.cost;
    if (a.isTeamLeader) p.isTeamLeader = true;
  }
  const dailyMap = /* @__PURE__ */ new Map();
  for (const h2 of historyRows) {
    if (!h2.agentName || !h2.actionTime || !h2.changeType) continue;
    const key = normalize(h2.agentName);
    const p = personByName.get(key);
    if (!p) continue;
    p.totalActions++;
    p.byType[h2.changeType] = (p.byType[h2.changeType] ?? 0) + 1;
    const personAssignments = assignmentsPlus.filter(
      (a) => normalize(a.resolvedAgentName) === key
    );
    let inShift = false;
    let bucketDate = null;
    for (const a of personAssignments) {
      const offset = actionTimeToOffsetHours(h2.actionTime, a.assignmentDate);
      if (offset === null) continue;
      const effectiveEnd = a.sentHomeHour ?? a.endHour;
      if (offset >= a.startHour && offset <= effectiveEnd) {
        inShift = true;
        bucketDate = a.assignmentDate;
        break;
      }
      if (offset >= 0 && offset < 24 && !bucketDate) {
        bucketDate = a.assignmentDate;
      }
    }
    if (inShift) p.inShiftActions++;
    else p.outOfShiftActions++;
    const bd = bucketDate ?? (h2.actionTime?.slice(0, 10) ?? null);
    if (bd) {
      let day = dailyMap.get(bd);
      if (!day) {
        day = { date: bd, drivers: 0, totalCost: 0, totalActions: 0, inShift: 0, outOfShift: 0 };
        dailyMap.set(bd, day);
      }
      day.totalActions++;
      if (inShift) day.inShift++;
      else day.outOfShift++;
    }
  }
  for (const a of assignmentsPlus) {
    let day = dailyMap.get(a.assignmentDate);
    if (!day) {
      day = { date: a.assignmentDate, drivers: 0, totalCost: 0, totalActions: 0, inShift: 0, outOfShift: 0 };
      dailyMap.set(a.assignmentDate, day);
    }
    day.totalCost += a.cost;
    day.drivers++;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const byPerson = Array.from(personByName.values()).map((p) => ({
    personName: p.personName,
    resolvedAgentName: p.resolvedAgentName,
    isTeamLeader: p.isTeamLeader,
    daysWorked: p.daysWorked.size,
    hoursPaid: Math.round(p.hoursPaid * 100) / 100,
    totalCost: Math.round(p.totalCost * 100) / 100,
    totalActions: p.totalActions,
    inShiftActions: p.inShiftActions,
    outOfShiftActions: p.outOfShiftActions,
    byType: p.byType,
    costPerAction: p.totalActions > 0 ? p.totalCost / p.totalActions : 0
  }));
  byPerson.sort((a, b) => b.totalActions - a.totalActions);
  const totalCost = daily.reduce((s, d) => s + d.totalCost, 0);
  const totalActions = byPerson.reduce((s, p) => s + p.totalActions, 0);
  const totalInShift = byPerson.reduce((s, p) => s + p.inShiftActions, 0);
  const totalOut = byPerson.reduce((s, p) => s + p.outOfShiftActions, 0);
  const totalByType = {};
  for (const p of byPerson) {
    for (const [k, v] of Object.entries(p.byType)) totalByType[k] = (totalByType[k] ?? 0) + v;
  }
  return {
    startDate,
    endDate,
    daily,
    byPerson,
    totals: {
      days: daily.length,
      drivers: byPerson.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalActions,
      inShift: totalInShift,
      outOfShift: totalOut,
      byType: totalByType,
      costPerAction: totalActions > 0 ? totalCost / totalActions : 0
    }
  };
}
var init_multiparkEvaluation = __esm({
  "server/multiparkEvaluation.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_schema();
    init_extrasDia();
    init_extrasDia();
  }
});

// server/_core/api-entry.ts
import express from "express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();
import crypto2 from "node:crypto";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "lax" : "lax",
    secure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
var GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
var OAuthService = class {
  /**
   * Exchange authorization code for Google tokens
   */
  async exchangeCodeForToken(code, redirectUri) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured");
    }
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google token exchange failed: ${response.status} ${error}`);
    }
    return await response.json();
  }
  /**
   * Get user profile from Google using access token
   */
  async getUserInfo(accessToken) {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      throw new Error(`Google userinfo failed: ${response.status}`);
    }
    return await response.json();
  }
};
var SDKServer = class {
  constructor() {
    this.oauthService = new OAuthService();
  }
  async exchangeCodeForToken(code, redirectUri) {
    return this.oauthService.exchangeCodeForToken(code, redirectUri);
  }
  async getUserInfo(accessToken) {
    return this.oauthService.getUserInfo(accessToken);
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) return /* @__PURE__ */ new Map();
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) throw new Error("JWT_SECRET is not configured");
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user openId
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) return null;
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        return null;
      }
      return { openId, appId, name };
    } catch {
      return null;
    }
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    let user = await getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
var SESSION_MAX_MS = (() => {
  const n = parseInt(process.env.SESSION_MAX_DAYS ?? "30", 10);
  return (Number.isFinite(n) && n > 0 ? n : 30) * 24 * 60 * 60 * 1e3;
})();
var OAUTH_STATE_COOKIE = "app_oauth_state";
var OAUTH_STATE_MAX_MS = 10 * 60 * 1e3;
function getStateCookieOptions(req) {
  const base = getSessionCookieOptions(req);
  return {
    ...base,
    // A cookie de state é lida no callback OAuth, que vem via cross-site
    // redirect da Google — com SameSite=Strict o browser NÃO enviaria a
    // cookie. Lax é o mínimo necessário para este fluxo funcionar.
    sameSite: "lax",
    maxAge: OAUTH_STATE_MAX_MS
  };
}
function renderErrorPage(title, message, details) {
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:4rem auto;padding:0 1.5rem;color:#1f2937;line-height:1.6}
h1{color:#dc2626;margin-bottom:.5rem}code{background:#f3f4f6;padding:.15rem .4rem;border-radius:4px;font-size:.9em}
pre{background:#f3f4f6;padding:1rem;border-radius:6px;overflow-x:auto;font-size:.85em}
a{color:#2563eb}</style></head><body>
<h1>${title}</h1><p>${message}</p>${details ? `<pre>${details}</pre>` : ""}
<p><a href="/">\u2190 Voltar ao in\xEDcio</a></p></body></html>`;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/_diag", (req, res) => {
    res.json({
      origin: getOrigin(req),
      redirectUri: `${getOrigin(req)}/api/oauth/callback`,
      env: {
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        JWT_SECRET: !!process.env.JWT_SECRET,
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV ?? null
      },
      headers: {
        host: req.headers.host,
        "x-forwarded-host": req.headers["x-forwarded-host"],
        "x-forwarded-proto": req.headers["x-forwarded-proto"]
      },
      hint: "Copia o valor de 'redirectUri' e regista-o na Google Cloud Console \u2192 Credentials \u2192 OAuth Client \u2192 Authorized redirect URIs."
    });
  });
  if (process.env.NODE_ENV !== "production") {
    app2.get("/api/dev-login", async (req, res) => {
      const expected = process.env.DEV_LOGIN_TOKEN;
      const provided = (typeof req.query.token === "string" ? req.query.token : void 0) ?? (typeof req.headers["x-dev-login-token"] === "string" ? req.headers["x-dev-login-token"] : void 0);
      if (!expected) {
        res.status(403).json({
          error: "Dev login desativado: define a vari\xE1vel de ambiente DEV_LOGIN_TOKEN para ativar."
        });
        return;
      }
      if (!provided || provided.length < 16 || !safeEquals(provided, expected)) {
        res.status(401).json({ error: "Token de dev-login inv\xE1lido" });
        return;
      }
      try {
        const openId = "dev_admin_local";
        const name = "Admin Dev";
        const email = "admin@multipark.local";
        await upsertUser({
          openId,
          name,
          email,
          loginMethod: "google",
          role: "super_admin",
          lastSignedIn: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: SESSION_MAX_MS
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: SESSION_MAX_MS
        });
        res.redirect(302, "/");
      } catch (error) {
        console.error("[Dev Login] Failed", error);
        res.status(500).json({ error: "Dev login failed" });
      }
    });
  }
  app2.get("/api/oauth/login", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const jwtSecret = process.env.JWT_SECRET;
    const missing = [];
    if (!clientId) missing.push("GOOGLE_CLIENT_ID");
    if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
    if (!jwtSecret) missing.push("JWT_SECRET");
    if (missing.length > 0) {
      console.error("[OAuth] Login bloqueado \u2014 env vars em falta:", missing);
      res.status(500).type("html").send(
        renderErrorPage(
          "Configura\xE7\xE3o de autentica\xE7\xE3o incompleta",
          `As seguintes vari\xE1veis de ambiente n\xE3o est\xE3o definidas no servidor: <code>${missing.join("</code>, <code>")}</code>.`,
          "Adiciona-as em Vercel \u2192 Settings \u2192 Environment Variables e faz redeploy.\n\nV\xEA o diagn\xF3stico completo em: /api/oauth/_diag"
        )
      );
      return;
    }
    const state = crypto2.randomBytes(32).toString("base64url");
    res.cookie(OAUTH_STATE_COOKIE, state, getStateCookieOptions(req));
    const redirectUri = `${getOrigin(req)}/api/oauth/callback`;
    const scope = "openid email profile";
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    res.redirect(302, url.toString());
  });
  app2.get("/api/oauth/callback", async (req, res) => {
    const googleError = typeof req.query.error === "string" ? req.query.error : void 0;
    if (googleError) {
      const description = typeof req.query.error_description === "string" ? req.query.error_description : "(sem descri\xE7\xE3o)";
      console.error("[OAuth] Google devolveu erro:", googleError, description);
      res.status(400).type("html").send(
        renderErrorPage(
          "A Google rejeitou o pedido de autentica\xE7\xE3o",
          `C\xF3digo: <code>${googleError}</code>`,
          `${description}

Causa t\xEDpica: o redirect_uri enviado n\xE3o corresponde aos URIs autorizados na Google Cloud Console. Confirma em /api/oauth/_diag qual \xE9 o redirect_uri usado.`
        )
      );
      return;
    }
    const code = typeof req.query.code === "string" ? req.query.code : void 0;
    const returnedState = typeof req.query.state === "string" ? req.query.state : void 0;
    if (!code) {
      res.status(400).type("html").send(
        renderErrorPage(
          "Falta o c\xF3digo de autoriza\xE7\xE3o",
          "O callback da Google chegou sem o par\xE2metro <code>code</code>.",
          "Tenta de novo a partir de /api/oauth/login. Se persistir, verifica /api/oauth/_diag."
        )
      );
      return;
    }
    const savedState = readCookie(req, OAUTH_STATE_COOKIE);
    res.clearCookie(OAUTH_STATE_COOKIE, {
      ...getSessionCookieOptions(req)
    });
    if (!savedState || !returnedState || !safeEquals(savedState, returnedState)) {
      console.error("[OAuth] State inv\xE1lido:", {
        hasSaved: !!savedState,
        hasReturned: !!returnedState
      });
      res.status(400).type("html").send(
        renderErrorPage(
          "Estado OAuth inv\xE1lido ou expirado",
          "O cookie de prote\xE7\xE3o CSRF n\xE3o foi recebido ou n\xE3o corresponde ao esperado.",
          "Causas t\xEDpicas:\n\u2022 Passaram mais de 10 minutos entre clicar em 'Entrar' e voltar da Google\n\u2022 O dom\xEDnio do login \xE9 diferente do dom\xEDnio do callback (ex: preview vs production)\n\u2022 Cookies de terceiros bloqueados no browser\n\nFecha a janela, abre nova e tenta de novo a partir de /."
        )
      );
      return;
    }
    try {
      const redirectUri = `${getOrigin(req)}/api/oauth/callback`;
      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);
      const userInfo = await sdk.getUserInfo(tokenResponse.access_token);
      if (!userInfo.sub) {
        res.status(400).type("html").send(
          renderErrorPage(
            "Resposta da Google sem identificador",
            "A Google n\xE3o devolveu o <code>sub</code> (ID do utilizador)."
          )
        );
        return;
      }
      const openId = `google_${userInfo.sub}`;
      await upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: SESSION_MAX_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: SESSION_MAX_MS
      });
      res.redirect(302, "/");
    } catch (error) {
      const msg = error?.message || String(error);
      console.error("[OAuth] Callback failed", error);
      res.status(500).type("html").send(
        renderErrorPage(
          "Falha ao concluir autentica\xE7\xE3o",
          "Ocorreu um erro ao trocar o c\xF3digo por um token ou ao gravar o utilizador.",
          `${msg}

Verifica:
\u2022 GOOGLE_CLIENT_SECRET est\xE1 correto no Vercel?
\u2022 DATABASE_URL aponta para uma BD acess\xEDvel?
\u2022 As tabelas (users) existem? Corre as migra\xE7\xF5es Drizzle.

Diagn\xF3stico: /api/oauth/_diag \xB7 Sa\xFAde: /api/health`
        )
      );
    }
  });
}
function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}
function safeEquals(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto2.timingSafeEqual(ab, bb);
}
function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const pair of raw.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const k = pair.slice(0, idx).trim();
    if (k === name) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
import * as XLSX from "xlsx";

// server/_core/systemRouter.ts
init_notification();
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => {
  const url = process.env.LLM_API_URL || process.env.OPENAI_API_URL;
  if (!url) throw new Error("LLM_API_URL or OPENAI_API_URL is not configured");
  const base = url.replace(/\/$/, "");
  if (base.includes("/openai")) {
    return `${base}/chat/completions`;
  }
  return `${base}/v1/chat/completions`;
};
var resolveApiKey = () => {
  const key = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("LLM_API_KEY or OPENAI_API_KEY is not configured");
  return key;
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
function isAnthropic() {
  const url = process.env.LLM_API_URL || "";
  return url.includes("anthropic");
}
async function invokeClaude(params) {
  const apiKey = resolveApiKey();
  const model = "claude-sonnet-4-20250514";
  const normalized = params.messages.map(normalizeMessage);
  let system = "";
  const msgs = [];
  for (const m of normalized) {
    if (m.role === "system") {
      system += (typeof m.content === "string" ? m.content : JSON.stringify(m.content)) + "\n";
    } else {
      let content = m.content;
      if (Array.isArray(content)) {
        content = content.map((part) => {
          if (part.type === "image_url" && part.image_url?.url) {
            const url = part.image_url.url;
            const dataMatch = url.match(/^data:(image\/\w+);base64,(.+)$/);
            if (dataMatch) {
              return {
                type: "image",
                source: { type: "base64", media_type: dataMatch[1], data: dataMatch[2] }
              };
            }
            return {
              type: "image",
              source: { type: "url", url }
            };
          }
          return part;
        });
      }
      msgs.push({ role: m.role, content });
    }
  }
  const payload = {
    model,
    max_tokens: 4096,
    messages: msgs
  };
  if (system.trim()) payload.system = system.trim();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`);
  }
  const data = await response.json();
  const textContent = data.content?.find((c) => c.type === "text")?.text || "";
  return {
    id: data.id || "",
    created: Date.now(),
    model: data.model || model,
    choices: [{
      index: 0,
      message: { role: "assistant", content: textContent },
      finish_reason: data.stop_reason || "stop"
    }],
    usage: data.usage ? {
      prompt_tokens: data.usage.input_tokens || 0,
      completion_tokens: data.usage.output_tokens || 0,
      total_tokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
    } : void 0
  };
}
async function invokeOpenAI(params) {
  const apiKey = resolveApiKey();
  const apiUrl = resolveApiUrl();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const payload = {
    model,
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}
async function invokeLLM(params) {
  if (isAnthropic()) {
    return invokeClaude(params);
  }
  return invokeOpenAI(params);
}

// server/routers.ts
init_notification();
init_storage();

// server/_core/voiceTranscription.ts
async function transcribeAudio(options) {
  try {
    const apiUrl = process.env.LLM_API_URL || process.env.OPENAI_API_URL;
    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiUrl) {
      return {
        error: "Voice transcription service is not configured",
        code: "SERVICE_ERROR",
        details: "LLM_API_URL or OPENAI_API_URL is not set"
      };
    }
    if (!apiKey) {
      return {
        error: "Voice transcription service authentication is missing",
        code: "SERVICE_ERROR",
        details: "LLM_API_KEY or OPENAI_API_KEY is not set"
      };
    }
    let audioBuffer;
    let mimeType;
    try {
      const response2 = await fetch(options.audioUrl);
      if (!response2.ok) {
        return {
          error: "Failed to download audio file",
          code: "INVALID_FORMAT",
          details: `HTTP ${response2.status}: ${response2.statusText}`
        };
      }
      audioBuffer = Buffer.from(await response2.arrayBuffer());
      mimeType = response2.headers.get("content-type") || "audio/mpeg";
      const sizeMB = audioBuffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        return {
          error: "Audio file exceeds maximum size limit",
          code: "FILE_TOO_LARGE",
          details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB`
        };
      }
    } catch (error) {
      return {
        error: "Failed to fetch audio file",
        code: "SERVICE_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    const formData = new FormData();
    const filename = `audio.${getFileExtension(mimeType)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", audioBlob, filename);
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    const prompt = options.prompt || (options.language ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(options.language)}` : "Transcribe the user's voice to text");
    formData.append("prompt", prompt);
    const baseUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
    const fullUrl = new URL("v1/audio/transcriptions", baseUrl).toString();
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "Accept-Encoding": "identity"
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }
    const whisperResponse = await response.json();
    if (!whisperResponse.text || typeof whisperResponse.text !== "string") {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "Transcription service returned an invalid response format"
      };
    }
    return whisperResponse;
  } catch (error) {
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}
function getFileExtension(mimeType) {
  const mimeToExt = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a"
  };
  return mimeToExt[mimeType] || "audio";
}
function getLanguageName(langCode) {
  const langMap = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "hi": "Hindi",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish"
  };
  return langMap[langCode] || langCode;
}

// server/routers.ts
init_multipark();
init_extrasDia();

// server/extrasImport.ts
init_db();
var NIVEL_TO_EXTRA = {
  junior: 1,
  j\u00FAnior: 1,
  senior: 2,
  s\u00E9nior: 2,
  terminal: 3,
  master: 4
};
var KNOWN_COLUMNS = /* @__PURE__ */ new Set([
  "nome",
  "nivel",
  "n\xEDvel",
  "salario_mensal",
  "sal\xE1rio_mensal",
  "subsidio_alim_dia",
  "subs\xEDdio_alim_dia",
  "nif",
  "nib",
  "telefone",
  "email",
  "morada",
  "nacionalidade",
  "data_nascimento"
]);
function parseCsvLine(line) {
  const out = [];
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
  return out.map((s) => s.trim());
}
function normHeader(h2) {
  return h2.toLowerCase().trim().replace(/\s+/g, "_");
}
function pick(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return void 0;
}
function parseDecimal(s) {
  if (!s) return null;
  const normalized = s.replace(",", ".");
  const n = parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}
async function importExtrasFromCsv(csvText, createdById) {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const report = { parsed: 0, created: 0, errors: [], unknownColumns: [] };
  if (lines.length < 2) {
    report.errors.push({ rowIndex: 0, reason: "CSV vazio ou sem linhas de dados." });
    return report;
  }
  const headers = parseCsvLine(lines[0]).map(normHeader);
  for (const h2 of headers) {
    if (!KNOWN_COLUMNS.has(h2)) report.unknownColumns.push(h2);
  }
  if (!headers.includes("nome")) {
    report.errors.push({ rowIndex: 0, reason: "Falta coluna obrigat\xF3ria 'nome'." });
    return report;
  }
  if (!headers.includes("nivel") && !headers.includes("n\xEDvel")) {
    report.errors.push({ rowIndex: 0, reason: "Falta coluna obrigat\xF3ria 'nivel'." });
    return report;
  }
  for (let i = 1; i < lines.length; i++) {
    report.parsed++;
    const cols = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cols[j] ?? "";
    const nome = pick(row, "nome");
    if (!nome) {
      report.errors.push({ rowIndex: i + 1, reason: "Nome em falta." });
      continue;
    }
    const nivelRaw = pick(row, "nivel", "n\xEDvel")?.toLowerCase() ?? "";
    const extraLevel = NIVEL_TO_EXTRA[nivelRaw];
    if (!extraLevel) {
      report.errors.push({
        rowIndex: i + 1,
        nome,
        reason: `N\xEDvel inv\xE1lido '${nivelRaw}'. Usa junior, senior, terminal ou master.`
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
        monthlySalary: parseDecimal(pick(row, "salario_mensal", "sal\xE1rio_mensal")),
        mealAllowancePerDay: parseDecimal(pick(row, "subsidio_alim_dia", "subs\xEDdio_alim_dia")),
        isActive: 1
      });
      report.created++;
    } catch (err) {
      report.errors.push({ rowIndex: i + 1, nome, reason: err.message || String(err) });
    }
  }
  return report;
}

// server/routers.ts
init_db();

// server/payrollPdf.ts
init_db();
import PDFDocument from "pdfkit";
var MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Mar\xE7o",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];
var fmt = (v) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
async function generatePayrollPdf(year, month) {
  const payroll = await getPayrollData(year, month);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30,
      info: {
        Title: `Folha de Ordenados - ${MONTH_NAMES[month - 1]} ${year}`,
        Author: "Dashboard Multipark"
      }
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const pageW = doc.page.width - 60;
    const startX = 30;
    let y = 30;
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a1a2e").text("Dashboard Multipark", startX, y);
    y += 25;
    doc.fontSize(14).font("Helvetica").text(`Folha de Ordenados \u2014 ${MONTH_NAMES[month - 1]} ${year}`, startX, y);
    y += 18;
    doc.fontSize(9).fillColor("#666").text(`Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")} \xE0s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-PT")}`, startX, y);
    y += 25;
    doc.moveTo(startX, y).lineTo(startX + pageW, y).strokeColor("#ddd").lineWidth(1).stroke();
    y += 10;
    const totals = payroll.reduce((acc, r) => ({
      totalHours: acc.totalHours + r.totalHours,
      baseSalary: acc.baseSalary + r.baseSalary,
      extraPayment: acc.extraPayment + r.extraPayment,
      overtimePayment: acc.overtimePayment + r.overtimePayment,
      thirteenthProvision: acc.thirteenthProvision + r.thirteenthProvision,
      totalPayment: acc.totalPayment + r.totalPayment
    }), { totalHours: 0, baseSalary: 0, extraPayment: 0, overtimePayment: 0, thirteenthProvision: 0, totalPayment: 0 });
    const summaryBoxW = pageW / 4;
    const summaryItems = [
      { label: "Total Horas", value: `${fmt(totals.totalHours)}h` },
      { label: "Sal\xE1rios Base", value: `${fmt(totals.baseSalary)}\u20AC` },
      { label: "Extras + H.Extra", value: `${fmt(totals.extraPayment + totals.overtimePayment)}\u20AC` },
      { label: "Total a Pagar", value: `${fmt(totals.totalPayment)}\u20AC` }
    ];
    summaryItems.forEach((item, i) => {
      const bx = startX + i * summaryBoxW;
      doc.save();
      doc.roundedRect(bx + 2, y, summaryBoxW - 4, 40, 4).fillColor("#f8f9fa").fill();
      doc.restore();
      doc.fontSize(8).fillColor("#888").text(item.label, bx + 10, y + 8);
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text(item.value, bx + 10, y + 20);
      doc.font("Helvetica");
    });
    y += 52;
    const cols = [
      ["Nome", 140, "left"],
      ["Posto", 70, "left"],
      ["Dept.", 60, "left"],
      ["NIF", 70, "left"],
      ["Horas", 45, "right"],
      ["Dias", 35, "right"],
      ["Sal. Base", 60, "right"],
      ["Extra", 55, "right"],
      ["H.Extra", 45, "right"],
      ["Pag.H.Extra", 60, "right"],
      ["Prov.13\xBA", 55, "right"],
      ["Total", 65, "right"]
    ];
    const totalColW = cols.reduce((s, c) => s + c[1], 0);
    const scale = pageW / totalColW;
    const scaledCols = cols.map(([l, w, a]) => [l, Math.floor(w * scale), a]);
    doc.save();
    doc.rect(startX, y, pageW, 18).fillColor("#1a1a2e").fill();
    doc.restore();
    let cx = startX;
    doc.fontSize(7).font("Helvetica-Bold").fillColor("#fff");
    scaledCols.forEach(([label, w, align]) => {
      if (align === "right") {
        doc.text(label, cx, y + 5, { width: w - 4, align: "right" });
      } else {
        doc.text(label, cx + 4, y + 5, { width: w - 4, align: "left" });
      }
      cx += w;
    });
    y += 18;
    doc.font("Helvetica").fillColor("#333");
    const posLabels = {
      director: "Diretor",
      supervisor: "Supervisor",
      team_leader: "Chefe Eq.",
      backoffice: "Backoffice",
      driver: "Motorista",
      valet: "Valet",
      dispatcher: "Dispatcher",
      extra: "Extra"
    };
    payroll.forEach((r, idx) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 30;
      }
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
      doc.save();
      doc.rect(startX, y, pageW, 16).fillColor(bgColor).fill();
      doc.restore();
      const rowData = [
        r.fullName,
        (posLabels[r.position] ?? r.position) + (r.isExtra && r.extraLevel ? ` N${r.extraLevel}` : ""),
        r.department ?? "\u2014",
        r.nif ?? "\u2014",
        `${fmt(r.totalHours)}h`,
        String(r.daysWorked),
        r.isExtra ? "\u2014" : `${fmt(r.baseSalary)}\u20AC`,
        r.isExtra ? `${fmt(r.extraPayment)}\u20AC` : "\u2014",
        r.isExtra ? "\u2014" : `${fmt(r.overtimeHours)}h`,
        r.isExtra ? "\u2014" : `${fmt(r.overtimePayment)}\u20AC`,
        r.isExtra ? "\u2014" : `${fmt(r.thirteenthProvision)}\u20AC`,
        `${fmt(r.totalPayment)}\u20AC`
      ];
      cx = startX;
      doc.fontSize(7).fillColor("#333");
      scaledCols.forEach(([, w, align], ci) => {
        const val = rowData[ci];
        if (ci === scaledCols.length - 1) {
          doc.font("Helvetica-Bold").fillColor("#1a1a2e");
        }
        if (align === "right") {
          doc.text(val, cx, y + 4, { width: w - 4, align: "right" });
        } else {
          doc.text(val, cx + 4, y + 4, { width: w - 4, align: "left" });
        }
        if (ci === scaledCols.length - 1) {
          doc.font("Helvetica").fillColor("#333");
        }
        cx += w;
      });
      y += 16;
    });
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 30;
    }
    doc.save();
    doc.rect(startX, y, pageW, 18).fillColor("#e8eaf0").fill();
    doc.restore();
    const totalsRow = [
      "TOTAIS",
      "",
      "",
      "",
      `${fmt(totals.totalHours)}h`,
      "",
      `${fmt(totals.baseSalary)}\u20AC`,
      `${fmt(totals.extraPayment)}\u20AC`,
      "",
      `${fmt(totals.overtimePayment)}\u20AC`,
      `${fmt(totals.thirteenthProvision)}\u20AC`,
      `${fmt(totals.totalPayment)}\u20AC`
    ];
    cx = startX;
    doc.fontSize(7).font("Helvetica-Bold").fillColor("#1a1a2e");
    scaledCols.forEach(([, w, align], ci) => {
      if (align === "right") {
        doc.text(totalsRow[ci], cx, y + 5, { width: w - 4, align: "right" });
      } else {
        doc.text(totalsRow[ci], cx + 4, y + 5, { width: w - 4, align: "left" });
      }
      cx += w;
    });
    y += 30;
    doc.fontSize(8).font("Helvetica").fillColor("#999").text(`Dashboard Multipark | ${payroll.length} colaboradores | ${MONTH_NAMES[month - 1]} ${year}`, startX, y, { align: "center", width: pageW });
    doc.end();
  });
}

// server/payslipPdf.ts
init_db();
import PDFDocument2 from "pdfkit";
var MONTH_NAMES2 = [
  "Janeiro",
  "Fevereiro",
  "Mar\xE7o",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];
var fmt2 = (v) => v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var POS_LABELS = {
  director: "Diretor",
  supervisor: "Supervisor",
  team_leader: "Chefe de Equipa",
  backoffice: "Backoffice",
  driver: "Motorista",
  valet: "Valet",
  dispatcher: "Dispatcher",
  extra: "Extra"
};
async function generatePayslipPdf(year, month, employeeId) {
  const allPayroll = await getPayrollData(year, month);
  const emp = allPayroll.find((e) => e.employeeId === employeeId);
  if (!emp) throw new Error("Funcion\xE1rio n\xE3o encontrado nos dados de payroll");
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument2({
      size: "A4",
      layout: "portrait",
      margin: 50,
      info: {
        Title: `Recibo Vencimento - ${emp.fullName} - ${MONTH_NAMES2[month - 1]} ${year}`,
        Author: "Dashboard Multipark"
      }
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const pageW = doc.page.width - 100;
    const startX = 50;
    let y = 50;
    doc.save();
    doc.rect(startX, y, pageW, 70).fillColor("#1a1a2e").fill();
    doc.restore();
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff").text("Dashboard Multipark", startX + 20, y + 15);
    doc.fontSize(10).font("Helvetica").fillColor("#c0c0d0").text("Recibo de Vencimento", startX + 20, y + 42);
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#ffffff").text(`${MONTH_NAMES2[month - 1]} ${year}`, startX + pageW - 150, y + 25, { width: 130, align: "right" });
    y += 85;
    doc.save();
    doc.rect(startX, y, pageW, 90).fillColor("#f4f5f7").fill();
    doc.restore();
    const colW = pageW / 2;
    const infoStartY = y + 12;
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("NOME COMPLETO", startX + 15, infoStartY);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a2e").text(emp.fullName, startX + 15, infoStartY + 12);
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("CARGO / POSI\xC7\xC3O", startX + 15, infoStartY + 35);
    const posLabel = POS_LABELS[emp.position] ?? emp.position;
    const posText = emp.isExtra && emp.extraLevel ? `${posLabel} \u2014 N\xEDvel ${emp.extraLevel}` : posLabel;
    doc.fontSize(10).font("Helvetica").fillColor("#333").text(posText, startX + 15, infoStartY + 47);
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("NIF", startX + colW + 15, infoStartY);
    doc.fontSize(10).font("Helvetica").fillColor("#333").text(emp.nif ?? "\u2014", startX + colW + 15, infoStartY + 12);
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("DEPARTAMENTO / PROJETO", startX + colW + 15, infoStartY + 35);
    doc.fontSize(10).font("Helvetica").fillColor("#333").text(
      [emp.department, emp.projectName].filter(Boolean).join(" \u2014 ") || "\u2014",
      startX + colW + 15,
      infoStartY + 47
    );
    y += 105;
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Resumo de Trabalho", startX, y);
    y += 20;
    const boxW = pageW / 3;
    const boxes = [
      { label: "Dias Trabalhados", value: String(emp.daysWorked), unit: "dias" },
      { label: "Horas Totais", value: fmt2(emp.totalHours), unit: "horas" },
      { label: "Valor/Hora", value: `${fmt2(emp.hourlyRate)}\u20AC`, unit: "" }
    ];
    boxes.forEach((box, i) => {
      const bx = startX + i * boxW;
      doc.save();
      doc.roundedRect(bx + (i > 0 ? 5 : 0), y, boxW - 10, 55, 6).lineWidth(1).strokeColor("#e0e0e0").stroke();
      doc.restore();
      doc.fontSize(8).font("Helvetica").fillColor("#888").text(box.label, bx + (i > 0 ? 15 : 10), y + 10);
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a1a2e").text(box.value, bx + (i > 0 ? 15 : 10), y + 25);
      if (box.unit) {
        doc.fontSize(8).font("Helvetica").fillColor("#888").text(box.unit, bx + (i > 0 ? 15 : 10), y + 42);
      }
    });
    y += 70;
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e").text("Detalhes de Vencimento", startX, y);
    y += 20;
    doc.save();
    doc.rect(startX, y, pageW, 24).fillColor("#1a1a2e").fill();
    doc.restore();
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#ffffff");
    doc.text("Descri\xE7\xE3o", startX + 10, y + 7, { width: pageW * 0.55 });
    doc.text("Valor", startX + pageW * 0.55, y + 7, { width: pageW * 0.4, align: "right" });
    y += 24;
    const rows = [];
    if (emp.isExtra) {
      rows.push(["Pagamento por Horas (Extra)", `${fmt2(emp.extraPayment)} \u20AC`]);
      rows.push([`  ${fmt2(emp.totalHours)}h \xD7 ${fmt2(emp.hourlyRate)}\u20AC/h`, "", false]);
    } else {
      rows.push(["Sal\xE1rio Base", `${fmt2(emp.baseSalary)} \u20AC`]);
      if (emp.overtimeHours > 0) {
        rows.push(["Horas Extra", `${fmt2(emp.overtimePayment)} \u20AC`]);
        rows.push([`  ${fmt2(emp.overtimeHours)}h \xD7 ${fmt2(emp.hourlyRate * 1.25)}\u20AC/h (1.25\xD7)`, "", false]);
      }
      if (emp.thirteenthProvision > 0) {
        rows.push(["Provis\xE3o 13\xBA M\xEAs (Sub. Natal)", `${fmt2(emp.thirteenthProvision)} \u20AC`]);
        rows.push([`  1/12 do sal\xE1rio base`, "", false]);
      }
    }
    rows.forEach(([desc3, val, isBold], idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
      const rowH = 22;
      doc.save();
      doc.rect(startX, y, pageW, rowH).fillColor(bgColor).fill();
      doc.restore();
      if (isBold === false) {
        doc.fontSize(8).font("Helvetica").fillColor("#888").text(desc3, startX + 10, y + 6, { width: pageW * 0.55 });
      } else {
        doc.fontSize(9).font("Helvetica").fillColor("#333").text(desc3, startX + 10, y + 6, { width: pageW * 0.55 });
      }
      if (val) {
        doc.fontSize(9).font("Helvetica").fillColor("#333").text(val, startX + pageW * 0.55, y + 6, { width: pageW * 0.4, align: "right" });
      }
      y += rowH;
    });
    y += 5;
    doc.save();
    doc.rect(startX, y, pageW, 30).fillColor("#1a1a2e").fill();
    doc.restore();
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#ffffff").text("TOTAL A RECEBER", startX + 10, y + 9, { width: pageW * 0.55 });
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#ffffff").text(`${fmt2(emp.totalPayment)} \u20AC`, startX + pageW * 0.55, y + 8, { width: pageW * 0.4, align: "right" });
    y += 45;
    if (emp.nib) {
      doc.save();
      doc.roundedRect(startX, y, pageW, 40, 6).fillColor("#f0f4ff").fill();
      doc.restore();
      doc.fontSize(8).font("Helvetica").fillColor("#888").text("NIB / IBAN PARA TRANSFER\xCANCIA", startX + 15, y + 8);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a2e").text(emp.nib, startX + 15, y + 22);
      y += 55;
    }
    y = Math.max(y, doc.page.height - 160);
    doc.moveTo(startX, y).lineTo(startX + pageW, y).strokeColor("#ddd").lineWidth(0.5).stroke();
    y += 20;
    const sigW = (pageW - 40) / 2;
    doc.moveTo(startX, y + 40).lineTo(startX + sigW, y + 40).strokeColor("#ccc").lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("A Empresa", startX, y + 45, { width: sigW, align: "center" });
    doc.moveTo(startX + sigW + 40, y + 40).lineTo(startX + pageW, y + 40).strokeColor("#ccc").lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("O Trabalhador", startX + sigW + 40, y + 45, { width: sigW, align: "center" });
    y += 70;
    doc.fontSize(7).font("Helvetica").fillColor("#aaa").text(
      `Documento gerado automaticamente em ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")} \xE0s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-PT")} | Dashboard Multipark`,
      startX,
      y,
      { align: "center", width: pageW }
    );
    doc.end();
  });
}
async function generateAllPayslipsPdf(year, month) {
  const allPayroll = await getPayrollData(year, month);
  const results = [];
  for (const emp of allPayroll) {
    if (emp.totalHours === 0 && emp.totalPayment === 0) continue;
    const buffer = await generatePayslipPdf(year, month, emp.employeeId);
    results.push({ employeeId: emp.employeeId, fullName: emp.fullName, buffer });
  }
  return results;
}

// server/routers.ts
init_multipark();
init_multiparkBookingSync();
init_zello();
init_dailyDriverCollection();
var ROLE_HIERARCHY = {
  super_admin: 7,
  admin: 6,
  supervisor: 5,
  team_leader: 4,
  backoffice: 3,
  frontoffice: 2,
  extra: 1,
  user: 0
};
function requireRole(userRole, minRole) {
  if ((ROLE_HIERARCHY[userRole] ?? -1) < (ROLE_HIERARCHY[minRole] ?? 0)) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso n\xE3o autorizado." });
  }
}
async function applyMigration0044() {
  const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { MIGRATION_0044_STATEMENTS: MIGRATION_0044_STATEMENTS2, IDEMPOTENT_ERROR_CODES: IDEMPOTENT_ERROR_CODES2 } = await Promise.resolve().then(() => (init_migration_0044(), migration_0044_exports));
  const { sql: sql6 } = await import("drizzle-orm");
  const db2 = await getDb3();
  if (!db2) throw new Error("DB not available");
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  for (const stmt of MIGRATION_0044_STATEMENTS2) {
    try {
      await db2.execute(sql6.raw(stmt));
      ok += 1;
    } catch (err) {
      if (err?.code && IDEMPOTENT_ERROR_CODES2.has(err.code)) {
        skipped += 1;
      } else {
        failed += 1;
        errors.push(`${err?.code ?? "ERR"}: ${String(err?.message ?? err).slice(0, 200)}`);
      }
    }
  }
  return { ok, skipped, failed, errors };
}
async function applyMigration0046() {
  const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { MIGRATION_0046_STATEMENTS: MIGRATION_0046_STATEMENTS2, IDEMPOTENT_ERROR_CODES_0046: IDEMPOTENT_ERROR_CODES_00462 } = await Promise.resolve().then(() => (init_migration_0046(), migration_0046_exports));
  const { sql: sql6 } = await import("drizzle-orm");
  const db2 = await getDb3();
  if (!db2) throw new Error("DB not available");
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  for (const stmt of MIGRATION_0046_STATEMENTS2) {
    try {
      await db2.execute(sql6.raw(stmt));
      ok += 1;
    } catch (err) {
      if (err?.code && IDEMPOTENT_ERROR_CODES_00462.has(err.code)) {
        skipped += 1;
      } else {
        failed += 1;
        errors.push(`${err?.code ?? "ERR"}: ${String(err?.message ?? err).slice(0, 200)}`);
      }
    }
  }
  return { ok, skipped, failed, errors };
}
async function applyMigration0048() {
  const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { MIGRATION_0048_STATEMENTS: MIGRATION_0048_STATEMENTS2, IDEMPOTENT_ERROR_CODES_0048: IDEMPOTENT_ERROR_CODES_00482 } = await Promise.resolve().then(() => (init_migration_0048(), migration_0048_exports));
  const { sql: sql6 } = await import("drizzle-orm");
  const db2 = await getDb3();
  if (!db2) throw new Error("DB not available");
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  for (const stmt of MIGRATION_0048_STATEMENTS2) {
    try {
      await db2.execute(sql6.raw(stmt));
      ok += 1;
    } catch (err) {
      if (err?.code && IDEMPOTENT_ERROR_CODES_00482.has(err.code)) {
        skipped += 1;
      } else {
        failed += 1;
        errors.push(`${err?.code ?? "ERR"}: ${String(err?.message ?? err).slice(0, 200)}`);
      }
    }
  }
  return { ok, skipped, failed, errors };
}
var appRouter = router({
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
        details: `0044_rh_revamp: ok=${report.ok} skipped=${report.skipped} failed=${report.failed}`
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
        details: `0046_multipark_report_extra_fields: ok=${report.ok} skipped=${report.skipped} failed=${report.failed}`
      });
      return report;
    }),
    runMigration0048: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      const report = await applyMigration0048();
      await logActivity({
        userId: ctx.user.id,
        action: "migration",
        entity: "schema",
        details: `0048_campaign_daily_metrics: ok=${report.ok} skipped=${report.skipped} failed=${report.failed}`
      });
      return report;
    }),
    // Apaga um batch de duplicados em multipark_bookings. Cliente itera até
    // deleted === 0. Evita timeout do Vercel.
    fixMultiparkDuplicatesBatch: protectedProcedure.input(z2.object({ batchSize: z2.number().int().min(100).max(5e3).optional() }).optional()).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const batch = input?.batchSize ?? 1e3;
      const beforeRes = await db2.execute(sql6`SELECT COUNT(*) AS total FROM multipark_bookings`);
      const before = Array.isArray(beforeRes[0]) ? beforeRes[0] : beforeRes;
      const totalBefore = Number(before[0]?.total ?? 0);
      const delRes = await db2.execute(sql6`
          DELETE FROM multipark_bookings WHERE id IN (
            SELECT id FROM (
              SELECT b1.id FROM multipark_bookings b1
              INNER JOIN multipark_bookings b2
                ON b1.externalId = b2.externalId
               AND (
                     b1.updatedAt < b2.updatedAt
                  OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
               )
              LIMIT ${sql6.raw(String(batch))}
            ) AS t
          )
        `);
      const meta = Array.isArray(delRes[0]) ? delRes[0] : delRes;
      const affectedRows = Number(meta?.affectedRows ?? 0);
      const afterRes = await db2.execute(sql6`SELECT COUNT(*) AS total FROM multipark_bookings`);
      const after = Array.isArray(afterRes[0]) ? afterRes[0] : afterRes;
      const totalAfter = Number(after[0]?.total ?? 0);
      return {
        totalBefore,
        totalAfter,
        deleted: affectedRows || totalBefore - totalAfter,
        batchSize: batch
      };
    }),
    // Backfill: atribui um projeto fallback (default = "Multipark" se existir,
    // senão o primeiro grupo top-level) a todos os colaboradores activos sem
    // projectId. Devolve quantos foram afectados e qual o projeto usado.
    backfillEmployeeProject: protectedProcedure.input(z2.object({ projectId: z2.number().optional(), onlyExtras: z2.boolean().optional() }).optional()).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6, isNull: isNull3, and: andOp, eq: eq8 } = await import("drizzle-orm");
      const { employees: employees2, projects: projects2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const db2 = await getDb3();
      if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      let fallbackId = input?.projectId;
      let fallbackName = "";
      if (!fallbackId) {
        const allProjects = await db2.select().from(projects2);
        const mp = allProjects.find((p) => /^multipark$/i.test(p.name.trim()));
        if (mp) {
          fallbackId = mp.id;
          fallbackName = mp.name;
        } else {
          const top = allProjects.find((p) => p.level === "group");
          if (top) {
            fallbackId = top.id;
            fallbackName = top.name;
          }
        }
      } else {
        const [p] = await db2.select({ name: projects2.name }).from(projects2).where(eq8(projects2.id, fallbackId)).limit(1);
        fallbackName = p?.name ?? "";
      }
      if (!fallbackId) {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "N\xE3o h\xE1 projeto fallback. Cria um projeto top-level 'Multipark' ou indica projectId no input."
        });
      }
      const conds = [eq8(employees2.isActive, 1), isNull3(employees2.projectId)];
      if (input?.onlyExtras) conds.push(eq8(employees2.position, "extra"));
      const targetWhere = andOp(...conds);
      const beforeRes = await db2.select({ c: sql6`COUNT(*)` }).from(employees2).where(targetWhere);
      const before = Number(beforeRes[0]?.c ?? 0);
      await db2.update(employees2).set({ projectId: fallbackId }).where(targetWhere);
      await logActivity({
        userId: ctx.user.id,
        action: "backfill",
        entity: "employee",
        details: `Backfill projectId=${fallbackId} (${fallbackName})${input?.onlyExtras ? " [s\xF3 extras]" : ""} em ${before} colaboradores`
      });
      return { affected: before, projectId: fallbackId, projectName: fallbackName };
    }),
    // Backfill histórico: sincroniza UM dia (todas as actionTypes) +
    // enrich + history. Frontend itera dia-a-dia para o range pedido.
    // Cada chamada cabe nos 60s do Vercel para um dia tipico.
    runHistoricalDaySync: protectedProcedure.input(z2.object({ date: z2.string() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const { syncBookings: syncBookings2, enrichBookingsBatch: enrichBookingsBatch2, syncBookingHistoryBatch: syncBookingHistoryBatch2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
      const t0 = Date.now();
      const { enrichTargets: _enrichTargets, ...report } = await syncBookings2({
        startDate: input.date,
        endDate: input.date,
        triggeredById: ctx.user.id
      });
      const [enrichRes, historyRes] = await Promise.allSettled([
        enrichBookingsBatch2(100),
        syncBookingHistoryBatch2(50)
      ]);
      return {
        date: input.date,
        report,
        enriched: enrichRes.status === "fulfilled" ? enrichRes.value.enriched : 0,
        enrichScanned: enrichRes.status === "fulfilled" ? enrichRes.value.scanned : 0,
        historyFetched: historyRes.status === "fulfilled" ? historyRes.value.fetched : 0,
        durationMs: Date.now() - t0
      };
    }),
    // Reforça o UNIQUE depois dos batches terminarem.
    enforceMultiparkUnique: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const steps = [];
      try {
        await db2.execute(sql6`ALTER TABLE multipark_bookings DROP INDEX multipark_bookings_externalId_unique`);
        steps.push({ step: "drop_index", ok: true });
      } catch (e) {
        steps.push({ step: "drop_index", ok: false, error: e?.code ?? e?.message });
      }
      try {
        await db2.execute(sql6`ALTER TABLE multipark_bookings ADD UNIQUE INDEX multipark_bookings_externalId_unique (externalId)`);
        steps.push({ step: "create_unique", ok: true });
      } catch (e) {
        steps.push({ step: "create_unique", ok: false, error: e?.code ?? e?.message });
      }
      await logActivity({
        userId: ctx.user.id,
        action: "migration",
        entity: "schema",
        details: `enforceMultiparkUnique: ${JSON.stringify(steps)}`
      });
      return { steps };
    })
  }),
  // ── AUTH ────────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const u = opts.ctx.user;
      if (!u) return u;
      try {
        const emp = await getEmployeeByUserId(u.id);
        if (!emp) return { ...u, employee: null, docsStatus: null };
        let docsStatus = null;
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
            loginBlockedReason: emp.employee.loginBlockedReason
          },
          docsStatus
        };
      } catch {
        return u;
      }
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ── USERS ───────────────────────────────────────────────────────────────────
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return getAllUsers();
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      return getUserById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1, "Nome \xE9 obrigat\xF3rio"),
      email: z2.string().email("Email inv\xE1lido"),
      role: z2.string().default("user"),
      department: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const newUser = await createManualUser(input);
      await logActivity({
        userId: ctx.user.id,
        action: "create",
        entity: "user",
        entityId: newUser?.id,
        details: `Utilizador criado: ${input.name} (${input.email}) - Role: ${input.role}`
      });
      return newUser;
    }),
    update: protectedProcedure.input(z2.object({
      userId: z2.number(),
      name: z2.string().min(1).optional(),
      email: z2.string().email().optional(),
      role: z2.string().optional(),
      department: z2.string().nullable().optional()
    })).mutation(async ({ ctx, input }) => {
      const isSelf = ctx.user.id === input.userId;
      if (!isSelf) {
        requireRole(ctx.user.role, "super_admin");
      }
      const { userId, ...data } = input;
      const safeData = isSelf && ctx.user.role !== "super_admin" ? { name: data.name, email: data.email } : data;
      await updateUser(userId, safeData);
      await logActivity({
        userId: ctx.user.id,
        action: "update",
        entity: "user",
        entityId: userId,
        details: `Utilizador atualizado: ${JSON.stringify(safeData)}`
      });
      return { success: true };
    }),
    updateRole: protectedProcedure.input(z2.object({ userId: z2.number(), role: z2.string() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await updateUserRole(input.userId, input.role);
      await logActivity({
        userId: ctx.user.id,
        action: "update_role",
        entity: "user",
        entityId: input.userId,
        details: `Role alterado para ${input.role}`
      });
      return { success: true };
    }),
    toggleActive: protectedProcedure.input(z2.object({ userId: z2.number(), isActive: z2.boolean() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      if (input.userId === ctx.user.id) {
        throw new Error("N\xE3o podes desativar a tua pr\xF3pria conta");
      }
      await toggleUserActive(input.userId, input.isActive);
      await logActivity({
        userId: ctx.user.id,
        action: input.isActive ? "activate" : "deactivate",
        entity: "user",
        entityId: input.userId,
        details: input.isActive ? "Utilizador ativado" : "Utilizador desativado"
      });
      return { success: true };
    }),
    sendInvite: protectedProcedure.input(z2.object({
      userId: z2.number(),
      origin: z2.string()
      // frontend origin for building the invite link
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const targetUser = await getUserById(input.userId);
      if (!targetUser) throw new TRPCError3({ code: "NOT_FOUND", message: "Utilizador n\xE3o encontrado" });
      if (!targetUser.email) throw new TRPCError3({ code: "BAD_REQUEST", message: "Utilizador n\xE3o tem email" });
      const invite = await createInviteToken({
        email: targetUser.email,
        userId: targetUser.id,
        invitedById: ctx.user.id
      });
      const inviteLink = `${input.origin}/convite/${invite.token}`;
      await logActivity({
        userId: ctx.user.id,
        action: "create",
        entity: "invite",
        entityId: targetUser.id,
        details: `Convite enviado para ${targetUser.email}`
      });
      return {
        success: true,
        email: targetUser.email,
        inviteLink,
        token: invite.token,
        expiresAt: invite.expiresAt
      };
    }),
    getInvites: protectedProcedure.input(z2.object({ userId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      return getInvitesByUser(input.userId);
    }),
    acceptInvite: publicProcedure.input(z2.object({ token: z2.string() })).query(async ({ input }) => {
      const invite = await getInviteByToken(input.token);
      if (!invite) return { valid: false, reason: "Token inv\xE1lido" };
      if (invite.inviteStatus === "accepted") return { valid: false, reason: "Este convite j\xE1 foi utilizado" };
      if (/* @__PURE__ */ new Date() > new Date(invite.expiresAt)) return { valid: false, reason: "Este convite expirou" };
      return { valid: true, email: invite.email, userId: invite.userId };
    }),
    completeInvite: publicProcedure.input(z2.object({ token: z2.string() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Tens de fazer login primeiro" });
      const invite = await getInviteByToken(input.token);
      if (!invite) throw new TRPCError3({ code: "NOT_FOUND", message: "Token inv\xE1lido" });
      if (invite.inviteStatus === "accepted") throw new TRPCError3({ code: "BAD_REQUEST", message: "Convite j\xE1 utilizado" });
      if (/* @__PURE__ */ new Date() > new Date(invite.expiresAt)) throw new TRPCError3({ code: "BAD_REQUEST", message: "Convite expirado" });
      await linkInviteToOAuthUser(
        invite.userId,
        ctx.user.openId,
        ctx.user.name,
        ctx.user.email
      );
      await acceptInviteToken(input.token);
      return { success: true };
    })
  }),
  // ── PROJECTS ────────────────────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      return getProjects();
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getProjectById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      description: z2.string().optional(),
      parentId: z2.number().optional(),
      level: z2.enum(["group", "brand", "city", "project"]).default("project"),
      color: z2.string().optional(),
      managerId: z2.number().optional(),
      budget: z2.string().optional(),
      partnerName: z2.string().optional(),
      partnerPercent: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
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
        partnerPercent: input.partnerPercent ?? null
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "project", details: input.name });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      level: z2.enum(["group", "brand", "city", "project"]).optional(),
      color: z2.string().optional(),
      managerId: z2.number().nullable().optional(),
      budget: z2.string().nullable().optional(),
      partnerName: z2.string().nullable().optional(),
      partnerPercent: z2.string().nullable().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, ...data } = input;
      await updateProject(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "project", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteProject(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "project", entityId: input.id });
      return { success: true };
    }),
    // Move project to another parent
    move: protectedProcedure.input(z2.object({ id: z2.number(), newParentId: z2.number().nullable() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await moveProject(input.id, input.newParentId);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "project", entityId: input.id, details: `moved to parent:${input.newParentId}` });
      return { success: true };
    }),
    // Employee assignments
    getEmployees: protectedProcedure.input(z2.object({ projectId: z2.number() })).query(async ({ input }) => getProjectEmployees(input.projectId)),
    assignEmployee: protectedProcedure.input(z2.object({ projectId: z2.number(), employeeId: z2.number(), role: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await assignEmployeeToProject({ projectId: input.projectId, employeeId: input.employeeId, role: input.role ?? "member" });
      await logActivity({ userId: ctx.user.id, action: "assign", entity: "project_employee", entityId: input.projectId, details: `emp:${input.employeeId}` });
      return { success: true };
    }),
    removeEmployee: protectedProcedure.input(z2.object({ projectId: z2.number(), employeeId: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await removeEmployeeFromProject(input.projectId, input.employeeId);
      return { success: true };
    }),
    costs: protectedProcedure.input(z2.object({ year: z2.number().optional(), month: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getProjectCosts(input?.year, input?.month);
    })
  }),
  // ── TASKS (KANBAN) ────────────────────────────────────────────────────────────
  tasks: router({
    list: protectedProcedure.input(z2.object({ projectId: z2.number().optional(), assigneeId: z2.number().optional(), status: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      const { getTasksWithAssignees: getTasksWithAssignees2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me) return [];
        return getTasksWithAssignees2({ ...input ?? {}, assigneeId: me.employee.id });
      }
      return getTasksWithAssignees2(input ?? {});
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      const task = await getTaskById(input.id);
      if (!task) return null;
      const assignees = await getTaskAssignees(input.id);
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        const mine = me && (task.assigneeId === me.employee.id || assignees.some((a) => a.id === me.employee.id));
        if (!mine) throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
      }
      return { ...task, assignees };
    }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        const { getTasksWithAssignees: getTasksWithAssignees2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const mine = me ? await getTasksWithAssignees2({ assigneeId: me.employee.id }) : [];
        const now = /* @__PURE__ */ new Date();
        return {
          total: mine.length,
          backlog: mine.filter((t2) => t2.taskStatus === "backlog").length,
          todo: mine.filter((t2) => t2.taskStatus === "todo").length,
          inProgress: mine.filter((t2) => t2.taskStatus === "in_progress").length,
          review: mine.filter((t2) => t2.taskStatus === "review").length,
          done: mine.filter((t2) => t2.taskStatus === "done").length,
          overdue: mine.filter((t2) => t2.taskStatus !== "done" && t2.dueDate && new Date(t2.dueDate) < now).length
        };
      }
      return getTaskStats();
    }),
    getAssignees: protectedProcedure.input(z2.object({ taskId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getTaskAssignees(input.taskId);
    }),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      projectId: z2.number().optional(),
      assigneeId: z2.number().optional(),
      assigneeIds: z2.array(z2.number()).optional(),
      priority: z2.enum(["low", "medium", "high", "urgent"]).default("medium"),
      dueDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const primaryAssignee = input.assigneeIds?.[0] ?? input.assigneeId ?? null;
      const newId = await createTask({
        title: input.title,
        description: input.description ?? null,
        projectId: input.projectId ?? null,
        assigneeId: primaryAssignee,
        createdById: ctx.user.id,
        taskPriority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate).toISOString().slice(0, 19).replace("T", " ") : null
      });
      if (input.assigneeIds && input.assigneeIds.length > 0) {
        await setTaskAssignees(newId, input.assigneeIds);
      }
      await logActivity({ userId: ctx.user.id, action: "create", entity: "task", entityId: newId, details: input.title });
      return { id: newId };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      projectId: z2.number().nullable().optional(),
      assigneeId: z2.number().nullable().optional(),
      assigneeIds: z2.array(z2.number()).optional(),
      status: z2.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
      priority: z2.enum(["low", "medium", "high", "urgent"]).optional(),
      dueDate: z2.string().nullable().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, dueDate, assigneeIds, status, priority, ...rest } = input;
      const data = { ...rest };
      if (status !== void 0) data.taskStatus = status;
      if (priority !== void 0) data.taskPriority = priority;
      if (dueDate !== void 0) {
        data.dueDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace("T", " ") : null;
      }
      if (status === "done") {
        data.completedAt = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
        data.notifiedComplete = 0;
      }
      if (assigneeIds !== void 0) {
        data.assigneeId = assigneeIds[0] ?? null;
      }
      await updateTask(id, data);
      if (assigneeIds !== void 0) {
        await setTaskAssignees(id, assigneeIds);
      }
      await logActivity({ userId: ctx.user.id, action: "update", entity: "task", entityId: id, details: input.status ?? "" });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await deleteTask(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "task", entityId: input.id });
      return { success: true };
    }),
    // Check and send notifications for overdue/completed tasks
    checkNotifications: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      const { createNotification: createNotification2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
      const results = [];
      async function notifyAssignees(taskTitle, taskId, assignees, kind) {
        const link = `/tarefas?focus=${taskId}`;
        const title = kind === "overdue" ? `\u26A0\uFE0F Tarefa em atraso: ${taskTitle}` : `\u2705 Tarefa conclu\xEDda: ${taskTitle}`;
        for (const a of assignees) {
          const emp = a.employee;
          if (!emp) continue;
          if (emp.userId) {
            try {
              await createNotification2({
                userId: emp.userId,
                title,
                body: kind === "overdue" ? `A tarefa "${taskTitle}" ultrapassou o prazo.` : `A tarefa "${taskTitle}" foi marcada como conclu\xEDda.`,
                kind: "task",
                link
              });
            } catch (e) {
              console.warn("[tasks notify] in-app:", e);
            }
          }
          if (emp.email) {
            try {
              await sendEmail2({
                to: emp.email,
                subject: title,
                text: kind === "overdue" ? `Ol\xE1 ${emp.fullName ?? ""},

A tarefa "${taskTitle}" ultrapassou o prazo. Por favor verifica o seu estado.` : `Ol\xE1 ${emp.fullName ?? ""},

A tarefa "${taskTitle}" foi marcada como conclu\xEDda. Obrigado!`
              });
            } catch (e) {
              console.warn("[tasks notify] email:", e);
            }
          }
        }
      }
      const overdue = await getOverdueTasks();
      for (const task of overdue) {
        const assignees = await getTaskAssignees(task.id);
        const assigneeNames = assignees.map((a) => a.employee?.fullName ?? "?").join(", ");
        let managers = [];
        if (task.projectId) {
          const hierarchy = await getProjectHierarchyManagers(task.projectId);
          for (const h2 of hierarchy) {
            if (h2.managerId) {
              const mgr = await getUserById(h2.managerId);
              if (mgr) managers.push(`${mgr.name} (${h2.level})`);
            }
          }
        }
        await notifyOwner({
          title: `\u26A0\uFE0F Tarefa em atraso: ${task.title}`,
          content: `A tarefa "${task.title}" ultrapassou o prazo (${task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-PT") : "?"}).
Respons\xE1veis: ${assigneeNames || "Nenhum"}
Hierarquia: ${managers.join(" \u2192 ") || "N/A"}`
        });
        await notifyAssignees(task.title, task.id, assignees, "overdue");
        await markTaskNotified(task.id, "notifiedOverdue");
        results.push(`Overdue: ${task.title}`);
      }
      const completed = await getRecentlyCompletedTasks();
      for (const task of completed) {
        const assignees = await getTaskAssignees(task.id);
        const assigneeNames = assignees.map((a) => a.employee?.fullName ?? "?").join(", ");
        await notifyOwner({
          title: `\u2705 Tarefa conclu\xEDda: ${task.title}`,
          content: `A tarefa "${task.title}" foi conclu\xEDda.
Respons\xE1veis: ${assigneeNames || "Nenhum"}
Conclu\xEDda em: ${task.completedAt ? new Date(task.completedAt).toLocaleDateString("pt-PT") : "agora"}`
        });
        await notifyAssignees(task.title, task.id, assignees, "complete");
        await markTaskNotified(task.id, "notifiedComplete");
        results.push(`Completed: ${task.title}`);
      }
      return { notified: results.length, details: results };
    })
  }),
  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      await seedDefaultCategories();
      return getAllCategories();
    }),
    create: protectedProcedure.input(z2.object({ name: z2.string().min(1), department: z2.string().optional(), color: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await createCategory({ ...input, department: input.department ?? null, color: input.color ?? "#6366f1" });
      return { success: true };
    })
  }),
  // ── EXPENSES ────────────────────────────────────────────────────────────────
  expenses: router({
    list: protectedProcedure.input(
      z2.object({
        startDate: z2.string().optional(),
        endDate: z2.string().optional(),
        projectId: z2.number().optional(),
        categoryId: z2.number().optional(),
        userId: z2.number().optional(),
        status: z2.string().optional(),
        search: z2.string().optional()
      }).optional()
    ).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const filters = {};
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
      return getExpenses(filters);
    }),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getExpenseById(input.id);
    }),
    create: protectedProcedure.input(
      z2.object({
        supplier: z2.string().optional(),
        description: z2.string().optional(),
        amount: z2.string(),
        currency: z2.string().default("EUR"),
        paymentMethod: z2.enum(["cash", "card", "transfer", "check", "other"]).optional(),
        expenseDate: z2.string(),
        paymentDueDate: z2.string().nullable().optional(),
        categoryId: z2.number().optional(),
        // projectId obrigatório: cada despesa tem de ir para um centro
        // de custos (grupo / cidade / marca / projeto). O rollup
        // hierárquico do ProjectCostsDashboard agrega para cima.
        projectId: z2.number(),
        buyerId: z2.number().optional(),
        invoiceImageUrl: z2.string().optional(),
        invoiceImageKey: z2.string().optional(),
        extractedByAi: z2.boolean().default(false),
        notes: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const expense = await createExpense({
        supplier: input.supplier ?? null,
        description: input.description ?? null,
        amount: input.amount,
        currency: input.currency,
        paymentMethod: input.paymentMethod ?? null,
        expenseDate: new Date(input.expenseDate).toISOString().slice(0, 19).replace("T", " "),
        paymentDueDate: input.paymentDueDate && input.paymentDueDate !== "null" ? new Date(input.paymentDueDate).toISOString().slice(0, 19).replace("T", " ") : null,
        categoryId: input.categoryId ?? null,
        projectId: input.projectId,
        buyerId: input.buyerId ?? null,
        insertedById: ctx.user.id,
        invoiceImageUrl: input.invoiceImageUrl ?? null,
        invoiceImageKey: input.invoiceImageKey ?? null,
        extractedByAi: input.extractedByAi ? 1 : 0,
        notes: input.notes ?? null,
        status: "pending"
      });
      await logActivity({
        userId: ctx.user.id,
        action: "create",
        entity: "expense",
        entityId: void 0,
        details: `Despesa criada: ${input.supplier ?? "Sem fornecedor"} - ${input.amount}\u20AC`
      });
      if (input.paymentDueDate && input.paymentDueDate !== "null") {
        const admins = await getSuperAdmins();
        for (const admin of admins) {
          await notifyOwner({
            title: "Nova despesa com data de pagamento",
            content: `Despesa de ${input.amount}\u20AC (${input.supplier ?? "Sem fornecedor"}) com vencimento em ${new Date(input.paymentDueDate).toLocaleDateString("pt-PT")}.`
          });
        }
      }
      return { success: true };
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        supplier: z2.string().optional(),
        description: z2.string().optional(),
        amount: z2.string().optional(),
        paymentMethod: z2.enum(["cash", "card", "transfer", "check", "other"]).optional(),
        expenseDate: z2.string().optional(),
        paymentDueDate: z2.string().optional(),
        categoryId: z2.number().optional(),
        projectId: z2.number().optional(),
        status: z2.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
        notes: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const { id, expenseDate, paymentDueDate, ...rest } = input;
      const updateData = { ...rest };
      if (expenseDate) updateData.expenseDate = new Date(expenseDate);
      if (paymentDueDate) updateData.paymentDueDate = new Date(paymentDueDate);
      if (rest.status === "paid") updateData.paidAt = /* @__PURE__ */ new Date();
      await updateExpense(id, updateData);
      await logActivity({
        userId: ctx.user.id,
        action: "update",
        entity: "expense",
        entityId: id,
        details: `Despesa #${id} atualizada`
      });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deleteExpense(input.id);
      await logActivity({
        userId: ctx.user.id,
        action: "delete",
        entity: "expense",
        entityId: input.id,
        details: `Despesa #${input.id} eliminada`
      });
      return { success: true };
    }),
    // ── UPLOAD INVOICE ───────────────────────────────────────────────────────
    uploadInvoice: protectedProcedure.input(
      z2.object({
        fileName: z2.string(),
        fileBase64: z2.string(),
        mimeType: z2.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const suffix = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const key = `invoices/${ctx.user.id}/${suffix}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),
    // ── EXTRACT WITH LLM ─────────────────────────────────────────────────────
    extractFromImage: protectedProcedure.input(z2.object({ imageBase64: z2.string(), mimeType: z2.string().default("image/jpeg") })).mutation(async ({ input }) => {
      const imageUrl = `data:${input.mimeType};base64,${input.imageBase64}`;
      const llmMessages = [
        {
          role: "system",
          content: "\xC9s um assistente especializado em extrair dados de faturas. Analisa a imagem e extrai os dados estruturados. Responde APENAS em JSON v\xE1lido, sem markdown."
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            { type: "text", text: 'Extrai os dados desta fatura e devolve em JSON com os campos: supplier (nome do fornecedor), description (descri\xE7\xE3o dos produtos/servi\xE7os), amount (valor total como string num\xE9rica, ex: "45.90"), currency (moeda, ex: "EUR"), paymentMethod (cash/card/transfer/check/other), expenseDate (data da fatura em formato ISO YYYY-MM-DD), paymentDueDate (data de vencimento em formato ISO YYYY-MM-DD, ou null se n\xE3o existir). Se n\xE3o conseguires extrair um campo, usa null.' }
          ]
        }
      ];
      const response = await invokeLLM({
        messages: llmMessages,
        response_format: { type: "json_object" }
      });
      const rawContent = response.choices?.[0]?.message?.content;
      let content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Sem resposta do LLM" });
      content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();
      try {
        const parsed = JSON.parse(content);
        const sanitize = (v) => v === "null" || v === "undefined" || v === "" ? null : v;
        return {
          supplier: sanitize(parsed.supplier),
          description: sanitize(parsed.description),
          amount: sanitize(parsed.amount),
          currency: sanitize(parsed.currency) ?? "EUR",
          paymentMethod: sanitize(parsed.paymentMethod),
          expenseDate: sanitize(parsed.expenseDate),
          paymentDueDate: sanitize(parsed.paymentDueDate)
        };
      } catch {
        return { supplier: null, description: null, amount: null, currency: "EUR", paymentMethod: null, expenseDate: null, paymentDueDate: null };
      }
    }),
    // ── DASHBOARD STATS ──────────────────────────────────────────────────────
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getExpenseStats();
    }),
    // ── UPCOMING PAYMENTS ────────────────────────────────────────────────────
    upcomingPayments: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return getUpcomingPayments(7);
    }),
    // ── EXPORT EXCEL ─────────────────────────────────────────────────────────
    exportExcel: protectedProcedure.input(
      z2.object({
        startDate: z2.string().optional(),
        endDate: z2.string().optional(),
        projectId: z2.number().optional(),
        categoryId: z2.number().optional(),
        userId: z2.number().optional(),
        status: z2.string().optional(),
        search: z2.string().optional()
      }).optional()
    ).mutation(async ({ ctx, input }) => {
      const filters = {};
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
      const STATUS_MAP = {
        pending: "Pendente",
        paid: "Pago",
        overdue: "Em Atraso",
        cancelled: "Cancelado"
      };
      const METHOD_MAP = {
        cash: "Numer\xE1rio",
        card: "Cart\xE3o",
        transfer: "Transfer\xEAncia",
        check: "Cheque",
        other: "Outro"
      };
      const data = rows.map((r) => ({
        "Data": r.expense.expenseDate ? new Date(r.expense.expenseDate).toLocaleDateString("pt-PT") : "",
        "Fornecedor": r.expense.supplier ?? "",
        "Descri\xE7\xE3o": r.expense.description ?? "",
        "Valor (\u20AC)": parseFloat(String(r.expense.amount ?? 0)),
        "Moeda": r.expense.currency ?? "EUR",
        "M\xE9todo Pagamento": METHOD_MAP[r.expense.paymentMethod ?? ""] ?? r.expense.paymentMethod ?? "",
        "Estado": STATUS_MAP[r.expense.status ?? ""] ?? r.expense.status ?? "",
        "Categoria": r.category?.name ?? "",
        "Departamento": r.category?.department ?? "",
        "Projeto": r.project?.name ?? "",
        "Registado por": r.insertedBy?.name ?? "",
        "Data Vencimento": r.expense.paymentDueDate ? new Date(r.expense.paymentDueDate).toLocaleDateString("pt-PT") : "",
        "Data Pagamento": r.expense.paidAt ? new Date(r.expense.paidAt).toLocaleDateString("pt-PT") : "",
        "Extra\xEDdo por IA": r.expense.extractedByAi ? "Sim" : "N\xE3o",
        "Notas": r.expense.notes ?? ""
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((r) => String(r[key] ?? "").length)) + 2
      }));
      ws["!cols"] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Despesas");
      const totalAmount = data.reduce((s, r) => s + r["Valor (\u20AC)"], 0);
      const summaryData = [
        { "Resumo": "Total de Registos", "Valor": data.length },
        { "Resumo": "Total (\u20AC)", "Valor": totalAmount },
        { "Resumo": "Exportado em", "Valor": (/* @__PURE__ */ new Date()).toLocaleString("pt-PT") },
        { "Resumo": "Exportado por", "Valor": ctx.user.name ?? ctx.user.email ?? "" }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      const base64 = Buffer.from(buffer).toString("base64");
      return { base64, filename: `despesas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`, count: data.length };
    }),
    // ── CHECK OVERDUE ────────────────────────────────────────────────────────
    checkOverdue: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      await markOverdueExpenses();
      const overdue = await getOverdueExpenses();
      if (overdue.length > 0) {
        await notifyOwner({
          title: `\u26A0\uFE0F ${overdue.length} despesa(s) em atraso`,
          content: overdue.map(
            (o) => `\u2022 ${o.expense.supplier ?? "Sem fornecedor"}: ${o.expense.amount}\u20AC (venceu em ${o.expense.paymentDueDate ? new Date(o.expense.paymentDueDate).toLocaleDateString("pt-PT") : "\u2014"})`
          ).join("\n")
        });
      }
      return { updated: overdue.length };
    }),
    // Resumo de despesas de um período (para comparar períodos).
    summary: protectedProcedure.input(z2.object({ from: z2.string(), to: z2.string(), projectId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) return { total: 0, count: 0, byCategory: [] };
      const rows = (r) => Array.isArray(r[0]) ? r[0] : r;
      const projCond = input.projectId ? sql6` AND projectId = ${input.projectId}` : sql6``;
      const tot = rows(await db2.execute(sql6`SELECT COALESCE(SUM(amount),0) total, COUNT(*) cnt FROM expenses WHERE status <> 'cancelled' AND expenseDate >= ${input.from + " 00:00:00"} AND expenseDate <= ${input.to + " 23:59:59"}${projCond}`))[0];
      const byCat = rows(await db2.execute(sql6`SELECT categoryId, COALESCE(SUM(amount),0) total, COUNT(*) cnt FROM expenses WHERE status <> 'cancelled' AND expenseDate >= ${input.from + " 00:00:00"} AND expenseDate <= ${input.to + " 23:59:59"}${projCond} GROUP BY categoryId ORDER BY total DESC`));
      return {
        total: Number(tot?.total ?? 0),
        count: Number(tot?.cnt ?? 0),
        byCategory: byCat.map((r) => ({ categoryId: r.categoryId ?? null, total: Number(r.total), count: Number(r.cnt) }))
      };
    }),
    // ── Despesas recorrentes (modelos) ──
    recurring: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { recurringExpenses: recurringExpenses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { desc: desc3 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return [];
        return db2.select().from(recurringExpenses2).orderBy(desc3(recurringExpenses2.active));
      }),
      create: protectedProcedure.input(z2.object({ description: z2.string().optional(), supplier: z2.string().optional(), amount: z2.number(), paymentMethod: z2.enum(["cash", "card", "transfer", "check", "other"]).optional(), categoryId: z2.number().optional(), projectId: z2.number().optional(), dayOfMonth: z2.number().min(1).max(28).optional(), notes: z2.string().optional() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { recurringExpenses: recurringExpenses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.insert(recurringExpenses2).values({ description: input.description ?? null, supplier: input.supplier ?? null, amount: String(input.amount), paymentMethod: input.paymentMethod ?? "transfer", categoryId: input.categoryId ?? null, projectId: input.projectId ?? null, dayOfMonth: input.dayOfMonth ?? 1, notes: input.notes ?? null, createdById: ctx.user.id });
        return { success: true };
      }),
      update: protectedProcedure.input(z2.object({ id: z2.number(), description: z2.string().optional(), supplier: z2.string().optional(), amount: z2.number().optional(), paymentMethod: z2.enum(["cash", "card", "transfer", "check", "other"]).optional(), categoryId: z2.number().nullable().optional(), projectId: z2.number().nullable().optional(), dayOfMonth: z2.number().min(1).max(28).optional(), active: z2.boolean().optional(), notes: z2.string().optional() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { recurringExpenses: recurringExpenses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        const { id, amount, active, ...rest } = input;
        const patch = { ...rest };
        if (amount !== void 0) patch.amount = String(amount);
        if (active !== void 0) patch.active = active ? 1 : 0;
        await db2.update(recurringExpenses2).set(patch).where(eq8(recurringExpenses2.id, id));
        return { success: true };
      }),
      remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { recurringExpenses: recurringExpenses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.delete(recurringExpenses2).where(eq8(recurringExpenses2.id, input.id));
        return { success: true };
      }),
      // Idempotente: cria as despesas dos modelos ativos para o mês (se ainda não existem).
      generateMonth: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3, createExpense: createExpense2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { recurringExpenses: recurringExpenses2, expenses: expenses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8, and: and7, gte: gte5, lte: lte5 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return { created: 0 };
        const templates = await db2.select().from(recurringExpenses2).where(eq8(recurringExpenses2.active, 1));
        const monthStr = `${input.year}-${String(input.month).padStart(2, "0")}`;
        const lastDay = new Date(input.year, input.month, 0).getDate();
        let created = 0;
        for (const t2 of templates) {
          const existing = await db2.select({ id: expenses2.id }).from(expenses2).where(and7(
            eq8(expenses2.recurringTemplateId, t2.id),
            gte5(expenses2.expenseDate, `${monthStr}-01 00:00:00`),
            lte5(expenses2.expenseDate, `${monthStr}-${String(lastDay).padStart(2, "0")} 23:59:59`)
          )).limit(1);
          if (existing.length) continue;
          const day = Math.min(t2.dayOfMonth, lastDay);
          await createExpense2({
            supplier: t2.supplier,
            description: t2.description,
            amount: t2.amount,
            currency: t2.currency,
            paymentMethod: t2.paymentMethod,
            expenseDate: `${monthStr}-${String(day).padStart(2, "0")} 00:00:00`,
            status: "pending",
            categoryId: t2.categoryId,
            projectId: t2.projectId,
            insertedById: ctx.user.id,
            recurringTemplateId: t2.id,
            notes: t2.notes
          });
          created++;
        }
        return { created };
      })
    })
  }),
  // ── LOGSS ───────────────────────────────────────────────────────────────────────────────────
  logs: router({
    list: protectedProcedure.input(z2.object({
      limit: z2.number().int().min(1).max(2e3).optional(),
      entity: z2.string().optional(),
      action: z2.string().optional(),
      userId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      return getActivityLogs(input?.limit ?? 500, {
        entity: input?.entity,
        action: input?.action,
        userId: input?.userId
      });
    })
  }),
  // ── RH ───────────────────────────────────────────────────────────────────────────────────────
  rh: router({
    // ── MY PROFILE (for extra/low-role users) ──────────────────────────────────────────────────
    me: protectedProcedure.query(async ({ ctx }) => {
      return getEmployeeByUserId(ctx.user.id);
    }),
    // Resumo do mês actual para o próprio colaborador: horas + valor a receber.
    // Admin pode ver de outros passando employeeId; o próprio só vê o seu.
    myMonthSummary: protectedProcedure.input(z2.object({ employeeId: z2.number().optional(), year: z2.number().optional(), month: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      let employeeId = input?.employeeId;
      if (!employeeId) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me) throw new TRPCError3({ code: "NOT_FOUND", message: "Sem ficha de colaborador" });
        employeeId = me.employee.id;
      }
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me || me.employee.id !== employeeId) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
        }
      }
      const now = /* @__PURE__ */ new Date();
      const year = input?.year ?? now.getFullYear();
      const month = input?.month ?? now.getMonth() + 1;
      const payroll = await getPayrollData(year, month);
      const row = payroll.find((r) => r.employeeId === employeeId);
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
        netEstimate: row.netEstimate
      };
    }),
    // ── ROSTER MÍNIMO ──────────────────────────────────────────────────────────────────────────
    // Lista pública (id + fullName) para selectors em qualquer página
    // (atribuir responsáveis, condutores envolvidos, etc.). Sem requireRole
    // para que frontoffice/team_leader/extra possam usar dropdowns também.
    roster: protectedProcedure.input(z2.object({ activeOnly: z2.boolean().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      const rows = await getAllEmployees({ isActive: input?.activeOnly ?? true });
      return rows.map((row) => ({
        id: row.employee.id,
        fullName: row.employee.fullName
      }));
    }),
    // ── STATS ──────────────────────────────────────────────────────────────────────────────────
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      await seedExtraRates();
      return getHRStats();
    }),
    // ── EMPLOYEES ─────────────────────────────────────────────────────────────────────────────────
    list: protectedProcedure.input(z2.object({ isActive: z2.boolean().optional(), position: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getAllEmployees({ isActive: input?.isActive, position: input?.position });
    }),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const myEmployee = await getEmployeeByUserId(ctx.user.id);
        if (!myEmployee || myEmployee.employee.id !== input.id) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
        }
      }
      return getEmployeeById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      fullName: z2.string().min(1),
      email: z2.string().email(),
      multiparkAgentName: z2.string().min(1, "Nome Multipark \xE9 obrigat\xF3rio"),
      phone: z2.string().optional(),
      nif: z2.string().optional(),
      nib: z2.string().optional(),
      address: z2.string().optional(),
      birthDate: z2.string().optional(),
      nationality: z2.string().optional(),
      position: z2.enum(["director", "supervisor", "team_leader", "backoffice", "frontoffice", "senior_driver", "driver", "extra"]),
      extraLevel: z2.number().min(1).max(4).optional(),
      department: z2.string().optional(),
      projectId: z2.number({ message: "Centro de custos obrigat\xF3rio" }),
      contractType: z2.enum(["permanent", "fixed_term", "extra"]).optional(),
      contractStart: z2.string().optional(),
      contractEnd: z2.string().optional(),
      monthlySalary: z2.string().optional(),
      mealAllowancePerDay: z2.string().optional(),
      userId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      let userId = input.userId ?? null;
      if (!userId) {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          userId = existing.id;
        } else {
          const role = input.position === "extra" ? "extra" : "user";
          const created = await createManualUser({
            name: input.fullName,
            email: input.email,
            role
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
        isActive: 1
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "employee", details: `Colaborador criado: ${input.fullName}` });
      return { success: true, userId };
    }),
    importExtras: protectedProcedure.input(z2.object({ csv: z2.string().min(1) })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const report = await importExtrasFromCsv(input.csv, ctx.user.id);
      await logActivity({
        userId: ctx.user.id,
        action: "import",
        entity: "employee",
        details: `Import extras CSV: ${report.created} criados, ${report.errors.length} erros (de ${report.parsed} linhas)`
      });
      return report;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      fullName: z2.string().min(1).optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      nif: z2.string().optional(),
      nib: z2.string().optional(),
      address: z2.string().optional(),
      birthDate: z2.string().optional(),
      nationality: z2.string().optional(),
      photoUrl: z2.string().optional(),
      photoKey: z2.string().optional(),
      position: z2.enum(["director", "supervisor", "team_leader", "backoffice", "frontoffice", "senior_driver", "driver", "extra"]).optional(),
      extraLevel: z2.number().min(1).max(5).optional(),
      department: z2.string().optional(),
      projectId: z2.number().optional(),
      contractType: z2.enum(["permanent", "fixed_term", "extra"]).optional(),
      contractStart: z2.string().optional(),
      contractEnd: z2.string().optional(),
      monthlySalary: z2.string().optional(),
      mealAllowancePerDay: z2.string().optional(),
      userId: z2.number().nullable().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, birthDate, contractStart, contractEnd, ...rest } = input;
      const data = { ...rest };
      if (birthDate) data.birthDate = new Date(birthDate);
      if (contractStart) data.contractStart = new Date(contractStart);
      if (contractEnd) data.contractEnd = new Date(contractEnd);
      await updateEmployee(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "employee", entityId: id, details: `Colaborador atualizado: ${id}` });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteEmployee(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "employee", entityId: input.id, details: `Colaborador desativado: ${input.id}` });
      return { success: true };
    }),
    uploadPhoto: protectedProcedure.input(z2.object({ employeeId: z2.number(), fileBase64: z2.string(), mimeType: z2.string() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `employees/${input.employeeId}/photo-${Date.now()}.${ext}`;
      const { url } = await storagePut2(key, buffer, input.mimeType);
      await updateEmployee(input.employeeId, { photoUrl: url, photoKey: key });
      return { url, key };
    }),
    // ── DOCUMENTS ─────────────────────────────────────────────────────────────────────────────────
    documents: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getEmployeeDocuments(input.employeeId);
      }),
      upload: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        docType: z2.enum(["id_card", "residence_permit", "driving_license", "nib_proof", "address_proof", "contract", "extra_contract", "contract_annex", "responsibility_term", "work_accident_insurance", "photo", "other"]),
        label: z2.string().optional(),
        fileBase64: z2.string(),
        mimeType: z2.string(),
        fileName: z2.string()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `employees/${input.employeeId}/docs/${input.docType}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut2(key, buffer, input.mimeType);
        await createEmployeeDocument({
          employeeId: input.employeeId,
          docType: input.docType,
          label: input.label ?? input.fileName,
          fileUrl: url,
          fileKey: key,
          mimeType: input.mimeType,
          uploadedById: ctx.user.id
        });
        await logActivity({ userId: ctx.user.id, action: "upload", entity: "employee_document", entityId: input.employeeId, details: `Documento carregado: ${input.docType}` });
        return { url, key };
      }),
      uploadBatch: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        docType: z2.enum(["id_card", "residence_permit", "driving_license", "nib_proof", "address_proof", "contract", "extra_contract", "contract_annex", "responsibility_term", "work_accident_insurance", "photo", "other"]),
        files: z2.array(z2.object({
          fileBase64: z2.string(),
          mimeType: z2.string(),
          fileName: z2.string(),
          label: z2.string().optional()
        }))
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const results = [];
        for (const file of input.files) {
          const buffer = Buffer.from(file.fileBase64, "base64");
          const key = `employees/${input.employeeId}/docs/${input.docType}-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.fileName}`;
          const { url } = await storagePut2(key, buffer, file.mimeType);
          await createEmployeeDocument({
            employeeId: input.employeeId,
            docType: input.docType,
            label: file.label ?? file.fileName,
            fileUrl: url,
            fileKey: key,
            mimeType: file.mimeType,
            uploadedById: ctx.user.id
          });
          results.push({ url, key });
        }
        await logActivity({ userId: ctx.user.id, action: "upload", entity: "employee_document", entityId: input.employeeId, details: `${input.files.length} documentos carregados: ${input.docType}` });
        return results;
      }),
      checklist: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getDocumentChecklistForEmployee(input.employeeId);
      }),
      allStatus: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "frontoffice");
        const map = await getAllEmployeesDocumentStatus();
        const MANDATORY = ["photo", "id_card", "driving_license", "nib_proof", "address_proof", "contract", "responsibility_term"];
        const result = {};
        if (map instanceof Map) {
          map.forEach((types, empId) => {
            const missing = MANDATORY.filter((t2) => !types.has(t2));
            result[empId] = { total: MANDATORY.length, present: MANDATORY.length - missing.length, missing };
          });
        }
        return result;
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deleteEmployeeDocument(input.id);
        return { success: true };
      })
    }),
    // ── SCHEDULES ─────────────────────────────────────────────────────────────────────────────────
    schedules: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getEmployeeSchedules(input.employeeId);
      }),
      upsert: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        weekday: z2.number().min(0).max(6),
        startTime: z2.string(),
        endTime: z2.string(),
        isWorkDay: z2.boolean()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await upsertSchedule({ ...input, isWorkDay: input.isWorkDay ? 1 : 0 });
        return { success: true };
      }),
      delete: protectedProcedure.input(z2.object({ employeeId: z2.number(), weekday: z2.number().min(0).max(6) })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deleteSchedule(input.employeeId, input.weekday);
        return { success: true };
      })
    }),
    // ── TIME RECORDS ────────────────────────────────────────────────────────────────────────────────
    timeRecords: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number(), startDate: z2.string().optional(), endDate: z2.string().optional() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getTimeRecords(
          input.employeeId,
          input.startDate ? new Date(input.startDate) : void 0,
          input.endDate ? new Date(input.endDate) : void 0
        );
      }),
      checkIn: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        photoBase64: z2.string().optional(),
        mimeType: z2.string().optional(),
        latitude: z2.string().optional(),
        longitude: z2.string().optional(),
        locationName: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) {
            throw new TRPCError3({ code: "FORBIDDEN", message: "S\xF3 podes picar o teu pr\xF3prio ponto" });
          }
        }
        const recent = await getTimeRecords(input.employeeId);
        const last = recent[0];
        if (last && last.type === "check_in") {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "J\xE1 tens uma entrada em aberto. Faz check-out primeiro."
          });
        }
        let photoUrl = null;
        let photoKey = null;
        if (input.photoBase64 && input.mimeType) {
          const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const buffer = Buffer.from(input.photoBase64, "base64");
          const ext = input.mimeType.split("/")[1] ?? "jpg";
          const key = `employees/${input.employeeId}/ponto/${Date.now()}.${ext}`;
          const result = await storagePut2(key, buffer, input.mimeType);
          photoUrl = result.url;
          photoKey = key;
        }
        await createTimeRecord({
          employeeId: input.employeeId,
          type: "check_in",
          recordedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
          photoUrl,
          photoKey,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          locationName: input.locationName ?? null,
          notes: input.notes ?? null
        });
        await logActivity({ userId: ctx.user.id, action: "check_in", entity: "time_record", entityId: input.employeeId, details: `Check-in: ${input.locationName ?? ""}` });
        return { success: true };
      }),
      checkOut: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        photoBase64: z2.string().optional(),
        mimeType: z2.string().optional(),
        latitude: z2.string().optional(),
        longitude: z2.string().optional(),
        locationName: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) {
            throw new TRPCError3({ code: "FORBIDDEN", message: "S\xF3 podes picar o teu pr\xF3prio ponto" });
          }
        }
        const records = await getTimeRecords(input.employeeId);
        const last = records[0];
        if (!last || last.type !== "check_in") {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "N\xE3o tens entrada em aberto. Faz check-in primeiro."
          });
        }
        let photoUrl = null;
        let photoKey = null;
        if (input.photoBase64 && input.mimeType) {
          const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const buffer = Buffer.from(input.photoBase64, "base64");
          const ext = input.mimeType.split("/")[1] ?? "jpg";
          const key = `employees/${input.employeeId}/ponto/${Date.now()}-out.${ext}`;
          const result = await storagePut2(key, buffer, input.mimeType);
          photoUrl = result.url;
          photoKey = key;
        }
        const diff = ((/* @__PURE__ */ new Date()).getTime() - new Date(last.recordedAt).getTime()) / 36e5;
        const hoursWorked = diff.toFixed(2);
        await createTimeRecord({
          employeeId: input.employeeId,
          type: "check_out",
          recordedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
          photoUrl,
          photoKey,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          locationName: input.locationName ?? null,
          hoursWorked,
          notes: input.notes ?? null
        });
        await logActivity({ userId: ctx.user.id, action: "check_out", entity: "time_record", entityId: input.employeeId, details: `Check-out: ${hoursWorked}h` });
        return { success: true, hoursWorked };
      }),
      monthlyHours: protectedProcedure.input(z2.object({ employeeId: z2.number(), year: z2.number(), month: z2.number() })).query(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) {
            throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
          }
        }
        return getMonthlyHours(input.employeeId, input.year, input.month);
      })
    }),
    // ── PAYROLL ──────────────────────────────────────────────────────────────────────────────────
    payroll: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number().min(1).max(12) })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      return getPayrollData(input.year, input.month);
    }),
    payrollPdf: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number().min(1).max(12) })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const pdfBuffer = await generatePayrollPdf(input.year, input.month);
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const fileName = `folha_ordenados_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
      const key = `payroll/${fileName}_${Date.now()}.pdf`;
      const { url } = await storagePut2(key, pdfBuffer, "application/pdf");
      await savePayslipRecord({ year: input.year, month: input.month, payslipType: "payroll", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
      return { url, fileName };
    }),
    payslipPdf: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number().min(1).max(12), employeeId: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const pdfBuffer = await generatePayslipPdf(input.year, input.month, input.employeeId);
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const payrollData = await getPayrollData(input.year, input.month);
      const emp = payrollData.find((e) => e.employeeId === input.employeeId);
      const empName = emp?.fullName ?? `Funcion\xE1rio #${input.employeeId}`;
      const fileName = `recibo_${empName.replace(/[^a-zA-Z0-9]/g, "_")}_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
      const key = `payslips/${fileName}_${Date.now()}.pdf`;
      const { url } = await storagePut2(key, pdfBuffer, "application/pdf");
      await savePayslipRecord({ employeeId: input.employeeId, employeeName: empName, year: input.year, month: input.month, payslipType: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
      return { url };
    }),
    allPayslipsPdf: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number().min(1).max(12) })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const payslips = await generateAllPayslipsPdf(input.year, input.month);
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const results = [];
      for (const ps of payslips) {
        const safeName = ps.fullName.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `recibo_${safeName}_${input.year}_${String(input.month).padStart(2, "0")}.pdf`;
        const key = `payslips/${fileName}_${Date.now()}.pdf`;
        const { url } = await storagePut2(key, ps.buffer, "application/pdf");
        results.push({ employeeId: ps.employeeId, fullName: ps.fullName, url });
        await savePayslipRecord({ employeeId: ps.employeeId, employeeName: ps.fullName, year: input.year, month: input.month, payslipType: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
      }
      return { payslips: results, count: results.length };
    }),
    sendPayrollEmail: protectedProcedure.input(z2.object({ year: z2.number(), month: z2.number().min(1).max(12), email: z2.string().email() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const pdfBuffer = await generatePayrollPdf(input.year, input.month);
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const monthNames = ["Janeiro", "Fevereiro", "Mar\xE7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const monthName = monthNames[input.month - 1];
      const key = `payroll/folha_ordenados_${input.year}_${String(input.month).padStart(2, "0")}_${Date.now()}.pdf`;
      const { url } = await storagePut2(key, pdfBuffer, "application/pdf");
      const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
      await notifyOwner2({
        title: `Folha de Ordenados - ${monthName} ${input.year}`,
        content: `A folha de ordenados de ${monthName} ${input.year} foi gerada e est\xE1 pronta para enviar ao contabilista (${input.email}).

Link do PDF: ${url}`
      });
      return { url, email: input.email, monthName, year: input.year };
    }),
    // ── FÉRIAS / BAIXAS ────────────────────────────────────────────────────
    leaves: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number(), year: z2.number().optional() })).query(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
        }
        return getEmployeeLeaves(input.employeeId, input.year);
      }),
      create: protectedProcedure.input(z2.object({
        employeeId: z2.number(),
        leaveType: z2.enum(["vacation", "sick", "unpaid", "other"]),
        fromDate: z2.string(),
        toDate: z2.string(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await createEmployeeLeave({ ...input, createdById: ctx.user.id });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "employee_leave", entityId: input.employeeId, details: `${input.leaveType} ${input.fromDate}\u2192${input.toDate}` });
        return { success: true };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await deleteEmployeeLeave(input.id);
        return { success: true };
      })
    }),
    // ── HISTÓRICO SALARIAL ─────────────────────────────────────────────────
    salaryHistory: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me || me.employee.id !== input.employeeId) throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
      }
      return getEmployeeSalaryHistory(input.employeeId);
    }),
    // ── PENALIZAÇÕES ───────────────────────────────────────────────────────
    penalties: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
        if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
          const me = await getEmployeeByUserId(ctx.user.id);
          if (!me || me.employee.id !== input.employeeId) throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
        }
        return getOpenPenalties(input.employeeId);
      }),
      clear: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "supervisor");
        await clearPenalty(input.id, ctx.user.id);
        await logActivity({ userId: ctx.user.id, action: "clear", entity: "employee_penalty", entityId: input.id });
        return { success: true };
      }),
      processNoShows: protectedProcedure.input(z2.object({ date: z2.string() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const report = await processExtraDiaNoShows(input.date);
        await logActivity({ userId: ctx.user.id, action: "process_noshows", entity: "extras_dia", details: `${input.date}: ${report.created} penalties` });
        return report;
      })
    }),
    // ── BLOQUEIO LOGIN ─────────────────────────────────────────────────────
    unblock: protectedProcedure.input(z2.object({ employeeId: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      await unblockEmployeeLogin(input.employeeId, ctx.user.id);
      return { success: true };
    }),
    checkDocs: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me || me.employee.id !== input.employeeId) throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
      }
      return checkExtraDocsCompliance(input.employeeId);
    }),
    // ── DASHBOARD RH (super_admin) ─────────────────────────────────────────
    dashboard: protectedProcedure.input(z2.object({
      year: z2.number().optional(),
      month: z2.number().min(1).max(12).optional(),
      monthsLookback: z2.number().min(1).max(12).optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const now = /* @__PURE__ */ new Date();
      return getRhDashboardSummary(
        input?.year ?? now.getFullYear(),
        input?.month ?? now.getMonth() + 1,
        input?.monthsLookback ?? 3
      );
    }),
    // ── EXTRA RATES ─────────────────────────────────────────────────────────────────────────────────
    extraRates: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
        await seedExtraRates();
        return getExtraRates();
      }),
      update: protectedProcedure.input(z2.object({ level: z2.number(), hourlyRate: z2.string() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await updateExtraRate(input.level, input.hourlyRate);
        return { success: true };
      })
    })
  }),
  // ─── MARKETING ────────────────────────────────────────────────────────────
  marketing: router({
    dashboard: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const from = input?.from ? new Date(input.from) : void 0;
      const to = input?.to ? new Date(input.to) : void 0;
      return getMarketingDashboardStats({ from, to, projectId: input?.projectId });
    }),
    bookingRevenue: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingRevenueByProject({ from: input?.from, to: input?.to, projectId: input?.projectId });
    }),
    // ── CAMPAIGNS ──
    campaigns: router({
      list: protectedProcedure.input(z2.object({ platform: z2.string().optional(), projectId: z2.number().optional(), status: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getCampaigns({ platform: input?.platform, projectId: input?.projectId, status: input?.status });
      }),
      get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getCampaignById(input.id);
      }),
      create: protectedProcedure.input(z2.object({
        name: z2.string().min(1),
        platform: z2.enum(["google_ads", "meta_ads", "instagram", "other"]),
        projectId: z2.number().optional(),
        status: z2.enum(["active", "paused", "completed"]).optional(),
        startDate: z2.string().optional(),
        endDate: z2.string().optional(),
        budget: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
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
          createdById: ctx.user.id
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "campaign", entityId: id, details: `Campanha: ${input.name}` });
        return { id };
      }),
      update: protectedProcedure.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        platform: z2.enum(["google_ads", "meta_ads", "instagram", "other"]).optional(),
        projectId: z2.number().nullable().optional(),
        status: z2.enum(["active", "paused", "completed"]).optional(),
        startDate: z2.string().nullable().optional(),
        endDate: z2.string().nullable().optional(),
        budget: z2.string().nullable().optional(),
        notes: z2.string().nullable().optional()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { id, ...data } = input;
        const updateData = { ...data };
        if (data.startDate !== void 0) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
        if (data.endDate !== void 0) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        await updateCampaign(id, updateData);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "campaign", entityId: id, details: `Campanha atualizada` });
        return { success: true };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteCampaign(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "campaign", entityId: input.id, details: `Campanha eliminada` });
        return { success: true };
      })
    }),
    // ── CAMPANHAS INTERNAS (das reservas Multipark) ──
    // Campanha lógica agrupa várias chaves (campaignId do link, nome, ou padrão
    // de URL). Atribuição "uma vez": detecta chaves novas, utilizador atribui.
    internalCampaigns: router({
      // Chaves ainda NÃO atribuídas: campaignId (do originUrl) + campaignName não-parceiro.
      detect: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sql: sql6 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return { ids: [], names: [] };
        const rows = (r) => Array.isArray(r[0]) ? r[0] : r;
        const linksRes = await db2.execute(sql6`
          SELECT originUrl AS value, COUNT(*) AS bookings, COALESCE(SUM(totalPrice),0) AS revenue
          FROM multipark_bookings
          WHERE originUrl IS NOT NULL AND originUrl <> ''
            AND NOT EXISTS (
              SELECT 1 FROM internal_campaign_keys k
              WHERE k.keyType = 'url_pattern' AND multipark_bookings.originUrl LIKE k.keyValue
            )
          GROUP BY originUrl ORDER BY bookings DESC LIMIT 250`);
        const namesRes = await db2.execute(sql6`
          SELECT campaignName AS value, COUNT(*) AS bookings, COALESCE(SUM(totalPrice),0) AS revenue
          FROM multipark_bookings
          WHERE campaignName IS NOT NULL AND campaignName <> ''
            AND campaignName NOT IN (SELECT name FROM partnerships)
            AND campaignName NOT IN (SELECT keyValue FROM internal_campaign_keys WHERE keyType='campaign_name')
          GROUP BY campaignName ORDER BY bookings DESC`);
        return { links: rows(linksRes), names: rows(namesRes) };
      }),
      // Campanhas lógicas + chaves + custos + métricas (reservas/receita/gasto).
      list: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sql: sql6 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return [];
        const rows = (r) => Array.isArray(r[0]) ? r[0] : r;
        const internal = rows(await db2.execute(sql6`SELECT id, name, projectId, dailyBudget, city, brand, campaignStatus FROM internal_campaigns ORDER BY name`)).map((c) => ({ ...c, campaignType: "internal" }));
        const ad = rows(await db2.execute(sql6`SELECT id, name, projectId, budget AS dailyBudget, platform AS brand, campaignStatus FROM campaigns ORDER BY name`)).map((c) => ({ ...c, city: null, campaignType: "ad" }));
        const periodDays = input?.from && input?.to ? Math.max(1, Math.floor((Date.parse(input.to) - Date.parse(input.from)) / 864e5) + 1) : 0;
        const projs = rows(await db2.execute(sql6`SELECT id, name FROM projects`));
        const projName = new Map(projs.map((p) => [p.id, p.name]));
        const camps = [...internal, ...ad].map((c) => ({ ...c, projectName: c.projectId ? projName.get(c.projectId) ?? null : null }));
        const allKeys = rows(await db2.execute(sql6`SELECT * FROM internal_campaign_keys`));
        const dateCond = input?.from && input?.to ? sql6` AND checkIn >= ${input.from + " 00:00:00"} AND checkIn <= ${input.to + " 23:59:59"}` : sql6``;
        const out = [];
        for (const c of camps) {
          const keys = allKeys.filter((k) => k.campaignType === c.campaignType && k.campaignId === c.id);
          const conds = [];
          const names = keys.filter((k) => k.keyType === "campaign_name").map((k) => k.keyValue);
          if (names.length) conds.push(sql6`campaignName IN (${sql6.join(names.map((v) => sql6`${v}`), sql6`, `)})`);
          for (const k of keys.filter((k2) => k2.keyType === "campaign_id")) conds.push(sql6`originUrl LIKE ${"%campaignId=" + k.keyValue + "%"}`);
          for (const k of keys.filter((k2) => k2.keyType === "url_pattern")) conds.push(sql6`originUrl LIKE ${k.keyValue}`);
          let bookings = 0, revenue = 0;
          if (conds.length) {
            const m = rows(await db2.execute(sql6`SELECT COUNT(*) AS c, COALESCE(SUM(totalPrice),0) AS rev FROM multipark_bookings WHERE (${sql6.join(conds, sql6` OR `)})${dateCond}`))[0];
            bookings = Number(m?.c ?? 0);
            revenue = Number(m?.rev ?? 0);
          }
          const costRow = rows(await db2.execute(sql6`SELECT COALESCE(SUM(amount),0) AS spend, SUM(impressions) AS impressions, SUM(clicks) AS clicks, SUM(conversions) AS conversions, SUM(conversionValue) AS conversionValue, AVG(ctr) AS avgCtr FROM internal_campaign_costs WHERE campaignType = ${c.campaignType} AND campaignId = ${c.id}${input?.from && input?.to ? sql6` AND costDate >= ${input.from} AND costDate <= ${input.to}` : sql6``}`))[0];
          const manualSpend = Number(costRow?.spend ?? 0);
          const impressions = costRow?.impressions != null ? Number(costRow.impressions) : null;
          const clicks = costRow?.clicks != null ? Number(costRow.clicks) : null;
          const conversions = costRow?.conversions != null ? Number(costRow.conversions) : null;
          const conversionValue = costRow?.conversionValue != null ? Number(costRow.conversionValue) : null;
          const ctr = impressions && clicks != null ? Math.round(clicks / impressions * 1e5) / 1e3 : costRow?.avgCtr != null ? Math.round(Number(costRow.avgCtr) * 1e3) / 1e3 : null;
          let realStatsSpend = 0;
          if (c.campaignType === "ad" && input?.from && input?.to) {
            const r = rows(await db2.execute(sql6`SELECT COALESCE(SUM(spend),0) AS s FROM campaign_daily_stats WHERE campaignId = ${c.id} AND date >= ${input.from + " 00:00:00"} AND date <= ${input.to + " 23:59:59"}`))[0];
            realStatsSpend = Number(r?.s ?? 0);
          }
          const budgetSpend = c.dailyBudget && periodDays > 0 ? Number(c.dailyBudget) * periodDays : 0;
          const spend = realStatsSpend > 0 ? realStatsSpend : manualSpend > 0 ? manualSpend : budgetSpend;
          const spendEstimated = realStatsSpend === 0 && manualSpend === 0 && budgetSpend > 0;
          out.push({ ...c, dailyBudget: c.dailyBudget != null ? Number(c.dailyBudget) : null, keys, bookings, revenue, spend, spendEstimated, costPerBooking: bookings > 0 ? spend / bookings : 0, roas: spend > 0 ? revenue / spend : null, impressions, clicks, ctr, conversions, conversionValue });
        }
        out.sort((a, b) => (b.keys.length || b.bookings) - (a.keys.length || a.bookings));
        return out;
      }),
      create: protectedProcedure.input(z2.object({ name: z2.string().min(1), projectId: z2.number().optional(), dailyBudget: z2.number().optional(), city: z2.string().optional(), brand: z2.string().optional() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaigns: internalCampaigns2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.insert(internalCampaigns2).values({ name: input.name, projectId: input.projectId ?? null, dailyBudget: input.dailyBudget != null ? String(input.dailyBudget) : null, city: input.city ?? null, brand: input.brand ?? null, createdById: ctx.user.id });
        return { success: true };
      }),
      update: protectedProcedure.input(z2.object({ id: z2.number(), name: z2.string().optional(), projectId: z2.number().nullable().optional(), dailyBudget: z2.number().nullable().optional(), city: z2.string().optional(), brand: z2.string().optional(), campaignStatus: z2.enum(["active", "paused", "completed"]).optional() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaigns: internalCampaigns2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        const { id, ...rest } = input;
        await db2.update(internalCampaigns2).set(rest).where(eq8(internalCampaigns2.id, id));
        return { success: true };
      }),
      // Para ad campaigns só desliga (apaga chaves/custos desta vista); a campanha
      // em si é gerida na tab "Campanhas". Para internas apaga tudo.
      remove: protectedProcedure.input(z2.object({ campaignType: z2.enum(["internal", "ad"]), id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaigns: internalCampaigns2, internalCampaignKeys: internalCampaignKeys2, internalCampaignCosts: internalCampaignCosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8, and: and7 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.delete(internalCampaignKeys2).where(and7(eq8(internalCampaignKeys2.campaignType, input.campaignType), eq8(internalCampaignKeys2.campaignId, input.id)));
        await db2.delete(internalCampaignCosts2).where(and7(eq8(internalCampaignCosts2.campaignType, input.campaignType), eq8(internalCampaignCosts2.campaignId, input.id)));
        if (input.campaignType === "internal") await db2.delete(internalCampaigns2).where(eq8(internalCampaigns2.id, input.id));
        return { success: true };
      }),
      // Atribui uma chave detetada a uma campanha (a tal "atribuição uma vez").
      assignKey: protectedProcedure.input(z2.object({ campaignType: z2.enum(["internal", "ad"]), campaignId: z2.number(), keyType: z2.enum(["campaign_id", "campaign_name", "url_pattern"]), keyValue: z2.string().min(1) })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaignKeys: internalCampaignKeys2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.insert(internalCampaignKeys2).values({ campaignType: input.campaignType, campaignId: input.campaignId, keyType: input.keyType, keyValue: input.keyValue });
        return { success: true };
      }),
      removeKey: protectedProcedure.input(z2.object({ keyId: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaignKeys: internalCampaignKeys2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.delete(internalCampaignKeys2).where(eq8(internalCampaignKeys2.id, input.keyId));
        return { success: true };
      }),
      addCost: protectedProcedure.input(z2.object({
        campaignType: z2.enum(["internal", "ad"]),
        campaignId: z2.number(),
        costDate: z2.string(),
        amount: z2.number(),
        impressions: z2.number().nullable().optional(),
        clicks: z2.number().nullable().optional(),
        ctr: z2.number().nullable().optional(),
        conversions: z2.number().nullable().optional(),
        conversionValue: z2.number().nullable().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sql: sql6 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        const impressions = input.impressions ?? null;
        const clicks = input.clicks ?? null;
        const ctr = input.ctr ?? (clicks != null && impressions ? Math.round(clicks / impressions * 1e5) / 1e3 : null);
        const conversions = input.conversions ?? null;
        const conversionValue = input.conversionValue ?? null;
        await db2.execute(sql6`
            INSERT INTO internal_campaign_costs (campaignType, campaignId, costDate, amount, impressions, clicks, ctr, conversions, conversionValue, notes, createdById)
            VALUES (${input.campaignType}, ${input.campaignId}, ${input.costDate}, ${input.amount}, ${impressions}, ${clicks}, ${ctr}, ${conversions}, ${conversionValue}, ${input.notes ?? null}, ${ctx.user.id})
            ON DUPLICATE KEY UPDATE
              amount = ${input.amount},
              impressions = COALESCE(${impressions}, impressions),
              clicks = COALESCE(${clicks}, clicks),
              ctr = COALESCE(${ctr}, ctr),
              conversions = COALESCE(${conversions}, conversions),
              conversionValue = COALESCE(${conversionValue}, conversionValue),
              notes = COALESCE(${input.notes ?? null}, notes)`);
        return { success: true };
      }),
      // Custos/métricas de TODAS as campanhas num dia — para o diálogo "Atualizar campanhas".
      costsByDate: protectedProcedure.input(z2.object({ costDate: z2.string() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaignCosts: internalCampaignCosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return [];
        return db2.select().from(internalCampaignCosts2).where(eq8(internalCampaignCosts2.costDate, input.costDate));
      }),
      costs: protectedProcedure.input(z2.object({ campaignType: z2.enum(["internal", "ad"]), campaignId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaignCosts: internalCampaignCosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8, and: and7, desc: desc3 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) return [];
        return db2.select().from(internalCampaignCosts2).where(and7(eq8(internalCampaignCosts2.campaignType, input.campaignType), eq8(internalCampaignCosts2.campaignId, input.campaignId))).orderBy(desc3(internalCampaignCosts2.costDate));
      }),
      removeCost: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { internalCampaignCosts: internalCampaignCosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8 } = await import("drizzle-orm");
        const db2 = await getDb3();
        if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
        await db2.delete(internalCampaignCosts2).where(eq8(internalCampaignCosts2.id, input.id));
        return { success: true };
      })
    }),
    // ── DAILY STATS ──
    stats: router({
      byCampaign: protectedProcedure.input(z2.object({ campaignId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getCampaignStats(input.campaignId);
      }),
      all: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        const from = input?.from ? new Date(input.from) : void 0;
        const to = input?.to ? new Date(input.to) : void 0;
        return getAllDailyStats({ from, to, projectId: input?.projectId });
      }),
      import: protectedProcedure.input(z2.object({
        campaignId: z2.number(),
        rows: z2.array(z2.object({
          date: z2.string(),
          spend: z2.string(),
          impressions: z2.number().optional(),
          clicks: z2.number().optional(),
          conversions: z2.number().optional(),
          conversionValue: z2.string().optional()
        }))
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const rows = input.rows.map((r) => ({
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
          importedById: ctx.user.id
        }));
        await importDailyStats(rows);
        await logActivity({ userId: ctx.user.id, action: "import", entity: "campaign_stats", entityId: input.campaignId, details: `${rows.length} registos importados` });
        return { count: rows.length };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteDailyStat(input.id);
        return { success: true };
      }),
      // ── IMPORTAÇÃO GOOGLE ADS CSV (com dedup) ──
      importGoogleAdsReport: protectedProcedure.input(z2.object({
        dateRange: z2.object({ start: z2.string(), end: z2.string() }),
        campaigns: z2.array(z2.object({
          name: z2.string(),
          status: z2.enum(["active", "paused", "completed"]),
          budget: z2.number(),
          campaignType: z2.string(),
          impressions: z2.number(),
          interactions: z2.number(),
          cost: z2.number(),
          clicks: z2.number(),
          conversions: z2.number(),
          cpc: z2.number(),
          ctr: z2.number(),
          costPerConversion: z2.number()
        }))
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const startDate = new Date(input.dateRange.start);
        const endDate = new Date(input.dateRange.end);
        let created = 0;
        let updated = 0;
        let skipped = 0;
        const details = [];
        for (const c of input.campaigns) {
          if (c.cost === 0 && c.clicks === 0 && c.impressions === 0) {
            let campaign2 = await getCampaignByNameAndPlatform(c.name, "google_ads");
            if (!campaign2) {
              const id = await createCampaign({
                name: c.name,
                platform: "google_ads",
                campaignStatus: c.status,
                budget: c.budget > 0 ? String(c.budget) : null,
                notes: `Tipo: ${c.campaignType}`,
                createdById: ctx.user.id
              });
              details.push(`\u2705 Campanha criada (sem dados): ${c.name}`);
            }
            skipped++;
            continue;
          }
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
              createdById: ctx.user.id
            });
            campaign = await getCampaignById(id);
            details.push(`\u2705 Campanha criada: ${c.name}`);
          } else {
            await updateCampaign(campaign.id, {
              campaignStatus: c.status,
              budget: c.budget > 0 ? String(c.budget) : campaign.budget
            });
          }
          if (!campaign) {
            skipped++;
            continue;
          }
          const daysMs = 864e5;
          const dayCount = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / daysMs) + 1);
          const spendPerDay = c.cost / dayCount;
          const impressionsPerDay = Math.floor(c.impressions / dayCount);
          const clicksPerDay = Math.floor(c.clicks / dayCount);
          const conversionsPerDay = c.conversions / dayCount;
          const valuePerDay = c.conversions * c.costPerConversion / dayCount;
          const existing = await getExistingStatsForCampaignAndDateRange(campaign.id, startDate, endDate);
          const existingDays = new Set(
            existing.map((e) => new Date(e.date).toISOString().slice(0, 10))
          );
          const newRows = [];
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
              importedById: ctx.user.id
            });
          }
          if (newRows.length === 0) {
            details.push(`\u26A0\uFE0F ${c.name}: todos os dias do per\xEDodo j\xE1 existiam \u2014 ignorado`);
            skipped++;
            continue;
          }
          await importDailyStats(newRows);
          created++;
          const skippedDays = dayCount - newRows.length;
          details.push(`\u{1F4CA} ${c.name}: ${newRows.length}/${dayCount} dias importados (${c.cost.toFixed(2)}\u20AC total, ${c.clicks} cliques)${skippedDays > 0 ? ` \u2014 ${skippedDays} dias j\xE1 existiam` : ""}`);
        }
        await logActivity({
          userId: ctx.user.id,
          action: "import",
          entity: "google_ads_report",
          entityId: 0,
          details: `Google Ads ${input.dateRange.start} a ${input.dateRange.end}: ${created} importados, ${skipped} ignorados`
        });
        return { created, updated, skipped, details, total: input.campaigns.length };
      })
    }),
    // ── MARKETING EXPENSES ──
    expenses: router({
      list: protectedProcedure.input(z2.object({ category: z2.string().optional(), projectId: z2.number().optional(), from: z2.string().optional(), to: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "frontoffice");
        return getMarketingExpenses({
          category: input?.category,
          projectId: input?.projectId,
          from: input?.from ? new Date(input.from) : void 0,
          to: input?.to ? new Date(input.to) : void 0
        });
      }),
      create: protectedProcedure.input(z2.object({
        description: z2.string().min(1),
        category: z2.enum(["google_ads", "meta_ads", "influencer", "print", "merchandise", "event", "other"]),
        amount: z2.string(),
        date: z2.string(),
        projectId: z2.number().optional(),
        supplier: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const id = await createMarketingExpense({
          description: input.description,
          mktCategory: input.category,
          amount: input.amount,
          date: new Date(input.date).toISOString().slice(0, 19).replace("T", " "),
          projectId: input.projectId ?? null,
          supplier: input.supplier ?? null,
          notes: input.notes ?? null,
          createdById: ctx.user.id
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "marketing_expense", entityId: id, details: `${input.description}: ${input.amount}\u20AC` });
        return { id };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteMarketingExpense(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "marketing_expense", entityId: input.id, details: `Despesa marketing eliminada` });
        return { success: true };
      })
    })
  }),
  // ─── OPERACIONAL ──────────────────────────────────────────────────────────
  operational: router({
    dashboard: protectedProcedure.query(async () => {
      return getOperationalStats();
    }),
    vehicles: router({
      list: protectedProcedure.input(z2.object({ status: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ input }) => {
        return getVehicles(input ?? void 0);
      }),
      get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
        return getVehicleById(input.id);
      }),
      create: protectedProcedure.input(z2.object({
        plate: z2.string().min(1),
        brand: z2.string().optional(),
        model: z2.string().optional(),
        year: z2.number().optional(),
        color: z2.string().optional(),
        status: z2.enum(["active", "maintenance", "inactive"]).optional(),
        projectId: z2.number().optional(),
        notes: z2.string().optional()
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
          notes: input.notes ?? null
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "vehicle", entityId: id, details: `Viatura ${input.plate}` });
        return { id };
      }),
      update: protectedProcedure.input(z2.object({
        id: z2.number(),
        data: z2.object({
          plate: z2.string().optional(),
          brand: z2.string().optional(),
          model: z2.string().optional(),
          year: z2.number().optional(),
          color: z2.string().optional(),
          status: z2.enum(["active", "maintenance", "inactive"]).optional(),
          projectId: z2.number().nullable().optional(),
          notes: z2.string().optional()
        })
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const { status, ...rest } = input.data;
        await updateVehicle(input.id, { ...rest, ...status !== void 0 && { vehicleStatus: status } });
        await logActivity({ userId: ctx.user.id, action: "update", entity: "vehicle", entityId: input.id, details: "Viatura atualizada" });
        return { success: true };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
        await deleteVehicle(input.id);
        await logActivity({ userId: ctx.user.id, action: "delete", entity: "vehicle", entityId: input.id, details: "Viatura eliminada" });
        return { success: true };
      }),
      driverHistory: protectedProcedure.input(z2.object({ vehicleId: z2.number() })).query(async ({ input }) => {
        return getVehicleDriverHistory(input.vehicleId);
      })
    }),
    movements: router({
      list: protectedProcedure.input(z2.object({ vehicleId: z2.number().optional(), employeeId: z2.number().optional(), limit: z2.number().optional() }).optional()).query(async ({ input }) => {
        return getVehicleMovements(input ?? void 0);
      }),
      create: protectedProcedure.input(z2.object({
        vehicleId: z2.number(),
        employeeId: z2.number(),
        type: z2.enum(["pickup", "return"]),
        kmReading: z2.number().optional(),
        latitude: z2.string().optional(),
        longitude: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        const id = await createVehicleMovement({
          vehicleId: input.vehicleId,
          employeeId: input.employeeId,
          movementType: input.type,
          kmReading: input.kmReading ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          notes: input.notes ?? null
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "vehicle_movement", entityId: id, details: `${input.type === "pickup" ? "Recolha" : "Devolu\xE7\xE3o"} viatura #${input.vehicleId}` });
        return { id };
      })
    }),
    speedAlerts: router({
      list: protectedProcedure.input(z2.object({ vehicleId: z2.number().optional(), acknowledged: z2.boolean().optional(), limit: z2.number().optional() }).optional()).query(async ({ input }) => {
        return getSpeedAlerts(input ?? void 0);
      }),
      create: protectedProcedure.input(z2.object({
        vehicleId: z2.number(),
        employeeId: z2.number().optional(),
        speed: z2.number(),
        speedLimit: z2.number(),
        latitude: z2.string().optional(),
        longitude: z2.string().optional(),
        roadName: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        const id = await createSpeedAlert({
          vehicleId: input.vehicleId,
          employeeId: input.employeeId ?? null,
          speed: input.speed,
          speedLimit: input.speedLimit,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          roadName: input.roadName ?? null
        });
        const admins = await getSuperAdmins();
        if (admins.length > 0) {
          await notifyOwner({ title: "Alerta de Velocidade", content: `Viatura #${input.vehicleId} a ${input.speed} km/h (limite: ${input.speedLimit} km/h)${input.roadName ? " em " + input.roadName : ""}` });
        }
        await logActivity({ userId: ctx.user.id, action: "create", entity: "speed_alert", entityId: id, details: `${input.speed}km/h (limite ${input.speedLimit}km/h)` });
        return { id };
      }),
      acknowledge: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        await acknowledgeSpeedAlert(input.id, ctx.user.id);
        return { success: true };
      })
    }),
    radio: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number().optional(), vehicleId: z2.number().optional(), limit: z2.number().optional() }).optional()).query(async ({ input }) => {
        return getRadioTranscriptions(input ?? void 0);
      }),
      transcribe: protectedProcedure.input(z2.object({
        audioUrl: z2.string(),
        employeeId: z2.number().optional(),
        vehicleId: z2.number().optional(),
        duration: z2.number().optional()
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        const result = await transcribeAudio({ audioUrl: input.audioUrl, language: "pt" });
        if ("error" in result) {
          throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: `Transcri\xE7\xE3o falhou: ${result.error}` });
        }
        const transcriptionText = result.text;
        const summary = await invokeLLM({
          messages: [
            { role: "system", content: "Resume a seguinte transcri\xE7\xE3o de r\xE1dio em 1-2 frases curtas em portugu\xEAs. Foca nos pontos operacionais relevantes." },
            { role: "user", content: transcriptionText }
          ]
        });
        const summaryText = typeof summary.choices[0].message.content === "string" ? summary.choices[0].message.content : "";
        const id = await createRadioTranscription({
          audioUrl: input.audioUrl,
          transcription: transcriptionText,
          summary: summaryText,
          employeeId: input.employeeId ?? null,
          vehicleId: input.vehicleId ?? null,
          duration: input.duration ?? null,
          transcribedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
          createdById: ctx.user.id
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "radio_transcription", entityId: id, details: "Transcri\xE7\xE3o de r\xE1dio" });
        return { id, transcription: result.text, summary: summaryText };
      })
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
      userLocation: protectedProcedure.input(z2.object({ username: z2.string() })).query(async ({ input }) => {
        return getZelloUserLocation(input.username);
      }),
      userHistory: protectedProcedure.input(z2.object({
        username: z2.string(),
        startTs: z2.number(),
        endTs: z2.number()
      })).query(async ({ input }) => {
        return getZelloUserHistory(input.username, input.startTs, input.endTs);
      })
    }),
    // ─── SPEED MONITORING ──────────────────────────────────────────────
    speedMonitoring: router({
      limits: router({
        list: protectedProcedure.query(async () => {
          return getSpeedLimits();
        }),
        create: protectedProcedure.input(z2.object({
          name: z2.string().min(1),
          maxSpeed: z2.number().min(1),
          tolerancePercent: z2.number().min(0).max(100).default(10),
          isDefault: z2.boolean().default(false)
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const id = await createSpeedLimit({
            name: input.name,
            maxSpeed: input.maxSpeed,
            tolerancePercent: input.tolerancePercent,
            isDefault: input.isDefault ? 1 : 0
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "speed_limit", entityId: id, details: `Limite ${input.name}: ${input.maxSpeed}km/h` });
          return { id };
        }),
        update: protectedProcedure.input(z2.object({
          id: z2.number(),
          data: z2.object({
            name: z2.string().optional(),
            maxSpeed: z2.number().optional(),
            tolerancePercent: z2.number().optional(),
            isDefault: z2.boolean().optional(),
            isActive: z2.boolean().optional()
          })
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          const { isDefault, isActive, ...rest } = input.data;
          const patch = { ...rest };
          if (isDefault !== void 0) patch.isDefault = isDefault ? 1 : 0;
          if (isActive !== void 0) patch.isActive = isActive ? 1 : 0;
          await updateSpeedLimit(input.id, patch);
          return { success: true };
        }),
        delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await deleteSpeedLimit(input.id);
          return { success: true };
        })
      }),
      violations: router({
        list: protectedProcedure.input(z2.object({
          startDate: z2.string().optional(),
          endDate: z2.string().optional(),
          username: z2.string().optional(),
          acknowledged: z2.boolean().optional()
        }).optional()).query(async ({ input }) => {
          return getSpeedViolations({
            startDate: input?.startDate ? new Date(input.startDate) : void 0,
            endDate: input?.endDate ? new Date(input.endDate) : void 0,
            username: input?.username,
            acknowledged: input?.acknowledged
          });
        }),
        acknowledge: protectedProcedure.input(z2.object({
          id: z2.number(),
          notes: z2.string().optional()
        })).mutation(async ({ ctx, input }) => {
          requireRole(ctx.user.role, "admin");
          await acknowledgeSpeedViolation(input.id, ctx.user.id, input.notes);
          await logActivity({ userId: ctx.user.id, action: "update", entity: "speed_violation", entityId: input.id, details: "Infra\xE7\xE3o reconhecida" });
          return { success: true };
        }),
        stats: protectedProcedure.input(z2.object({
          startDate: z2.string().optional(),
          endDate: z2.string().optional()
        }).optional()).query(async ({ input }) => {
          return getSpeedViolationStats(
            input?.startDate ? new Date(input.startDate) : void 0,
            input?.endDate ? new Date(input.endDate) : void 0
          );
        })
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
            const excessPercent = (loc.speed - defaultLimit.maxSpeed) / defaultLimit.maxSpeed * 100;
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
              occurredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
            });
            violationCount++;
            await notifyOwner({
              title: "\u26A0\uFE0F Excesso de Velocidade",
              content: `${loc.displayName || loc.username} a ${loc.speed.toFixed(1)} km/h (limite: ${defaultLimit.maxSpeed} km/h, +${excessPercent.toFixed(0)}%) - Lat: ${loc.latitude}, Lon: ${loc.longitude}`
            });
          }
        }
        return { checked: locations.length, violations: violationCount, threshold };
      })
    }),
    // ─── DAILY DRIVER HISTORY ──────────────────────────────────────────
    driverHistory: router({
      byDate: protectedProcedure.input(z2.object({ date: z2.string() })).query(async ({ input }) => {
        return getDailyDriverHistoryByDate(input.date);
      }),
      byUser: protectedProcedure.input(z2.object({ username: z2.string(), limit: z2.number().optional() })).query(async ({ input }) => {
        return getDailyDriverHistoryByUser(input.username, input.limit);
      }),
      range: protectedProcedure.input(z2.object({ startDate: z2.string(), endDate: z2.string() })).query(async ({ input }) => {
        return getDailyDriverHistoryRange(input.startDate, input.endDate);
      }),
      stats: protectedProcedure.input(z2.object({ date: z2.string() })).query(async ({ input }) => {
        return getDailyDriverStats(input.date);
      }),
      /** Manually trigger data collection for a specific date */
      collectDay: protectedProcedure.input(z2.object({ date: z2.string() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        const targetDate = new Date(input.date);
        targetDate.setHours(0, 0, 0, 0);
        const result = await collectDailyDriverData(targetDate);
        await logActivity({ userId: ctx.user.id, action: "create", entity: "daily_driver_history", entityId: 0, details: `Recolha manual para ${input.date}: ${result.driversProcessed} motoristas` });
        return result;
      })
    }),
    // ─── PDAs (DISPOSITIVOS) ──────────────────────────────────────────
    pdas: router({
      list: protectedProcedure.query(async () => {
        return listPdas();
      }),
      get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
        return getPdaById(input.id);
      }),
      create: protectedProcedure.input(z2.object({
        name: z2.string().min(1),
        phoneNumber: z2.string().optional(),
        imei: z2.string().optional(),
        model: z2.string().optional(),
        status: z2.enum(["active", "inactive", "maintenance", "lost"]).optional(),
        photoUrl: z2.string().optional(),
        simDataPlan: z2.string().optional(),
        notes: z2.string().optional()
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
          notes: input.notes ?? null
        });
        await logActivity({ userId: ctx.user.id, action: "create", entity: "pda", entityId: id, details: `PDA ${input.name}` });
        return { id };
      }),
      update: protectedProcedure.input(z2.object({
        id: z2.number(),
        data: z2.object({
          name: z2.string().optional(),
          phoneNumber: z2.string().nullable().optional(),
          imei: z2.string().nullable().optional(),
          model: z2.string().nullable().optional(),
          status: z2.enum(["active", "inactive", "maintenance", "lost"]).optional(),
          photoUrl: z2.string().nullable().optional(),
          simDataPlan: z2.string().nullable().optional(),
          notes: z2.string().nullable().optional()
        })
      })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        await updatePda(input.id, input.data);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "pda", entityId: input.id, details: "PDA atualizado" });
        return { success: true };
      }),
      delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
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
        byDate: protectedProcedure.input(z2.object({ date: z2.string() })).query(async ({ input }) => {
          return getCheckinsByDate(input.date);
        }),
        byPda: protectedProcedure.input(z2.object({ pdaId: z2.number(), limit: z2.number().optional() })).query(async ({ input }) => {
          return getCheckinsByPda(input.pdaId, input.limit);
        }),
        checkin: protectedProcedure.input(z2.object({
          pdaId: z2.number(),
          employeeId: z2.number().optional(),
          zelloUsername: z2.string().optional(),
          photoEntryUrl: z2.string().optional(),
          mobileDataMbStart: z2.number().optional(),
          notes: z2.string().optional()
        })).mutation(async ({ ctx, input }) => {
          const id = await createPdaCheckin({
            pdaId: input.pdaId,
            employeeId: input.employeeId ?? null,
            zelloUsername: input.zelloUsername ?? null,
            teamLeaderId: ctx.user.id,
            photoEntryUrl: input.photoEntryUrl ?? null,
            mobileDataMbStart: input.mobileDataMbStart ?? null,
            notes: input.notes ?? null
          });
          await logActivity({ userId: ctx.user.id, action: "create", entity: "pda_checkin", entityId: id, details: `Check-in PDA #${input.pdaId}` });
          return { id };
        }),
        checkout: protectedProcedure.input(z2.object({
          id: z2.number(),
          photoExitUrl: z2.string().optional(),
          mobileDataMbEnd: z2.number().optional(),
          notes: z2.string().optional()
        })).mutation(async ({ ctx, input }) => {
          await checkoutPda(input.id, {
            photoExitUrl: input.photoExitUrl,
            mobileDataMbEnd: input.mobileDataMbEnd,
            notes: input.notes
          });
          await logActivity({ userId: ctx.user.id, action: "update", entity: "pda_checkin", entityId: input.id, details: "Check-out PDA" });
          return { success: true };
        })
      })
    }),
    // ─── GPS ALERTS ──────────────────────────────────────────────────────
    gpsAlerts: router({
      list: protectedProcedure.input(z2.object({
        limit: z2.number().optional(),
        unacknowledgedOnly: z2.boolean().optional()
      }).optional()).query(async ({ input }) => {
        return getGpsAlerts(input ?? {});
      }),
      stats: protectedProcedure.query(async () => {
        return getGpsAlertStats();
      }),
      acknowledge: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "team_leader");
        await acknowledgeGpsAlert(input.id, ctx.user.id);
        await logActivity({ userId: ctx.user.id, action: "update", entity: "gps_alert", entityId: input.id, details: "Alerta GPS reconhecido" });
        return { success: true };
      }),
      /** Check all users and create alerts for disabled GPS/Zello */
      checkNow: protectedProcedure.mutation(async ({ ctx }) => {
        requireRole(ctx.user.role, "team_leader");
        const users2 = await getZelloUsers();
        let alertsCreated = 0;
        for (const user of users2) {
          if (user.admin) continue;
          if (user.geotrackingOff) {
            await createGpsAlert({
              zelloUsername: user.name,
              displayName: user.fullName || user.name,
              alertType: "gps_off",
              message: `${user.fullName || user.name} tem o GPS desligado no Zello`,
              notificationSent: 1,
              occurredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
            });
            alertsCreated++;
            await notifyOwner({
              title: "\u26A0\uFE0F GPS Desligado",
              content: `${user.fullName || user.name} (${user.name}) tem o GPS desligado no Zello`
            });
          }
        }
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
                occurredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
              });
              alertsCreated++;
            }
          }
        } catch (e) {
        }
        return { success: true, alertsCreated };
      })
    })
  }),
  // ─── API KEYS MANAGEMENT ──────────────────────────────────────────────────
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      return getApiKeys();
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      permissions: z2.array(z2.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      const { nanoid } = await import("nanoid");
      const key = `mp_${nanoid(32)}`;
      const id = await createApiKey({
        name: input.name,
        apiKey: key,
        permissions: input.permissions ? JSON.stringify(input.permissions) : null,
        active: 1,
        createdById: ctx.user.id
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "api_key", entityId: id, details: `API Key: ${input.name}` });
      return { id, key };
    }),
    toggle: protectedProcedure.input(z2.object({
      id: z2.number(),
      active: z2.boolean()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await toggleApiKey(input.id, input.active);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "api_key", entityId: input.id, details: input.active ? "Ativada" : "Desativada" });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteApiKey(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "api_key", entityId: input.id, details: "API Key eliminada" });
      return { success: true };
    })
  }),
  // ─── RECLAMAÇÕES ────────────────────────────────────────────────────────────
  complaints: router({
    searchBooking: protectedProcedure.input(z2.object({ search: z2.string().min(2) })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return searchBookingByRef(input.search);
    }),
    fetchBookingDetails: protectedProcedure.input(z2.object({ externalId: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getBooking: getBooking2 } = await Promise.resolve().then(() => (init_multipark(), multipark_exports));
      try {
        return await getBooking2(input.externalId);
      } catch {
        return null;
      }
    }),
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      type: z2.string().optional(),
      vehicleId: z2.number().optional(),
      assignedToId: z2.number().optional(),
      projectId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getComplaints(input ?? {});
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const complaint = await getComplaintById(input.id);
      if (!complaint) throw new TRPCError3({ code: "NOT_FOUND" });
      const messages = await getComplaintMessages(input.id);
      const photos = await getComplaintPhotos(input.id);
      return { complaint, messages, photos };
    }),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      type: z2.enum(["damage", "dirt", "delay", "overcharge", "staff", "other"]),
      priority: z2.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z2.string().optional(),
      clientEmail: z2.string().optional(),
      clientPhone: z2.string().optional(),
      reservationRef: z2.string().optional(),
      reservationStart: z2.string().optional(),
      reservationEnd: z2.string().optional(),
      vehicleId: z2.number().optional(),
      vehiclePlate: z2.string().optional(),
      driversInvolved: z2.string().optional(),
      slaHours: z2.number().optional(),
      projectId: z2.number().optional(),
      assignedToId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const slaDeadline = input.slaHours ? new Date(Date.now() + input.slaHours * 36e5).toISOString().slice(0, 19).replace("T", " ") : null;
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
        createdById: ctx.user.id
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "complaint", entityId: id, details: `Reclama\xE7\xE3o: ${input.title}` });
      try {
        const { notifyComplaintCreated: notifyComplaintCreated2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
        await notifyComplaintCreated2(id);
      } catch (err) {
        console.warn("[complaint create] notify failed:", err);
      }
      return { id };
    }),
    // ── Drivers em serviço (cruza com extras-dia + history) ────────────────
    findDriversOnDuty: protectedProcedure.input(z2.object({ complaintId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { findDriversOnDuty: findDriversOnDuty2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      return findDriversOnDuty2(input.complaintId);
    }),
    attachDriver: protectedProcedure.input(z2.object({
      complaintId: z2.number(),
      employeeId: z2.number().nullable().optional(),
      employeeName: z2.string().min(1).max(256),
      roleAtTime: z2.string().max(64).nullable().optional(),
      source: z2.enum(["assignment", "history", "manual"]),
      notes: z2.string().max(512).nullable().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { attachDriverToComplaint: attachDriverToComplaint2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      await attachDriverToComplaint2(input);
      return { success: true };
    }),
    listAttachedDrivers: protectedProcedure.input(z2.object({ complaintId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { listComplaintDrivers: listComplaintDrivers2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      return listComplaintDrivers2(input.complaintId);
    }),
    detachDriver: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { detachComplaintDriver: detachComplaintDriver2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      await detachComplaintDriver2(input.id);
      return { success: true };
    }),
    // ── Penalty config ──────────────────────────────────────────────────────
    listPenaltyConfig: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { listPenaltyConfig: listPenaltyConfig2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      return listPenaltyConfig2();
    }),
    updatePenaltyConfig: protectedProcedure.input(z2.object({ complaintType: z2.string().max(32), basePoints: z2.number().int() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { updatePenaltyConfig: updatePenaltyConfig2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      await updatePenaltyConfig2(input.complaintType, input.basePoints);
      return { success: true };
    }),
    // ── Email ao cliente ───────────────────────────────────────────────────
    sendEmailToClient: protectedProcedure.input(z2.object({
      complaintId: z2.number(),
      subject: z2.string().min(1).max(255),
      body: z2.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { sendComplaintEmailToClient: sendComplaintEmailToClient2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      const r = await sendComplaintEmailToClient2(input);
      if (r.ok) {
        await logActivity({
          userId: ctx.user.id,
          action: "email_sent",
          entity: "complaint",
          entityId: input.complaintId,
          details: `Email para cliente: ${input.subject}`
        });
      }
      return r;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      type: z2.enum(["damage", "dirt", "delay", "overcharge", "staff", "other"]).optional(),
      status: z2.enum(["new", "analyzing", "waiting_client", "resolved", "closed"]).optional(),
      priority: z2.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z2.string().optional(),
      clientEmail: z2.string().optional(),
      clientPhone: z2.string().optional(),
      assignedToId: z2.number().nullable().optional(),
      driversInvolved: z2.string().optional(),
      slaHours: z2.number().optional(),
      penaltyPoints: z2.number().int().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, slaHours, type, status, priority, penaltyPoints, ...rest } = input;
      const updateData = { ...rest };
      if (type) updateData.complaintType = type;
      if (status) updateData.complaintStatus = status;
      if (priority) updateData.complaintPriority = priority;
      if (penaltyPoints !== void 0) updateData.penaltyPoints = penaltyPoints;
      if (slaHours !== void 0) {
        updateData.slaDeadline = slaHours > 0 ? new Date(Date.now() + slaHours * 36e5) : null;
      }
      if (status === "resolved") updateData.resolvedAt = /* @__PURE__ */ new Date();
      await updateComplaint(id, updateData);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "complaint", entityId: id, details: `Reclama\xE7\xE3o atualizada` });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deleteComplaint(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "complaint", entityId: input.id, details: "Reclama\xE7\xE3o eliminada" });
      return { success: true };
    }),
    addMessage: protectedProcedure.input(z2.object({
      complaintId: z2.number(),
      message: z2.string().min(1),
      isInternal: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const id = await addComplaintMessage({
        complaintId: input.complaintId,
        message: input.message,
        isInternal: input.isInternal ? 1 : 0,
        authorId: ctx.user.id,
        authorName: ctx.user.name ?? "Desconhecido"
      });
      return { id };
    }),
    uploadPhoto: protectedProcedure.input(z2.object({
      complaintId: z2.number(),
      base64: z2.string(),
      filename: z2.string(),
      label: z2.string().optional()
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
        uploadedById: ctx.user.id
      });
      return { id, url };
    }),
    deletePhoto: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await deleteComplaintPhoto(input.id);
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({ projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getComplaintStats(input?.projectId);
    }),
    // Get vehicle driver history for a complaint
    vehicleHistory: protectedProcedure.input(z2.object({ vehicleId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getVehicleDriverHistory(input.vehicleId);
    }),
    // Booking timeline from Multipark API
    bookingTimeline: protectedProcedure.input(z2.object({
      bookingId: z2.string()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingHistory(input.bookingId);
    })
  }),
  // ─── IN-APP NOTIFICATIONS ─────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.input(z2.object({ unreadOnly: z2.boolean().optional(), limit: z2.number().int().min(1).max(200).optional() }).optional()).query(async ({ ctx, input }) => {
      const { listNotifications: listNotifications2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      return listNotifications2(ctx.user.id, input?.unreadOnly ?? false, input?.limit ?? 50);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const { unreadCount: unreadCount2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      return { count: await unreadCount2(ctx.user.id) };
    }),
    markRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const { markNotificationRead: markNotificationRead2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      await markNotificationRead2(ctx.user.id, input.id);
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const { markAllNotificationsRead: markAllNotificationsRead2 } = await Promise.resolve().then(() => (init_complaintsExtended(), complaintsExtended_exports));
      await markAllNotificationsRead2(ctx.user.id);
      return { success: true };
    })
  }),
  // ─── GOOGLE REVIEWS ───────────────────────────────────────────────────────
  reviews: router({
    list: protectedProcedure.input(z2.object({
      rating: z2.number().optional(),
      status: z2.string().optional(),
      projectId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getGoogleReviews(input ?? void 0);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getGoogleReviewById(input.id);
    }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getGoogleReviewStats();
    }),
    create: protectedProcedure.input(z2.object({
      reviewerName: z2.string().min(1),
      reviewerEmail: z2.string().optional(),
      rating: z2.number().min(1).max(5),
      reviewText: z2.string().optional(),
      reviewDate: z2.string().optional(),
      projectId: z2.number().optional(),
      vehiclePlate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const reviewDate = (input.reviewDate ? new Date(input.reviewDate) : /* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
      const id = await createGoogleReview({
        ...input,
        reviewDate,
        createdById: ctx.user.id
      });
      if (input.rating >= 4 && id) {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `\xC9s o gestor de atendimento ao cliente de um parque de estacionamento premium. Responde a avalia\xE7\xF5es positivas do Google de forma natural, calorosa e profissional em portugu\xEAs. N\xE3o uses linguagem demasiado formal nem gen\xE9rica. Personaliza a resposta com base no texto da avalia\xE7\xE3o. M\xE1ximo 3 frases.`
              },
              {
                role: "user",
                content: `Avalia\xE7\xE3o de ${input.rating} estrelas de ${input.reviewerName}: "${input.reviewText || "Sem texto"}". Gera uma resposta de agradecimento.`
              }
            ]
          });
          const aiText = typeof response.choices[0].message.content === "string" ? response.choices[0].message.content : "";
          if (aiText) {
            await updateGoogleReview(id, { aiResponse: aiText, status: "ai_responded" });
          }
        } catch (e) {
          console.error("[Reviews] AI response failed:", e);
        }
      }
      if (input.rating <= 3 && id) {
        try {
          const complaintId = await createComplaint({
            title: `Cr\xEDtica Google ${input.rating}\u2605 \u2014 ${input.reviewerName}`,
            description: `Avalia\xE7\xE3o negativa no Google (${input.rating} estrelas):

"${input.reviewText || "Sem texto"}"

Cliente: ${input.reviewerName}${input.reviewerEmail ? "\nEmail: " + input.reviewerEmail : ""}${input.vehiclePlate ? "\nMatr\xEDcula: " + input.vehiclePlate : ""}`,
            complaintType: "other",
            complaintPriority: input.rating === 1 ? "urgent" : "high",
            clientName: input.reviewerName,
            clientEmail: input.reviewerEmail || void 0,
            vehiclePlate: input.vehiclePlate || void 0,
            projectId: input.projectId || void 0,
            slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString().slice(0, 19).replace("T", " "),
            // 24h SLA
            createdById: ctx.user.id
          });
          await updateGoogleReview(id, { complaintId, status: "converted_complaint" });
          await logActivity({ userId: ctx.user.id, action: "review_to_complaint", entity: "google_review", entityId: id, details: `Review ${input.rating}\u2605 convertida em reclama\xE7\xE3o #${complaintId}` });
        } catch (e) {
          console.error("[Reviews] Complaint conversion failed:", e);
        }
      }
      await logActivity({ userId: ctx.user.id, action: "create", entity: "google_review", entityId: id ?? 0, details: `Review ${input.rating}\u2605 de ${input.reviewerName}` });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      aiResponse: z2.string().optional(),
      status: z2.enum(["pending_response", "ai_responded", "manually_responded", "converted_complaint", "dismissed"]).optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      if (data.status === "manually_responded" || data.aiResponse) {
        data.respondedAt = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
        data.respondedBy = ctx.user.id;
      }
      await updateGoogleReview(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "google_review", entityId: id, details: `Review atualizada` });
      return { success: true };
    }),
    generateResponse: protectedProcedure.input(z2.object({
      id: z2.number()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const review = await getGoogleReviewById(input.id);
      if (!review) throw new TRPCError3({ code: "NOT_FOUND" });
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `\xC9s o gestor de atendimento ao cliente de um parque de estacionamento premium. Responde a avalia\xE7\xF5es do Google de forma natural, emp\xE1tica e profissional em portugu\xEAs. Se a avalia\xE7\xE3o for positiva (4-5 estrelas), agradece calorosamente. Se for negativa (1-3 estrelas), pede desculpa, mostra empatia e oferece resolu\xE7\xE3o. Personaliza com base no texto. M\xE1ximo 4 frases.`
          },
          {
            role: "user",
            content: `Avalia\xE7\xE3o de ${review.rating} estrelas de ${review.reviewerName}: "${review.reviewText || "Sem texto"}". Gera uma resposta.`
          }
        ]
      });
      const aiText = typeof response.choices[0].message.content === "string" ? response.choices[0].message.content : "";
      await updateGoogleReview(input.id, { aiResponse: aiText, status: "ai_responded" });
      return { response: aiText };
    }),
    searchClient: protectedProcedure.input(z2.object({
      name: z2.string().optional(),
      email: z2.string().optional(),
      plate: z2.string().optional()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return searchClientHistory(input.name, input.email, input.plate);
    }),
    approveResponse: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await updateGoogleReview(input.id, { aiResponseApproved: 1, respondedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "), respondedBy: ctx.user.id, status: "manually_responded" });
      await logActivity({ userId: ctx.user.id, action: "approve", entity: "google_review", entityId: input.id, details: "Resposta aprovada" });
      return { success: true };
    }),
    syncFromGmail: protectedProcedure.mutation(async ({ ctx }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      return {
        reviewsImported: 0,
        reviewsSkipped: 0,
        incidentsImported: 0,
        incidentsSkipped: 0,
        message: "A sincroniza\xE7\xE3o Gmail corre automaticamente 2x/dia (0h e 12h). Para for\xE7ar manualmente, contacta o administrador."
      };
    }),
    // Checkout drivers ranking (DB local — alimentada pelo sync da API Multipark)
    checkoutDrivers: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string()
    })).query(async ({ input }) => {
      const { getCheckoutDriversFromDb: getCheckoutDriversFromDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getCheckoutDriversFromDb2(input.startDate, input.endDate);
    }),
    // Agent performance history (DB local — alimentada pelo sync da API Multipark)
    agentHistory: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      agentName: z2.string().optional(),
      userId: z2.string().optional()
    })).query(async ({ input }) => {
      const { getAgentHistoryFromDb: getAgentHistoryFromDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAgentHistoryFromDb2({
        startDate: input.startDate,
        endDate: input.endDate,
        agentName: input.agentName,
        userId: input.userId
      });
    })
  }),
  // ─── FORMAÇÃO E APOIO ──────────────────────────────────────────────────────
  training: router({
    // Categories
    categories: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      return getTrainingCategories();
    }),
    createCategory: protectedProcedure.input(z2.object({ name: z2.string(), description: z2.string().optional(), icon: z2.string().optional(), sortOrder: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createTrainingCategory(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_category", entityId: result.id, details: input.name });
      return result;
    }),
    deleteCategory: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["super_admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteTrainingCategory(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_category", entityId: input.id, details: "" });
      return { success: true };
    }),
    // Videos
    videos: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getTrainingVideos(input.categoryId);
    }),
    createVideo: protectedProcedure.input(z2.object({ categoryId: z2.number(), title: z2.string(), description: z2.string().optional(), videoUrl: z2.string(), thumbnailUrl: z2.string().optional(), durationMinutes: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createTrainingVideo({ ...input, createdBy: ctx.user.id });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_video", entityId: result.id, details: input.title });
      return result;
    }),
    deleteVideo: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteTrainingVideo(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_video", entityId: input.id, details: "" });
      return { success: true };
    }),
    // Manuals / Blog
    manuals: protectedProcedure.input(z2.object({ categoryId: z2.number().optional(), type: z2.string().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getTrainingManuals(input.categoryId, input.type);
    }),
    createManual: protectedProcedure.input(z2.object({ categoryId: z2.number().optional(), title: z2.string(), content: z2.string(), type: z2.enum(["manual", "update", "news", "procedure"]).optional(), fileUrl: z2.string().optional(), fileKey: z2.string().optional(), fileName: z2.string().optional(), fileMimeType: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createTrainingManual({ ...input, createdBy: ctx.user.id });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "training_manual", entityId: result.id, details: input.title });
      return result;
    }),
    uploadManualFile: protectedProcedure.input(z2.object({ fileName: z2.string(), fileBase64: z2.string(), mimeType: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `training/manuals/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut2(key, buffer, input.mimeType);
      return { url, key, fileName: input.fileName, mimeType: input.mimeType };
    }),
    updateManual: protectedProcedure.input(z2.object({ id: z2.number(), title: z2.string().optional(), content: z2.string().optional(), type: z2.enum(["manual", "update", "news", "procedure"]).optional(), published: z2.boolean().optional(), fileUrl: z2.string().optional(), fileKey: z2.string().optional(), fileName: z2.string().optional(), fileMimeType: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      await updateTrainingManual(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "training_manual", entityId: id, details: data.title || "" });
      return { success: true };
    }),
    deleteManual: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteTrainingManual(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "training_manual", entityId: input.id, details: "" });
      return { success: true };
    }),
    // FAQs
    faqs: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getFAQs(input.categoryId);
    }),
    createFAQ: protectedProcedure.input(z2.object({ categoryId: z2.number().optional(), question: z2.string(), answer: z2.string(), sortOrder: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createFAQ(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "faq", entityId: result.id, details: input.question });
      return result;
    }),
    updateFAQ: protectedProcedure.input(z2.object({ id: z2.number(), question: z2.string().optional(), answer: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      await updateFAQ(id, data);
      return { success: true };
    }),
    deleteFAQ: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteFAQ(input.id);
      return { success: true };
    }),
    // Quiz
    // ADMIN: tem acesso à correctOption (para edição)
    quizQuestions: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Usa quizQuestionsForPlayer" });
      }
      return getQuizQuestions(input.categoryId);
    }),
    // PLAYER: sem correctOption (extra ou superior pode jogar)
    quizQuestionsForPlayer: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getQuizQuestionsForPlayer(input.categoryId);
    }),
    createQuizQuestion: protectedProcedure.input(z2.object({ categoryId: z2.number().optional(), question: z2.string(), optionA: z2.string(), optionB: z2.string(), optionC: z2.string(), optionD: z2.string(), correctOption: z2.enum(["A", "B", "C", "D"]), explanation: z2.string().optional(), difficulty: z2.enum(["easy", "medium", "hard"]).optional(), points: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createQuizQuestion(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "quiz_question", entityId: result.id, details: input.question });
      return result;
    }),
    deleteQuizQuestion: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteQuizQuestion(input.id);
      return { success: true };
    }),
    submitQuiz: protectedProcedure.input(z2.object({ answers: z2.array(z2.object({ questionId: z2.number(), answer: z2.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) throw new TRPCError3({ code: "NOT_FOUND", message: "Sem ficha de colaborador. Pede ao admin para te cadastrar primeiro." });
      const questions = await getQuizQuestions();
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      let correct = 0;
      let score = 0;
      for (const a of input.answers) {
        const q = questionMap.get(a.questionId);
        if (q && q.correctOption === a.answer) {
          correct++;
          score += q.points;
        }
      }
      const result = await saveQuizAttempt({ employeeId: me.employee.id, totalQuestions: input.answers.length, correctAnswers: correct, score, timeSpentSeconds: input.timeSpentSeconds });
      return { ...result, correct, score, total: input.answers.length };
    }),
    quizRanking: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      return getQuizRanking();
    }),
    // Career Exams
    careerExams: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      return getCareerExams();
    }),
    createCareerExam: protectedProcedure.input(z2.object({ level: z2.enum(["extra", "condutor", "senior", "team_leader", "supervisor"]), title: z2.string(), description: z2.string().optional(), passingScore: z2.number(), timeLimitMinutes: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createCareerExam(input);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "career_exam", entityId: result.id, details: input.title });
      return result;
    }),
    deleteCareerExam: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["super_admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteCareerExam(input.id);
      return { success: true };
    }),
    careerExamQuestions: protectedProcedure.input(z2.object({ examId: z2.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Usa careerExamQuestionsForPlayer" });
      }
      return getCareerExamQuestions(input.examId);
    }),
    careerExamQuestionsForPlayer: protectedProcedure.input(z2.object({ examId: z2.number() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      return getCareerExamQuestionsForPlayer(input.examId);
    }),
    createCareerExamQuestion: protectedProcedure.input(z2.object({ examId: z2.number(), question: z2.string(), optionA: z2.string(), optionB: z2.string(), optionC: z2.string(), optionD: z2.string(), correctOption: z2.enum(["A", "B", "C", "D"]), explanation: z2.string().optional(), points: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createCareerExamQuestion(input);
      return result;
    }),
    submitCareerExam: protectedProcedure.input(z2.object({ examId: z2.number(), answers: z2.array(z2.object({ questionId: z2.number(), answer: z2.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) throw new TRPCError3({ code: "NOT_FOUND", message: "Sem ficha de colaborador" });
      const questions = await getCareerExamQuestions(input.examId);
      const exams = await getCareerExams();
      const exam = exams.find((e) => e.id === input.examId);
      if (!exam) throw new TRPCError3({ code: "NOT_FOUND", message: "Exame n\xE3o encontrado" });
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      let correct = 0;
      let score = 0;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      for (const a of input.answers) {
        const q = questionMap.get(a.questionId);
        if (q && q.correctOption === a.answer) {
          correct++;
          score += q.points;
        }
      }
      const percentage = totalPoints > 0 ? Math.round(score / totalPoints * 100) : 0;
      const passed = percentage >= exam.passingScore;
      const result = await saveCareerExamAttempt({ examId: input.examId, employeeId: me.employee.id, totalQuestions: questions.length, correctAnswers: correct, score: percentage, passed, timeSpentSeconds: input.timeSpentSeconds });
      if (passed) {
        await notifyOwner({ title: `Exame aprovado: ${exam.title}`, content: `${me.employee.fullName} passou no exame "${exam.title}" com ${percentage}% (m\xEDnimo: ${exam.passingScore}%)` });
      }
      return { ...result, correct, score: percentage, total: questions.length, passed, passingScore: exam.passingScore };
    }),
    myCareerExamAttempts: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "extra");
      const me = await getEmployeeByUserId(ctx.user.id);
      if (!me) return [];
      return getCareerExamAttempts(me.employee.id);
    }),
    careerExamAttempts: protectedProcedure.input(z2.object({ employeeId: z2.number().optional(), examId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getCareerExamAttempts(input.employeeId, input.examId);
    })
  }),
  // ─── PERDIDOS E ACHADOS ────────────────────────────────────────────────────
  lostFound: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      itemType: z2.string().optional(),
      projectId: z2.number().optional(),
      search: z2.string().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getLostFoundItems(input);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getLostFoundItemById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      projectId: z2.number().optional(),
      vehiclePlate: z2.string().optional(),
      clientName: z2.string().min(1),
      clientEmail: z2.string().optional(),
      clientPhone: z2.string().optional(),
      bookingRef: z2.string().optional(),
      itemType: z2.enum(["money", "electronics", "clothing", "documents", "accessories", "other"]),
      description: z2.string().min(1),
      estimatedValue: z2.number().optional(),
      priority: z2.enum(["low", "medium", "high"]).optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const id = await createLostFoundItem({ ...input, createdBy: ctx.user.id, status: "new", priority: input.priority || "medium" });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "lost_found", entityId: id || 0, details: `Perdido/Achado: ${input.description}` });
      const admins = await getSuperAdmins();
      if (admins.length > 0) {
        await notifyOwner({ title: "Novo Perdido/Achado", content: `${input.clientName}: ${input.description} (Viatura: ${input.vehiclePlate || "N/A"})` });
      }
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.string().optional(),
      priority: z2.string().optional(),
      assignedTo: z2.number().optional(),
      resolution: z2.string().optional(),
      clientName: z2.string().optional(),
      clientEmail: z2.string().optional(),
      clientPhone: z2.string().optional(),
      bookingRef: z2.string().optional(),
      vehiclePlate: z2.string().optional(),
      itemType: z2.string().optional(),
      description: z2.string().optional(),
      estimatedValue: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      await updateLostFoundItem(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "lost_found", entityId: id, details: `Atualizado: ${JSON.stringify(data)}` });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const role = ctx.user.role || "user";
      if (role !== "super_admin") throw new TRPCError3({ code: "FORBIDDEN" });
      await deleteLostFoundItem(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "lost_found", entityId: input.id, details: "Eliminado" });
      return { success: true };
    }),
    // Photos
    getPhotos: protectedProcedure.input(z2.object({ itemId: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getLostFoundPhotos(input.itemId);
    }),
    uploadPhoto: protectedProcedure.input(z2.object({
      itemId: z2.number(),
      base64: z2.string(),
      filename: z2.string(),
      caption: z2.string().optional()
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
    getMessages: protectedProcedure.input(z2.object({ itemId: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getLostFoundMessages(input.itemId);
    }),
    addMessage: protectedProcedure.input(z2.object({
      itemId: z2.number(),
      message: z2.string().min(1),
      isInternal: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await addLostFoundMessage({ itemId: input.itemId, userId: ctx.user.id, userName: ctx.user.name || "Utilizador", message: input.message, isInternal: input.isInternal === false ? 0 : 1 });
      return { success: true };
    }),
    // Driver ranking (cruzamento de dados)
    driverRanking: protectedProcedure.query(({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getLostFoundDriverRanking();
    }),
    // Agentes Multipark que mexeram na matrícula. Sinaliza os que tocaram
    // especificamente na reserva do caso aberto (currentBookingRef).
    vehicleAgents: protectedProcedure.input(z2.object({ plate: z2.string(), currentBookingRef: z2.string().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getVehicleAgentsByPlate: getVehicleAgentsByPlate2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getVehicleAgentsByPlate2(input.plate, input.currentBookingRef);
    }),
    // ── Booking History (Multipark DB local, sincronizado pelo cron job) ──
    bookingHistory: protectedProcedure.input(z2.object({ bookingId: z2.string().optional(), plate: z2.string().optional(), search: z2.string().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      if (input.bookingId) return getBookingHistoryByBookingId(input.bookingId);
      if (input.plate) return getBookingHistoryByPlate(input.plate);
      if (input.search) return searchBookingHistory(input.search);
      return [];
    }),
    bookingHistoryDriverStats: protectedProcedure.query(({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingHistoryDriverStats();
    }),
    bookingHistoryCrossRef: protectedProcedure.query(({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingHistoryCrossReference();
    }),
    // Booking timeline directo da API Multipark (para o caso aberto)
    bookingTimeline: protectedProcedure.input(z2.object({
      bookingId: z2.string()
    })).query(async ({ input }) => {
      return getBookingHistory(input.bookingId);
    })
  }),
  // ─── OCORRÊNCIAS (INCIDENTS) ──────────────────────────────────────────────
  incidents: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      severity: z2.string().optional(),
      employeeId: z2.number().optional(),
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getIncidents(input);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getIncidentById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      projectId: z2.number().optional(),
      vehiclePlate: z2.string().optional(),
      employeeId: z2.number().optional(),
      incidentType: z2.enum(["vidro_aberto", "mal_estacionado", "dano", "chave_errada", "combustivel", "limpeza", "documentos", "outro"]),
      severity: z2.enum(["low", "medium", "high", "critical"]),
      description: z2.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const id = await createIncident({ ...input, reportedBy: ctx.user.id, status: "open" });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "incident", entityId: id || 0, details: `Ocorr\xEAncia: ${input.description}` });
      if (input.severity === "critical") {
        await notifyOwner({ title: "Ocorr\xEAncia Cr\xEDtica", content: `${input.incidentType}: ${input.description} (Viatura: ${input.vehiclePlate || "N/A"})` });
      }
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.string().optional(),
      severity: z2.string().optional(),
      resolution: z2.string().optional(),
      incidentType: z2.string().optional(),
      description: z2.string().optional(),
      vehiclePlate: z2.string().optional(),
      employeeId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, ...data } = input;
      if (data.status === "resolved") {
        data.resolvedAt = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
        data.resolvedBy = ctx.user.id;
      }
      await updateIncident(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "incident", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteIncident(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "incident", entityId: input.id });
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getIncidentStats(input?.weekNumber, input?.yearNumber);
    }),
    byEmployee: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getIncidentsByEmployee(input.employeeId);
    }),
    // Sincroniza ocorrências a partir do multipark_booking_history (remarks
    // dos agentes nos check-in/out/movements). Dedup por sourceEmailId.
    syncFromMultipark: protectedProcedure.input(z2.object({ lookbackDays: z2.number().int().min(1).max(180).optional() }).optional()).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      requireRole(ctx.user.role, "frontoffice");
      const { syncIncidentsFromMultiparkHistory: syncIncidentsFromMultiparkHistory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const r = await syncIncidentsFromMultiparkHistory2({
        lookbackDays: input?.lookbackDays ?? 30,
        reportedById: ctx.user.id
      });
      await logActivity({
        userId: ctx.user.id,
        action: "sync",
        entity: "incident",
        entityId: 0,
        details: `Multipark sync: ${r.imported} importadas, ${r.skipped} j\xE1 existiam, ${r.scanned} analisadas`
      });
      return r;
    })
  }),
  // ─── AVALIAÇÃO DE DESEMPENHO ─────────────────────────────────────────────
  performance: router({
    list: protectedProcedure.input(z2.object({
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional(),
      employeeId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "extra");
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["frontoffice"]) {
        const me = await getEmployeeByUserId(ctx.user.id);
        if (!me) return [];
        const mine = await getPerformanceEvaluations({ employeeId: me.employee.id });
        if (mine.length === 0) return [];
        const latest = mine.reduce((a, b) => b.yearNumber > a.yearNumber || b.yearNumber === a.yearNumber && b.weekNumber > a.weekNumber ? b : a);
        return mine.filter((r) => r.yearNumber === latest.yearNumber && r.weekNumber === latest.weekNumber);
      }
      return getPerformanceEvaluations(input);
    }),
    generate: protectedProcedure.input(z2.object({
      weekNumber: z2.number(),
      yearNumber: z2.number()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      const results = await generateWeeklyEvaluation(input.weekNumber, input.yearNumber);
      await logActivity({ userId: ctx.user.id, action: "generate", entity: "performance_evaluation", details: `Semana ${input.weekNumber}/${input.yearNumber}: ${results.length} linhas` });
      return results;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      positivePoints: z2.number().optional(),
      negativePoints: z2.number().optional(),
      notes: z2.string().nullable().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      const { id, ...data } = input;
      const current = await getPerformanceEvaluations({});
      const row = current.find((r) => r.id === id);
      const pos = data.positivePoints ?? row?.positivePoints ?? 0;
      const neg = data.negativePoints ?? row?.negativePoints ?? 0;
      data.totalPoints = pos - neg;
      await updatePerformanceEvaluation(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "performance_evaluation", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "supervisor");
      await deletePerformanceEvaluation(input.id);
      return { success: true };
    })
  }),
  // ─── SERVIÇOS ────────────────────────────────────────────────────────────
  services: router({
    list: protectedProcedure.input(z2.object({
      serviceType: z2.string().optional(),
      employeeId: z2.number().optional(),
      projectId: z2.number().optional(),
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getServices(input);
    }),
    create: protectedProcedure.input(z2.object({
      projectId: z2.number().optional(),
      employeeId: z2.number().optional(),
      serviceType: z2.enum(["lavagem", "carregamento_eletrico", "valet_flex", "outro"]),
      clientName: z2.string().optional(),
      vehiclePlate: z2.string().optional(),
      bookingRef: z2.string().optional(),
      revenue: z2.number().optional(),
      cost: z2.number().optional(),
      commission: z2.number().optional(),
      notes: z2.string().optional(),
      serviceDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const data = { ...input, serviceDate: input.serviceDate ? new Date(input.serviceDate) : /* @__PURE__ */ new Date() };
      const id = await createService(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "service", entityId: id || 0, details: `Servi\xE7o: ${input.serviceType}` });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      revenue: z2.number().optional(),
      cost: z2.number().optional(),
      commission: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, ...data } = input;
      await updateService(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "super_admin");
      await deleteService(input.id);
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getServiceStats(input?.month, input?.year);
    }),
    // Extra services from Multipark bookings
    multiparkExtras: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const report = await getBookingsReport(input.startDate, input.endDate, "checkout");
      const services2 = [];
      for (const b of report.bookings || []) {
        const extras = b.extraServices || [];
        for (const s of extras) {
          services2.push({
            bookingId: b.id,
            licensePlate: b.allocation || "",
            parkName: b.park?.name || "",
            checkOut: b.checkOutDate || "",
            serviceName: s.name,
            price: s.price || 0,
            done: s.done ?? true
          });
        }
      }
      return { total: services2.length, services: services2 };
    })
  }),
  // ─── FATURAÇÃO ───────────────────────────────────────────────────────────
  invoices: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      projectId: z2.number().optional(),
      search: z2.string().optional(),
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getInvoices(input);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getInvoiceById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      projectId: z2.number().optional(),
      invoiceNumber: z2.string().min(1),
      clientName: z2.string().optional(),
      clientNif: z2.string().optional(),
      issueDate: z2.string(),
      dueDate: z2.string().optional(),
      totalAmount: z2.number(),
      taxAmount: z2.number().optional(),
      status: z2.enum(["draft", "issued", "paid", "overdue", "cancelled"]).optional(),
      paymentMethod: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const data = {
        ...input,
        issueDate: new Date(input.issueDate),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdBy: ctx.user.id,
        status: input.status || "draft"
      };
      const id = await createInvoice(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "invoice", entityId: id || 0, details: `Fatura: ${input.invoiceNumber}` });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.string().optional(),
      totalAmount: z2.number().optional(),
      taxAmount: z2.number().optional(),
      paymentMethod: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, ...data } = input;
      await updateInvoice(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "invoice", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deleteInvoice(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "invoice", entityId: input.id });
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getInvoiceStats(input?.month, input?.year);
    }),
    // Diagnóstico cru: várias somas e breakdowns para isolar discrepâncias
    diagnose: protectedProcedure.input(z2.object({ from: z2.string(), to: z2.string(), projectId: z2.number().optional() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { diagnoseBilling: diagnoseBilling2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return diagnoseBilling2(input);
    }),
    billing: protectedProcedure.input(z2.object({
      granularity: z2.enum(["day", "week", "month", "year"]).optional(),
      from: z2.string(),
      to: z2.string(),
      projectId: z2.number().optional()
    })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBillingData(input);
    })
  }),
  // ─── PARCERIAS ───────────────────────────────────────────────────────────
  partnerships: router({
    analytics: protectedProcedure.input(z2.object({
      from: z2.string(),
      to: z2.string(),
      projectId: z2.number().optional()
    })).query(({ input }) => getPartnershipAnalytics(input)),
    list: protectedProcedure.input(z2.object({
      partnerType: z2.string().optional(),
      status: z2.string().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getPartnerships(input);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getPartnershipById(input.id);
    }),
    dashboardStats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      await markOverduePartnershipInvoices();
      return getPartnershipDashboardStats();
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      campaignKey: z2.string().optional(),
      partnerType: z2.string().min(1).max(64),
      contactName: z2.string().optional(),
      contactEmail: z2.string().optional(),
      contactPhone: z2.string().optional(),
      commissionRate: z2.number().optional(),
      monthlyFee: z2.number().optional(),
      nif: z2.string().optional(),
      billingAgreement: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { nif, ...rest } = input;
      const id = await createPartnership({ ...rest, partnerNif: nif });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "partnership", entityId: id || 0, details: `Parceria: ${input.name}` });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      campaignKey: z2.string().optional(),
      partnerType: z2.string().min(1).max(64).optional(),
      contactName: z2.string().optional(),
      contactEmail: z2.string().optional(),
      contactPhone: z2.string().optional(),
      commissionRate: z2.number().optional(),
      monthlyFee: z2.number().optional(),
      nif: z2.string().optional(),
      billingAgreement: z2.string().optional(),
      partnerStatus: z2.enum(["active", "inactive", "pending"]).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, nif, ...rest } = input;
      await updatePartnership(id, { ...rest, ...nif !== void 0 ? { partnerNif: nif } : {} });
      await logActivity({ userId: ctx.user.id, action: "update", entity: "partnership", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deletePartnership(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "partnership", entityId: input.id });
      return { success: true };
    }),
    // ── Inferência de parceiros a partir das reservas Multipark ──────────────
    inferList: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return inferPartnersFromBookings();
    }),
    addAlias: protectedProcedure.input(z2.object({
      partnershipId: z2.number(),
      aliasType: z2.enum(["multipark_partner_id", "payment_method"]),
      aliasValue: z2.string().min(1).max(128),
      applyToBookings: z2.boolean().default(true)
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const updated = await addPartnerAlias(
        input.partnershipId,
        input.aliasType,
        input.aliasValue,
        input.applyToBookings
      );
      await logActivity({
        userId: ctx.user.id,
        action: "alias_add",
        entity: "partnership",
        entityId: input.partnershipId,
        details: `${input.aliasType}=${input.aliasValue} (${updated} reservas actualizadas)`
      });
      return { updated };
    }),
    listAliases: protectedProcedure.input(z2.object({ partnershipId: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return listPartnerAliases(input.partnershipId);
    }),
    // Aliases agregados por parceiro — mostra quantos códigos cada parceiro
    // já tem associados (cada parceiro tem normalmente 1 código por
    // cidade × marca, logo vários).
    aliasCounts: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { aliasCountsByPartner: aliasCountsByPartner2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return aliasCountsByPartner2();
    }),
    // Sumário de faturação por parceiro: a faturar / faturado / pendente / em atraso
    invoicingSummary: protectedProcedure.input(z2.object({
      from: z2.string(),
      to: z2.string(),
      partnerType: z2.string().optional()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getPartnerInvoicingSummary: getPartnerInvoicingSummary2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getPartnerInvoicingSummary2(input);
    }),
    // Detalhe por tipo de parceiro — com colunas específicas do chargeModel
    invoicingDetailByType: protectedProcedure.input(z2.object({
      from: z2.string(),
      to: z2.string(),
      partnerType: z2.string()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getPartnerInvoicingDetailByType: getPartnerInvoicingDetailByType2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getPartnerInvoicingDetailByType2(input);
    }),
    deleteAlias: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deletePartnerAlias(input.id);
      return { success: true };
    }),
    // Transactions
    getTransactions: protectedProcedure.input(z2.object({ partnershipId: z2.number() })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getPartnershipTransactions(input.partnershipId);
    }),
    addTransaction: protectedProcedure.input(z2.object({
      partnershipId: z2.number(),
      projectId: z2.number().optional(),
      transactionType: z2.enum(["booking", "commission", "payment", "adjustment"]),
      description: z2.string().optional(),
      amount: z2.number(),
      transactionDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const data = { ...input, transactionDate: input.transactionDate ? new Date(input.transactionDate) : /* @__PURE__ */ new Date() };
      const id = await createPartnershipTransaction(data);
      return { id };
    }),
    // Invoices
    listInvoices: protectedProcedure.input(z2.object({
      partnershipId: z2.number().optional(),
      status: z2.string().optional(),
      year: z2.number().optional(),
      month: z2.number().optional()
    }).optional()).query(({ input }) => getPartnershipInvoices(input)),
    createInvoice: protectedProcedure.input(z2.object({
      partnershipId: z2.number(),
      invoiceNumber: z2.string().optional(),
      amount: z2.number(),
      referenceMonth: z2.number().min(1).max(12),
      referenceYear: z2.number(),
      dueDate: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const data = { ...input, dueDate: input.dueDate ? new Date(input.dueDate) : void 0 };
      const id = await createPartnershipInvoice(data);
      await logActivity({ userId: ctx.user.id, action: "create", entity: "partnership_invoice", entityId: id || 0 });
      return { id };
    }),
    updateInvoice: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
      invoiceNumber: z2.string().optional(),
      amount: z2.number().optional(),
      dueDate: z2.string().optional(),
      sentAt: z2.string().optional(),
      paidAt: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...rest } = input;
      const data = { ...rest };
      if (rest.dueDate) data.dueDate = new Date(rest.dueDate);
      if (rest.sentAt) data.sentAt = new Date(rest.sentAt);
      if (rest.paidAt) data.paidAt = new Date(rest.paidAt);
      if (rest.status === "sent" && !rest.sentAt) data.sentAt = /* @__PURE__ */ new Date();
      if (rest.status === "paid" && !rest.paidAt) data.paidAt = /* @__PURE__ */ new Date();
      await updatePartnershipInvoice(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "partnership_invoice", entityId: id });
      return { success: true };
    }),
    deleteInvoice: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deletePartnershipInvoice(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "partnership_invoice", entityId: input.id });
      return { success: true };
    }),
    markOverdue: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const count = await markOverduePartnershipInvoices();
      return { updated: count };
    }),
    // Bookings by campaign key for monthly billing
    bookingsByCampaign: protectedProcedure.input(z2.object({
      campaignKey: z2.string(),
      from: z2.string(),
      to: z2.string(),
      projectId: z2.number().optional()
    })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingsByCampaign(input);
    })
  }),
  // ─── ANUAL ───────────────────────────────────────────────────────────────
  annual: router({
    list: protectedProcedure.input(z2.object({
      year: z2.number().optional(),
      projectId: z2.number().optional()
    }).optional()).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getAnnualReports(input);
    }),
    breakdown: protectedProcedure.input(z2.object({
      year: z2.number(),
      projectId: z2.number().optional()
    })).query(({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getAnnualBreakdown(input.year, input.projectId);
    }),
    generate: protectedProcedure.input(z2.object({
      year: z2.number(),
      projectId: z2.number().optional(),
      splitPartner: z2.number().min(0).max(100).optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const results = await generateAnnualSummary(input.year, input.projectId, input.splitPartner ?? 60);
      await logActivity({ userId: ctx.user.id, action: "generate", entity: "annual_report", details: `Relat\xF3rio anual ${input.year}` });
      return results;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      totalRevenue: z2.number().optional(),
      totalExpenses: z2.number().optional(),
      partnerShare: z2.number().optional(),
      companyShare: z2.number().optional(),
      splitRatio: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { id, ...data } = input;
      await updateAnnualReport(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await deleteAnnualReport(input.id);
      return { success: true };
    })
  }),
  // ── MULTIPARK INTEGRATION ──────────────────────────────────────────────────
  multipark: router({
    // Pesquisa partilhada de reservas — usada por reclamações, perdidos/achados,
    // ocorrências e críticas Google. Procura por nº reserva / externalId /
    // matrícula / email / nome do cliente. DB local.
    searchBooking: protectedProcedure.input(z2.object({ search: z2.string().min(2) })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return searchBookingByRef(input.search);
    }),
    // Detalhe de uma reserva específica via API Multipark
    fetchBookingDetails: protectedProcedure.input(z2.object({ externalId: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getBooking: getBooking2 } = await Promise.resolve().then(() => (init_multipark(), multipark_exports));
      try {
        return await getBooking2(input.externalId);
      } catch {
        return null;
      }
    }),
    // Test API connection
    testConnection: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return testConnection();
    }),
    // Inspect raw booking JSON from API (tries all parks). Admin-only debug tool.
    inspectBooking: protectedProcedure.input(z2.object({ externalId: z2.string().min(1) })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const found = await getBookingTryAllParks(input.externalId);
      if (!found) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Reserva n\xE3o encontrada em nenhum parque (ou chaves de API em falta)."
        });
      }
      return {
        park: `${found.parkConfig.name} (${found.parkConfig.city})`,
        parkId: found.parkConfig.id,
        booking: found.booking
      };
    }),
    // Check availability
    checkAvailability: protectedProcedure.input(z2.object({
      checkIn: z2.string(),
      checkOut: z2.string(),
      vehicleType: z2.enum(["MOTORCYCLE", "CAR", "VAN", "TRUCK"]).default("CAR"),
      parkingType: z2.enum(["COVERED", "UNCOVERED", "INDOOR", "VIP"]).default("COVERED")
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return checkAvailability(
        input.checkIn,
        input.checkOut,
        input.vehicleType,
        input.parkingType
      );
    }),
    // List parks
    listParks: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return listParks();
    }),
    // Get sync logs
    syncLogs: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getSyncLogs(50);
    }),
    // ── KPIs AGREGADOS ──
    kpis: protectedProcedure.input(z2.object({
      from: z2.string().optional(),
      to: z2.string().optional(),
      city: z2.string().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getSnapshotKPIs({
        from: input?.from ? new Date(input.from) : void 0,
        to: input?.to ? new Date(input.to) : void 0,
        city: input?.city
      });
    }),
    // Get daily snapshots (raw data)
    snapshots: protectedProcedure.input(z2.object({
      from: z2.string().optional(),
      to: z2.string().optional(),
      parkName: z2.string().optional(),
      city: z2.string().optional(),
      limit: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getDailySnapshots({
        from: input?.from ? new Date(input.from) : void 0,
        to: input?.to ? new Date(input.to) : void 0,
        parkName: input?.parkName,
        city: input?.city,
        limit: input?.limit
      });
    }),
    // ── IMPORT EXCEL ──
    importExcel: protectedProcedure.input(z2.object({
      fileBase64: z2.string(),
      filename: z2.string()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const wb = XLSX.read(buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) throw new Error("Ficheiro Excel vazio");
      const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
      if (rows.length === 0) throw new Error("Nenhuma linha encontrada no ficheiro");
      const parsePrice = (val) => {
        if (!val) return 0;
        const s = String(val).replace(/[^\d.,]/g, "").replace(",", ".");
        return Math.round(parseFloat(s) * 100) || 0;
      };
      const parseDate2 = (val) => {
        if (!val) return null;
        const s = String(val);
        const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };
      const colMap = {};
      const firstRow = rows[0];
      for (const key of Object.keys(firstRow)) {
        const k = key.toLowerCase();
        if (k.includes("estado")) colMap.status = key;
        if (k.includes("cria") || k === "data de cria\xE7\xE3o" || k.includes("cria\uFFFD")) colMap.createdAt = key;
        if (k.includes("nome do parque") || k === "nome do parque") colMap.parkName = key;
        if (k === "parkname") colMap.parkName = colMap.parkName || key;
        if (k.includes("cidade")) colMap.city = key;
        if (k.includes("pre\xE7o total") || k.includes("pre\uFFFD") && k.includes("total")) colMap.totalPrice = key;
        if (k.includes("estacionamento") && k.includes("pre")) colMap.parkingPrice = key;
        if (k.includes("entrega") && k.includes("pre")) colMap.deliveryPrice = key;
        if (k.includes("extra") && k.includes("pre")) colMap.extrasPrice = key;
        if (k.includes("pagamento") && k.includes("todo")) colMap.paymentMethod = key;
        if (k.includes("externalcampaign") || k.includes("external")) colMap.campaign = key;
      }
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
      const grouped = {};
      let parsedRows = 0;
      for (const row of rows) {
        const createdDate = parseDate2(row[colMap.createdAt]);
        if (!createdDate) continue;
        const dateKey2 = createdDate.toISOString().slice(0, 10);
        const parkName = String(row[colMap.parkName] || "Desconhecido").trim();
        const city = String(row[colMap.city] || "Desconhecida").trim();
        const status = String(row[colMap.status] || "").toLowerCase();
        const groupKey = `${dateKey2}|${parkName}|${city}`;
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            date: createdDate,
            parkName,
            city,
            total: 0,
            reserved: 0,
            checkin: 0,
            checkout: 0,
            cancelled: 0,
            revenue: 0,
            parkingRev: 0,
            deliveryRev: 0,
            extrasRev: 0,
            online: 0,
            agent: 0,
            campaigns: {}
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
      let created = 0, updated = 0;
      for (const g of Object.values(grouped)) {
        const result = await upsertDailySnapshot({
          snapshotDate: (/* @__PURE__ */ new Date(g.date.toISOString().slice(0, 10) + "T00:00:00.000Z")).toISOString().slice(0, 19).replace("T", " "),
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
          importedById: ctx.user.id
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
        completedAt: /* @__PURE__ */ new Date()
      });
      await logActivity({
        userId: ctx.user.id,
        action: "import",
        entity: "multipark_kpis",
        details: `Excel importado: ${parsedRows} reservas \u2192 ${created + updated} snapshots (${input.filename})`
      });
      return {
        success: true,
        rowsParsed: parsedRows,
        snapshotsCreated: created,
        snapshotsUpdated: updated,
        totalGroups: Object.keys(grouped).length
      };
    }),
    // Manual sync trigger
    // Sync bookings from API (manual trigger with date range)
    triggerSync: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      actionTypes: z2.array(z2.enum(["creation", "checkin", "checkout", "cancelation"])).optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      try {
        const result = await syncBookings({
          startDate: input.startDate,
          endDate: input.endDate,
          actionTypes: input.actionTypes,
          triggeredById: ctx.user.id
        });
        await logActivity({
          userId: ctx.user.id,
          action: "sync",
          entity: "multipark",
          details: `Sync API: ${result.processed} processadas, ${result.created} novas, ${result.updated} atualizadas`
        });
        return result;
      } catch (error) {
        await createSyncLog({
          syncType: "manual",
          status: "error",
          errorMessage: error.message,
          triggeredById: ctx.user.id,
          completedAt: /* @__PURE__ */ new Date()
        });
        return { success: false, processed: 0, created: 0, updated: 0, errors: [error.message] };
      }
    }),
    // Enrich a batch of unenriched bookings with /bookings/:id details
    // (deliveryType, returnFlight, departingFlight, remarks).
    enrichBatch: protectedProcedure.input(z2.object({ limit: z2.number().int().min(1).max(300).default(200) }).optional()).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const result = await enrichBookingsBatch(input?.limit ?? 200);
      await logActivity({
        userId: ctx.user.id,
        action: "enrich",
        entity: "multipark_bookings",
        details: `Enriquecidas ${result.enriched}/${result.scanned} (${result.errors} erros API, ${result.noKey} sem chave)`
      });
      return result;
    }),
    // Fetch history (timeline) das reservas recentes ou futuras 30d
    syncHistoryBatch: protectedProcedure.input(z2.object({ limit: z2.number().int().min(1).max(100).default(50) }).optional()).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const result = await syncBookingHistoryBatch(input?.limit ?? 50);
      await logActivity({
        userId: ctx.user.id,
        action: "history_sync",
        entity: "multipark_bookings",
        details: `History: ${result.fetched}/${result.scanned} reservas (${result.errors} erros, ${result.noKey} sem chave)`
      });
      return result;
    }),
    // Buscar history de um agente (por nome) num dia (chama /agent/history
    // por cada parque configurado e agrega resultados na DB).
    fetchAgentHistory: protectedProcedure.input(z2.object({
      agentName: z2.string().min(1).max(256),
      date: z2.string()
      // YYYY-MM-DD
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { fetchAgentHistoryByName: fetchAgentHistoryByName2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
      return fetchAgentHistoryByName2(input.agentName, input.date);
    }),
    // Avaliação operacional do dia: por extra (com métricas) + agregado
    // por turno + agregado total. TL recebe também score da equipa.
    dayEvaluation: protectedProcedure.input(z2.object({ date: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { evaluateDay: evaluateDay2 } = await Promise.resolve().then(() => (init_multiparkEvaluation(), multiparkEvaluation_exports));
      return evaluateDay2(input.date);
    }),
    // Dashboard por intervalo: daily series + per-person summary com
    // in-shift vs out-of-shift actions
    dashboardRange: protectedProcedure.input(z2.object({ startDate: z2.string(), endDate: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getDashboardRange: getDashboardRange2 } = await Promise.resolve().then(() => (init_multiparkEvaluation(), multiparkEvaluation_exports));
      return getDashboardRange2(input.startDate, input.endDate);
    }),
    // Set multipark mapping para um empregado (nome curto + userId)
    setMultiparkAgentMapping: protectedProcedure.input(z2.object({
      employeeId: z2.number(),
      multiparkAgentName: z2.string().max(256).nullable().optional(),
      multiparkAgentUserId: z2.string().max(128).nullable().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db2 = await getDb3();
      if (!db2) return { success: false };
      const { employees: employees2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: deq } = await import("drizzle-orm");
      const patch = {};
      if (input.multiparkAgentName !== void 0) patch.multiparkAgentName = input.multiparkAgentName;
      if (input.multiparkAgentUserId !== void 0) patch.multiparkAgentUserId = input.multiparkAgentUserId;
      await db2.update(employees2).set(patch).where(deq(employees2.id, input.employeeId));
      return { success: true };
    }),
    // Lista summary do que está guardado em multipark_booking_history para
    // um agente num dia (após fetchAgentHistory).
    agentHistorySummary: protectedProcedure.input(z2.object({
      agentName: z2.string().min(1).max(256),
      date: z2.string()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db2 = await getDb3();
      if (!db2) return null;
      const { multiparkBookingHistory: multiparkBookingHistory2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: dsql, and: dand, eq: deq, gte: dgte, lt: dlt } = await import("drizzle-orm");
      const start = `${input.date} 00:00:00`;
      const end = /* @__PURE__ */ new Date(input.date + "T00:00:00");
      end.setDate(end.getDate() + 1);
      const endStr = end.toISOString().slice(0, 19).replace("T", " ");
      const rows = await db2.select().from(multiparkBookingHistory2).where(
        dand(
          deq(multiparkBookingHistory2.agentName, input.agentName),
          dgte(multiparkBookingHistory2.actionTime, start),
          dlt(multiparkBookingHistory2.actionTime, endStr)
        )
      ).orderBy(multiparkBookingHistory2.actionTime);
      const byType = {};
      for (const r of rows) {
        const k = r.changeType ?? "?";
        byType[k] = (byType[k] ?? 0) + 1;
      }
      return { total: rows.length, byType, items: rows };
    }),
    // ── Atividade por agente (TODOS os agentes com atividade) + mapeamento ──
    // Lista os nomes de agente Multipark do histórico no período, com contagens
    // e o colaborador a que estão ligados (employees.multiparkAgentName).
    agentActivity: protectedProcedure.input(z2.object({ from: z2.string(), to: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) return [];
      const rows = (r) => Array.isArray(r[0]) ? r[0] : r;
      const acts = rows(await db2.execute(sql6`
          SELECT agentName,
            COUNT(*) AS total,
            SUM(changeType = 'CHECK_IN') AS checkin,
            SUM(changeType = 'CHECK_OUT') AS checkout,
            SUM(changeType = 'MOVEMENT') AS movement
          FROM multipark_booking_history
          WHERE agentName IS NOT NULL AND agentName <> ''
            AND actionTime >= ${input.from + " 00:00:00"} AND actionTime <= ${input.to + " 23:59:59"}
          GROUP BY agentName ORDER BY total DESC`));
      const emps = rows(await db2.execute(sql6`SELECT id, fullName, multiparkAgentName FROM employees WHERE multiparkAgentName IS NOT NULL AND multiparkAgentName <> ''`));
      const byAgent = new Map(emps.map((e) => [e.multiparkAgentName, e]));
      return acts.map((a) => {
        const e = byAgent.get(a.agentName);
        return {
          agentName: a.agentName,
          total: Number(a.total),
          checkin: Number(a.checkin),
          checkout: Number(a.checkout),
          movement: Number(a.movement),
          employeeId: e?.id ?? null,
          employeeName: e?.fullName ?? null
        };
      });
    }),
    // Liga (ou desliga) um nome de agente Multipark a um colaborador. Único:
    // limpa o nome de qualquer outro colaborador que o tivesse.
    mapAgentToEmployee: protectedProcedure.input(z2.object({ agentName: z2.string().min(1), employeeId: z2.number().nullable() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      await db2.execute(sql6`UPDATE employees SET multiparkAgentName = NULL WHERE multiparkAgentName = ${input.agentName}`);
      if (input.employeeId != null) {
        await db2.execute(sql6`UPDATE employees SET multiparkAgentName = ${input.agentName} WHERE id = ${input.employeeId}`);
      }
      return { success: true };
    }),
    // Lista leve de colaboradores ativos para o dropdown de mapeamento.
    employeesForMapping: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql6 } = await import("drizzle-orm");
      const db2 = await getDb3();
      if (!db2) return [];
      const r = await db2.execute(sql6`SELECT id, fullName, multiparkAgentName FROM employees WHERE isActive = 1 ORDER BY fullName`);
      return Array.isArray(r[0]) ? r[0] : r;
    }),
    // List synced bookings with filters
    bookings: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      parkingType: z2.string().optional(),
      city: z2.string().optional(),
      parkName: z2.string().optional(),
      projectId: z2.number().optional(),
      from: z2.string().optional(),
      to: z2.string().optional(),
      search: z2.string().optional(),
      limit: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getMultiparkBookings({
        status: input?.status,
        parkingType: input?.parkingType,
        from: input?.from ? new Date(input.from) : void 0,
        to: input?.to ? new Date(input.to) : void 0,
        search: input?.search,
        limit: input?.limit
      });
    }),
    // Booking stats (with optional filters)
    bookingStats: protectedProcedure.input(z2.object({
      from: z2.string().optional(),
      to: z2.string().optional(),
      projectId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getMultiparkBookingStats(input ?? void 0);
    }),
    // Query LOCAL DB by actionType + date range
    localBookingsByAction: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      actionType: z2.enum(["creation", "checkin", "checkout", "cancelation"]),
      projectId: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const bookings = await getLocalBookingsByAction(input);
      return {
        total: bookings.length,
        actionType: input.actionType,
        period: { startDate: input.startDate, endDate: input.endDate },
        bookings
      };
    }),
    // Query API directly by actionType + date range (all parks)
    reportByAction: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      actionType: z2.enum(["creation", "checkin", "checkout", "cancelation"])
    })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const results = await getBookingsReportAllParks(
        input.startDate,
        input.endDate,
        input.actionType
      );
      let bookings = results.flatMap(
        (r) => r.report.bookings.map((b) => ({
          ...b,
          _parkName: r.park.name,
          _parkCity: r.park.city,
          _parkId: r.park.id
        }))
      );
      if (input.actionType === "checkin" || input.actionType === "checkout") {
        bookings = bookings.filter((b) => b.status !== "CANCELLED");
      }
      return {
        total: bookings.length,
        actionType: input.actionType,
        period: { startDate: input.startDate, endDate: input.endDate },
        bookings
      };
    })
  }),
  // ── EXTRAS DIA — Daily forecast & driver allocation (Lisboa) ────────────────
  extrasDia: router({
    forecast: protectedProcedure.input(z2.object({ baseDate: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getExtrasDiaForecast(input?.baseDate);
    }),
    candidates: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "frontoffice");
      return listDriverCandidates();
    }),
    assignments: protectedProcedure.input(z2.object({ date: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return listAssignments(input.date);
    }),
    upsertAssignment: protectedProcedure.input(
      z2.object({
        id: z2.number().optional(),
        assignmentDate: z2.string(),
        employeeId: z2.number().nullable().optional(),
        personName: z2.string().min(1).max(128),
        level: z2.enum(["junior", "senior", "terminal", "master"]).nullable().optional(),
        isTeamLeader: z2.boolean().optional(),
        shift: z2.enum(["morning", "night"]),
        startHour: z2.number().int().min(0).max(27),
        endHour: z2.number().int().min(1).max(27),
        sentHomeHour: z2.number().int().min(0).max(27).nullable().optional(),
        notes: z2.string().max(255).nullable().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      if (input.endHour <= input.startHour) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Fim tem de ser depois do in\xEDcio" });
      }
      const span = input.endHour - input.startHour;
      if (span < 3) throw new TRPCError3({ code: "BAD_REQUEST", message: "M\xEDnimo 3h por turno" });
      if (span > 12) throw new TRPCError3({ code: "BAD_REQUEST", message: "M\xE1ximo 12h por turno" });
      if (input.sentHomeHour != null) {
        if (input.sentHomeHour < input.startHour || input.sentHomeHour > input.endHour) {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "Hora 'mandar para casa' tem de estar dentro do turno"
          });
        }
      }
      if (input.isTeamLeader && !input.employeeId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Team Leader tem de ser um funcion\xE1rio registado (sal\xE1rio usado no custo)."
        });
      }
      try {
        return await upsertAssignment({ ...input, createdById: ctx.user.id });
      } catch (err) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: err.message || "Erro ao guardar" });
      }
    }),
    deleteAssignment: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      await deleteAssignment(input.id);
      return { success: true };
    }),
    costForRange: protectedProcedure.input(z2.object({ startDate: z2.string(), endDate: z2.string() })).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getExtrasDiaCostForRange(input.startDate, input.endDate);
    }),
    bookingsInSlot: protectedProcedure.input(
      z2.object({
        date: z2.string(),
        hour: z2.number().int().min(3).max(26),
        slot: z2.number().int().min(0).max(2),
        type: z2.enum(["checkin", "checkout"])
      })
    ).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      return getBookingsInSlot(input.date, input.hour, input.slot, input.type);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/externalApi.ts
init_schema();
init_notification();
import { Router } from "express";
import { eq as eq6, and as and5 } from "drizzle-orm";
import { drizzle as drizzle2 } from "drizzle-orm/mysql2";
init_db();
var _db2 = null;
async function getDb2() {
  if (!_db2 && process.env.DATABASE_URL) {
    _db2 = drizzle2(process.env.DATABASE_URL);
  }
  return _db2;
}
async function validateApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) {
    res.status(401).json({ error: "Missing X-API-Key header" });
    return;
  }
  const db2 = await getDb2();
  if (!db2) {
    res.status(500).json({ error: "Database unavailable" });
    return;
  }
  const result = await db2.select().from(apiKeys).where(and5(eq6(apiKeys.apiKey, key), eq6(apiKeys.active, 1))).limit(1);
  if (result.length === 0) {
    res.status(403).json({ error: "Invalid or inactive API key" });
    return;
  }
  await db2.update(apiKeys).set({ lastUsedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") }).where(eq6(apiKeys.id, result[0].id));
  req.apiKeyInfo = result[0];
  next();
}
function createExternalApiRouter() {
  const r = Router();
  r.use(validateApiKey);
  r.get("/vehicles", async (_req, res) => {
    try {
      const list = await getVehicles();
      res.json({ success: true, data: list.map((v) => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model, status: v.status, projectId: v.projectId })) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  r.get("/employees", async (_req, res) => {
    try {
      const list = await getAllEmployees();
      res.json({ success: true, data: list.map((e) => ({ id: e.employee.id, fullName: e.employee.fullName, position: e.employee.position, status: e.employee.status })) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  r.post("/speed-alert", async (req, res) => {
    try {
      const { vehicleId, plate, speed, speedLimit, latitude, longitude, roadName, employeeId } = req.body;
      if (!speed || !speedLimit) {
        res.status(400).json({ error: "speed and speedLimit are required" });
        return;
      }
      let resolvedVehicleId = vehicleId;
      if (!resolvedVehicleId && plate) {
        const db2 = await getDb2();
        if (db2) {
          const veh = await db2.select().from(vehicles).where(eq6(vehicles.plate, plate)).limit(1);
          if (veh.length > 0) resolvedVehicleId = veh[0].id;
        }
      }
      if (!resolvedVehicleId) {
        res.status(400).json({ error: "vehicleId or valid plate is required" });
        return;
      }
      const id = await createSpeedAlert({
        vehicleId: resolvedVehicleId,
        employeeId: employeeId ?? null,
        speed: Number(speed),
        speedLimit: Number(speedLimit),
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        roadName: roadName ?? null
      });
      const plateLabel = plate || `Viatura #${resolvedVehicleId}`;
      await notifyOwner({
        title: "\u26A0\uFE0F Alerta de Velocidade (GPS)",
        content: `${plateLabel} a ${speed} km/h (limite: ${speedLimit} km/h)${roadName ? " em " + roadName : ""}. Excesso: +${speed - speedLimit} km/h.`
      });
      await logActivity({ userId: 0, action: "create", entity: "speed_alert", entityId: id, details: `[API] ${speed}km/h (limite ${speedLimit}km/h) - ${plateLabel}` });
      res.json({ success: true, id, message: "Speed alert registered and admin notified" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  r.post("/vehicle-movement", async (req, res) => {
    try {
      const { vehicleId, plate, employeeId, type, kmReading, latitude, longitude, notes } = req.body;
      if (!employeeId || !type) {
        res.status(400).json({ error: "employeeId and type (pickup/return) are required" });
        return;
      }
      let resolvedVehicleId = vehicleId;
      if (!resolvedVehicleId && plate) {
        const db2 = await getDb2();
        if (db2) {
          const veh = await db2.select().from(vehicles).where(eq6(vehicles.plate, plate)).limit(1);
          if (veh.length > 0) resolvedVehicleId = veh[0].id;
        }
      }
      if (!resolvedVehicleId) {
        res.status(400).json({ error: "vehicleId or valid plate is required" });
        return;
      }
      const id = await createVehicleMovement({
        vehicleId: resolvedVehicleId,
        employeeId: Number(employeeId),
        movementType: type,
        kmReading: kmReading ? Number(kmReading) : null,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        notes: notes ?? null
      });
      await logActivity({ userId: 0, action: "create", entity: "vehicle_movement", entityId: id, details: `[API] ${type} viatura ${plate || "#" + resolvedVehicleId}` });
      res.json({ success: true, id, message: "Vehicle movement registered" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  r.post("/radio-upload", async (req, res) => {
    try {
      const { audioUrl, employeeId, vehicleId, duration } = req.body;
      if (!audioUrl) {
        res.status(400).json({ error: "audioUrl is required" });
        return;
      }
      const result = await transcribeAudio({ audioUrl, language: "pt" });
      if ("error" in result) {
        res.status(500).json({ error: `Transcription failed: ${result.error}` });
        return;
      }
      let summaryText = "";
      try {
        const summary = await invokeLLM({
          messages: [
            { role: "system", content: "Resume a seguinte transcri\xE7\xE3o de r\xE1dio em 1-2 frases curtas em portugu\xEAs. Foca nos pontos operacionais relevantes." },
            { role: "user", content: result.text }
          ]
        });
        summaryText = typeof summary.choices[0].message.content === "string" ? summary.choices[0].message.content : "";
      } catch {
        summaryText = "";
      }
      const id = await createRadioTranscription({
        audioUrl,
        transcription: result.text,
        summary: summaryText,
        employeeId: employeeId ? Number(employeeId) : null,
        vehicleId: vehicleId ? Number(vehicleId) : null,
        duration: duration ? Number(duration) : null,
        transcribedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
        createdById: null
      });
      await logActivity({ userId: 0, action: "create", entity: "radio_transcription", entityId: id, details: `[API] Transcri\xE7\xE3o autom\xE1tica` });
      res.json({ success: true, id, transcription: result.text, summary: summaryText });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  r.get("/docs", (_req, res) => {
    res.json({
      title: "Dashboard Multipark External API",
      version: "1.0",
      auth: "Header X-API-Key required on all endpoints",
      endpoints: [
        {
          method: "GET",
          path: "/api/external/vehicles",
          description: "Listar todas as viaturas",
          response: "{ success, data: [{ id, plate, brand, model, status, projectId }] }"
        },
        {
          method: "GET",
          path: "/api/external/employees",
          description: "Listar todos os colaboradores",
          response: "{ success, data: [{ id, fullName, position, status }] }"
        },
        {
          method: "POST",
          path: "/api/external/speed-alert",
          description: "Registar alerta de velocidade (ex: GPS Zilo)",
          body: "{ vehicleId? | plate?, speed, speedLimit, latitude?, longitude?, roadName?, employeeId? }",
          response: "{ success, id }",
          notes: "Pode enviar vehicleId ou plate. Notifica automaticamente o Super Admin."
        },
        {
          method: "POST",
          path: "/api/external/vehicle-movement",
          description: "Registar movimento de viatura (recolha/devolu\xE7\xE3o)",
          body: "{ vehicleId? | plate?, employeeId, type: 'pickup'|'return', kmReading?, latitude?, longitude?, notes? }",
          response: "{ success, id }"
        },
        {
          method: "POST",
          path: "/api/external/radio-upload",
          description: "Enviar \xE1udio de r\xE1dio para transcri\xE7\xE3o autom\xE1tica",
          body: "{ audioUrl, employeeId?, vehicleId?, duration? }",
          response: "{ success, id, transcription, summary }",
          notes: "O \xE1udio \xE9 transcrito via Whisper e resumido com IA."
        }
      ]
    });
  });
  r.post("/gmail-import", validateApiKey, async (req, res) => {
    try {
      const { occurrences, reviews } = req.body;
      const result = { reviewsImported: 0, reviewsSkipped: 0, incidentsImported: 0, incidentsSkipped: 0, details: [], errors: [] };
      if (Array.isArray(occurrences)) {
        for (const occ of occurrences) {
          try {
            if (occ.sourceEmailId) {
              const existing = await getIncidentBySourceEmailId(occ.sourceEmailId);
              if (existing) {
                result.incidentsSkipped++;
                continue;
              }
            }
            const now = /* @__PURE__ */ new Date();
            const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
            await createIncident({
              incidentType: occ.incidentType || "outro",
              severity: occ.severity || "medium",
              description: occ.description || "",
              vehiclePlate: occ.vehiclePlate || void 0,
              status: "open",
              weekNumber: weekNum,
              yearNumber: now.getFullYear(),
              sourceEmailId: occ.sourceEmailId || void 0,
              aiClassification: occ.aiClassification || void 0,
              gpsLatitude: occ.gpsLatitude || void 0,
              gpsLongitude: occ.gpsLongitude || void 0,
              reservationLink: occ.reservationLink || void 0,
              importedAt: now.toISOString().slice(0, 19).replace("T", " ")
            });
            result.incidentsImported++;
            result.details.push(`Ocorr\xEAncia: ${occ.description?.substring(0, 60) || "sem descri\xE7\xE3o"}`);
          } catch (e) {
            result.errors.push(`Erro ocorr\xEAncia: ${e.message}`);
          }
        }
      }
      if (Array.isArray(reviews)) {
        for (const rev of reviews) {
          try {
            if (rev.sourceEmailId) {
              const existing = await getReviewBySourceEmailId(rev.sourceEmailId);
              if (existing) {
                result.reviewsSkipped++;
                continue;
              }
            }
            const id = await createGoogleReview({
              reviewerName: rev.reviewerName || "An\xF3nimo",
              rating: rev.rating || 5,
              reviewText: rev.reviewText || "",
              reviewDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
              status: "pending_response",
              sourceEmailId: rev.sourceEmailId || void 0,
              importedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
            });
            if (id && rev.aiResponse) {
              await updateGoogleReview(id, { aiResponse: rev.aiResponse, status: "ai_responded" });
            } else if (id) {
              try {
                const llmResp = await invokeLLM({
                  messages: [
                    { role: "system", content: "\xC9s o gestor de atendimento ao cliente de um parque de estacionamento premium. Responde a avalia\xE7\xF5es do Google de forma natural, calorosa e profissional em portugu\xEAs. M\xE1ximo 3 frases." },
                    { role: "user", content: `Avalia\xE7\xE3o de ${rev.rating} estrelas de ${rev.reviewerName}: "${rev.reviewText}". Gera uma resposta.` }
                  ]
                });
                const aiText = typeof llmResp.choices[0].message.content === "string" ? llmResp.choices[0].message.content : "";
                if (aiText) await updateGoogleReview(id, { aiResponse: aiText, status: "ai_responded" });
              } catch {
              }
            }
            result.reviewsImported++;
            result.details.push(`Cr\xEDtica: ${rev.rating}\u2605 de ${rev.reviewerName}`);
          } catch (e) {
            result.errors.push(`Erro review: ${e.message}`);
          }
        }
      }
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("[GmailImport] Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  return r;
}

// server/mcpApi.ts
init_schema();
init_db();
import { Router as Router2 } from "express";
import { and as and6, eq as eq7, sql as sql5 } from "drizzle-orm";
import { drizzle as drizzle3 } from "drizzle-orm/mysql2";
var _db3 = null;
async function db() {
  if (!_db3 && process.env.DATABASE_URL) _db3 = drizzle3(process.env.DATABASE_URL);
  return _db3;
}
function scopesFor(permissions) {
  const s = /* @__PURE__ */ new Set();
  if (!permissions) return s;
  let parts = [];
  try {
    const parsed = JSON.parse(permissions);
    parts = Array.isArray(parsed) ? parsed.map(String) : String(parsed).split(/[,\s]+/);
  } catch {
    parts = permissions.split(/[,\s]+/);
  }
  const set = new Set(parts.map((p) => p.trim().toLowerCase()).filter(Boolean));
  if (set.has("*") || set.has("admin") || set.has("full")) {
    s.add("read");
    s.add("write");
    s.add("admin");
    return s;
  }
  if (set.has("write")) {
    s.add("read");
    s.add("write");
  }
  if (set.has("read")) s.add("read");
  return s;
}
async function validateApiKey2(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) return res.status(401).json({ error: "Missing X-API-Key header" });
  const d = await db();
  if (!d) return res.status(500).json({ error: "Database unavailable" });
  const rows = await d.select().from(apiKeys).where(and6(eq7(apiKeys.apiKey, key), eq7(apiKeys.active, 1))).limit(1);
  if (rows.length === 0) return res.status(403).json({ error: "Invalid or inactive API key" });
  await d.update(apiKeys).set({ lastUsedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") }).where(eq7(apiKeys.id, rows[0].id));
  req.apiKeyInfo = rows[0];
  req.scopes = scopesFor(rows[0].permissions);
  next();
}
function requireScope(scope) {
  return (req, res, next) => {
    const scopes = req.scopes ?? /* @__PURE__ */ new Set();
    if (!scopes.has(scope)) {
      return res.status(403).json({
        error: `Esta API key n\xE3o tem o scope '${scope}'. Scopes da chave: [${Array.from(scopes).join(", ") || "nenhum"}].`
      });
    }
    next();
  };
}
var h = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ error: e?.message || String(e) }));
function parseDate(v) {
  if (!v) return void 0;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? void 0 : d;
}
function createMcpApiRouter() {
  const r = Router2();
  r.use(validateApiKey2);
  r.get("/", (req, res) => {
    res.json({
      service: "Multipark Dashboard MCP Control API",
      version: "1",
      yourScopes: Array.from(req.scopes ?? []),
      endpoints: {
        read: [
          "GET /parks",
          "GET /bookings",
          "GET /bookings/stats",
          "GET /bookings/:externalId",
          "GET /complaints",
          "GET /complaints/stats",
          "GET /complaints/:id",
          "GET /reviews",
          "GET /vehicles",
          "GET /employees",
          "GET /dashboard/summary",
          "GET /campaigns",
          "GET /campaigns/:type/:id/daily"
        ],
        write: [
          "POST /complaints",
          "PATCH /complaints/:id",
          "POST /complaints/:id/messages",
          "POST /reviews",
          "POST /sync/recent",
          "POST /sync/future",
          "POST /sync/day",
          "POST /campaigns/daily"
        ],
        admin: ["DELETE /complaints/:id", "POST /admin/cleanup-duplicates"]
      }
    });
  });
  r.get("/parks", requireScope("read"), h(async (_req, res) => {
    const { PARK_CONFIGS: PARK_CONFIGS2 } = await Promise.resolve().then(() => (init_multipark(), multipark_exports));
    const cities = Array.from(new Set(PARK_CONFIGS2.map((p) => p.city)));
    res.json({
      success: true,
      cities,
      parks: PARK_CONFIGS2.map((p) => ({ id: p.id, name: p.name, city: p.city, closed: !!p.closed }))
    });
  }));
  r.get("/campaigns", requireScope("read"), h(async (_req, res) => {
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    const rows = (r2) => Array.isArray(r2[0]) ? r2[0] : r2;
    const internal = rows(await d.execute(sql5`SELECT id, name, projectId, dailyBudget, city, brand, campaignStatus FROM internal_campaigns ORDER BY name`)).map((c) => ({ ...c, campaignType: "internal" }));
    const ad = rows(await d.execute(sql5`SELECT id, name, projectId, budget AS dailyBudget, platform AS brand, campaignStatus FROM campaigns ORDER BY name`)).map((c) => ({ ...c, city: null, campaignType: "ad" }));
    res.json({ success: true, count: internal.length + ad.length, campaigns: [...internal, ...ad] });
  }));
  r.get("/campaigns/:type/:id/daily", requireScope("read"), h(async (req, res) => {
    const type = String(req.params.type);
    if (type !== "internal" && type !== "ad") return res.status(400).json({ error: "type deve ser 'internal' ou 'ad'" });
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id inv\xE1lido" });
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    const rows = (r2) => Array.isArray(r2[0]) ? r2[0] : r2;
    const daily = rows(await d.execute(sql5`SELECT costDate, amount, impressions, clicks, ctr, conversions, conversionValue, notes FROM internal_campaign_costs WHERE campaignType = ${type} AND campaignId = ${id} ORDER BY costDate DESC LIMIT 120`));
    res.json({ success: true, count: daily.length, daily });
  }));
  r.post("/campaigns/daily", requireScope("write"), h(async (req, res) => {
    const b = req.body ?? {};
    const date = String(b.costDate ?? b.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "costDate (YYYY-MM-DD) \xE9 obrigat\xF3rio" });
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    const rows = (r2) => Array.isArray(r2[0]) ? r2[0] : r2;
    let campaignType = b.campaignType ?? null;
    let campaignId = b.campaignId != null ? Number(b.campaignId) : null;
    if ((!campaignType || campaignId == null) && b.name) {
      const name = String(b.name);
      const hitInternal = rows(await d.execute(sql5`SELECT id FROM internal_campaigns WHERE name = ${name} LIMIT 1`))[0];
      if (hitInternal) {
        campaignType = "internal";
        campaignId = Number(hitInternal.id);
      } else {
        const hitAd = rows(await d.execute(sql5`SELECT id FROM campaigns WHERE name = ${name} LIMIT 1`))[0];
        if (hitAd) {
          campaignType = "ad";
          campaignId = Number(hitAd.id);
        }
      }
      if (campaignId == null) return res.status(404).json({ error: `Campanha "${name}" n\xE3o encontrada (usa GET /campaigns para listar)` });
    }
    if (campaignType !== "internal" && campaignType !== "ad") return res.status(400).json({ error: "campaignType deve ser 'internal' ou 'ad' (ou indica name)" });
    if (campaignId == null || !Number.isFinite(campaignId)) return res.status(400).json({ error: "campaignId \xE9 obrigat\xF3rio (ou indica name)" });
    const num = (v) => v === void 0 || v === null || v === "" ? null : Number(v);
    const amount = num(b.amount ?? b.spend) ?? 0;
    const impressions = num(b.impressions);
    const clicks = num(b.clicks);
    const ctr = num(b.ctr) ?? (clicks != null && impressions ? Math.round(clicks / impressions * 1e5) / 1e3 : null);
    const conversions = num(b.conversions);
    const conversionValue = num(b.conversionValue);
    const notes = b.notes != null ? String(b.notes) : null;
    await d.execute(sql5`
      INSERT INTO internal_campaign_costs (campaignType, campaignId, costDate, amount, impressions, clicks, ctr, conversions, conversionValue, notes, createdById)
      VALUES (${campaignType}, ${campaignId}, ${date}, ${amount}, ${impressions}, ${clicks}, ${ctr}, ${conversions}, ${conversionValue}, ${notes}, ${req.apiKeyInfo?.createdById ?? null})
      ON DUPLICATE KEY UPDATE
        amount = ${amount},
        impressions = COALESCE(${impressions}, impressions),
        clicks = COALESCE(${clicks}, clicks),
        ctr = COALESCE(${ctr}, ctr),
        conversions = COALESCE(${conversions}, conversions),
        conversionValue = COALESCE(${conversionValue}, conversionValue),
        notes = COALESCE(${notes}, notes)`);
    await logActivity({ userId: 0, action: "update", entity: "campaign_daily", entityId: campaignId, details: `[MCP] ${campaignType}:${campaignId} ${date} \u20AC${amount}` });
    res.json({ success: true, campaignType, campaignId, costDate: date });
  }));
  r.get("/bookings", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getMultiparkBookings({
      status: q.status ? String(q.status) : void 0,
      parkingType: q.parkingType ? String(q.parkingType) : void 0,
      city: q.city ? String(q.city) : void 0,
      parkId: q.parkId ? String(q.parkId) : void 0,
      from: parseDate(q.from),
      to: parseDate(q.to),
      search: q.search ? String(q.search) : void 0,
      limit: q.limit ? Math.min(Number(q.limit), 500) : 100,
      offset: q.offset ? Number(q.offset) : 0
    });
    res.json({ success: true, count: list.length, data: list });
  }));
  r.get("/bookings/stats", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const stats = await getMultiparkBookingStats({
      from: q.from ? String(q.from) : void 0,
      to: q.to ? String(q.to) : void 0,
      projectId: q.projectId ? Number(q.projectId) : void 0
    });
    res.json({ success: true, data: stats });
  }));
  r.get("/bookings/:externalId", requireScope("read"), h(async (req, res) => {
    const ext = req.params.externalId;
    const local = await getMultiparkBookingByExternalId(ext);
    let live = null;
    let park = null;
    try {
      const { getBookingTryAllParks: getBookingTryAllParks2 } = await Promise.resolve().then(() => (init_multipark(), multipark_exports));
      const found = await getBookingTryAllParks2(ext);
      if (found) {
        live = found.booking;
        park = { id: found.parkConfig.id, name: found.parkConfig.name, city: found.parkConfig.city };
      }
    } catch {
    }
    if (!local && !live) return res.status(404).json({ error: "Reserva n\xE3o encontrada (local nem API)" });
    res.json({ success: true, local: local ?? null, live, park });
  }));
  r.get("/complaints", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getComplaints({
      status: q.status ? String(q.status) : void 0,
      type: q.type ? String(q.type) : void 0,
      projectId: q.projectId ? Number(q.projectId) : void 0,
      assignedToId: q.assignedToId ? Number(q.assignedToId) : void 0
    });
    res.json({ success: true, count: list.length, data: list });
  }));
  r.get("/complaints/stats", requireScope("read"), h(async (req, res) => {
    const projectId = req.query.projectId ? Number(req.query.projectId) : void 0;
    res.json({ success: true, data: await getComplaintStats(projectId) });
  }));
  r.get("/complaints/:id", requireScope("read"), h(async (req, res) => {
    const id = Number(req.params.id);
    const complaint = await getComplaintById(id);
    if (!complaint) return res.status(404).json({ error: "Reclama\xE7\xE3o n\xE3o encontrada" });
    res.json({
      success: true,
      data: { complaint, messages: await getComplaintMessages(id), photos: await getComplaintPhotos(id) }
    });
  }));
  r.post("/complaints", requireScope("write"), h(async (req, res) => {
    const b = req.body ?? {};
    if (!b.title) return res.status(400).json({ error: "title \xE9 obrigat\xF3rio" });
    if (!b.type) return res.status(400).json({ error: "type \xE9 obrigat\xF3rio (damage|dirt|delay|overcharge|staff|other)" });
    const slaHours = b.slaHours ? Number(b.slaHours) : null;
    const slaDeadline = slaHours ? new Date(Date.now() + slaHours * 36e5).toISOString().slice(0, 19).replace("T", " ") : null;
    const id = await createComplaint({
      title: String(b.title),
      description: b.description ?? null,
      complaintType: b.type,
      complaintPriority: b.priority ?? "medium",
      complaintStatus: "new",
      clientName: b.clientName ?? null,
      clientEmail: b.clientEmail ?? null,
      clientPhone: b.clientPhone ?? null,
      reservationRef: b.reservationRef ?? null,
      vehiclePlate: b.vehiclePlate ?? null,
      slaDeadline,
      projectId: b.projectId ? Number(b.projectId) : null,
      assignedToId: b.assignedToId ? Number(b.assignedToId) : null,
      createdById: req.apiKeyInfo?.createdById ?? null
    });
    await logActivity({ userId: 0, action: "create", entity: "complaint", entityId: id, details: `[MCP] ${b.title}` });
    res.json({ success: true, id });
  }));
  r.patch("/complaints/:id", requireScope("write"), h(async (req, res) => {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    const data = {};
    if (b.title !== void 0) data.title = b.title;
    if (b.description !== void 0) data.description = b.description;
    if (b.type !== void 0) data.complaintType = b.type;
    if (b.status !== void 0) data.complaintStatus = b.status;
    if (b.priority !== void 0) data.complaintPriority = b.priority;
    if (b.assignedToId !== void 0) data.assignedToId = b.assignedToId === null ? null : Number(b.assignedToId);
    if (b.penaltyPoints !== void 0) data.penaltyPoints = Number(b.penaltyPoints);
    if (b.slaHours !== void 0) data.slaDeadline = Number(b.slaHours) > 0 ? new Date(Date.now() + Number(b.slaHours) * 36e5) : null;
    if (b.status === "resolved") data.resolvedAt = /* @__PURE__ */ new Date();
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "Nada para atualizar" });
    await updateComplaint(id, data);
    await logActivity({ userId: 0, action: "update", entity: "complaint", entityId: id, details: `[MCP] update` });
    res.json({ success: true });
  }));
  r.post("/complaints/:id/messages", requireScope("write"), h(async (req, res) => {
    const complaintId = Number(req.params.id);
    const b = req.body ?? {};
    if (!b.message) return res.status(400).json({ error: "message \xE9 obrigat\xF3rio" });
    const msgId = await addComplaintMessage({
      complaintId,
      message: String(b.message),
      isInternal: b.isInternal ? 1 : 0,
      authorId: req.apiKeyInfo?.createdById ?? null,
      authorName: b.authorName ?? "MCP"
    });
    res.json({ success: true, id: msgId });
  }));
  r.delete("/complaints/:id", requireScope("admin"), h(async (req, res) => {
    const id = Number(req.params.id);
    await deleteComplaint(id);
    await logActivity({ userId: 0, action: "delete", entity: "complaint", entityId: id, details: `[MCP] delete` });
    res.json({ success: true });
  }));
  r.get("/reviews", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getGoogleReviews({
      rating: q.rating ? Number(q.rating) : void 0,
      status: q.status ? String(q.status) : void 0,
      projectId: q.projectId ? Number(q.projectId) : void 0
    });
    res.json({ success: true, count: list.length, data: list });
  }));
  r.post("/reviews", requireScope("write"), h(async (req, res) => {
    const b = req.body ?? {};
    if (!b.reviewerName || !b.rating) return res.status(400).json({ error: "reviewerName e rating s\xE3o obrigat\xF3rios" });
    const reviewDate = (b.reviewDate ? new Date(b.reviewDate) : /* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
    const id = await createGoogleReview({
      reviewerName: String(b.reviewerName),
      reviewerEmail: b.reviewerEmail ?? null,
      rating: Number(b.rating),
      reviewText: b.reviewText ?? null,
      reviewDate,
      projectId: b.projectId ? Number(b.projectId) : null,
      vehiclePlate: b.vehiclePlate ?? null,
      createdById: req.apiKeyInfo?.createdById ?? null
    });
    res.json({ success: true, id });
  }));
  r.get("/vehicles", requireScope("read"), h(async (_req, res) => {
    const list = await getVehicles();
    res.json({ success: true, count: list.length, data: list.map((v) => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model, status: v.status, projectId: v.projectId })) });
  }));
  r.get("/employees", requireScope("read"), h(async (_req, res) => {
    const list = await getAllEmployees();
    res.json({ success: true, count: list.length, data: list.map((e) => ({ id: e.employee.id, fullName: e.employee.fullName, position: e.employee.position, projectId: e.employee.projectId })) });
  }));
  r.post("/sync/recent", requireScope("write"), h(async (req, res) => {
    const { runRecentCronSync: runRecentCronSync2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
    const windowMinutes = req.body?.windowMinutes ? Number(req.body.windowMinutes) : 30;
    res.json({ success: true, ...await runRecentCronSync2(windowMinutes) });
  }));
  r.post("/sync/future", requireScope("write"), h(async (req, res) => {
    const { runFutureCronSync: runFutureCronSync2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
    const weeks = req.body?.weeksAhead ? Number(req.body.weeksAhead) : 4;
    res.json({ success: true, ...await runFutureCronSync2(weeks) });
  }));
  r.post("/sync/day", requireScope("write"), h(async (req, res) => {
    const date = String(req.body?.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "date (YYYY-MM-DD) \xE9 obrigat\xF3rio" });
    const { syncBookings: syncBookings2, enrichBookingsBatch: enrichBookingsBatch2, syncBookingHistoryBatch: syncBookingHistoryBatch2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
    const report = await syncBookings2({ startDate: date, endDate: date });
    const [enrichRes, historyRes] = await Promise.allSettled([enrichBookingsBatch2(100), syncBookingHistoryBatch2(50)]);
    res.json({
      success: true,
      date,
      report,
      enriched: enrichRes.status === "fulfilled" ? enrichRes.value.enriched : 0,
      historyFetched: historyRes.status === "fulfilled" ? historyRes.value.fetched : 0
    });
  }));
  r.post("/admin/migrate-0048", requireScope("admin"), h(async (_req, res) => {
    const { MIGRATION_0048_STATEMENTS: MIGRATION_0048_STATEMENTS2, IDEMPOTENT_ERROR_CODES_0048: IDEMPOTENT_ERROR_CODES_00482 } = await Promise.resolve().then(() => (init_migration_0048(), migration_0048_exports));
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    let ok = 0, skipped = 0;
    const errors = [];
    for (const stmt of MIGRATION_0048_STATEMENTS2) {
      try {
        await d.execute(sql5.raw(stmt));
        ok++;
      } catch (e) {
        const code = e?.code ?? e?.cause?.code;
        const msg = String(e?.cause?.message ?? e?.message ?? e);
        if (code && IDEMPOTENT_ERROR_CODES_00482.has(code) || /duplicate column/i.test(msg)) skipped++;
        else errors.push(`${code ?? "ERR"}: ${msg.slice(0, 200)}`);
      }
    }
    res.json({ success: errors.length === 0, ok, skipped, errors });
  }));
  r.post("/admin/cleanup-duplicates", requireScope("admin"), h(async (_req, res) => {
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    const result = await d.execute(sql5`
      DELETE FROM multipark_bookings WHERE id IN (
        SELECT id FROM (
          SELECT b1.id FROM multipark_bookings b1
          INNER JOIN multipark_bookings b2
            ON b1.externalId = b2.externalId
           AND (b1.updatedAt < b2.updatedAt OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id))
          LIMIT 5000
        ) AS t
      )`);
    const meta = Array.isArray(result[0]) ? result[0] : result;
    res.json({ success: true, deleted: Number(meta?.affectedRows ?? 0) });
  }));
  r.get("/dashboard/summary", requireScope("read"), h(async (req, res) => {
    const d = await db();
    const q = req.query;
    const from = q.from ? String(q.from) : void 0;
    const to = q.to ? String(q.to) : void 0;
    const [bookingStats, complaintStats] = await Promise.all([
      getMultiparkBookingStats({ from, to }),
      getComplaintStats()
    ]);
    let byCity = [];
    if (d) {
      const conds = [];
      if (from) conds.push(sql5`${multiparkBookings.checkIn} >= ${from}`);
      if (to) conds.push(sql5`${multiparkBookings.checkIn} <= ${to}`);
      byCity = await d.select({ city: multiparkBookings.city, count: sql5`COUNT(*)`, revenue: sql5`COALESCE(SUM(${multiparkBookings.totalPrice}),0)` }).from(multiparkBookings).where(conds.length ? and6(...conds) : void 0).groupBy(multiparkBookings.city);
    }
    res.json({ success: true, bookings: bookingStats, complaints: complaintStats, byCity });
  }));
  return r;
}

// server/_core/api-entry.ts
import { createExpressMiddleware } from "@trpc/server/adapters/express";
init_multipark();
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
var initError = null;
try {
  registerOAuthRoutes(app);
  app.use("/api/external", createExternalApiRouter());
  app.use("/api/v1", createMcpApiRouter());
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
} catch (err) {
  initError = err.stack || err.message || String(err);
  console.error("[API Init Error]", initError);
}
app.get("/api/debug/booking", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden \u2014 admin only" });
    }
    const id = String(req.query.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "Missing ?id=<externalId>" });
    const found = await getBookingTryAllParks(id);
    if (!found) {
      return res.status(404).json({
        error: "Reserva n\xE3o encontrada em nenhum parque",
        triedKeys: Object.keys(process.env).filter((k) => k.startsWith("MULTIPARK_API_KEY_"))
      });
    }
    return res.json({
      park: `${found.parkConfig.name} (${found.parkConfig.city})`,
      parkId: found.parkConfig.id,
      booking: found.booking
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});
app.get("/api/debug/probe-partner", async (req, res) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden \u2014 admin only" });
    }
    const id = String(req.query.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "Missing ?id=<externalId>" });
    const { getBookingTryAllParks: getBookingTryAllParks2, PARK_CONFIGS: PARK_CONFIGS2, getParkApiKey: getParkApiKey2 } = await Promise.resolve().then(() => (init_multipark(), multipark_exports));
    const found = await getBookingTryAllParks2(id);
    if (!found) return res.status(404).json({ error: "Reserva n\xE3o encontrada" });
    const apiKey = getParkApiKey2(found.parkConfig);
    if (!apiKey) return res.status(500).json({ error: "Sem API key para o parque" });
    const partnerId = found.booking.partnerId;
    const base = process.env.MULTIPARK_API_URL || "https://api.multipark.pt/api/v1/bookings-api";
    const baseRoot = base.replace(/\/bookings-api$/, "");
    const probes = [
      { name: "GET /partners/:partnerId", url: `${base}/partners/${partnerId}` },
      { name: "GET /partner/:partnerId", url: `${base}/partner/${partnerId}` },
      { name: "GET /users/:partnerId", url: `${base}/users/${partnerId}` },
      { name: "GET /agents/:partnerId", url: `${base}/agents/${partnerId}` },
      { name: "GET /agent/:partnerId", url: `${base}/agent/${partnerId}` },
      { name: "GET /bookings/:id?include=partner", url: `${base}/bookings/${id}?include=partner` },
      { name: "GET /bookings/:id?expand=partner", url: `${base}/bookings/${id}?expand=partner` },
      { name: "GET /bookings/:id?fields=*", url: `${base}/bookings/${id}?fields=*` },
      { name: "GET /bookings/:id/partner", url: `${base}/bookings/${id}/partner` },
      { name: "GET /bookings/:id/details", url: `${base}/bookings/${id}/details` },
      { name: "GET /partners (lista)", url: `${base}/partners` },
      { name: "GET (root)/partners/:partnerId", url: `${baseRoot}/partners/${partnerId}` },
      { name: "GET (root)/users/:partnerId", url: `${baseRoot}/users/${partnerId}` }
    ];
    const results = [];
    for (const probe of probes) {
      try {
        const r = await fetch(probe.url, {
          headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" }
        });
        const status = r.status;
        let body = null;
        try {
          body = await r.json();
        } catch {
        }
        results.push({
          probe: probe.name,
          url: probe.url,
          status,
          ok: r.ok,
          body: r.ok ? body : body?.message ?? body?.error ?? "\u2014"
        });
      } catch (err) {
        results.push({ probe: probe.name, url: probe.url, error: err.message });
      }
    }
    return res.json({
      bookingId: id,
      partnerId,
      partnerNameFromReport: found.booking.partnerName,
      probes: results
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});
function cronAuthOk(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers["authorization"] === `Bearer ${secret}`;
}
app.get("/api/cron/multipark-sync", async (req, res) => {
  if (!cronAuthOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { runRecentCronSync: runRecentCronSync2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
    const result = await runRecentCronSync2(30);
    res.json({ ok: true, ranAt: (/* @__PURE__ */ new Date()).toISOString(), ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});
app.get("/api/cron/multipark-future", async (req, res) => {
  if (!cronAuthOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { runFutureCronSync: runFutureCronSync2 } = await Promise.resolve().then(() => (init_multiparkBookingSync(), multiparkBookingSync_exports));
    const result = await runFutureCronSync2(4);
    res.json({ ok: true, ranAt: (/* @__PURE__ */ new Date()).toISOString(), ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});
app.get("/api/cron/daily-ops", async (req, res) => {
  if (!cronAuthOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { collectDailyDriverData: collectDailyDriverData2 } = await Promise.resolve().then(() => (init_dailyDriverCollection(), dailyDriverCollection_exports));
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const result = await collectDailyDriverData2(yesterday);
    res.json({ ok: true, ranAt: (/* @__PURE__ */ new Date()).toISOString(), date: yesterday.toISOString().slice(0, 10), ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});
app.get("/api/cron/multipark-cleanup", async (req, res) => {
  if (!cronAuthOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { getDb: getDb3 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { sql: sql6 } = await import("drizzle-orm");
    const db2 = await getDb3();
    if (!db2) return res.status(500).json({ ok: false, error: "DB not available" });
    const result = await db2.execute(sql6`
      DELETE FROM multipark_bookings WHERE id IN (
        SELECT id FROM (
          SELECT b1.id FROM multipark_bookings b1
          INNER JOIN multipark_bookings b2
            ON b1.externalId = b2.externalId
           AND (
                 b1.updatedAt < b2.updatedAt
              OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
           )
          LIMIT 5000
        ) AS t
      )
    `);
    const meta = Array.isArray(result[0]) ? result[0] : result;
    const deleted = Number(meta?.affectedRows ?? 0);
    res.json({ ok: true, ranAt: (/* @__PURE__ */ new Date()).toISOString(), deleted });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
});
app.get("/api/health", (_req, res) => {
  res.json({
    ok: !initError,
    error: initError,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      VITE_APP_ID: !!process.env.VITE_APP_ID,
      NODE_ENV: process.env.NODE_ENV ?? null
    }
  });
});
var handler = async (req, res) => {
  if (initError && !req.url.includes("/api/health")) {
    return res.status(500).json({ error: "Server init failed", details: initError });
  }
  app(req, res);
};
var api_entry_default = handler;
export {
  api_entry_default as default
};
