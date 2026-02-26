# ER Diagram — CricZone: Local Cricket Community Platform

> Full Entity-Relationship Diagram with table definitions, column types, relationships, and strategic indexes. Database: **PostgreSQL**.

---

## Full ERD

```mermaid
erDiagram
    USERS {
        uuid user_id PK
        varchar mobile_number UK
        varchar name
        varchar email
        varchar profile_photo_url
        varchar city
        varchar role
        varchar status
        timestamp created_at
    }

    KYC_VERIFICATIONS {
        uuid kyc_id PK
        uuid user_id FK
        varchar document_type
        varchar document_number
        varchar status
        timestamp verified_at
    }

    TOURNAMENTS {
        uuid tournament_id PK
        uuid organizer_id FK
        varchar name
        varchar format
        varchar status
        varchar city
        date start_date
        date end_date
        int max_teams
        timestamp created_at
    }

    TEAMS {
        uuid team_id PK
        uuid tournament_id FK
        varchar team_name
        uuid captain_id FK
        int squad_size
        timestamp registered_at
    }

    TEAM_PLAYERS {
        uuid team_id FK
        uuid player_id FK
        boolean is_captain
        boolean is_vice_captain
    }

    FIXTURES {
        uuid fixture_id PK
        uuid tournament_id FK
        uuid team1_id FK
        uuid team2_id FK
        uuid ground_id FK
        uuid umpire_id FK
        timestamp scheduled_at
        varchar round
        varchar match_type
    }

    POINTS_TABLE {
        uuid entry_id PK
        uuid tournament_id FK
        uuid team_id FK
        int matches_played
        int wins
        int losses
        int no_results
        int points
        float net_run_rate
        timestamp updated_at
    }

    MATCHES {
        uuid match_id PK
        uuid fixture_id FK
        varchar status
        uuid scorer_id FK
        uuid winner_team_id FK
        varchar result_summary
        timestamp started_at
        timestamp completed_at
    }

    INNINGS {
        uuid innings_id PK
        uuid match_id FK
        uuid batting_team_id FK
        uuid bowling_team_id FK
        int innings_number
        int total_runs
        int total_wickets
        int total_extras
        int overs_completed
        int target
    }

    BALL_EVENTS {
        uuid ball_event_id PK
        uuid innings_id FK
        uuid match_id FK
        int over_number
        int ball_number
        int runs_scored
        varchar wicket_type
        uuid dismissed_batsman_id FK
        varchar extra_type
        int extra_runs
        uuid batsman_id FK
        uuid bowler_id FK
        timestamp recorded_at
    }

    PLAYER_CAREER_STATS {
        uuid stats_id PK
        uuid player_id FK
        int total_runs
        int total_wickets
        int total_catches
        float batting_average
        float batting_strike_rate
        float bowling_average
        float bowling_economy
        int centuries
        int half_centuries
        timestamp updated_at
    }

    PLAYER_PERFORMANCE_SCORES {
        uuid pps_id PK
        uuid player_id FK
        float score
        varchar grade
        jsonb component_scores
        timestamp calculated_at
    }

    GROUNDS {
        uuid ground_id PK
        uuid owner_id FK
        varchar name
        varchar address
        float latitude
        float longitude
        varchar pitch_type
        boolean has_floodlights
        boolean has_dressing_rooms
        float hourly_rate
        float rating
        varchar status
    }

    GROUND_BOOKINGS {
        uuid booking_id PK
        uuid ground_id FK
        uuid booked_by FK
        timestamp slot_start
        timestamp slot_end
        float amount_paid
        varchar payment_status
        varchar qr_code_url
        timestamp booked_at
    }

    STORES {
        uuid store_id PK
        uuid owner_id FK
        varchar name
        varchar address
        float latitude
        float longitude
        varchar phone
        float rating
        varchar status
        jsonb product_categories
    }

    OFFERS {
        uuid offer_id PK
        uuid store_id FK
        varchar title
        text description
        float discount_percentage
        date valid_until
        int max_redemptions
        int current_redemptions
        varchar status
    }

    OFFER_REDEMPTIONS {
        uuid redemption_id PK
        uuid offer_id FK
        uuid user_id FK
        varchar qr_code
        timestamp redeemed_at
    }

    SPONSORS {
        uuid sponsor_id PK
        uuid user_id FK
        varchar brand_name
        varchar industry
        varchar city
        varchar contact_email
        varchar status
    }

    SPONSORSHIP_DEALS {
        uuid deal_id PK
        uuid sponsor_id FK
        uuid tournament_id FK
        varchar tier
        varchar status
        varchar contract_url
        jsonb branding_assets
        timestamp activated_at
    }

    POSTS {
        uuid post_id PK
        uuid author_id FK
        varchar type
        text content
        varchar media_url
        int likes_count
        int comments_count
        boolean is_auto_generated
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid notification_id PK
        uuid user_id FK
        varchar type
        varchar channel
        text message
        boolean is_read
        timestamp sent_at
    }

    USERS ||--o{ KYC_VERIFICATIONS : "undergoes"
    USERS ||--o{ TOURNAMENTS : "organizes"
    TOURNAMENTS ||--o{ TEAMS : "contains"
    TOURNAMENTS ||--o{ FIXTURES : "has"
    TOURNAMENTS ||--o{ POINTS_TABLE : "tracks"
    TEAMS ||--o{ TEAM_PLAYERS : "has"
    FIXTURES ||--|| MATCHES : "becomes"
    MATCHES ||--o{ INNINGS : "has"
    INNINGS ||--o{ BALL_EVENTS : "records"
    USERS ||--o{ PLAYER_CAREER_STATS : "has"
    USERS ||--o{ PLAYER_PERFORMANCE_SCORES : "has"
    GROUNDS ||--o{ GROUND_BOOKINGS : "has"
    STORES ||--o{ OFFERS : "publishes"
    OFFERS ||--o{ OFFER_REDEMPTIONS : "has"
    USERS ||--o{ SPONSORSHIP_DEALS : "signs"
    SPONSORS ||--o{ SPONSORSHIP_DEALS : "creates"
    TOURNAMENTS ||--o{ SPONSORSHIP_DEALS : "has"
    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

---

## Table Definitions & Strategic Indexes

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID | PK, default gen_random_uuid() |
| `mobile_number` | VARCHAR(15) | UNIQUE, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | NULLABLE (optional) |
| `city` | VARCHAR(100) | NOT NULL |
| `role` | VARCHAR(20) | CHECK IN ('PLAYER','ORGANIZER','FAN','SCORER','STORE_OWNER','SPONSOR','ADMIN') |
| `status` | VARCHAR(20) | DEFAULT 'PENDING_VERIFICATION' |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

**Indexes:** `idx_users_mobile` (mobile_number), `idx_users_role_city` (role, city)

---

### `ball_events` *(High-write, scoring-critical)*
| Column | Type | Notes |
|--------|------|-------|
| `ball_event_id` | UUID | PK |
| `innings_id` | UUID | FK → innings.innings_id |
| `match_id` | UUID | FK → matches.match_id |
| `over_number` | INT | NOT NULL |
| `ball_number` | INT | NOT NULL 1–8 (incl. extras) |
| `runs_scored` | INT | DEFAULT 0 |
| `wicket_type` | VARCHAR(20) | NULLABLE |
| `extra_type` | VARCHAR(15) | NULLABLE (WIDE/NO_BALL/BYE/LEG_BYE) |
| `recorded_at` | TIMESTAMP | DEFAULT NOW() |

**Indexes:** `idx_ball_events_match_innings` (match_id, innings_id), `idx_ball_events_time` (recorded_at DESC)

---

### `player_career_stats` *(Read-heavy, updated post-match)*
| Column | Type | Notes |
|--------|------|-------|
| `player_id` | UUID | PK (1:1 with users) |
| `total_runs` | INT | DEFAULT 0 |
| `batting_average` | FLOAT | COMPUTED |
| `batting_strike_rate` | FLOAT | COMPUTED |
| `bowling_economy` | FLOAT | COMPUTED |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

**Indexes:** `idx_player_stats_total_runs` (total_runs DESC), `idx_player_stats_wickets` (total_wickets DESC)

---

### `grounds` *(Geo-spatial queries)*
| Column | Type | Notes |
|--------|------|-------|
| `ground_id` | UUID | PK |
| `latitude` | FLOAT(8,6) | NOT NULL |
| `longitude` | FLOAT(9,6) | NOT NULL |
| `status` | VARCHAR(20) | CHECK IN ('ACTIVE','INACTIVE','UNDER_RENOVATION') |

**Indexes:** `idx_grounds_location` (PostGIS `geography` column for radius queries), `idx_grounds_status` (status)

---

### `sponsorship_deals`
| Column | Type | Notes |
|--------|------|-------|
| `deal_id` | UUID | PK |
| `tier` | VARCHAR(20) | CHECK IN ('TITLE','CO_SPONSOR','ASSOCIATE') |
| `status` | VARCHAR(20) | CHECK IN ('PENDING','ACTIVE','EXPIRED','CANCELLED') |
| `branding_assets` | JSONB | {logoUrl, bannerUrl, colorPalette} |

**Indexes:** `idx_deals_tournament` (tournament_id), `idx_deals_sponsor_status` (sponsor_id, status)
