# Features - TrendMart BI Dashboard

## F1: Role-Based Dashboards
**Description:** Three distinct dashboard views tailored to specific user roles with relevant metrics and visualizations.
**Key Capabilities:**
- **CCO Dashboard:** Global revenue overview, revenue by region (bar chart), category share (pie chart), AI-powered strategic insights
- **Finance Dashboard:** Budget utilization percentage (data grid), ROI analysis scatter plot (Spend vs Revenue), financial performance metrics
- **Manager Dashboard:** Region-specific daily sales trends (time-series line chart), regional performance metrics
**Technical Note:** Streamlit session state manages role-based routing and data filtering.

## F2: Unified Data Model (ETL Pipeline)
**Description:** Automatic merging of multiple CSV data sources into a single unified data model.
**Key Capabilities:**
- **Multi-Source Loading:** Loads Product Master, Store Sales, Budget, and Inventory CSV files
- **Intelligent Merging:** Joins data on common keys (product_id, store_name)
- **Column Normalization:** Handles different CSV formats (sale_date → date, quantity_sold → quantity)
- **Derived Metrics:** Calculates budget utilization %, revenue per unit, date components
- **Data Validation:** Checks for required columns and provides clear error messages

## F3: Natural Language Query Interface (AI Chat)
**Description:** AI-powered chat interface that understands business questions in plain English.
**Key Capabilities:**
- **Query Classification:** Automatically detects query type (trend, anomaly, scenario, data Q&A)
- **Intelligent Tool Selection:** Chooses appropriate analytics tool based on query intent
- **Context-Aware Responses:** Uses conversation history for better understanding
- **Integrated Visualizations:** Automatically displays relevant charts based on query results
- **Example Queries:** Pre-defined example questions for quick access
**Technical Note:** Uses BIAgent with modular analytics tools, Hugging Face API for insights.

## F4: Advanced Anomaly Detection
**Description:** Comprehensive anomaly detection system using multiple statistical methods.
**Key Capabilities:**
- **Statistical Outliers:** IQR method for detecting high/low outliers
- **Time-Series Anomalies:** Rolling window analysis with Z-score threshold
- **Multivariate Detection:** Isolation Forest for complex pattern detection
- **Visualization:** Interactive charts with anomaly markers (red X markers)
- **AI Insights:** Automated explanations of detected anomalies and recommendations
- **Data Quality Assessment:** Overall anomaly rate and quality metrics

## F5: Scenario Simulation (What-If Analysis)
**Description:** Business scenario modeling tool for promotions and price changes.
**Key Capabilities:**
- **Promotion Campaign Simulation:** 
  - Configure discount percentage (5-50%)
  - Set duration (1-30 days)
  - Calculate revenue impact, units lift, ROI
  - Cannibalization analysis
- **Price Change Simulation:**
  - Simulate price increases/decreases (-30% to +30%)
  - Price elasticity modeling
  - Demand impact prediction
- **Side-by-Side Comparison:** Compare multiple scenarios simultaneously
- **Recommendations:** Clear Proceed/Review recommendations based on impact

## F6: Advanced Trend Analysis
**Description:** Deep trend analysis with seasonality detection.
**Key Capabilities:**
- **Linear Regression Trends:** Trend direction, slope, R² strength
- **Statistical Significance:** P-value testing for trend validity
- **Percentage Change:** Start-to-end percentage change calculation
- **Seasonality Detection:** Monthly/weekly pattern identification
- **Visualization:** Trend line overlay on time-series charts
- **Pattern Strength:** Strong/moderate/weak classification

## F7: AI-Powered Business Insights
**Description:** Integration with Hugging Face Inference API for automated insights.
**Key Capabilities:**
- **Revenue Insights:** Strategic recommendations based on revenue trends
- **Budget Analysis:** Efficiency analysis and optimization suggestions
- **Trend Explanations:** Natural language explanations of sales patterns
- **Anomaly Interpretation:** Context-aware explanations of detected anomalies
- **Scenario Impact Analysis:** Business implications of simulated scenarios
- **Fallback Mechanism:** Template-based insights when API is unavailable

## F8: Interactive Data Visualizations
**Description:** Rich, interactive charts using Plotly Express.
**Key Capabilities:**
- **Bar Charts:** Revenue by region, category performance
- **Pie Charts:** Category share, regional distribution
- **Scatter Plots:** ROI analysis (Spend vs Revenue)
- **Line Charts:** Time-series trends, daily sales
- **Real-Time Updates:** Charts update based on data filters
- **Responsive Design:** Adapts to different screen sizes

## F9: Data Simulation & Testing
**Description:** Utility script for generating realistic sample data.
**Key Capabilities:**
- **Product Master Generation:** Configurable number of products with categories and brands
- **Sales Data Generation:** Time-series sales with realistic trends
- **Budget Data Generation:** Store budgets with YTD spending
- **Inventory Data Generation:** Stock levels for products
- **Consistent Relationships:** Maintains referential integrity across files
- **Configurable Parameters:** Customizable date ranges, store counts, product counts

## F10: Authentication & Security
**Description:** Secure user authentication with role-based access control.
**Key Capabilities:**
- **Password Hashing:** bcrypt for secure password storage
- **Session Management:** Streamlit session state for authenticated sessions
- **Role-Based Access:** Data filtering based on user role
- **Secure Logout:** Session clearing on logout
- **Demo Credentials:** Pre-configured demo users for testing

## F11: Extensible Architecture
**Description:** Modular design for easy extension and customization.
**Key Capabilities:**
- **Plugin-Like Tools:** Easy to add new analytics tools
- **Configurable Roles:** Simple role definition and access control
- **Modular Components:** Clear separation of concerns
- **API-Ready:** Structure supports future REST API integration
- **Database Migration Path:** Easy migration from CSV to database

## F12: Error Handling & User Experience
**Description:** Robust error handling and user-friendly interface.
**Key Capabilities:**
- **Clear Error Messages:** Descriptive error messages with available options
- **Loading Indicators:** Spinner animations during processing
- **Graceful Degradation:** Fallback mechanisms when services unavailable
- **Input Validation:** Query sanitization and validation
- **Helpful Guidance:** Example queries and usage instructions
