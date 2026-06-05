# User Stories — AI-Assisted Interview Screening

> Essential MVP backlog with acceptance criteria to guide design, build, and test.

---

## 1. Flexible Interview Setup

### US-01: Create Role-Based Interview
**As a** Hiring Manager,
**I want to** configure an interview by specifying the job role, required skills, and seniority level,
**So that** the AI generates questions tailored to the position.

**Acceptance Criteria:**
- **Given** a hiring manager on the Interview Setup page
- **When** they select role (e.g., "Backend Engineer"), skills (e.g., "Java, Spring Boot, Microservices"), and level (e.g., "Senior")
- **Then** the system generates 10-15 role-specific interview questions categorized by competency (Technical, Behavioral, Problem-Solving)
- **And** questions are weighted by seniority level (senior = deeper, junior = foundational)

### US-02: Resume-Aware Interview Preparation
**As a** Hiring Manager,
**I want to** upload a candidate's resume and job description,
**So that** the AI tailors questions to the candidate's specific experience and role gaps.

**Acceptance Criteria:**
- **Given** a hiring manager uploads a resume (PDF/text) and pastes a JD
- **When** the system processes both documents
- **Then** the AI identifies 3-5 experience highlights to probe and 2-3 potential gaps between resume and JD
- **And** generates personalized questions targeting these areas
- **And** the token cost for parsing is tracked and displayed

### US-03: Customize Question Bank
**As a** Hiring Manager,
**I want to** review, edit, add, or remove AI-generated questions before starting the interview,
**So that** I maintain control over the interview content.

**Acceptance Criteria:**
- **Given** the AI has generated a question bank
- **When** the hiring manager reviews the questions
- **Then** they can edit question text, reorder questions, remove questions, or add custom questions
- **And** the final question set is saved and linked to the interview session

---

## 2. Adaptive Questioning

### US-04: Dynamic Follow-Up Questions
**As an** Interviewer,
**I want** the AI to automatically generate follow-up questions based on the candidate's response depth,
**So that** strong candidates are challenged deeper and struggling candidates get clarifying prompts.

**Acceptance Criteria:**
- **Given** a candidate provides a response to an interview question
- **When** the AI evaluates the response depth (1-5 scale)
- **Then** if depth < 3: AI generates a simpler/clarifying follow-up
- **And** if depth = 3: AI moves to the next topic
- **And** if depth > 3: AI generates a deeper/advanced follow-up
- **And** the adaptation reason is logged in the audit trail

### US-05: Conversation-Style Interview Flow
**As a** Candidate,
**I want** the interview to feel like a natural conversation rather than a static questionnaire,
**So that** I can demonstrate my knowledge comfortably.

**Acceptance Criteria:**
- **Given** an active interview session
- **When** the candidate answers questions through the chat interface
- **Then** the AI responds conversationally (acknowledges answer, transitions naturally)
- **And** the interview progresses through 8-12 questions adaptively
- **And** a progress indicator shows approximate completion percentage

### US-06: Topic Coverage Tracking
**As an** Interviewer,
**I want** the AI to ensure all required competency areas are covered during the interview,
**So that** no critical skill area is missed regardless of adaptive detours.

**Acceptance Criteria:**
- **Given** an interview has required competency categories (e.g., Technical, System Design, Behavioral)
- **When** the AI adapts the question flow
- **Then** it tracks coverage percentage per category
- **And** ensures minimum 1 question per required category before concluding
- **And** displays a coverage summary at interview end

---

## 3. Automated Scoring & Feedback

### US-07: Structured Competency Scoring
**As an** Interviewer,
**I want** the AI to automatically score each response on a structured rubric,
**So that** scoring is consistent, repeatable, and comparable across candidates.

**Acceptance Criteria:**
- **Given** a completed interview with candidate responses
- **When** the scoring agent processes all Q&A pairs
- **Then** each response receives scores (0-10) across dimensions: Technical Depth, Communication Clarity, Problem-Solving Approach, Role Alignment
- **And** an overall confidence score (0-100) is calculated
- **And** an AI recommendation is generated: STRONG_HIRE / HIRE / MAYBE / NO_HIRE

### US-08: Interview Feedback Summary
**As a** Hiring Manager,
**I want** an AI-generated narrative summary of the interview,
**So that** I can quickly understand candidate strengths, gaps, and recommendation rationale.

**Acceptance Criteria:**
- **Given** a completed and scored interview
- **When** the feedback synthesizer processes the results
- **Then** a structured summary is generated with: Key Strengths (top 3), Areas of Concern (top 3), Notable Quotes from candidate, Overall Assessment narrative
- **And** the summary is saved and accessible from the review page

---

## 4. AI Usage & Cost Tracking

### US-09: Per-Interview Token Tracking
**As a** Platform Administrator,
**I want** to see exactly how many AI tokens were consumed per interview,
**So that** I can monitor and optimize GenAI costs.

**Acceptance Criteria:**
- **Given** any interview (in-progress or completed)
- **When** the admin views the cost details
- **Then** they see: total input tokens, total output tokens, cost in USD, breakdown by AI agent (Question Generator, Adaptive Engine, Scorer, Feedback)
- **And** the model name and pricing tier are displayed

### US-10: Cost Dashboard with Trends
**As a** Platform Administrator,
**I want** a dashboard showing cost trends across all interviews,
**So that** I can track spending and identify optimization opportunities.

**Acceptance Criteria:**
- **Given** multiple completed interviews exist
- **When** the admin opens the Cost Dashboard
- **Then** they see: total cost, average cost per interview, cost trend chart (line/bar), breakdown by AI agent type
- **And** data can be filtered by date range

---

## 5. Audit Trail & Usefulness Tracking

### US-11: Complete AI Decision Audit Log
**As a** Compliance Officer,
**I want** every AI prompt, output, and decision logged with timestamps,
**So that** I can trace any AI-generated result back to its source.

**Acceptance Criteria:**
- **Given** any AI operation occurs (question generation, scoring, follow-up)
- **When** the operation completes
- **Then** the audit log records: timestamp, agent name, prompt sent, response received, token count, latency, interview ID, decision made
- **And** the log is searchable and filterable

### US-12: Platform Usefulness Rating
**As a** Hiring Manager,
**I want** to rate the usefulness of AI-generated questions and scores after each interview,
**So that** the platform can track and improve its effectiveness.

**Acceptance Criteria:**
- **Given** a completed interview review
- **When** the hiring manager submits their review
- **Then** they can rate overall usefulness (1-5 stars), mark specific questions as "Useful" or "Not Useful", add optional text feedback
- **And** aggregate usefulness metrics appear on the dashboard

---

## 6. Human-in-the-Loop Review

### US-13: AI Confidence with Human Override
**As a** Hiring Manager,
**I want** to see AI confidence scores alongside my own assessment tools,
**So that** I can agree with, adjust, or override the AI's recommendation.

**Acceptance Criteria:**
- **Given** an AI-scored interview is ready for review
- **When** the reviewer opens the review page
- **Then** they see AI scores per competency with confidence indicators (High/Medium/Low)
- **And** they can: Approve (accept AI scores as-is), Adjust (modify individual scores with justification), Reject (override recommendation with reason)
- **And** the final decision (human or AI) is recorded with attribution

### US-14: Side-by-Side AI vs Human View
**As a** Hiring Manager,
**I want** to see the candidate's actual responses alongside AI analysis,
**So that** I can verify the AI's reasoning before making a decision.

**Acceptance Criteria:**
- **Given** the review page is open
- **When** the reviewer selects a question
- **Then** they see: the original question, candidate's full response, AI's score with rationale, response depth assessment
- **And** the reviewer can scroll through all Q&A pairs chronologically

### US-15: Final Decision Recording
**As a** Hiring Manager,
**I want** to record a final hire/no-hire decision with notes,
**So that** the decision is documented and auditable.

**Acceptance Criteria:**
- **Given** the reviewer has reviewed all scores and responses
- **When** they submit a final decision
- **Then** they select: ADVANCE / HOLD / REJECT
- **And** add required notes explaining the decision
- **And** the decision is timestamped, attributed, and added to the audit trail

---

## Priority Matrix

| Priority | Stories | Rationale |
|----------|---------|-----------|
| **P0 — Must Have** | US-01, US-04, US-07, US-09, US-11, US-13 | Core MVP — one story per must-have feature |
| **P0 — Must Have** | US-02, US-05, US-08, US-14, US-15 | Essential completeness for demo flow |
| **P1 — Should Have** | US-03, US-06, US-10, US-12 | Polish and operational maturity |
| **P2 — Nice to Have** | Anti-cheating, Dashboard history, NFRs | Stretch goals |
