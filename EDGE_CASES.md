# Mitra Finance — Edge Cases

> This document serves as a **Jury Q&A Shield** — anticipating and answering the hardest questions evaluators will ask. Every scenario has been analyzed with concrete answers.

## Table of Contents
1. [Biometric & Identity Edge Cases](#1-biometric--identity-edge-cases)
2. [Connectivity & Offline Edge Cases](#2-connectivity--offline-edge-cases)
3. [AI & Interview Edge Cases](#3-ai--interview-edge-cases)
4. [Data Consistency & Sync Edge Cases](#4-data-consistency--sync-edge-cases)
5. [Regulatory & Compliance Edge Cases](#5-regulatory--compliance-edge-cases)
6. [Business & Fraud Edge Cases](#6-business--fraud-edge-cases)
7. [Scalability Edge Cases](#7-scalability-edge-cases)
8. [Model & Scoring Edge Cases](#8-model--scoring-edge-cases)

---

## 1. Biometric & Identity Edge Cases

### EC-BIO-01: Customer Has No Aadhaar
**Scenario**: A customer in a remote tribal area was never enrolled in Aadhaar.

**Answer**: 
- Fall back to **Offline KYC**: Mitra photographs physical government ID (Voter ID, Ration Card, Birth Certificate)
- OCR extracts data; application flagged as `MANUAL_KYC`
- A Compliance Officer must manually verify before loan can be approved
- Loan amount capped at ₹2,000 (Level 4 trust) until eKYC is completed
- Mitra is guided to help customer enroll in Aadhaar at nearest CSC center

---

### EC-BIO-02: Elderly Customer's Fingerprints Are Worn/Smooth
**Scenario**: A 70-year-old farmer's fingers are worn from decades of labor — biometric capture fails consistently.

**Answer**:
- System automatically detects 3 consecutive biometric failures → switches to Level 2
- Face liveness check attempted (Google ML Kit, on-device)
- If face match succeeds: auth granted with limited trust (max ₹5K loan)
- If face also fails (e.g., limited light in hut): Aadhaar OTP on enrolled mobile — Level 3 trust (max ₹2K)
- Mitra can schedule repeat visit with USB fingerprint scanner (Mantra MFS100) — better resolution for worn prints
- **Design justification**: This is a known real-world problem for Bank Mitras. All 4 levels of fallback were designed with this exact persona in mind.

---

### EC-BIO-03: Customer's Aadhaar-Linked Mobile Number Changed
**Scenario**: Customer changed their SIM but didn't update their Aadhaar-linked number. OTP goes to old number they no longer have.

**Answer**:
- UIDAI OTP path blocked; system automatically offers alternative path
- Mitra prompts customer to use UIDAI's self-service portal (myAadhaar) to update mobile — shown as guided QR code
- Meanwhile: Face liveness KYC attempted as interim measure
- Application approved in Level 2 trust (₹5K cap) until Aadhaar mobile is updated
- **Action item for platform**: Partner with local CSC centers to facilitate Aadhaar mobile updates

---

### EC-BIO-04: Child Mixed Into Adult's KYC Session (Age Verification)
**Scenario**: A Mitra accidentally starts KYC with a 16-year-old instead of their parent.

**Answer**:
- Aadhaar eKYC returns DOB
- System calculates age = Current date − DOB
- If age < 18: Application immediately blocked; error shown to Mitra
- Audit log records the attempt with Mitra ID
- **Design note**: This check is mandatory at kyc_verify step; cannot be bypassed by Mitra

---

## 2. Connectivity & Offline Edge Cases

### EC-CONN-01: Connection Lost Mid-KYC After OTP Verified But Before Customer Record Saved
**Scenario**: UIDAI returns eKYC data, face match passes, but the network drops before `POST /customers` reaches the server.

**Answer**:
- eKYC session data is stored in local SQLite (`temp_kyc_sessions` table) immediately after face match
- `pending_operations` queue entry created for `CREATE Customer` with idempotency key
- KYC session has a 30-minute local TTL — Mitra can continue to loan form without re-doing KYC
- On next connectivity: Customer record synced; server detects via idempotency key that this is not a duplicate
- **User experience**: Mitra sees "KYC complete ✅ — syncing in background" immediately

---

### EC-CONN-02: Document Upload Interrupted 70% Through (Large File)
**Scenario**: A 3MB land record scan is 70% uploaded when the signal drops.

**Answer**:
- System uses **resumable uploads** (S3 Multipart Upload)
- Each document is split into 500KB chunks; each chunk uploaded separately
- On reconnect: System checks S3 for already-uploaded chunks, resumes from the last successful chunk
- If multipart session expires (> 24h offline): File re-compressed and restarted
- **Fallback**: If S3 multipart not possible (old Android WebView), entire file queued as BLOB in SQLite and uploaded fresh

---

### EC-CONN-03: Mitra Device Battery Dies During Sync
**Scenario**: Device shuts down while syncing — half the queue uploaded.

**Answer**:
- All operations in SQLite are atomic transactions: an operation is only marked `SYNCED` after server acknowledgement is received AND SQLite updated
- If device dies mid-sync: on restart, `SYNCING` status items are reset to `PENDING`
- Server uses idempotency keys: any duplicate re-submission returns cached result (`409 DUPLICATE → SYNCED`)
- **No data loss guaranteed**: SQLite WAL journal survives sudden process termination

---

### EC-CONN-04: Mitra Uses App for 3+ Days Offline
**Scenario**: A Mitra serves a remote cluster of villages for 3 days with zero connectivity.

**Answer**:
- SQLite WAL journal holds up to **50,000 operations** (tested capacity)
- 3 days × ~30 customers/day = ~90 customers; ~450 operations — well within capacity
- Offline biometric tokens (8h TTL) are refreshed each time customer is re-authenticated using cached token for repeat visits
- On-device AI scores all loans; scoring flagged as `is_offline_score=true`
- On connectivity restoration: All 450 items sync within ~2 minutes; server re-scores with full feature vector

---

## 3. AI & Interview Edge Cases

### EC-AI-01: Customer Speaks an Unrecognized Dialect
**Scenario**: Customer speaks Santali (Ol Chiki script/dialect) — not in the 12 supported dialects.

**Answer**:
- FastText LangID returns `confidence < 0.60` for unrecognized dialect
- System prompts Mitra: "Unable to detect dialect. Please select manually."
- Mitra selects closest dialect (e.g., Bengali for Santali-Bengali speakers) or chooses "Hindi (Simplified)"
- Interview conducted in selected dialect; ASR/TTS quality may be lower
- Mitra can manually fill all interview slots if AI extraction confidence < 0.60
- **Long-term**: Flag sessions with low dialect confidence; ML team analyzes patterns; new dialect model trained if volume justifies

---

### EC-AI-02: Customer Gives Inconsistent Income Information
**Scenario**: Customer says "₹8,000/month" in answer 3, then says "I don't earn much — maybe ₹1,500" in answer 7.

**Answer**:
- Contradiction detection in slot-filling engine flags `monthly_income` as inconsistent
- LLM agent generates a clarification question: "Earlier you mentioned earning ₹8,000. Just to confirm, what is a typical month's income for you?"
- Final value always shown to Mitra for confirmation before submission
- Both responses stored in `credit_interviews.structured_output` for audit
- **Credit impact**: Scoring model uses the Mitra-confirmed value; inconsistency noted as a minor negative factor in interview confidence score

---

### EC-AI-03: ASR Hallucination — AI Transcribes a Number Wildly Wrong
**Scenario**: Customer says "पाँच हजार" (five thousand); ASR transcribes as "पचास हजार" (fifty thousand).

**Answer**:
- Sanity check: ₹50,000/month income would be flagged as "high for agricultural rural" — highlighted in yellow to Mitra
- Mitra sees extracted field: `monthly_income: ₹50,000 (⚠️ Verify — High value)`
- Mitra corrects to ₹5,000
- The corrected value is stored alongside the original ASR transcription
- **Design principle**: AI extracts, Mitra confirms. No AI value is ever submitted without Mitra's review for fields with confidence < 0.85.

---

### EC-AI-04: Customer Refuses to Participate in Voice Interview
**Scenario**: Customer is shy, distrustful of "the machine listening," or simply cannot speak (mute).

**Answer**:
- Voice interview is a data collection tool, not a gate
- Mitra can **skip the voice interview entirely** and manually enter all income/asset fields
- Manual entry triggers a manual review flag on the credit score (`data_source: MANUAL_ENTRY`)
- Scoring model still runs with available signals (utilities, MGNREGA, etc.)
- Approved loan amount capped at 70% of AI-recommended amount for manual-entry applications (risk adjustment)

---

## 4. Data Consistency & Sync Edge Cases

### EC-SYNC-01: Same Customer Onboarded by Two Different Mitras
**Scenario**: Rama Devi visits Mitra A in her village on Monday. Mitra B (her SHG leader) also tries to onboard her on Wednesday.

**Answer**:
- Both Mitras complete Aadhaar OTP verification → system returns the **same VID** (Virtual ID is deterministic for a given Aadhaar)
- Server detects: `INSERT INTO customers WHERE virtual_id = {VID}` → `UNIQUE CONSTRAINT VIOLATION`
- Server response to Mitra B: `409 CONFLICT — Customer already exists. Mitra A is the onboarding agent.`
- Mitra B can **view** the customer (read-only); cannot create a duplicate
- If Mitra A is unreachable, Mitra B can request a "Transfer Ownership" via Compliance Officer

---

### EC-SYNC-02: Mitra Submits Duplicate Application (Tap Twice Bug)
**Scenario**: Mitra taps "Submit" twice in quick succession — app sends two identical `POST /loans` requests.

**Answer**:
- Each loan submission carries a `clientIdempotencyKey` (UUID generated client-side when application is first created, not on submit)
- First POST: Server creates loan, stores key in Redis with 24h TTL, returns `201 Created`
- Second POST: Server finds key in Redis → returns the **same** cached `201 Created` response
- **Result**: Exactly one loan record created; Mitra sees one application ID

---

### EC-SYNC-03: Loan Application Status Diverges — Device Says SUBMITTED, Server Says APPROVED
**Scenario**: Server approved the loan via Credit Officer while Mitra device was offline. Device syncs and sees its local record says SUBMITTED.

**Answer**:
- During sync, server returns `pending-acknowledgements` array with updated statuses
- `WorkManager` receives `{ entityType: LoanApplication, entityId: X, newStatus: APPROVED }`
- Local SQLite record updated: `status = APPROVED`
- Mitra gets in-app notification: "🎉 Loan for Rama Devi — APPROVED ₹35,000"
- **No conflict**: Status transitions on server always win; device is a display layer for server state

---

## 5. Regulatory & Compliance Edge Cases

### EC-REG-01: Customer Revokes Consent Mid-Loan-Processing
**Scenario**: Loan application is Under Review. Customer calls Mitra to revoke their MGNREGA data consent.

**Answer**:
- Consent revoked → Kafka `ConsentRevoked` event published
- Credit Scoring Engine receives event: **removes MGNREGA signal** from active feature pipeline for this customer
- If loan is UNDER_REVIEW: Credit Officer is notified — "Customer has revoked MGNREGA data consent. Score may have changed."
- System re-scores with remaining consented signals
- New score may change the risk band → loan re-routed accordingly
- **DPDP compliance**: Process completed; original score archived noting it included revoked data (for audit)

---

### EC-REG-02: RBI Changes Loan Limit for Bank Mitras Mid-Quarter
**Scenario**: RBI issues a circular reducing BC agent loan origination limit from ₹2L to ₹1L effective immediately.

**Answer**:
- Routing rules are stored as **hot-reloadable JSON configuration** (not hardcoded)
- Compliance Officer updates the `routing_rules.json` config in Admin Panel
- Config is pushed to API Gateway (Kong) and Loan Workflow Engine via config service
- **No deployment needed**: New limit enforced within 30 seconds of config update
- All applications submitted after the config update are validated against new limits
- Applications already Under Review when limit changed: Compliance Officer decides case-by-case (grace period policy)

---

### EC-REG-03: Data Residency Audit — "Where is our customer data actually stored?"
**Scenario**: DPBI (Data Protection Board of India) auditor asks for proof that all PII stays in India.

**Answer**:
- AWS Region: **ap-south-1 (Mumbai)** only
- S3 bucket policy: `"Condition": { "StringNotEquals": { "aws:RequestedRegion": "ap-south-1" } }` → deny
- RDS PostgreSQL: Single-AZ in ap-south-1 with read replicas also in ap-south-1
- Kafka MSK: Mumbai AZ-a + AZ-b only
- AI Cloud Inference (Sarvam AI): India-hosted data center; DPA signed; audio deleted after transcription
- **Audit trail**: CloudTrail logs all S3 API calls; tag-based resource policy enforced by AWS Control Tower

---

## 6. Business & Fraud Edge Cases

### EC-FRAUD-01: Mitra Submits Fake Applications for Commission
**Scenario**: A Mitra creates fictitious customers using fabricated Aadhaar details to earn per-application incentives.

**Answer**:
- **Aadhaar VID verification**: UIDAI validates OTP and returns eKYC — impossible to fabricate without real Aadhaar
- **Face liveness**: Customer must be physically present for face check — cannot use a photo
- **GPS stamping**: Every session stamped with GPS coordinates; Mitra submitting 40 applications from same GPS coordinate in 2 hours is flagged
- **Velocity check**: > 15 applications/day from single Mitra triggers Compliance review
- **Peer anomaly detection**: Mitra approval rate > 3 std devs above peer average → automatic audit
- **Response to detection**: Mitra account suspended; pending loans frozen; Compliance Officer investigation

---

### EC-FRAUD-02: Customer Uses Loan for Non-Stated Purpose (Diversion Risk)
**Scenario**: Customer says loan is for "purchasing seeds" but uses it for speculation.

**Answer**:
- Mitra Finance is not responsible for end-use once disbursed to Jan Dhan account — this is standard microfinance practice
- **Mitigation via loan type**: AGRICULTURE loans disbursed in tranches (₹50% upfront, ₹50% after 30 days) — reduces one-shot diversion risk
- **Post-disbursement check**: For loans > ₹25K, Mitra conducts a 30-day follow-up visit (field verification)
- **Long-term**: Repayment behavior becomes a training signal for credit model (good/bad outcome); purpose-aligned disbursement improves model over time

---

### EC-FRAUD-03: Mitra Device is Stolen
**Scenario**: A Mitra's Android device is stolen with customer data in SQLite.

**Answer**:
- **SQLite encrypted with SQLCipher**: Encryption key stored in Android Keystore (hardware-backed TEE)
- Stolen device: attacker cannot read SQLite without biometric or PIN that unlocks the Keystore
- **Remote wipe**: Admin Panel triggers MDM remote-wipe command → Keystore cleared → SQLite becomes unreadable
- Mitra reports theft → account suspended → new device provisioned with new certificate
- **PII exposure risk**: Even if somehow decrypted, stored data is: VID (not raw Aadhaar), encrypted phone numbers, loan form data — not payment card numbers or account numbers

---

## 7. Scalability Edge Cases

### EC-SCALE-01: All 10K Mitras Sync After a Multi-State Power Cut
**Scenario**: 3-hour power outage in Bihar and UP; 8,000 Mitras reconnect simultaneously.

**Answer**: See [OFFLINE_SYNC_STRATEGY.md — Sync Storm Handling](./OFFLINE_SYNC_STRATEGY.md#sync-storm-handling-10k-mitras)
- SQS absorbs traffic spikes (unlimited queue depth)
- Sync API returns `202 Accepted` immediately — devices don't wait
- Processors scale 10 → 200 workers via ECS Auto-Scaling based on SQS depth
- Estimated 8,000 × 50 ops = 400,000 ops cleared in under **2 minutes**

---

### EC-SCALE-02: Credit Scoring Model Called 100,000 Times in a Day
**Scenario**: Peak day — 100,000 loan applications submitted (harvest season loan surge).

**Answer**:
- Credit Scoring Engine is stateless and horizontally scalable → Kubernetes HPA scales pods
- Each scoring request is CPU-bound (LightGBM inference ~8ms/request)
- 100,000 requests over 8 hours = ~3.5 req/sec → trivially handled by 5 scoring pods
- External API calls (MGNREGA, Agri) are pre-fetched and cached (Redis, 24h TTL) to avoid hammering government APIs

---

### EC-SCALE-03: LLM API Rate Limit Exceeded During Peak Interview Hours
**Scenario**: 2,000 Mitras simultaneously running voice interviews; Sarvam AI has a 500 req/min limit.

**Answer**:
- Credit interview sessions are not time-critical — they can proceed on-device
- **Automatic fallback**: When Sarvam AI returns `429 Too Many Requests`, session switches to Phi-2 ONNX (fully on-device)
- Interview quality is slightly lower, but the core data points are still collected
- **LLM cache**: Common question/response pairs cached in Redis (common follow-ups for income questions)
- **Rate limit contract**: Negotiate dedicated API quota with Sarvam AI for production; implement token bucket (Redis) to smooth request rate

---

## 8. Model & Scoring Edge Cases

### EC-MODEL-01: New Credit Model Returns Wildly Different Scores From Previous Model
**Scenario**: After quarterly retraining, the new LightGBM model gives 150-point lower scores for agricultural borrowers.

**Answer**:
- **Canary deployment**: New model tested on 5% of traffic for 2 weeks before promotion
- **Monitoring dashboard**: Score distribution tracked per model version; alert fires if distribution shifts > 15%
- **Version rollback**: Old model remains tagged in `ml_model_registry`; Admin can set `is_active=FALSE` on new version → old version re-activated in < 60 seconds
- **Root cause analysis**: SHAP importance scores compared between old and new model to identify which feature changed behavior

---

### EC-MODEL-02: Alt Data Source (MGNREGA API) Is Down for 2 Weeks
**Scenario**: Government MGNREGA API undergoes maintenance for 2 weeks; work record data unavailable.

**Answer**:
- `AltDataAggregator` has circuit breaker per external source (see ARCHITECTURE.md)
- MGNREGA circuit breaker `OPEN` → feature excluded from scoring vector
- Scoring model trained to handle missing features (imputation with mean during training)
- Impact: ~14% of predictive power lost; AUC drops from 0.86 to ~0.81 (estimated)
- Affected decisions: Medium-risk loans may be over/under-scored → human review rate temporarily increased
- Alert to Credit Officers: "MGNREGA data temporarily unavailable. Manual income verification recommended for agricultural loans."

---

### EC-MODEL-03: AI Interview Gives a Financially Illiterate Customer an Unfairly Low Score
**Scenario**: A genuinely creditworthy customer performs poorly in the AI interview (nervous, speaks in fragments, gives incomplete answers) — scores 480 (HIGH risk).

**Answer**:
- **Mitra override mechanism**: Mitra can flag the application as "Interview quality concern — customer nervous/nervous" with a text note
- This flag adds a `MITRA_QUALITY_FLAG` that upgrades the review path to human-in-loop (mandatory L1 review regardless of score)
- Credit Officer sees the flag and the interview transcript; can override if on-ground evidence supports creditworthiness
- Officer override with reason code is tracked; high override rates feed back to ML team for model improvement
- **Long-term**: Model retrained to weight `interview_confidence` as a meta-feature rather than just individual slot confidence

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Design Complete
