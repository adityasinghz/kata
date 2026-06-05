# API Specification — AI-Assisted Interview Screening

> RESTful API definitions for 6 service areas with JSON request/response examples.

---

## Base URL
```
http://localhost:3000/api
```

## Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Role is required",
    "details": [
      { "field": "role", "message": "Must not be empty" }
    ]
  }
}
```

## HTTP Status Codes Used
| Code | Usage |
|------|-------|
| 200 | Successful GET/PUT |
| 201 | Successful POST (resource created) |
| 400 | Validation error (missing/invalid fields) |
| 404 | Resource not found |
| 409 | Conflict (invalid state transition) |
| 500 | Internal server error |

---

## 1. Interview Management APIs

### POST /api/interviews — Create Interview

**Request:**
```json
{
  "role": "Senior Backend Engineer",
  "level": "SENIOR",
  "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "PostgreSQL"],
  "jdText": "We are looking for a Senior Backend Engineer to design and build scalable microservices...",
  "resumeText": "John Doe — 7 years experience in Java, Spring Boot, worked at Company X on payment gateway...",
  "candidateName": "John Doe",
  "createdBy": "hiring_manager_1"
}
```

**Response (201):**
```json
{
  "id": "INT-20260605-1234",
  "status": "DRAFT",
  "role": "Senior Backend Engineer",
  "level": "SENIOR",
  "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "PostgreSQL"],
  "candidateName": "John Doe",
  "questions": [
    {
      "id": "Q-001",
      "category": "SYSTEM_DESIGN",
      "text": "Design an event-driven order processing system using microservices. Walk through decomposition, communication patterns, and consistency guarantees.",
      "sequence": 1,
      "source": "JD_ALIGNED",
      "depthTarget": "DEEP",
      "skillTags": ["microservices", "kafka"]
    }
  ],
  "questionCount": 12,
  "createdAt": "2026-06-05T12:00:00Z",
  "costSoFar": {
    "totalTokens": 1200,
    "totalCostUsd": 0.0002
  }
}
```

### GET /api/interviews — List All Interviews

**Response (200):**
```json
{
  "interviews": [
    {
      "id": "INT-20260605-1234",
      "role": "Senior Backend Engineer",
      "candidateName": "John Doe",
      "status": "COMPLETED",
      "questionCount": 12,
      "responseCount": 10,
      "overallConfidence": 72,
      "aiRecommendation": "HIRE",
      "totalCostUsd": 0.0022,
      "createdAt": "2026-06-05T12:00:00Z",
      "completedAt": "2026-06-05T12:45:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/interviews/:id — Get Interview Details

**Response (200):** Full interview object with questions, responses, scores.

### POST /api/interviews/:id/start — Start Interview

**Response (200):**
```json
{
  "id": "INT-20260605-1234",
  "status": "READY",
  "firstQuestion": {
    "id": "Q-001",
    "category": "SYSTEM_DESIGN",
    "text": "Design an event-driven order processing system...",
    "sequence": 1
  },
  "totalQuestions": 12,
  "progress": 0
}
```

---

## 2. Interview Response APIs

### POST /api/interviews/:id/respond — Submit Candidate Response

**Request:**
```json
{
  "questionId": "Q-001",
  "candidateText": "I would decompose this into three main services: Order Service for receiving orders, Payment Service for processing payments, and Fulfillment Service for managing delivery. I would use Kafka as the message broker between services to ensure loose coupling. For consistency, I would implement the Saga pattern with compensating transactions.",
  "responseTimeSec": 45
}
```

**Response (200):**
```json
{
  "responseId": "R-001",
  "evaluation": {
    "depthScore": 4,
    "dimensions": {
      "technicalDepth": { "score": 7, "rationale": "Good understanding of microservice decomposition and event-driven patterns" },
      "communication": { "score": 6, "rationale": "Clear but could elaborate on trade-offs" },
      "problemSolving": { "score": 7, "rationale": "Structured approach with Saga pattern mentioned" },
      "roleAlignment": { "score": 8, "rationale": "Directly relevant experience with distributed systems" }
    }
  },
  "nextAction": {
    "action": "FOLLOW_UP_DEEPER",
    "transitionText": "Excellent breakdown of the service architecture. Let me dig deeper on one aspect —",
    "nextQuestion": {
      "id": "Q-002",
      "category": "SYSTEM_DESIGN",
      "text": "You mentioned the Saga pattern for consistency. How would you handle a scenario where the Payment Service confirms but the Fulfillment Service fails? Walk through the compensating transaction flow.",
      "depthTarget": "DEEP",
      "source": "ADAPTIVE_FOLLOWUP"
    }
  },
  "progress": {
    "questionsAnswered": 1,
    "totalExpected": 12,
    "percentComplete": 8,
    "coverage": {
      "TECHNICAL": 0,
      "SYSTEM_DESIGN": 50,
      "BEHAVIORAL": 0,
      "PROBLEM_SOLVING": 0
    }
  },
  "costIncurred": {
    "tokens": 1400,
    "costUsd": 0.0002
  }
}
```

---

## 3. Scoring & Feedback APIs

### GET /api/interviews/:id/scores — Get Interview Scores

**Response (200):**
```json
{
  "interviewId": "INT-20260605-1234",
  "summary": {
    "technicalDepth": 7.2,
    "communication": 6.5,
    "problemSolving": 6.8,
    "roleAlignment": 7.5,
    "overallConfidence": 72,
    "aiRecommendation": "HIRE"
  },
  "feedback": {
    "overallImpression": "John demonstrated strong technical knowledge in distributed systems and microservices architecture...",
    "strengths": [
      { "area": "System Design", "evidence": "In Q1 and Q2, clearly articulated service decomposition and consistency patterns" },
      { "area": "Role Alignment", "evidence": "Prior payment gateway experience directly relevant to role requirements" },
      { "area": "Problem Solving", "evidence": "Proposed Saga pattern and discussed compensating transactions" }
    ],
    "concerns": [
      { "area": "Communication", "evidence": "Responses could benefit from more structured organization" },
      { "area": "Behavioral", "evidence": "Limited examples of leadership and team collaboration" }
    ],
    "notableQuotes": [
      "I would use Kafka as the message broker between services to ensure loose coupling"
    ],
    "recommendationRationale": "Strong technical candidate with relevant domain experience. Communication skills are adequate but could improve. Recommend advancing to next round."
  },
  "perQuestionScores": [
    {
      "questionId": "Q-001",
      "questionText": "Design an event-driven order processing system...",
      "responseText": "I would decompose this into three main services...",
      "depthScore": 4,
      "dimensions": { "technicalDepth": 7, "communication": 6, "problemSolving": 7, "roleAlignment": 8 }
    }
  ]
}
```

---

## 4. Review APIs

### POST /api/interviews/:id/review — Submit Review Decision

**Request (Approve):**
```json
{
  "action": "APPROVE",
  "reviewerName": "Jane Smith",
  "finalDecision": "ADVANCE",
  "notes": "Agree with AI assessment. Strong candidate for the role.",
  "usefulnessRating": 4
}
```

**Request (Adjust):**
```json
{
  "action": "ADJUST",
  "reviewerName": "Jane Smith",
  "adjustments": {
    "communication": { "oldScore": 6.5, "newScore": 7.5, "reason": "I found the responses quite clear and well-structured" }
  },
  "finalDecision": "ADVANCE",
  "notes": "Adjusted communication score upward. AI was slightly harsh on clarity.",
  "usefulnessRating": 3,
  "usefulnessFeedback": "Scoring was mostly accurate but undervalued communication quality"
}
```

**Request (Reject):**
```json
{
  "action": "REJECT",
  "reviewerName": "Jane Smith",
  "finalDecision": "REJECT",
  "notes": "Despite adequate technical scores, I have concerns about cultural fit based on behavioral responses. Overriding AI HIRE recommendation.",
  "usefulnessRating": 3
}
```

**Response (200):**
```json
{
  "interviewId": "INT-20260605-1234",
  "status": "REVIEWED",
  "decision": {
    "action": "APPROVE",
    "finalDecision": "ADVANCE",
    "reviewerName": "Jane Smith",
    "originalRecommendation": "HIRE",
    "finalRecommendation": "HIRE",
    "decidedAt": "2026-06-05T13:00:00Z"
  }
}
```

---

## 5. Audit Trail APIs

### GET /api/audit — Get Audit Logs

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `interviewId` | string | Filter by interview |
| `agentName` | string | Filter by AI agent |
| `startDate` | ISO date | Filter from date |
| `endDate` | ISO date | Filter to date |
| `limit` | number | Max results (default: 50) |
| `offset` | number | Pagination offset |

**Response (200):**
```json
{
  "logs": [
    {
      "id": "AL-001",
      "interviewId": "INT-20260605-1234",
      "agentName": "question_generator",
      "operation": "GENERATE_QUESTIONS",
      "promptText": "You are an expert technical interviewer...",
      "responseText": "[{\"id\":\"Q-001\",...}]",
      "inputTokens": 800,
      "outputTokens": 400,
      "costUsd": 0.0002,
      "latencyMs": 450,
      "modelUsed": "gemini-2.0-flash",
      "createdAt": "2026-06-05T12:00:01Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

## 6. Cost Tracking APIs

### GET /api/costs — Get Aggregate Cost Data

**Response (200):**
```json
{
  "aggregate": {
    "totalInterviews": 15,
    "totalCostUsd": 0.033,
    "avgCostPerInterview": 0.0022,
    "totalInputTokens": 180000,
    "totalOutputTokens": 63000,
    "totalApiCalls": 375
  },
  "byAgent": [
    { "agent": "question_generator", "totalCost": 0.003, "totalCalls": 15 },
    { "agent": "response_evaluator", "totalCost": 0.012, "totalCalls": 150 },
    { "agent": "adaptive_followup", "totalCost": 0.015, "totalCalls": 150 },
    { "agent": "feedback_synthesizer", "totalCost": 0.003, "totalCalls": 15 }
  ],
  "trend": [
    { "date": "2026-06-01", "interviews": 3, "cost": 0.0066 },
    { "date": "2026-06-02", "interviews": 5, "cost": 0.011 },
    { "date": "2026-06-03", "interviews": 4, "cost": 0.0088 },
    { "date": "2026-06-04", "interviews": 2, "cost": 0.0044 },
    { "date": "2026-06-05", "interviews": 1, "cost": 0.0022 }
  ]
}
```

### GET /api/costs/:interviewId — Get Per-Interview Cost

**Response (200):**
```json
{
  "interviewId": "INT-20260605-1234",
  "modelUsed": "gemini-2.0-flash",
  "totalInputTokens": 12000,
  "totalOutputTokens": 4200,
  "totalCostUsd": 0.0022,
  "totalApiCalls": 25,
  "avgLatencyMs": 420,
  "breakdown": [
    { "agent": "question_generator", "inputTokens": 800, "outputTokens": 400, "cost": 0.0002, "calls": 1 },
    { "agent": "response_evaluator", "inputTokens": 4000, "outputTokens": 2000, "cost": 0.0008, "calls": 10 },
    { "agent": "adaptive_followup", "inputTokens": 6000, "outputTokens": 1500, "cost": 0.0010, "calls": 10 },
    { "agent": "feedback_synthesizer", "inputTokens": 1200, "outputTokens": 300, "cost": 0.0002, "calls": 1 }
  ]
}
```
