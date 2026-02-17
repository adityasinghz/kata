# API Specification — AI-Driven Fleet Management Optimization Platform

All endpoints are prefixed with `/api/v1`.
Authentication: Bearer Token (JWT via OAuth 2.0).
Content-Type: `application/json`.

## Table of Contents
1. [Authentication](#1-authentication)
2. [Vehicle Management](#2-vehicle-management)
3. [Driver Management](#3-driver-management)
4. [Route Optimization](#4-route-optimization)
5. [Maintenance](#5-maintenance)
6. [Driver Behavior & Scoring](#6-driver-behavior--scoring)
7. [Alerts & Notifications](#7-alerts--notifications)
8. [Analytics & Dashboard](#8-analytics--dashboard)
9. [Cost Management](#9-cost-management)
10. [Sustainability](#10-sustainability)

---

## 1. Authentication

### Login
`POST /auth/login`
Authenticates a user and returns a JWT.

**Body:**
```json
{
  "email": "manager@fleet.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expires_in": 3600,
  "user": {
    "id": "u-001",
    "email": "manager@fleet.com",
    "role": "FLEET_MANAGER"
  }
}
```

### Register User
`POST /auth/register`
Creates a new user account (Admin only).

**Body:**
```json
{
  "email": "driver@fleet.com",
  "full_name": "Alex Driver",
  "role": "DRIVER",
  "phone": "+1-555-0100"
}
```

---

## 2. Vehicle Management

### List Vehicles
`GET /vehicles`
Retrieves vehicles with optional filtering.

**Query Parameters:**
- `status` (String): 'ACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED'
- `fuel_type` (String): 'DIESEL', 'ELECTRIC', 'HYBRID'
- `page` (Integer): Page number (default: 1)
- `limit` (Integer): Items per page (default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "v-001",
      "vin": "1HGBH41JXMN109186",
      "make": "Volvo",
      "model": "FH16",
      "year": 2023,
      "license_plate": "AB-1234",
      "fuel_type": "DIESEL",
      "status": "ACTIVE",
      "current_odometer_km": 45230.5,
      "health_score": 87
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 142 }
}
```

### Create Vehicle
`POST /vehicles`
Registers a new vehicle.

**Body:**
```json
{
  "vin": "1HGBH41JXMN109186",
  "make": "Volvo",
  "model": "FH16",
  "year": 2023,
  "license_plate": "AB-1234",
  "fuel_type": "DIESEL"
}
```

**Response (201):**
```json
{
  "id": "v-001",
  "status": "PENDING",
  "message": "Vehicle registered. Pair a telematics device to activate."
}
```

### Pair Telematics Device
`POST /vehicles/{id}/pair-device`
Pairs a telematics device with a vehicle.

**Body:**
```json
{
  "device_serial_number": "TEL-2024-00042"
}
```

**Response (200):**
```json
{
  "vehicle_id": "v-001",
  "device_id": "d-042",
  "firmware_version": "2.1.0",
  "status": "ACTIVE",
  "message": "Device paired. Telemetry streaming active."
}
```

### Get Vehicle Health Report
`GET /vehicles/{id}/health`
Returns AI-generated health assessment for a vehicle.

**Response (200):**
```json
{
  "vehicle_id": "v-001",
  "overall_health_score": 87,
  "components": [
    { "name": "BRAKES", "risk_score": 0.82, "status": "AT_RISK", "recommendation": "Schedule brake pad replacement within 7 days" },
    { "name": "BATTERY", "risk_score": 0.35, "status": "HEALTHY", "recommendation": null },
    { "name": "ENGINE", "risk_score": 0.12, "status": "HEALTHY", "recommendation": null }
  ],
  "last_assessed_at": "2026-02-17T10:00:00Z"
}
```

---

## 3. Driver Management

### Create Driver
`POST /drivers`
Onboards a new driver.

**Body:**
```json
{
  "full_name": "Alex Driver",
  "license_number": "DL-2023-5678",
  "license_expiry": "2028-06-15",
  "phone": "+1-555-0100"
}
```

### Assign Driver to Vehicle
`POST /drivers/{id}/assign`
Creates a driver-vehicle assignment.

**Body:**
```json
{
  "vehicle_id": "v-001",
  "start_date": "2026-03-01",
  "end_date": null
}
```

**Response (201):**
```json
{
  "assignment_id": "a-001",
  "driver_id": "d-007",
  "vehicle_id": "v-001",
  "status": "ACTIVE"
}
```

### Get Driver Profile
`GET /drivers/{id}`
Returns driver details including safety score and compliance status.

**Response (200):**
```json
{
  "id": "d-007",
  "full_name": "Alex Driver",
  "safety_score": 81.5,
  "status": "ACTIVE",
  "license_expiry": "2028-06-15",
  "compliance_status": "VALID",
  "current_vehicle": { "id": "v-001", "license_plate": "AB-1234" },
  "recent_trips": 47
}
```

---

## 4. Route Optimization

### Optimize Route
`POST /routes/optimize`
Calculates the optimal route for a set of stops.

**Body:**
```json
{
  "vehicle_id": "v-001",
  "stops": [
    { "name": "Warehouse A", "lat": 40.7128, "lng": -74.0060 },
    { "name": "Client B", "lat": 40.7580, "lng": -73.9855 },
    { "name": "Client C", "lat": 40.6892, "lng": -74.0445 },
    { "name": "Client D", "lat": 40.7282, "lng": -73.7949 }
  ],
  "constraints": {
    "optimize_for": "FUEL_AND_TIME",
    "max_driving_hours": 8,
    "delivery_windows": [
      { "stop_name": "Client B", "window_start": "09:00", "window_end": "12:00" }
    ]
  }
}
```

**Response (200):**
```json
{
  "route_id": "r-001",
  "optimized_order": ["Warehouse A", "Client C", "Client B", "Client D"],
  "total_distance_km": 142.3,
  "estimated_fuel_l": 18.5,
  "estimated_duration_min": 195,
  "etas": [
    { "stop": "Warehouse A", "eta": "2026-02-17T08:00:00Z" },
    { "stop": "Client C", "eta": "2026-02-17T09:15:00Z" },
    { "stop": "Client B", "eta": "2026-02-17T10:30:00Z" },
    { "stop": "Client D", "eta": "2026-02-17T12:45:00Z" }
  ]
}
```

### Request Dynamic Reroute
`POST /routes/{id}/reroute`
Triggers recalculation of a specific segment due to traffic/weather changes.

**Body:**
```json
{
  "reason": "TRAFFIC_INCIDENT",
  "affected_segment": { "from": "Client C", "to": "Client B" }
}
```

---

## 5. Maintenance

### List Work Orders
`GET /maintenance/work-orders`
Get all maintenance work orders with optional filters.

**Query Parameters:**
- `vehicle_id` (UUID): Filter by vehicle
- `status` (String): 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'
- `urgency` (String): 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

**Response (200):**
```json
{
  "data": [
    {
      "id": "wo-001",
      "vehicle_id": "v-001",
      "vehicle_plate": "AB-1234",
      "component": "BRAKES",
      "status": "OPEN",
      "urgency": "HIGH",
      "risk_score": 0.82,
      "recommended_action": "Replace brake pad set — predicted failure in 7 days",
      "created_at": "2026-02-17T10:00:00Z"
    }
  ]
}
```

### Complete Work Order
`PUT /maintenance/work-orders/{id}/complete`
Marks a work order as completed with log details.

**Body:**
```json
{
  "action_taken": "Replaced front brake pad set and inspected rotors",
  "parts_replaced": ["Brake Pad Set (Front)", "Brake Fluid"],
  "cost_amount": 485.00
}
```

---

## 6. Driver Behavior & Scoring

### Get Driver Score History
`GET /drivers/{id}/scores`
Returns driver safety score trend.

**Query Parameters:**
- `period` (String): 'WEEK', 'MONTH', 'QUARTER'

**Response (200):**
```json
{
  "driver_id": "d-007",
  "current_score": 81.5,
  "period": "MONTH",
  "trend": "IMPROVING",
  "history": [
    { "date": "2026-02-10", "score": 78 },
    { "date": "2026-02-11", "score": 80 },
    { "date": "2026-02-12", "score": 82 }
  ],
  "top_events": [
    { "type": "HARSH_BRAKE", "count": 12 },
    { "type": "SPEEDING", "count": 5 }
  ]
}
```

### Get Trip Summary
`GET /trips/{id}`
Returns detailed trip summary with driving events.

**Response (200):**
```json
{
  "id": "t-001",
  "driver_id": "d-007",
  "vehicle_id": "v-001",
  "safety_score": 72,
  "distance_km": 148.3,
  "fuel_consumed_l": 19.2,
  "duration_min": 210,
  "events": [
    { "type": "HARSH_BRAKE", "severity": "HIGH", "lat": 40.7128, "lng": -74.006, "time": "2026-02-17T09:32:00Z" }
  ]
}
```

---

## 7. Alerts & Notifications

### Get Active Alerts
`GET /alerts`
Returns alerts for the authenticated user.

**Query Parameters:**
- `status` (String): 'PENDING', 'ACKNOWLEDGED'
- `type` (String): 'MAINTENANCE', 'DRIVER_BEHAVIOR', 'GEOFENCE', 'ROUTE'

**Response (200):**
```json
{
  "data": [
    {
      "id": "alert-99",
      "type": "MAINTENANCE",
      "severity": "HIGH",
      "message": "Vehicle AB-1234: Brake pads at 82% failure risk — Schedule replacement within 7 days",
      "status": "PENDING",
      "created_at": "2026-02-17T10:00:00Z"
    }
  ]
}
```

### Acknowledge Alert
`PUT /alerts/{id}/acknowledge`

**Response (200):**
```json
{ "id": "alert-99", "status": "ACKNOWLEDGED", "acknowledged_at": "2026-02-17T10:05:00Z" }
```

---

## 8. Analytics & Dashboard

### Get Fleet KPIs
`GET /analytics/kpis`

**Response (200):**
```json
{
  "fleet_utilization_pct": 78.5,
  "avg_fuel_cost_per_km": 0.42,
  "avg_maintenance_cost_monthly": 12450.00,
  "avg_driver_safety_score": 83.2,
  "on_time_delivery_pct": 91.3,
  "total_active_vehicles": 142,
  "total_active_drivers": 128,
  "period": "2026-02"
}
```

### Get AI Insights
`GET /analytics/insights`

**Response (200):**
```json
{
  "insights": [
    {
      "id": "ins-01",
      "category": "FUEL_OPTIMIZATION",
      "message": "Route A is 18% less fuel-efficient than Route B for Zone C deliveries. Switching saves ~$340/month.",
      "confidence": 0.92,
      "potential_savings": 340.00
    },
    {
      "id": "ins-02",
      "category": "MAINTENANCE",
      "message": "3 vehicles have brake risk scores above 70%. Schedule preventive maintenance this week.",
      "confidence": 0.87
    }
  ]
}
```

---

## 9. Cost Management

### Get Cost Summary
`GET /costs/summary`

**Query Parameters:**
- `period` (String): 'MONTH', 'QUARTER', 'YEAR'
- `vehicle_id` (UUID): Optional filter

**Response (200):**
```json
{
  "period": "2026-02",
  "total_cost": 87450.00,
  "breakdown": {
    "fuel": 42300.00,
    "maintenance": 18500.00,
    "tolls": 8200.00,
    "insurance": 12450.00,
    "other": 6000.00
  },
  "cost_per_km": 0.61,
  "vs_previous_period": "-3.2%"
}
```

### Get Cost Recommendations
`GET /costs/recommendations`

**Response (200):**
```json
{
  "recommendations": [
    {
      "id": "cr-01",
      "category": "ROUTE",
      "description": "Consolidating Tue/Thu Zone C deliveries saves $1,200/month in fuel and tolls",
      "estimated_savings_monthly": 1200.00
    }
  ]
}
```

---

## 10. Sustainability

### Get Emissions Report
`GET /sustainability/emissions`

**Query Parameters:**
- `period` (String): 'MONTH', 'QUARTER', 'YEAR'

**Response (200):**
```json
{
  "period": "2026-02",
  "total_co2_kg": 28450.0,
  "per_vehicle_avg_kg": 200.35,
  "per_km_g": 142.5,
  "vs_target": "-8.2%",
  "target_co2_kg": 31000.0,
  "top_emitters": [
    { "vehicle_id": "v-012", "license_plate": "XY-5678", "co2_kg": 890.0 }
  ]
}
```

### Get Green Recommendations
`GET /sustainability/recommendations`

**Response (200):**
```json
{
  "recommendations": [
    {
      "id": "gr-01",
      "description": "Replacing 5 diesel trucks with EVs reduces annual fleet emissions by 22%",
      "emission_reduction_pct": 22.0,
      "investment_required": 375000,
      "payback_period_months": 36
    }
  ]
}
```

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "VEHICLE_NOT_FOUND",
    "message": "Vehicle with ID v-999 does not exist",
    "status": 404,
    "timestamp": "2026-02-17T10:00:00Z"
  }
}
```

| HTTP Status | Usage |
|-------------|-------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate VIN, schedule conflict) |
| 422 | Unprocessable (device pairing failed) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
