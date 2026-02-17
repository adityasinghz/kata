# State Diagrams

## Vehicle Lifecycle State

This diagram represents the states a vehicle can be in throughout its lifecycle in the fleet.

```mermaid
stateDiagram-v2
    [*] --> Onboarding
    Onboarding --> Available : Compliance Checked
    Available --> InTransit : Trip Started
    InTransit --> Available : Trip Completed
    InTransit --> MaintenanceRequired : Fault Detected
    Available --> MaintenanceRequired : Scheduled Maintenance
    MaintenanceRequired --> InMaintenance : Work Started
    InMaintenance --> Available : Repairs Completed
    Available --> Decommissioned : End of Life
    InMaintenance --> Decommissioned : Beyond Repair
    Decommissioned --> [*]
```

## Maintenance Ticket State

This diagram represents the lifecycle of a maintenance request.

```mermaid
stateDiagram-v2
    [*] --> New : Fault Alert / Schedule
    New --> Approved : Manager Approval
    New --> Rejected : Dismissed
    Approved --> Assigned : Technician Assigned
    Assigned --> InProgress : Work Started
    InProgress --> OnHold : Parts Unavailable
    OnHold --> InProgress : Parts Arrived
    InProgress --> Completed : Work Finished
    Completed --> Verified : QA Check Passed
    Verified --> [*]
```
