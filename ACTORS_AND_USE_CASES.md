# Actors and Use Cases - TrendMart BI Dashboard

## Actors

### Primary Actors
1. **Chief Commercial Officer (CCO):** Views global revenue metrics, regional performance, and category share for strategic decision-making.
2. **Finance Manager:** Monitors budget utilization, ROI analysis, and financial performance metrics.
3. **Store Manager (Regional):** Views region-specific sales trends and daily performance metrics.

### Secondary Actors
1. **System Administrator:** Manages user accounts, roles, and system configuration.
2. **Data Analyst:** Uses advanced analytics tools (trend analysis, anomaly detection, scenario simulation).
3. **AI Assistant:** Automated system that processes natural language queries and generates insights.

## Use Cases

### UC-1: User Login & Authentication
*   **Actor:** CCO / Finance Manager / Store Manager
*   **Goal:** Authenticate and access role-specific dashboard.
*   **Preconditions:** User has valid credentials.
*   **Main Flow:**
    1. Actor navigates to login page.
    2. Actor enters username and password.
    3. System validates credentials using AuthManager.
    4. System creates authenticated session.
    5. System redirects to role-specific dashboard.
*   **Alternate Flow (Invalid Credentials):**
    1. System displays error message.
    2. Actor can retry login or reset password.

### UC-2: View Role-Based Dashboard
*   **Actor:** CCO / Finance Manager / Store Manager
*   **Goal:** View tailored dashboard with relevant metrics and visualizations.
*   **Preconditions:** User is authenticated.
*   **Main Flow:**
    1. System loads unified data model via DataLoader.
    2. System filters data based on user role.
    3. System displays role-specific visualizations:
       - **CCO:** Global revenue, revenue by region (bar chart), category share (pie chart)
       - **Finance:** Budget utilization % (data grid), ROI analysis (scatter plot)
       - **Manager:** Region-specific daily sales trends (line chart)
    4. System generates AI insights using AIInsightsGenerator.
    5. Actor views dashboard with metrics and insights.

### UC-3: Natural Language Query (AI Chat)
*   **Actor:** Any authenticated user
*   **Goal:** Ask business questions in plain English and receive intelligent responses.
*   **Preconditions:** User is authenticated, data is loaded.
*   **Main Flow:**
    1. Actor navigates to "AI Chat" page.
    2. Actor types natural language query (e.g., "What are the sales trends?").
    3. BIAgent classifies query type (trend, anomaly, scenario, data Q&A).
    4. BIAgent selects appropriate analytics tool.
    5. Tool executes analysis on unified data.
    6. BIAgent formats response with insights and visualizations.
    7. Actor views response and interactive charts.
*   **Alternate Flow (Complex Query):**
    1. BIAgent may use multiple tools for comprehensive analysis.
    2. Response includes combined insights from multiple analyses.

### UC-4: Anomaly Detection
*   **Actor:** Data Analyst / Finance Manager
*   **Goal:** Identify unusual patterns or outliers in sales data.
*   **Preconditions:** User is authenticated, data is loaded.
*   **Main Flow:**
    1. Actor navigates to "Anomaly Detection" page.
    2. Actor selects metric (Revenue or Quantity) and detection method.
    3. Actor clicks "Detect Anomalies".
    4. System runs anomaly detection using AnomalyDetection tool.
    5. System displays:
       - Total anomaly count and rate
       - Statistical outliers (high/low)
       - Time-series anomalies (spikes/drops)
       - Data quality assessment
    6. System generates visualization with anomaly markers.
    7. System generates AI insights explaining anomalies.
    8. Actor reviews results and takes action if needed.

### UC-5: Scenario Simulation (What-If Analysis)
*   **Actor:** CCO / Finance Manager
*   **Goal:** Simulate business scenarios to understand potential impacts.
*   **Preconditions:** User is authenticated, data is loaded.
*   **Main Flow:**
    1. Actor navigates to "Scenario Simulation" page.
    2. Actor selects scenario type (Promotion Campaign / Price Change / Compare).
    3. Actor configures parameters (discount %, duration, price change %).
    4. Actor clicks "Simulate".
    5. System runs scenario simulation using ScenarioSimulation tool.
    6. System displays:
       - Baseline metrics (revenue, units)
       - Simulated metrics
       - Impact analysis (percentage change)
       - Recommendation (Proceed/Review)
    7. System generates comparison visualization.
    8. Actor reviews results and makes decision.

### UC-6: Advanced Trend Analysis
*   **Actor:** Data Analyst / CCO
*   **Goal:** Analyze sales trends and seasonality patterns.
*   **Preconditions:** User is authenticated, data is loaded.
*   **Main Flow:**
    1. Actor navigates to "Advanced Analytics" page.
    2. Actor selects metric to analyze.
    3. Actor clicks "Analyze Trends".
    4. System runs trend analysis using TrendAnalysis tool.
    5. System displays:
       - Trend direction (increasing/decreasing/flat)
       - Percentage change
       - R² strength
       - Statistical significance
       - Seasonality patterns
    6. System generates trend visualization with trend line overlay.
    7. System generates seasonality chart (monthly patterns).
    8. Actor reviews trends and patterns.

### UC-7: Data Export & Reporting
*   **Actor:** Finance Manager / CCO
*   **Goal:** Export dashboard data for external reporting.
*   **Preconditions:** User is authenticated, data is loaded.
*   **Main Flow:**
    1. Actor views dashboard or analysis results.
    2. Actor clicks "Export" button.
    3. System generates CSV/Excel file with filtered data.
    4. Actor downloads file for external use.

### UC-8: Logout
*   **Actor:** Any authenticated user
*   **Goal:** Securely end session.
*   **Preconditions:** User is authenticated.
*   **Main Flow:**
    1. Actor clicks "Logout" button.
    2. System clears session state.
    3. System redirects to login page.
