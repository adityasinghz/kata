# Solution Design — AI-Assisted Interview Screening

## 1. Overview

This document describes the key components, flows, assumptions, and major design decisions for the AI-Assisted Interview Screening MVP. The solution modernizes a legacy interview platform by embedding AI agents at every stage of the interview lifecycle — from question generation to scoring to feedback synthesis.

---

## 2. Key Components

### 2.1 Interview Setup Service
**Responsibility:** Receives interview configuration (role, skills, level, JD, resume), validates inputs, invokes the Question Generator Agent, and persists the interview session with its generated question bank.

**Key Logic:**
- Parses resume text to extract skills, experience highlights, and education
- Combines JD requirements with resume data to identify focus areas
- Categorizes generated questions into competency buckets: Technical, Behavioral, Problem-Solving, System Design
- Allows manual question editing before interview starts

### 2.2 Interview Management Service
**Responsibility:** Manages the live interview session — presenting questions, capturing responses, invoking adaptive follow-up logic, and tracking progress.

**Key Logic:**
- Maintains interview state machine: `DRAFT → READY → IN_PROGRESS → COMPLETED → REVIEWED`
- For each candidate response:
  1. Invokes Response Evaluator → gets depth score (1-5) and dimension scores
  2. Checks topic coverage across required competencies
  3. Invokes Adaptive Follow-up Agent → gets next question
- Auto-concludes interview after 8-12 adaptive rounds or when all topics are adequately covered

### 2.3 Review & Scoring Service
**Responsibility:** Aggregates all individual response scores into a summary, generates the AI recommendation, invokes the Feedback Synthesizer, and presents the human review interface.

**Key Logic:**
- Calculates weighted average across all dimension scores
- Maps overall score to recommendation: `≥80 STRONG_HIRE, ≥60 HIRE, ≥40 MAYBE, <40 NO_HIRE`
- Generates confidence level based on score variance and coverage completeness
- Supports three human override actions: APPROVE, ADJUST (with per-dimension edits), REJECT

### 2.4 Audit Service
**Responsibility:** Captures every AI interaction as an immutable log entry — prompt, response, tokens, latency, decision.

**Key Logic:**
- Every AI agent call is wrapped by the orchestrator's logging middleware
- Entries are append-only (no updates or deletes)
- Supports filtering by interview ID, agent name, date range
- Calculates aggregate metrics: total calls, avg latency, total tokens

### 2.5 Cost Tracking Service
**Responsibility:** Tracks token consumption and calculates costs per interview using configurable pricing models.

**Key Logic:**
- Pricing configuration: `{ "gemini-2.0-flash": { "input": 0.075, "output": 0.30 } }` per 1M tokens
- Accumulates tokens per AI call, grouped by agent
- Provides per-interview and aggregate cost views
- Generates cost trend data for dashboard visualization

### 2.6 AI Agent Orchestrator
**Responsibility:** Central coordinator for all AI agent invocations. Builds prompts from templates, manages context windows, routes to appropriate agents, and publishes events for audit/cost tracking.

**Key Logic:**
- Maintains a prompt template registry (one per agent)
- Assembles context: `system prompt + interview config + conversation history + rubric`
- Enforces token budget limits per call
- Provides mock mode (default for prototype) with realistic simulated responses

---

## 3. Key Flows

### 3.1 Interview Creation Flow
```
Hiring Manager → Setup Form (role, skills, level, JD, resume)
    → Validate inputs
    → Extract resume highlights (AI or rule-based)
    → Build prompt context (role + skills + JD + resume summary)
    → Invoke Question Generator Agent
    → Receive 10-15 categorized questions
    → Save interview (DRAFT status) with question bank
    → Display for review/edit
    → Manager confirms → status = READY
```

### 3.2 Live Interview Flow
```
Interview READY → Candidate joins → status = IN_PROGRESS
    → Present first question
    → Loop:
        Candidate types response
        → Invoke Response Evaluator (score depth + dimensions)
        → Check coverage map (Technical ✓/✗, Behavioral ✓/✗, ...)
        → Invoke Adaptive Agent (decide: follow-up / new topic / conclude)
        → Present next question (with conversational transition)
        → Update progress (X/12 questions, Y% coverage)
    → After 8-12 rounds or full coverage:
        → Auto-conclude → status = COMPLETED
        → Invoke Feedback Synthesizer
        → Generate summary + recommendation
```

### 3.3 Human Review Flow
```
Interview COMPLETED → Reviewer opens review page
    → View: Q&A pairs with AI scores side-by-side
    → View: AI recommendation + confidence + summary
    → Reviewer action:
        APPROVE → accept all scores as-is
        ADJUST → modify specific dimension scores (with justification text)
        REJECT → override recommendation (with required reason)
    → Record decision → status = REVIEWED
    → All actions logged to audit trail
```

---

## 4. Assumptions

| # | Assumption | Impact |
|---|-----------|--------|
| 1 | **LLM API is mocked** for prototype demo — no real API key needed | All AI responses are simulated with realistic content and latency |
| 2 | **Single user** at a time — no concurrent interview sessions | Simplifies state management; no race conditions |
| 3 | **Text-only interviews** — no audio/video processing in MVP | Future: add speech-to-text, sentiment analysis from video |
| 4 | **Resume is plain text** — no PDF parsing in prototype | User pastes resume text; PDF parsing is a production feature |
| 5 | **In-memory data store** for prototype — no persistent database | Data resets on server restart; mirrors SQLite/PostgreSQL schema |
| 6 | **English-only** interview content | i18n is a post-MVP concern |
| 7 | **Scoring rubric is fixed** — same 4 dimensions for all roles | Production: configurable rubrics per role/department |
| 8 | **Token pricing is static** — based on Gemini 2.0 Flash pricing | Production: dynamic pricing from API provider |

---

## 5. Major Design Decisions

### ADR-01: Modular Monolith over Microservices
**Decision:** Build as a single Next.js application with clear internal module boundaries.
**Context:** MVP needs to demonstrate all features end-to-end in a single deployable unit. Microservices add infrastructure complexity (containers, service mesh, API gateway) without MVP benefit.
**Consequence:** Clear module boundaries (services, agents, stores) make future extraction to microservices straightforward.

### ADR-02: AI Agent Orchestrator Pattern
**Decision:** All AI calls go through a central Orchestrator rather than services calling LLM directly.
**Context:** Every AI call needs audit logging, cost tracking, and token counting. Without centralization, each service would duplicate this cross-cutting logic.
**Consequence:** Single point of control for prompt templates, token budgets, and mock/real LLM switching. Trade-off: orchestrator is a single point of failure (acceptable for MVP).

### ADR-03: Mock AI with Realistic Simulation
**Decision:** Implement a full mock AI engine that returns contextually relevant responses with simulated latency and token counts.
**Context:** API key availability is uncertain; prototype must work offline. Judges need to see realistic AI behavior without real costs.
**Consequence:** Mock engine needs significant investment to produce believable responses. Upside: demo works anywhere without API keys.

### ADR-04: Adaptive Depth Scoring (1-5 Scale)
**Decision:** Use a 5-point depth scale to drive adaptive questioning rather than a binary good/bad classification.
**Context:** Simple binary classification doesn't support nuanced adaptation. A candidate might give a partially correct answer that deserves a clarifying follow-up rather than an advanced question.
**Scale:** 1 (No understanding) → 2 (Surface) → 3 (Adequate) → 4 (Deep) → 5 (Expert).

### ADR-05: Observer-Based Cross-Cutting Concerns
**Decision:** Use event emission (Observer pattern) for audit logging and cost tracking rather than explicit function calls in each agent.
**Context:** Adding `auditLog(...)` and `trackCost(...)` to every agent creates tight coupling and risks inconsistency if an agent forgets to call them.
**Consequence:** Orchestrator emits events; AuditLogger and CostTracker subscribe. New observers (e.g., real-time dashboard update) can be added without touching any agent code.

### ADR-06: Conversational UI over Form-Based Interview
**Decision:** Build the interview interface as a chat/conversational UI rather than a static form.
**Context:** Modern AI interview platforms (HireVue, Humanly) use conversational flows to reduce candidate anxiety and improve completion rates. Static question-answer forms feel cold and outdated.
**Consequence:** More complex frontend implementation (chat bubbles, typing indicators, scroll management) but significantly better UX and alignment with current industry trends.

---

## 6. Non-Functional Requirements

| NFR | Target | MVP Approach |
|-----|--------|-------------|
| **Response Time** | < 2s for AI-generated follow-up | Mock latency: 300-800ms simulated |
| **Scalability** | Support 100 concurrent interviews | Single-user for MVP; architecture supports horizontal scaling |
| **Security** | RBAC, encrypted data, audit trail | Mock auth + full audit logging |
| **Privacy** | GDPR-ready, PII handling | In-memory only; no persistent PII storage in prototype |
| **Availability** | 99.9% uptime | Local dev server for prototype |
| **Observability** | Full AI decision traceability | Audit trail with prompt/response/token logging |
| **Cost Control** | Budget alerts when token spend exceeds threshold | Real-time token counter with cost display |
