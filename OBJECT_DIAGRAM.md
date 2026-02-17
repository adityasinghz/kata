# Object Diagram

This diagram shows a specific snapshot of the system state during an active delivery trip.

```mermaid
classDiagram
    direction LR

    object vehicle_truck_01 {
        id = "TRK-2024-001"
        type = "Heavy Duty"
        status = "InTransit"
        fuel = 75.5%
    }

    object driver_john_doe {
        id = "DRV-5592"
        name = "John Doe"
        license = "CDL-A"
        safety_score = 98.4
    }

    object trip_delivery_NY_PA {
        id = "TRIP-8822"
        start = "2024-03-15 08:00"
        cargo_weight = "5000kg"
    }

    object route_I80_W {
        id = "RT-992"
        eta = "4h 30m"
        traffic = "Normal"
    }

    object alert_brake_warning {
        id = "AL-773"
        type = "Maintenance"
        severity = "Low"
        msg = "Brake pads 80% wear"
    }

    vehicle_truck_01 -- driver_john_doe : driven_by
    vehicle_truck_01 -- trip_delivery_NY_PA : executing
    trip_delivery_NY_PA -- route_I80_W : following
    vehicle_truck_01 -- alert_brake_warning : has_active_alert
```
