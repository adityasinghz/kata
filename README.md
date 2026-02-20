# Mitra Finance — AI-Powered Rural Financial Inclusion Platform

> **Architecture Kata** — A comprehensive system design for a voice-first, offline-capable lending platform empowering Bank Mitras to serve India's 650M+ unbanked rural citizens.

## 🎯 Problem Statement

A fintech startup is building a platform to connect **Bank Mitras (BC Agents)** with **New-to-Credit rural customers** across Tier 2/3 India. The platform must support:
- AI-assisted KYC and loan origination with **zero literacy requirements**
- Credit scoring for customers with **no CIBIL history**
- **100% offline functionality** in areas with no internet connectivity
- Support for **12+ Indian dialects** via voice-first interaction

---

## 📋 Quick Start

### What is Mitra Finance?

Mitra Finance enables a Bank Mitra to:
- **Onboard rural customers** using Aadhaar OTP + biometric KYC — with 4-level fallback for edge cases
- **Conduct a voice credit interview** in the customer's local dialect using on-device AI (IndicASR + LangChain + Sarvam AI)
- **Generate an AI credit score** based on MGNREGA records, utility bills, and agricultural data — no CIBIL required
- **Submit loan applications offline** — stored in encrypted SQLite, synced automatically when connectivity returns

### Rama Devi's Journey (Example Customer)
> Bihar farmer. No CIBIL score. No bank branch for 28km. Needs ₹15,000 for seeds.
>
> → Bank Mitra visits with Android tablet. Aadhaar OTP KYC. On-device AI interview in Bhojpuri. Alt credit score: 672 (MEDIUM). Submitted offline. Hours later, synced and approved. ₹15,000 in Jan Dhan account. At 14% APR.

### Key Metrics
| Metric | Target |
|--------|--------|
| Loan origination time | < 15 minutes |
| Offline operations | 100% core functionality |
| Dialects supported | 12 at launch, 22 by Year 2 |
| AI credit score AUC | > 0.75 (validation) |
| Biometric KYC time | < 60 seconds |
| App load on 3G | < 5 seconds |

---

## 📚 Documents

### Core Documents
| Document | Description |
|----------|-------------|
| [KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md) | 10 FRs + 6 NFRs + Requirements Traceability Matrix |
| [BUSINESS_PERSPECTIVE.md](./BUSINESS_PERSPECTIVE.md) | Market analysis, TAM/SAM/SOM, revenue model, real-world analogues (Eko, FINO, KreditBee) |
| [ACTORS_AND_USE_CASES.md](./ACTORS_AND_USE_CASES.md) | 7 actors, 11 use cases, Mermaid use-case diagram |
| [FEATURES.md](./FEATURES.md) | 13 features with user stories, acceptance criteria, tech specs, 3-phase roadmap |

### Technical Design
| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level, offline-first, AI component diagrams + tech stack + 10 design patterns + security |
| [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) | Domain, AI/Scoring, Offline/Sync, Service, and Infrastructure layers |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Cloud PostgreSQL schema (10 tables) + On-device SQLite schema + ERD + indexes |
| [SEQUENCE_DIAGRAMS.md](./SEQUENCE_DIAGRAMS.md) | 6 key flows: KYC, AI Interview, Loan + Alt Scoring, Offline Sync, Approval Workflow, DPDP Consent |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | 9 REST API sections with full JSON request/response examples |

### Specialized Documents
| Document | Description |
|----------|-------------|
| [SECURITY_DESIGN.md](./SECURITY_DESIGN.md) | Biometric fallback chain, DPDP Act 2023 compliance, encryption map, KYC/AML, RBAC |
| [AGENTS_AND_AI.md](./AGENTS_AND_AI.md) | ASR pipeline, LangChain interview agent, alt credit scoring engine, model governance, bias audits |
| [OFFLINE_SYNC_STRATEGY.md](./OFFLINE_SYNC_STRATEGY.md) | Store-and-Forward queue design, conflict resolution, sync storm handling (10K Mitras) |
| [EDGE_CASES.md](./EDGE_CASES.md) | 23 edge cases across 8 categories — Jury Q&A shield with architecture-grounded answers |

### Presentation
| Document | Description |
|----------|-------------|
| [PRESENTATION_SCRIPT.md](./PRESENTATION_SCRIPT.md) | 3–4 minute read-aloud script + Q&A cheat sheet |

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native (Expo Bare) |
| **On-Device AI** | ONNX Runtime (IndicASR, Phi-2, XGBoost, IndicTTS) |
| **Local DB** | SQLite + SQLCipher (AES-256) |
| **API Gateway** | Kong (mTLS + JWT) |
| **Backend** | Go (Golang) — Core services; Node.js BFF |
| **AI Orchestration** | LangChain + Sarvam AI Saaras (India-first LLM) |
| **Credit Scoring** | XGBoost + LightGBM Ensemble (SHAP explainability) |
| **Event Backbone** | Apache Kafka |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis Cluster |
| **Storage** | AWS S3 (ap-south-1 — India data residency) |
| **Infrastructure** | Kubernetes (EKS) + SQS (sync storm buffer) |
| **Sync Protocol** | Protocol Buffers (delta sync, 5× smaller than JSON) |
| **Monitoring** | Prometheus + Grafana + OpenTelemetry + Jaeger |

---

## 🔐 Key Design Patterns

1. **Offline-First** — SQLite is the primary state; cloud is eventual sync target
2. **Store-and-Forward** — Priority queue with idempotent server ingestion
3. **Saga Pattern** — Distributed loan approval → disbursement orchestration
4. **Circuit Breaker** — Per-external-API (UIDAI, MGNREGA, Agri) with graceful degradation
5. **CQRS** — Loan writes to PostgreSQL; reads from Elasticsearch
6. **Event Sourcing** — Immutable loan lifecycle audit trail
7. **Strategy Pattern** — Credit scoring: online (full features) vs. offline (interview-only)
8. **Template Method** — Loan workflow FSM with hot-reloadable routing rules
9. **Adapter Pattern** — Unified interface for UIDAI, ABHA, Credit Bureaus
10. **Decorator Pattern** — Consent layer wraps every data service call (DPDP compliance)

---

## 🌍 Real-World Analogues

| Platform | What We Learned |
|---------|----------------|
| **Eko India** (150K+ BC agents) | Agent-first model; AePS design; retailer-as-bank-branch |
| **FINO Payments Bank** (700K+ points) | Offline POS design; hybrid connectivity; rural cash management |
| **KreditBee / Moneyview** | Alt credit scoring; thin-file borrowers; mobile-first loan origination |
| **NPCI FiMI** | India-built AI for financial workflows; sovereign LLM approach |
| **Shriram Finance** | Multi-lingual, cloud-native platform for Tier 2/3 cities |

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
