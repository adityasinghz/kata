# PayFlow - Sequence Diagrams

> **⚠️ Core Requirements**: Flows support the core requirements defined in [KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md).

## Table of Contents
1. [Customer Registration Flow](#1-customer-registration-flow)
2. [Payment Processing Flow (P2P)](#2-payment-processing-flow-p2p)
3. [QR Code Payment Flow](#3-qr-code-payment-flow)
4. [Fraud Detection Flow](#4-fraud-detection-flow)
5. [Merchant Onboarding Flow](#5-merchant-onboarding-flow)
6. [Loyalty Points Redemption Flow](#6-loyalty-points-redemption-flow)

---

## 1. Customer Registration Flow

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer (App)
    participant AG as API Gateway
    participant US as User Service
    participant OTP as OTP Provider (Twilio)
    participant KYC as KYC Provider
    participant LS as Loyalty Service
    participant DB as PostgreSQL
    participant KF as Kafka

    C->>AG: POST /api/v1/auth/register {name, phone}
    AG->>AG: Rate limit check
    AG->>US: Forward registration request
    US->>DB: Check phone_hash exists
    
    alt Phone already registered
        DB-->>US: User found
        US-->>C: 409 Conflict - Phone already registered
    else Phone available
        DB-->>US: Not found
        US->>OTP: Send OTP to phone
        OTP-->>US: OTP sent (message_id)
        US->>DB: Store OTP in temp table (TTL: 5 min)
        US-->>C: 200 OK - OTP sent

        C->>AG: POST /api/v1/auth/verify-otp {phone, otp}
        AG->>US: Forward OTP verification
        US->>DB: Validate OTP
        
        alt OTP valid
            US->>DB: INSERT INTO users (name, phone_encrypted, phone_hash)
            US->>LS: Create loyalty account (Silver tier)
            LS->>DB: INSERT INTO loyalty_accounts
            US->>KF: Publish "UserRegistered" event
            US-->>C: 201 Created {user_id, access_token}
        else OTP invalid/expired
            US-->>C: 401 Unauthorized - Invalid OTP
        end
    end
```

---

## 2. Payment Processing Flow (P2P)

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer (App)
    participant AG as API Gateway
    participant PS as Payment Service
    participant FE as Fraud Engine
    participant BG as Banking Gateway
    participant BA as Bank Partner API
    participant NS as Notification Service
    participant LS as Loyalty Service
    participant DB as PostgreSQL
    participant RD as Redis
    participant KF as Kafka

    C->>AG: POST /api/v1/payments {recipientPhone, amount, idempotencyKey, pin}
    AG->>AG: JWT validation + Rate limit
    AG->>PS: Forward payment request

    PS->>RD: Check idempotency key
    alt Already processed
        RD-->>PS: Previous result found
        PS-->>C: 200 OK (cached result)
    else New request
        RD-->>PS: Not found
        PS->>DB: Validate sender bank account active
        PS->>DB: Validate recipient exists

        rect rgb(255, 240, 240)
            Note over PS,FE: Fraud Detection (< 200ms)
            PS->>FE: Score transaction
            FE->>FE: Rule Engine: velocity, amount, device
            FE->>FE: ML Model: anomaly scoring
            FE-->>PS: Risk Score + Decision
        end

        alt Risk Score > 90 (Auto-Block)
            PS->>DB: INSERT payment (status: FAILED)
            PS->>DB: INSERT fraud_alert
            PS->>KF: Publish "PaymentBlocked" event
            PS-->>C: 403 Forbidden - Transaction blocked
        else Risk Score 50-90 (Hold for Review)
            PS->>DB: INSERT payment (status: FRAUD_CHECK)
            PS->>DB: INSERT fraud_alert (pending_review)
            PS->>KF: Publish "PaymentHeldForReview" event
            PS-->>C: 202 Accepted - Under review
        else Risk Score < 50 (Proceed)
            PS->>DB: INSERT payment (status: AUTHORIZED)
            PS->>DB: INSERT payment_event (PaymentAuthorized)

            rect rgb(240, 255, 240)
                Note over PS,BA: Bank Processing
                PS->>BG: Debit sender account
                BG->>BA: POST /debit {iban, amount, ref}
                BA-->>BG: 200 OK {bank_ref}
                BG-->>PS: Debit successful
            end

            PS->>DB: UPDATE payment (status: COMPLETED)
            PS->>DB: INSERT transaction (sender: DEBIT)
            PS->>DB: INSERT transaction (recipient: CREDIT)
            PS->>DB: INSERT payment_event (PaymentCompleted)
            PS->>RD: Store idempotency result (TTL: 24h)

            par Async Notifications
                PS->>KF: Publish "PaymentCompleted" event
                KF->>NS: Consume event
                NS->>NS: Check user notification preferences
                NS->>NS: Send Push + SMS to both parties
            and Loyalty Points
                KF->>LS: Consume "PaymentCompleted"
                LS->>DB: Credit points to sender
            end

            PS-->>C: 200 OK {paymentId, status: COMPLETED, txRef}
        end
    end
```

---

## 3. QR Code Payment Flow

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer (App)
    participant AG as API Gateway
    participant QRS as QR Service
    participant PS as Payment Service
    participant FE as Fraud Engine
    participant BG as Banking Gateway
    participant RD as Redis
    participant DB as PostgreSQL

    Note over C: Customer scans merchant QR code with camera

    C->>AG: POST /api/v1/qr/decode {qrPayload}
    AG->>QRS: Decode QR
    QRS->>QRS: Parse payload: recipientId, amount, type, expiry

    alt Dynamic QR
        QRS->>RD: Check QR expiry
        alt QR Expired
            QRS-->>C: 410 Gone - QR code has expired
        else QR Valid
            QRS-->>C: 200 OK {recipientName, amount, merchantCategory}
        end
    else Static QR
        QRS->>DB: Lookup merchant by ID
        QRS-->>C: 200 OK {merchantName, category} (no pre-filled amount)
    end

    Note over C: Customer confirms amount and payment source

    C->>AG: POST /api/v1/payments {recipientId, amount, method: "qr_code", idempotencyKey, pin}
    AG->>PS: Forward payment

    Note over PS: Standard payment flow from Sequence 2
    PS->>FE: Fraud check
    FE-->>PS: Score < 50 (Proceed)
    PS->>BG: Debit sender
    BG-->>PS: Success
    PS->>DB: Record payment + transactions
    PS-->>C: 200 OK {paymentId, receipt}
```

---

## 4. Fraud Detection Flow

```mermaid
sequenceDiagram
    autonumber
    participant PS as Payment Service
    participant FE as Fraud Engine
    participant RE as Rule Engine
    participant ML as ML Scoring Model
    participant DF as Device Fingerprint
    participant VA as Velocity Aggregator
    participant RD as Redis
    participant DB as PostgreSQL

    PS->>FE: scoreTransaction(payment, deviceInfo, geoLocation)

    par Rule-Based Checks
        FE->>RE: Apply velocity rules
        RE->>RD: Get user tx count (sliding window: 1h)
        RD-->>RE: count = 15
        RE->>RE: Rule: max 20/hour → PASS (weight: 0)
        
        RE->>RD: Get user tx amount (sliding window: 24h)
        RD-->>RE: total = $4,500
        RE->>RE: Rule: max $5,000/day → WARNING (weight: 25)
        RE-->>FE: Rule score = 25
    and ML Scoring
        FE->>ML: Predict anomaly(features)
        ML->>ML: Features: amount_zscore, time_of_day, geo_distance, device_age
        ML-->>FE: ML score = 15
    and Device Check
        FE->>DF: Check device fingerprint
        DF->>DB: Lookup device history
        DB-->>DF: Known device (last used: 2 days ago)
        DF-->>FE: Device score = 0 (trusted)
    and Velocity Aggregation
        FE->>VA: Check unusual patterns
        VA->>RD: Get recent counterparties (7 days)
        RD-->>VA: 3 unique recipients (normal)
        VA-->>FE: Velocity score = 5
    end

    FE->>FE: Combine: (25 + 15 + 0 + 5) / 4 = 11.25
    FE->>FE: Final risk score = 11 → ALLOW

    FE-->>PS: {riskScore: 11, decision: "ALLOW", factors: ["daily_amount_warning"]}
```

---

## 5. Merchant Onboarding Flow

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin
    participant AG as API Gateway
    participant MS as Merchant Service
    participant KYB as KYB Provider
    participant QRS as QR Service
    participant NS as Notification Service
    participant DB as PostgreSQL
    participant KF as Kafka
    participant CDN as CloudFront CDN

    A->>AG: POST /api/v1/merchants {businessName, regNumber, iban, category, docs}
    AG->>AG: Verify admin JWT + RBAC check
    AG->>MS: Forward onboarding request

    MS->>DB: Check registration_number unique
    
    alt Already exists
        MS-->>A: 409 Conflict - Merchant already registered
    else New merchant
        MS->>DB: INSERT merchant (status: PENDING_APPROVAL)
        MS->>KYB: Verify business (regNumber, documents)
        
        alt KYB Verified
            KYB-->>MS: Verification PASSED
            MS->>DB: UPDATE merchant (status: ACTIVE)
            
            MS->>QRS: Generate static QR code
            QRS->>QRS: Encode: payflow://pay/{merchantId}
            QRS->>CDN: Upload QR image
            CDN-->>QRS: QR URL
            QRS-->>MS: {qrUrl}
            MS->>DB: UPDATE merchant (static_qr_url)

            MS->>DB: Create merchant dashboard user
            MS->>KF: Publish "MerchantOnboarded" event
            KF->>NS: Consume event
            NS->>NS: Send welcome email + QR to merchant
            
            MS-->>A: 201 Created {merchantId, qrUrl}
        else KYB Failed
            KYB-->>MS: Verification FAILED {reason}
            MS->>DB: UPDATE merchant (status: PENDING_APPROVAL, notes: reason)
            MS-->>A: 422 Unprocessable - KYB failed: {reason}
        end
    end
```

---

## 6. Loyalty Points Redemption Flow

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer (App)
    participant AG as API Gateway
    participant PS as Payment Service
    participant LS as Loyalty Service
    participant BG as Banking Gateway
    participant DB as PostgreSQL

    C->>AG: POST /api/v1/payments {recipientId, amount: 100, loyaltyPointsToUse: 200, pin}
    AG->>PS: Forward payment

    PS->>LS: Calculate redemption value (200 points)
    LS->>DB: SELECT available_points FROM loyalty_accounts WHERE user_id = ?
    
    alt Insufficient Points
        LS-->>PS: Error - Only 150 points available
        PS-->>C: 422 - Insufficient loyalty points
    else Sufficient Points
        LS-->>PS: {redeemableValue: $10.00}
        
        PS->>PS: Calculate: $100 - $10 = $90 to charge from bank

        PS->>DB: BEGIN TRANSACTION
        PS->>BG: Debit $90 from sender bank account
        BG-->>PS: Success
        
        PS->>LS: Debit 200 points
        LS->>DB: UPDATE loyalty_accounts SET available_points = available_points - 200
        LS->>DB: INSERT loyalty_point_transactions (type: REDEEM, points: -200)
        
        PS->>DB: INSERT payment (amount: 100, loyalty_points_used: 200, loyalty_discount: 10.00)
        PS->>DB: INSERT transactions (debit + credit)
        PS->>DB: COMMIT

        PS-->>C: 200 OK {paymentId, totalAmount: 100, bankCharged: 90, pointsUsed: 200, pointsValue: 10}
    end
```

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
