# State Diagrams — CricZone: Local Cricket Community Platform

> State machine diagrams for the five most important stateful entities in CricZone.

---

## SD-1: Match Lifecycle

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED : Fixture created by Organizer

    SCHEDULED --> IN_PROGRESS : Scorer starts scoring session
    SCHEDULED --> ABANDONED : Ground unavailable / weather

    IN_PROGRESS --> INNINGS_BREAK : First innings completed
    IN_PROGRESS --> ABANDONED : Match cancelled mid-game

    INNINGS_BREAK --> IN_PROGRESS : Second innings started by Scorer

    IN_PROGRESS --> COMPLETED : All overs bowled / team all-out / target chased
    COMPLETED --> [*] : Stats locked, player career stats updated

    ABANDONED --> [*] : No result recorded

    note right of IN_PROGRESS
        Live scorecard pushed via WebSocket
        Ball events written to ball_events table
        Redis cache updated per ball
    end note

    note right of COMPLETED
        Kafka: MatchCompleted event published
        Player analytics service updates career stats
        Community service auto-posts match summary
    end note
```

---

## SD-2: Tournament Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Organizer creates tournament

    DRAFT --> REGISTRATION_OPEN : Organizer opens registration
    DRAFT --> CANCELLED : Organizer cancels before opening

    REGISTRATION_OPEN --> REGISTRATION_CLOSED : Deadline reached OR max teams registered
    REGISTRATION_OPEN --> CANCELLED : Organizer cancels

    REGISTRATION_CLOSED --> FIXTURES_PUBLISHED : Auto/manual scheduling done
    REGISTRATION_CLOSED --> CANCELLED : Insufficient teams registered

    FIXTURES_PUBLISHED --> IN_PROGRESS : First match starts
    FIXTURES_PUBLISHED --> CANCELLED : Organizer cancels

    IN_PROGRESS --> IN_PROGRESS : Matches played, points table updated
    IN_PROGRESS --> COMPLETED : Final match result entered

    COMPLETED --> [*] : Tournament report generated, media API updated
    CANCELLED --> [*]
```

---

## SD-3: Ground Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> SLOT_AVAILABLE : Ground listed with open slots

    SLOT_AVAILABLE --> PAYMENT_PENDING : User selects slot and confirms booking
    PAYMENT_PENDING --> CONFIRMED : Payment successful (Razorpay/UPI)
    PAYMENT_PENDING --> SLOT_AVAILABLE : Payment failed or timeout (30 min hold released)

    CONFIRMED --> CHECKED_IN : Day of booking, QR code scanned by ground owner
    CONFIRMED --> CANCELLED : User cancels (> 24 hrs before) → refunded
    CONFIRMED --> NO_SHOW : Match day passes with no check-in

    CHECKED_IN --> COMPLETED : Match session used, slot released
    COMPLETED --> [*]
    CANCELLED --> SLOT_AVAILABLE : Slot made available again
    NO_SHOW --> [*] : No refund
```

---

## SD-4: Offer Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Store Owner creates offer

    DRAFT --> ACTIVE : Store Owner publishes
    DRAFT --> CANCELLED : Store Owner discards

    ACTIVE --> ACTIVE : Redemptions ongoing (current < max)
    ACTIVE --> EXPIRED : Valid until date reached
    ACTIVE --> EXHAUSTED : Max redemptions reached
    ACTIVE --> PAUSED : Store Owner pauses temporarily
    ACTIVE --> CANCELLED : Store Owner cancels

    PAUSED --> ACTIVE : Store Owner resumes

    EXPIRED --> [*]
    EXHAUSTED --> [*]
    CANCELLED --> [*]

    note right of ACTIVE
        Kafka: OfferPublished triggers push
        notifications to store followers
    end note
```

---

## SD-5: Sponsorship Deal Lifecycle

```mermaid
stateDiagram-v2
    [*] --> REQUIREMENT_POSTED : Organizer posts sponsorship requirement

    REQUIREMENT_POSTED --> MATCHING : AI Engine runs sponsor matching
    MATCHING --> PROPOSALS_SENT : Matched sponsors notified
    MATCHING --> NO_MATCH : No matching sponsors found → posted to marketplace

    PROPOSALS_SENT --> NEGOTIATING : Sponsor expresses interest
    NEGOTIATING --> ACTIVE : Both parties accept; digital contract signed
    NEGOTIATING --> CANCELLED : Either party declines

    ACTIVE --> BRANDING_LIVE : Sponsor logos deployed on live scorecards
    BRANDING_LIVE --> BRANDING_LIVE : Tournament matches ongoing
    BRANDING_LIVE --> COMPLETED : Tournament completes
    BRANDING_LIVE --> CANCELLED : Tournament cancelled

    COMPLETED --> [*] : Sponsor ROI report generated
    CANCELLED --> [*]
    NO_MATCH --> [*] : Marketplace listing published
```
