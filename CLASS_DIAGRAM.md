# PayFlow - Class Diagram

> **⚠️ Core Requirements**: Domain model supports the core requirements defined in [KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md).

## Table of Contents
1. [Overview](#overview)
2. [Domain Layer](#domain-layer)
3. [Service Layer](#service-layer)
4. [Infrastructure Layer](#infrastructure-layer)
5. [Relationship Details](#relationship-details)

---

## Overview

The class diagram is organized into three layers following **Clean Architecture**:
1. **Domain Layer** — Pure business entities and value objects
2. **Service Layer** — Application and domain services
3. **Infrastructure Layer** — External integrations and persistence

---

## Domain Layer

### Core Entities

```mermaid
classDiagram

    class User {
        -UUID id
        -String fullName
        -PhoneNumber phone
        -String passwordHash
        -KYCStatus kycStatus
        -UserStatus status
        -DateTime createdAt
        -DateTime updatedAt
        +register(name, phone, pin)
        +linkBankAccount(iban)
        +unlinkBankAccount(accountId)
        +completeKYC(documents)
        +getTransactionLimit() Money
        +isActive() bool
    }

    class BankAccount {
        -UUID id
        -UUID userId
        -IBAN iban
        -String bankName
        -String accountHolderName
        -BankAccountStatus status
        -bool isPrimary
        -DateTime verifiedAt
        +validate() bool
        +activate()
        +deactivate()
        +setPrimary()
    }

    class Merchant {
        -UUID id
        -String businessName
        -String registrationNumber
        -MerchantCategory category
        -MerchantStatus status
        -UUID contactPersonId
        -IBAN settlementIBAN
        -String staticQRCodeUrl
        -Decimal ratingAverage
        -Integer ratingCount
        -DateTime onboardedAt
        +approve()
        +suspend(reason)
        +reactivate()
        +generateStaticQR() QRCode
        +getSettlementReport(dateRange) Report
        +updateRating(newRating)
    }

    class Payment {
        -UUID id
        -UUID senderId
        -UUID recipientId
        -PaymentType type
        -Money amount
        -Money fee
        -PaymentStatus status
        -PaymentMethod method
        -String idempotencyKey
        -UUID bankTransactionRef
        -String description
        -Integer fraudRiskScore
        -DateTime initiatedAt
        -DateTime completedAt
        +initiate()
        +authorize()
        +complete()
        +fail(reason)
        +reverse()
        +getFinalAmount() Money
    }

    class Transaction {
        -UUID id
        -UUID paymentId
        -UUID userId
        -TransactionType type
        -Money amount
        -Money balanceAfter
        -String referenceNumber
        -TransactionDirection direction
        -String counterpartyName
        -DateTime createdAt
        +generateReceipt() Receipt
        +toSummary() TransactionSummary
    }

    class QRCode {
        -UUID id
        -UUID ownerId
        -QRType type
        -String payload
        -Money amount
        -DateTime expiresAt
        -String imageUrl
        +isExpired() bool
        +decode() QRPayload
        +toImage(format) ByteArray
        +refresh()
    }

    class LoyaltyAccount {
        -UUID id
        -UUID userId
        -LoyaltyTier tier
        -Integer totalPoints
        -Integer availablePoints
        -Integer lifetimePoints
        -DateTime tierEvaluatedAt
        +creditPoints(amount, reason)
        +debitPoints(amount)
        +evaluateTier()
        +getPointsValue() Money
        +getNextTierThreshold() Integer
    }

    class CashbackCampaign {
        -UUID id
        -String name
        -CardNetwork cardNetwork
        -CashbackType cashbackType
        -Decimal cashbackValue
        -Money minTransactionAmount
        -Money totalBudget
        -Money spentBudget
        -CampaignStatus status
        -DateTime startDate
        -DateTime endDate
        +isActive() bool
        +isBudgetAvailable(amount) bool
        +calculateCashback(txAmount) Money
        +deductBudget(amount)
        +pause()
        +resume()
    }

    class MerchantRating {
        -UUID id
        -UUID merchantId
        -UUID customerId
        -Integer stars
        -String review
        -DateTime createdAt
        +validate() bool
    }

    class FraudAlert {
        -UUID id
        -UUID paymentId
        -UUID userId
        -Integer riskScore
        -FraudAlertStatus status
        -String[] riskFactors
        -String deviceFingerprint
        -GeoLocation location
        -DateTime flaggedAt
        -UUID reviewedBy
        -DateTime reviewedAt
        -String reviewNotes
        +approve()
        +block()
        +escalate()
    }

    User "1" --> "*" BankAccount : has
    User "1" --> "*" Payment : sends
    User "1" --> "1" LoyaltyAccount : has
    Merchant "1" --> "*" Payment : receives
    Merchant "1" --> "*" MerchantRating : rated_by
    Payment "1" --> "2" Transaction : generates
    Payment "1" --> "0..1" FraudAlert : may_flag
    QRCode "*" --> "1" User : owned_by
    QRCode "*" --> "1" Merchant : owned_by
```

### Value Objects

```mermaid
classDiagram

    class Money {
        -Decimal amount
        -Currency currency
        +add(Money) Money
        +subtract(Money) Money
        +isPositive() bool
        +isZero() bool
        +format() String
    }

    class IBAN {
        -String value
        -String countryCode
        -String bankCode
        -String accountNumber
        +validate() bool
        +mask() String
        +getBankCode() String
    }

    class PhoneNumber {
        -String countryCode
        -String number
        +validate() bool
        +format() String
        +mask() String
    }

    class GeoLocation {
        -Decimal latitude
        -Decimal longitude
        -String country
        -String city
        +distanceTo(GeoLocation) Decimal
    }

    class QRPayload {
        -UUID recipientId
        -RecipientType recipientType
        -Money amount
        -String reference
        -DateTime expiry
        +encode() String
        +isValid() bool
    }
```

### Enumerations

```mermaid
classDiagram

    class KYCStatus {
        <<enumeration>>
        PENDING
        IN_REVIEW
        VERIFIED
        REJECTED
        EXPIRED
    }

    class PaymentStatus {
        <<enumeration>>
        INITIATED
        FRAUD_CHECK
        AUTHORIZED
        PROCESSING
        COMPLETED
        FAILED
        REVERSED
        EXPIRED
    }

    class PaymentType {
        <<enumeration>>
        P2P
        P2M
        QR_PAYMENT
        POS_PAYMENT
    }

    class LoyaltyTier {
        <<enumeration>>
        SILVER
        GOLD
        PLATINUM
    }

    class MerchantStatus {
        <<enumeration>>
        PENDING_APPROVAL
        ACTIVE
        SUSPENDED
        DEACTIVATED
    }

    class FraudAlertStatus {
        <<enumeration>>
        PENDING_REVIEW
        APPROVED
        BLOCKED
        ESCALATED
    }

    class CardNetwork {
        <<enumeration>>
        VISA
        MASTERCARD
        AMEX
        LOCAL_DEBIT
    }
```

---

## Service Layer

### Application Services

```mermaid
classDiagram

    class UserService {
        -UserRepository userRepo
        -OTPService otpService
        -KYCProvider kycProvider
        +register(RegisterRequest) User
        +verifyOTP(phone, otp) bool
        +linkBankAccount(userId, iban) BankAccount
        +completeKYC(userId, documents) KYCResult
        +getProfile(userId) UserProfile
        +updateProfile(userId, data) User
    }

    class MerchantService {
        -MerchantRepository merchantRepo
        -QRCodeService qrService
        -KYBProvider kybProvider
        +onboardMerchant(MerchantRequest) Merchant
        +approveMerchant(merchantId) Merchant
        +suspendMerchant(merchantId, reason) Merchant
        +rateMerchant(merchantId, customerId, rating) MerchantRating
        +getSettlementReport(merchantId, dateRange) Report
    }

    class PaymentService {
        -PaymentRepository paymentRepo
        -FraudEngine fraudEngine
        -BankingGateway bankGateway
        -LoyaltyService loyaltyService
        -EventPublisher eventPublisher
        +initiatePayment(PaymentRequest) Payment
        +processPayment(paymentId) Payment
        +reversePayment(paymentId, reason) Payment
        +getPaymentStatus(paymentId) PaymentStatus
    }

    class PaymentOrchestrator {
        -PaymentService paymentService
        -FraudEngine fraudEngine
        -BankingGateway bankGateway
        -NotificationService notifier
        +executePaymentSaga(PaymentRequest) PaymentResult
        -validatePayment(request) ValidationResult
        -checkFraud(payment) FraudResult
        -routeToBank(payment) BankResponse
        -handleFailure(payment, error) void
    }

    class TransactionService {
        -TransactionRepository txRepo
        -ArchiveService archiveService
        -ReceiptService receiptService
        +getHistory(userId, filters) Page~Transaction~
        +getTransactionDetail(txId) TransactionDetail
        +generateReceipt(txId) Receipt
        +emailReceipt(txId, email) void
        +archiveOldTransactions() void
    }

    class QRCodeService {
        -QRCodeFactory qrFactory
        -QRCodeRepository qrRepo
        -CDNService cdn
        +generateStaticQR(ownerId) QRCode
        +generateDynamicQR(ownerId, amount) QRCode
        +decodeQR(payload) QRPayload
        +downloadQR(qrId, format) ByteArray
    }

    class NotificationService {
        -PushProvider pushProvider
        -SMSProvider smsProvider
        -EmailProvider emailProvider
        -PreferenceStore preferences
        +sendPaymentConfirmation(payment) void
        +sendFraudAlert(alert) void
        +sendReceipt(txId, email) void
        +getUserPreferences(userId) NotificationPrefs
        +updatePreferences(userId, prefs) void
    }

    class FraudEngine {
        -RuleEngine ruleEngine
        -MLScoringService mlService
        -DeviceFingerprintService deviceService
        -VelocityAggregator velocity
        +scoreTransaction(payment) FraudResult
        +getAlertQueue() List~FraudAlert~
        +reviewAlert(alertId, decision) FraudAlert
    }

    class LoyaltyService {
        -LoyaltyRepository loyaltyRepo
        -PointsCalculator calculator
        +creditPoints(userId, txAmount) void
        +debitPoints(userId, points) void
        +getStatus(userId) LoyaltyAccount
        +evaluateTiers() void
        +calculateRedemptionValue(points) Money
    }

    class CashbackService {
        -CampaignRepository campaignRepo
        -BudgetTracker budgetTracker
        +createCampaign(CampaignRequest) CashbackCampaign
        +checkEligibility(cardBIN, amount) CashbackOffer
        +applyCashback(paymentId) Money
        +getCampaignStats(campaignId) CampaignStats
    }

    PaymentOrchestrator --> PaymentService
    PaymentOrchestrator --> FraudEngine
    PaymentOrchestrator --> NotificationService
    PaymentService --> LoyaltyService
    PaymentService --> CashbackService
```

---

## Infrastructure Layer

### Repositories

```mermaid
classDiagram

    class UserRepository {
        <<interface>>
        +findById(UUID) User
        +findByPhone(PhoneNumber) User
        +save(User) User
        +update(User) User
    }

    class PaymentRepository {
        <<interface>>
        +findById(UUID) Payment
        +findByIdempotencyKey(String) Payment
        +save(Payment) Payment
        +updateStatus(UUID, PaymentStatus) void
    }

    class TransactionRepository {
        <<interface>>
        +findByUserId(UUID, Filters, Pageable) Page~Transaction~
        +findById(UUID) Transaction
        +save(Transaction) Transaction
        +archiveBefore(DateTime) int
    }

    class MerchantRepository {
        <<interface>>
        +findById(UUID) Merchant
        +findByStatus(MerchantStatus) List~Merchant~
        +save(Merchant) Merchant
        +updateRating(UUID, Decimal) void
    }

    class PostgresUserRepository {
        +findById(UUID) User
        +findByPhone(PhoneNumber) User
        +save(User) User
        +update(User) User
    }

    class PostgresPaymentRepository {
        +findById(UUID) Payment
        +findByIdempotencyKey(String) Payment
        +save(Payment) Payment
        +updateStatus(UUID, PaymentStatus) void
    }

    UserRepository <|.. PostgresUserRepository
    PaymentRepository <|.. PostgresPaymentRepository
```

### External Adapters

```mermaid
classDiagram

    class BankingGateway {
        <<interface>>
        +debit(BankAccount, Money, ref) BankResponse
        +credit(BankAccount, Money, ref) BankResponse
        +validateIBAN(IBAN) ValidationResult
        +getBalance(BankAccount) Money
    }

    class BankAAdapter {
        -HttpClient client
        -CircuitBreaker cb
        +debit(BankAccount, Money, ref) BankResponse
        +credit(BankAccount, Money, ref) BankResponse
        +validateIBAN(IBAN) ValidationResult
        +getBalance(BankAccount) Money
    }

    class BankBAdapter {
        -HttpClient client
        -CircuitBreaker cb
        +debit(BankAccount, Money, ref) BankResponse
        +credit(BankAccount, Money, ref) BankResponse
    }

    class WalletAdapter {
        -HttpClient client
        -CircuitBreaker cb
        +debit(BankAccount, Money, ref) BankResponse
        +credit(BankAccount, Money, ref) BankResponse
    }

    class BankRouter {
        -Map~String, BankingGateway~ adapters
        -RouteStrategy strategy
        +route(payment) BankingGateway
        +getHealthStatus() Map~String, HealthStatus~
    }

    BankingGateway <|.. BankAAdapter
    BankingGateway <|.. BankBAdapter
    BankingGateway <|.. WalletAdapter
    BankRouter --> BankingGateway
```

---

## Relationship Details

### Entity Relationships

| Source | Target | Type | Description |
|--------|--------|------|-------------|
| User | BankAccount | 1:N | User can link multiple bank accounts |
| User | Payment (sender) | 1:N | User sends multiple payments |
| User | Transaction | 1:N | User has many transactions |
| User | LoyaltyAccount | 1:1 | Auto-enrolled on registration |
| User | QRCode | 1:N | User can have multiple QR codes |
| Merchant | Payment (recipient) | 1:N | Merchant receives many payments |
| Merchant | MerchantRating | 1:N | Merchant has many ratings |
| Merchant | QRCode | 1:1 | Merchant has one static QR |
| Payment | Transaction | 1:2 | Each payment creates 2 transactions (debit + credit) |
| Payment | FraudAlert | 1:0..1 | Payment may trigger a fraud alert |
| CashbackCampaign | Payment | 1:N | Campaign applies to eligible payments |

### Aggregates

| Aggregate Root | Entities | Value Objects |
|---------------|----------|---------------|
| User | BankAccount | PhoneNumber, IBAN |
| Merchant | MerchantRating | GeoLocation |
| Payment | Transaction, FraudAlert | Money, QRPayload |
| LoyaltyAccount | — | LoyaltyTier |
| CashbackCampaign | — | CardNetwork, Money |

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
