# Guiding Principles — AI-Assisted Interview Screening

> Concrete application of SOLID, KISS, and YAGNI to the interview screening domain.

---

## 1. SOLID Principles

### S — Single Responsibility Principle

**Principle:** Each module/class should have one reason to change.

**Application in Our System:**

| Module | Single Responsibility | What It Does NOT Do |
|--------|----------------------|-------------------|
| `Question Generator Agent` | Generate questions from role/skills/JD | Does NOT score responses or track costs |
| `Response Evaluator Agent` | Score a single response on rubric dimensions | Does NOT decide the next question or generate feedback |
| `Adaptive Follow-up Agent` | Decide next interview action based on depth + coverage | Does NOT evaluate responses or generate questions from scratch |
| `Cost Tracker` | Track tokens and calculate costs | Does NOT log audit entries or manage interview state |
| `Audit Logger` | Record AI operations as immutable log entries | Does NOT calculate costs or make interview decisions |
| `Interview Store` | Persist and retrieve interview data | Does NOT contain business logic for scoring or adaptation |

**Why This Matters Here:** When we need to change the scoring rubric, only the Response Evaluator changes. When pricing models update, only the Cost Tracker changes. No ripple effects.

**Anti-Pattern Avoided:** A monolithic `InterviewService` that generates questions, evaluates responses, tracks costs, and logs audits in one 500-line file.

---

### O — Open/Closed Principle

**Principle:** Open for extension, closed for modification.

**Application:**

```
// AI Agent Interface — open for new agents without modifying existing code
class AIAgent {
  execute(input) → output    // Interface
}

// Existing agents implement this interface
class QuestionGenerator extends AIAgent { ... }
class ResponseEvaluator extends AIAgent { ... }
class AdaptiveFollowup extends AIAgent { ... }

// NEW agent added without touching existing agents:
class IntegrityMonitor extends AIAgent { ... }

// Orchestrator works with any AIAgent — no switch/case needed
orchestrator.registerAgent('integrity', new IntegrityMonitor())
```

**Concrete Example:** Adding the Integrity Monitor (stretch goal) required:
1. ✅ Creating a new `IntegrityMonitor` class
2. ✅ Registering it with the Orchestrator
3. ❌ No changes to QuestionGenerator, ResponseEvaluator, or any existing agent

---

### L — Liskov Substitution Principle

**Principle:** Subtypes must be substitutable for their base types.

**Application:**

```
// Mock AI Engine and Real AI Engine are interchangeable
class AIEngine {
  async call(prompt) → response
}

class MockAIEngine extends AIEngine {
  async call(prompt) {
    return simulatedResponse(prompt)  // Returns realistic mock data
  }
}

class GeminiAIEngine extends AIEngine {
  async call(prompt) {
    return await geminiAPI.generate(prompt)  // Calls real LLM
  }
}

// Orchestrator doesn't know which engine it's using
const engine = process.env.USE_MOCK ? new MockAIEngine() : new GeminiAIEngine()
orchestrator.setEngine(engine)  // Works with either
```

**Why This Matters:** The prototype uses `MockAIEngine`. When a real API key is available, switching to `GeminiAIEngine` requires changing ONE config variable, not refactoring the application.

---

### I — Interface Segregation Principle

**Principle:** Clients should not depend on interfaces they don't use.

**Application:**

```
// BAD: One fat interface
InterviewService {
  createInterview()
  generateQuestions()
  evaluateResponse()
  synthesizeFeedback()
  trackCosts()
  logAudit()
  reviewDecision()
}

// GOOD: Segregated interfaces
InterviewSetup     { createInterview(), generateQuestions() }
InterviewSession   { submitResponse(), getNextQuestion() }
ScoringService     { evaluateResponse(), synthesizeFeedback() }
CostService        { trackTokens(), getCostBreakdown() }
AuditService       { logEntry(), getAuditTrail() }
ReviewService      { submitDecision(), getReviewStatus() }
```

**Result:** The Dashboard page only imports `CostService` and `InterviewSetup` — it never loads scoring or audit logic.

---

### D — Dependency Inversion Principle

**Principle:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Application:**

```
// High-level: AI Orchestrator
// Low-level: In-Memory Store, SQLite Store, PostgreSQL Store

// Abstraction (interface)
DataStore {
  saveInterview(data)
  getInterview(id)
  getAllInterviews()
}

// Low-level implementations
InMemoryStore implements DataStore { ... }    // Prototype
SQLiteStore implements DataStore { ... }      // Demo
PostgresStore implements DataStore { ... }    // Production

// High-level depends on abstraction, not implementation
class Orchestrator {
  constructor(store: DataStore) { ... }  // Injected
}
```

---

## 2. KISS — Keep It Simple, Stupid

### Applied Simplifications

| Area | Complex Approach (Avoided) | Simple Approach (Chosen) | Rationale |
|------|---------------------------|-------------------------|-----------|
| **Data Storage** | PostgreSQL + Redis + S3 | In-memory JavaScript objects | Zero-config, perfect for prototype |
| **AI Integration** | LangChain + Vector DB + RAG pipeline | Direct prompt templates with mock engine | MVP doesn't need retrieval-augmented generation |
| **Auth** | OAuth 2.0 + JWT + Refresh tokens | Session-based mock login | Demonstrates RBAC concept without infra |
| **State Management** | Redux + middleware + selectors | React Context + useReducer | Sufficient for single-page interview state |
| **Deployment** | Docker + K8s + CI/CD | `npm run dev` local development | Judges evaluate the product, not the infrastructure |
| **Cost Calculation** | Real-time API pricing lookup | Static pricing config object | Prices rarely change; static is accurate enough |
| **Charting** | D3.js or Chart.js with 15 chart types | Simple CSS bar charts + SVG | MVP needs 2-3 chart types, not a chart library |

### KISS in Prompt Design

```
// COMPLEX (Avoided):
"Using advanced reasoning capabilities, synthesize a multi-dimensional
analysis incorporating Bloom's taxonomy levels, Webb's depth of knowledge
framework, and standardized competency mapping matrices to evaluate..."

// SIMPLE (Chosen):
"Score the candidate's response on a scale of 0-10 for each dimension.
Think step-by-step. Be calibrated: average responses score 4-6."
```

---

## 3. YAGNI — You Aren't Gonna Need It

### Features Explicitly Deferred

| Feature | Why It's Tempting | Why We Don't Need It (MVP) |
|---------|------------------|--------------------------|
| **Video Interview** | Modern platforms support video | Text-based demonstrates AI logic equally well |
| **Multi-Language** | Global applicability | English-only covers the demo use case |
| **ATS Integration** | Real-world requirement | No ATS to integrate with during kata |
| **PDF Report Export** | Professional output | Screen display is sufficient for demo |
| **Email Notifications** | Real-world workflow | Not needed for single-user prototype |
| **Candidate Login** | Two-sided marketplace | Interviewer-only view sufficient for MVP |
| **Question Version History** | Audit completeness | Single version per interview is enough |
| **A/B Testing Prompts** | Prompt optimization | One prompt per agent is enough for demo |
| **Rate Limiting** | Production safety | Single user, no abuse scenario |
| **Caching Layer** | Performance optimization | In-memory store is already fast |

### YAGNI Decision Framework

```
Before adding any feature, ask:
1. Is it in the "Must Have" list?           → Yes: Build it
2. Does the jury explicitly evaluate it?    → Yes: Build it  
3. Does it make the demo more impressive?   → Maybe: Time-box to 30 min
4. Is it a "production-ready" concern?      → No: Document it, don't build it
```

---

## 4. Additional Design Principles

### DRY — Don't Repeat Yourself

**Application:** All AI agents share the same orchestration pipeline:
```
buildPrompt() → callEngine() → parseResponse() → logAudit() → trackCost()
```
This pipeline is implemented ONCE in the Orchestrator. Each agent only provides its unique prompt template and response parser.

### Separation of Concerns

**Application:** The interview UI component knows NOTHING about:
- How prompts are constructed
- What LLM model is being used
- How tokens are counted
- Where audit logs are stored

It only knows: "send response, receive next question and scores."

### Fail Fast

**Application:**
- Invalid interview config → reject at API boundary with clear error message
- Missing required fields → 400 before any AI call is made
- AI response doesn't match expected schema → fallback to default behavior, log error

### Convention Over Configuration

**Application:**
- Question categories are always: `TECHNICAL, BEHAVIORAL, PROBLEM_SOLVING, SYSTEM_DESIGN`
- Score dimensions are always: `technical_depth, communication, problem_solving, role_alignment`
- No configuration needed to use these — they're convention

---

## 5. Principle Violation Examples (What We Avoided)

| Principle | Violation Example | Our Correct Approach |
|-----------|------------------|---------------------|
| SRP | One function that generates questions, evaluates, scores, and logs | Separate agents with single responsibilities |
| OCP | `if (agentType === 'generator') ... else if (agentType === 'scorer') ...` | Agent interface with polymorphic dispatch |
| KISS | Using LangChain + Pinecone for a 10-question interview | Direct prompt templates with mock engine |
| YAGNI | Building video analysis when text-only is sufficient | Text-based MVP with video documented as future |
| DRY | Copy-pasting audit logging code into each agent | Centralized observer in the orchestrator |
