# Architecture - TrendMart BI Dashboard

## 1. High-Level Architecture
We use a **Modular Python Architecture** with clear separation of concerns, optimized for rapid development and easy extensibility.

### Key Components:
- **Presentation Layer (Streamlit):** Web-based UI with role-based dashboards and interactive visualizations
- **Business Logic Layer:** Core services for data processing, analytics, and AI integration
- **Data Layer:** ETL pipeline for loading and merging CSV data sources
- **Analytics Tools:** Modular tools for trend analysis, anomaly detection, and scenario simulation
- **AI Agent:** Natural language query processing with intelligent tool selection

## 2. Technology Stack
- **Frontend:** Streamlit (Python-based web framework)
- **Backend:** Python 3.8+ with pandas, numpy for data processing
- **Visualization:** Plotly Express for interactive charts
- **AI Integration:** Hugging Face Inference API (with fallback)
- **Authentication:** bcrypt for password hashing
- **Data Storage:** CSV files (easily migratable to database)
- **Deployment:** Local execution (can be containerized with Docker)

## 3. Communication Patterns
- **Synchronous (Function Calls):** Direct method calls within Python application
- **Event-Driven (Session State):** Streamlit session state for UI state management
- **Async (Future API):** RESTful API endpoints for external integrations (future enhancement)

## 4. Guiding Patterns & Principles

### A. Model-View-Controller (MVC) Pattern
- **Why:** Separates data model (DataLoader), business logic (Services), and presentation (Streamlit UI)
- **Benefit:** Easy to test, maintain, and extend individual components

### B. Strategy Pattern
- **Why:** Different analytics tools (trend, anomaly, scenario) can be swapped or extended
- **Benefit:** Easy to add new analysis types without modifying existing code

### C. Factory Pattern
- **Why:** Dynamic creation of analytics tools based on query type
- **Benefit:** Flexible tool selection in AI Agent

### D. Repository Pattern
- **Why:** DataLoader abstracts CSV file access
- **Benefit:** Easy to migrate to database without changing business logic

### E. Singleton Pattern
- **Why:** AuthManager and DataLoader instances shared across application
- **Benefit:** Consistent state and efficient resource usage

## 5. Module Structure

```
genAI_kata3/
├── src/
│   ├── data_loader.py          # Data Layer: ETL & Data Access
│   ├── auth.py                 # Authentication & RBAC
│   ├── ai_insights.py          # AI Integration (Hugging Face)
│   ├── ai_agent.py             # Natural Language Query Processing
│   ├── main_app.py             # Presentation Layer (Streamlit UI)
│   └── tools/                   # Analytics Tools
│       ├── trend_analysis.py
│       ├── anomaly_detection.py
│       └── scenario_simulation.py
├── data/                        # CSV Data Files
├── scripts/                     # Utility Scripts
└── arc_design/                  # Architecture Documentation
```

## 6. Data Flow

1. **Data Loading:** CSV files → DataLoader → Unified DataFrame
2. **User Authentication:** Login → AuthManager → Session State
3. **Query Processing:** User Query → BIAgent → Tool Selection → Analysis → Response
4. **Visualization:** Analysis Results → Plotly → Interactive Charts
5. **AI Insights:** Data Summary → AIInsightsGenerator → Hugging Face API → Formatted Insights

## 7. Security Considerations

- **Password Hashing:** bcrypt for secure password storage
- **Session Management:** Streamlit session state for authenticated sessions
- **Role-Based Access:** Data filtering based on user role
- **Input Validation:** Query sanitization and error handling
- **API Key Management:** Environment variables for sensitive credentials

## 8. Performance Optimizations

- **Lazy Loading:** Data loaded only when needed
- **Caching:** Session state caching for repeated queries
- **Efficient Data Processing:** Pandas vectorized operations
- **Async Processing:** Future enhancement for long-running analyses

## 9. Extensibility Points

- **New Roles:** Add role definitions in AuthManager
- **New Metrics:** Extend DataLoader with new derived metrics
- **New Visualizations:** Add new chart functions in main_app.py
- **New Analytics Tools:** Create new modules in tools/
- **New AI Models:** Extend AIInsightsGenerator with new models
