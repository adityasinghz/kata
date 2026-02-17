# Object Diagram — AI-Driven Fleet Management Optimization Platform

> **⚠️ Context**: Object diagrams show **runtime snapshots** of actual object instances at specific points in time, illustrating how the classes from [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) are instantiated during real-world scenarios.

## Table of Contents
1. [Scenario 1: Active Fleet — Normal Operations](#scenario-1-active-fleet--normal-operations)
2. [Scenario 2: Predictive Maintenance Triggered](#scenario-2-predictive-maintenance-triggered)
3. [Scenario 3: Route In Progress with Driver Monitoring](#scenario-3-route-in-progress-with-driver-monitoring)

---

## Scenario 1: Active Fleet — Normal Operations

**Snapshot**: A fleet manager has 2 vehicles active, each with a paired telematics device, and 2 drivers assigned. The fleet is operating normally.

```mermaid
classDiagram
    class fleetManager {
        id = "u-001"
        email = "sarah@logicorp.com"
        fullName = "Sarah Chen"
        role = FLEET_MANAGER
        isActive = true
    }

    class truckAlpha {
        id = "v-001"
        vin = "1HGBH41JXMN109186"
        make = "Volvo"
        model = "FH16"
        year = 2023
        licensePlate = "AB-1234"
        fuelType = DIESEL
        status = ACTIVE
        currentOdometerKm = 45230.5
    }

    class deviceAlpha {
        id = "d-042"
        serialNumber = "TEL-2024-00042"
        firmwareVersion = "2.1.0"
        status = ACTIVE
        lastHeartbeat = "2026-02-17T10:59:55Z"
    }

    class truckBeta {
        id = "v-002"
        vin = "3C6UR5CL8KG601234"
        make = "Ram"
        model = "ProMaster 2500"
        year = 2024
        licensePlate = "XY-5678"
        fuelType = DIESEL
        status = ACTIVE
        currentOdometerKm = 18740.2
    }

    class deviceBeta {
        id = "d-043"
        serialNumber = "TEL-2024-00043"
        firmwareVersion = "2.1.0"
        status = ACTIVE
        lastHeartbeat = "2026-02-17T10:59:58Z"
    }

    class driverAlex {
        id = "d-007"
        fullName = "Alex Rivera"
        licenseNumber = "DL-2023-5678"
        licenseExpiry = "2028-06-15"
        status = ACTIVE
        safetyScore = 81.5
    }

    class driverMaria {
        id = "d-012"
        fullName = "Maria Santos"
        licenseNumber = "DL-2022-9012"
        licenseExpiry = "2027-11-30"
        status = ACTIVE
        safetyScore = 93.2
    }

    class assignmentAlpha {
        id = "a-001"
        driverId = "d-007"
        vehicleId = "v-001"
        startDate = "2026-01-15"
        endDate = null
        status = ACTIVE
    }

    class assignmentBeta {
        id = "a-002"
        driverId = "d-012"
        vehicleId = "v-002"
        startDate = "2026-02-01"
        endDate = null
        status = ACTIVE
    }

    truckAlpha *-- deviceAlpha : paired
    truckBeta *-- deviceBeta : paired
    driverAlex -- assignmentAlpha
    assignmentAlpha -- truckAlpha
    driverMaria -- assignmentBeta
    assignmentBeta -- truckBeta
```

---

## Scenario 2: Predictive Maintenance Triggered

**Snapshot**: The AI has detected that Truck Alpha's brakes are at high risk. A work order has been created and assigned to maintenance staff.

```mermaid
classDiagram
    class truckAlpha {
        id = "v-001"
        licensePlate = "AB-1234"
        status = ACTIVE
    }

    class brakeRiskScore {
        id = "rs-001"
        vehicleId = "v-001"
        componentName = "BRAKES"
        score = 0.82
        modelVersion = "pm-v3.2"
        calculatedAt = "2026-02-17T10:00:00Z"
    }

    class batteryRiskScore {
        id = "rs-002"
        vehicleId = "v-001"
        componentName = "BATTERY"
        score = 0.35
        modelVersion = "pm-v3.2"
        calculatedAt = "2026-02-17T10:00:00Z"
    }

    class workOrder001 {
        id = "wo-001"
        vehicleId = "v-001"
        component = "BRAKES"
        status = ASSIGNED
        urgency = HIGH
        riskScore = 0.82
        recommendedAction = "Replace brake pad set within 7 days"
        assignedTo = "u-005"
        createdAt = "2026-02-17T10:01:00Z"
    }

    class maintenanceStaff {
        id = "u-005"
        email = "jake@logicorp.com"
        fullName = "Jake Maintenance"
        role = MAINTENANCE_STAFF
    }

    class alertInstance {
        id = "alert-099"
        ruleId = "rule-maint-high"
        targetUserId = "u-005"
        message = "Vehicle AB-1234: Brake pads at 82% risk"
        status = ACKNOWLEDGED
        acknowledgedAt = "2026-02-17T10:03:00Z"
    }

    truckAlpha -- brakeRiskScore
    truckAlpha -- batteryRiskScore
    truckAlpha -- workOrder001
    workOrder001 -- maintenanceStaff : assigned to
    maintenanceStaff -- alertInstance : received
```

---

## Scenario 3: Route In Progress with Driver Monitoring

**Snapshot**: Driver Alex is mid-route delivering to 4 stops. The AI detected a harsh braking event. The route has been dynamically rerouted due to a traffic incident.

```mermaid
classDiagram
    class driverAlex {
        id = "d-007"
        fullName = "Alex Rivera"
        status = ON_TRIP
        safetyScore = 81.5
    }

    class route001 {
        id = "r-001"
        vehicleId = "v-001"
        status = IN_PROGRESS
        totalDistanceKm = 142.3
        estimatedFuelL = 18.5
    }

    class waypointA {
        id = "wp-001"
        routeId = "r-001"
        sequenceOrder = 1
        locationName = "Warehouse A"
        estimatedArrival = "08:00"
        actualArrival = "08:02"
        status = ARRIVED
    }

    class waypointC {
        id = "wp-002"
        routeId = "r-001"
        sequenceOrder = 2
        locationName = "Client C"
        estimatedArrival = "09:15"
        actualArrival = "09:18"
        status = ARRIVED
    }

    class waypointB {
        id = "wp-003"
        routeId = "r-001"
        sequenceOrder = 3
        locationName = "Client B"
        estimatedArrival = "10:30"
        actualArrival = null
        status = PENDING
    }

    class waypointD {
        id = "wp-004"
        routeId = "r-001"
        sequenceOrder = 4
        locationName = "Client D"
        estimatedArrival = "12:45"
        actualArrival = null
        status = PENDING
    }

    class harshBrakeEvent {
        id = "ev-001"
        driverId = "d-007"
        tripId = "t-001"
        type = HARSH_BRAKE
        severity = HIGH
        latitude = 40.7128
        longitude = -74.006
        timestamp = "2026-02-17T09:32:00Z"
    }

    class currentTripSummary {
        id = "t-001"
        driverId = "d-007"
        vehicleId = "v-001"
        routeId = "r-001"
        startTime = "2026-02-17T07:55:00Z"
        distanceKm = 82.1
        eventCount = 1
    }

    driverAlex -- route001
    route001 *-- waypointA
    route001 *-- waypointC
    route001 *-- waypointB
    route001 *-- waypointD
    driverAlex -- currentTripSummary
    currentTripSummary -- harshBrakeEvent
```

---

**Last Updated**: February 2026
**Version**: 1.0
