# TrendMart Retail - Unified Business Intelligence Dashboard - Design Kata

## Overview
This design kata models a **Production-Ready Business Intelligence Dashboard** for TrendMart Retail Ltd. The system provides role-based analytics, AI-powered insights, natural language querying, anomaly detection, and scenario simulation capabilities. Built with Python/Streamlit for rapid deployment and extensibility.

## Documentation Index

### 1. Requirements & Business Analysis
- **[KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md)**: 8 Core requirements (ETL Pipeline, RBAC, AI Insights, etc.).
- **[BUSINESS_PERSPECTIVE.md](./BUSINESS_PERSPECTIVE.md)**: Market analysis, ROI models, and value proposition.
- **[ACTORS_AND_USE_CASES.md](./ACTORS_AND_USE_CASES.md)**: Primary actors (CCO, Finance Manager, Store Manager) and detailed use case flows.
- **[FEATURES.md](./FEATURES.md)**: Detailed feature specifications (Role-based Dashboards, AI Chat, Anomaly Detection, Scenario Simulation).

### 2. Technical Architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Modular Python architecture, tech stack, and design patterns (MVC, Strategy, Factory).
- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)**: Domain model showing relationships between DataLoader, AuthManager, BIAgent, and Analytics Tools.
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**: Data model including CSV schemas, unified data model, and data flow.
- **[SEQUENCE_DIAGRAMS.md](./SEQUENCE_DIAGRAMS.md)**: Sequence flows for Login, Data Loading, Query Processing, and Scenario Simulation.
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)**: RESTful API definitions for future API integration (Data Access, Analytics, AI Chat).

## Key Design Highlights
- **Role-Based Access Control (RBAC)**: Three distinct user roles with tailored dashboards and data access.
- **Natural Language Query Interface**: AI-powered chat interface for asking business questions in plain English.
- **Advanced Analytics**: Trend analysis, seasonality detection, anomaly detection, and scenario simulation.
- **Modular Architecture**: Clean separation of concerns (Data Layer, Business Logic, Presentation Layer).
- **Extensibility**: Easy to add new roles, metrics, visualizations, and AI capabilities.

## Status
- **Version:** 1.0
- **Status:** Design Complete
- **Last Updated:** January 2026
