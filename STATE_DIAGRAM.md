# State Diagram — AI-Assisted Interview Screening

---

## 1. Interview State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create Interview

    DRAFT --> READY: Manager confirms questions
    DRAFT --> DRAFT: Edit questions / Update config

    READY --> IN_PROGRESS: Candidate starts interview
    READY --> DRAFT: Manager re-edits questions

    IN_PROGRESS --> IN_PROGRESS: Candidate responds / AI adapts
    IN_PROGRESS --> COMPLETED: Auto-conclude (≥8 Qs + full coverage OR ≥12 Qs)
    IN_PROGRESS --> PAUSED: Candidate disconnects
    
    PAUSED --> IN_PROGRESS: Candidate resumes
    PAUSED --> ABANDONED: Timeout (24 hours)

    COMPLETED --> REVIEWED: Reviewer submits decision
    
    ABANDONED --> [*]
    REVIEWED --> [*]

    state DRAFT {
        [*] --> ConfigEntered
        ConfigEntered --> QuestionsGenerated: AI generates
        QuestionsGenerated --> QuestionsEdited: Manager edits
        QuestionsEdited --> QuestionsGenerated: Regenerate
    }

    state IN_PROGRESS {
        [*] --> QuestionPresented
        QuestionPresented --> ResponseReceived: Candidate answers
        ResponseReceived --> ResponseEvaluated: AI scores
        ResponseEvaluated --> AdaptationDecided: AI decides next
        AdaptationDecided --> QuestionPresented: Next question
        AdaptationDecided --> InterviewConcluded: Conclude signal
    }

    state COMPLETED {
        [*] --> ScoringCalculated
        ScoringCalculated --> FeedbackGenerated: AI summarizes
        FeedbackGenerated --> ReadyForReview
    }

    state REVIEWED {
        [*] --> DecisionRecorded
        DecisionRecorded --> [*]
    }
```

---

## 2. Question State Machine

```mermaid
stateDiagram-v2
    [*] --> GENERATED: AI creates question

    GENERATED --> ACTIVE: Manager confirms (or auto-active)
    GENERATED --> REMOVED: Manager removes

    ACTIVE --> PRESENTED: Shown to candidate
    ACTIVE --> SKIPPED: Coverage sufficient / interview concluded
    ACTIVE --> EDITED: Manager modifies text
    ACTIVE --> REMOVED: Manager removes

    EDITED --> ACTIVE: Save edits

    PRESENTED --> ANSWERED: Candidate responds
    PRESENTED --> TIMED_OUT: No response (time limit)

    ANSWERED --> SCORED: AI evaluates response
    SCORED --> [*]

    TIMED_OUT --> SCORED: Score as depth=1
    TIMED_OUT --> [*]
    SKIPPED --> [*]
    REMOVED --> [*]
```

---

## 3. Review Decision State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_REVIEW: Interview completed

    PENDING_REVIEW --> IN_REVIEW: Reviewer opens review page
    
    IN_REVIEW --> APPROVED: Reviewer accepts AI scores
    IN_REVIEW --> ADJUSTED: Reviewer modifies scores
    IN_REVIEW --> REJECTED: Reviewer overrides recommendation
    IN_REVIEW --> PENDING_REVIEW: Reviewer exits without deciding

    state APPROVED {
        [*] --> AcceptedAsIs
        AcceptedAsIs --> FinalDecisionRecorded
        note right of AcceptedAsIs
            AI recommendation becomes
            final recommendation
        end note
    }

    state ADJUSTED {
        [*] --> ScoresModified
        ScoresModified --> JustificationAdded: Required notes
        JustificationAdded --> RecommendationRecalculated
        RecommendationRecalculated --> FinalDecisionRecorded2
        note right of ScoresModified
            Reviewer modifies individual
            dimension scores with reasoning
        end note
    }

    state REJECTED {
        [*] --> RecommendationOverridden
        RecommendationOverridden --> RejectionReasonAdded: Required notes
        RejectionReasonAdded --> FinalDecisionRecorded3
        note right of RecommendationOverridden
            Reviewer overrides AI decision
            e.g., HIRE → NO_HIRE
        end note
    }

    APPROVED --> [*]
    ADJUSTED --> [*]
    REJECTED --> [*]
```

---

## 4. Adaptive Questioning State Machine

```mermaid
stateDiagram-v2
    [*] --> EVALUATE_RESPONSE: Candidate submits answer

    EVALUATE_RESPONSE --> ASSESS_DEPTH: AI scores response

    ASSESS_DEPTH --> FOLLOW_UP_EASIER: Depth ≤ 2
    ASSESS_DEPTH --> CHECK_COVERAGE: Depth = 3
    ASSESS_DEPTH --> FOLLOW_UP_DEEPER: Depth ≥ 4

    CHECK_COVERAGE --> SWITCH_TOPIC: Gaps in coverage
    CHECK_COVERAGE --> CHECK_QUESTION_COUNT: All topics ≥ 60%

    CHECK_QUESTION_COUNT --> CONCLUDE: Questions ≥ 8
    CHECK_QUESTION_COUNT --> SWITCH_TOPIC: Questions < 8

    FOLLOW_UP_EASIER --> GENERATE_QUESTION: AI creates simpler question
    FOLLOW_UP_DEEPER --> GENERATE_QUESTION: AI creates advanced question
    SWITCH_TOPIC --> GENERATE_QUESTION: AI picks new topic

    GENERATE_QUESTION --> MAX_QUESTIONS_CHECK: Question generated

    MAX_QUESTIONS_CHECK --> PRESENT_QUESTION: Questions < 12
    MAX_QUESTIONS_CHECK --> CONCLUDE: Questions ≥ 12

    PRESENT_QUESTION --> [*]: Show to candidate

    CONCLUDE --> SYNTHESIZE_FEEDBACK: Generate summary
    SYNTHESIZE_FEEDBACK --> INTERVIEW_COMPLETE: Summary ready
    INTERVIEW_COMPLETE --> [*]
```

---

## 5. Cost Tracking State Machine

```mermaid
stateDiagram-v2
    [*] --> ZERO_COST: Interview created

    ZERO_COST --> ACCUMULATING: First AI call made

    ACCUMULATING --> ACCUMULATING: Additional AI calls
    ACCUMULATING --> BUDGET_WARNING: Total cost > threshold

    BUDGET_WARNING --> ACCUMULATING: Continue (below hard limit)
    BUDGET_WARNING --> BUDGET_EXCEEDED: Hard limit reached

    ACCUMULATING --> FINALIZED: Interview completed
    BUDGET_WARNING --> FINALIZED: Interview completed
    BUDGET_EXCEEDED --> FINALIZED: Interview force-concluded

    FINALIZED --> [*]

    note right of ACCUMULATING
        Each AI call:
        1. Count tokens
        2. Calculate cost
        3. Add to total
        4. Update breakdown
    end note

    note right of BUDGET_WARNING
        Soft limit: $0.01 per interview
        Hard limit: $0.05 per interview
        (configurable)
    end note
```
