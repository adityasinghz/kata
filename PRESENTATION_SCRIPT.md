# Presentation Script — CricZone: Local Cricket Community Platform

> Specialized presentation script for the **Class Diagram** and **Technology Stack** slides, designed for a 5-minute technical walk-through segment.

---

## Slide: Class Diagram Walk-Through

**[Opening — 30 seconds]**

"Let's walk through how the domain is structured. We've organized CricZone into five bounded contexts using Domain-Driven Design — Identity, Tournament, Live Scoring, Player Analytics, and Commerce. Each context owns its classes, preventing the 'God Object' anti-pattern you see in monoliths."

---

**[Live Scoring Bounded Context — 60 seconds]**

"The most critical bounded context is Live Scoring. The `Match` class is the aggregate root — it owns its state machine: Scheduled → In Progress → Innings Break → Completed. Nested inside, we have `Innings`, and under that, `BallEvent` — one record per deliverable ball. This design is intentional.

Why separate `BallEvent`? Because it gives us complete auditability — you can replay the entire match ball-by-ball, or undo the last entry if the scorer makes a mistake.

`BattingCard` and `BowlingCard` are derived views computed from `BallEvent` rows. This follows the **Open/Closed Principle** — if we add a new event type, say a penalty run, we extend `BallEvent`, not `BattingCard` or `BowlingCard`."

---

**[Player Analytics Bounded Context — 45 seconds]**

"Moving to Player Analytics — `PlayerProfile` has a one-to-one relationship with `CareerStats`. Career stats are not calculated on the fly — they are **materialized views** updated after each `MatchCompleted` event. This is our CQRS pattern in action: heavy write operations in scoring, optimized read structure in analytics.

`PlayerPerformanceScore` is the AI output — a 0-to-100 composite index with component breakdowns. Notice it stores a JSONB field `componentScores`. Why JSONB? Because the components may evolve — today it's batting, bowling, fielding — tomorrow we might add a 'pressure match performance' coefficient. We store it flexibly without schema migrations."

---

**[Commerce Bounded Context — 30 seconds]**

"Finally, Commerce. The `Offer` class has `maxRedemptions` and `currentRedemptions` — two simple integers that implement the offer cap logic. We deliberately chose **not** to build a complex inventory service. YAGNI: We don't need inventory tracking, warehousing, or order management. Just offer discovery and QR-based redemption."

---

## Slide: Technology Stack Walk-Through

**[Backend Stack — 60 seconds]**

"The backend is built on **Node.js with Express** for most services — it's fast to write, excels at I/O-bound operations like our live scoring WebSocket and REST APIs. We use **Python** specifically for the Player Analytics and Sponsorship AI services — Python has the best ML library ecosystem and our team's data science expertise is in Python.

For communication: **Apache Kafka** is the event backbone. It decouples live scoring from analytics — if the analytics service is down, scoring continues uninterrupted. Events are replayed when the service comes back. This is critical for our 99.9% live scoring availability SLA.

**Redis** serves two roles: scorecard cache (live match state, < 50ms reads) and WebSocket pub/sub backbone for real-time fan updates."

---

**[Database Choices — 40 seconds]**

"We use **PostgreSQL** as the primary relational database. It supports JSONB for flexible fields like `branding_assets` and `component_scores`, plus **PostGIS** for geospatial queries in the Store Locator feature — no dedicated geo-database needed.

We deliberately chose NOT to use multiple databases. A startup-phase platform optimizes for team bandwidth over infrastructure complexity. One PostgreSQL cluster with PostGIS is our database. If TimescaleDB for ball_events time-series becomes necessary at scale, we can migrate the single table — not the entire architecture."

---

**[Mobile & Notifications — 30 seconds]**

"The mobile app is **React Native** — one codebase for Android and iOS. Critical for India's market where Android dominates but iOS is aspirational.

For notifications, **Firebase Cloud Messaging** handles push. But here's the India-specific design decision: **WhatsApp Business API** as the fallback. In India, WhatsApp has 500M+ users. Many cricket fans will turn off app notifications but will always see a WhatsApp message. This is how Meesho, CRED, and Swiggy all operate — it's the US equivalent of email + SMS but culturally adapted for India."

---

**[Cost-Conscious Architecture — 30 seconds]**

"The last thing I'll highlight is cost-consciousness — explicitly required in the problem statement. We use **Firebase Phone Auth** (managed OTP service, pay-per-use), **Razorpay** for payments (no payment infrastructure ownership), and **CloudFront** CDN for static assets. Our target is under ₹50,000/month operational cost during the metro MVP phase. Every infrastructure choice was evaluated through that lens."
