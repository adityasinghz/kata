# API Specification - TrendMart BI Dashboard

> **Note:** Currently, the TrendMart BI Dashboard is a Streamlit application with direct function calls. This API specification defines future RESTful API endpoints for external integrations and microservices architecture.

All endpoints are prefixed with `/api/v1`.
Authentication: Bearer Token (JWT) or API Key.

## 1. Authentication

### Login
`POST /auth/login`
Authenticate user and receive JWT token.

**Body:**
```json
{
  "username": "cco@trendmart.com",
  "password": "cco123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_001",
    "username": "cco@trendmart.com",
    "role": "CCO",
    "name": "Chief Commercial Officer"
  }
}
```

### Logout
`POST /auth/logout`
Invalidate current session token.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 2. Data Access

### Get Unified Data
`GET /data/unified`
Retrieve unified data model with optional filtering.

**Query Parameters:**
- `region` (String): Filter by region (North/South/East/West)
- `start_date` (Date): Filter by start date (YYYY-MM-DD)
- `end_date` (Date): Filter by end date (YYYY-MM-DD)
- `store_name` (String): Filter by store name
- `category` (String): Filter by product category
- `limit` (Integer): Limit number of records (default: 1000)
- `offset` (Integer): Pagination offset (default: 0)

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "date": "2023-12-02",
      "store_name": "Store_North_1",
      "region": "North",
      "product_id": "P001",
      "product_name": "Everyday Atta 5kg",
      "category": "Grocery",
      "quantity": 220,
      "net_sales": 53499.60,
      "budget_utilization_pct": 63.33,
      "stock_level": 150
    }
  ],
  "total_records": 2500,
  "limit": 1000,
  "offset": 0
}
```

### Get Summary Statistics
`GET /data/summary`
Get aggregated summary statistics.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_records": 2500,
  "date_range": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "total_revenue": 1250000.00,
  "total_quantity": 50000,
  "unique_stores": 8,
  "unique_products": 50,
  "regions": ["North", "South", "East", "West"]
}
```

## 3. Analytics Endpoints

### Trend Analysis
`POST /analytics/trends`
Analyze trends in sales data.

**Body:**
```json
{
  "metric": "net_sales",
  "method": "linear",
  "period": "daily",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "group_by": "region"
}
```

**Response:**
```json
{
  "trend": {
    "trend_direction": "increasing",
    "slope": 125.5,
    "r_squared": 0.85,
    "is_significant": true,
    "percentage_change": 15.2,
    "start_value": 10000.00,
    "end_value": 11520.00
  },
  "seasonality": {
    "has_seasonality": true,
    "strength": "moderate",
    "month": {
      "1": 9500.00,
      "2": 9800.00,
      "12": 12000.00
    }
  }
}
```

### Anomaly Detection
`POST /analytics/anomalies`
Detect anomalies in sales data.

**Body:**
```json
{
  "metric": "net_sales",
  "method": "iqr",
  "include_multivariate": true
}
```

**Response:**
```json
{
  "statistical_outliers": {
    "count": 45,
    "high_outliers": 25,
    "low_outliers": 20,
    "examples": [
      {
        "date": "2023-06-15",
        "value": 25000.00,
        "index": 150
      }
    ]
  },
  "time_series_anomalies": {
    "count": 30,
    "spikes": 18,
    "drops": 12
  },
  "overall_assessment": {
    "total_anomalies": 75,
    "anomaly_rate": 3.0,
    "data_quality": "good"
  }
}
```

### Scenario Simulation
`POST /analytics/scenarios`
Simulate business scenarios.

**Body (Promotion):**
```json
{
  "scenario_type": "promotion",
  "discount_pct": 20.0,
  "duration_days": 7,
  "price_elasticity": -1.5
}
```

**Body (Price Change):**
```json
{
  "scenario_type": "price_change",
  "price_change_pct": 10.0,
  "price_elasticity": -1.5
}
```

**Response:**
```json
{
  "scenario": "promotion",
  "baseline": {
    "revenue": 1000000.00,
    "units_sold": 50000,
    "average_price": 20.00
  },
  "simulated": {
    "revenue": 1176000.00,
    "units": 98000,
    "avg_price": 16.00
  },
  "impact": {
    "revenue_change_pct": 17.6,
    "units_change_pct": 96.0,
    "incremental_revenue": 176000.00,
    "incremental_units": 48000
  },
  "recommendation": "proceed"
}
```

## 4. AI Chat Endpoint

### Natural Language Query
`POST /ai/chat`
Process natural language query and return analysis.

**Body:**
```json
{
  "query": "What are the sales trends over time?",
  "conversation_id": "conv_123"
}
```

**Response:**
```json
{
  "response": "**Trend Analysis:**\n\nThe sales trend is **increasing** with a 15.2% change over the period...",
  "query_type": "trend",
  "results": {
    "type": "trend",
    "trend": {
      "trend_direction": "increasing",
      "percentage_change": 15.2
    }
  },
  "visualization_data": {
    "type": "trend",
    "data": {...}
  }
}
```

## 5. Dashboard Data Endpoints

### Get CCO Dashboard Data
`GET /dashboards/cco`
Get data for CCO dashboard.

**Headers:**
- `Authorization: Bearer <token>`
- Requires role: CCO

**Response:**
```json
{
  "global_revenue": 1250000.00,
  "revenue_by_region": {
    "North": 350000.00,
    "South": 400000.00,
    "East": 300000.00,
    "West": 200000.00
  },
  "category_share": {
    "Grocery": 40.0,
    "Electronics": 25.0,
    "Home Care": 20.0,
    "Personal Care": 15.0
  },
  "insights": "Revenue has increased 15% YoY..."
}
```

### Get Finance Dashboard Data
`GET /dashboards/finance`
Get data for Finance dashboard.

**Headers:**
- `Authorization: Bearer <token>`
- Requires role: Finance

**Response:**
```json
{
  "budget_utilization": [
    {
      "store_name": "Store_North_1",
      "region": "North",
      "annual_budget": 150000.00,
      "spend_ytd": 95000.00,
      "utilization_pct": 63.33
    }
  ],
  "roi_analysis": [
    {
      "store_name": "Store_North_1",
      "spend_ytd": 95000.00,
      "revenue": 350000.00,
      "roi": 268.42
    }
  ],
  "insights": "Budget utilization is optimal..."
}
```

### Get Manager Dashboard Data
`GET /dashboards/manager`
Get data for Manager dashboard (region-specific).

**Headers:**
- `Authorization: Bearer <token>`
- Requires role: Manager

**Query Parameters:**
- `region` (String): Manager's assigned region

**Response:**
```json
{
  "region": "North",
  "daily_sales": [
    {
      "date": "2023-12-01",
      "net_sales": 12000.00,
      "quantity": 500
    },
    {
      "date": "2023-12-02",
      "net_sales": 13500.00,
      "quantity": 550
    }
  ],
  "insights": "Regional sales show strong growth..."
}
```

## 6. Error Responses

All endpoints return standard error format:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters",
  "message": "Missing required parameter: metric",
  "code": "BAD_REQUEST"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions for this resource",
  "code": "FORBIDDEN"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```
