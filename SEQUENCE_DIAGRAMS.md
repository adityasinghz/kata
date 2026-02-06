# Sequence Diagrams - TrendMart BI Dashboard

## 1. User Login & Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant AuthManager
    participant SessionState

    User->>StreamlitUI: Navigate to login page
    User->>StreamlitUI: Enter username & password
    StreamlitUI->>AuthManager: login(username, password)
    AuthManager->>AuthManager: Verify password hash
    AuthManager->>SessionState: Store authenticated user
    AuthManager-->>StreamlitUI: Return success
    StreamlitUI->>StreamlitUI: Redirect to dashboard
    StreamlitUI-->>User: Display role-based dashboard
```

## 2. Data Loading & Dashboard Display Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant DataLoader
    participant CSVFiles
    participant AIInsightsGenerator

    User->>StreamlitUI: Access dashboard
    StreamlitUI->>DataLoader: load_all_data()
    DataLoader->>CSVFiles: Read product_master.csv
    DataLoader->>CSVFiles: Read store_sales.csv
    DataLoader->>CSVFiles: Read store_budget.csv
    DataLoader->>CSVFiles: Read store_inventory.csv
    CSVFiles-->>DataLoader: Return DataFrames
    DataLoader->>DataLoader: Normalize column names
    DataLoader->>DataLoader: create_unified_model()
    DataLoader->>DataLoader: Merge DataFrames
    DataLoader->>DataLoader: Calculate derived metrics
    DataLoader-->>StreamlitUI: Return unified DataFrame
    StreamlitUI->>StreamlitUI: Filter by user role
    StreamlitUI->>AIInsightsGenerator: generate_insights(summary)
    AIInsightsGenerator-->>StreamlitUI: Return insights
    StreamlitUI->>StreamlitUI: Generate visualizations
    StreamlitUI-->>User: Display dashboard with charts & insights
```

## 3. Natural Language Query Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant BIAgent
    participant DataLoader
    participant TrendAnalysis
    participant AnomalyDetection
    participant ScenarioSimulation
    participant AIInsightsGenerator

    User->>StreamlitUI: Type natural language query
    StreamlitUI->>BIAgent: chat(query, unified_data)
    BIAgent->>BIAgent: _classify_query(query)
    BIAgent->>BIAgent: Determine query type
    
    alt Trend Query
        BIAgent->>TrendAnalysis: extract_trends(data)
        TrendAnalysis-->>BIAgent: Return trend results
        BIAgent->>TrendAnalysis: detect_seasonality(data)
        TrendAnalysis-->>BIAgent: Return seasonality results
    else Anomaly Query
        BIAgent->>AnomalyDetection: get_anomaly_summary(data)
        AnomalyDetection-->>BIAgent: Return anomaly results
    else Scenario Query
        BIAgent->>ScenarioSimulation: simulate_promotion(data) or simulate_price_change(data)
        ScenarioSimulation-->>BIAgent: Return simulation results
    end
    
    BIAgent->>BIAgent: Format response
    BIAgent->>BIAgent: Extract visualization data
    BIAgent->>AIInsightsGenerator: generate_insights(results)
    AIInsightsGenerator-->>BIAgent: Return AI insights
    BIAgent-->>StreamlitUI: Return response + visualization data
    StreamlitUI->>StreamlitUI: Display response & charts
    StreamlitUI-->>User: Show formatted answer with visualizations
```

## 4. Anomaly Detection Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant AnomalyDetection
    participant DataLoader
    participant Plotly

    User->>StreamlitUI: Navigate to Anomaly Detection
    User->>StreamlitUI: Select metric & method
    User->>StreamlitUI: Click "Detect Anomalies"
    StreamlitUI->>DataLoader: get_unified_data()
    DataLoader-->>StreamlitUI: Return unified DataFrame
    StreamlitUI->>AnomalyDetection: get_anomaly_summary(data, metric)
    
    AnomalyDetection->>AnomalyDetection: Detect statistical outliers (IQR)
    AnomalyDetection->>AnomalyDetection: Detect time-series anomalies (rolling window)
    AnomalyDetection->>AnomalyDetection: Classify high/low outliers
    AnomalyDetection->>AnomalyDetection: Count spikes & drops
    AnomalyDetection->>AnomalyDetection: Calculate anomaly rate
    AnomalyDetection-->>StreamlitUI: Return anomaly summary
    
    StreamlitUI->>StreamlitUI: Display metrics (count, rate, quality)
    StreamlitUI->>Plotly: Create line chart with anomaly markers
    Plotly-->>StreamlitUI: Return chart
    StreamlitUI->>AIInsightsGenerator: generate_insights(anomaly_summary)
    AIInsightsGenerator-->>StreamlitUI: Return insights
    StreamlitUI-->>User: Display results with chart & insights
```

## 5. Scenario Simulation Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant ScenarioSimulation
    participant DataLoader
    participant Plotly

    User->>StreamlitUI: Navigate to Scenario Simulation
    User->>StreamlitUI: Select scenario type (Promotion/Price)
    User->>StreamlitUI: Configure parameters (discount %, duration)
    User->>StreamlitUI: Click "Simulate"
    StreamlitUI->>DataLoader: get_unified_data()
    DataLoader-->>StreamlitUI: Return unified DataFrame
    
    alt Promotion Scenario
        StreamlitUI->>ScenarioSimulation: simulate_promotion(data, discount_pct, duration_days)
        ScenarioSimulation->>ScenarioSimulation: Calculate baseline metrics
        ScenarioSimulation->>ScenarioSimulation: Apply promotion lift model
        ScenarioSimulation->>ScenarioSimulation: Calculate impact (revenue change, units change)
    else Price Change Scenario
        StreamlitUI->>ScenarioSimulation: simulate_price_change(data, price_change_pct)
        ScenarioSimulation->>ScenarioSimulation: Calculate baseline metrics
        ScenarioSimulation->>ScenarioSimulation: Apply price elasticity
        ScenarioSimulation->>ScenarioSimulation: Calculate demand impact
    end
    
    ScenarioSimulation->>ScenarioSimulation: Generate recommendation
    ScenarioSimulation-->>StreamlitUI: Return simulation results
    
    StreamlitUI->>StreamlitUI: Display baseline vs simulated metrics
    StreamlitUI->>Plotly: Create comparison bar chart
    Plotly-->>StreamlitUI: Return chart
    StreamlitUI-->>User: Display results with recommendation & chart
```

## 6. Trend Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant TrendAnalysis
    participant DataLoader
    participant Plotly

    User->>StreamlitUI: Navigate to Advanced Analytics
    User->>StreamlitUI: Select metric
    User->>StreamlitUI: Click "Analyze Trends"
    StreamlitUI->>DataLoader: get_unified_data()
    DataLoader-->>StreamlitUI: Return unified DataFrame
    StreamlitUI->>TrendAnalysis: extract_trends(data, metric, method='linear')
    
    TrendAnalysis->>TrendAnalysis: Aggregate by period (daily/weekly/monthly)
    TrendAnalysis->>TrendAnalysis: Fit linear regression
    TrendAnalysis->>TrendAnalysis: Calculate R², slope, p-value
    TrendAnalysis->>TrendAnalysis: Determine trend direction
    TrendAnalysis->>TrendAnalysis: Calculate percentage change
    TrendAnalysis-->>StreamlitUI: Return trend results
    
    StreamlitUI->>TrendAnalysis: detect_seasonality(data, metric)
    TrendAnalysis->>TrendAnalysis: Group by month/week
    TrendAnalysis->>TrendAnalysis: Calculate seasonality strength
    TrendAnalysis-->>StreamlitUI: Return seasonality results
    
    StreamlitUI->>StreamlitUI: Display trend metrics
    StreamlitUI->>Plotly: Create line chart with trend overlay
    Plotly-->>StreamlitUI: Return chart
    StreamlitUI->>Plotly: Create seasonality bar chart
    Plotly-->>StreamlitUI: Return chart
    StreamlitUI-->>User: Display trends & seasonality with charts
```

## 7. Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant StreamlitUI
    participant AuthManager
    participant SessionState

    User->>StreamlitUI: Click "Logout" button
    StreamlitUI->>AuthManager: logout()
    AuthManager->>SessionState: Clear authenticated user
    AuthManager->>SessionState: Clear session data
    AuthManager-->>StreamlitUI: Return success
    StreamlitUI->>StreamlitUI: Redirect to login page
    StreamlitUI-->>User: Display login page
```
