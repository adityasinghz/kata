# Test Strategy — AI-Assisted Interview Screening

> Comprehensive testing approach covering functional validation, AI-output validation, edge cases, and automation strategy.

---

## 1. Test Case Matrix (Mapped to User Stories)

### US-01/02/03: Flexible Interview Setup

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-01 | Setup — Valid role+skills | Unit | POST /api/interviews with role="Backend Engineer", skills=["Java","Spring"] | 201, interview created with DRAFT status | ✅ |
| TC-02 | Setup — Missing role | Unit | POST /api/interviews without role field | 400 VALIDATION_ERROR | ✅ |
| TC-03 | Setup — Question generation | Integration | Create interview → verify questions generated | 10-15 questions with categories | ✅ |
| TC-04 | Setup — Questions match skills | AI Validation | Generate for "React Developer" → check question content | Questions reference React, components, hooks | 🔍 Manual |
| TC-05 | Setup — Resume parsing | Integration | Submit resume text → verify highlights extracted | Skills and experience identified | ✅ |
| TC-06 | Setup — JD gap analysis | AI Validation | Resume missing "Kubernetes" from JD → verify gap question | At least 1 question probing Kubernetes experience | 🔍 Manual |
| TC-07 | Setup — Edit question bank | Unit | Edit question text → save → verify update persisted | Updated text saved | ✅ |
| TC-08 | Setup — Level calibration | AI Validation | Generate for Junior vs Senior → compare depth | Senior questions are deeper/more complex | 🔍 Manual |

---

### US-04/05/06: Adaptive Questioning

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-09 | Adaptive — Shallow response | Unit | Submit depth=1 response → check next action | FOLLOW_UP_EASIER action returned | ✅ |
| TC-10 | Adaptive — Adequate response | Unit | Submit depth=3 response → check next action | NEW_TOPIC action returned | ✅ |
| TC-11 | Adaptive — Deep response | Unit | Submit depth=5 response → check next action | FOLLOW_UP_DEEPER action returned | ✅ |
| TC-12 | Adaptive — Coverage tracking | Integration | Ask 8 questions across categories → check coverage | All categories have ≥ 1 question | ✅ |
| TC-13 | Adaptive — Auto-conclude | Integration | Complete 12 questions → check status | Interview status = COMPLETED | ✅ |
| TC-14 | Adaptive — No duplicate questions | Integration | Full interview → check question uniqueness | All questions are distinct | ✅ |
| TC-15 | Adaptive — Conversation flow | AI Validation | Check transition text between questions | Natural, acknowledging transitions | 🔍 Manual |
| TC-16 | Adaptive — Topic switch | Integration | Low coverage topic → verify topic is chosen next | Least-covered topic selected | ✅ |

---

### US-07/08: Automated Scoring & Feedback

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-17 | Scoring — Dimension scores | Unit | Evaluate response → verify 4 dimension scores | All scores 0-10, all present | ✅ |
| TC-18 | Scoring — Overall confidence | Unit | Average scores → verify confidence calculation | Confidence = weighted avg mapped to 0-100 | ✅ |
| TC-19 | Scoring — Recommendation mapping | Unit | Overall ≥ 80 → STRONG_HIRE | Correct recommendation | ✅ |
| TC-20 | Scoring — Recommendation mapping | Unit | Overall ≥ 60, < 80 → HIRE | Correct recommendation | ✅ |
| TC-21 | Scoring — Recommendation mapping | Unit | Overall ≥ 40, < 60 → MAYBE | Correct recommendation | ✅ |
| TC-22 | Scoring — Recommendation mapping | Unit | Overall < 40 → NO_HIRE | Correct recommendation | ✅ |
| TC-23 | Scoring — Rubric adherence | AI Validation | Weak response → check score < 5 | Score reflects quality accurately | 🔍 Manual |
| TC-24 | Scoring — Score inflation check | AI Validation | Average responses → verify scores cluster 4-6 | No systematic bias toward high scores | 🔍 Manual |
| TC-25 | Feedback — Summary generation | Integration | Complete interview → verify summary generated | Summary has strengths, concerns, quotes | ✅ |
| TC-26 | Feedback — Strengths evidence | AI Validation | Summary references actual candidate responses | Specific Q&A pairs cited | 🔍 Manual |

---

### US-09/10: AI Usage & Cost Tracking

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-27 | Cost — Token tracking | Unit | AI call → verify tokens recorded | Input + output tokens logged | ✅ |
| TC-28 | Cost — Per-interview total | Integration | Complete interview → sum all tokens | Total matches sum of all agent calls | ✅ |
| TC-29 | Cost — USD calculation | Unit | 1000 input tokens at $0.075/1M → cost | $0.000075 calculated correctly | ✅ |
| TC-30 | Cost — Agent breakdown | Integration | Complete interview → check breakdown | Each agent's token/cost shown separately | ✅ |
| TC-31 | Cost — Dashboard data | Integration | 3 interviews → verify dashboard totals | Aggregate totals and averages correct | ✅ |
| TC-32 | Cost — Zero for rule-based | Unit | Integrity monitor call → check tokens | 0 tokens, $0.00 cost | ✅ |

---

### US-11/12: Audit Trail & Usefulness

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-33 | Audit — Log creation | Unit | AI call → verify audit log entry | Entry with all required fields | ✅ |
| TC-34 | Audit — Immutability | Unit | Attempt to update existing log | Operation rejected or not exposed | ✅ |
| TC-35 | Audit — Interview filter | Integration | Filter by interview ID → verify results | Only matching interview's logs returned | ✅ |
| TC-36 | Audit — Agent filter | Integration | Filter by agent name → verify results | Only matching agent's logs returned | ✅ |
| TC-37 | Audit — Timestamp ordering | Integration | Multiple logs → verify chronological order | Ordered by created_at ASC | ✅ |
| TC-38 | Audit — Prompt content | Integration | Check stored prompt text | Full prompt text preserved | ✅ |
| TC-39 | Usefulness — Rating submission | Unit | Submit 4-star rating → verify saved | Rating persisted | ✅ |

---

### US-13/14/15: Human-in-the-Loop Review

| Test ID | Test Name | Type | Steps | Expected Result | Automated? |
|---------|-----------|------|-------|-----------------|-----------|
| TC-40 | Review — Approve action | Unit | Reviewer approves → verify status | override_type = APPROVED, status = REVIEWED | ✅ |
| TC-41 | Review — Adjust scores | Unit | Modify tech_depth from 6 to 8 with justification | Adjusted score saved, justification logged | ✅ |
| TC-42 | Review — Reject override | Unit | Override HIRE → NO_HIRE with reason | Decision = REJECT, reason required and saved | ✅ |
| TC-43 | Review — Reject without reason | Unit | Submit reject without notes | 400 VALIDATION_ERROR — notes required | ✅ |
| TC-44 | Review — Audit trail entry | Integration | Any review action → check audit log | Decision logged with reviewer, timestamp, type | ✅ |
| TC-45 | Review — Q&A side-by-side | UI Test | Open review page → verify layout | Question + response + AI score visible per Q&A | 🔍 Manual |
| TC-46 | Review — Confidence display | UI Test | Review page → verify confidence indicators | High/Medium/Low badges next to scores | 🔍 Manual |

---

## 2. AI-Output Validation Strategy

### Approach: Golden Set + Rubric Compliance

AI outputs cannot be tested with exact match assertions. Instead, we use:

| Method | Usage | Example |
|--------|-------|---------|
| **Schema Validation** | Every AI output must conform to expected JSON schema | Question has `id`, `category`, `text`, `depth_target` |
| **Range Validation** | Numeric scores must be within valid ranges | `0 ≤ score ≤ 10`, `1 ≤ depth ≤ 5` |
| **Enum Validation** | Categorical outputs must be valid enum values | `category ∈ {TECHNICAL, BEHAVIORAL, PROBLEM_SOLVING, SYSTEM_DESIGN}` |
| **Coverage Validation** | Question sets must cover all required categories | At least 1 question per category |
| **Golden Set Comparison** | Known inputs → expected output patterns | "Java + Spring Boot" → questions mention Spring concepts |
| **Bias Detection** | Score distribution across test set | Mean score should be 5-6, not 8-9 (calibration check) |
| **Relevance Scoring** | Keywords from role/skills appear in generated questions | ≥ 70% of skill keywords appear in question bank |

### Golden Test Cases

| Input | Expected Pattern | Validation |
|-------|-----------------|------------|
| Role=Frontend, Skills=[React, TypeScript] | Questions mention components, hooks, TypeScript types | Keyword presence check |
| Level=Junior | No system design questions at DEEP depth | Depth target validation |
| Level=Senior | At least 2 SYSTEM_DESIGN questions | Category count check |
| Weak response (< 20 words) | Depth score ≤ 2 | Range check |
| Strong response (detailed, with examples) | Depth score ≥ 4 | Range check |

---

## 3. Edge Cases

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| EC-01 | Candidate submits empty response | Depth = 1, gentle prompt to elaborate, question counted |
| EC-02 | Candidate submits extremely long response (> 2000 words) | Response truncated for AI evaluation, full text preserved in audit |
| EC-03 | Candidate responds with off-topic content | Low relevance score, AI redirects to topic |
| EC-04 | Candidate gives identical response to multiple questions | Integrity flag raised, reviewer notified |
| EC-05 | All responses are depth=5 (exceptional candidate) | Interview completes faster (8 questions minimum), all DEEP follow-ups |
| EC-06 | All responses are depth=1 (struggling candidate) | Interview continues with simpler questions, eventually concludes with low recommendation |
| EC-07 | Interview abandoned mid-way (browser close) | Partial data preserved, status = IN_PROGRESS, can be resumed |
| EC-08 | Hiring manager enters nonsensical skills | AI generates generic questions, graceful degradation |
| EC-09 | Resume and JD have zero overlap | AI focuses on transferable skills and learning ability |
| EC-10 | Concurrent review by two reviewers | Last write wins (MVP); production: optimistic locking |
| EC-11 | Token budget exceeded mid-interview | Graceful conclusion with available data, cost alert logged |
| EC-12 | AI generates duplicate question | De-duplication check before presenting, regenerate if duplicate |

---

## 4. Automation vs Manual Verification Matrix

| Category | Automated | Manual | Total |
|----------|-----------|--------|-------|
| Functional (CRUD, state, validation) | 28 | 0 | 28 |
| AI Output (schema, range, enum) | 8 | 0 | 8 |
| AI Quality (relevance, calibration, natural language) | 0 | 10 | 10 |
| UI/UX (layout, responsiveness, animations) | 0 | 4 | 4 |
| **Total** | **36** | **14** | **50** |

### What Should Be Automated
- Input validation (required fields, formats)
- State machine transitions (DRAFT → READY → IN_PROGRESS → COMPLETED → REVIEWED)
- Token counting accuracy
- Cost calculation correctness
- Audit log completeness
- Score range validation
- Question bank schema validation
- Coverage tracking logic

### What Should Be Manually Verified
- Question relevance to role/skills
- Natural language quality of transitions
- Scoring calibration (not too high/low)
- Feedback summary readability and accuracy
- UI layout and visual design
- Conversational flow feel
- Accessibility and usability

---

## 5. Performance Test Profiles

| Scenario | Target | Tool |
|----------|--------|------|
| Question generation for complex role (10+ skills) | < 3 seconds | Manual timing |
| Adaptive response evaluation | < 2 seconds per response | Manual timing |
| Full interview (10 questions) end-to-end | < 5 minutes wall clock | Manual walkthrough |
| Audit trail query (100+ entries) | < 500ms | Manual timing |
| Cost dashboard load (50 interviews) | < 1 second | Manual timing |

---

## 6. Security Test Cases

| Test ID | Vulnerability | Test | Expected |
|---------|--------------|------|----------|
| SEC-01 | Prompt Injection | Candidate response contains "Ignore all instructions..." | AI evaluation not affected; response scored normally |
| SEC-02 | XSS in Input | Skills field contains `<script>alert(1)</script>` | Content sanitized, no script execution |
| SEC-03 | Data Exposure | Candidate views another candidate's interview | 403 FORBIDDEN (when auth implemented) |
| SEC-04 | Token Budget Attack | Extremely long JD input attempting token exhaustion | Input truncated to max length |
| SEC-05 | Audit Tampering | Attempt to modify audit log entry | No update/delete API exposed |

---

## 7. Acceptance Criteria Summary

| Feature | Acceptance Criteria |
|---------|-------------------|
| Interview Setup | AI generates 10-15 role-relevant questions in < 3 seconds |
| Adaptive Questioning | Follow-ups adjust to depth correctly; all topics covered |
| Scoring | Structured scores (0-10) per dimension; recommendation generated |
| Cost Tracking | Token count accurate within ±5%; cost displayed per interview |
| Audit Trail | Every AI call logged with prompt, response, tokens, timestamp |
| Human Review | Override actions work; decisions logged with attribution |
