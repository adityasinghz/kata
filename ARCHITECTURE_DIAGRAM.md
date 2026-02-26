# Architecture Diagram — CricZone: Local Cricket Community Platform

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph Client Layer
        MOB["📱 Mobile App\n(Player / Fan / Scorer)\nReact Native"]
        WEB["🖥️ Web Dashboard\n(Organizer / Admin)\nReact.js"]
        STORE_APP["🏪 Store Owner Portal\nReact Native / PWA"]
        MEDIA_API["📡 Media API Consumer\n(Sports Press / JSON Feed)"]
    end

    subgraph API Layer
        GW["🔀 API Gateway\nKong / NGINX\n✅ JWT Auth  ✅ Rate Limiting  ✅ Routing"]
    end

    subgraph Core Services
        AUTH["🔐 User & Auth Service\nNode.js\nOTP · JWT · RBAC · KYC"]
        TOUR["🏆 Tournament Management\nNode.js\nFixtures · Points Table · Registration"]
        GROUND["📍 Ground & Venue Service\nNode.js\nBooking · Calendar · Geo-search"]
        SCORER["🏏 Live Scoring Service\nNode.js\nBall Engine · WebSocket · Redis Cache"]
    end

    subgraph AI Services
        ANALYTICS["📊 Player Analytics & AI\nPython / FastAPI\nPPS · Career Stats · Insights"]
        SPONSOR_AI["🤝 Sponsorship Matching AI\nPython / FastAPI\nGeo + Category + Audience Score"]
    end

    subgraph Engagement Services
        NOTIFY["🔔 Notification Service\nNode.js\nFCM · WhatsApp · SMS · Email"]
        COMMUNITY["👥 Community & Social\nNode.js\nFeed · Posts · Polls · Leaderboard"]
        STORE_SVC["🛍️ Store & Offers Service\nNode.js\nGeo-discovery · QR Redemption"]
        SPONSOR_SVC["💼 Sponsorship Service\nNode.js\nDeals · Contracts · ROI Dashboard"]
    end

    subgraph Reporting
        REPORTING["📈 Analytics & Reporting\nNode.js\nMedia API · PDF Reports · KPIs"]
    end

    subgraph Infrastructure
        KAFKA["⚡ Apache Kafka\nEvent Backbone"]
        PG[("🗄️ PostgreSQL\n+ PostGIS\nMain Database")]
        REDIS[("⚡ Redis\nScore Cache\n+ Pub/Sub")]
        S3[("☁️ Object Storage\nS3 / GCS\nMedia · PDFs")]
        FIREBASE["🔥 Firebase\nFCM Push\n+ Phone Auth"]
        CDN["🌐 CDN\nCloudFront\nStatic Assets"]
        PAY["💳 Razorpay / UPI\nPayment Gateway"]
    end

    MOB & WEB & STORE_APP & MEDIA_API --> GW
    GW --> AUTH & TOUR & GROUND & SCORER
    GW --> ANALYTICS & COMMUNITY & STORE_SVC & SPONSOR_SVC & REPORTING

    SCORER -->|WebSocket Push| MOB
    SCORER --> REDIS
    SCORER --> PG
    SCORER --> KAFKA

    KAFKA --> ANALYTICS
    KAFKA --> NOTIFY
    KAFKA --> COMMUNITY
    KAFKA --> REPORTING
    KAFKA --> SPONSOR_AI

    ANALYTICS --> PG & REDIS
    TOUR --> PG
    AUTH --> PG & FIREBASE
    GROUND --> PG & PAY
    COMMUNITY --> PG & S3
    STORE_SVC --> PG
    SPONSOR_SVC --> PG
    SPONSOR_AI --> SPONSOR_SVC
    REPORTING --> PG & REDIS & CDN & S3
    NOTIFY --> FIREBASE
```

---

## 2. Live Scoring Real-Time Data Flow

```mermaid
graph LR
    subgraph Scorer Input
        SC["📱 Scorer App\nTaps Ball Outcome"]
    end

    subgraph Live Scoring Service
        VALIDATE["Validate Ball Event\n(over limit, match state)"]
        DB_WRITE["Write BallEvent\nto PostgreSQL"]
        COMPUTE["Recompute Scorecard\n(batting card, bowling card)"]
        CACHE["Update Redis Cache\nmatch:{id}:scorecard"]
        PUBLISH["Publish to Kafka\nBallScored event"]
    end

    subgraph Fan Delivery
        WS["⚡ WebSocket\nBroadcast\n< 3 seconds"]
        REST["REST API\nGET /matches/{id}/scorecard\nRedis hit < 50ms"]
    end

    subgraph Side Effects
        MILESTONE["🔔 Milestone Check\n50s / 100s / Wickets"]
        NOTIFY["FCM Push\nto Subscribed Fans"]
    end

    SC -->|POST /matches/id/score/ball| VALIDATE
    VALIDATE --> DB_WRITE
    DB_WRITE --> COMPUTE
    COMPUTE --> CACHE
    COMPUTE --> PUBLISH
    CACHE --> WS
    CACHE --> REST
    PUBLISH --> MILESTONE
    MILESTONE -->|Kafka → NotificationService| NOTIFY
```

---

## 3. Post-Match Event Flow

```mermaid
graph TD
    MATCH_END["🏁 Match Completed\n(Scorer confirms result)"]

    MATCH_END --> KAFKA_EVENT["Kafka: MatchCompleted\n{ matchId, score, winnerId }"]

    KAFKA_EVENT --> ANALYTICS["📊 Player Analytics Service\nAggregate batting / bowling / fielding\nCompute PPS (0–100)\nSave CareerStats"]
    KAFKA_EVENT --> COMMUNITY["👥 Community Service\nAuto-generate Match Summary Post\nUpdate Tournament Leaderboard"]
    KAFKA_EVENT --> NOTIFY["🔔 Notification Service\nPush match result\nto both teams' followers"]
    KAFKA_EVENT --> REPORTING["📈 Reporting Service\nGenerate Match Report PDF\nUpdate Media Statistics API"]

    ANALYTICS --> PPS_DONE["✅ PPS Updated\nStat Card Generated\nReady to Share on WhatsApp"]
    COMMUNITY --> POST_DONE["✅ Match Post Live\nin Community Feed"]
    NOTIFY --> FANS["📱 Fans receive\nMatch Result push"]
    REPORTING --> PDF["📄 PDF Report\nUploaded to CDN\nMedia API updated"]
```

---

## 4. Technology Stack Diagram

```mermaid
graph LR
    subgraph Frontend
        RN["React Native\nMobile App\n(Android + iOS)"]
        REACT["React.js\nWeb Dashboard"]
        D3["Chart.js\nAnalytics Charts"]
    end

    subgraph Backend
        NODE["Node.js + Express\n9 Services\n(Core + Engagement + Reporting)"]
        PYTHON["Python + FastAPI\n2 AI Services\n(PPS + Sponsor Matching)"]
    end

    subgraph Data
        PG_DB[("PostgreSQL 15\n+ PostGIS Extension\nAll relational data\n+ Geo-spatial queries")]
        REDIS_DB[("Redis 7\nScore cache\n+ WebSocket pub/sub")]
        S3_STORE[("S3 / GCS\nImages · Videos\nPDFs · Stat Cards")]
    end

    subgraph Messaging
        KAFKA_B[("Apache Kafka\nEvent backbone\nPost-match flows")]
    end

    subgraph External Services
        FIREBASE_E["Firebase\nFCM Push notifications\nPhone OTP Auth"]
        WHATSAPP["WhatsApp\nBusiness API\nIndia-first fallback"]
        RAZORPAY["Razorpay / UPI\nGround booking\npayments"]
        MAPS["Google Maps API\nStore geo-search\nGround locator"]
        CDN_E["CloudFront CDN\nStatic files\nStat card images"]
    end

    RN & REACT --> NODE
    RN & REACT --> PYTHON
    NODE --> PG_DB & REDIS_DB & KAFKA_B & S3_STORE
    PYTHON --> PG_DB & KAFKA_B
    NODE --> FIREBASE_E & WHATSAPP & RAZORPAY & MAPS
    S3_STORE --> CDN_E
```

---

## 5. Deployment Architecture (Cloud — Cost-Optimised MVP)

```mermaid
graph TB
    subgraph Internet
        USERS["🌍 Users\n(Players, Fans, Organizers)"]
    end

    subgraph Edge
        CF["Cloudflare / CloudFront CDN\nStatic Assets · DDoS Protection"]
    end

    subgraph Cloud Region — ap-south-1 Mumbai
        ALB["Application Load Balancer\n(AWS ALB / GCP Load Balancer)"]

        subgraph ECS / GKE — Auto-scaled
            GW_POD["API Gateway Pods\n(Kong + NGINX)"]
            SCORING_POD["Live Scoring Pods\n⚡ High-priority, auto-scaled"]
            TOUR_POD["Tournament Service Pods"]
            OTHER_PODS["Other Service Pods\n(Auth, Analytics, Store, etc.)"]
        end

        subgraph Managed Data Services
            RDS["AWS RDS / Cloud SQL\nPostgreSQL + PostGIS\nMulti-AZ Failover"]
            ELASTICACHE["AWS ElastiCache / Memorystore\nRedis Cluster"]
            MSK["AWS MSK / Confluent Cloud\nKafka (Managed)"]
            S3_CLOUD["S3 / GCS Bucket\nObject Storage"]
        end

        subgraph Firebase
            FCM_CLOUD["FCM\nPush Notifications"]
            AUTH_CLOUD["Firebase Auth\nPhone OTP"]
        end
    end

    USERS --> CF
    CF --> ALB
    ALB --> GW_POD
    GW_POD --> SCORING_POD & TOUR_POD & OTHER_PODS
    SCORING_POD --> RDS & ELASTICACHE & MSK
    TOUR_POD --> RDS & MSK
    OTHER_PODS --> RDS & MSK & S3_CLOUD
    OTHER_PODS --> FCM_CLOUD & AUTH_CLOUD
```
