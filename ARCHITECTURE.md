# System Architecture

## Architectural Style
We propose an **Event-Driven Microservices Architecture**. This approach ensures modularity, scalability, and loose coupling, which is essential for a system handling real-time streams of telemetry and GPS data.

### Rationale for Microservices
- **Scalability**: Independence allows scaling high-traffic services (Telemetry Ingestion) separately from low-traffic ones (User Management).
- **Technology Diversity**: Different services can use optimized tech stacks (e.g., Go/Rust for high-throughput ingestion, Python for AI/ML models).
- **Fault Isolation**: A failure in one service (e.g., Reporting) does not crash the entire platform.
- **Team Autonomy**: Small teams can own specific business capabilities.

## Microservices Identification

| Service Name | Responsibility | Identification Rationale |
| :--- | :--- | :--- |
| **Telemetry Service** | Ingests high-frequency GPS/sensor data. | Handles raw stream processing; high throughput requirement distinct from CRUD ops. |
| **Vehicle Service** | Manages vehicle profiles, inventory, and status. | Core domain entity with clear boundaries (Vehicle lifecycle). |
| **Driver Service** | Manages driver profiles, licenses, and scores. | Separates human resource concerns from asset management. |
| **Maintenance Service** | Predicts & schedules maintenance work. | Encapsulates complex logic for scheduling and service history; distinct domain. |
| **Route Optimization Service** | Calculates optimal routes based on multiple variables. | computationally intensive task; benefits from independent scaling and specific algorithms. |
| **Alerting Service** | Processes events to send notifications. | Centralizes notification logic (Email, SMS, Push) to avoid duplication across services. |
| **Analytics Service** | Aggregates data for dashboards and reports. | Read-heavy workload; separates reporting load from transactional databases (CQRS pattern). |
| **Identity Service** | Handles authentication and authorization. | Cross-cutting concern; central security enforcement point (OAuth2/OIDC). |
| **Cost Management Service** | Tracks expenses and fuel costs. | Financial domain logic is distinct from operational fleet tracking. |

## Guiding Principles Usage

### SOLID Principles
- **Single Responsibility Principle (SRP)**: Each microservice focuses on one business capability (e.g., Telemetry Service only handles data ingestion, not user management).
- **Open/Closed Principle (OCP)**: The Alerting Service is open for extension (adding new notification channels) but closed for modification (core logic remains stable).
- **Dependency Inversion Principle (DIP)**: Services depend on abstractions (APIs/Event Topics) rather than concrete implementations of other services.

### KISS (Keep It Simple, Stupid)
- **API Design**: REST APIs use standard HTTP verbs and status codes, avoiding complex custom protocols.
- **Data Flow**: Using a unified event bus (e.g., Kafka) simplifies the communication mesh compared to point-to-point RPC calls for everything.

### YAGNI (You Ain't Gonna Need It)
- **Feature Scope**: We focus on the core requirements (Tracking, Maintenance, Routing) and avoid building "nice-to-have" features like a built-in social network for drivers until explicitly needed.
- **Tech Stack**: starting with a managed database service instead of building a custom distributed storage engine.
