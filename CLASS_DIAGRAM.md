# Class Diagram - TrendMart BI Dashboard

> **⚠️ Core Requirements**: Classes are designed around the core requirements defined in [KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md).

## Table of Contents
1. [Overview](#overview)
2. [Data Layer Classes](#data-layer-classes)
3. [Business Logic Layer Classes](#business-logic-layer-classes)
4. [Presentation Layer Classes](#presentation-layer-classes)
5. [Analytics Tools Classes](#analytics-tools-classes)
6. [Complete Class Diagram](#complete-class-diagram)

---

## Overview

The TrendMart BI Dashboard follows a **Modular Python Architecture**:

- **Data Layer**: Data loading and ETL operations (DataLoader)
- **Business Logic Layer**: Authentication, AI integration, query processing
- **Presentation Layer**: Streamlit UI components
- **Analytics Tools**: Modular analysis tools

---

## Data Layer Classes

```mermaid
classDiagram
    class DataLoader {
        -str data_dir
        -DataFrame product_master
        -DataFrame store_sales
        -DataFrame store_budget
        -DataFrame store_inventory
        -DataFrame unified_data
        +load_all_data() Dict[str, DataFrame]
        +create_unified_model() DataFrame
        +get_unified_data() DataFrame
        +filter_by_region(region) DataFrame
        +get_summary_stats() Dict
        -_calculate_derived_metrics(df) DataFrame
    }
```

---

## Business Logic Layer Classes

### Authentication & Authorization

```mermaid
classDiagram
    class AuthManager {
        -Dict users
        -str current_user
        +login(username, password) bool
        +logout() void
        +is_authenticated() bool
        +get_current_user() Dict
        +has_role_access(role) bool
        -_hash_password(password) str
        -_verify_password(password, hash) bool
    }
```

### AI Integration

```mermaid
classDiagram
    class AIInsightsGenerator {
        -str api_token
        -str model_name
        +generate_insights(summary, analysis_type) str
        -_call_huggingface_api(prompt) str
        -_generate_fallback_insights(summary, analysis_type) str
    }

    class BIAgent {
        -DataLoader data_loader
        -AIInsightsGenerator ai_generator
        -List conversation_history
        +chat(query, unified_data) Dict
        -_classify_query(query) str
        -_analyze_trends(query, data) Dict
        -_detect_anomalies(query, data) Dict
        -_simulate_scenario(query, data) Dict
        -_answer_data_question(query, data) Dict
        -_format_trend_response(query, results) str
        -_format_anomaly_response(query, results) str
        -_format_scenario_response(query, results) str
        -_extract_visualization_data(results, query_type) Dict
    }
```

---

## Analytics Tools Classes

```mermaid
classDiagram
    class TrendAnalysis {
        +extract_trends(df, date_col, value_col, method, period) Dict
        +detect_seasonality(df, date_col, value_col, period) Dict
        -_aggregate_by_period(df, date_col, value_col, period) DataFrame
        -_calculate_trend(df, date_col, value_col, method, period) Dict
        -_calculate_seasonality_strength(values) str
    }

    class AnomalyDetection {
        +detect_anomalies(df, date_col, value_col, method, threshold) Dict
        +get_anomaly_summary(df, metric, include_multivariate) Dict
        -_detect_anomalies_pandas(df, date_col, value_col, method, threshold) Dict
        -_calculate_anomalies(df, date_col, value_col, method, threshold) Dict
    }

    class ScenarioSimulation {
        +simulate_promotion(df, discount_pct, duration_days, price_elasticity) Dict
        +simulate_price_change(df, price_change_pct, price_elasticity) Dict
    }
```

---

## Complete Class Diagram

```mermaid
classDiagram
    %% Data Layer
    class DataLoader {
        +load_all_data()
        +get_unified_data()
        +filter_by_region()
    }

    %% Business Logic
    class AuthManager {
        +login()
        +logout()
        +get_current_user()
    }

    class AIInsightsGenerator {
        +generate_insights()
    }

    class BIAgent {
        +chat()
        -_classify_query()
        -_analyze_trends()
        -_detect_anomalies()
        -_simulate_scenario()
    }

    %% Analytics Tools
    class TrendAnalysis {
        +extract_trends()
        +detect_seasonality()
    }

    class AnomalyDetection {
        +detect_anomalies()
        +get_anomaly_summary()
    }

    class ScenarioSimulation {
        +simulate_promotion()
        +simulate_price_change()
    }

    %% Relationships
    BIAgent --> DataLoader : uses
    BIAgent --> AIInsightsGenerator : uses
    BIAgent --> TrendAnalysis : uses
    BIAgent --> AnomalyDetection : uses
    BIAgent --> ScenarioSimulation : uses
    DataLoader --> DataFrame : creates
```

---

## Class Relationships

### Key Relationships

| Relationship | Description | Example |
|--------------|-------------|---------|
| **Composition** | Strong ownership | DataLoader → Unified DataFrame |
| **Association** | Usage dependency | BIAgent → DataLoader |
| **Dependency** | Tool usage | BIAgent → TrendAnalysis |
| **Aggregation** | Collection | DataLoader → Multiple DataFrames |

1. **DataLoader → Unified DataFrame**: Creates and maintains unified data model
2. **BIAgent → Analytics Tools**: Dynamically selects and uses appropriate tools
3. **AuthManager → User Sessions**: Manages authentication state
4. **AIInsightsGenerator → Hugging Face API**: External service integration
