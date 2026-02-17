# Activity Diagrams — AI-Driven Fleet Management Optimization Platform

> **⚠️ Core Requirements**: Activity workflows map to the use cases defined in [ACTORS_AND_USE_CASES.md](./ACTORS_AND_USE_CASES.md).

## Table of Contents
1. [Fleet Onboarding Workflow](#fleet-onboarding-workflow)
2. [Predictive Maintenance Workflow](#predictive-maintenance-workflow)
3. [Route Planning & Execution Workflow](#route-planning--execution-workflow)
4. [Driver Behavior Review Workflow](#driver-behavior-review-workflow)

---

## Fleet Onboarding Workflow

**Use Cases**: UC-2 (Onboard Vehicle), UC-3 (Onboard Driver)

```mermaid
flowchart TD
    Start([Fleet Manager Initiates Onboarding]) --> VehOrDriver{Vehicle or Driver?}

    VehOrDriver -->|Vehicle| EnterVehicle[Enter Vehicle Details<br/>VIN, Make, Model, Year, Fuel Type]
    VehOrDriver -->|Driver| EnterDriver[Enter Driver Details<br/>Name, License No., Contact]

    EnterVehicle --> UploadVehDocs[Upload Compliance Documents<br/>Insurance, Registration, Emission Cert]
    UploadVehDocs --> ValidateVehDocs{Documents Valid?}

    ValidateVehDocs -->|Yes| PairDevice[Pair Telematics Device<br/>Enter Serial Number]
    ValidateVehDocs -->|No| RejectVeh[Mark Vehicle as<br/>Pending Compliance]
    RejectVeh --> NotifyFM1[Notify Fleet Manager:<br/>Documents Need Attention]
    NotifyFM1 --> End1([End])

    PairDevice --> DeviceCheck{Device Handshake<br/>Successful?}
    DeviceCheck -->|Yes| ActivateVehicle[Set Vehicle Status = ACTIVE<br/>Begin Telemetry Streaming]
    DeviceCheck -->|No| RetryPair[Show Error:<br/>Check Device Installation]
    RetryPair --> PairDevice

    ActivateVehicle --> ConfirmVeh[Notify Fleet Manager:<br/>Vehicle Active ✅]
    ConfirmVeh --> End2([End])

    EnterDriver --> UploadDriverDocs[Upload Documents<br/>License Copy, Medical Fitness]
    UploadDriverDocs --> ValidateDriverDocs{Documents Valid?}

    ValidateDriverDocs -->|Yes| AssignVehicle[Assign Driver to Vehicle<br/>Select Vehicle & Schedule]
    ValidateDriverDocs -->|No| RejectDriver[Mark Driver as<br/>Pending Verification]
    RejectDriver --> NotifyFM2[Notify Fleet Manager:<br/>Driver Docs Need Review]
    NotifyFM2 --> End3([End])

    AssignVehicle --> ScheduleConflict{Schedule<br/>Conflict?}
    ScheduleConflict -->|No| ActivateDriver[Set Driver Status = ACTIVE]
    ScheduleConflict -->|Yes| ResolveConflict[Prompt to Resolve<br/>Schedule Overlap]
    ResolveConflict --> AssignVehicle

    ActivateDriver --> ConfirmDriver[Notify Fleet Manager:<br/>Driver Onboarded ✅]
    ConfirmDriver --> End4([End])
```

---

## Predictive Maintenance Workflow

**Use Case**: UC-5 (Predict Maintenance Needs)

```mermaid
flowchart TD
    Start([Telematics Device Streams Data]) --> Ingest[Telematics Ingestion Service<br/>Parse & Validate Telemetry]

    Ingest --> Publish[Publish to Kafka:<br/>TelemetryReceived Event]

    Publish --> Consume[Predictive Maintenance Service<br/>Consumes Telemetry]

    Consume --> Sufficient{Sufficient History?<br/>30+ days data}
    Sufficient -->|No| Skip[Continue Collecting Data<br/>No Prediction Yet]
    Skip --> End1([End])

    Sufficient -->|Yes| RunML[Run ML Inference<br/>Predict Component Failure Risk]

    RunML --> EvalScore{Risk Score ><br/>Threshold 0.75?}

    EvalScore -->|No| UpdateScore[Update Component Risk Score<br/>in Database]
    UpdateScore --> Monitor[Continue Monitoring]
    Monitor --> End2([End])

    EvalScore -->|Yes| CreateWO[Auto-Create Maintenance<br/>Work Order]
    CreateWO --> PublishEvent[Publish Kafka:<br/>MaintenanceWorkOrderCreated]

    PublishEvent --> NotifyStaff[Alert & Notification Service]

    NotifyStaff --> ParallelNotify{Send Notifications}
    ParallelNotify --> NotifyMS[Push to Maintenance Staff:<br/>Work Order Details]
    ParallelNotify --> NotifyFM[Dashboard Alert to<br/>Fleet Manager]

    NotifyMS --> StaffAction{Staff Acknowledges?}
    StaffAction -->|Yes| AssignWO[Work Order Status = ASSIGNED]
    StaffAction -->|No, Timeout| Escalate[Escalate to Fleet Manager]
    Escalate --> AssignWO

    AssignWO --> PerformWork[Maintenance Staff<br/>Performs Repair]
    PerformWork --> LogWork[Log: Action Taken,<br/>Parts Replaced, Cost]
    LogWork --> CompleteWO[Work Order Status = COMPLETED]
    CompleteWO --> ResetScore[Reset Component Risk Score]
    ResetScore --> UpdateVehicle[Update Vehicle Service Record]
    UpdateVehicle --> End3([End])
```

---

## Route Planning & Execution Workflow

**Use Case**: UC-6 (Optimize Route)

```mermaid
flowchart TD
    Start([Fleet Manager Creates<br/>Delivery Schedule]) --> InputStops[Define Stops:<br/>Pickup & Drop-off Locations,<br/>Time Windows]

    InputStops --> SelectVehicle[Select Vehicle & Driver]
    SelectVehicle --> RequestOpt[Send to Route<br/>Optimization Service]

    RequestOpt --> FetchData{Fetch External Data}
    FetchData --> Traffic[Traffic API:<br/>Congestion & Incidents]
    FetchData --> Weather[Weather API:<br/>Forecast & Alerts]

    Traffic --> Optimize
    Weather --> Optimize[AI Constraint Solver:<br/>Minimize Fuel + Time<br/>Respect Delivery Windows]

    Optimize --> DisplayRoute[Display Optimized Route<br/>with ETAs to Fleet Manager]

    DisplayRoute --> Approve{Fleet Manager<br/>Approves?}
    Approve -->|No| ModifyStops[Modify Stops or Constraints]
    ModifyStops --> RequestOpt
    Approve -->|Yes| Dispatch[Dispatch Route to Driver]

    Dispatch --> DriverAccept{Driver Accepts<br/>Route?}
    DriverAccept -->|No| Reassign[Reassign to<br/>Different Driver]
    Reassign --> Dispatch
    DriverAccept -->|Yes| StartTrip[Driver Starts Trip<br/>Route Status = IN_PROGRESS]

    StartTrip --> Monitoring{Real-Time<br/>Monitoring}
    Monitoring --> WaypointArrived[Waypoint Arrived:<br/>Log Actual Arrival Time]
    Monitoring --> TrafficChange[Traffic Change Detected]
    Monitoring --> Deviation[Route Deviation Detected]

    WaypointArrived --> AllDone{All Waypoints<br/>Reached?}
    AllDone -->|No| Monitoring
    AllDone -->|Yes| Complete[Route Status = COMPLETED<br/>Generate Trip Summary]
    Complete --> End([End])

    TrafficChange --> Reroute[AI Recalculates<br/>Affected Segment]
    Reroute --> NotifyDriver[Push New Route<br/>to Driver]
    NotifyDriver --> Monitoring

    Deviation --> AlertFM[Alert Fleet Manager:<br/>Route Deviation]
    AlertFM --> Monitoring
```

---

## Driver Behavior Review Workflow

**Use Case**: UC-7 (Monitor Driver Behavior)

```mermaid
flowchart TD
    Start([Trip Begins — Telemetry<br/>Streaming Active]) --> Stream[Driver Behavior Analytics<br/>Consumes Telemetry Stream]

    Stream --> Analyze[Analyze Sliding Window<br/>Accelerometer + Speed + GPS]

    Analyze --> EventDetected{Unsafe Event<br/>Detected?}

    EventDetected -->|No| Continue[Continue Monitoring]
    Continue --> Analyze

    EventDetected -->|Yes| ClassifyEvent[Classify Event Type:<br/>Harsh Brake / Speeding /<br/>Rapid Accel / Sharp Corner / Idle]

    ClassifyEvent --> AssignSeverity[Assign Severity:<br/>LOW / MEDIUM / HIGH / CRITICAL]

    AssignSeverity --> LogEvent[Log Event to Database:<br/>Type, Severity, Location, Time]

    LogEvent --> HighSeverity{Severity >= HIGH?}
    HighSeverity -->|Yes| InCabAlert[Send In-Cab Alert<br/>to Driver 🔴]
    HighSeverity -->|No| Continue

    InCabAlert --> Continue

    Stream --> TripEnds{Trip Ends?}
    TripEnds -->|No| Analyze
    TripEnds -->|Yes| CalcScore[Calculate Trip Safety Score<br/>100 minus weighted penalties]

    CalcScore --> UpdateRolling[Update 30-Day<br/>Rolling Average Score]

    UpdateRolling --> BelowThreshold{Rolling Score <br/>< Safety Threshold?}
    BelowThreshold -->|Yes| FlagDriver[Flag Driver for Review<br/>Notify Fleet Manager]
    BelowThreshold -->|No| SendSummary[Send Trip Summary<br/>to Driver App]

    FlagDriver --> SendSummary
    SendSummary --> UpdateDashboard[Update Fleet Manager<br/>Dashboard with Scores]
    UpdateDashboard --> End([End])
```

---

**Last Updated**: February 2026
**Version**: 1.0
