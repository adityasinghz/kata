# Guiding Principles

This document outlines the software design principles applied in the architecture of the Fleet Management System.

## SOLID Principles

### Single Responsibility Principle (SRP)
- **Application**: We decomposed the system into `Vehicle`, `Driver`, and `maintenance` services.
- **Benefit**: Changes to driver compliance rules only affect the `Driver Service`, minimizing regression risks in other modules.

### Open/Closed Principle (OCP)
- **Application**: The `Alerting Service` uses a plugin-like architecture for notification channels.
- **Benefit**: We can add new channels (e.g., WhatsApp integration) without modifying the core alerting processor.

### Liskov Substitution Principle (LSP)
- **Application**: In our specific code implementation (Class Diagram), `Truck` and `Van` can be used interchangeably where `Vehicle` is expected.
- **Benefit**: Simplifies polymorphic behavior in routing and maintenance logic.

### Interface Segregation Principle (ISP)
- **Application**: Frontend clients (Mobile App vs Admin Dashboard) consume specific BFF (Backend for Frontend) APIs tailored to their needs rather than a massive "God API".

### Dependency Inversion Principle (DIP)
- **Application**: High-level policy (Business Logic) depends on abstractions (Interfaces/Ports), not low-level details (Database drivers).
- **Example**: The `RouteService` depends on an `IMapProvider` interface, allowing us to switch between Google Maps and Mapbox easily.

## KISS (Keep It Simple, Stupid)

- **Infrastructure**: We favor managed services (AWS RDS, Confluent Cloud) over self-hosted complex clusters to reduce operational complexity.
- **Logic**: We implement standard algorithms for routing before attempting custom AI-driven heuristics, ensuring a baseline working system first.

## YAGNI (You Ain't Gonna Need It)

- **Blockchain**: We decided *against* using Blockchain for vehicle history at this stage, as a centralized immutable ledger is sufficient and less complex.
- **Micro-Frontends**: For the initial MVPs, a modular monolith frontend is sufficient; we aren't introducing the complexity of micro-frontends until team size necessitates it.
