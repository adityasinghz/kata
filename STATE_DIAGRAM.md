# State Diagrams — AI-Driven Fleet Management Optimization Platform

> **⚠️ Core Requirements**: State machines model the lifecycle of key domain entities as defined in [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md).

## Table of Contents
1. [Vehicle Lifecycle](#vehicle-lifecycle)
2. [Maintenance Work Order Lifecycle](#maintenance-work-order-lifecycle)
3. [Driver Status Lifecycle](#driver-status-lifecycle)
4. [Route Lifecycle](#route-lifecycle)
5. [Alert Instance Lifecycle](#alert-instance-lifecycle)

---

## Vehicle Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending : Vehicle Registered

    Pending --> Active : Telematics Device Paired
    Pending --> Pending : Compliance Doc Uploaded

    Active --> InMaintenance : Maintenance Work Order Created
    Active --> Active : Telemetry Streaming
    Active --> Decommissioned : End of Life / Sold

    InMaintenance --> Active : Work Order Completed
    InMaintenance --> Decommissioned : Irreparable Damage

    Decommissioned --> [*]

    note right of Active
        Normal operating state.
        Vehicle is tracked in real-time.
        AI monitors health continuously.
    end note

    note right of InMaintenance
        Vehicle pulled from active fleet.
        Not available for route assignment.
    end note
```

---

## Maintenance Work Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Open : AI Creates Work Order (Risk > Threshold)

    Open --> Assigned : Maintenance Staff Assigned
    Open --> Cancelled : Fleet Manager Cancels (False Positive)

    Assigned --> InProgress : Staff Begins Work
    Assigned --> Open : Staff Unavailable (Reassign)

    InProgress --> Completed : Repair Finished & Logged
    InProgress --> OnHold : Waiting for Parts

    OnHold --> InProgress : Parts Received

    Completed --> [*]
    Cancelled --> [*]

    note right of Open
        AI-generated with risk score,
        component name, and
        recommended action.
    end note

    note right of Completed
        Triggers: reset component risk score,
        log maintenance cost, update vehicle
        odometer/service record.
    end note
```

---

## Driver Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PendingVerification : Driver Registered

    PendingVerification --> Active : Documents Verified
    PendingVerification --> PendingVerification : Document Upload

    Active --> OnTrip : Trip Started
    Active --> Suspended : Safety Score Below Threshold
    Active --> Suspended : License Expired
    Active --> Inactive : Resigned / Terminated

    OnTrip --> Active : Trip Completed
    OnTrip --> OnTrip : Driving Event Detected

    Suspended --> Active : Remediation Complete (Retraining / License Renewed)
    Suspended --> Inactive : Termination

    Inactive --> [*]

    note right of OnTrip
        Real-time behavior monitoring.
        Safety score updated per trip.
    end note

    note right of Suspended
        Cannot be assigned to vehicles.
        Requires admin intervention
        to reactivate.
    end note
```

---

## Route Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Planned : Route Optimized by AI

    Planned --> Dispatched : Assigned to Driver
    Planned --> Cancelled : Fleet Manager Cancels

    Dispatched --> InProgress : Driver Starts Trip
    Dispatched --> Cancelled : Driver Rejects

    InProgress --> Rerouted : Traffic/Weather Change
    InProgress --> Completed : All Waypoints Reached
    InProgress --> InProgress : Waypoint Arrived

    Rerouted --> InProgress : New Route Accepted by Driver

    Completed --> [*]
    Cancelled --> [*]

    note right of Rerouted
        AI recalculates affected segment.
        Driver notified of new path.
        ETAs updated.
    end note
```

---

## Alert Instance Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending : Alert Rule Triggered

    Pending --> Sent : Notification Dispatched (Push/SMS/Email)

    Sent --> Acknowledged : User Acknowledges Alert
    Sent --> Escalated : Timeout (No Acknowledgement)

    Escalated --> Acknowledged : Next-Level User Acknowledges
    Escalated --> Escalated : Further Escalation

    Acknowledged --> [*]

    note right of Escalated
        Escalation policy determines
        next contact in chain.
        Max 3 escalation levels.
    end note
```

---

**Last Updated**: February 2026
**Version**: 1.0
