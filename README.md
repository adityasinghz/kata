# AI-Assisted Interview Screening — Kata 5

## Overview
This project modernizes a legacy interview platform with **AI-assisted screening** that reduces interviewer effort, improves role alignment, and delivers structured, auditable feedback — while keeping **human review in the loop**.

The system uses an **AI Agent Orchestrator** pattern with 5 specialized agents (Question Generator, Adaptive Follow-up, Response Evaluator, Feedback Synthesizer, Integrity Monitor) to automate the interview lifecycle from setup to scoring to review.

---

## Documentation Index

### 1. Requirements & Business Analysis
- **[USER_STORIES.md](./USER_STORIES.md)**: 15 User Stories with acceptance criteria covering all 6 must-have features, prioritized P0/P1/P2.

### 2. Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Target architecture diagram with Application Layer, AI/LLM Layer, Data Layer, and integration points. Technology stack decisions with rationale.
- **[SOLUTION_DESIGN.md](./SOLUTION_DESIGN.md)**: Key components, flows, assumptions, and 6 Architectural Decision Records (ADRs).

### 3. AI / GenAI Strategy
- **[PROMPTING_STRATEGY.md](./PROMPTING_STRATEGY.md)**: 5 AI agents with full prompt specifications — intent, technique (Few-Shot, CoT, Rubric-Grounded), context window, expected output, and token budget.

### 4. Technical Diagrams (UML)
- **[SEQUENCE_DIAGRAMS.md](./SEQUENCE_DIAGRAMS.md)**: 4 Sequence Diagrams — Interview Setup, Adaptive Session, Scoring & Feedback, Human Review.
- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)**: 5 Class Diagrams — Core Domain, Scoring/Review, AI Agents, Audit/Cost, Data Store.
- **[ER_DIAGRAM.md](./ER_DIAGRAM.md)**: Full ERD with 9 tables, column specs, constraints, indexes, and data volume estimates.
- **[STATE_DIAGRAM.md](./STATE_DIAGRAM.md)**: 5 State Machines — Interview, Question, Review Decision, Adaptive Questioning, Cost Tracking.
- **[ACTIVITY_DIAGRAM.md](./ACTIVITY_DIAGRAM.md)**: 3 Activity Diagrams — Complete Interview Lifecycle, Question Generation Workflow, Cost Tracking Workflow.

### 5. API & Integration
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)**: RESTful API definitions for 6 service areas with JSON request/response examples and standard error format.

### 6. QA & Testing
- **[TEST_STRATEGY.md](./TEST_STRATEGY.md)**: 50+ test cases mapped to user stories, AI-output validation strategy, 12 edge cases, automation vs manual matrix, security tests.

### 7. Guiding Principles
- **[GUIDING_PRINCIPLES.md](./GUIDING_PRINCIPLES.md)**: SOLID, KISS, YAGNI applied with domain-specific examples, anti-patterns avoided, and decision framework.

### 8. Working Prototype
- **[interview-app/](./interview-app/)**: Next.js web application demonstrating all 6 must-have features with premium dark-mode UI.

---

## Key Architecture Highlights

- **AI Agent Orchestrator Pattern:** Central coordinator for 5 specialized AI agents, each with its own prompt template, token budget, and single responsibility.
- **Adaptive Questioning Engine:** Chain-of-Thought reasoning to dynamically adjust question depth and topic coverage based on candidate responses.
- **Human-in-the-Loop Design:** AI generates recommendations with confidence scores; reviewers can Approve, Adjust, or Reject with full audit trail.
- **Full Observability:** Every AI prompt, response, and decision is logged with timestamps, token counts, and costs for complete traceability.
- **Cost-Conscious GenAI:** ~$0.0022 per interview (Gemini 2.0 Flash pricing); real-time token tracking with budget alerts.
- **Modular Monolith for MVP:** Clean module boundaries (services, agents, stores) designed for easy extraction to microservices post-MVP.

---

## MVP Features (Must-Have)

| # | Feature | Status |
|---|---------|--------|
| 1 | Flexible Interview Setup (role, skills, JD, resume) | ✅ Implemented |
| 2 | Adaptive Questioning (dynamic follow-ups based on depth) | ✅ Implemented |
| 3 | Automated Scoring & Feedback (structured rubric + narrative) | ✅ Implemented |
| 4 | AI Usage & Cost Tracking (tokens, costs per interview) | ✅ Implemented |
| 5 | Audit Trail & Usefulness Tracking (full AI decision log) | ✅ Implemented |
| 6 | Human-in-the-Loop Review (confidence scores + override) | ✅ Implemented |

## Stretch Features (Good-to-Have)

| # | Feature | Status |
|---|---------|--------|
| 1 | Anti-cheating / Integrity Flagging | 📋 Documented |
| 2 | Dashboard for interview history and scores | ✅ Implemented |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Styling | Vanilla CSS (Glassmorphism Dark Mode) |
| AI/LLM | Mocked AI Engine (Gemini-compatible) |
| Data | In-Memory Store (mirrors PostgreSQL schema) |
| State | React Context + useReducer |

---

## Running the Prototype

```bash
cd interview-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Status
- **Version:** 1.0
- **Status:** MVP Complete
- **Last Updated:** June 2026
