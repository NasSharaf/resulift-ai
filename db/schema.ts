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
  credits: integer("credits").notNull().default(50), // usage limit (optional)
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});