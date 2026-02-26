# Architecture — CricZone: Local Cricket Community Platform

## 1. High-Level Architecture
We use an **Event-Driven Microservices Architecture** to ensure real-time live scoring at < 3-second latency, cost-efficient scaling during metro India rollout, and independent deployability across 11 bounded-context services.

### Key Components:
- **API Gateway (Kong/NGINX + JWT):** Single entry point for Web Dashboard, Mobile App (Player/Fan/Scorer), and Store Owner Portal. Handles auth validation, rate limiting, and routing.
- **Live Scoring Service:** Core real-time engine — accepts ball-by-ball input from Scorer, maintains scorecard state in Redis, pushes updates to fans via WebSocket.
- **Tournament Management Service:** Full tournament lifecycle — creation, team registration, fixture scheduling (auto + manual), points table computation.
- **Player Analytics & AI Service:** Aggregates career statistics post-match; computes Player Performance Score (PPS, 0–100 composite index); generates AI insights.
- **Notification Service:** Multi-channel event-driven delivery — FCM Push, WhatsApp Business API (India-first), SMS, and Email — triggered by Kafka events.
- **Sponsorship Matching Service (AI):** Matches local tournaments with relevant sponsors using geo + category + audience scoring algorithm.
- **Store & Offers Service:** Geo-indexed discovery of nearby cricket stores; QR-based offer redemption.
- **Community & Social Service:** Player/Fan community feed, posts, polls, leaderboards, auto-generated match summary posts.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile App** | React Native | Single codebase for Android + iOS; critical in India where Android dominates but iOS is aspirational |
| **Web Dashboard** | React.js | Organizer and Admin management portal |
| **Backend Services** | Node.js (Express) | I/O-optimized for REST + WebSocket APIs; suits live scoring concurrency |
| **AI Services** | Python (FastAPI) | Best ML/data science ecosystem; PPS algorithm and sponsor matching |
| **Event Backbone** | Apache Kafka | Decouples Live Scoring from Analytics, Notifications, and Reporting — ensures scoring HA independently |
| **Real-Time Push** | Redis Pub/Sub + WebSocket | Live scorecard fan updates (< 3s); scorecard cache (< 50ms reads) |
| **Primary Database** | PostgreSQL + PostGIS | Relational data + geo-spatial store locator queries — one DB, lower ops cost |
| **CDN** | CloudFront / Cloudflare | Static assets, stat card images, exported PDFs — reduces origin server load ~60% |
| **Push Notifications** | Firebase FCM | Android/iOS push; WhatsApp Business API as fallback (500M+ India users) |
| **Payments** | Razorpay / UPI | Ground booking fees; standard in Indian consumer apps |
| **Auth** | Firebase Phone Auth (OTP) + JWT | Managed OTP delivery; avoids custom OTP infra during pre-revenue MVP phase |

---

## 3. Communication Patterns

- **Synchronous (REST):** User-initiated actions requiring immediate responses — e.g., `POST /matches/{id}/score/ball` → Live Scoring Service; `GET /stores/nearby` → Store Service.
- **Asynchronous (Kafka Events):** Decoupled side effects and data pipelines — e.g., `MatchCompleted` → consumed by Player Analytics (update stats), Community Service (auto-post summary), Notification Service (push result to fans), Reporting Service (generate match report).
- **Real-Time (WebSocket):** Live scorecard push — Scorer records a ball → Redis pub/sub → WebSocket broadcast to all fans watching the match (< 3-second end-to-end).
- **Mobile Push (FCM + WhatsApp):** Event-triggered fan alerts — wicket notifications, match start alerts, offer announcements. WhatsApp is the secondary channel as India's default async communication layer.

---

## 4. Guiding Patterns & Principles

### A. CQRS (Command Query Responsibility Segregation)
- **Why:** Live Scoring writes are latency-critical (ball-by-ball, every 30 seconds). Analytics and reporting reads are heavy (career stats, tournament reports, media API).
- **Benefit:** `LiveScoringService` is the optimized write path. `PlayerAnalyticsService` and `ReportingService` are separate read-optimized services updated asynchronously — analytics queries never degrade live scoring write performance.

### B. Event Sourcing (Ball Events)
- **Why:** Every ball in a cricket match must be auditable and replayable — scorer corrections, dispute resolution, historical analysis.
- **Benefit:** The `ball_events` table is the source of truth. Scorecards, batting cards, and bowling cards are all derived by replaying ball events — enabling reliable undo, mid-match corrections, and full match replay.

### C. Saga Pattern (Tournament Registration)
- **Why:** Team registration spans multiple steps: team submission → organizer approval → fixture generation → notification delivery — across multiple services.
- **Benefit:** Each step publishes an event; downstream services react independently. If fixture generation fails, registration approval is not rolled back — the saga retries fixture generation without losing the approval state.

### D. Optimistic Concurrency (Ground Booking)
- **Why:** Two organizers might attempt to book the same ground slot simultaneously.
- **Benefit:** The first commit wins; the second receives a `409 CONFLICT` "Slot no longer available." A version token on each booking slot prevents race conditions without pessimistic locking.

### E. Circuit Breaker (External APIs)
- **Why:** CricZone depends on external services — Razorpay (payments), Google Maps (geo-search), Firebase (OTP + notifications), WhatsApp Business API.
- **Benefit:** If Razorpay is unreachable, the ground booking service queues the intent and retries — the platform remains operational. If WhatsApp API is down, Notification Service falls back to SMS automatically.
