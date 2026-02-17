# Flowcharts — AI-Driven Fleet Management Optimization Platform

> **⚠️ Core Requirements**: Decision flowcharts model the AI-driven logic for key platform capabilities.

## Table of Contents
1. [Maintenance Decision Engine](#maintenance-decision-engine)
2. [Route Selection Decision Flow](#route-selection-decision-flow)
3. [Driver Risk Assessment Flow](#driver-risk-assessment-flow)
4. [Alert Escalation Decision Flow](#alert-escalation-decision-flow)

---

## Maintenance Decision Engine

This flowchart models how the AI decides whether to create a maintenance work order based on telematics data.

```mermaid
flowchart TD
    A[Receive Telemetry Data<br/>Engine Temp, Oil Pressure,<br/>Tire Pressure, Battery, Mileage] --> B{Data Quality<br/>Check Passed?}

    B -->|No| C[Log Warning:<br/>Incomplete/Invalid Telemetry]
    C --> D[Request Device<br/>Health Check]
    D --> Z1([End — Await Next Data])

    B -->|Yes| E[Append to Vehicle<br/>Telemetry History Window]

    E --> F{Sufficient History?<br/>30+ Day Window}
    F -->|No| Z2([End — Continue Collecting])

    F -->|Yes| G[Run ML Inference:<br/>Component Failure Prediction]

    G --> H{Critical OBD-II<br/>Fault Code Detected?}
    H -->|Yes| I[🚨 CRITICAL:<br/>Create Urgent Work Order<br/>Urgency = CRITICAL]
    I --> J[Alert Fleet Manager<br/>+ Maintenance Staff<br/>+ Driver Immediately]
    J --> Z3([End])

    H -->|No| K{Any Component<br/>Risk Score > 0.75?}
    K -->|No| L{Any Component<br/>Risk Score > 0.50?}

    L -->|No| M[All Green ✅<br/>Update Scores in DB]
    M --> Z4([End — Continue Monitoring])

    L -->|Yes| N[⚠️ WATCH:<br/>Add to Review Queue<br/>Increase Monitoring Frequency]
    N --> Z5([End])

    K -->|Yes| O{Existing Open<br/>Work Order for<br/>Same Component?}

    O -->|Yes| P[Update Existing WO<br/>with Latest Risk Score]
    P --> Z6([End])

    O -->|No| Q[Create New Work Order<br/>Urgency = HIGH]
    Q --> R[Auto-Assign to<br/>Nearest Available<br/>Maintenance Staff]
    R --> S[Send Notifications:<br/>Push + Dashboard Alert]
    S --> Z7([End])
```

---

## Route Selection Decision Flow

This flowchart models how the AI selects the optimal route from candidate paths.

```mermaid
flowchart TD
    A[Input: Stops List,<br/>Vehicle Capacity, Time Windows] --> B[Generate Candidate<br/>Routes — Permutations<br/>of Stop Ordering]

    B --> C[For Each Candidate Route]

    C --> D[Fetch Real-Time<br/>Traffic Data]
    D --> E[Fetch Weather<br/>Forecast for Route]

    E --> F{Severe Weather<br/>Alert on Any Segment?}
    F -->|Yes| G[Mark Affected Segments<br/>as Hazardous]
    G --> H[Add Heavy Time/Fuel<br/>Penalty to Route Score]
    F -->|No| I[Normal Scoring]

    H --> J
    I --> J[Calculate Route Score]

    J --> K["Score = w1×Distance<br/>+ w2×EstFuel<br/>+ w3×EstTime<br/>+ w4×TrafficDelay<br/>+ w5×WeatherPenalty"]

    K --> L{All Delivery Windows<br/>Satisfiable?}
    L -->|No| M[Discard Candidate Route<br/>— Constraint Violated]
    L -->|Yes| N[Add to Valid<br/>Candidate Pool]

    M --> O{More Candidates?}
    N --> O
    O -->|Yes| C
    O -->|No| P{Valid Routes > 0?}

    P -->|No| Q[⚠️ No Feasible Route<br/>Alert Fleet Manager:<br/>Relax Constraints or<br/>Split Deliveries]
    Q --> Z1([End])

    P -->|Yes| R[Sort Valid Routes<br/>by Score - Ascending]
    R --> S[Select Top Route<br/>as Recommended]
    S --> T[Return Optimized Route<br/>with ETAs per Stop]
    T --> Z2([End])
```

---

## Driver Risk Assessment Flow

This flowchart models how the system evaluates a driver's overall risk level and determines corrective actions.

```mermaid
flowchart TD
    A[Trigger: Trip Completed<br/>— New Score Available] --> B[Fetch Driver's<br/>Rolling 30-Day Avg Score]

    B --> C{Score >= 85?}
    C -->|Yes| D[🟢 LOW RISK<br/>Driver is performing well]
    D --> E[No Action Needed<br/>Send Positive Feedback]
    E --> Z1([End])

    C -->|No| F{Score >= 70?}
    F -->|Yes| G[🟡 MODERATE RISK<br/>Performance declining]
    G --> H[Generate Improvement Tips<br/>in Driver App]
    H --> I[Log for Fleet Manager<br/>Weekly Review]
    I --> Z2([End])

    F -->|No| J{Score >= 50?}
    J -->|Yes| K[🟠 HIGH RISK<br/>Consistent unsafe behavior]
    K --> L[Alert Fleet Manager:<br/>Schedule Coaching Session]
    L --> M[Restrict from<br/>Long-Haul Routes]
    M --> Z3([End])

    J -->|No| N[🔴 CRITICAL RISK<br/>Dangerous driving patterns]
    N --> O[Suspend Driver<br/>from Active Duty]
    O --> P[Mandate Safety<br/>Retraining Program]
    P --> Q[Require Fleet Manager<br/>Approval to Reactivate]
    Q --> Z4([End])
```

---

## Alert Escalation Decision Flow

This flowchart models how the notification system determines the delivery channel and escalation path.

```mermaid
flowchart TD
    A[Alert Event Received<br/>Type + Severity + Target Role] --> B{Severity Level?}

    B -->|INFO| C[Channel: In-App Only<br/>No Push Notification]
    C --> Z1([End])

    B -->|WARNING| D[Channel: Push Notification<br/>+ In-App]
    D --> E[Set Acknowledgement<br/>Timeout: 30 min]
    E --> F{Acknowledged<br/>Within Timeout?}
    F -->|Yes| Z2([End])
    F -->|No| G[Escalate to<br/>Fleet Manager — via SMS]
    G --> Z3([End])

    B -->|HIGH| H[Channel: Push + SMS<br/>+ In-App]
    H --> I[Set Acknowledgement<br/>Timeout: 10 min]
    I --> J{Acknowledged<br/>Within Timeout?}
    J -->|Yes| Z4([End])
    J -->|No| K[Escalate: Level 1<br/>Fleet Manager — Phone Call]
    K --> L{Acknowledged<br/>Within 5 min?}
    L -->|Yes| Z5([End])
    L -->|No| M[Escalate: Level 2<br/>Regional Manager — Phone Call]
    M --> Z6([End])

    B -->|CRITICAL| N[Channel: Push + SMS<br/>+ Phone Call + Email<br/>ALL SIMULTANEOUSLY]
    N --> O[Set Acknowledgement<br/>Timeout: 5 min]
    O --> P{Acknowledged<br/>Within Timeout?}
    P -->|Yes| Z7([End])
    P -->|No| Q[Escalate: Level 1 + 2<br/>Fleet Manager +<br/>Regional Manager +<br/>Operations Director]
    Q --> Z8([End])
```

---

**Last Updated**: February 2026
**Version**: 1.0
