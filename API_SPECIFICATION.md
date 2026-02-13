# PayFlow - API Specification

> **⚠️ Core Requirements**: API endpoints support [KEY_REQUIREMENTS.md](./KEY_REQUIREMENTS.md).

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)

---

## Overview

- **Base URL**: `https://api.payflow.com/api/v1`
- **Protocol**: HTTPS (TLS 1.3)
- **Format**: JSON (application/json)
- **Auth**: Bearer JWT (OAuth 2.0 + PKCE for mobile)
- **Rate Limiting**: 100 req/min (customer), 500 req/min (merchant), 2000 req/min (admin)
- **Versioning**: URL path versioning (`/v1/`, `/v2/`)

---

## Authentication

### Register
```
POST /auth/register
```
**Request**:
```json
{
  "fullName": "Ahmed Al-Rashid",
  "phone": "+966501234567"
}
```
**Response** (200):
```json
{
  "message": "OTP sent",
  "otpExpiresIn": 300
}
```

### Verify OTP
```
POST /auth/verify-otp
```
**Request**:
```json
{
  "phone": "+966501234567",
  "otp": "482916",
  "pin": "1234"
}
```
**Response** (201):
```json
{
  "userId": "uuid",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 900
}
```

### Refresh Token
```
POST /auth/refresh
```
**Request**:
```json
{ "refreshToken": "eyJ..." }
```
**Response** (200):
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 900
}
```

---

## Error Handling

All errors follow a standard format:

```json
{
  "error": {
    "code": "PAYMENT_INSUFFICIENT_FUNDS",
    "message": "Insufficient funds in the selected bank account",
    "details": {
      "requiredAmount": 100.00,
      "availableBalance": 45.50
    },
    "traceId": "abc-123-def"
  }
}
```

### Standard Error Codes
| HTTP | Code | Description |
|------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions / Transaction blocked |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate resource (phone, IBAN, idempotency key) |
| 410 | GONE | Resource expired (QR code, OTP) |
| 422 | UNPROCESSABLE | Business logic failure (KYC, insufficient funds) |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Endpoints

### User Management

#### Link Bank Account
```
POST /users/me/bank-accounts
Authorization: Bearer {token}
```
**Request**:
```json
{
  "iban": "SA0380000000608010167519",
  "bankName": "Al Rajhi Bank",
  "accountHolderName": "Ahmed Al-Rashid"
}
```
**Response** (201):
```json
{
  "id": "uuid",
  "bankName": "Al Rajhi Bank",
  "ibanMasked": "SA03****7519",
  "status": "pending_verification",
  "isPrimary": true
}
```

#### Get User Profile
```
GET /users/me
Authorization: Bearer {token}
```
**Response** (200):
```json
{
  "id": "uuid",
  "fullName": "Ahmed Al-Rashid",
  "phoneMasked": "+966*****567",
  "kycStatus": "verified",
  "bankAccounts": [
    {
      "id": "uuid",
      "bankName": "Al Rajhi Bank",
      "ibanMasked": "SA03****7519",
      "status": "active",
      "isPrimary": true
    }
  ],
  "loyaltyTier": "silver",
  "loyaltyPoints": 250
}
```

#### Complete KYC
```
POST /users/me/kyc
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Fields**: `idFront` (file), `idBack` (file), `selfie` (file)

**Response** (202):
```json
{
  "status": "in_review",
  "estimatedCompletionHours": 24
}
```

---

### Merchant Management

#### Onboard Merchant (Admin only)
```
POST /merchants
Authorization: Bearer {admin_token}
```
**Request**:
```json
{
  "businessName": "Café Arabica",
  "registrationNumber": "CR-1234567890",
  "category": "food_beverage",
  "contactPhone": "+966509876543",
  "settlementIBAN": "SA0380000000608010167519",
  "address": "King Fahd Road, Riyadh"
}
```
**Response** (201):
```json
{
  "id": "uuid",
  "businessName": "Café Arabica",
  "status": "active",
  "staticQRUrl": "https://cdn.payflow.com/qr/merchant-uuid.png",
  "dashboardUrl": "https://merchant.payflow.com/login"
}
```

#### Rate Merchant
```
POST /merchants/{merchantId}/ratings
Authorization: Bearer {token}
```
**Request**:
```json
{
  "stars": 5,
  "review": "Excellent service and quick payment processing"
}
```
**Response** (201):
```json
{
  "id": "uuid",
  "stars": 5,
  "merchantRatingAverage": 4.7,
  "totalRatings": 128
}
```

---

### Payment Operations

#### Send Payment (P2P / P2M)
```
POST /payments
Authorization: Bearer {token}
Idempotency-Key: {client-uuid}
```
**Request**:
```json
{
  "recipientPhone": "+966507654321",
  "amount": 150.00,
  "currency": "SAR",
  "sourceBankAccountId": "uuid",
  "description": "Lunch split",
  "pin": "1234",
  "loyaltyPointsToUse": 0
}
```
**Response** (200):
```json
{
  "paymentId": "uuid",
  "status": "completed",
  "amount": 150.00,
  "fee": 0.00,
  "referenceNumber": "PF-2026021300001",
  "recipientName": "Sara Ahmed",
  "completedAt": "2026-02-13T10:30:00Z",
  "loyaltyPointsEarned": 15
}
```

#### Get Payment Status
```
GET /payments/{paymentId}
Authorization: Bearer {token}
```
**Response** (200):
```json
{
  "id": "uuid",
  "status": "completed",
  "type": "p2p",
  "amount": 150.00,
  "fee": 0.00,
  "sender": { "name": "Ahmed", "phoneMasked": "+966*****567" },
  "recipient": { "name": "Sara", "phoneMasked": "+966*****321" },
  "referenceNumber": "PF-2026021300001",
  "initiatedAt": "2026-02-13T10:29:58Z",
  "completedAt": "2026-02-13T10:30:00Z"
}
```

---

### QR Code Management

#### Decode QR Code
```
POST /qr/decode
Authorization: Bearer {token}
```
**Request**:
```json
{
  "payload": "payflow://pay/merchant-uuid?amount=75.50&ref=inv-001"
}
```
**Response** (200):
```json
{
  "recipientId": "merchant-uuid",
  "recipientType": "merchant",
  "recipientName": "Café Arabica",
  "amount": 75.50,
  "reference": "inv-001",
  "qrType": "dynamic",
  "expiresAt": "2026-02-13T11:00:00Z"
}
```

#### Generate Dynamic QR
```
POST /qr/generate
Authorization: Bearer {token}
```
**Request**:
```json
{
  "amount": 50.00,
  "expiresInMinutes": 15
}
```
**Response** (201):
```json
{
  "qrId": "uuid",
  "payload": "payflow://pay/user-uuid?amount=50.00&exp=1707826200",
  "imageUrl": "https://cdn.payflow.com/qr/dynamic/uuid.png",
  "expiresAt": "2026-02-13T11:45:00Z"
}
```

#### Download QR Image
```
GET /qr/{qrId}/download?format=png
Authorization: Bearer {token}
```
**Response**: Binary image file (PNG/SVG)

---

### Transaction History

#### List Transactions
```
GET /transactions?page=1&limit=20&from=2025-01-01&to=2026-02-13&direction=debit
Authorization: Bearer {token}
```
**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "payment",
      "direction": "debit",
      "amount": 150.00,
      "counterpartyName": "Sara Ahmed",
      "referenceNumber": "PF-2026021300001",
      "createdAt": "2026-02-13T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  }
}
```

#### Email Receipt
```
POST /transactions/{txId}/receipt
Authorization: Bearer {token}
```
**Request**:
```json
{
  "email": "ahmed@example.com"
}
```
**Response** (202):
```json
{
  "message": "Receipt will be sent to ahmed@example.com"
}
```

---

### Loyalty & Cashback

#### Get Loyalty Status
```
GET /loyalty/me
Authorization: Bearer {token}
```
**Response** (200):
```json
{
  "tier": "gold",
  "availablePoints": 2350,
  "lifetimePoints": 8200,
  "nextTier": "platinum",
  "pointsToNextTier": 2650,
  "pointsValue": "$23.50"
}
```

#### List Cashback Campaigns (Admin)
```
GET /admin/cashback-campaigns?status=active
Authorization: Bearer {admin_token}
```
**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Visa Summer Cashback",
      "cardNetwork": "visa",
      "cashbackValue": 5.0,
      "cashbackType": "percentage",
      "totalBudget": 100000.00,
      "spentBudget": 34500.00,
      "status": "active",
      "startDate": "2026-06-01",
      "endDate": "2026-08-31"
    }
  ]
}
```

---

### Fraud Management (Admin)

#### Get Fraud Alert Queue
```
GET /admin/fraud-alerts?status=pending_review
Authorization: Bearer {admin_token}
```
**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "paymentId": "uuid",
      "riskScore": 78,
      "riskFactors": ["velocity_exceeded", "new_device"],
      "status": "pending_review",
      "flaggedAt": "2026-02-13T09:15:00Z"
    }
  ]
}
```

#### Review Fraud Alert
```
PUT /admin/fraud-alerts/{alertId}
Authorization: Bearer {admin_token}
```
**Request**:
```json
{
  "decision": "approved",
  "notes": "Verified with customer via phone"
}
```

---

### Notifications

#### Get Notification Preferences
```
GET /notifications/preferences
Authorization: Bearer {token}
```

#### Update Notification Preferences
```
PUT /notifications/preferences
Authorization: Bearer {token}
```
**Request**:
```json
{
  "transactions": { "push": true, "sms": true, "email": false },
  "promotions": { "push": true, "sms": false, "email": true },
  "security": { "push": true, "sms": true, "email": true }
}
```

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
