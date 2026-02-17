# Activity Diagram

## Maintenance Workflow

This diagram models the end-to-end process of handling a vehicle maintenance event.

```mermaid
activityDiagram
    start
    :Vehicle Sends Telemetry;
    if (Is Critical Fault?) then (yes)
        :Trigger Immediate Alert;
        :Predict Component Failure (AI);
        :Auto-Generate Maintenance Request;
    else (no)
        :Log Data for Analysis;
        stop
    endif
    
    :Notify Fleet Manager;
    if (Approve Request?) then (yes)
        :Check Parts Inventory;
        if (Parts Available?) then (yes)
            :Schedule Service Appointment;
        else (no)
            :Order Parts;
            :Schedule Appointment (Delayed);
        endif
        :Notify Driver to Reroute;
        :Update Vehicle Status to "Maintenance Scheduled";
    else (no)
        :Log Dismissal Reason;
        stop
    endif
    
    :Perform Maintenance;
    :Log Service Details;
    :Verify Vehicle Health;
    :Update Status to "Available";
    stop
```
