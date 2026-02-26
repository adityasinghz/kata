# Guiding Principles — CricZone: Local Cricket Community Platform

> This document demonstrates how **SOLID**, **KISS**, and **YAGNI** principles are applied concretely to the CricZone platform's design decisions.

## Table of Contents
1. [SOLID Principles](#solid-principles)
2. [KISS — Keep It Simple, Stupid](#kiss--keep-it-simple-stupid)
3. [YAGNI — You Aren't Gonna Need It](#yagni--you-arent-gonna-need-it)
4. [Summary Matrix](#summary-matrix)

---

## SOLID Principles

### S — Single Responsibility Principle (SRP)

> *"A class/service should have one, and only one, reason to change."*

**Application in Design:**

| Component | Responsibility | What It Does NOT Do |
|-----------|---------------|-------------------|
| `LiveScoringService` | Capture ball events, compute scorecard state, cache live score | Does NOT calculate career stats or player rankings |
| `PlayerAnalyticsService` | Aggregate career stats, compute PPS, generate AI insights | Does NOT send notifications (delegates to `NotificationService`) |
| `NotificationService` | Multi-channel delivery (Push/WhatsApp/SMS/Email) | Does NOT decide what events to notify — event-driven from Kafka |
| `SponsorshipMatchingService` | Run AI matching algorithm between tournaments and sponsors | Does NOT manage deals, contracts, or branding — that is `SponsorshipService` |

**Concrete Example:**
```
❌ Bad: LiveScoringService.recordBall() also updates player career stats
        and sends push notifications to fans.

✅ Good: LiveScoringService publishes "MatchCompleted" to Kafka.
         PlayerAnalyticsService consumes it to update career stats.
         NotificationService consumes it to send push notifications.
```
**Benefit:** When we change how PPS is calculated (new AI model), only `PlayerAnalyticsService` changes. Scoring logic, notifications — all untouched.

---

### O — Open/Closed Principle (OCP)

> *"Software entities should be open for extension, but closed for modification."*

**Application in Design:**

1. **Notification Channels**: New channels (Telegram, Signal, In-App banner) are added by implementing a `NotificationChannel` interface — no changes to existing `NotificationService` routing logic.

```
Interface: NotificationChannel
├── FCMPushChannel (existing — Android/iOS)
├── WhatsAppChannel (existing — India-first)
├── SMSChannel (existing — Twilio/MSG91)
├── EmailChannel (existing)
└── TelegramChannel (NEW — added without modifying existing code)
```

2. **PPS Scoring Algorithm**: The `PlayerAnalyticsService` uses a pluggable `PPSStrategy` interface. Replacing the PPS formula (e.g., adding fielding weight) requires a new `PPSStrategy` implementation — existing code unchanged.

3. **Extra Type Detection in Scoring**: New extra types (e.g., Penalty runs from DRS) are added by extending an `ExtraType` enum and adding a handler — the core ball event recording loop stays unchanged.

---

### L — Liskov Substitution Principle (LSP)

> *"Subtypes must be substitutable for their base types."*

**Application in Design:**

1. **Tournament Formats**: All tournament formats (T20, ODI, Box Cricket, One-Day League) are configured via a `TournamentFormat` enum and a `FormatConfig` object (overs, innings count, powerplay rules). The scheduler, scoring engine, and analytics modules work uniformly with any format.

2. **Notification Channels**: Any `NotificationChannel` implementation can be substituted. Whether we send Push, WhatsApp, or SMS, the calling code in `NotificationService` does not change — it calls `channel.send(message)` uniformly.

---

### I — Interface Segregation Principle (ISP)

> *"Clients should not be forced to depend on interfaces they do not use."*

**Application in Design:**

1. **Role-Specific API Views**: Instead of one monolithic `/dashboard`, we expose:
   - `GET /analytics/kpis` — Organizer tournament stats
   - `GET /players/{id}/stats` — Player self-service + Fan view
   - `GET /sponsorships/{id}/roi` — Sponsor-only ROI dashboard
   - `GET /stores/{id}/offers` — Fan/Player offer browsing

   A Fan app never needs to call `/sponsorships/{id}/roi`. A Scorer never calls Store APIs.

2. **Kafka Topic Subscriptions**: Services subscribe only to events they need:
   - `NotificationService` → subscribes to `WicketFallen`, `MatchCompleted`, `OfferPublished`
   - `PlayerAnalyticsService` → subscribes to `MatchCompleted` only
   - `CommunityService` → subscribes to `MatchCompleted` (auto-post match summary)
   - `ReportingService` → subscribes to `MatchCompleted`, `TournamentStarted`

   No service processes events it doesn't care about.

---

### D — Dependency Inversion Principle (DIP)

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions."*

**Application in Design:**

1. **Geo-Search Provider**: `StoreService` depends on a `GeoSearchProvider` interface, not directly on Google Maps. This allows swapping to Mapbox or HERE Maps without changing store discovery logic.

```
StoreService
    → depends on → GeoSearchProvider (interface)
                       ├── GoogleMapsGeoProvider (implementation)
                       ├── MapboxGeoProvider (implementation)
                       └── MockGeoProvider (for testing)
```

2. **Payment Gateway**: `GroundBookingService` depends on a `PaymentGateway` interface. Razorpay's implementation can be swapped for PayU or Cashfree without changing booking business logic.

3. **AI PPS Engine**: `PlayerAnalyticsService` calls a `PPSCalculator` interface. The underlying model (rule-based v1 → ML-based v2) is swapped by registering a new implementation. Business analytics code stays unchanged.

---

## KISS — Keep It Simple, Stupid

> *"Most systems work best if they are kept simple rather than made complicated."*

### KISS Applications

| Decision | Simple Choice | Avoided Complexity |
|----------|--------------|-------------------|
| **Live Score Delivery** | WebSocket push from Live Scoring Service via Redis pub/sub | Avoided Server-Sent Events + Long Polling + WebSocket trio — single protocol is enough |
| **PPS v1 Algorithm** | Weighted rule-based formula (Batting 40% + Bowling 40% + Fielding 20%) | Avoided real-time neural network — a deterministic formula is transparent, debuggable, and sufficient for v1 |
| **Geo-Search** | PostGIS `ST_DWithin()` for radius queries | Avoided Elasticsearch geo-sharding — PostGIS on PostgreSQL is simpler and sufficient for city-scale data |
| **OTP Auth** | Firebase Phone Auth (managed) | Avoided building custom OTP generation and rate-limiting — use proven managed service |
| **Fixture Scheduling** | Prebuilt round-robin algorithm | Avoided ML-based schedule optimizer — cricket tournament scheduling is a well-solved combinatorial problem |
| **Score Commentary** | Template-based commentary strings with ball event data | Avoided LLM real-time generation — templates are predictable, cost-free, and < 10ms |

### KISS Example — Live Scorecard Architecture

```
❌ Complex: Real-time event streaming pipeline (Kafka → Flink → 
            WebSocket cluster) for every ball event.

✅ Simple:  Scorer HTTP POST → LiveScoringService → Redis update → 
            WebSocket push to active viewers.
            Fans with no active session get the latest via REST 
            GET /matches/{id}/scorecard (Redis cache hit, < 50ms).
```
**Why:** Most fans don't watch every ball live. A REST + Redis cache serves the majority; WebSocket serves active live viewers. No need for complex streaming infrastructure at MVP scale.

---

## YAGNI — You Aren't Gonna Need It

> *"Don't add functionality until it is necessary."*

### What We Deliberately Excluded

| Feature Considered | Decision | Rationale |
|-------------------|----------|-----------| 
| **Video Highlights Generation** | ❌ Deferred to Phase 3 | Massive storage and processing costs. Start with text commentary; add video (Douyin-style) when user engagement and revenue warrant it. |
| **Fantasy Cricket League** | ❌ Not built (v1) | High complexity (points engine, full match data dependency, legal scrutiny). US/China-inspired but deferred until core scoring is stable. |
| **Monetization / In-App Purchases** | ❌ Out of scope (per requirements) | Explicitly excluded. Sponsorship matching is free matching only. |
| **DRS / Technology Reviews** | ❌ Optional flag, not built | Most local cricket cannot afford Hawk-Eye/UltraEdge. Available as a configurable flag for premium tournaments only. |
| **Multi-Language / i18n** | ❌ Deferred to Phase 2 | Build for English + Hindi first. Framework hooks added but translations deferred until city-specific demand is confirmed. |
| **Global Tournament Support** | ❌ Deferred | Initially metro India only. Architecture is multi-region ready but not deployed globally at launch. |
| **Wearable Sensor Integration** | ❌ Not built | Speed trackers, smart bat sensors — too expensive and niche for local cricket target market. |

### Architecture YAGNI Decisions

| Decision | What We Built | What We Avoided |
|----------|--------------|-----------------| 
| **Service Mesh** | Direct inter-service REST + Kafka | Avoided Istio — unnecessary at < 11 services; add when scale demands it |
| **GraphQL** | REST with well-designed endpoints | Avoided GraphQL federation — REST is simpler for mobile-first consumer; add later if frontend demands |
| **Real-time ML Serving** | Batch PPS calculation post-match | Avoided real-time inference per ball — PPS doesn't need sub-second updates |

---

## Summary Matrix

| Principle | Key Theme | How Applied | Primary Benefit |
|-----------|-----------|-------------|-----------------| 
| **SRP** | One reason to change | Live Scoring, Analytics, Notifications are separate services | Independent scaling, deployment, and team ownership |
| **OCP** | Extend, don't modify | Notification channels, PPS strategy, extra type handlers | New features without breaking existing stability |
| **LSP** | Substitutability | All tournament formats and notification channels treated uniformly | Consistent logic regardless of format or channel |
| **ISP** | Narrow interfaces | Role-specific API endpoints, selective Kafka subscriptions | Reduced coupling, smaller blast radius |
| **DIP** | Depend on abstractions | GeoSearchProvider, PaymentGateway, PPSCalculator interfaces | Swappable infrastructure, testable business logic |
| **KISS** | Simplicity wins | Template commentary, rule-based PPS, Redis + WebSocket | Lower operational cost, easier to debug and maintain |
| **YAGNI** | Build only what's needed | No fantasy league, no video processing, no global deployment | Faster MVP, optimized for metro India launch budget |
