# Key Requirements - TrendMart BI Dashboard

## 1. Unified Data Model (ETL Pipeline)
**Requirement:** The system must merge multiple CSV data sources (Product Master, Store Sales, Budget, Inventory) into a unified data model for analysis.
**Details:**
- Automatic data loading from CSV files in `data/` directory
- Data merging on common keys (product_id, store_name)
- Derived metric calculation (budget utilization %, revenue per unit)
- Date component extraction for time-series analysis
- Support for different CSV column name formats (normalization)

## 2. Role-Based Access Control (RBAC)
**Requirement:** The system must provide three distinct user roles with tailored dashboards and data access.
**Details:**
- **CCO View:** Global revenue metrics, revenue by region (bar chart), category share (pie chart)
- **Finance View:** Budget utilization % (data grid), ROI analysis (scatter plot: Spend vs Revenue)
- **Manager View:** Region-specific daily sales trends (time-series line chart)
- Secure authentication with password hashing (bcrypt)
- Session management for authenticated users

## 3. Interactive Data Visualization
**Requirement:** The system must provide interactive charts and visualizations using Plotly Express.
**Details:**
- Bar charts for revenue by region
- Pie charts for category share
- Scatter plots for ROI analysis
- Line charts for time-series trends
- Real-time chart updates based on data filters
- Responsive design for different screen sizes

## 4. AI-Powered Business Insights
**Requirement:** Integration with Hugging Face Inference API to generate automated business insights.
**Details:**
- Revenue insights and recommendations
- Budget efficiency analysis
- Sales trend explanations
- Anomaly interpretation
- Scenario impact analysis
- Fallback mechanism when API is unavailable

## 5. Natural Language Query Interface
**Requirement:** Users must be able to ask business questions in plain English and receive intelligent responses.
**Details:**
- Query classification (trend, anomaly, scenario, data Q&A)
- Automatic tool selection based on query intent
- Context-aware responses using conversation history
- Integrated visualizations based on query results
- Example queries and suggestions

## 6. Advanced Analytics Capabilities
**Requirement:** The system must provide advanced analytics tools for trend analysis, anomaly detection, and scenario simulation.
**Details:**
- **Trend Analysis:** Linear regression, R² strength, statistical significance, percentage change
- **Anomaly Detection:** Statistical outliers (IQR), time-series anomalies (rolling window), multivariate detection
- **Scenario Simulation:** Promotion campaigns, price changes, impact analysis with recommendations
- **Seasonality Detection:** Monthly/weekly patterns, strength assessment

## 7. Data Simulation & Testing
**Requirement:** Utility script to generate sample CSV data for development and demonstration.
**Details:**
- Generate realistic product master data
- Generate time-series sales data with trends
- Generate budget and inventory data
- Configurable parameters (number of products, date range, stores)
- Consistent data relationships

## 8. Scalability & Extensibility
**Requirement:** The system must be easily extensible to add new roles, metrics, visualizations, and AI capabilities.
**Details:**
- Modular Python package structure
- Separation of concerns (Data, Business Logic, UI)
- Plugin-like architecture for analytics tools
- Configuration-based customization
- Easy integration with external data sources
