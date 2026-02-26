# API Specification — CricZone: Local Cricket Community Platform

> RESTful API definitions for 10 service areas. All APIs require `Authorization: Bearer <jwt>` unless marked `[PUBLIC]`. Base URL: `https://api.criczone.in/v1`

---

## 1. Auth APIs

### POST /auth/otp/send
Send OTP to mobile number for registration or login.
```json
// Request
{
  "mobileNumber": "+91-9876543210"
}

// Response 200 OK
{
  "status": "OTP_SENT",
  "otpExpiry": "2024-03-01T10:05:00Z"
}
```

### POST /auth/otp/verify
Verify OTP and receive JWT tokens.
```json
// Request
{
  "mobileNumber": "+91-9876543210",
  "otp": "482931"
}

// Response 200 OK
{
  "userId": "a3f1c2d4-...",
  "jwt": "eyJhbGci...",
  "refreshToken": "rt_Xf2...",
  "role": "PLAYER",
  "isNewUser": true
}

// Error 400 Bad Request
{
  "error": "INVALID_OTP",
  "message": "OTP is incorrect or expired",
  "retryAllowed": true
}
```

### POST /auth/refresh
Refresh expired JWT using refreshToken.
```json
// Request
{ "refreshToken": "rt_Xf2..." }

// Response 200 OK  
{ "jwt": "eyJhbG...", "expiresAt": "2024-03-01T12:00:00Z" }
```

---

## 2. User APIs

### GET /users/{userId}
```json
// Response 200 OK
{
  "userId": "a3f1c2d4-...",
  "name": "Arjun Sharma",
  "mobileNumber": "+91-9876543210",
  "city": "Mumbai",
  "role": "PLAYER",
  "pps": 78.5,
  "ppsGrade": "Good",
  "profilePhotoUrl": "cdn.criczone.in/photos/arjun.jpg",
  "joinedAt": "2024-01-15T10:00:00Z"
}
```

### PUT /users/{userId}/profile
Update user profile fields.
```json
// Request
{
  "name": "Arjun Sharma",
  "city": "Pune",
  "battingStyle": "Right-hand bat",
  "bowlingStyle": "Right-arm medium"
}

// Response 200 OK
{ "status": "UPDATED", "userId": "a3f1c2d4-..." }
```

---

## 3. Tournament APIs

### POST /tournaments
Create a new tournament (Organizer only).
```json
// Request
{
  "name": "Metro T20 Cup 2024",
  "format": "T20",
  "city": "Mumbai",
  "startDate": "2024-03-15",
  "maxTeams": 8,
  "registrationDeadline": "2024-03-10"
}

// Response 201 Created
{
  "tournamentId": "TRN-001",
  "status": "DRAFT",
  "registrationLink": "https://criczone.in/join/TRN-001"
}
```

### GET /tournaments/{id}
```json
// Response 200 OK [PUBLIC]
{
  "tournamentId": "TRN-001",
  "name": "Metro T20 Cup 2024",
  "format": "T20",
  "status": "IN_PROGRESS",
  "city": "Mumbai",
  "teamsCount": 8,
  "matchesPlayed": 5,
  "totalMatches": 15
}
```

### POST /tournaments/{id}/register-team
Team captain registers their team.
```json
// Request
{
  "teamName": "Mumbai Stars",
  "players": [
    { "userId": "U-001", "isCaptain": true },
    { "userId": "U-002", "isViceCaptain": true }
  ]
}

// Response 200 OK
{
  "registrationId": "REG-001",
  "status": "PENDING",
  "message": "Registration submitted. Awaiting organizer approval."
}
```

### GET /tournaments/{id}/points-table
```json
// Response 200 OK [PUBLIC]
{
  "tournamentId": "TRN-001",
  "lastUpdated": "2024-03-18T15:30:00Z",
  "entries": [
    { "rank": 1, "teamName": "Mumbai Stars", "played": 4, "won": 3, "lost": 1, "points": 6, "nrr": "+1.234" },
    { "rank": 2, "teamName": "Andheri XI", "played": 4, "won": 2, "lost": 2, "points": 4, "nrr": "+0.562" }
  ]
}
```

### POST /tournaments/{id}/schedule/auto-generate
```json
// Response 201 Created
{
  "fixturesGenerated": 15,
  "format": "ROUND_ROBIN_THEN_KNOCKOUT",
  "fixtures": [
    { "fixtureId": "F-01", "team1": "Mumbai Stars", "team2": "Andheri XI", "scheduledAt": "2024-03-15T09:00:00Z" }
  ]
}
```

---

## 4. Live Scoring APIs

### POST /matches/{id}/score/ball
Record a ball event during a live match (Scorer only).
```json
// Request
{
  "overNumber": 12,
  "ballNumber": 3,
  "runsScored": 4,
  "batsmanId": "P-001",
  "bowlerId": "P-012",
  "extraType": null,
  "wicketType": null
}

// Response 200 OK
{
  "scorecard": {
    "battingTeam": "Mumbai Stars",
    "score": "87/3",
    "overs": "12.3",
    "currentStriker": { "name": "Arjun", "runs": 52, "balls": 34 },
    "currentBowler": { "name": "Vijay", "overs": "2.3", "runs": 24, "wickets": 2 }
  },
  "lastBall": { "runs": 4, "commentary": "Cracking drive through covers! FOUR!" }
}
```

### GET /matches/{id}/scorecard [PUBLIC]
```json
// Response 200 OK
{
  "matchId": "M-2024-001",
  "status": "IN_PROGRESS",
  "battingTeam": "Mumbai Stars",
  "score": "87/3",
  "overs": "12.3",
  "target": null,
  "recentBalls": ["4", "0", "1", "W", "6", "1"],
  "partnerships": { "current": { "runs": 44, "balls": 30 } },
  "sponsorOverlay": { "name": "SportZone India", "logoUrl": "cdn.criczone.in/sponsors/sportzone.png" }
}
```

### POST /matches/{id}/undo
Undo the last ball event.
```json
// Response 200 OK
{ "status": "UNDONE", "ballsUndoable": 4, "restoredScore": "83/3" }
```

---

## 5. Player Analytics APIs

### GET /players/{id}/stats
```json
// Response 200 OK [PUBLIC]
{
  "playerId": "P-001",
  "name": "Arjun Sharma",
  "pps": 78.5,
  "ppsGrade": "Good",
  "batting": {
    "matches": 42,
    "runs": 1240,
    "average": 38.7,
    "strikeRate": 124.5,
    "centuries": 2,
    "halfCenturies": 8,
    "highScore": 108
  },
  "bowling": {
    "wickets": 15,
    "economy": 7.8,
    "average": 32.4,
    "bestFigures": "3/24"
  },
  "fielding": { "catches": 18, "runOuts": 4 }
}
```

### GET /players/compare?player1={id}&player2={id}
```json
// Response 200 OK [PUBLIC]
{
  "player1": { "name": "Arjun Sharma", "runs": 1240, "pps": 78.5 },
  "player2": { "name": "Rahul Verma", "runs": 980, "pps": 65.2 },
  "winner": { "category": "Overall PPS", "playerId": "P-001" }
}
```

### GET /players/{id}/insights
```json
// Response 200 OK
{
  "insights": [
    { "category": "WEAKNESS", "text": "Strike rate drops 22% against left-arm spin", "confidence": 0.87 },
    { "category": "STRENGTH", "text": "Excellent in powerplay — avg SR 145 in overs 1-6", "confidence": 0.92 }
  ]
}
```

---

## 6. Store & Offers APIs

### GET /stores/nearby?lat={lat}&lng={lng}&radius={km}
```json
// Response 200 OK [PUBLIC]
{
  "stores": [
    {
      "storeId": "STR-001",
      "name": "Sachin Sports Hub",
      "distance": "1.2 km",
      "rating": 4.7,
      "activeOffersCount": 3,
      "address": "Shop 14, MG Road, Pune"
    }
  ]
}
```

### GET /stores/{id}/offers
```json
// Response 200 OK [PUBLIC]
{
  "storeId": "STR-001",
  "offers": [
    {
      "offerId": "OFF-202",
      "title": "20% off Kookaburra bats",
      "discountPercentage": 20.0,
      "validUntil": "2024-03-31",
      "redemptionsLeft": 63
    }
  ]
}
```

### POST /offers/{id}/redeem
```json
// Response 200 OK
{
  "redemptionId": "RDM-8821",
  "qrCode": "CZ-RDM-OFF202-U087-8821",
  "qrCodeImageUrl": "cdn.criczone.in/qr/RDM-8821.png",
  "expiresIn": "24 hours"
}
```

---

## 7. Sponsorship APIs

### POST /sponsorships/requirements
```json
// Request
{
  "tournamentId": "TRN-001",
  "tiers": ["TITLE", "CO_SPONSOR"],
  "expectedReach": 5000,
  "description": "Looking for sponsors for Metro T20 Cup, 8 teams, 3-week tournament"
}

// Response 201 Created
{ "requirementId": "REQ-001", "status": "MATCHING_IN_PROGRESS" }
```

### GET /sponsorships/{id}/roi
```json
// Response 200 OK
{
  "dealId": "SP-001",
  "sponsor": "SportZone India",
  "metrics": {
    "matchViews": 12400,
    "scorecardImpressions": 48000,
    "fanReach": 3200,
    "offerRedemptions": 127
  },
  "period": "2024-03-15 to 2024-03-31"
}
```

---

## 8. Community & Social APIs

### GET /feed
```json
// Response 200 OK
{
  "posts": [
    {
      "postId": "PST-001",
      "author": { "name": "Arjun Sharma", "photoUrl": "..." },
      "type": "MATCH_SUMMARY",
      "content": "Mumbai Stars won vs Andheri XI by 28 runs! 🏆",
      "mediaUrl": null,
      "likesCount": 142,
      "commentsCount": 18,
      "createdAt": "2024-03-17T18:45:00Z"
    }
  ],
  "nextCursor": "eyJwYWdlIjoy..."
}
```

### POST /posts
```json
// Request
{
  "type": "TEXT",
  "content": "What a match yesterday! Arjun's 50 was incredible 🏏 #MetroT20Cup",
  "mediaUrl": null
}

// Response 201 Created
{ "postId": "PST-002", "status": "PUBLISHED" }
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "timestamp": "2024-03-01T10:00:00Z",
  "traceId": "abc-123-xyz"
}
```

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Missing or invalid request body |
| 401 | `UNAUTHORIZED` | JWT missing or expired |
| 403 | `FORBIDDEN` | JWT valid but role not permitted |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Slot already booked, OTP already used |
| 422 | `VALIDATION_FAILED` | Business rule violation (e.g., over limit exceeded) |
| 429 | `RATE_LIMITED` | Too many requests (applies to /auth/* endpoints) |
| 500 | `INTERNAL_ERROR` | Server-side error — include traceId in support requests |
