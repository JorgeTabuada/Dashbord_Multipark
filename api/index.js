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
  bookingHistory: () => bookingHistory,
  campaignDailyStats: () => campaignDailyStats,
  campaigns: () => campaigns,
  careerExamAttempts: () => careerExamAttempts,
  careerExamQuestions: () => careerExamQuestions,
  careerExams: () => careerExams,
  complaintMessages: () => complaintMessages,
  complaintPhotos: () => complaintPhotos,
  complaints: () => complaints,
  dailyDriverHistory: () => dailyDriverHistory,
  employeeDocuments: () => employeeDocuments,
  employees: () => employees,
  expenseCategories: () => expenseCategories,
  expenses: () => expenses,
  extraRates: () => extraRates,
  faqs: () => faqs,
  googleReviews: () => googleReviews,
  gpsAlerts: () => gpsAlerts,
  incidents: () => incidents,
  inviteTokens: () => inviteTokens,
  invoices: () => invoices,
  lostFoundItems: () => lostFoundItems,
  lostFoundMessages: () => lostFoundMessages,
  lostFoundPhotos: () => lostFoundPhotos,
  marketingExpenses: () => marketingExpenses,
  multiparkBookings: () => multiparkBookings,
  multiparkDailySnapshots: () => multiparkDailySnapshots,
  multiparkSyncLogs: () => multiparkSyncLogs,
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
var activityLogs, annualReports, apiKeys, campaignDailyStats, campaigns, careerExamAttempts, careerExamQuestions, careerExams, complaintMessages, complaintPhotos, complaints, dailyDriverHistory, employeeDocuments, employees, expenseCategories, expenses, extraRates, faqs, googleReviews, gpsAlerts, incidents, inviteTokens, invoices, lostFoundItems, lostFoundMessages, lostFoundPhotos, bookingHistory, marketingExpenses, multiparkBookings, multiparkDailySnapshots, multiparkSyncLogs, partnershipInvoices, partnershipTransactions, partnerships, payslipHistory, pdaCheckins, pdas, performanceEvaluations, projectEmployees, projects, quizAttempts, quizQuestions, radioTranscriptions, schedules, services, speedAlerts, speedLimits, speedViolations, taskAssignees, tasks, timeRecords, trainingCategories, trainingManuals, trainingVideos, users, vehicleMovements, vehicles;
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
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
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
      mealAllowancePerDay: decimal({ precision: 6, scale: 2 })
    });
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
      createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
      updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
    });
    extraRates = mysqlTable(
      "extra_rates",
      {
        id: int().autoincrement().primaryKey(),
        level: int().notNull(),
        hourlyRate: decimal({ precision: 6, scale: 2 }).notNull(),
        label: varchar({ length: 64 }),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("extra_rates_level_unique").on(table.level)
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
        cancelledAt: timestamp({ mode: "string" }),
        cancelReason: text(),
        notes: text(),
        rawJson: text(),
        bookingCreatedAt: timestamp({ mode: "string" }),
        syncedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("multipark_bookings_externalId_unique").on(table.externalId)
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
      partnerType: mysqlEnum(["aggregator", "agency", "pro_client", "other", "corporate", "retainer"]).default("other").notNull(),
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
      monthlyFee: int().default(0)
    });
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
  getBooking: () => getBooking,
  getBookingsReport: () => getBookingsReport,
  getBookingsReportAllParks: () => getBookingsReportAllParks,
  getBookingsReportForPark: () => getBookingsReportForPark,
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
  return PARK_CONFIGS.filter((p) => !!process.env[p.envKey]);
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
        body: body ? JSON.stringify(body) : void 0
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
async function getBooking(id) {
  return multiparkRequest({ path: `/bookings/${id}` });
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
var MAX_RETRIES, PARK_CONFIGS;
var init_multipark = __esm({
  "server/multipark.ts"() {
    "use strict";
    init_env();
    MAX_RETRIES = 3;
    PARK_CONFIGS = [
      { id: "LISBON_AIRPARK", name: "Airpark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_AIRPARK" },
      { id: "LISBON_REDPARK", name: "Redpark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_REDPARK" },
      { id: "LISBON_SKYPARK", name: "Skypark", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_SKYPARK" },
      { id: "LISBON_TOP_PARKING", name: "Top-Parking", city: "Lisboa", envKey: "MULTIPARK_API_KEY_LISBON_TOP_PARKING" },
      { id: "FARO_AIRPARK", name: "Airpark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_AIRPARK" },
      { id: "FARO_REDPARK", name: "Redpark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_REDPARK" },
      { id: "FARO_SKYPARK", name: "Skypark", city: "Faro", envKey: "MULTIPARK_API_KEY_FARO_SKYPARK" },
      { id: "PORTO_AIRPARK", name: "Airpark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_AIRPARK" },
      { id: "PORTO_REDPARK", name: "Redpark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_REDPARK" },
      { id: "PORTO_SKYPARK", name: "Skypark", city: "Porto", envKey: "MULTIPARK_API_KEY_PORTO_SKYPARK" }
    ];
  }
});

// server/_core/api-entry.ts
import express from "express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
init_schema();
init_env();
init_schema();
import { and, desc, eq, gte, lte, like, or, sql, aliasedTable, isNotNull, isNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
var _db = null;
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
  const db = await getDb();
  if (!db) return;
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
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}
async function updateUserRole(userId, role) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
async function createManualUser(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const openId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department ?? null,
    loginMethod: "manual",
    isActive: true
  });
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function updateUser(userId, data) {
  const db = await getDb();
  if (!db) return;
  const updates = {};
  if (data.name !== void 0) updates.name = data.name;
  if (data.email !== void 0) updates.email = data.email;
  if (data.role !== void 0) updates.role = data.role;
  if (data.department !== void 0) updates.department = data.department;
  if (data.isActive !== void 0) updates.isActive = data.isActive;
  if (Object.keys(updates).length > 0) {
    await db.update(users).set(updates).where(eq(users.id, userId));
  }
}
async function toggleUserActive(userId, isActive) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}
async function getUserById(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}
async function getSuperAdmins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, "super_admin"));
}
async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenseCategories).orderBy(expenseCategories.name);
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(expenseCategories).values(data);
}
async function seedDefaultCategories() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(expenseCategories).limit(1);
  if (existing.length > 0) return;
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
    { name: "Terminal de Pagamento", department: "Financeiro", color: "#059669" },
    { name: "Despesas Operacionais", department: "Operacional", color: "#d97706" },
    { name: "Outros", department: "Geral", color: "#94a3b8" }
  ];
  await db.insert(expenseCategories).values(defaults);
}
var buyerEmployees = aliasedTable(employees, "buyer");
async function getExpenses(filters = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.startDate) conditions.push(gte(expenses.expenseDate, filters.startDate));
  if (filters.endDate) conditions.push(lte(expenses.expenseDate, filters.endDate));
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
  const query = db.select({
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
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({
    expense: expenses,
    category: expenseCategories,
    project: projects,
    insertedBy: users,
    buyer: buyerEmployees
  }).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(users, eq(expenses.insertedById, users.id)).leftJoin(buyerEmployees, eq(expenses.buyerId, buyerEmployees.id)).where(eq(expenses.id, id)).limit(1);
  return result[0];
}
async function createExpense(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(expenses).values(data);
  return result;
}
async function updateExpense(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(expenses).set(data).where(eq(expenses.id, id));
}
async function deleteExpense(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}
async function getExpenseStats() {
  const db = await getDb();
  if (!db) return null;
  const now = /* @__PURE__ */ new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [daily, weekly, monthly, yearly, byCategory, byProject, byUser, pending, overdue] = await Promise.all([
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, startOfDay)),
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, startOfWeek)),
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, startOfMonth)),
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(gte(expenses.expenseDate, startOfYear)),
    db.select({
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      color: expenseCategories.color,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(gte(expenses.expenseDate, startOfMonth)).groupBy(expenses.categoryId, expenseCategories.name, expenseCategories.color).orderBy(desc(sql`SUM(expenses.amount)`)).limit(8),
    db.select({
      projectId: expenses.projectId,
      projectName: projects.name,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).where(gte(expenses.expenseDate, startOfMonth)).groupBy(expenses.projectId, projects.name).orderBy(desc(sql`SUM(expenses.amount)`)).limit(5),
    db.select({
      userId: expenses.insertedById,
      userName: users.name,
      total: sql`COALESCE(SUM(expenses.amount), 0)`,
      count: sql`COUNT(*)`
    }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).where(gte(expenses.expenseDate, startOfMonth)).groupBy(expenses.insertedById, users.name).orderBy(desc(sql`SUM(expenses.amount)`)).limit(5),
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(eq(expenses.status, "pending")),
    db.select({ total: sql`COALESCE(SUM(amount), 0)`, count: sql`COUNT(*)` }).from(expenses).where(eq(expenses.status, "overdue"))
  ]);
  const monthlyTrend = await db.select({
    month: sql`DATE_FORMAT(expenseDate, '%Y-%m')`,
    total: sql`COALESCE(SUM(amount), 0)`,
    count: sql`COUNT(*)`
  }).from(expenses).where(gte(expenses.expenseDate, new Date(now.getFullYear(), now.getMonth() - 5, 1))).groupBy(sql`DATE_FORMAT(expenseDate, '%Y-%m')`).orderBy(sql`DATE_FORMAT(expenseDate, '%Y-%m')`);
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
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const future = /* @__PURE__ */ new Date();
  future.setDate(future.getDate() + daysAhead);
  return db.select({
    expense: expenses,
    insertedBy: users,
    project: projects
  }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).leftJoin(projects, eq(expenses.projectId, projects.id)).where(
    and(
      eq(expenses.status, "pending"),
      gte(expenses.paymentDueDate, now),
      lte(expenses.paymentDueDate, future)
    )
  ).orderBy(expenses.paymentDueDate);
}
async function getOverdueExpenses() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select({ expense: expenses, insertedBy: users }).from(expenses).leftJoin(users, eq(expenses.insertedById, users.id)).where(and(eq(expenses.status, "pending"), lte(expenses.paymentDueDate, now)));
}
async function markOverdueExpenses() {
  const db = await getDb();
  if (!db) return;
  const now = /* @__PURE__ */ new Date();
  await db.update(expenses).set({ status: "overdue" }).where(and(eq(expenses.status, "pending"), lte(expenses.paymentDueDate, now)));
}
async function logActivity(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}
async function getActivityLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ log: activityLogs, user: users }).from(activityLogs).leftJoin(users, eq(activityLogs.userId, users.id)).orderBy(desc(activityLogs.createdAt)).limit(limit);
}
async function getAllEmployees(filters = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.isActive !== void 0) conditions.push(eq(employees.isActive, filters.isActive));
  if (filters.position) conditions.push(eq(employees.position, filters.position));
  const q = db.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).orderBy(employees.fullName);
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function getEmployeeById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.id, id)).limit(1);
  return result[0];
}
async function getEmployeeByUserId(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.userId, userId)).limit(1);
  return result[0];
}
async function createEmployee(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(employees).values(data);
}
async function updateEmployee(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(employees).set(data).where(eq(employees.id, id));
}
async function deleteEmployee(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
}
async function getEmployeeDocuments(employeeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId)).orderBy(desc(employeeDocuments.createdAt));
}
async function createEmployeeDocument(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(employeeDocuments).values(data);
}
async function deleteEmployeeDocument(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(employeeDocuments).where(eq(employeeDocuments.id, id));
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
  const db = await getDb();
  if (!db) return [];
  const docs = await db.select({
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
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schedules).where(eq(schedules.employeeId, employeeId)).orderBy(schedules.weekday);
}
async function upsertSchedule(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(schedules).values(data).onDuplicateKeyUpdate({ set: { startTime: data.startTime, endTime: data.endTime, isWorkDay: data.isWorkDay } });
}
async function getTimeRecords(employeeId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(timeRecords.employeeId, employeeId)];
  if (startDate) conditions.push(gte(timeRecords.recordedAt, startDate));
  if (endDate) conditions.push(lte(timeRecords.recordedAt, endDate));
  return db.select().from(timeRecords).where(and(...conditions)).orderBy(desc(timeRecords.recordedAt));
}
async function createTimeRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(timeRecords).values(data);
}
async function getMonthlyHours(employeeId, year, month) {
  const db = await getDb();
  if (!db) return { totalHours: 0, records: [] };
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await db.select().from(timeRecords).where(and(eq(timeRecords.employeeId, employeeId), gte(timeRecords.recordedAt, start), lte(timeRecords.recordedAt, end))).orderBy(timeRecords.recordedAt);
  const totalHours = records.reduce((sum, r) => sum + parseFloat(String(r.hoursWorked ?? 0)), 0);
  return { totalHours, records };
}
async function getExtraRates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(extraRates).orderBy(extraRates.level);
}
async function seedExtraRates() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(extraRates).limit(1);
  if (existing.length > 0) return;
  const defaults = [
    { level: 1, hourlyRate: "8.50", label: "Extra N\xEDvel 1" },
    { level: 2, hourlyRate: "7.00", label: "Extra N\xEDvel 2" },
    { level: 3, hourlyRate: "6.00", label: "Extra N\xEDvel 3" },
    { level: 4, hourlyRate: "5.00", label: "Extra N\xEDvel 4" },
    { level: 5, hourlyRate: "4.00", label: "Extra N\xEDvel 5" }
  ];
  await db.insert(extraRates).values(defaults);
}
async function updateExtraRate(level, hourlyRate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(extraRates).set({ hourlyRate }).where(eq(extraRates.level, level));
}
async function getHRStats() {
  const db = await getDb();
  if (!db) return null;
  const [total] = await db.select({ count: sql`count(*)` }).from(employees).where(eq(employees.isActive, true));
  const [extras] = await db.select({ count: sql`count(*)` }).from(employees).where(and(eq(employees.isActive, true), eq(employees.position, "extra")));
  const [permanent] = await db.select({ count: sql`count(*)` }).from(employees).where(and(eq(employees.isActive, true), eq(employees.contractType, "permanent")));
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [hoursRow] = await db.select({ total: sql`COALESCE(SUM(hoursWorked), 0)` }).from(timeRecords).where(gte(timeRecords.recordedAt, monthStart));
  return {
    totalActive: total?.count ?? 0,
    totalExtras: extras?.count ?? 0,
    totalPermanent: permanent?.count ?? 0,
    monthlyHours: parseFloat(String(hoursRow?.total ?? 0))
  };
}
async function getProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(projects.name);
}
async function getProjectById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}
async function createProject(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(projects).values(data);
}
async function updateProject(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}
async function deleteProject(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(projects).where(eq(projects.parentId, id));
  await db.delete(projects).where(eq(projects.id, id));
}
async function moveProject(id, newParentId) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (newParentId === id) throw new Error("N\xE3o pode mover para si pr\xF3prio");
  if (newParentId !== null) {
    let current = newParentId;
    while (current) {
      const [parent] = await db.select({ id: projects.id, parentId: projects.parentId }).from(projects).where(eq(projects.id, current)).limit(1);
      if (!parent) break;
      if (parent.parentId === id) throw new Error("N\xE3o pode mover para um descendente");
      current = parent.parentId;
    }
  }
  await db.update(projects).set({ parentId: newParentId }).where(eq(projects.id, id));
}
async function getProjectEmployees(projectId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectEmployees).where(eq(projectEmployees.projectId, projectId));
}
async function assignEmployeeToProject(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(projectEmployees).values(data);
}
async function removeEmployeeFromProject(projectId, employeeId) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(projectEmployees).where(
    and(eq(projectEmployees.projectId, projectId), eq(projectEmployees.employeeId, employeeId))
  );
}
async function getTasks(filters) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (filters?.projectId) conds.push(eq(tasks.projectId, filters.projectId));
  if (filters?.assigneeId) conds.push(eq(tasks.assigneeId, filters.assigneeId));
  if (filters?.status) conds.push(eq(tasks.taskStatus, filters.status));
  return db.select().from(tasks).where(conds.length ? and(...conds) : void 0).orderBy(desc(tasks.updatedAt));
}
async function getTaskById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return rows[0];
}
async function createTask(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(tasks).values(data);
}
async function updateTask(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}
async function deleteTask(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}
async function getTaskStats() {
  const db = await getDb();
  if (!db) return { total: 0, backlog: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 };
  const all = await db.select().from(tasks);
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
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.platform) conditions.push(eq(campaigns.platform, filters.platform));
  if (filters.projectId) {
    const allProjects = await db.select().from(projects);
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
  if (filters.status) conditions.push(eq(campaigns.status, filters.status));
  const q = db.select({ campaign: campaigns, project: projects }).from(campaigns).leftJoin(projects, eq(campaigns.projectId, projects.id)).orderBy(desc(campaigns.createdAt));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function getCampaignById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}
async function createCampaign(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(campaigns).values(data);
  return result[0].insertId;
}
async function updateCampaign(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}
async function deleteCampaign(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(campaignDailyStats).where(eq(campaignDailyStats.campaignId, id));
  await db.delete(campaigns).where(eq(campaigns.id, id));
}
async function getCampaignStats(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignDailyStats).where(eq(campaignDailyStats.campaignId, campaignId)).orderBy(desc(campaignDailyStats.date));
}
async function getAllDailyStats(filters = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.from) conditions.push(gte(campaignDailyStats.date, filters.from));
  if (filters.to) conditions.push(lte(campaignDailyStats.date, filters.to));
  if (filters.projectId) {
    const allProjects = await db.select().from(projects);
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
  const q = db.select({ stat: campaignDailyStats, campaign: campaigns, project: projects }).from(campaignDailyStats).leftJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id)).leftJoin(projects, eq(campaigns.projectId, projects.id)).orderBy(desc(campaignDailyStats.date));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function importDailyStats(rows) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (rows.length === 0) return;
  await db.insert(campaignDailyStats).values(rows);
}
async function deleteDailyStat(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(campaignDailyStats).where(eq(campaignDailyStats.id, id));
}
async function getMarketingExpenses(filters = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.category) conditions.push(eq(marketingExpenses.category, filters.category));
  if (filters.projectId) conditions.push(eq(marketingExpenses.projectId, filters.projectId));
  if (filters.from) conditions.push(gte(marketingExpenses.date, filters.from));
  if (filters.to) conditions.push(lte(marketingExpenses.date, filters.to));
  const q = db.select({ expense: marketingExpenses, project: projects }).from(marketingExpenses).leftJoin(projects, eq(marketingExpenses.projectId, projects.id)).orderBy(desc(marketingExpenses.date));
  return conditions.length > 0 ? q.where(and(...conditions)) : q;
}
async function createMarketingExpense(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(marketingExpenses).values(data);
  return result[0].insertId;
}
async function deleteMarketingExpense(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(marketingExpenses).where(eq(marketingExpenses.id, id));
}
async function getMarketingDashboardStats(filters = {}) {
  const db = await getDb();
  if (!db) return { totalSpend: 0, totalReservations: 0, costPerReservation: 0, avgConversionValue: 0, totalMktExpenses: 0, campaignCount: 0 };
  let projectIds = null;
  if (filters.projectId) {
    const allProjects = await db.select().from(projects);
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
  if (filters.from) conditions.push(gte(campaignDailyStats.date, filters.from));
  if (filters.to) conditions.push(lte(campaignDailyStats.date, filters.to));
  if (projectIds) conditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const statsQ = db.select({
    totalSpend: sql`COALESCE(SUM(${campaignDailyStats.spend}), 0)`,
    totalReservations: sql`COALESCE(SUM(${campaignDailyStats.conversions}), 0)`,
    totalConversionValue: sql`COALESCE(SUM(${campaignDailyStats.conversionValue}), 0)`,
    totalImpressions: sql`COALESCE(SUM(${campaignDailyStats.impressions}), 0)`,
    totalClicks: sql`COALESCE(SUM(${campaignDailyStats.clicks}), 0)`
  }).from(campaignDailyStats).innerJoin(campaigns, eq(campaignDailyStats.campaignId, campaigns.id));
  const statsResult = conditions.length > 0 ? await statsQ.where(and(...conditions)) : await statsQ;
  const s = statsResult[0];
  const mktConditions = [];
  if (filters.from) mktConditions.push(gte(marketingExpenses.date, filters.from));
  if (filters.to) mktConditions.push(lte(marketingExpenses.date, filters.to));
  if (projectIds) mktConditions.push(sql`${marketingExpenses.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const mktQ = db.select({
    total: sql`COALESCE(SUM(${marketingExpenses.amount}), 0)`
  }).from(marketingExpenses);
  const mktResult = mktConditions.length > 0 ? await mktQ.where(and(...mktConditions)) : await mktQ;
  const campConditions = [];
  if (projectIds) campConditions.push(sql`${campaigns.projectId} IN (${sql.raw(Array.from(projectIds).join(","))})`);
  const campQ = db.select({ count: sql`COUNT(*)` }).from(campaigns);
  const campCount = campConditions.length > 0 ? await campQ.where(and(...campConditions)) : await campQ;
  const totalSpend = parseFloat(s.totalSpend || "0");
  const totalReservations = s.totalReservations || 0;
  const totalMktExpenses = parseFloat(mktResult[0].total || "0");
  return {
    totalSpend,
    totalReservations,
    costPerReservation: totalReservations > 0 ? (totalSpend + totalMktExpenses) / totalReservations : 0,
    avgConversionValue: totalReservations > 0 ? parseFloat(s.totalConversionValue || "0") / totalReservations : 0,
    totalMktExpenses,
    campaignCount: campCount[0].count,
    totalImpressions: s.totalImpressions || 0,
    totalClicks: s.totalClicks || 0
  };
}
async function getBookingRevenueByProject(filters = {}) {
  const db = await getDb();
  if (!db) return { total: 0, revenue: 0, byProject: [] };
  const conditions = [
    sql`${multiparkBookings.status} != 'CANCELLED'`
  ];
  if (filters.from) conditions.push(gte(multiparkBookings.bookingCreatedAt, filters.from));
  if (filters.to) conditions.push(lte(multiparkBookings.bookingCreatedAt, filters.to + " 23:59:59"));
  if (filters.projectId) {
    const allProjects = await db.select().from(projects);
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
  const rows = await db.select({
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
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  const conditions = [];
  if (filters?.status) conditions.push(eq(vehicles.status, filters.status));
  if (filters?.projectId) conditions.push(eq(vehicles.projectId, filters.projectId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  return query;
}
async function getVehicleById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result[0];
}
async function createVehicle(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(vehicles).values(data);
  return result[0].insertId;
}
async function updateVehicle(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
}
async function deleteVehicle(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(vehicles).where(eq(vehicles.id, id));
}
async function getVehicleMovements(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(vehicleMovements).orderBy(desc(vehicleMovements.createdAt));
  const conditions = [];
  if (filters?.vehicleId) conditions.push(eq(vehicleMovements.vehicleId, filters.vehicleId));
  if (filters?.employeeId) conditions.push(eq(vehicleMovements.employeeId, filters.employeeId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createVehicleMovement(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(vehicleMovements).values(data);
  return result[0].insertId;
}
async function getSpeedAlerts(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(speedAlerts).orderBy(desc(speedAlerts.createdAt));
  const conditions = [];
  if (filters?.vehicleId) conditions.push(eq(speedAlerts.vehicleId, filters.vehicleId));
  if (filters?.acknowledged !== void 0) conditions.push(eq(speedAlerts.acknowledged, filters.acknowledged));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createSpeedAlert(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(speedAlerts).values(data);
  return result[0].insertId;
}
async function acknowledgeSpeedAlert(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(speedAlerts).set({ acknowledged: true, acknowledgedById: userId, acknowledgedAt: /* @__PURE__ */ new Date() }).where(eq(speedAlerts.id, id));
}
async function getRadioTranscriptions(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(radioTranscriptions).orderBy(desc(radioTranscriptions.createdAt));
  const conditions = [];
  if (filters?.employeeId) conditions.push(eq(radioTranscriptions.employeeId, filters.employeeId));
  if (filters?.vehicleId) conditions.push(eq(radioTranscriptions.vehicleId, filters.vehicleId));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters?.limit) query = query.limit(filters.limit);
  return query;
}
async function createRadioTranscription(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(radioTranscriptions).values(data);
  return result[0].insertId;
}
async function getOperationalStats() {
  const db = await getDb();
  if (!db) return { totalVehicles: 0, activeVehicles: 0, todayAlerts: 0, unacknowledgedAlerts: 0, todayMovements: 0 };
  const allVehicles = await db.select().from(vehicles);
  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter((v) => v.status === "active").length;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const allAlerts = await db.select().from(speedAlerts).where(gte(speedAlerts.createdAt, today));
  const todayAlerts = allAlerts.length;
  const allUnack = await db.select().from(speedAlerts).where(eq(speedAlerts.acknowledged, false));
  const unacknowledgedAlerts = allUnack.length;
  const allMovements = await db.select().from(vehicleMovements).where(gte(vehicleMovements.createdAt, today));
  const todayMovements = allMovements.length;
  return { totalVehicles, activeVehicles, todayAlerts, unacknowledgedAlerts, todayMovements };
}
async function getVehicleDriverHistory(vehicleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vehicleMovements).where(eq(vehicleMovements.vehicleId, vehicleId)).orderBy(desc(vehicleMovements.createdAt));
}
async function getApiKeys() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}
async function createApiKey(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(apiKeys).values(data);
  return Number(result[0].insertId);
}
async function toggleApiKey(id, active) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(apiKeys).set({ active }).where(eq(apiKeys.id, id));
}
async function deleteApiKey(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}
async function getComplaints(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(complaints.status, filters.status));
  if (filters?.type) conditions.push(eq(complaints.type, filters.type));
  if (filters?.vehicleId) conditions.push(eq(complaints.vehicleId, filters.vehicleId));
  if (filters?.assignedToId) conditions.push(eq(complaints.assignedToId, filters.assignedToId));
  if (filters?.projectId) conditions.push(eq(complaints.projectId, filters.projectId));
  return db.select().from(complaints).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(complaints.createdAt));
}
async function getComplaintById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
  return result[0];
}
async function createComplaint(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(complaints).values(data);
  return Number(result[0].insertId);
}
async function updateComplaint(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(complaints).set(data).where(eq(complaints.id, id));
}
async function deleteComplaint(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(complaintPhotos).where(eq(complaintPhotos.complaintId, id));
  await db.delete(complaintMessages).where(eq(complaintMessages.complaintId, id));
  await db.delete(complaints).where(eq(complaints.id, id));
}
async function getComplaintMessages(complaintId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complaintMessages).where(eq(complaintMessages.complaintId, complaintId)).orderBy(complaintMessages.createdAt);
}
async function addComplaintMessage(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(complaintMessages).values(data);
  return Number(result[0].insertId);
}
async function getComplaintPhotos(complaintId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complaintPhotos).where(eq(complaintPhotos.complaintId, complaintId)).orderBy(complaintPhotos.createdAt);
}
async function addComplaintPhoto(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(complaintPhotos).values(data);
  return Number(result[0].insertId);
}
async function deleteComplaintPhoto(id) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(complaintPhotos).where(eq(complaintPhotos.id, id));
}
async function getComplaintStats() {
  const db = await getDb();
  if (!db) return { total: 0, new: 0, analyzing: 0, waitingClient: 0, resolved: 0, closed: 0, overdue: 0 };
  const all = await db.select().from(complaints);
  const now = /* @__PURE__ */ new Date();
  return {
    total: all.length,
    new: all.filter((c) => c.status === "new").length,
    analyzing: all.filter((c) => c.status === "analyzing").length,
    waitingClient: all.filter((c) => c.status === "waiting_client").length,
    resolved: all.filter((c) => c.status === "resolved").length,
    closed: all.filter((c) => c.status === "closed").length,
    overdue: all.filter((c) => c.slaDeadline && new Date(c.slaDeadline) < now && c.status !== "resolved" && c.status !== "closed").length
  };
}
async function createGoogleReview(data) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(googleReviews).values(data);
  return result[0].insertId;
}
async function getGoogleReviews(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.rating) conditions.push(eq(googleReviews.rating, filters.rating));
  if (filters?.status) conditions.push(eq(googleReviews.status, filters.status));
  if (filters?.projectId) conditions.push(eq(googleReviews.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(googleReviews).where(where).orderBy(desc(googleReviews.createdAt));
}
async function getGoogleReviewById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(googleReviews).where(eq(googleReviews.id, id)).limit(1);
  return result[0];
}
async function updateGoogleReview(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(googleReviews).set(data).where(eq(googleReviews.id, id));
}
async function getGoogleReviewStats() {
  const db = await getDb();
  if (!db) return { total: 0, avg: 0, star1: 0, star2: 0, star3: 0, star4: 0, star5: 0, pending: 0, responded: 0, complaints: 0 };
  const all = await db.select().from(googleReviews);
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
  const db = await getDb();
  if (!db) return { complaints: [], movements: [], reviews: [] };
  const results = { complaints: [], movements: [], reviews: [] };
  if (name || email || plate) {
    const conds = [];
    if (name) conds.push(sql`${complaints.clientName} LIKE ${"%" + name + "%"}`);
    if (email) conds.push(sql`${complaints.clientEmail} LIKE ${"%" + email + "%"}`);
    if (plate) conds.push(sql`${complaints.vehiclePlate} LIKE ${"%" + plate + "%"}`);
    results.complaints = await db.select().from(complaints).where(or(...conds)).limit(20);
  }
  if (plate) {
    const vehs = await db.select().from(vehicles).where(sql`${vehicles.plate} LIKE ${"%" + plate + "%"}`).limit(5);
    if (vehs.length > 0) {
      results.movements = await db.select().from(vehicleMovements).where(eq(vehicleMovements.vehicleId, vehs[0].id)).orderBy(desc(vehicleMovements.createdAt)).limit(20);
    }
  }
  if (name || email) {
    const rConds = [];
    if (name) rConds.push(sql`${googleReviews.reviewerName} LIKE ${"%" + name + "%"}`);
    if (email) rConds.push(sql`${googleReviews.reviewerEmail} LIKE ${"%" + email + "%"}`);
    results.reviews = await db.select().from(googleReviews).where(or(...rConds)).limit(20);
  }
  return results;
}
async function getTrainingCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingCategories).orderBy(trainingCategories.sortOrder);
}
async function createTrainingCategory(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(trainingCategories).values(data).$returningId();
  return result;
}
async function deleteTrainingCategory(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingCategories).where(eq(trainingCategories.id, id));
}
async function getTrainingVideos(categoryId) {
  const db = await getDb();
  if (!db) return [];
  const conditions = categoryId ? [eq(trainingVideos.categoryId, categoryId)] : [];
  return db.select().from(trainingVideos).where(conditions.length ? and(...conditions) : void 0).orderBy(trainingVideos.sortOrder);
}
async function createTrainingVideo(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(trainingVideos).values(data).$returningId();
  return result;
}
async function deleteTrainingVideo(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingVideos).where(eq(trainingVideos.id, id));
}
async function getTrainingManuals(categoryId, type) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(trainingManuals.published, true)];
  if (categoryId) conditions.push(eq(trainingManuals.categoryId, categoryId));
  if (type) conditions.push(eq(trainingManuals.type, type));
  return db.select().from(trainingManuals).where(and(...conditions)).orderBy(desc(trainingManuals.createdAt));
}
async function createTrainingManual(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(trainingManuals).values(data).$returningId();
  return result;
}
async function updateTrainingManual(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingManuals).set(data).where(eq(trainingManuals.id, id));
}
async function deleteTrainingManual(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingManuals).where(eq(trainingManuals.id, id));
}
async function getFAQs(categoryId) {
  const db = await getDb();
  if (!db) return [];
  const conditions = categoryId ? [eq(faqs.categoryId, categoryId)] : [];
  return db.select().from(faqs).where(conditions.length ? and(...conditions) : void 0).orderBy(faqs.sortOrder);
}
async function createFAQ(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(faqs).values(data).$returningId();
  return result;
}
async function updateFAQ(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}
async function deleteFAQ(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqs).where(eq(faqs.id, id));
}
async function getQuizQuestions(categoryId) {
  const db = await getDb();
  if (!db) return [];
  const conditions = categoryId ? [eq(quizQuestions.categoryId, categoryId)] : [];
  return db.select().from(quizQuestions).where(conditions.length ? and(...conditions) : void 0);
}
async function createQuizQuestion(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(quizQuestions).values(data).$returningId();
  return result;
}
async function deleteQuizQuestion(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
}
async function saveQuizAttempt(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(quizAttempts).values(data).$returningId();
  return result;
}
async function getQuizRanking() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    employeeId: quizAttempts.employeeId,
    totalScore: sql`SUM(${quizAttempts.score})`,
    totalAttempts: sql`COUNT(*)`,
    bestScore: sql`MAX(${quizAttempts.score})`
  }).from(quizAttempts).groupBy(quizAttempts.employeeId).orderBy(desc(sql`SUM(${quizAttempts.score})`));
}
async function getCareerExams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careerExams).orderBy(careerExams.level);
}
async function createCareerExam(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(careerExams).values(data).$returningId();
  return result;
}
async function getCareerExamQuestions(examId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careerExamQuestions).where(eq(careerExamQuestions.examId, examId));
}
async function createCareerExamQuestion(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(careerExamQuestions).values(data).$returningId();
  return result;
}
async function saveCareerExamAttempt(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(careerExamAttempts).values(data).$returningId();
  return result;
}
async function getCareerExamAttempts(employeeId, examId) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (employeeId) conditions.push(eq(careerExamAttempts.employeeId, employeeId));
  if (examId) conditions.push(eq(careerExamAttempts.examId, examId));
  return db.select().from(careerExamAttempts).where(conditions.length ? and(...conditions) : void 0).orderBy(desc(careerExamAttempts.createdAt));
}
async function deleteCareerExam(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(careerExamQuestions).where(eq(careerExamQuestions.examId, id));
  await db.delete(careerExamAttempts).where(eq(careerExamAttempts.examId, id));
  await db.delete(careerExams).where(eq(careerExams.id, id));
}
async function createLostFoundItem(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(lostFoundItems).values(data).$returningId();
  return result.id;
}
async function getLostFoundItems(filters) {
  const db = await getDb();
  if (!db) return [];
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
  return db.select().from(lostFoundItems).where(where).orderBy(desc(lostFoundItems.createdAt));
}
async function getLostFoundItemById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(lostFoundItems).where(eq(lostFoundItems.id, id)).limit(1);
  return rows[0] ?? null;
}
async function updateLostFoundItem(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(lostFoundItems).set(data).where(eq(lostFoundItems.id, id));
}
async function deleteLostFoundItem(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lostFoundPhotos).where(eq(lostFoundPhotos.itemId, id));
  await db.delete(lostFoundMessages).where(eq(lostFoundMessages.itemId, id));
  await db.delete(lostFoundItems).where(eq(lostFoundItems.id, id));
}
async function addLostFoundPhoto(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(lostFoundPhotos).values(data);
}
async function getLostFoundPhotos(itemId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lostFoundPhotos).where(eq(lostFoundPhotos.itemId, itemId)).orderBy(desc(lostFoundPhotos.createdAt));
}
async function addLostFoundMessage(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(lostFoundMessages).values(data);
}
async function getLostFoundMessages(itemId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lostFoundMessages).where(eq(lostFoundMessages.itemId, itemId)).orderBy(lostFoundMessages.createdAt);
}
async function getLostFoundDriverRanking() {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(lostFoundItems).where(sql`${lostFoundItems.vehiclePlate} IS NOT NULL AND ${lostFoundItems.vehiclePlate} != ''`);
  if (items.length === 0) return [];
  const plates = items.map((i) => i.vehiclePlate);
  const allMovements = await db.select().from(vehicleMovements);
  const relevantMovements = allMovements.filter((m) => {
    return true;
  });
  const allVehicles = await db.select().from(vehicles);
  const vehiclePlateMap = new Map(allVehicles.map((v) => [v.id, v.plate]));
  const plateVehicleMap = new Map(allVehicles.map((v) => [v.plate, v.id]));
  const affectedVehicleIds = plates.map((p) => plateVehicleMap.get(p)).filter(Boolean);
  const movements = allMovements.filter((m) => affectedVehicleIds.includes(m.vehicleId));
  const { employees: employees2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allEmployees = await db.select().from(employees2);
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
  const db = await getDb();
  if (!db) return null;
  const now = /* @__PURE__ */ new Date();
  const weekNum = getWeekNumber(now);
  const [result] = await db.insert(incidents).values({ ...data, weekNumber: data.weekNumber || weekNum, yearNumber: data.yearNumber || now.getFullYear() }).$returningId();
  return result?.id;
}
async function getIncidents(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(incidents.status, filters.status));
  if (filters?.severity) conditions.push(eq(incidents.severity, filters.severity));
  if (filters?.employeeId) conditions.push(eq(incidents.employeeId, filters.employeeId));
  if (filters?.weekNumber) conditions.push(eq(incidents.weekNumber, filters.weekNumber));
  if (filters?.yearNumber) conditions.push(eq(incidents.yearNumber, filters.yearNumber));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(incidents).where(where).orderBy(desc(incidents.createdAt));
}
async function getIncidentById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  return rows[0] || null;
}
async function updateIncident(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(incidents).set(data).where(eq(incidents.id, id));
}
async function deleteIncident(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(incidents).where(eq(incidents.id, id));
}
async function getIncidentStats(weekNumber, yearNumber) {
  const db = await getDb();
  if (!db) return { total: 0, open: 0, resolved: 0, critical: 0, byType: {} };
  const conditions = [];
  if (weekNumber) conditions.push(eq(incidents.weekNumber, weekNumber));
  if (yearNumber) conditions.push(eq(incidents.yearNumber, yearNumber));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const all = await db.select().from(incidents).where(where);
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
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).where(eq(incidents.employeeId, employeeId)).orderBy(desc(incidents.createdAt));
}
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
async function getPerformanceEvaluations(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.weekNumber) conditions.push(eq(performanceEvaluations.weekNumber, filters.weekNumber));
  if (filters?.yearNumber) conditions.push(eq(performanceEvaluations.yearNumber, filters.yearNumber));
  if (filters?.employeeId) conditions.push(eq(performanceEvaluations.employeeId, filters.employeeId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(performanceEvaluations).where(where).orderBy(desc(performanceEvaluations.totalPoints));
}
async function updatePerformanceEvaluation(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(performanceEvaluations).set(data).where(eq(performanceEvaluations.id, id));
}
async function deletePerformanceEvaluation(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(performanceEvaluations).where(eq(performanceEvaluations.id, id));
}
async function generateWeeklyEvaluation(weekNumber, yearNumber) {
  const db = await getDb();
  if (!db) return [];
  const { employees: empTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allEmployees = await db.select().from(empTable);
  const results = [];
  for (const emp of allEmployees) {
    const timeRecs = await db.select().from(timeRecords).where(eq(timeRecords.employeeId, emp.id));
    const weekRecs = timeRecs.filter((r) => {
      const d = new Date(r.recordedAt);
      return getWeekNumber(d) === weekNumber && d.getFullYear() === yearNumber;
    });
    let hoursWorked = 0;
    const checkIns = weekRecs.filter((r) => r.type === "check_in").sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    const checkOuts = weekRecs.filter((r) => r.type === "check_out").sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    for (let i = 0; i < Math.min(checkIns.length, checkOuts.length); i++) {
      hoursWorked += Math.round((new Date(checkOuts[i].recordedAt).getTime() - new Date(checkIns[i].recordedAt).getTime()) / 36e5);
    }
    const allMovements = await db.select().from(vehicleMovements).where(eq(vehicleMovements.employeeId, emp.id));
    const weekMovements = allMovements.filter((m) => {
      const d = new Date(m.createdAt);
      return getWeekNumber(d) === weekNumber && d.getFullYear() === yearNumber;
    });
    const allAlerts = await db.select().from(speedAlerts).where(eq(speedAlerts.employeeId, emp.id));
    const weekAlerts = allAlerts.filter((a) => {
      const d = new Date(a.createdAt);
      return getWeekNumber(d) === weekNumber && d.getFullYear() === yearNumber;
    });
    const empIncidents = await db.select().from(incidents).where(
      and(eq(incidents.weekNumber, weekNumber), eq(incidents.yearNumber, yearNumber))
    );
    const positiveIncidents = empIncidents.filter((i) => i.reportedBy === emp.id).length;
    const negativeIncidents = empIncidents.filter((i) => i.employeeId === emp.id).length;
    const movPerHour = hoursWorked > 0 ? Math.round(weekMovements.length / hoursWorked) : 0;
    const positivePoints = weekMovements.length * 2 + positiveIncidents * 5;
    const negativePoints = weekAlerts.length * 10 + negativeIncidents * 5;
    const totalPoints = positivePoints - negativePoints;
    const existing = await db.select().from(performanceEvaluations).where(
      and(
        eq(performanceEvaluations.employeeId, emp.id),
        eq(performanceEvaluations.weekNumber, weekNumber),
        eq(performanceEvaluations.yearNumber, yearNumber)
      )
    );
    const evalData = {
      employeeId: emp.id,
      weekNumber,
      yearNumber,
      hoursWorked,
      movementsCount: weekMovements.length,
      movementsPerHour: movPerHour,
      speedAlerts: weekAlerts.length,
      incidentsPositive: positiveIncidents,
      incidentsNegative: negativeIncidents,
      positivePoints,
      negativePoints,
      totalPoints
    };
    if (existing.length > 0) {
      await db.update(performanceEvaluations).set(evalData).where(eq(performanceEvaluations.id, existing[0].id));
      results.push({ ...evalData, id: existing[0].id, employeeName: emp.fullName });
    } else {
      const [result] = await db.insert(performanceEvaluations).values(evalData).$returningId();
      results.push({ ...evalData, id: result?.id, employeeName: emp.fullName });
    }
  }
  return results.sort((a, b) => b.totalPoints - a.totalPoints);
}
async function createService(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(services).values(data).$returningId();
  return result?.id;
}
async function getServices(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.serviceType) conditions.push(eq(services.serviceType, filters.serviceType));
  if (filters?.employeeId) conditions.push(eq(services.employeeId, filters.employeeId));
  if (filters?.projectId) conditions.push(eq(services.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const all = await db.select().from(services).where(where).orderBy(desc(services.serviceDate));
  if (filters?.month && filters?.year) {
    return all.filter((s) => {
      const d = new Date(s.serviceDate);
      return d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year;
    });
  }
  return all;
}
async function updateService(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set(data).where(eq(services.id, id));
}
async function deleteService(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(services).where(eq(services.id, id));
}
async function getServiceStats(month, year) {
  const db = await getDb();
  if (!db) return { total: 0, revenue: 0, cost: 0, profit: 0, byType: {}, byEmployee: [] };
  let all = await db.select().from(services).orderBy(desc(services.serviceDate));
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
  const allEmps = await db.select().from(empTable);
  const empMap = new Map(allEmps.map((e) => [e.id, e.fullName]));
  const byEmployee = Object.entries(byEmp).map(([id, data]) => ({
    employeeId: Number(id),
    employeeName: empMap.get(Number(id)) || "Desconhecido",
    ...data
  })).sort((a, b) => b.count - a.count);
  return { total: all.length, revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost, byType, byEmployee };
}
async function createInvoice(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(invoices).values(data).$returningId();
  return result?.id;
}
async function getInvoices(filters) {
  const db = await getDb();
  if (!db) return [];
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
  const all = await db.select().from(invoices).where(where).orderBy(desc(invoices.issueDate));
  if (filters?.month && filters?.year) {
    return all.filter((i) => {
      const d = new Date(i.issueDate);
      return d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year;
    });
  }
  return all;
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return rows[0] || null;
}
async function updateInvoice(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}
async function deleteInvoice(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(invoices).where(eq(invoices.id, id));
}
async function getInvoiceStats(month, year) {
  const db = await getDb();
  if (!db) return { total: 0, totalAmount: 0, paid: 0, overdue: 0, draft: 0 };
  let all = await db.select().from(invoices).orderBy(desc(invoices.issueDate));
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
  const db = await getDb();
  if (!db) return [projectId];
  const allProjects = await db.select().from(projects);
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
async function getBillingData(filters) {
  const db = await getDb();
  if (!db) return { deliveries: [], expensesPaid: [], expensesPending: [], forecast: [] };
  let projectIds;
  if (filters.projectId) {
    projectIds = await resolveProjectIds(filters.projectId);
  }
  const deliveryConds = [
    gte(multiparkBookings.checkOut, new Date(filters.from)),
    lte(multiparkBookings.checkOut, /* @__PURE__ */ new Date(filters.to + "T23:59:59")),
    isNotNull(multiparkBookings.checkOut)
  ];
  if (projectIds) deliveryConds.push(inArray(multiparkBookings.projectId, projectIds));
  const deliveryRows = await db.select({
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`,
    parkingRevenue: sql`COALESCE(SUM(${multiparkBookings.parkingPrice}), 0)`,
    deliveryCharges: sql`COALESCE(SUM(${multiparkBookings.deliveryCharges}), 0)`,
    extrasRevenue: sql`COALESCE(SUM(${multiparkBookings.extrasTotal}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(multiparkBookings.projectId, projects.id)).where(and(...deliveryConds)).groupBy(multiparkBookings.projectId, projects.name);
  const paidConds = [
    eq(expenses.status, "paid"),
    isNotNull(expenses.paidAt),
    gte(expenses.paidAt, new Date(filters.from)),
    lte(expenses.paidAt, /* @__PURE__ */ new Date(filters.to + "T23:59:59"))
  ];
  if (projectIds) paidConds.push(inArray(expenses.projectId, projectIds));
  const expPaidRows = await db.select({
    projectId: expenses.projectId,
    projectName: projects.name,
    categoryName: expenseCategories.name,
    count: sql`COUNT(*)`,
    totalAmount: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(and(...paidConds)).groupBy(expenses.projectId, projects.name, expenseCategories.name);
  const pendConds = [
    inArray(expenses.status, ["pending", "overdue"]),
    isNotNull(expenses.paymentDueDate),
    gte(expenses.paymentDueDate, new Date(filters.from)),
    lte(expenses.paymentDueDate, /* @__PURE__ */ new Date(filters.to + "T23:59:59"))
  ];
  if (projectIds) pendConds.push(inArray(expenses.projectId, projectIds));
  const expPendRows = await db.select({
    projectId: expenses.projectId,
    projectName: projects.name,
    categoryName: expenseCategories.name,
    supplier: expenses.supplier,
    count: sql`COUNT(*)`,
    totalAmount: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).leftJoin(projects, eq(expenses.projectId, projects.id)).leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id)).where(and(...pendConds)).groupBy(expenses.projectId, projects.name, expenseCategories.name, expenses.supplier);
  const now = /* @__PURE__ */ new Date();
  const forecastFrom = now > new Date(filters.from) ? now.toISOString().slice(0, 10) : filters.from;
  const forecastConds = [
    gte(multiparkBookings.checkIn, new Date(forecastFrom)),
    lte(multiparkBookings.checkIn, /* @__PURE__ */ new Date(filters.to + "T23:59:59")),
    isNull(multiparkBookings.checkOut),
    isNull(multiparkBookings.cancelledAt)
  ];
  if (projectIds) forecastConds.push(inArray(multiparkBookings.projectId, projectIds));
  const forecastRows = await db.select({
    projectId: multiparkBookings.projectId,
    projectName: projects.name,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).leftJoin(projects, eq(multiparkBookings.projectId, projects.id)).where(and(...forecastConds)).groupBy(multiparkBookings.projectId, projects.name);
  return {
    deliveries: deliveryRows,
    expensesPaid: expPaidRows,
    expensesPending: expPendRows,
    forecast: forecastRows
  };
}
async function getPartnershipAnalytics(filters) {
  const db = await getDb();
  if (!db) return { partners: [], proBookings: [], totals: { partnerBookings: 0, partnerRevenue: 0, directBookings: 0, directRevenue: 0, proBookings: 0, proRevenue: 0 } };
  let projectIds;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const baseConds = [
    isNotNull(multiparkBookings.checkOut),
    gte(multiparkBookings.checkOut, new Date(filters.from)),
    lte(multiparkBookings.checkOut, /* @__PURE__ */ new Date(filters.to + "T23:59:59"))
  ];
  if (projectIds) baseConds.push(inArray(multiparkBookings.projectId, projectIds));
  const partnerRows = await db.select({
    campaign: multiparkBookings.campaign,
    city: multiparkBookings.city,
    parkName: multiparkBookings.parkName,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`,
    avgPrice: sql`COALESCE(AVG(${multiparkBookings.totalPrice}), 0)`,
    totalDiscount: sql`COALESCE(SUM(${multiparkBookings.discount}), 0)`
  }).from(multiparkBookings).where(and(...baseConds, isNotNull(multiparkBookings.campaign))).groupBy(multiparkBookings.campaign, multiparkBookings.city, multiparkBookings.parkName);
  const allRows = await db.select({
    hasPartner: sql`CASE WHEN ${multiparkBookings.campaign} IS NOT NULL AND ${multiparkBookings.campaign} != '' THEN 1 ELSE 0 END`,
    count: sql`COUNT(*)`,
    totalRevenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...baseConds)).groupBy(sql`CASE WHEN ${multiparkBookings.campaign} IS NOT NULL AND ${multiparkBookings.campaign} != '' THEN 1 ELSE 0 END`);
  const proRows = await db.select({
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
  const db = await getDb();
  if (!db) return [];
  let projectIds;
  if (filters.projectId) projectIds = await resolveProjectIds(filters.projectId);
  const conds = [
    eq(multiparkBookings.campaign, filters.campaignKey),
    isNotNull(multiparkBookings.checkOut),
    gte(multiparkBookings.checkOut, new Date(filters.from)),
    lte(multiparkBookings.checkOut, /* @__PURE__ */ new Date(filters.to + "T23:59:59"))
  ];
  if (projectIds) conds.push(inArray(multiparkBookings.projectId, projectIds));
  const rows = await db.select({
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
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(partnerships).values(data).$returningId();
  return result?.id;
}
async function getPartnerships(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.partnerType) conditions.push(eq(partnerships.partnerType, filters.partnerType));
  if (filters?.status) conditions.push(eq(partnerships.partnerStatus, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(partnerships).where(where).orderBy(desc(partnerships.createdAt));
}
async function getPartnershipById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(partnerships).where(eq(partnerships.id, id)).limit(1);
  return rows[0] || null;
}
async function updatePartnership(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(partnerships).set(data).where(eq(partnerships.id, id));
}
async function deletePartnership(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(partnershipTransactions).where(eq(partnershipTransactions.partnershipId, id));
  await db.delete(partnerships).where(eq(partnerships.id, id));
}
async function createPartnershipTransaction(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(partnershipTransactions).values(data).$returningId();
  return result?.id;
}
async function getPartnershipTransactions(partnershipId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnershipTransactions).where(eq(partnershipTransactions.partnershipId, partnershipId)).orderBy(desc(partnershipTransactions.transactionDate));
}
async function createPartnershipInvoice(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(partnershipInvoices).values(data).$returningId();
  return result?.id;
}
async function getPartnershipInvoices(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.partnershipId) conditions.push(eq(partnershipInvoices.partnershipId, filters.partnershipId));
  if (filters?.status) conditions.push(eq(partnershipInvoices.status, filters.status));
  if (filters?.year) conditions.push(eq(partnershipInvoices.referenceYear, filters.year));
  if (filters?.month) conditions.push(eq(partnershipInvoices.referenceMonth, filters.month));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(partnershipInvoices).where(where).orderBy(desc(partnershipInvoices.createdAt));
}
async function updatePartnershipInvoice(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(partnershipInvoices).set(data).where(eq(partnershipInvoices.id, id));
}
async function deletePartnershipInvoice(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(partnershipInvoices).where(eq(partnershipInvoices.id, id));
}
async function markOverduePartnershipInvoices() {
  const db = await getDb();
  if (!db) return 0;
  const now = /* @__PURE__ */ new Date();
  const result = await db.update(partnershipInvoices).set({ status: "overdue" }).where(
    and(
      eq(partnershipInvoices.status, "sent"),
      sql`${partnershipInvoices.dueDate} < ${now}`
    )
  );
  return result[0]?.affectedRows || 0;
}
async function getPartnershipDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const allPartners = await db.select().from(partnerships);
  const allInvoices = await db.select().from(partnershipInvoices);
  const allTx = await db.select().from(partnershipTransactions);
  const totalPartners = allPartners.length;
  const activePartners = allPartners.filter((p) => p.status === "active").length;
  const byType = {};
  allPartners.forEach((p) => {
    byType[p.partnerType] = (byType[p.partnerType] || 0) + 1;
  });
  const pendingInvoices = allInvoices.filter((i) => i.status === "sent");
  const overdueInvoices = allInvoices.filter((i) => i.status === "overdue");
  const paidInvoices = allInvoices.filter((i) => i.status === "paid");
  const totalPending = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = paidInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalBookings = allTx.filter((t2) => t2.transactionType === "booking").reduce((s, t2) => s + (t2.amount || 0), 0);
  const partnerSummaries = allPartners.map((p) => {
    const pInvoices = allInvoices.filter((i) => i.partnershipId === p.id);
    const pTx = allTx.filter((t2) => t2.partnershipId === p.id);
    const pending = pInvoices.filter((i) => i.status === "sent").reduce((s, i) => s + (i.amount || 0), 0);
    const overdue = pInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount || 0), 0);
    const paid = pInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
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
async function getAnnualReports(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.year) conditions.push(eq(annualReports.year, filters.year));
  if (filters?.projectId) conditions.push(eq(annualReports.projectId, filters.projectId));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(annualReports).where(where).orderBy(annualReports.month);
}
async function updateAnnualReport(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(annualReports).set(data).where(eq(annualReports.id, id));
}
async function deleteAnnualReport(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(annualReports).where(eq(annualReports.id, id));
}
async function getAnnualBreakdown(year, projectId) {
  const db = await getDb();
  if (!db) return [];
  const VAT_RATE = 0.23;
  let projectIds;
  if (projectId) projectIds = await resolveProjectIds(projectId);
  const revConds = [
    gte(multiparkBookings.checkOut, /* @__PURE__ */ new Date(`${year}-01-01`)),
    lte(multiparkBookings.checkOut, /* @__PURE__ */ new Date(`${year}-12-31T23:59:59`)),
    isNotNull(multiparkBookings.checkOut)
  ];
  if (projectIds) revConds.push(inArray(multiparkBookings.projectId, projectIds));
  const revenueRows = await db.select({
    month: sql`MONTH(${multiparkBookings.checkOut})`,
    total: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
  }).from(multiparkBookings).where(and(...revConds)).groupBy(sql`MONTH(${multiparkBookings.checkOut})`);
  const expConds = [
    eq(expenses.status, "paid"),
    isNotNull(expenses.paidAt),
    gte(expenses.paidAt, /* @__PURE__ */ new Date(`${year}-01-01`)),
    lte(expenses.paidAt, /* @__PURE__ */ new Date(`${year}-12-31T23:59:59`))
  ];
  if (projectIds) expConds.push(inArray(expenses.projectId, projectIds));
  const expenseRows = await db.select({
    month: sql`MONTH(${expenses.paidAt})`,
    total: sql`COALESCE(SUM(${expenses.amount}), 0)`
  }).from(expenses).where(and(...expConds)).groupBy(sql`MONTH(${expenses.paidAt})`);
  const TSU_EMPLOYER = 0.2375;
  const payrollByMonth = {};
  for (let m = 1; m <= 12; m++) {
    try {
      const payroll = await getPayrollData(year, m);
      const filtered = projectIds ? payroll.filter((p) => p.projectId && projectIds.includes(p.projectId)) : payroll;
      const totalSalaries = filtered.reduce((s, p) => s + p.totalPayment, 0);
      const totalEmployerTax = filtered.reduce((s, p) => {
        const taxableBase = p.isExtra ? p.extraPayment : p.baseSalary + p.overtimePayment + p.nightPayment + p.weekendPayment;
        return s + taxableBase * TSU_EMPLOYER;
      }, 0);
      payrollByMonth[m] = { salaries: Math.round(totalSalaries * 100) / 100, employerTax: Math.round(totalEmployerTax * 100) / 100 };
    } catch {
      payrollByMonth[m] = { salaries: 0, employerTax: 0 };
    }
  }
  const revMap = new Map(revenueRows.map((r) => [Number(r.month), Number(r.total)]));
  const expMap = new Map(expenseRows.map((e) => [Number(e.month), Number(e.total)]));
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const revenueWithVat = revMap.get(m) ?? 0;
    const expensesWithVat = expMap.get(m) ?? 0;
    const salaries = payrollByMonth[m]?.salaries ?? 0;
    const employerTax = payrollByMonth[m]?.employerTax ?? 0;
    const vatRevenue = Math.round(revenueWithVat * VAT_RATE / (1 + VAT_RATE) * 100) / 100;
    const vatExpenses = Math.round(expensesWithVat * VAT_RATE / (1 + VAT_RATE) * 100) / 100;
    const vatToPay = Math.round((vatRevenue - vatExpenses) * 100) / 100;
    const revenueNoVat = Math.round((revenueWithVat - vatRevenue) * 100) / 100;
    const expensesNoVat = Math.round((expensesWithVat - vatExpenses) * 100) / 100;
    const totalCosts = expensesNoVat + salaries + employerTax;
    const profit = Math.round((revenueNoVat - totalCosts) * 100) / 100;
    months.push({
      month: m,
      revenueWithVat,
      revenueNoVat,
      vatRevenue,
      expensesWithVat,
      expensesNoVat,
      vatExpenses,
      vatToPay,
      salaries,
      employerTax,
      totalCosts,
      profit
    });
  }
  return months;
}
async function generateAnnualSummary(year, projectId, splitPartner = 60) {
  const db = await getDb();
  if (!db) return [];
  const allInvoices = await db.select().from(invoices);
  const yearInvoices = allInvoices.filter((i) => {
    const d = new Date(i.issueDate);
    return d.getFullYear() === year && (!projectId || i.projectId === projectId);
  });
  const allServices = await db.select().from(services);
  const yearServices = allServices.filter((s) => {
    const d = new Date(s.serviceDate);
    return d.getFullYear() === year;
  });
  const allExpenses = await db.select().from(expenses);
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
    const existing = await db.select().from(annualReports).where(
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
      await db.update(annualReports).set(reportData).where(eq(annualReports.id, existing[0].id));
      results.push({ ...reportData, id: existing[0].id });
    } else {
      const [result] = await db.insert(annualReports).values(reportData).$returningId();
      results.push({ ...reportData, id: result?.id });
    }
  }
  return results;
}
async function getMultiparkBookings(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(multiparkBookings.status, filters.status));
  if (filters?.parkingType) conditions.push(eq(multiparkBookings.parkingType, filters.parkingType));
  if (filters?.from) conditions.push(gte(multiparkBookings.checkIn, filters.from));
  if (filters?.to) conditions.push(lte(multiparkBookings.checkIn, filters.to));
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
  return db.select().from(multiparkBookings).where(where).orderBy(desc(multiparkBookings.checkIn)).limit(filters?.limit ?? 100).offset(filters?.offset ?? 0);
}
async function getLocalBookingsByAction(filters) {
  const db = await getDb();
  if (!db) return [];
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
    const allProjects = await db.select().from(projects);
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
  return db.select().from(multiparkBookings).where(and(...conditions)).orderBy(desc(multiparkBookings.bookingCreatedAt)).limit(5e3);
}
async function searchBookingByRef(search) {
  const db = await getDb();
  if (!db) return [];
  const s = `%${search.trim()}%`;
  return db.select({
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
async function upsertMultiparkBooking(data) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: multiparkBookings.id }).from(multiparkBookings).where(eq(multiparkBookings.externalId, data.externalId)).limit(1);
  if (existing.length > 0) {
    const { externalId, ...updateData } = data;
    await db.update(multiparkBookings).set(updateData).where(eq(multiparkBookings.id, existing[0].id));
    return { id: existing[0].id, action: "updated" };
  } else {
    const [result] = await db.insert(multiparkBookings).values(data).$returningId();
    return { id: result?.id, action: "created" };
  }
}
async function getMultiparkBookingStats(filters) {
  const db = await getDb();
  const empty = { total: 0, reservasHoje: 0, checkinHoje: 0, checkoutHoje: 0, canceladosHoje: 0, reservasMes: 0, checkinMes: 0, checkoutMes: 0, canceladosMes: 0, receitaHoje: 0, receitaMes: 0, receitaPeriodo: 0, byCity: [], byDay: [], byBrand: [] };
  if (!db) return empty;
  let projectFilter = void 0;
  if (filters?.projectId) {
    const allProjects = await db.select().from(projects);
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
    return db.select({
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
    db.select({ count: sql`COUNT(*)` }).from(multiparkBookings).where(projectFilter ? and(projectFilter) : void 0),
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
      return db.select({ revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)` }).from(multiparkBookings).where(and(...conds));
    })(),
    // By city
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db.select({
        name: multiparkBookings.city,
        bookings: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(and(...conds)).groupBy(multiparkBookings.city);
    })(),
    // By day
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db.select({
        date: sql`DATE(${multiparkBookings.bookingCreatedAt})`,
        reservas: sql`COUNT(*)`,
        revenue: sql`COALESCE(SUM(${multiparkBookings.totalPrice}), 0)`
      }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.bookingCreatedAt})`).orderBy(sql`DATE(${multiparkBookings.bookingCreatedAt})`);
    })(),
    // By brand (parkName)
    (() => {
      const conds = [gte(multiparkBookings.bookingCreatedAt, periodFrom), lte(multiparkBookings.bookingCreatedAt, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db.select({
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
      return db.select({ date: sql`DATE(${multiparkBookings.checkIn})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.checkIn})`);
    })(),
    (() => {
      const conds = [gte(multiparkBookings.checkOut, periodFrom), lte(multiparkBookings.checkOut, periodTo), sql`${multiparkBookings.status} != 'CANCELLED'`];
      if (projectFilter) conds.push(projectFilter);
      return db.select({ date: sql`DATE(${multiparkBookings.checkOut})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.checkOut})`);
    })(),
    (() => {
      const conds = [gte(multiparkBookings.cancelledAt, periodFrom), lte(multiparkBookings.cancelledAt, periodTo)];
      if (projectFilter) conds.push(projectFilter);
      return db.select({ date: sql`DATE(${multiparkBookings.cancelledAt})`, count: sql`COUNT(*)` }).from(multiparkBookings).where(and(...conds)).groupBy(sql`DATE(${multiparkBookings.cancelledAt})`);
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
  const db = await getDb();
  if (!db) return;
  await db.insert(multiparkSyncLogs).values(data);
}
async function getSyncLogs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(multiparkSyncLogs).orderBy(desc(multiparkSyncLogs.startedAt)).limit(limit);
}
async function upsertDailySnapshot(data) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: multiparkDailySnapshots.id }).from(multiparkDailySnapshots).where(
    and(
      eq(multiparkDailySnapshots.snapshotDate, data.snapshotDate),
      eq(multiparkDailySnapshots.parkName, data.parkName),
      eq(multiparkDailySnapshots.city, data.city)
    )
  ).limit(1);
  if (existing.length > 0) {
    const { id, ...updateData } = data;
    await db.update(multiparkDailySnapshots).set(updateData).where(eq(multiparkDailySnapshots.id, existing[0].id));
    return { id: existing[0].id, action: "updated" };
  } else {
    const [result] = await db.insert(multiparkDailySnapshots).values(data).$returningId();
    return { id: result?.id, action: "created" };
  }
}
async function getDailySnapshots(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.from) conditions.push(gte(multiparkDailySnapshots.snapshotDate, filters.from));
  if (filters?.to) conditions.push(lte(multiparkDailySnapshots.snapshotDate, filters.to));
  if (filters?.parkName) conditions.push(eq(multiparkDailySnapshots.parkName, filters.parkName));
  if (filters?.city) conditions.push(eq(multiparkDailySnapshots.city, filters.city));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  return db.select().from(multiparkDailySnapshots).where(where).orderBy(desc(multiparkDailySnapshots.snapshotDate)).limit(filters?.limit ?? 500);
}
async function getSnapshotKPIs(filters) {
  const db = await getDb();
  if (!db) return { totalBookings: 0, totalRevenue: 0, checkins: 0, checkouts: 0, cancelled: 0, reserved: 0, byPark: [], byCity: [], byDay: [], campaigns: {} };
  const conditions = [];
  if (filters?.from) conditions.push(gte(multiparkDailySnapshots.snapshotDate, filters.from));
  if (filters?.to) conditions.push(lte(multiparkDailySnapshots.snapshotDate, filters.to));
  if (filters?.city) conditions.push(eq(multiparkDailySnapshots.city, filters.city));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const rows = await db.select().from(multiparkDailySnapshots).where(where).orderBy(multiparkDailySnapshots.snapshotDate);
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
async function createInviteToken(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
  await db.insert(inviteTokens).values({
    token,
    email: data.email,
    userId: data.userId,
    invitedById: data.invitedById,
    status: "pending",
    expiresAt
  });
  return { token, expiresAt };
}
async function getInviteByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(inviteTokens).where(eq(inviteTokens.token, token)).limit(1);
  return result[0];
}
async function acceptInviteToken(token) {
  const db = await getDb();
  if (!db) return;
  await db.update(inviteTokens).set({ status: "accepted", acceptedAt: /* @__PURE__ */ new Date() }).where(eq(inviteTokens.token, token));
}
async function getInvitesByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inviteTokens).where(eq(inviteTokens.userId, userId)).orderBy(desc(inviteTokens.createdAt));
}
async function linkInviteToOAuthUser(manualUserId, oauthOpenId, oauthName, oauthEmail) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updates = { openId: oauthOpenId, loginMethod: "oauth" };
  if (oauthName) updates.name = oauthName;
  if (oauthEmail) updates.email = oauthEmail;
  await db.update(users).set(updates).where(eq(users.id, manualUserId));
}
async function getPayrollData(year, month) {
  const db = await getDb();
  if (!db) return [];
  const emps = await db.select({ employee: employees, project: projects }).from(employees).leftJoin(projects, eq(employees.projectId, projects.id)).where(eq(employees.isActive, true)).orderBy(employees.fullName);
  const rates = await db.select().from(extraRates).orderBy(extraRates.level);
  const rateMap = new Map(rates.map((r) => [r.level, parseFloat(String(r.hourlyRate))]));
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const records = await db.select().from(timeRecords).where(and(gte(timeRecords.recordedAt, start), lte(timeRecords.recordedAt, end)));
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
  return emps.map(({ employee: emp, project }) => {
    const empHours = hoursByEmployee.get(emp.id) ?? { totalHours: 0, days: /* @__PURE__ */ new Set(), records: [] };
    const totalHours = Math.round(empHours.totalHours * 100) / 100;
    const daysWorked = empHours.days.size;
    const isExtra = emp.position === "extra";
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
    const mealAllowancePerDay = parseFloat(String(emp.mealAllowancePerDay ?? 0));
    if (isExtra) {
      const hourlyRate = rateMap.get(emp.extraLevel ?? 1) ?? 5;
      extraPayment = Math.round(totalHours * hourlyRate * 100) / 100;
    } else {
      baseSalary = parseFloat(String(emp.monthlySalary ?? 0));
      const hourlyBase = baseSalary > 0 ? baseSalary / STANDARD_MONTHLY_HOURS : 0;
      for (const rec of empHours.records) {
        const recDate = new Date(rec.recordedAt);
        const hours = parseFloat(String(rec.hoursWorked ?? 0));
        const dayOfWeek = recDate.getDay();
        const hour = recDate.getHours();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendHours += hours;
        }
        if (hour >= 22 || hour < 7) {
          nightHours += hours;
        }
      }
      nightHours = Math.round(nightHours * 100) / 100;
      weekendHours = Math.round(weekendHours * 100) / 100;
      nightPayment = Math.round(nightHours * hourlyBase * (NIGHT_RATE_MULTIPLIER - 1) * 100) / 100;
      weekendPayment = Math.round(weekendHours * hourlyBase * (WEEKEND_RATE_MULTIPLIER - 1) * 100) / 100;
      const normalHours = totalHours - nightHours - weekendHours;
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
      mealAllowance = Math.round(mealAllowancePerDay * daysWorked * 100) / 100;
    }
    const totalPayment = isExtra ? extraPayment : baseSalary + overtimePayment + nightPayment + weekendPayment + thirteenthProvision + fourteenthProvision + mealAllowance;
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
      hourlyRate: isExtra ? rateMap.get(emp.extraLevel ?? 1) ?? 5 : baseSalary > 0 ? Math.round(baseSalary / STANDARD_MONTHLY_HOURS * 100) / 100 : 0
    };
  });
}
async function savePayslipRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(payslipHistory).values(data);
}
async function getTaskAssignees(taskId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ assignee: taskAssignees, employee: employees }).from(taskAssignees).leftJoin(employees, eq(taskAssignees.employeeId, employees.id)).where(eq(taskAssignees.taskId, taskId));
}
async function setTaskAssignees(taskId, employeeIds) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
  if (employeeIds.length > 0) {
    await db.insert(taskAssignees).values(
      employeeIds.map((employeeId) => ({ taskId, employeeId }))
    );
  }
}
async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select().from(tasks).where(and(
    lte(tasks.dueDate, now),
    eq(tasks.notifiedOverdue, false),
    sql`${tasks.status} != 'done'`
  ));
}
async function getRecentlyCompletedTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(and(
    eq(tasks.status, "done"),
    eq(tasks.notifiedComplete, false)
  ));
}
async function markTaskNotified(taskId, field) {
  const db = await getDb();
  if (!db) return;
  await db.update(tasks).set({ [field]: true }).where(eq(tasks.id, taskId));
}
async function getProjectHierarchyManagers(projectId) {
  const db = await getDb();
  if (!db) return [];
  const allProjects = await db.select().from(projects);
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
  const db = await getDb();
  if (!db) return [];
  const allProjects = await db.select().from(projects).orderBy(projects.name);
  const allAssignments = await db.select().from(projectEmployees);
  const allEmployees = await db.select().from(employees);
  const conditions = [];
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    conditions.push(gte(expenses.expenseDate, startDate));
    conditions.push(lte(expenses.expenseDate, endDate));
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    conditions.push(gte(expenses.expenseDate, startDate));
    conditions.push(lte(expenses.expenseDate, endDate));
  }
  conditions.push(sql`${expenses.status} != 'cancelled'`);
  const expenseRows = await db.select({
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
    timeConditions.push(gte(timeRecords.recordedAt, startDate));
    timeConditions.push(lte(timeRecords.recordedAt, endDate));
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    timeConditions.push(gte(timeRecords.recordedAt, startDate));
    timeConditions.push(lte(timeRecords.recordedAt, endDate));
  }
  const timeRows = await db.select({
    employeeId: timeRecords.employeeId,
    totalHours: sql`COALESCE(SUM(${timeRecords.hoursWorked}), 0)`
  }).from(timeRecords).where(timeConditions.length > 0 ? and(...timeConditions) : void 0).groupBy(timeRecords.employeeId);
  const hoursMap = /* @__PURE__ */ new Map();
  for (const row of timeRows) {
    hoursMap.set(row.employeeId, row.totalHours || 0);
  }
  const rates = await db.select().from(extraRates).orderBy(extraRates.level);
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
  const allUsers = await db.select().from(users);
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
  const db = await getDb();
  if (!db) return [];
  return db.select().from(speedLimits).where(eq(speedLimits.isActive, true));
}
async function getDefaultSpeedLimit() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(speedLimits).where(eq(speedLimits.isDefault, true)).limit(1);
  return rows[0] || null;
}
async function createSpeedLimit(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(speedLimits).values(data);
  return result.insertId;
}
async function updateSpeedLimit(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(speedLimits).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(speedLimits.id, id));
}
async function deleteSpeedLimit(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(speedLimits).where(eq(speedLimits.id, id));
}
async function recordSpeedViolation(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(speedViolations).values(data);
  return result.insertId;
}
async function getSpeedViolations(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.startDate) conditions.push(gte(speedViolations.occurredAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(speedViolations.occurredAt, filters.endDate));
  if (filters?.username) conditions.push(eq(speedViolations.zelloUsername, filters.username));
  if (filters?.acknowledged !== void 0) conditions.push(eq(speedViolations.acknowledged, filters.acknowledged));
  return db.select().from(speedViolations).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(speedViolations.occurredAt));
}
async function acknowledgeSpeedViolation(id, userId, notes) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(speedViolations).set({
    acknowledged: true,
    acknowledgedById: userId,
    acknowledgedAt: /* @__PURE__ */ new Date(),
    notes: notes || null
  }).where(eq(speedViolations.id, id));
}
async function getSpeedViolationStats(startDate, endDate) {
  const db = await getDb();
  if (!db) return { total: 0, unacknowledged: 0, topOffenders: [] };
  const conditions = [];
  if (startDate) conditions.push(gte(speedViolations.occurredAt, startDate));
  if (endDate) conditions.push(lte(speedViolations.occurredAt, endDate));
  const allViolations = await db.select().from(speedViolations).where(conditions.length > 0 ? and(...conditions) : void 0);
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
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(dailyDriverHistory).values(data);
  return result.insertId;
}
async function getDailyDriverHistoryByDate(dateStr) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  return db.select().from(dailyDriverHistory).where(and(gte(dailyDriverHistory.date, startOfDay), lte(dailyDriverHistory.date, endOfDay))).orderBy(desc(dailyDriverHistory.totalKm));
}
async function getDailyDriverHistoryByUser(username, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyDriverHistory).where(eq(dailyDriverHistory.zelloUsername, username)).orderBy(desc(dailyDriverHistory.date)).limit(limit);
}
async function getDailyDriverHistoryRange(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyDriverHistory).where(and(
    gte(dailyDriverHistory.date, new Date(startDate)),
    lte(dailyDriverHistory.date, new Date(endDate))
  )).orderBy(desc(dailyDriverHistory.date));
}
async function getDailyDriverStats(dateStr) {
  const db = await getDb();
  if (!db) return { totalDrivers: 0, totalKm: 0, totalHoursWorked: 0, totalHoursStopped: 0, maxSpeedOfDay: 0, avgBattery: 0, totalViolations: 0 };
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  const rows = await db.select().from(dailyDriverHistory).where(and(gte(dailyDriverHistory.date, startOfDay), lte(dailyDriverHistory.date, endOfDay)));
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
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(pdas).values(data);
  return result.insertId;
}
async function updatePda(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(pdas).set(data).where(eq(pdas.id, id));
}
async function deletePda(id) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pdas).where(eq(pdas.id, id));
}
async function listPdas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdas).orderBy(pdas.name);
}
async function getPdaById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const [pda] = await db.select().from(pdas).where(eq(pdas.id, id));
  return pda;
}
async function createPdaCheckin(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(pdaCheckins).values(data);
  return result.insertId;
}
async function checkoutPda(id, data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(pdaCheckins).set({
    ...data,
    checkoutAt: /* @__PURE__ */ new Date(),
    status: "checked_out"
  }).where(eq(pdaCheckins.id, id));
}
async function getActiveCheckins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdaCheckins).where(eq(pdaCheckins.status, "checked_in")).orderBy(desc(pdaCheckins.checkinAt));
}
async function getCheckinsByDate(dateStr) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  return db.select().from(pdaCheckins).where(and(gte(pdaCheckins.checkinAt, startOfDay), lte(pdaCheckins.checkinAt, endOfDay))).orderBy(desc(pdaCheckins.checkinAt));
}
async function getCheckinsByPda(pdaId, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdaCheckins).where(eq(pdaCheckins.pdaId, pdaId)).orderBy(desc(pdaCheckins.checkinAt)).limit(limit);
}
async function createGpsAlert(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(gpsAlerts).values(data);
  return result.insertId;
}
async function getGpsAlerts(opts = {}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(gpsAlerts).orderBy(desc(gpsAlerts.occurredAt)).limit(opts.limit || 50);
  if (opts.unacknowledgedOnly) {
    return db.select().from(gpsAlerts).where(eq(gpsAlerts.acknowledged, false)).orderBy(desc(gpsAlerts.occurredAt)).limit(opts.limit || 50);
  }
  return query;
}
async function acknowledgeGpsAlert(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(gpsAlerts).set({
    acknowledged: true,
    acknowledgedById: userId,
    acknowledgedAt: /* @__PURE__ */ new Date()
  }).where(eq(gpsAlerts.id, id));
}
async function getGpsAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, unacknowledged: 0, todayAlerts: 0, byType: {} };
  const all = await db.select().from(gpsAlerts).orderBy(desc(gpsAlerts.occurredAt)).limit(200);
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
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(campaigns).where(and(eq(campaigns.name, name), eq(campaigns.platform, platform))).limit(1);
  return result[0];
}
async function getExistingStatsForCampaignAndDateRange(campaignId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignDailyStats).where(and(
    eq(campaignDailyStats.campaignId, campaignId),
    gte(campaignDailyStats.date, startDate),
    lte(campaignDailyStats.date, endDate)
  ));
}
async function getReviewBySourceEmailId(sourceEmailId) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(googleReviews).where(eq(googleReviews.sourceEmailId, sourceEmailId)).limit(1);
  return rows[0] || null;
}
async function getIncidentBySourceEmailId(sourceEmailId) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(incidents).where(eq(incidents.sourceEmailId, sourceEmailId)).limit(1);
  return rows[0] || null;
}
async function importBookingHistory(rows) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  let imported = 0;
  let skipped = 0;
  for (const row of rows) {
    try {
      await db.insert(bookingHistory).values({
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
async function getBookingHistoryByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingHistory).where(eq(bookingHistory.bookingId, bookingId)).orderBy(desc(bookingHistory.actionDate));
}
async function getBookingHistoryByPlate(plate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookingHistory).where(like(bookingHistory.licensePlate, `%${plate}%`)).orderBy(desc(bookingHistory.actionDate));
}
async function searchBookingHistory(search) {
  const db = await getDb();
  if (!db) return [];
  const s = `%${search}%`;
  return db.select().from(bookingHistory).where(or(
    like(bookingHistory.bookingId, s),
    like(bookingHistory.licensePlate, s),
    like(bookingHistory.userName, s),
    like(bookingHistory.changeType, s)
  )).orderBy(desc(bookingHistory.actionDate)).limit(200);
}
async function getBookingHistoryCrossReference() {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(lostFoundItems);
  const itemsWithRef = items.filter((i) => i.bookingRef && i.bookingRef.trim());
  if (itemsWithRef.length === 0) return [];
  const bookingRefs = itemsWithRef.map((i) => i.bookingRef.trim());
  const allHistory = await db.select().from(bookingHistory);
  const relevantHistory = allHistory.filter((h) => bookingRefs.some((ref) => h.bookingId.includes(ref) || ref.includes(h.bookingId)));
  const driverMap = /* @__PURE__ */ new Map();
  for (const h of relevantHistory) {
    if (!h.userName) continue;
    const driver = h.userName;
    const existing = driverMap.get(driver) || { cases: /* @__PURE__ */ new Set(), plates: /* @__PURE__ */ new Set(), total: 0, checkins: 0, checkouts: 0, movements: 0 };
    existing.cases.add(h.bookingId);
    if (h.licensePlate) existing.plates.add(h.licensePlate);
    existing.total++;
    if (h.changeType === "CHECK_IN") existing.checkins++;
    else if (h.changeType === "CHECK_OUT") existing.checkouts++;
    else if (h.changeType === "MOVEMENT") existing.movements++;
    driverMap.set(driver, existing);
  }
  return Array.from(driverMap.entries()).map(([userName, data]) => ({
    userName,
    caseCount: data.cases.size,
    plates: Array.from(data.plates),
    totalActions: data.total,
    checkins: data.checkins,
    checkouts: data.checkouts,
    movements: data.movements
  })).sort((a, b) => b.caseCount - a.caseCount);
}
async function getBookingHistoryDriverStats() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    userName: bookingHistory.userName,
    total: sql`COUNT(*)`,
    checkins: sql`SUM(CASE WHEN ${bookingHistory.changeType} = 'CHECK_IN' THEN 1 ELSE 0 END)`,
    checkouts: sql`SUM(CASE WHEN ${bookingHistory.changeType} = 'CHECK_OUT' THEN 1 ELSE 0 END)`,
    movements: sql`SUM(CASE WHEN ${bookingHistory.changeType} = 'MOVEMENT' THEN 1 ELSE 0 END)`
  }).from(bookingHistory).groupBy(bookingHistory.userName).orderBy(desc(sql`COUNT(*)`));
  return rows;
}

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
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
init_env();
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
  oauthService;
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
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function registerOAuthRoutes(app2) {
  if (process.env.NODE_ENV !== "production") {
    app2.get("/api/dev-login", async (req, res) => {
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
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: ONE_YEAR_MS
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.redirect(302, "/");
      } catch (error) {
        console.error("[Dev Login] Failed", error);
        res.status(500).json({ error: "Dev login failed", details: String(error) });
      }
    });
  }
  app2.get("/api/oauth/login", (_req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
      return;
    }
    const redirectUri = `${getOrigin(_req)}/api/oauth/callback`;
    const scope = "openid email profile";
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    res.redirect(302, url.toString());
  });
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : void 0;
    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }
    try {
      const redirectUri = `${getOrigin(req)}/api/oauth/callback`;
      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);
      const userInfo = await sdk.getUserInfo(tokenResponse.access_token);
      if (!userInfo.sub) {
        res.status(400).json({ error: "Google user ID missing" });
        return;
      }
      const openId = `google_${userInfo.sub}`;
      await upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
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
function resolveAnthropicModel(raw) {
  const aliases = {
    "claude-sonnet-4-6": "claude-sonnet-4-20250514",
    "claude-opus-4-6": "claude-opus-4-20250514",
    "claude-haiku-4-5": "claude-haiku-4-5-20251001",
    "claude-sonnet-4": "claude-sonnet-4-20250514",
    "claude-opus-4": "claude-opus-4-20250514"
  };
  return aliases[raw] || raw;
}
async function invokeClaude(params) {
  const apiKey = resolveApiKey();
  const model = resolveAnthropicModel(process.env.LLM_MODEL || "claude-sonnet-4-20250514");
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

// server/payrollPdf.ts
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
    rows.forEach(([desc2, val, isBold], idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
      const rowH = 22;
      doc.save();
      doc.rect(startX, y, pageW, rowH).fillColor(bgColor).fill();
      doc.restore();
      if (isBold === false) {
        doc.fontSize(8).font("Helvetica").fillColor("#888").text(desc2, startX + 10, y + 6, { width: pageW * 0.55 });
      } else {
        doc.fontSize(9).font("Helvetica").fillColor("#333").text(desc2, startX + 10, y + 6, { width: pageW * 0.55 });
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

// server/jobs/multiparkBookingSync.ts
init_multipark();
var projectMapCache = null;
var projectMapCacheTime = 0;
var CACHE_TTL = 5 * 60 * 1e3;
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
function findProjectId(parkName, city, projectMap) {
  if (!parkName) return void 0;
  const parkLower = parkName.toLowerCase().trim();
  const parkNorm = parkLower.replace(/\s*-\s*/g, " ");
  if (city) {
    const cityLower = city.toLowerCase().trim();
    const composite = `${parkNorm} ${cityLower}`;
    if (projectMap.has(composite)) return projectMap.get(composite);
    const composite2 = `${parkLower} ${cityLower}`;
    if (projectMap.has(composite2)) return projectMap.get(composite2);
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
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}
function bookingToRecord(booking, projectMap) {
  const client = booking.customer || booking.client;
  const pricing = booking.pricing;
  const park = booking.park;
  const parkName = park?.name || booking.parkName;
  const city = park?.city;
  const projectId = findProjectId(parkName, city, projectMap);
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
    campaign: booking.partnerName || booking.discountCode || booking.campaign || null,
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
    bookingCreatedAt: parseMultiparkDate(booking.createdAt)
  };
}
async function syncBookings(opts) {
  const actionTypes = opts.actionTypes || ["creation", "checkin", "checkout", "cancelation"];
  const projectMap = await getProjectMap();
  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  const errors = [];
  const parks = getConfiguredParks();
  const parksToSync = parks.length > 0 ? parks : [null];
  for (const park of parksToSync) {
    const apiKey = park ? getParkApiKey(park) : void 0;
    const parkLabel = park ? `${park.name} ${park.city}` : "global";
    for (const actionType of actionTypes) {
      try {
        const report = await getBookingsReport(opts.startDate, opts.endDate, actionType, apiKey);
        if (!report?.bookings?.length) continue;
        for (const booking of report.bookings) {
          try {
            const record = bookingToRecord(booking, projectMap);
            const result = await upsertMultiparkBooking(record);
            totalProcessed++;
            if (result?.action === "created") totalCreated++;
            else totalUpdated++;
          } catch (err) {
            errors.push(`Booking ${booking.id}: ${err.message}`);
          }
        }
      } catch (err) {
        errors.push(`${parkLabel}/${actionType}: ${err.message}`);
      }
    }
  }
  await createSyncLog({
    syncType: "api_sync",
    status: errors.length === 0 ? "success" : "partial",
    recordsProcessed: totalProcessed,
    recordsCreated: totalCreated,
    recordsUpdated: totalUpdated - totalCreated,
    errorMessage: errors.length > 0 ? errors.join("; ") : null,
    triggeredById: opts.triggeredById || null
  });
  return {
    success: errors.length === 0,
    processed: totalProcessed,
    created: totalCreated,
    updated: totalUpdated - totalCreated,
    errors
  };
}
var SYNC_INTERVAL = 15 * 60 * 1e3;

// server/zello.ts
init_env();
import crypto2 from "crypto";
var NETWORK = process.env.ZELLO_NETWORK ?? "airpark";
var BASE_URL = `https://${NETWORK}.zellowork.com`;
var USERNAME = process.env.ZELLO_USERNAME ?? "";
var PASSWORD = process.env.ZELLO_PASSWORD ?? "";
var currentSid = null;
var sidExpiresAt = 0;
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
  const md5pass = crypto2.createHash("md5").update(PASSWORD).digest("hex");
  const combined = md5pass + token + apiKey;
  const authHash = crypto2.createHash("md5").update(combined).digest("hex");
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

// server/jobs/dailyDriverCollection.ts
init_storage();
init_notification();
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
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const startTs = Math.floor(startOfDay.getTime() / 1e3);
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
          date: targetDate,
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
            notificationSent: true,
            occurredAt: targetDate
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

// server/routers.ts
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
var appRouter = router({
  system: systemRouter,
  // ── AUTH ────────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
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
      if (invite.status === "accepted") return { valid: false, reason: "Este convite j\xE1 foi utilizado" };
      if (/* @__PURE__ */ new Date() > invite.expiresAt) return { valid: false, reason: "Este convite expirou" };
      return { valid: true, email: invite.email, userId: invite.userId };
    }),
    completeInvite: publicProcedure.input(z2.object({ token: z2.string() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Tens de fazer login primeiro" });
      const invite = await getInviteByToken(input.token);
      if (!invite) throw new TRPCError3({ code: "NOT_FOUND", message: "Token inv\xE1lido" });
      if (invite.status === "accepted") throw new TRPCError3({ code: "BAD_REQUEST", message: "Convite j\xE1 utilizado" });
      if (/* @__PURE__ */ new Date() > invite.expiresAt) throw new TRPCError3({ code: "BAD_REQUEST", message: "Convite expirado" });
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
    list: protectedProcedure.query(async () => getProjects()),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => getProjectById(input.id)),
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
    costs: protectedProcedure.input(z2.object({ year: z2.number().optional(), month: z2.number().optional() }).optional()).query(async ({ input }) => {
      return getProjectCosts(input?.year, input?.month);
    })
  }),
  // ── TASKS (KANBAN) ────────────────────────────────────────────────────────────
  tasks: router({
    list: protectedProcedure.input(z2.object({ projectId: z2.number().optional(), assigneeId: z2.number().optional(), status: z2.string().optional() }).optional()).query(async ({ input }) => getTasks(input ?? {})),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const task = await getTaskById(input.id);
      if (!task) return null;
      const assignees = await getTaskAssignees(input.id);
      return { ...task, assignees };
    }),
    stats: protectedProcedure.query(async () => getTaskStats()),
    getAssignees: protectedProcedure.input(z2.object({ taskId: z2.number() })).query(async ({ input }) => getTaskAssignees(input.taskId)),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      projectId: z2.number().optional(),
      assigneeId: z2.number().optional(),
      assigneeIds: z2.array(z2.number()).optional(),
      priority: z2.enum(["low", "medium", "high", "urgent"]).default("medium"),
      dueDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await createTask({
        title: input.title,
        description: input.description ?? null,
        projectId: input.projectId ?? null,
        assigneeId: input.assigneeId ?? null,
        createdById: ctx.user.id,
        taskPriority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null
      });
      if (input.assigneeIds && input.assigneeIds.length > 0) {
        const tasks2 = await getTasks({});
        const newest = tasks2[0];
        if (newest) await setTaskAssignees(newest.id, input.assigneeIds);
      }
      await logActivity({ userId: ctx.user.id, action: "create", entity: "task", details: input.title });
      return { success: true };
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
      const { id, dueDate, assigneeIds, status, priority, ...rest } = input;
      const data = { ...rest };
      if (status !== void 0) data.taskStatus = status;
      if (priority !== void 0) data.taskPriority = priority;
      if (dueDate !== void 0) data.dueDate = dueDate ? new Date(dueDate) : null;
      if (status === "done") {
        data.completedAt = /* @__PURE__ */ new Date();
        data.notifiedComplete = false;
      }
      await updateTask(id, data);
      if (assigneeIds !== void 0) {
        await setTaskAssignees(id, assigneeIds);
      }
      await logActivity({ userId: ctx.user.id, action: "update", entity: "task", entityId: id, details: input.status ?? "" });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteTask(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "task", entityId: input.id });
      return { success: true };
    }),
    // Check and send notifications for overdue/completed tasks
    checkNotifications: protectedProcedure.mutation(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      const results = [];
      const overdue = await getOverdueTasks();
      for (const task of overdue) {
        const assignees = await getTaskAssignees(task.id);
        const assigneeNames = assignees.map((a) => a.employee?.fullName ?? "?").join(", ");
        let managers = [];
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
          title: `\u26A0\uFE0F Tarefa em atraso: ${task.title}`,
          content: `A tarefa "${task.title}" ultrapassou o prazo (${task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-PT") : "?"}).
Respons\xE1veis: ${assigneeNames || "Nenhum"}
Hierarquia: ${managers.join(" \u2192 ") || "N/A"}`
        });
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
        await markTaskNotified(task.id, "notifiedComplete");
        results.push(`Completed: ${task.title}`);
      }
      return { notified: results.length, details: results };
    })
  }),
  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure.query(async () => {
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
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => getExpenseById(input.id)),
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
        projectId: z2.number().optional(),
        buyerId: z2.number().optional(),
        invoiceImageUrl: z2.string().optional(),
        invoiceImageKey: z2.string().optional(),
        extractedByAi: z2.boolean().default(false),
        notes: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const expense = await createExpense({
        supplier: input.supplier ?? null,
        description: input.description ?? null,
        amount: input.amount,
        currency: input.currency,
        paymentMethod: input.paymentMethod ?? null,
        expenseDate: new Date(input.expenseDate),
        paymentDueDate: input.paymentDueDate && input.paymentDueDate !== "null" ? new Date(input.paymentDueDate) : null,
        categoryId: input.categoryId ?? null,
        projectId: input.projectId ?? null,
        buyerId: input.buyerId ?? null,
        insertedById: ctx.user.id,
        invoiceImageUrl: input.invoiceImageUrl ?? null,
        invoiceImageKey: input.invoiceImageKey ?? null,
        extractedByAi: input.extractedByAi,
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
    extractFromImage: protectedProcedure.input(z2.object({ imageUrl: z2.string() })).mutation(async ({ input }) => {
      let imageUrl = input.imageUrl;
      if (imageUrl.startsWith("/uploads/")) {
        const fs2 = await import("fs");
        const path2 = await import("path");
        const filePath = path2.join(process.cwd(), imageUrl);
        if (!fs2.existsSync(filePath)) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "Ficheiro de fatura n\xE3o encontrado" });
        }
        const fileBuffer = fs2.readFileSync(filePath);
        const ext = path2.extname(filePath).toLowerCase().replace(".", "");
        const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
        const mime = mimeMap[ext] || "image/jpeg";
        imageUrl = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      }
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
      requireRole(ctx.user.role, "admin");
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
            (o) => `\u2022 ${o.expense.supplier ?? "Sem fornecedor"}: ${o.expense.amount}\u20AC (venceu em ${o.expense.paymentDueDate?.toLocaleDateString("pt-PT")})`
          ).join("\n")
        });
      }
      return { updated: overdue.length };
    })
  }),
  // ── LOGSS ───────────────────────────────────────────────────────────────────────────────────
  logs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "super_admin");
      return getActivityLogs(200);
    })
  }),
  // ── RH ───────────────────────────────────────────────────────────────────────────────────────
  rh: router({
    // ── MY PROFILE (for extra/low-role users) ──────────────────────────────────────────────────
    me: protectedProcedure.query(async ({ ctx }) => {
      return getEmployeeByUserId(ctx.user.id);
    }),
    // ── STATS ──────────────────────────────────────────────────────────────────────────────────
    stats: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      await seedExtraRates();
      return getHRStats();
    }),
    // ── EMPLOYEES ─────────────────────────────────────────────────────────────────────────────────
    list: protectedProcedure.input(z2.object({ isActive: z2.boolean().optional(), position: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      return getAllEmployees({ isActive: input?.isActive, position: input?.position });
    }),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) {
        const myEmployee = await getEmployeeByUserId(ctx.user.id);
        if (!myEmployee || myEmployee.employee.id !== input.id) {
          throw new TRPCError3({ code: "FORBIDDEN", message: "Sem permiss\xE3o" });
        }
      }
      return getEmployeeById(input.id);
    }),
    create: protectedProcedure.input(z2.object({
      fullName: z2.string().min(1),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      nif: z2.string().optional(),
      nib: z2.string().optional(),
      address: z2.string().optional(),
      birthDate: z2.string().optional(),
      nationality: z2.string().optional(),
      position: z2.enum(["director", "supervisor", "team_leader", "backoffice", "frontoffice", "senior_driver", "driver", "extra"]),
      extraLevel: z2.number().min(1).max(5).optional(),
      department: z2.string().optional(),
      projectId: z2.number().optional(),
      contractType: z2.enum(["permanent", "fixed_term", "extra"]).optional(),
      contractStart: z2.string().optional(),
      contractEnd: z2.string().optional(),
      monthlySalary: z2.string().optional(),
      mealAllowancePerDay: z2.string().optional(),
      userId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      await createEmployee({
        fullName: input.fullName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        nif: input.nif ?? null,
        nib: input.nib ?? null,
        address: input.address ?? null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        nationality: input.nationality ?? null,
        position: input.position,
        extraLevel: input.extraLevel ?? null,
        department: input.department ?? null,
        projectId: input.projectId ?? null,
        contractType: input.contractType ?? "permanent",
        contractStart: input.contractStart ? new Date(input.contractStart) : null,
        contractEnd: input.contractEnd ? new Date(input.contractEnd) : null,
        monthlySalary: input.monthlySalary ?? null,
        mealAllowancePerDay: input.mealAllowancePerDay ?? null,
        userId: input.userId ?? null,
        isActive: true
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "employee", details: `Colaborador criado: ${input.fullName}` });
      return { success: true };
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
        requireRole(ctx.user.role, "admin");
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
        requireRole(ctx.user.role, "admin");
        return getDocumentChecklistForEmployee(input.employeeId);
      }),
      allStatus: protectedProcedure.query(async ({ ctx }) => {
        requireRole(ctx.user.role, "admin");
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
        requireRole(ctx.user.role, "admin");
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
        await upsertSchedule(input);
        return { success: true };
      })
    }),
    // ── TIME RECORDS ────────────────────────────────────────────────────────────────────────────────
    timeRecords: router({
      list: protectedProcedure.input(z2.object({ employeeId: z2.number(), startDate: z2.string().optional(), endDate: z2.string().optional() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
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
        requireRole(ctx.user.role, "admin");
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
          recordedAt: /* @__PURE__ */ new Date(),
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
        requireRole(ctx.user.role, "admin");
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
        const records = await getTimeRecords(input.employeeId);
        const lastCheckIn = records.find((r) => r.type === "check_in");
        let hoursWorked = null;
        if (lastCheckIn) {
          const diff = ((/* @__PURE__ */ new Date()).getTime() - new Date(lastCheckIn.recordedAt).getTime()) / 36e5;
          hoursWorked = diff.toFixed(2);
        }
        await createTimeRecord({
          employeeId: input.employeeId,
          type: "check_out",
          recordedAt: /* @__PURE__ */ new Date(),
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
        requireRole(ctx.user.role, "admin");
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
      await savePayslipRecord({ year: input.year, month: input.month, type: "payroll", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
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
      await savePayslipRecord({ employeeId: input.employeeId, employeeName: empName, year: input.year, month: input.month, type: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
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
        await savePayslipRecord({ employeeId: ps.employeeId, employeeName: ps.fullName, year: input.year, month: input.month, type: "individual", url, fileName, generatedById: ctx.user.id, generatedByName: ctx.user.name ?? "Admin" });
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
      requireRole(ctx.user.role, "admin");
      const from = input?.from ? new Date(input.from) : void 0;
      const to = input?.to ? new Date(input.to) : void 0;
      return getMarketingDashboardStats({ from, to, projectId: input?.projectId });
    }),
    bookingRevenue: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "admin");
      return getBookingRevenueByProject({ from: input?.from, to: input?.to, projectId: input?.projectId });
    }),
    // ── CAMPAIGNS ──
    campaigns: router({
      list: protectedProcedure.input(z2.object({ platform: z2.string().optional(), projectId: z2.number().optional(), status: z2.string().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getCampaigns({ platform: input?.platform, projectId: input?.projectId, status: input?.status });
      }),
      get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
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
          status: input.status ?? "active",
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
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
    // ── DAILY STATS ──
    stats: router({
      byCampaign: protectedProcedure.input(z2.object({ campaignId: z2.number() })).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "admin");
        return getCampaignStats(input.campaignId);
      }),
      all: protectedProcedure.input(z2.object({ from: z2.string().optional(), to: z2.string().optional(), projectId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
        requireRole(ctx.user.role, "super_admin");
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
          date: new Date(r.date),
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
                status: c.status,
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
              status: c.status,
              startDate,
              endDate,
              budget: c.budget > 0 ? String(c.budget) : null,
              notes: `Tipo: ${c.campaignType}`,
              createdById: ctx.user.id
            });
            campaign = await getCampaignById(id);
            details.push(`\u2705 Campanha criada: ${c.name}`);
          } else {
            await updateCampaign(campaign.id, {
              status: c.status,
              budget: c.budget > 0 ? String(c.budget) : campaign.budget
            });
          }
          if (!campaign) {
            skipped++;
            continue;
          }
          const existing = await getExistingStatsForCampaignAndDateRange(campaign.id, startDate, endDate);
          if (existing.length > 0) {
            details.push(`\u26A0\uFE0F Dados j\xE1 existem para ${c.name} (${input.dateRange.start} a ${input.dateRange.end}) \u2014 ignorado`);
            skipped++;
            continue;
          }
          await importDailyStats([{
            campaignId: campaign.id,
            date: endDate,
            // use end date as reference
            spend: String(c.cost),
            impressions: c.impressions,
            clicks: c.clicks,
            conversions: Math.round(c.conversions),
            conversionValue: String(c.conversions),
            cpc: c.cpc > 0 ? String(c.cpc) : null,
            ctr: c.ctr > 0 ? String(c.ctr) : null,
            costPerConversion: c.costPerConversion > 0 ? String(c.costPerConversion) : null,
            importedById: ctx.user.id
          }]);
          created++;
          details.push(`\u{1F4CA} Dados importados: ${c.name} \u2014 ${c.cost.toFixed(2)}\u20AC, ${c.clicks} cliques, ${c.impressions} impress\xF5es`);
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
        requireRole(ctx.user.role, "admin");
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
          category: input.category,
          amount: input.amount,
          date: new Date(input.date),
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
          status: input.status ?? "active",
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
        await updateVehicle(input.id, input.data);
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
          type: input.type,
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
          transcribedAt: /* @__PURE__ */ new Date(),
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
            isDefault: input.isDefault
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
          await updateSpeedLimit(input.id, input.data);
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
              notificationSent: true,
              occurredAt: /* @__PURE__ */ new Date()
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
              notificationSent: true,
              occurredAt: /* @__PURE__ */ new Date()
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
                notificationSent: true,
                occurredAt: /* @__PURE__ */ new Date()
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
        key,
        permissions: input.permissions ? JSON.stringify(input.permissions) : null,
        active: true,
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
    searchBooking: protectedProcedure.input(z2.object({ search: z2.string().min(2) })).query(async ({ input }) => {
      return searchBookingByRef(input.search);
    }),
    fetchBookingDetails: protectedProcedure.input(z2.object({ externalId: z2.string() })).query(async ({ input }) => {
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
    }).optional()).query(async ({ input }) => {
      return getComplaints(input ?? {});
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
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
      const slaDeadline = input.slaHours ? new Date(Date.now() + input.slaHours * 36e5) : null;
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
        reservationStart: input.reservationStart ? new Date(input.reservationStart) : null,
        reservationEnd: input.reservationEnd ? new Date(input.reservationEnd) : null,
        vehicleId: input.vehicleId ?? null,
        vehiclePlate: input.vehiclePlate ?? null,
        driversInvolved: input.driversInvolved ?? null,
        slaDeadline,
        projectId: input.projectId ?? null,
        assignedToId: input.assignedToId ?? null,
        createdById: ctx.user.id
      });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "complaint", entityId: id, details: `Reclama\xE7\xE3o: ${input.title}` });
      return { id };
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
      slaHours: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "frontoffice");
      const { id, slaHours, type, status, priority, ...rest } = input;
      const updateData = { ...rest };
      if (type) updateData.complaintType = type;
      if (status) updateData.complaintStatus = status;
      if (priority) updateData.complaintPriority = priority;
      if (slaHours) updateData.slaDeadline = new Date(Date.now() + slaHours * 36e5);
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
      const id = await addComplaintMessage({
        complaintId: input.complaintId,
        message: input.message,
        isInternal: input.isInternal ?? false,
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
      await deleteComplaintPhoto(input.id);
      return { success: true };
    }),
    stats: protectedProcedure.query(async () => {
      return getComplaintStats();
    }),
    // Get vehicle driver history for a complaint
    vehicleHistory: protectedProcedure.input(z2.object({ vehicleId: z2.number() })).query(async ({ input }) => {
      return getVehicleDriverHistory(input.vehicleId);
    })
  }),
  // ─── GOOGLE REVIEWS ───────────────────────────────────────────────────────
  reviews: router({
    list: protectedProcedure.input(z2.object({
      rating: z2.number().optional(),
      status: z2.string().optional(),
      projectId: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      return getGoogleReviews(input ?? void 0);
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getGoogleReviewById(input.id);
    }),
    stats: protectedProcedure.query(async () => {
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
      const reviewDate = input.reviewDate ? new Date(input.reviewDate) : /* @__PURE__ */ new Date();
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
            type: "other",
            priority: input.rating === 1 ? "urgent" : "high",
            clientName: input.reviewerName,
            clientEmail: input.reviewerEmail || void 0,
            vehiclePlate: input.vehiclePlate || void 0,
            projectId: input.projectId || void 0,
            slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1e3),
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
      const { id, ...data } = input;
      if (data.status === "manually_responded" || data.aiResponse) {
        data.respondedAt = /* @__PURE__ */ new Date();
        data.respondedBy = ctx.user.id;
      }
      await updateGoogleReview(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "google_review", entityId: id, details: `Review atualizada` });
      return { success: true };
    }),
    generateResponse: protectedProcedure.input(z2.object({
      id: z2.number()
    })).mutation(async ({ ctx, input }) => {
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
    })).query(async ({ input }) => {
      return searchClientHistory(input.name, input.email, input.plate);
    }),
    approveResponse: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await updateGoogleReview(input.id, { aiResponseApproved: true, respondedAt: /* @__PURE__ */ new Date(), respondedBy: ctx.user.id, status: "manually_responded" });
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
    })
  }),
  // ─── FORMAÇÃO E APOIO ──────────────────────────────────────────────────────
  training: router({
    // Categories
    categories: protectedProcedure.query(async () => {
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
    videos: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ input }) => {
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
    manuals: protectedProcedure.input(z2.object({ categoryId: z2.number().optional(), type: z2.string().optional() })).query(async ({ input }) => {
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
    faqs: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ input }) => {
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
    quizQuestions: protectedProcedure.input(z2.object({ categoryId: z2.number().optional() })).query(async ({ input }) => {
      return getQuizQuestions(input.categoryId);
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
    submitQuiz: protectedProcedure.input(z2.object({ employeeId: z2.number(), answers: z2.array(z2.object({ questionId: z2.number(), answer: z2.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z2.number().optional() })).mutation(async ({ ctx, input }) => {
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
      const result = await saveQuizAttempt({ employeeId: input.employeeId, totalQuestions: input.answers.length, correctAnswers: correct, score, timeSpentSeconds: input.timeSpentSeconds });
      return { ...result, correct, score, total: input.answers.length };
    }),
    quizRanking: protectedProcedure.query(async () => {
      return getQuizRanking();
    }),
    // Career Exams
    careerExams: protectedProcedure.query(async () => {
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
    careerExamQuestions: protectedProcedure.input(z2.object({ examId: z2.number() })).query(async ({ input }) => {
      return getCareerExamQuestions(input.examId);
    }),
    createCareerExamQuestion: protectedProcedure.input(z2.object({ examId: z2.number(), question: z2.string(), optionA: z2.string(), optionB: z2.string(), optionC: z2.string(), optionD: z2.string(), correctOption: z2.enum(["A", "B", "C", "D"]), explanation: z2.string().optional(), points: z2.number().optional() })).mutation(async ({ ctx, input }) => {
      if (ROLE_HIERARCHY[ctx.user.role] < ROLE_HIERARCHY["admin"]) throw new TRPCError3({ code: "FORBIDDEN" });
      const result = await createCareerExamQuestion(input);
      return result;
    }),
    submitCareerExam: protectedProcedure.input(z2.object({ examId: z2.number(), employeeId: z2.number(), answers: z2.array(z2.object({ questionId: z2.number(), answer: z2.enum(["A", "B", "C", "D"]) })), timeSpentSeconds: z2.number().optional() })).mutation(async ({ ctx, input }) => {
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
      const result = await saveCareerExamAttempt({ examId: input.examId, employeeId: input.employeeId, totalQuestions: questions.length, correctAnswers: correct, score: percentage, passed, timeSpentSeconds: input.timeSpentSeconds });
      if (passed) {
        await notifyOwner({ title: `Exame aprovado: ${exam.title}`, content: `Colaborador #${input.employeeId} passou no exame "${exam.title}" com ${percentage}% (m\xEDnimo: ${exam.passingScore}%)` });
      }
      return { ...result, correct, score: percentage, total: questions.length, passed, passingScore: exam.passingScore };
    }),
    careerExamAttempts: protectedProcedure.input(z2.object({ employeeId: z2.number().optional(), examId: z2.number().optional() })).query(async ({ input }) => {
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
    }).optional()).query(({ input }) => getLostFoundItems(input)),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getLostFoundItemById(input.id)),
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
    getPhotos: protectedProcedure.input(z2.object({ itemId: z2.number() })).query(({ input }) => getLostFoundPhotos(input.itemId)),
    uploadPhoto: protectedProcedure.input(z2.object({
      itemId: z2.number(),
      base64: z2.string(),
      filename: z2.string(),
      caption: z2.string().optional()
    })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.filename.split(".").pop() || "jpg";
      const key = `lost-found/${input.itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, `image/${ext}`);
      await addLostFoundPhoto({ itemId: input.itemId, url, fileKey: key, caption: input.caption || null });
      return { url };
    }),
    // Messages
    getMessages: protectedProcedure.input(z2.object({ itemId: z2.number() })).query(({ input }) => getLostFoundMessages(input.itemId)),
    addMessage: protectedProcedure.input(z2.object({
      itemId: z2.number(),
      message: z2.string().min(1),
      isInternal: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await addLostFoundMessage({ itemId: input.itemId, userId: ctx.user.id, userName: ctx.user.name || "Utilizador", message: input.message, isInternal: input.isInternal ?? true });
      return { success: true };
    }),
    // Driver ranking (cruzamento de dados)
    driverRanking: protectedProcedure.query(() => getLostFoundDriverRanking()),
    // Vehicle driver history (reuse from operational)
    vehicleDrivers: protectedProcedure.input(z2.object({ plate: z2.string() })).query(async ({ input }) => {
      const allVehicles = await getVehicles();
      const vehicle = allVehicles.find((v) => v.plate === input.plate);
      if (!vehicle) return [];
      return getVehicleDriverHistory(vehicle.id);
    }),
    // ── Booking History (imported from Excel) ──
    importBookingHistory: protectedProcedure.input(z2.object({ fileBase64: z2.string(), filename: z2.string() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const buffer = Buffer.from(input.fileBase64, "base64");
      const wb = XLSX.read(buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) throw new Error("Ficheiro Excel vazio");
      const raw = XLSX.utils.sheet_to_json(ws);
      if (raw.length === 0) throw new Error("Sem dados no ficheiro");
      const rows = raw.map((r) => {
        let actionDate = null;
        const rawDate = r["Data da A\xE7\xE3o"] || r["Data da Acao"] || r["actionDate"];
        if (typeof rawDate === "number") {
          const d = new Date((rawDate - 25569) * 86400 * 1e3);
          actionDate = d.toISOString().slice(0, 19).replace("T", " ");
        } else if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) actionDate = d.toISOString().slice(0, 19).replace("T", " ");
        }
        const str = (v) => v != null && String(v).trim() !== "" ? String(v).trim() : null;
        return {
          historyId: str(r["ID do Hist\xF3rico"] ?? r["ID do Historico"] ?? r["historyId"]) || `gen_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          bookingId: str(r["ID da Reserva"] ?? r["bookingId"]) || "",
          changeType: str(r["Tipo de Altera\xE7\xE3o"] ?? r["Tipo de Alteracao"] ?? r["changeType"]) || "",
          userName: str(r["Nome do Utilizador"] ?? r["userName"]),
          userLastName: str(r["Apelido do Utilizador"] ?? r["userLastName"]),
          userEmail: str(r["Email do Utilizador"] ?? r["userEmail"]),
          remarks: str(r["Observa\xE7\xF5es"] ?? r["Observacoes"] ?? r["remarks"]),
          actionDate,
          parkName: str(r["Parque"] ?? r["parkName"]),
          licensePlate: str(r["Matr\xEDcula"] ?? r["Matricula"] ?? r["licensePlate"]),
          bookingStatus: str(r["Estado da Reserva"] ?? r["bookingStatus"])
        };
      }).filter((r) => r.bookingId);
      const result = await importBookingHistory(rows);
      await logActivity({
        userId: ctx.user.id,
        action: "import",
        entity: "booking_history",
        details: `Importados ${result.imported} registos (${result.skipped} duplicados) de ${input.filename}`
      });
      return { ...result, total: rows.length };
    }),
    bookingHistory: protectedProcedure.input(z2.object({ bookingId: z2.string().optional(), plate: z2.string().optional(), search: z2.string().optional() })).query(async ({ input }) => {
      if (input.bookingId) return getBookingHistoryByBookingId(input.bookingId);
      if (input.plate) return getBookingHistoryByPlate(input.plate);
      if (input.search) return searchBookingHistory(input.search);
      return [];
    }),
    bookingHistoryDriverStats: protectedProcedure.query(() => getBookingHistoryDriverStats()),
    bookingHistoryCrossRef: protectedProcedure.query(() => getBookingHistoryCrossReference())
  }),
  // ─── OCORRÊNCIAS (INCIDENTS) ──────────────────────────────────────────────
  incidents: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      severity: z2.string().optional(),
      employeeId: z2.number().optional(),
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional()
    }).optional()).query(({ input }) => getIncidents(input)),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getIncidentById(input.id)),
    create: protectedProcedure.input(z2.object({
      projectId: z2.number().optional(),
      vehiclePlate: z2.string().optional(),
      employeeId: z2.number().optional(),
      incidentType: z2.enum(["vidro_aberto", "mal_estacionado", "dano", "chave_errada", "combustivel", "limpeza", "documentos", "outro"]),
      severity: z2.enum(["low", "medium", "high", "critical"]),
      description: z2.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      if (data.status === "resolved") {
        data.resolvedAt = /* @__PURE__ */ new Date();
        data.resolvedBy = ctx.user.id;
      }
      await updateIncident(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "incident", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deleteIncident(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "incident", entityId: input.id });
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional()
    }).optional()).query(({ input }) => getIncidentStats(input?.weekNumber, input?.yearNumber)),
    byEmployee: protectedProcedure.input(z2.object({ employeeId: z2.number() })).query(({ input }) => getIncidentsByEmployee(input.employeeId))
  }),
  // ─── AVALIAÇÃO DE DESEMPENHO ─────────────────────────────────────────────
  performance: router({
    list: protectedProcedure.input(z2.object({
      weekNumber: z2.number().optional(),
      yearNumber: z2.number().optional(),
      employeeId: z2.number().optional()
    }).optional()).query(({ input }) => getPerformanceEvaluations(input)),
    generate: protectedProcedure.input(z2.object({
      weekNumber: z2.number(),
      yearNumber: z2.number()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const results = await generateWeeklyEvaluation(input.weekNumber, input.yearNumber);
      await logActivity({ userId: ctx.user.id, action: "generate", entity: "performance_evaluation", details: `Semana ${input.weekNumber}/${input.yearNumber}` });
      return results;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      positivePoints: z2.number().optional(),
      negativePoints: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      if (data.positivePoints !== void 0 || data.negativePoints !== void 0) {
        data.totalPoints = (data.positivePoints || 0) - (data.negativePoints || 0);
      }
      await updatePerformanceEvaluation(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
    }).optional()).query(({ input }) => getServices(input)),
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      await updateService(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deleteService(input.id);
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ input }) => getServiceStats(input?.month, input?.year))
  }),
  // ─── FATURAÇÃO ───────────────────────────────────────────────────────────
  invoices: router({
    list: protectedProcedure.input(z2.object({
      status: z2.string().optional(),
      projectId: z2.number().optional(),
      search: z2.string().optional(),
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ input }) => getInvoices(input)),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getInvoiceById(input.id)),
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      await updateInvoice(id, data);
      await logActivity({ userId: ctx.user.id, action: "update", entity: "invoice", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deleteInvoice(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "invoice", entityId: input.id });
      return { success: true };
    }),
    stats: protectedProcedure.input(z2.object({
      month: z2.number().optional(),
      year: z2.number().optional()
    }).optional()).query(({ input }) => getInvoiceStats(input?.month, input?.year)),
    billing: protectedProcedure.input(z2.object({
      from: z2.string(),
      to: z2.string(),
      projectId: z2.number().optional()
    })).query(({ input }) => getBillingData(input))
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
    }).optional()).query(({ input }) => getPartnerships(input)),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getPartnershipById(input.id)),
    dashboardStats: protectedProcedure.query(async () => {
      await markOverduePartnershipInvoices();
      return getPartnershipDashboardStats();
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      campaignKey: z2.string().optional(),
      partnerType: z2.enum(["aggregator", "agency", "pro_client", "other", "corporate", "retainer"]),
      contactName: z2.string().optional(),
      contactEmail: z2.string().optional(),
      contactPhone: z2.string().optional(),
      commissionRate: z2.number().optional(),
      monthlyFee: z2.number().optional(),
      nif: z2.string().optional(),
      billingAgreement: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { nif, ...rest } = input;
      const id = await createPartnership({ ...rest, partnerNif: nif });
      await logActivity({ userId: ctx.user.id, action: "create", entity: "partnership", entityId: id || 0, details: `Parceria: ${input.name}` });
      return { id };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      campaignKey: z2.string().optional(),
      contactName: z2.string().optional(),
      contactEmail: z2.string().optional(),
      contactPhone: z2.string().optional(),
      commissionRate: z2.number().optional(),
      monthlyFee: z2.number().optional(),
      nif: z2.string().optional(),
      billingAgreement: z2.string().optional(),
      status: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, nif, ...rest } = input;
      await updatePartnership(id, { ...rest, ...nif !== void 0 ? { partnerNif: nif } : {} });
      await logActivity({ userId: ctx.user.id, action: "update", entity: "partnership", entityId: id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deletePartnership(input.id);
      await logActivity({ userId: ctx.user.id, action: "delete", entity: "partnership", entityId: input.id });
      return { success: true };
    }),
    // Transactions
    getTransactions: protectedProcedure.input(z2.object({ partnershipId: z2.number() })).query(({ input }) => getPartnershipTransactions(input.partnershipId)),
    addTransaction: protectedProcedure.input(z2.object({
      partnershipId: z2.number(),
      projectId: z2.number().optional(),
      transactionType: z2.enum(["booking", "commission", "payment", "adjustment"]),
      description: z2.string().optional(),
      amount: z2.number(),
      transactionDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
    })).query(({ input }) => getBookingsByCampaign(input))
  }),
  // ─── ANUAL ───────────────────────────────────────────────────────────────
  annual: router({
    list: protectedProcedure.input(z2.object({
      year: z2.number().optional(),
      projectId: z2.number().optional()
    }).optional()).query(({ input }) => getAnnualReports(input)),
    breakdown: protectedProcedure.input(z2.object({
      year: z2.number(),
      projectId: z2.number().optional()
    })).query(({ input }) => getAnnualBreakdown(input.year, input.projectId)),
    generate: protectedProcedure.input(z2.object({
      year: z2.number(),
      projectId: z2.number().optional(),
      splitPartner: z2.number().min(0).max(100).optional()
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
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
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const { id, ...data } = input;
      await updateAnnualReport(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deleteAnnualReport(input.id);
      return { success: true };
    })
  }),
  // ── MULTIPARK INTEGRATION ──────────────────────────────────────────────────
  multipark: router({
    // Test API connection
    testConnection: protectedProcedure.query(async ({ ctx }) => {
      requireRole(ctx.user.role, "admin");
      return testConnection();
    }),
    // Check availability
    checkAvailability: protectedProcedure.input(z2.object({
      checkIn: z2.string(),
      checkOut: z2.string(),
      vehicleType: z2.enum(["MOTORCYCLE", "CAR", "VAN", "TRUCK"]).default("CAR"),
      parkingType: z2.enum(["COVERED", "UNCOVERED", "INDOOR", "VIP"]).default("COVERED")
    })).query(async ({ input }) => {
      return checkAvailability(
        input.checkIn,
        input.checkOut,
        input.vehicleType,
        input.parkingType
      );
    }),
    // List parks
    listParks: protectedProcedure.query(async () => {
      return listParks();
    }),
    // Get sync logs
    syncLogs: protectedProcedure.query(async () => {
      return getSyncLogs(50);
    }),
    // ── KPIs AGREGADOS ──
    kpis: protectedProcedure.input(z2.object({
      from: z2.string().optional(),
      to: z2.string().optional(),
      city: z2.string().optional()
    }).optional()).query(async ({ input }) => {
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
    }).optional()).query(async ({ input }) => {
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
      const parseDate = (val) => {
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
          snapshotDate: /* @__PURE__ */ new Date(g.date.toISOString().slice(0, 10) + "T00:00:00.000Z"),
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
    }).optional()).query(async ({ input }) => {
      return getMultiparkBookings({
        status: input?.status,
        parkingType: input?.parkingType,
        from: input?.from,
        to: input?.to,
        search: input?.search,
        limit: input?.limit
      });
    }),
    // Booking stats (with optional filters)
    bookingStats: protectedProcedure.input(z2.object({
      from: z2.string().optional(),
      to: z2.string().optional(),
      projectId: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      return getMultiparkBookingStats(input ?? void 0);
    }),
    // Query LOCAL DB by actionType + date range
    localBookingsByAction: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      actionType: z2.enum(["creation", "checkin", "checkout", "cancelation"]),
      projectId: z2.number().optional()
    })).query(async ({ input }) => {
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
    })).query(async ({ input }) => {
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
import { eq as eq2, and as and2 } from "drizzle-orm";
import { drizzle as drizzle2 } from "drizzle-orm/mysql2";
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
  const db = await getDb2();
  if (!db) {
    res.status(500).json({ error: "Database unavailable" });
    return;
  }
  const result = await db.select().from(apiKeys).where(and2(eq2(apiKeys.apiKey, key), eq2(apiKeys.active, true))).limit(1);
  if (result.length === 0) {
    res.status(403).json({ error: "Invalid or inactive API key" });
    return;
  }
  await db.update(apiKeys).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq2(apiKeys.id, result[0].id));
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
        const db = await getDb2();
        if (db) {
          const veh = await db.select().from(vehicles).where(eq2(vehicles.plate, plate)).limit(1);
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
        const db = await getDb2();
        if (db) {
          const veh = await db.select().from(vehicles).where(eq2(vehicles.plate, plate)).limit(1);
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
        type,
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
        transcribedAt: /* @__PURE__ */ new Date(),
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
              importedAt: now
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
              reviewDate: /* @__PURE__ */ new Date(),
              status: "pending_response",
              sourceEmailId: rev.sourceEmailId || void 0,
              importedAt: /* @__PURE__ */ new Date()
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

// server/_core/api-entry.ts
import { createExpressMiddleware } from "@trpc/server/adapters/express";
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
var initError = null;
try {
  registerOAuthRoutes(app);
  app.use("/api/external", createExternalApiRouter());
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
app.get("/api/health", (_req, res) => {
  res.json({ ok: !initError, error: initError, env: !!process.env.DATABASE_URL });
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
