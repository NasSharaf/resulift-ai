import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey(), // Clerk User ID
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  // MVP fields:
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),

  // Future-proofing fields (harmless for MVP):
  plan: text("plan").notNull().default("free"),   // "free", "pro"
  
  // NEW: credit system fields
  freeCredits: integer("free_credits").notNull().default(3),  // always starts at 7
  freeUsed: integer("free_used").notNull().default(0),
  referralCode: text("referral_code").unique(),             // assigned at signup
  referredBy: text("referred_by"),                          // who referred them
});

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  blobUrl: text("blob_url"),
  extractedText: text("extracted_text"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const tailoredResumes = sqliteTable("tailored_resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  resumeId: text("resume_id").notNull(),
  jobId: text("job_id").notNull(),
  tailoredText: text("tailored_text").notNull(),
  atsScoreBefore: integer("ats_score_before"),
  atsScoreAfter: integer("ats_score_after"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const anonymousVisitors = sqliteTable("anonymous_visitors", {
  visitorId: text("visitor_id")
    .primaryKey(), // we’ll use crypto.randomUUID() in middleware
  resumeCount: integer("resume_count").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),

  deviceHash: text("device_hash"), // optional, default null
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  planId: text("plan_id").notNull(),
  status: text("status").notNull(), // 'active', 'past_due', 'canceled'
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }).notNull(),
});

export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(), // Stripe event ID
  type: text("type").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp_ms" }).notNull(),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobId: text("job_id").notNull(),
  tailoredResumeId: text("tailored_resume_id").notNull(),

  // Core fields (extracted from job description or manual)
  companyName: text("company_name"),
  jobTitle: text("job_title"),

  // Application tracking
  applicationStatus: text("application_status").notNull().default("generated"),
  // Enum: 'generated', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'
  appliedAt: integer("applied_at", { mode: "timestamp" }),

  // ATS scores (copied from tailoredResumes)
  atsScoreBefore: integer("ats_score_before"),
  atsScoreAfter: integer("ats_score_after"),

  // User editable
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
