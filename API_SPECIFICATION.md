# Mitra Finance — API Specification

> **⚠️ Core Requirements**: APIs map to [ACTORS_AND_USE_CASES.md](./ACTORS_AND_USE_CASES.md) and are secured per [SECURITY_DESIGN.md](./SECURITY_DESIGN.md).

All APIs are:
- **Base URL**: `https://api.mitrafinance.in/v1`
- **Auth**: `Authorization: Bearer <JWT>` (Mitra token) or `X-Device-Cert: <certificate>` (mTLS)
- **Content-Type**: `application/json` (unless specified as `application/protobuf` for sync endpoints)
- **Error Format**: `{ "error": { "code": "ERR_CODE", "message": "...", "requestId": "uuid" } }`

---

## Table of Contents
1. [Authentication & KYC](#1-authentication--kyc)
2. [Customers](#2-customers)
3. [Loan Applications](#3-loan-applications)
4. [Credit Interview & Scoring](#4-credit-interview--scoring)
5. [Consent Management](#5-consent-management)
6. [Sync (Offline-First)](#6-sync-offline-first)
7. [Loan Workflow & Decisions](#7-loan-workflow--decisions)
8. [Notifications](#8-notifications)
9. [Admin & Reporting](#9-admin--reporting)

---

## 1. Authentication & KYC

### POST `/auth/kyc/initiate`
Initiate Aadhaar OTP for customer KYC.

**Request**:
```json
{
  "phoneNumber": "+919876543210",
  "mitraId": "uuid-mitra-123"
}
```
**Response** `202 Accepted`:
```json
{
  "sessionId": "kyc-session-uuid",
  "otpExpiry": "2026-02-20T11:54:06Z",
  "message": "OTP sent to Aadhaar-linked mobile"
}
```
**Errors**: `400 BAD_PHONE`, `503 UIDAI_UNAVAILABLE`

---

### POST `/auth/kyc/verify`
Verify Aadhaar OTP and retrieve masked eKYC data.

**Request**:
```json
{
  "sessionId": "kyc-session-uuid",
  "virtualId": "9876 5432 1234 5678",
  "otp": "847392"
}
```
**Response** `200 OK`:
```json
{
  "verified": true,
  "maskedAadhaar": "XXXX-XXXX-3210",
  "ekycData": {
    "name": "Ramesh Kumar",
    "dob": "1985-04-12",
    "gender": "M",
    "address": "Village Sarai, Dist. Varanasi, UP",
    "photoBase64": "<base64-encoded-face-image>"
  },
  "consentRequired": ["AADHAAR_EKYC"],
  "biometricTokenExpiry": "2026-02-20T19:49:06Z"
}
```
**Errors**: `401 OTP_INVALID`, `410 OTP_EXPIRED`

---

### POST `/auth/mitra/login`
Mitra app login using phone + TOTP.

**Request**:
```json
{
  "phoneNumber": "+919876543210",
  "totp": "847392",
  "deviceCertificate": "-----BEGIN CERTIFICATE-----..."
}
```
**Response** `200 OK`:
```json
{
  "accessToken": "eyJhbGciOiJS...",
  "refreshToken": "rt-uuid",
  "expiresIn": 900,
  "mitraProfile": {
    "id": "uuid", "name": "Sunita Devi", "region": "Bihar-North"
  }
}
```

---

## 2. Customers

### POST `/customers`
Create a new customer profile post-KYC.

**Request**:
```json
{
  "virtualId": "9876 5432 1234 5678",
  "maskedAadhaar": "XXXX-XXXX-3210",
  "name": "Ramesh Kumar",
  "dialect": "bhojpuri",
  "mitraId": "uuid-mitra-123",
  "kycSessionId": "kyc-session-uuid"
}
```
**Response** `201 Created`:
```json
{
  "customerId": "cust-uuid-456",
  "kycStatus": "VERIFIED",
  "kycExpiresAt": "2028-02-20T00:00:00Z"
}
```

---

### GET `/customers/{customerId}`
Retrieve customer profile (masked PII only).

**Response** `200 OK`:
```json
{
  "id": "cust-uuid-456",
  "maskedAadhaar": "XXXX-XXXX-3210",
  "dialect": "bhojpuri",
  "kycStatus": "VERIFIED",
  "abhaLinked": false,
  "activeLoans": 0
}
```

---

## 3. Loan Applications

### POST `/loans`
Submit a new loan application.

**Request**:
```json
{
  "customerId": "cust-uuid-456",
  "mitraId": "uuid-mitra-123",
  "loanType": "AGRICULTURE",
  "requestedAmount": 35000,
  "tenureMonths": 12,
  "interviewId": "intv-uuid-789",
  "clientIdempotencyKey": "client-generated-uuid"
}
```
**Response** `201 Created`:
```json
{
  "loanId": "loan-uuid-001",
  "status": "SUBMITTED",
  "creditScoreId": "score-uuid-001",
  "creditScore": 672,
  "riskBand": "MEDIUM",
  "routedTo": "L1_CREDIT_OFFICER",
  "expectedDecisionBy": "2026-02-20T15:49:06Z"
}
```
**Errors**: `409 DUPLICATE_APPLICATION` (when idempotencyKey already exists)

---

### GET `/loans/{loanId}`
Get full loan application details.

**Response** `200 OK`:
```json
{
  "id": "loan-uuid-001",
  "customerId": "cust-uuid-456",
  "loanType": "AGRICULTURE",
  "requestedAmount": 35000,
  "approvedAmount": null,
  "status": "UNDER_REVIEW",
  "creditScore": { "score": 672, "riskBand": "MEDIUM" },
  "assignedOfficer": { "id": "officer-uuid", "name": "Ananya Sharma" },
  "documents": [
    { "type": "UTILITY_BILL", "uploadedAt": "2026-02-20T11:49:06Z", "ocrConfidence": 0.92 }
  ],
  "timeline": [
    { "status": "SUBMITTED", "at": "2026-02-20T11:49:06Z" },
    { "status": "UNDER_REVIEW", "at": "2026-02-20T11:50:00Z" }
  ]
}
```

---

### POST `/loans/{loanId}/documents`
Upload a supporting document.

**Content-Type**: `multipart/form-data`
**Request Fields**: `file` (JPEG/PNG < 5MB), `documentType`, `loanId`

**Response** `201 Created`:
```json
{
  "documentId": "doc-uuid-001",
  "documentType": "UTILITY_BILL",
  "ocrExtracted": {
    "providerName": "UP Power Corporation",
    "accountHolder": "Ramesh Kumar",
    "billDate": "2026-01-15",
    "amountPaid": 840,
    "paymentStatus": "PAID"
  },
  "ocrConfidence": 0.92,
  "uploadedAt": "2026-02-20T11:49:06Z"
}
```

---

## 4. Credit Interview & Scoring

### POST `/interviews`
Start a new credit interview session.

**Request**:
```json
{
  "loanApplicationId": "loan-uuid-001",
  "dialect": "bhojpuri",
  "isOffline": false
}
```
**Response** `201 Created`:
```json
{
  "interviewId": "intv-uuid-789",
  "firstQuestion": "आपकी मासिक आमदनी क्या है?",
  "firstQuestionAudioUrl": "https://cdn.mitrafinance.in/tts/q1-bhojpuri.wav"
}
```

---

### POST `/interviews/{interviewId}/turns`
Submit a voice response for the current question.

**Content-Type**: `multipart/form-data`
**Request Fields**: `audioFile` (WAV 16kHz), `turnSequence`

**Response** `200 OK`:
```json
{
  "turnId": "turn-uuid-001",
  "transcription": "हमार महीना कमाई डेढ़ हजार रुपइया हऊ",
  "asrConfidence": 0.87,
  "extractedFields": {
    "monthly_income": { "value": 1500, "unit": "INR", "confidence": 0.84 }
  },
  "nextQuestion": "आपके परिवार में कितने लोग हैं?",
  "nextQuestionAudioUrl": "https://cdn.mitrafinance.in/tts/q2-bhojpuri.wav",
  "isComplete": false
}
```

---

### GET `/scores/{scoreId}`
Retrieve a credit score with explainability.

**Response** `200 OK`:
```json
{
  "id": "score-uuid-001",
  "score": 672,
  "riskBand": "MEDIUM",
  "recommendedMaxAmount": 40000,
  "recommendedTenureMonths": 18,
  "topFactors": [
    { "factor": "UTILITY_PAYMENT_CONSISTENCY", "shapValue": 0.18, "direction": "POSITIVE", "explanation": "12 consecutive on-time electricity bill payments" },
    { "factor": "MGNREGA_EMPLOYMENT", "shapValue": 0.14, "direction": "POSITIVE", "explanation": "145 days employment in past year" },
    { "factor": "LOAN_AMOUNT_TO_INCOME_RATIO", "shapValue": -0.09, "direction": "NEGATIVE", "explanation": "Requested amount is 2.3× monthly income" }
  ],
  "modelVersion": "lgbm-v2.1-2026Q1",
  "isOfflineScore": false,
  "calculatedAt": "2026-02-20T11:50:20Z"
}
```

---

## 5. Consent Management

### POST `/consent`
Grant a new consent.

**Request**:
```json
{
  "customerId": "cust-uuid-456",
  "consentType": "UTILITY_DATA",
  "purpose": "To evaluate creditworthiness for loan origination",
  "expiresAt": "2027-02-20T00:00:00Z",
  "voiceConsentBase64": "<base64-encoded-wav>",
  "mitraId": "uuid-mitra-123"
}
```
**Response** `201 Created`:
```json
{
  "consentId": "cons-uuid-001",
  "status": "GRANTED",
  "grantedAt": "2026-02-20T11:49:06Z",
  "expiresAt": "2027-02-20T00:00:00Z"
}
```

---

### PUT `/consent/{consentId}/revoke`
Revoke an existing consent.

**Request**:
```json
{
  "revokedByMitraId": "uuid-mitra-123",
  "voiceConsentBase64": "<base64-wav-of-revocation>",
  "reason": "CUSTOMER_REQUEST"
}
```
**Response** `200 OK`:
```json
{
  "consentId": "cons-uuid-001",
  "status": "REVOKED",
  "revokedAt": "2026-02-20T12:00:00Z",
  "processingCompletedBy": "2026-02-23T12:00:00Z"
}
```

---

## 6. Sync (Offline-First)

### POST `/sync/batch`
**Content-Type**: `application/x-protobuf`

Upload a batch of locally queued operations to the server.

**Request Body** (protobuf-serialized):
```
SyncBatchRequest {
  mitraId: "uuid-mitra-123",
  deviceId: "device-serial-xyz",
  items: [
    SyncItem {
      clientIdempotencyKey: "client-uuid-001",
      operationType: CREATE,
      entityType: "LoanApplication",
      payload: <protobuf-serialized LoanApplication>,
      priority: 2,
      createdAt: 1740045946000
    }
  ]
}
```

**Response** `200 OK` (JSON):
```json
{
  "sessionId": "sync-session-uuid",
  "itemsReceived": 3,
  "results": [
    { "clientIdempotencyKey": "client-uuid-001", "status": "SYNCED", "serverId": "loan-uuid-001" },
    { "clientIdempotencyKey": "client-uuid-002", "status": "CONFLICT", "resolution": "SERVER_WINS", "serverVersion": "<base64-entity>" }
  ],
  "syncedAt": "2026-02-20T11:55:00Z"
}
```

---

### GET `/sync/pending-acknowledgements/{mitraId}`
Fetch server-side updates the device hasn't received yet.

**Response** `200 OK`:
```json
{
  "updates": [
    { "entityType": "LoanApplication", "entityId": "loan-uuid-001", "newStatus": "APPROVED", "updatedAt": "2026-02-20T11:50:00Z" }
  ]
}
```

---

## 7. Loan Workflow & Decisions

### POST `/loans/{loanId}/decision`
_Requires Credit Officer or Regional Manager role._

**Request**:
```json
{
  "action": "APPROVE",
  "approvedAmount": 35000,
  "approvedTenureMonths": 12,
  "reasonCode": "GOOD_ALT_DATA",
  "notes": "Strong MGNREGA record and consistent utility payments."
}
```
**Response** `200 OK`:
```json
{
  "loanId": "loan-uuid-001",
  "status": "APPROVED",
  "approvedAt": "2026-02-20T13:05:00Z",
  "disbursementExpectedBy": "2026-02-21T11:00:00Z"
}
```

---

## 8. Notifications

### POST `/notifications/subscribe`
Register Mitra device for push notifications.

**Request**: `{ "mitraId": "uuid", "fcmToken": "...", "platform": "ANDROID" }`
**Response** `204 No Content`

---

## 9. Admin & Reporting

### GET `/admin/mitras/{mitraId}/report`
_Requires Admin or Compliance role._

**Response** `200 OK`:
```json
{
  "mitraId": "uuid-mitra-123",
  "period": "2026-02",
  "applicationsSubmitted": 47,
  "approvalRate": 0.83,
  "averageCompletionTime": 13.4,
  "npaRate": 0.021,
  "syncFailures": 2,
  "amlFlagsGenerated": 0
}
```

---

### GET `/admin/reports/rbi-quarterly`
_Requires Compliance role._

**Query Params**: `?quarter=2026Q1&format=json|xlsx`

**Response** `200 OK` or redirect to pre-signed S3 URL for xlsx export.

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
