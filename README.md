# CricZone — Local Cricket Community Platform: Design Kata

## Overview
This design kata models **CricZone**, a community cricket super-app that brings organization and recognition to local cricket games across Indian metro cities. Inspired by **ESPN's live scoring ecosystem** (US model) and **WeChat's super-app engagement mechanics** (China model), CricZone delivers real-time live scoring, player performance analytics, nearest cricket store discovery with offers, sponsorship matchmaking, and tournament management — in a single, cost-conscious, mobile-first platform.

---

## Documentation Index

### 1. Requirements & Business Analysis
- **[FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md)**: 11 Functional Requirements (User Registration, Tournament Management, Ground Booking, Live Scoring, Player Analytics, Store Locator, Sponsorship, Community, Notifications, Media Reporting, Admin) + 7 Non-Functional Requirements.
- **[ACTORS_AND_USE_CASES.md](./ACTORS_AND_USE_CASES.md)**: 10 Actors (Player, Organizer, Fan, Scorer, Store Owner, Sponsor, Admin + 3 automated) and 12 detailed Use Cases with Mermaid use case diagram.

### 2. Architecture & Microservices
- **[MICROSERVICES.md](./MICROSERVICES.md)**: 11 Microservices with DDD bounded context identification, service responsibilities, owned data, key APIs, event flows (Kafka), and inter-service communication patterns (REST, Kafka, WebSocket, FCM).

### 3. Technical Diagrams
- **[SEQUENCE_DIAGRAMS.md](./SEQUENCE_DIAGRAMS.md)**: 4 Sequence Diagrams — Player Registration, Ball-by-Ball Live Scoring & Fan Update, Tournament Creation & Team Registration, Sponsor Match & Branding Activation.
- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)**: 5 bounded-context class diagrams — Identity & Access (User, KYC, Session), Tournament (Tournament, Fixture, PointsTable), Live Match (Innings, BallEvent, BattingCard, BowlingCard), Player Analytics (CareerStats, PPS, AIInsight), Commerce (Store, Offer, Post, Sponsorship).
- **[ER_DIAGRAM.md](./ER_DIAGRAM.md)**: Full ERD with 20 table definitions (PostgreSQL + PostGIS), column specs, relationships, and strategic indexes including geo-spatial index for Store Locator.
- **[STATE_DIAGRAM.md](./STATE_DIAGRAM.md)**: 5 State machines — Match, Tournament, Ground Booking, Offer, and Sponsorship Deal lifecycles.
- **[ACTIVITY_DIAGRAM.md](./ACTIVITY_DIAGRAM.md)**: 4 Activity workflows — Tournament Setup & Scheduling, Ball-by-Ball Live Scoring, Player Analytics Update, Store Offer Discovery & Redemption.
- **[FLOWCHART.md](./FLOWCHART.md)**: 4 Decision flowcharts — Match Result Decision Engine, PPS Calculation, Sponsor Matching Algorithm, Notification Routing.
- **[OBJECT_DIAGRAM.md](./OBJECT_DIAGRAM.md)**: 3 Runtime object snapshots — Live Match In Progress, Tournament Registration (7/8 teams confirmed), Offer Redemption In Progress.

### 4. API & Integration
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)**: RESTful API definitions for 8 service areas (Auth, User, Tournament, Live Scoring, Player Analytics, Store & Offers, Sponsorship, Community) with JSON request/response examples and standard error format.

### 5. QA & Testing
- **[TEST_STRATEGY.md](./TEST_STRATEGY.md)**: 60+ test cases mapped to FRs, API test specs, integration test plan (4 E2E flows), performance/load profiles, security tests (OWASP Top 10), 10 edge cases, and acceptance criteria.

### 6. Guiding Principles
- **[GUIDING_PRINCIPLES.md](./GUIDING_PRINCIPLES.md)**: Concrete application of SOLID, KISS, and YAGNI with CricZone-specific examples, cricket-domain analogy explanations, comparison tables, and design rationale.

### 7. Presentation Resources
- **[PRESENTATION_SCRIPT.md](./PRESENTATION_SCRIPT.md)**: Specialized script for the 'Class Diagram' and 'Technology Stack' slides with technical rationale for bounded contexts, JSONB choices, India-specific WhatsApp notifications, and cost-conscious architecture decisions.

---

## Key Design Highlights

- **India-First Mobile Architecture:** OTP-based auth (Aadhaar-friendly), WhatsApp Business API as notification fallback (500M Indian users), UPI/Razorpay for payments — every choice mirrors how top Indian consumer apps (CRED, Meesho, Swiggy) are built.
- **US Model Inspiration (ESPN):** Live ball-by-ball push notifications for milestones and wickets; Cricinfo/Baseball Reference-style comprehensive statistics portal; deep-linking from notifications to live scorecards.
- **China Super-App Inspiration (WeChat/Douyin):** In-app tournament registration flow (Mini Program analogy), auto-generated shareable player stat cards for WhatsApp/social, short video-ready highlight hooks in the community feed architecture.
- **Event-Driven Architecture:** Kafka backbone decouples live scoring from analytics, notifications, and reporting — scoring continues even if analytics service is unavailable.
- **11 Microservices (DDD):** Decomposed by bounded context with clear team ownership, independent data stores, and async communication. Live Scoring is isolated for independent high-availability scaling.
- **AI-Powered Features:** Player Performance Score (PPS) — composite 0–100 index updated post-match; AI sponsorship matching algorithm (geography + audience + budget scoring); AI text commentary generation for each ball event.
- **Cost-Conscious MVP:** Managed services (Firebase Auth, Razorpay, CloudFront CDN) over self-hosted infrastructure. Target: < ₹50,000/month operational cost during metro India pilot (6 months pre-revenue).
- **Phased Rollout:** Feature flags enable city-by-city expansion from metro launch (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Pune) to national scale — no architecture changes needed.

---

## Status
- **Version:** 1.0
- **Status:** Design Complete
- **Target Market:** Metro India (Phase 1); Pan-India (Phase 2)
- **Last Updated:** February 2026
