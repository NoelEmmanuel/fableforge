---
name: fableforge-architecture-and-mvp-plan
overview: High-level product, architecture, and agentic workflow plan for FableForge, a personal-use AI-assisted fantasy/webnovel writing studio built with a modern, low-cost web stack.
todos:
  - id: clarify-bible-scope
    content: Clarify initial scope and UI depth for the story bible fields to avoid overwhelming the MVP while keeping the core creative controls.
    status: pending
  - id: finalize-schema-details
    content: Lock in the initial Postgres/Drizzle schema (tables and JSONB artifacts) and decide which fields are required vs optional for MVP.
    status: pending
  - id: define-agent-prompts
    content: Define first-pass prompt templates and expected JSON artifacts for Planner, Writer, Continuity, Inspiration, and Inline Editor agents.
    status: pending
  - id: streaming-technique-choice
    content: Choose between SSE and fetch+ReadableStream for the chapter generation streaming implementation in Next.js App Router.
    status: pending
  - id: background-jobs-setup
    content: Decide on and configure the background job system (Inngest vs alternatives) for inspiration analysis and continuity updates.
    status: pending
isProject: false
---

# FableForge Architecture & MVP Plan

### 1. Sharper product definition

FableForge is a **personal-use AI writing studio** for **fantasy / fairytale / webnovel-style novels** where a single user:

- **Defines rich story bibles** (world, characters, tone, constraints, tropes, long arcs).
- **Writes chapters inside a live-streaming editor** that shows AI writing in real time and lets the user intervene at any moment.
- Uses **inline AI tools as a co-writer** (rewrite, expand, emotional/tone shifts, pacing, dialogue, etc.).
- Optionally feeds **inspiration sources** (summarized, not copied) to shape style via reusable **style profiles**.
- Benefits from a **minimal, cost-conscious agentic pipeline** (planner → writer → continuity) that improves consistency without being overengineered.

This is not a general-purpose chatbot or generic prompt wrapper; it is a **focused environment for long-form serial fiction** with opinionated UX and constrained, explainable AI behavior.

### 2. Hidden complexity, risks, and assumptions

- **Rich story spec UI complexity**:
  - The story bible fields (tone, world rules, power system, relationships, etc.) can easily become overwhelming and cluttered.
  - **Recommendation**: Start with a **small, opinionated set of sections** (Core Info, Tone & Themes, World & Magic, Characters, Arcs & Constraints) and store extra fields as flexible JSON; progressively enhance the UI later.
- **Continuity and artifact design**:
  - True continuity (no contradictions across dozens of chapters) is very hard.
  - **Risk**: Overpromising a “lore engine” before you have robust artifact design and retrieval may disappoint.
  - **Recommendation**: For MVP, target **"good-enough continuity" using summaries** (chapter memory, continuity summary, character state) and clear UX copy that this is an assistive tool, not a guarantee of perfect canon.
- **Inspiration & copyright risk**:
  - Scraping sites like novelbin is legally and technically risky (ToS, DMCA, rate limits, brittle HTML).
  - Direct style cloning of living authors or specific copyrighted works is problematic.
  - **Recommendation**: MVP should:
    - Prefer **user-pasted text** and maybe public-domain sources.
    - Use **short samples with aggressive summarization and feature extraction**, discard raw text.
    - Clearly communicate that FableForge **abstracts high-level style traits** (pacing, sentence length, trope density) and **never reproduces passages**.
- **Token and cost control**:
  - Long serials can generate very large context and artifact stores.
  - **Recommendation**: Hard caps on **chapter length**, **inspiration sample size**, and **summary lengths**; use **cheaper models for everything except the final prose pass.**
- **Editor UX complexity**:
  - A full-featured rich text editor with streaming + inline actions + selection semantics is nontrivial.
  - **Recommendation**: Pick a **battle-tested editor (TipTap)** and implement a **small, opinionated toolbar + slash menu + selection bubble** first; avoid heavy plugin work until basic flows are solid.
- **Multi-agent overkill**:
  - Too many agents make debugging and tuning difficult and can explode cost.
  - **Recommendation**: MVP has **3–4 core roles** (Planner, Writer, Continuity, Inspiration), orchestrated by a single **server-side coordinator**; add specialized editor agents later only if needed.
- **Observability and user trust**:
  - Users need to understand why a chapter turned out a certain way.
  - **Recommendation**: Persist **artifacts and generation runs** with visible panels: show **what plan, spec, style profile, and continuity summary** were used for each generation.

### 3. Recommended stack (opinionated)

- **Frontend + Backend framework**: **Next.js 14+ (App Router, TypeScript)**
  - Great DX, built-in API routes, React Server Components, good streaming support.
  - Strong ecosystem for rich editors and dashboards.
  - Works well with Vercel hosting and edge/Node runtimes.
- **Language**: **TypeScript** end-to-end
  - Strong typing for complex artifacts (plans, profiles, summaries).
- **UI layer**:
  - **React (Next.js)** with:
    - A component library or utility-first CSS (e.g. **Tailwind CSS**) for fast iteration.
    - A small design system: layouts, buttons, cards, tabs, dialog, etc.
- **Editor**:
  - **TipTap** (ProseMirror-based) inside the Next.js app.
  - Pros: very flexible, good for custom slash menus, bubble menus for inline actions, safe HTML, collaboration-ready later.
- **Auth + Database + File storage**: **Supabase**
  - Auth (email/password, OAuth later), Postgres DB, and storage in one.
  - Fits personal project, low cost, generous free tier.
  - Excellent TypeScript tooling and works well with Drizzle.
- **ORM / schema**: **Drizzle ORM** targeting Supabase Postgres
  - Type-safe schema, migration tooling, good DX with TS.
- **Background jobs**:
  - **Inngest** or Supabase Edge Functions for async workflows.
  - Recommendation: Use **Inngest** for clarity and good local DX; run inspiration and continuity jobs there.
- **Deployment**:
  - **Vercel** for the Next.js app (MVP is personal, low cost).
  - Supabase hosted Postgres.
- **LLM provider (MVP)**:
  - **OpenAI** with **GPT-4o** (writer) and **GPT-4o-mini** (planner, inspiration, continuity).
  - Reasoning: strong long-form quality, good pricing, wide support in tooling.
  - Abstract behind a **thin internal SDK module** so switching providers later is possible but not prematurely over-abstracted.

### 4. Database choice & rationale

- **Primary DB: Supabase Postgres via Drizzle**
  - **Low cost**: Free tier for this scale, generous limits.
  - **Speed and reliability**: Mature relational DB with strong indexing and query capabilities.
  - **Structured + unstructured mix**: Use relational tables for core entities and **JSONB** columns for flexible structured artifacts (story spec, style profiles, summaries).
  - **Scalability**: Good enough for personal use and beyond; if needed, can migrate/scale Postgres later.
  - **Ecosystem**: Integrates nicely with Next.js, Node, and TS tooling.

Alternative options (MongoDB, Firestore, etc.) are less natural for **relational entities + rich JSON artifacts** in this context, and would not improve cost or DX meaningfully over Postgres for your use case.

### 5. Proposed schema (MVP entities)

File: `[db/schema.ts](db/schema.ts)`

- **users** (from Supabase; optional profiles table)
- **books**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → users)
  - `title` (text)
  - `slug` (text, unique per user)
  - `status` (enum: `draft`, `ongoing`, `paused`, `completed`)
  - `created_at`, `updated_at`
- **book_specs** (1:1 per book, but can be versioned later)
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books, unique)
  - `core` (JSONB: genre, subgenre, pitch, POV, narration style, target audience)
  - `tone_and_themes` (JSONB: tone adjectives, themes, forbidden elements, preferred elements)
  - `world_and_rules` (JSONB: setting, world rules, magic/power system, technology level)
  - `characters_summary` (JSONB: high-level protagonist and key relationships overview)
  - `plot_arcs` (JSONB: long-term arcs, major beats, planned twists)
  - `pacing_preferences` (JSONB: chapter length, action vs introspection balance)
  - `raw_json` (JSONB: full original specification structure for flexibility)
  - `created_at`, `updated_at`
- **characters**
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books)
  - `name` (text)
  - `role` (text: protagonist, deuteragonist, antagonist, side)
  - `tags` (text[]: "mentor", "trickster", etc.)
  - `profile` (JSONB: backstory, personality, motivations, fears, desires)
  - `relationships` (JSONB: references to other characters + relationship descriptors)
  - `created_at`, `updated_at`
- **inspiration_sources**
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books)
  - `type` (enum: `paste`, `url`, `public_domain_reference`, `custom_notes`)
  - `label` (text)
  - `source_metadata` (JSONB: URL, author, work title, notes, safe/legal flags)
  - `status` (enum: `pending`, `processing`, `ready`, `failed`)
  - `error_message` (text, nullable)
  - `created_at`, `updated_at`
- **style_profiles**
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books)
  - `inspiration_source_id` (uuid, FK → inspiration_sources, nullable)
  - `name` (text)
  - `summary` (text: human-readable description of style)
  - `features` (JSONB: structured metrics such as pacing, dialogue ratio, description intensity, trope density)
  - `llm_config` (JSONB: suggested temperature, penalties, phrase preferences, etc.)
  - `created_at`, `updated_at`
- **chapters**
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books)
  - `index` (int: order in book)
  - `title` (text)
  - `status` (enum: `idea`, `outline`, `draft`, `revised`, `final`)
  - `arc_label` (text)
  - `pov_character_id` (uuid, FK → characters, nullable)
  - `timeline_marker` (text: e.g. "Day 3", "Year 1042")
  - `emotional_intensity` (int: 1–10)
  - `cliffhanger_score` (int: 1–10)
  - `metadata` (JSONB: arbitrary tags, e.g. themes present)
  - `created_at`, `updated_at`
- **chapter_versions**
  - `id` (uuid, PK)
  - `chapter_id` (uuid, FK → chapters)
  - `version_index` (int, incrementing)
  - `source` (enum: `human`, `ai_full`, `ai_edit`)
  - `title_snapshot` (text)
  - `content` (text or `text` + optional structured representation; stored as HTML/markdown or TipTap JSON)
  - `notes` (text: what changed, why)
  - `created_at`
- **generation_runs**
  - `id` (uuid, PK)
  - `chapter_id` (uuid, FK → chapters, nullable for non-chapter ops like inspiration)
  - `type` (enum: `chapter_generate`, `inline_edit`, `inspiration_analysis`, `continuity_update`)
  - `model` (text)
  - `input_tokens`, `output_tokens` (int)
  - `estimated_cost_usd` (numeric)
  - `request_payload` (JSONB: **sanitized** inputs: spec IDs, artifact IDs, not full user content where avoidable)
  - `response_metadata` (JSONB)
  - `status` (enum: `started`, `succeeded`, `failed`)
  - `created_at`
- **artifacts** (general-purpose store for summaries & intermediate structures)
  - `id` (uuid, PK)
  - `book_id` (uuid, FK → books)
  - `chapter_id` (uuid, FK → chapters, nullable for global book-level artifacts)
  - `type` (enum: `chapter_plan`, `chapter_memory`, `continuity_summary`, `character_state`, `world_state`, `revision_notes`)
  - `label` (text)
  - `data` (JSONB)
  - `created_at`

This schema keeps core relations normalized while allowing flexibility via JSONB artifacts, and directly supports future features (lore consistency, character memory, etc.).

### 6. Low-cost agentic workflow (MVP)

#### 6.1 Roles and responsibilities

- **Orchestrator (server-side coordinator)**
  - Lives as TypeScript modules under `[app/(api)/generate]` and shared services.
  - Handles **workflow sequencing**, artifact loading/saving, and model selection.
- **Chapter Planner (GPT-4o-mini)**
  - Input: book_spec (condensed), style_profile features, prior chapter_memory and continuity_summary, chapter metadata and outline.
  - Output artifact: `chapter_plan` (JSON) with:
    - beats list
    - emotional curve
    - POV info
    - scene-level checklist
    - must-include constraints; must-avoid items.
- **Chapter Writer (GPT-4o)**
  - Input: `chapter_plan`, story bible summary, style_profile, continuity_summary, character_state, and short history of previous chapter_summaries.
  - Output: streamed chapter text.
- **Continuity Agent (GPT-4o-mini, async)**
  - Triggered after chapter is saved as a new version.
  - Input: last continuity_summary, character_state, and the new chapter summary (generated with GPT-4o-mini), plus key book_spec fields.
  - Output artifacts: updated `continuity_summary`, `character_state`, `chapter_memory` for this chapter.
- **Inspiration Analysis Agent (GPT-4o-mini, async)**
  - Input: user-supplied text snippet (paste) or short excerpt of a public-domain or user-approved text.
  - Output: `style_profile` with:
    - summary prose description.
    - structured features (pacing, sentence length distribution, dialogue ratio, trope clusters, emotional cadence, hook styles).
- **Inline Editor Agent (GPT-4o)**
  - Simple, single-call agent for selection-based rewrite / transform.
  - Input: selection text, surrounding context (few paragraphs), action type, style_profile summary, key tone/constraints.
  - Output: rewrittten selection.

#### 6.2 Workflows

- **Chapter generation (synchronous, 2-step pipeline)**
  - API endpoint `POST /api/chapters/[id]/generate`:
    1. Orchestrator loads: book, key spec shards, relevant style_profile, latest continuity_summary, character_state, chapter metadata and outline, previous chapter_memory.
    2. Call **Planner (GPT-4o-mini)** → `chapter_plan` artifact stored.
    3. Call **Writer (GPT-4o)** with plan + context → stream tokens back to client via Server-Sent Events (SSE) or Next.js streaming.
    4. On completion: save new `chapter_versions` row and `generation_runs` entry.
    5. Optionally trigger **continuity job** asynchronously.
- **Streaming behavior**
  - Use an **edge-friendly streaming endpoint** that:
    - Reads OpenAI streaming chunks.
    - Immediately forwards them to the browser via SSE or `ReadableStream`.
    - Updates client editor content incrementally (TipTap doc updated as chunks come in).
  - Client shows: “Generating…” with the ability to **stop** (abort controller) and then keep partial text.
- **Inline AI edit (single-step, synchronous)**
  - API endpoint `POST /api/chapters/[id]/inline-edit`:
    - Body: `selection`, `action`, `chapter_id`, `position`, `options`.
    - Server loads minimal context (style_profile summary, tone constraints, short preceding/following text slice).
    - Single **GPT-4o** call with task-specific prompt template.
    - Returns rewritten text; client replaces selected content in TipTap document.
- **Inspiration analysis (async)**
  - API endpoint `POST /api/books/[id]/inspiration`
    - Accepts `type` and input (paste text limited to e.g. 10–20k chars; for URL/public-domain references, MVP can require user to paste excerpts rather than scraping).
    - Creates `inspiration_sources` row with status `pending` and fires Inngest job.
  - Inngest job:
    - Validates legal/safety flags (e.g. user confirms rights to the text or that it is public domain).
    - Clips or samples text to safe length.
    - Calls GPT-4o-mini to extract **style_profile** features.
    - Stores `style_profiles` row and marks source `ready`.
  - UI: a small **Inspiration panel** in the book dashboard that shows status and lets the user attach/detach profiles from the writer.
- **Continuity update (async)**
  - Trigger: chapter version marked as `draft` or `final`.
  - Inngest job:
    - Uses GPT-4o-mini to summarize chapter to `chapter_memory`.
    - Updates `continuity_summary` and `character_state` artifacts.
    - Links artifacts to the chapter and book.

#### 6.3 Cost control strategies

- Use **GPT-4o-mini** for:
  - Planner, Continuity, Inspiration, chapter summaries, metadata tagging.
- Use **GPT-4o** only for:
  - Full chapter writing and nuanced inline edits.
- Truncate and shard context:
  - Use **short, stable summaries** (continuity, character_state, style_profile), not raw entire chapters.
  - Keep **cap lengths**: max chapter size, max inspiration sample, max summary lengths.
- Avoid agent loops:
  - Single Planner–Writer pass with **clear endpoints**.
  - Optional **user-triggered re-plan or re-write** instead of automatic multi-pass loops.

### 7. Frontend architecture (MVP)

File roots: `[app/]`, `[components/]`

- **App structure (Next.js App Router)**
  - `app/(auth)/sign-in`, `app/(auth)/sign-up`
  - `app/(dashboard)/books` (list & create)
  - `app/(dashboard)/books/[bookId]` (tabs: Overview, Story Bible, Characters, Chapters, Inspiration)
  - `app/(editor)/books/[bookId]/chapters/[chapterId]` (full-screen editor)
- **Core UI components**
  - `components/layout/DashboardLayout.tsx`
  - `components/books/BookList.tsx`, `BookForm.tsx`
  - `components/books/StoryBibleEditor.tsx` (structured form + freeform JSON-backed sections)
  - `components/characters/CharacterList.tsx`, `CharacterForm.tsx`
  - `components/chapters/ChapterList.tsx` (with drag-and-drop for reordering)
  - `components/editor/ChapterEditor.tsx` (TipTap wrapper)
  - `components/editor/InlineActionsBubble.tsx` (selection actions)
  - `components/inspiration/InspirationPanel.tsx`
  - `components/ai/GenerationStatusBar.tsx`, `ArtifactsSidebar.tsx` (to show plan and continuity summaries used for current chapter).
- **Editor behavior**
  - `ChapterEditor` owns TipTap instance and exposes:
    - `onContentChange` → debounced save to backend.
    - `onGenerateClick` → calls generate endpoint and streams updates into TipTap.
    - `onInlineAction(action, selection)` → calls inline API.
  - Focus on **simple formatting**: bold, italics, headings, maybe scene separators; avoid complex embeds initially.

### 8. Backend architecture (MVP)

File roots: `[app/api/]`, `[lib/]`

- **API route examples**
  - `app/api/books/route.ts` → list/create.
  - `app/api/books/[bookId]/route.ts` → get/update/delete.
  - `app/api/books/[bookId]/spec/route.ts` → get/upsert story bible.
  - `app/api/books/[bookId]/characters/route.ts` → list/create.
  - `app/api/characters/[characterId]/route.ts` → update/delete.
  - `app/api/books/[bookId]/chapters/route.ts` → list/create/reorder.
  - `app/api/chapters/[chapterId]/route.ts` → get/update (metadata).
  - `app/api/chapters/[chapterId]/content/route.ts` → load/save current content (maps to latest `chapter_versions`).
  - `app/api/chapters/[chapterId]/generate/route.ts` → streaming generation.
  - `app/api/chapters/[chapterId]/inline-edit/route.ts` → inline actions.
  - `app/api/books/[bookId]/inspiration/route.ts` → create inspiration_source.
  - `app/api/style-profiles/[styleProfileId]/route.ts` → CRUD style profiles.
- **Service modules (in `[lib/]`)**
  - `lib/db.ts` → Drizzle + Supabase client wiring.
  - `lib/models/books.ts`, `chapters.ts`, `characters.ts`, etc.
  - `lib/llm/client.ts` → internal wrapper for OpenAI.
  - `lib/llm/prompts/` → templates for planner, writer, inspiration, continuity, inline edits.
  - `lib/orchestrator/generateChapter.ts` → orchestrator for planner + writer.
  - `lib/orchestrator/inlineEdit.ts` → single-call orchestrator.
  - `lib/orchestrator/inspiration.ts`, `continuity.ts` → called from Inngest handlers.
  - `lib/cost-tracking.ts` → estimate cost from token counts and store in `generation_runs`.
- **Background jobs**
  - `inngest/inspirationAnalysis.ts`
  - `inngest/continuityUpdate.ts`

### 9. Streaming implementation (high level)

- **Server side**:
  - Use OpenAI **streaming completion API**.
  - Wrap in a Next.js App Router handler returning a `ReadableStream` that:
    - Creates an abortable OpenAI stream.
    - Pipes tokens → JSON-encoded SSE-like events (`event: token`, `data: ...`).
  - Include structured events like: `plan_ready` (send chapter_plan preview), `done`, and `error`.
- **Client side**:
  - Use `EventSource` or `fetch` with streams.
  - As `token` events arrive, **append to TipTap** (using a dedicated transaction to avoid flicker).
  - On `done`, finalize version and allow user to keep editing offline from the model.

### 10. MVP vs future roadmap

- **MVP (Phase 1–2)**
  - Auth with Supabase.
  - Books CRUD + simple dashboard.
  - Story bible editor (structured + freeform JSON-backed fields).
  - Character management.
  - Chapters list + drag-and-drop reorder; chapter metadata.
  - Chapter editor (TipTap) with:
    - manual editing,
    - save versions,
    - streaming chapter generate (Planner + Writer),
    - basic artifacts sidebar (chapter plan, active style profile summary).
  - Inline AI edits:
    - core actions: rewrite, expand, condense, more emotional, more vivid.
  - Inspiration system (MVP):
    - user-pasted text only;
    - async analysis to style_profile; attach to book.
  - Basic continuity pipeline (async):
    - after save, summarize chapter & update continuity_summary and character_state.
  - Cost tracking via `generation_runs`.
- **Near-future enhancements**
  - More nuanced inline actions (tension, pacing, magical/whimsical/dark tone shifts).
  - Better editor affordances (scene outline sidebar, mini-map).
  - Simple **"continuity warnings"** (e.g. flagging obvious contradictions based on summaries).
  - Support multiple style_profiles per book and quick switching.
  - Improved observability: run history timeline per chapter with diffing between versions.
- **Later roadmap**
  - Lore consistency engine (cross-artifact checks for contradictions).
  - Character memory overlays in the editor.
  - Idea boards & plotting tools (index cards, timeline views).
  - Collaborative writing sessions (TipTap collaboration or Y.js).
  - Usage-based billing / subscriptions.
  - Multi-provider LLM abstraction, per-book model settings.
  - Optional image generation for scenes/characters (careful about scope and cost).

### 11. Key legal, technical, and product risk mitigation

- **Legal**
  - Do **not** scrape sites without explicit permission; MVP uses **user-pasted excerpts** and clearly labeled **public-domain** sources.
  - Prompts emphasize **abstraction, not imitation**; no reproducing long verbatim passages.
  - UI copy states that user is responsible for having rights to uploaded text.
- **Technical**
  - Limit input sizes and store **summaries instead of raw external text** where feasible.
  - Implement clear timeouts and robust error handling in streaming endpoints and jobs.
- **Product**
  - Messaging: This is a **co-writer** and **assistant**, not a replacement author.
  - Expose **artifacts and run logs** so users can see how outputs were produced.

### 12. Development planning hooks

This architecture maps directly into later concrete planning:

- Folder structure: `app/`, `lib/`, `db/`, `inngest/`, `components/` as outlined.
- API routes: defined in section 8.
- DB models: Drizzle schemas matching section 5.
- Components: described in section 7.
- Streaming: SSE/ReadableStream implementation in `app/api/chapters/[chapterId]/generate/route.ts`.
- Background jobs: Inngest handlers for continuity and inspiration.
- Cost tracking: `generation_runs` and `lib/cost-tracking.ts`.
- Agent workflow: orchestrator modules in `lib/orchestrator/`* with clear single responsibilities.

