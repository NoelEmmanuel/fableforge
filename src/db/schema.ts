import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookSpecs = pgTable("book_specs", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull().unique(),
  core: jsonb("core"),
  toneAndThemes: jsonb("tone_and_themes"),
  worldAndRules: jsonb("world_and_rules"),
  charactersSummary: jsonb("characters_summary"),
  plotArcs: jsonb("plot_arcs"),
  pacingPreferences: jsonb("pacing_preferences"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  tags: text("tags").array(),
  profile: jsonb("profile"),
  relationships: jsonb("relationships"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull(),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  arcLabel: text("arc_label"),
  povCharacterId: uuid("pov_character_id"),
  timelineMarker: text("timeline_marker"),
  emotionalIntensity: integer("emotional_intensity"),
  cliffhangerScore: integer("cliffhanger_score"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const chapterVersions = pgTable("chapter_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id").notNull(),
  versionIndex: integer("version_index").notNull(),
  source: text("source").notNull().default("human"),
  titleSnapshot: text("title_snapshot").notNull(),
  contentJson: jsonb("content_json").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const styleProfiles = pgTable("style_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull(),
  inspirationSourceId: uuid("inspiration_source_id"),
  name: text("name").notNull(),
  summary: text("summary"),
  features: jsonb("features"),
  llmConfig: jsonb("llm_config"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inspirationSources = pgTable("inspiration_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull(),
  type: text("type").notNull(),
  label: text("label").notNull(),
  sourceMetadata: jsonb("source_metadata"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const artifacts = pgTable("artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").notNull(),
  chapterId: uuid("chapter_id"),
  type: text("type").notNull(),
  label: text("label"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const generationRuns = pgTable("generation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id"),
  type: text("type").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  estimatedCostUsd: text("estimated_cost_usd"),
  requestPayload: jsonb("request_payload"),
  responseMetadata: jsonb("response_metadata"),
  status: text("status").notNull().default("started"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

