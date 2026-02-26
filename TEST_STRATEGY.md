# Test Strategy — CricZone: Local Cricket Community Platform

> 60+ test cases mapped to functional requirements, covering API, integration, performance, security, and edge cases.

---

## 1. Test Case Matrix (Mapped to FRs)

### FR-01: User Registration & RBAC

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-01 | OTP Send – Valid Mobile | Unit | POST /auth/otp/send with valid Indian mobile | 200, OTP_SENT | Response has `otpExpiry` |
| TC-02 | OTP Send – Invalid Format | Unit | POST /auth/otp/send with "12345" | 400 INVALID_REQUEST | Error message returned |
| TC-03 | OTP Verify – Correct OTP | Unit | POST /auth/otp/verify with matching OTP | 200, JWT returned | `jwt` and `refreshToken` present |
| TC-04 | OTP Verify – Expired OTP | Unit | Verify OTP after 5 min expiry | 400 INVALID_OTP | `retryAllowed: true` in response |
| TC-05 | OTP Verify – Wrong OTP | Unit | Submit incorrect 6-digit OTP | 400 INVALID_OTP | Error returned, user not logged in |
| TC-06 | JWT Expiry Refresh | Unit | Call /auth/refresh with valid refreshToken | 200, new JWT | New JWT expiry > old |
| TC-07 | Role-Based Access – Scorer | Integration | Scorer JWT calls POST /matches/{id}/score/ball | 200 | Access granted |
| TC-08 | Role-Based Access – Fan Blocked | Integration | Fan JWT calls POST /matches/{id}/score/ball | 403 FORBIDDEN | Fan cannot score |
| TC-09 | New User Profile Complete | E2E | OTP verify + PUT /users/{id}/profile | Profile saved | `isProfileComplete: true` |

---

### FR-02: Tournament Management

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-10 | Create Tournament – Valid | Unit | Organizer POST /tournaments | 201, tournamentId returned | `status: DRAFT` |
| TC-11 | Create Tournament – Missing Name | Unit | POST /tournaments without `name` | 400 VALIDATION_FAILED | Error includes field name |
| TC-12 | Team Registration – Valid | Integration | Team captain POST /tournaments/{id}/register-team | 200, PENDING status | Organizer receives notification |
| TC-13 | Team Registration – Slot Full | Integration | Register when maxTeams reached | 409 CONFLICT | "Tournament is full" message |
| TC-14 | Auto-Schedule Generation | Integration | Organizer triggers auto-schedule | 201, fixtures array | All teams appear in fixtures |
| TC-15 | Points Table Update | Integration | Enter match result → check points table | Points table updated | Winning team +2 pts, NRR recalculated |
| TC-16 | Tournament Clone | Unit | POST /tournaments/{id}/clone | 201, new tournamentId | New tournament in DRAFT state |

---

### FR-04: Live Scoring

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-17 | Score Valid Ball – 4 Runs | Unit | POST /matches/{id}/score/ball (runs:4) | 200, scorecard updated | Batting card +4 runs |
| TC-18 | Score Wide Ball | Unit | POST with extraType: "WIDE" | 200 | Extra +1 run, ball not counted in over |
| TC-19 | Score No-Ball + 6 | Unit | POST extraType: "NO_BALL", runsScored: 6 | 200 | Total = 7 (extra + 6 runs), ball not counted |
| TC-20 | Wicket – Caught | Unit | POST wicketType: "CAUGHT" | 200 | Wickets +1, dismissedBatsman moved to out |
| TC-21 | Undo Last Ball | Unit | POST /matches/{id}/undo within 5 balls | 200 | Score reverted, ball_events row deleted |
| TC-22 | Undo Beyond 5 Balls | Unit | 6th undo attempt without approval | 403 | Cannot undo without organizer override |
| TC-23 | Target Calculation | Integration | End 1st innings → check target | Target = 1st innings score + 1 | Target persisted in innings record |
| TC-24 | Match Win – Target Chased | Integration | 2nd innings score > target | MatchCompleted published | winner_team_id set correctly |
| TC-25 | WebSocket Push Speed | Performance | Score ball → measure fan UI update time | < 3 seconds | 95th percentile < 3s |
| TC-26 | Concurrent Scoring Sessions | Performance | 50 simultaneous active matches being scored | All scorecards independent | No cross-match data contamination |

---

### FR-05: Player Performance Analytics

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-27 | Stats Update Post-Match | Integration | MatchCompleted event → check player stats | Career stats updated | Runs, wickets incremented correctly |
| TC-28 | PPS Calculation – All-Rounder | Unit | Player with 80 batting + 70 bowling scores | PPS calculated | PPS = weighted average of components |
| TC-29 | PPS Calculation – Pure Batsman | Unit | Player with 0 bowling figures | PPS calculated | Bowling component = 0, not null |
| TC-30 | Player Compare API | Unit | GET /players/compare?player1=X&player2=Y | Both player stats returned | Winner field identifies higher PPS |
| TC-31 | AI Insight Generation | Unit | Player with 5+ matches of data | Insights generated | At least 1 insight per player |
| TC-32 | Stat Card Generation | Integration | POST-match stat card for 50+ scorer | Image URL returned | Card accessible via CDN |

---

### FR-06: Store Locator & Offers

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-33 | Nearby Stores – Valid Location | Unit | GET /stores/nearby?lat=18.52&lng=73.85&radius=10 | Stores within 10km | Distance correctly calculated |
| TC-34 | Nearby Stores – No Stores | Unit | GET in area with no stores | 200, empty array | `stores: []` |
| TC-35 | Offer Redeem – Valid | Integration | Fan redeems valid, active offer | 200, QR code generated | `currentRedemptions +1` in DB |
| TC-36 | Offer Redeem – Expired | Unit | Redeem offer past `validUntil` | 422 VALIDATION_FAILED | "Offer has expired" |
| TC-37 | Offer Redeem – Max Reached | Unit | Redeem when currentRedemptions = maxRedemptions | 409 CONFLICT | "Offer fully redeemed" |
| TC-38 | Store Owner Posts Offer | Integration | Store Owner POST offer | 201 | Followers notified via FCM |

---

### FR-07: Sponsorship Management

| Test ID | Test Name | Test Type | Steps | Expected Result | Pass Criteria |
|---------|-----------|-----------|-------|-----------------|---------------|
| TC-39 | Post Sponsorship Requirement | Unit | Organizer POST /sponsorships/requirements | 201, MATCHING_IN_PROGRESS | Kafka event published |
| TC-40 | Sponsor Match Found | Integration | Requirement → AI match run | SponsorMatchFound event | Top 3 sponsors identified |
| TC-41 | Branding Overlay Active | Integration | Deal activated → scoring service called | Logo on scorecard | `sponsorOverlay` in scorecard API |
| TC-42 | ROI Dashboard | Unit | GET /sponsorships/{id}/roi after 5 matches | ROI metrics returned | All metric fields populated |

---

## 2. API Test Specs

### Authentication: POST /auth/otp/verify

**Success Case:**
```
Method: POST
URL: /auth/otp/verify
Body: { "mobileNumber": "+91-9876543210", "otp": "482931" }
Expected: 200, { "jwt": "...", "refreshToken": "..." }
```

**Failure Cases:**
```
1. Expired OTP: 400, { "error": "INVALID_OTP" }
2. Wrong OTP:   400, { "error": "INVALID_OTP" }
3. 5+ retries:  429, { "error": "RATE_LIMITED" }
```

### Scoring: POST /matches/{id}/score/ball

**Success Case:**
```
Method: POST
Headers: Authorization: Bearer <SCORER_JWT>
URL: /matches/M-001/score/ball
Body: { "overNumber": 3, "ballNumber": 4, "runsScored": 6, "batsmanId": "P-001", "bowlerId": "P-012" }
Expected: 200, { "scorecard": { "score": "45/2", "lastBall": "SIX!" } }
```

**Failure Cases:**
```
1. Not a scorer: 403 FORBIDDEN
2. Over > match overs: 422 VALIDATION_FAILED "Over exceeds match format limit"
3. Match not started: 422 VALIDATION_FAILED "Match is not in IN_PROGRESS state"
```

---

## 3. Integration Test Plan

### IT-01: Full Match Lifecycle
1. Create tournament → Register 2 teams → Schedule fixture
2. Start match → Score complete T20 innings (20 overs)
3. Record 2nd innings, chase target successfully
4. Verify: MatchCompleted event published, player stats updated, match summary post auto-created

### IT-02: Notification Delivery Pipeline
1. Score a wicket ball
2. Verify Kafka `BallScored` event published
3. Verify Notification Service consumes event
4. Verify FCM push delivered to all subscribed fans

### IT-03: Sponsorship Full Flow
1. Organizer posts sponsorship requirement
2. AI matching runs and selects sponsor
3. Sponsor accepts deal
4. Verify branding overlay appears on live scorecard
5. After tournament, verify ROI dashboard has match view data

### IT-04: Store Offer Redemption Flow
1. Store Owner creates offer
2. Fan discovers store via geo-search within 5 km
3. Fan redeems offer — QR code generated
4. Store owner scans QR → offer marked redeemed
5. Verify `currentRedemptions` incremented in DB

---

## 4. Performance & Load Profiles

| Scenario | Target | Tool |
|----------|--------|------|
| 50 concurrent live match scoring sessions | All 50 independent with < 3s scorecard push | k6 |
| 10,000 concurrent scorecard viewers (single final) | p95 load time < 2 seconds | k6 + WebSocket |
| Store nearby search (50 concurrent users) | p95 < 1 second | k6 |
| Player stats page load (1,000 concurrent) | p95 < 2 seconds | k6 |
| OTP send rate (1,000 requests/min) | All pass without rate limiting (unless > configured threshold) | Postman + Perf |

---

## 5. Security Test Cases (OWASP Top 10 Aligned)

| Test ID | Vulnerability | Test Case | Expected |
|---------|--------------|-----------|----------|
| SEC-01 | Broken Access Control | Fan JWT calls Scorer-only API | 403 FORBIDDEN |
| SEC-02 | Broken Auth | Expired JWT used | 401 UNAUTHORIZED |
| SEC-03 | Injection (SQL) | `name = "'; DROP TABLE users;--"` in POST /users | Input sanitized, 400 or safe response |
| SEC-04 | Injection (XSS) | `content = "<script>alert(1)</script>"` in POST /posts | Content sanitized before storage |
| SEC-05 | Rate Limiting | 100 OTP requests in 1 min | 429 RATE_LIMITED after threshold |
| SEC-06 | Sensitive Data Exposure | GET /users/{id} by another user | Only non-sensitive fields exposed (no OTP, no token) |
| SEC-07 | Broken Object-Level Auth | User A tries to edit User B's profile | 403, not allowed |
| SEC-08 | Mass Assignment | PUT /users with `role: ADMIN` in body | Role change ignored, controlled via admin API only |

---

## 6. Edge Cases

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| EC-01 | All 10 wickets fall in final over — match ends mid-over | Match immediately transitions to COMPLETED; remaining balls skipped |
| EC-02 | Scorer loses connectivity mid-match | Last saved state preserved in DB; scoring resumes from last confirmed ball |
| EC-03 | Both teams score equal runs — tie | Super Over triggered; system awaits scorer to start new mini-innings |
| EC-04 | Tournament cancelled with active sponsorship deal | Deals status → CANCELLED; sponsor ROI shows 0 |
| EC-05 | Store listed in wrong city due to GPS error | Ground truth check via address; admin can correct location |
| EC-06 | Player participates in two concurrent tournaments | Stats aggregated across both; PPS recalculated after each match independently |
| EC-07 | Tournament with only 1 team registers | Registration closed, tournament auto-cancelled — organizer notified |
| EC-08 | Offer QR scanned twice by same user | Second scan returns 409 CONFLICT "Already redeemed" |
| EC-09 | Sponsor logo upload > 5MB | 400 VALIDATION_FAILED "File size exceeds 5MB limit" |
| EC-10 | Rain causes match abandonment after 10 overs | Scorer selects "Abandoned" — Duckworth-Lewis flag noted; NRR not affected |

---

## 7. Acceptance Criteria

| Feature | Acceptance Criteria |
|---------|---------------------|
| Live Scoring | Scorecard visible to fans within 3 seconds of a ball being scored |
| Player Analytics | PPS and career stats updated within 5 minutes of match completion |
| Store Locator | Stores within 10 km displayed with correct distance within 1 second |
| Tournament Scheduling | Fixtures generated for 8-team T20 within 5 seconds using auto-schedule |
| Notifications | Push notifications delivered within 10 seconds of triggering event |
| Sponsorship Matching | AI matching result available within 30 seconds of requirement posted |
| OTP Auth | OTP delivered within 30 seconds on Airtel/Jio/BSNL networks |
| Security | Zero critical OWASP vulnerabilities in pre-launch pentest |
