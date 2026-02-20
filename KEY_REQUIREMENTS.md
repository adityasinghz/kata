# Mitra Finance — Key Requirements

> **⚠️ Context**: Mitra Finance is an AI-powered, offline-first rural lending platform empowering Bank Mitras (BC Agents) to serve New-to-Credit rural populations across Tier 2/3 India. Security, compliance, and offline resilience are paramount.

## Table of Contents
1. [Overview](#overview)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Requirements Traceability Matrix](#requirements-traceability-matrix)

---

## Overview

Mitra Finance enables **10,000 Bank Mitras** to serve **5 million rural customers** through a voice-first, offline-capable mobile platform that conducts AI-assisted KYC, alternative credit scoring, and loan origination — all in local dialects without requiring literacy.

### Assumptions
1. Bank Mitras carry Android devices (6" screen, ≥ 3GB RAM) with intermittent 3G/4G connectivity
2. Customers are largely New-to-Credit — no CIBIL score available
3. Aadhaar-based eKYC is the primary identity verification mechanism (UIDAI integration)
4. Platform operates under RBI Business Correspondent guidelines
5. All data must be localized within India (data residency requirement)
6. Minimum 12 Indian dialects supported at launch

---

## Functional Requirements

### REQ-1: Assisted Loan Origination
- **Description**: Bank Mitra can capture customer details using OCR, voice input, and form fields on a mobile device, then submit a loan application that may be queued offline.
- **Priority**: P0 (Critical)
- **Details**:
  - OCR-based document capture (Aadhaar, PAN, utility bills, land records)
  - Low-bandwidth image compression before upload
  - Loan application form with offline-first save (SQLite)
  - Application status tracking (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED)
- **Success Criteria**: Mitra can complete a full application in under 15 minutes on 3G; application queues locally if offline
- **Maps To**: Feature F1, UC3, UC4

### REQ-2: Biometric Authentication & KYC
- **Description**: Customer identity verified via Aadhaar OTP + fingerprint biometric with graceful fallback mechanisms.
- **Priority**: P0 (Critical)
- **Details**:
  - Aadhaar OTP-based eKYC (UIDAI API integration)
  - Fingerprint biometric via device sensor or external USB scanner
  - Fallback: Face liveness check → Mitra supervisor sign-off
  - ABHA Health Record linkage (optional, with explicit consent)
  - KYC documents stored encrypted with consent-linked access
- **Success Criteria**: Primary KYC path completes in < 60 seconds; fallback path available in 100% of scenarios
- **Maps To**: Feature F2, UC1, UC2

### REQ-3: GenAI Voice Credit Interview
- **Description**: An AI agent conducts a structured credit interview with the customer in their local dialect via voice, transcribing and structuring responses for the credit engine.
- **Priority**: P0 (Critical)
- **Details**:
  - Automatic Speech Recognition (ASR) supporting 12+ Indian dialects
  - Dialect detection and auto-routing to correct model
  - Structured extraction: monthly income, expenses, livelihood type, assets
  - Confidence score per extracted field
  - Mitra can review and correct AI-extracted data before submission
- **Success Criteria**: AI correctly extracts income data with ≥ 85% accuracy; runs on 3G with < 5s response per turn
- **Maps To**: Feature F3, UC5

### REQ-4: Alternative Credit Risk Scoring
- **Description**: AI engine scores creditworthiness using non-traditional data, replacing CIBIL dependency for New-to-Credit customers.
- **Priority**: P0 (Critical)
- **Details**:
  - Input signals: Utility bill payment history, MGNREGA work records, agricultural data (drought/flood reports, crop patterns), mobile recharge frequency, self-declared income from voice interview
  - Output: Risk Score (300–850 scale), risk band (LOW/MEDIUM/HIGH), recommended loan amount, recommended tenure
  - Explainability: Top 3 factors driving score shown to Credit Officer
  - Model retrained quarterly using repayment outcomes
- **Success Criteria**: Score generated in < 10 seconds; AUC > 0.75 on validation set; scoring available offline (cached model)
- **Maps To**: Feature F4, UC6

### REQ-5: Offline-First Operations
- **Description**: 100% core functionality available during network outages; data syncs automatically when connectivity is restored.
- **Priority**: P0 (Critical)
- **Details**:
  - Local SQLite database on device for all pending operations
  - Store-and-Forward queue for: KYC submissions, loan applications, document uploads
  - Conflict detection and resolution on sync
  - Sync status indicator in UI (Pending: 3 items / Last sync: 10 min ago)
  - Biometric verification cached (token-based) for 8 hours offline
- **Success Criteria**: Mitra can onboard a customer and submit a loan application with zero network; all data uploaded within 60 seconds of network restoration
- **Maps To**: Feature F5, UC7

### REQ-6: Multi-Lingual Voice Interface
- **Description**: The Mitra app uses voice as the primary interaction channel, supporting 12+ Indian dialects for both the AI credit interview and the Mitra's own navigation.
- **Priority**: P0 (Critical)
- **Details**:
  - Supported dialects at launch: Hindi, Bengali, Telugu, Marathi, Tamil, Kannada, Gujarati, Odia, Punjabi, Assamese, Maithili, Bhojpuri
  - Text-to-Speech (TTS) for all UI instructions and interview questions
  - Mitra can switch dialect mid-session
  - Voice commands for navigation (e.g., "अगला ग्राहक" = Next Customer)
- **Success Criteria**: 12 dialects supported at launch; dialect switch takes < 2 seconds; TTS intelligible for rural dialects
- **Maps To**: Feature F6, UC5

### REQ-7: Loan Workflow Engine & Approval Routing
- **Description**: Loan applications are automatically routed to appropriate Credit Officers based on loan amount, risk band, and geography. Configurable multi-level approval workflow.
- **Priority**: P0 (Critical)
- **Details**:
  - Auto-approval for low-risk, low-amount loans (configurable threshold)
  - Level-1 Credit Officer review for medium-risk loans
  - Level-2 Regional Manager approval for high-value loans
  - SLA timers per approval level with escalation
  - Approval/rejection reason codes (mandatory)
- **Success Criteria**: Auto-approval decisions in < 30 seconds; Level-1 review SLA: 4 hours; Level-2 SLA: 24 hours
- **Maps To**: Feature F7, UC8

### REQ-8: DPDP Act Compliance & Consent Management
- **Description**: All customer data collection, processing, and sharing governed by granular, revocable, and time-bound consent per the Digital Personal Data Protection Act 2023.
- **Priority**: P0 (Critical)
- **Details**:
  - Granular consent per data type (biometric, financial, health records)
  - Consent captured in local language with voice confirmation
  - Consent records stored as immutable audit log
  - Customer can revoke consent at any time via Mitra
  - Data deletion request (Right to Erasure) workflow
  - Consent expiry with auto-renewal prompts
- **Success Criteria**: No data processed without explicit consent; full audit trail of all consent events; revocation processed within 72 hours
- **Maps To**: Feature F8, UC9

### REQ-9: Alert & Notification System
- **Description**: Targeted alerts to Mitras, Credit Officers, and customers via SMS, push notifications, and WhatsApp.
- **Priority**: P1 (High)
- **Details**:
  - Loan status change notifications to Mitra + Customer
  - EMI reminders via WhatsApp voice messages in local dialect
  - KYC expiry alerts (30/7/1 day before expiry)
  - Sync failure alerts to Mitra when pending queue exceeds threshold
  - Configurable escalation for overdue loan SLAs
- **Success Criteria**: Critical alerts delivered within 60 seconds; SMS fallback when push fails; WhatsApp delivery rate > 90%
- **Maps To**: Feature F9, UC10

### REQ-10: Admin & Compliance Controls
- **Description**: RBI-compliant admin controls for user management, Mitra performance monitoring, AI rule configuration, and regulatory reporting.
- **Priority**: P1 (High)
- **Details**:
  - Mitra onboarding with document verification
  - Mitra performance dashboard (applications/day, approval rates, repayment rates)
  - KYC/AML watchlist screening integration
  - Loan portfolio reports for RBI submissions
  - AI model audit trail (which model version scored which loan)
  - Role-based access control (Mitra, Credit Officer, Regional Manager, Compliance, Admin)
- **Success Criteria**: All regulatory reports exportable in RBI-specified format; RBAC enforced at API level
- **Maps To**: Feature F10, UC11

---

## Non-Functional Requirements

### NFR-1: Availability & Graceful Degradation
- **Target**: 99.5% server uptime; 100% Mitra functionality during network outage (offline-first)
- **Degradation modes**: No connectivity → full offline; Intermittent → sync on reconnect; Server down → read-only + queue writes

### NFR-2: Performance
- **App Load Time**: < 5 seconds on 3G (4Mbps) connection
- **API Response**: < 2 seconds at p95
- **Credit Score Generation**: < 10 seconds end-to-end
- **Voice ASR Response**: < 3 seconds per utterance

### NFR-3: Scalability
- **Users**: 10,000 Bank Mitras + 5 million rural customers
- **Concurrent Mitras**: Support 5,000 simultaneous sessions
- **Loan Applications**: 100,000 applications/day at peak

### NFR-4: Security & Compliance
- **Encryption**: AES-256 at rest; TLS 1.3 in transit; device-level encryption for SQLite
- **Authentication**: Aadhaar OTP + biometric MFA; TOTP fallback for Mitras
- **Compliance**: DPDP Act 2023, RBI BC Guidelines, KYC Master Directions, AML/CFT

### NFR-5: Accessibility & Literacy
- **Voice-First**: All critical flows completable via voice alone
- **Low-Literacy Mode**: Icon-based UI with voice labels; no mandatory text reading
- **Bandwidth**: Core app < 20MB download; document uploads compressed to < 500KB

### NFR-6: Data Residency
- **India-only storage**: No customer PII or financial data leaves Indian data centers
- **Aadhaar data**: Not stored; only tokenized reference (VID — Virtual ID)
- **Audit logs**: Retained 7 years per RBI requirements

---

## Requirements Traceability Matrix

| Requirement | Features | Use Cases | Architecture Components |
|-------------|----------|-----------|------------------------|
| REQ-1 (Loan Origination) | F1 | UC3, UC4 | LoanOriginationService, OCR Engine, OfflineQueue |
| REQ-2 (Biometric KYC) | F2 | UC1, UC2 | AuthService, AadhaarAdapter, BiometricService, ABHAAdapter |
| REQ-3 (GenAI Interview) | F3 | UC5 | ASRService, DialectNLPAgent, LLMOrchestrator |
| REQ-4 (Alt Credit Scoring) | F4 | UC6 | CreditScoringEngine, AltDataPipeline, MLModelRegistry |
| REQ-5 (Offline-First) | F5 | UC7 | SyncService, LocalSQLiteDB, StoreAndForwardQueue |
| REQ-6 (Voice Interface) | F6 | UC5 | TTSService, DialectRouter, VoiceCommandHandler |
| REQ-7 (Loan Workflow) | F7 | UC8 | LoanWorkflowEngine, ApprovalRouter, SLAMonitor |
| REQ-8 (Consent/DPDP) | F8 | UC9 | ConsentService, DataDeletionService, AuditLogger |
| REQ-9 (Notifications) | F9 | UC10 | NotificationService, WhatsAppGateway, SMSGateway |
| REQ-10 (Admin/Compliance) | F10 | UC11 | AdminService, ComplianceReportingService, AMLScreener |

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
