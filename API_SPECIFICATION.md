# API Specification

## Vehicle Service API
Base URL: `/api/v1/vehicles`

### Endpoints
- **GET /**: List all vehicles (supports filtering by status, type).
- **POST /**: Onboard a new vehicle.
- **GET /{id}**: Get detailed vehicle profile.
- **PUT /{id}**: Update vehicle details.
- **DELETE /{id}**: Decommission a vehicle (soft delete).
- **GET /{id}/telemetry**: Get historical telemetry data.

## Driver Service API
Base URL: `/api/v1/drivers`

### Endpoints
- **GET /**: List all drivers.
- **POST /**: Onboard a new driver.
- **GET /{id}**: Get driver profile and license info.
- **GET /{id}/score**: Get current safety score.
- **POST /{id}/assignments**: Assign driver to a vehicle.

## Maintenance Service API
Base URL: `/api/v1/maintenance`

### Endpoints
- **POST /schedule**: Create a maintenance schedule.
- **GET /predictions**: Get AI-predicted maintenance needs.
- **POST /logs**: Log a completed maintenance task.
- **GET /history/{vehicleId}**: Get maintenance history for a vehicle.

## Routing Service API
Base URL: `/api/v1/routes`

### Endpoints
- **POST /optimize**: Calculate optimal route for given stops and constraints.
- **GET /{id}**: Get route details.
- **PUT /{id}/status**: Update route status (Started, Completed).

## Analytics API
Base URL: `/api/v1/analytics`

### Endpoints
- **GET /dashboard/summary**: Get high-level fleet KPIs.
- **GET /reports/fuel**: Get fuel consumption report.
- **GET /reports/safety**: Get driver safety report.
