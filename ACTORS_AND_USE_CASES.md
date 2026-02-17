# Actors and Use Cases

## Actors

### Primary Actors
1. **Fleet Manager**:
   - Responsibility: Oversees fleet operations, monitors vehicle status, assigns drivers, and manages costs.
   - Goals: Minimize downtime, reduce fuel costs, ensure compliance, and maximize asset utilization.

2. **Driver**:
   - Responsibility: Operates vehicles, performs pre-trip inspections, and adheres to safety guidelines.
   - Goals: Safe driving, on-time deliveries, efficient routing, and positive performance scores.

3. **Maintenance Staff**:
   - Responsibility: Performs scheduled and emergency maintenance, updates vehicle health records.
   - Goals: Ensure vehicle safety, reduce time-to-repair, and preventative maintenance.

### Secondary Actors
4. **Admin**:
   - Responsibility: System configuration, user management, and data governance.
   - Goals: System stability, security, and data integrity.

5. **External Systems**:
   - **GPS/Telematics Provider**: Provides raw location and telemetry data.
   - **ERP System**: Integrates for financial and inventory data.
   - **Compliance/Regulatory Body**: Receives compliance reports.

## Use Case Diagram

```mermaid
usecaseDiagram
    actor "Fleet Manager" as FM
    actor "Driver" as DR
    actor "Maintenance Staff" as MS
    actor "Admin" as AD

    package "Fleet Management System" {
        usecase "Monitor Real-Time Location" as UC1
        usecase "Manage Vehicles" as UC2
        usecase "Assign Routes" as UC3
        usecase "View Analytics Dashboard" as UC4
        usecase "Receive Alerts" as UC5
        
        usecase "View Assigned Route" as UC6
        usecase "Log Trip Details" as UC7
        usecase "Report Incident" as UC8
        usecase "View Driving Score" as UC9
        
        usecase "View Maintenance Schedule" as UC10
        usecase "Log Repair Work" as UC11
        usecase "Update Vehicle Status" as UC12
        
        usecase "Manage Users & Roles" as UC13
        usecase "Configure System Settings" as UC14
    }

    FM --> UC1
    FM --> UC2
    FM --> UC3
    FM --> UC4
    FM --> UC5
    
    DR --> UC6
    DR --> UC7
    DR --> UC8
    DR --> UC9
    
    MS --> UC10
    MS --> UC11
    MS --> UC12
    
    AD --> UC13
    AD --> UC14
```
