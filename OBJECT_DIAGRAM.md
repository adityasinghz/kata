# Object Diagrams — CricZone: Local Cricket Community Platform

> Three runtime object snapshots capturing real in-memory state during key moments in a CricZone operation.

---

## OD-1: Live Match in Progress (Mid-Innings Snapshot)

```mermaid
flowchart LR
    subgraph match_obj ["match:Match"]
        m1["matchId = 'M-2024-001'"]
        m2["fixtureId = 'F-11'"]
        m3["status = IN_PROGRESS"]
        m4["scorerId = 'U-SCORER-42'"]
    end

    subgraph innings_obj ["innings:Innings (1st)"]
        i1["inningsId = 'INN-001'"]
        i2["battingTeamId = 'T-MUMBAI-STARS'"]
        i3["inningsNumber = 1"]
        i4["totalRuns = 87"]
        i5["totalWickets = 3"]
        i6["oversCompleted = 12"]
        i7["target = null"]
    end

    subgraph batting_1 ["battingCard:BattingCard (Arjun)"]
        b1["batsmanId = 'P-001'"]
        b2["runsScored = 52"]
        b3["ballsFaced = 34"]
        b4["fours = 6"]
        b5["sixes = 2"]
        b6["isOut = false"]
        b7["strikeRate = 152.9"]
    end

    subgraph batting_2 ["battingCard:BattingCard (Rahul)"]
        c1["batsmanId = 'P-007'"]
        c2["runsScored = 22"]
        c3["ballsFaced = 20"]
        c4["isOut = false"]
        c5["strikeRate = 110.0"]
    end

    subgraph bowling_1 ["bowlingCard:BowlingCard (Vijay)"]
        bw1["bowlerId = 'P-012'"]
        bw2["oversBowled = 3"]
        bw3["runsConceded = 24"]
        bw4["wicketsTaken = 2"]
        bw5["economy = 8.0"]
    end

    subgraph last_ball ["lastBallEvent:BallEvent"]
        e1["overNumber = 12"]
        e2["ballNumber = 6"]
        e3["runsScored = 6"]
        e4["wicketType = null"]
        e5["batsmanId = 'P-001'"]
        e6["bowlerId = 'P-012'"]
    end

    subgraph redis_cache ["redisCache:ScoreCache"]
        r1["key = 'match:M-2024-001:scorecard'"]
        r2["score = '87/3'"]
        r3["overs = '12.0'"]
        r4["lastBall = '6 runs - SIX!'"]
        r5["ttl = 60 seconds"]
    end

    match_obj --> innings_obj
    innings_obj --> batting_1
    innings_obj --> batting_2
    innings_obj --> bowling_1
    innings_obj --> last_ball
    innings_obj --> redis_cache
```

---

## OD-2: Tournament Registration Snapshot (7 of 8 Teams Confirmed)

```mermaid
flowchart LR
    subgraph tourney ["tournament:Tournament"]
        t1["tournamentId = 'TRN-2024-METRO'"]
        t2["name = 'Metro T20 Cup 2024'"]
        t3["format = T20"]
        t4["status = REGISTRATION_OPEN"]
        t5["maxTeams = 8"]
        t6["city = 'Mumbai'"]
        t7["startDate = 2024-03-15"]
    end

    subgraph reg1 ["registration:TeamRegistration (Mumbai Stars)"]
        r1["teamName = 'Mumbai Stars'"]
        r2["status = APPROVED"]
        r3["squadSize = 15"]
    end

    subgraph reg2 ["registration:TeamRegistration (Andheri XI)"]
        s1["teamName = 'Andheri XI'"]
        s2["status = APPROVED"]
        s3["squadSize = 14"]
    end

    subgraph reg3 ["registration:TeamRegistration (BKC Warriors)"]
        u1["teamName = 'BKC Warriors'"]
        u2["status = PENDING"]
        u3["squadSize = 12"]
    end

    subgraph pt1 ["pointsTableEntry (Mumbai Stars)"]
        p1["matchesPlayed = 0"]
        p2["wins = 0"]
        p3["points = 0"]
        p4["nrr = 0.0"]
    end

    subgraph sponsorship ["sponsorshipDeal:SponsorshipDeal"]
        sp1["dealId = 'SP-001'"]
        sp2["tier = TITLE"]
        sp3["sponsor = 'SportZone India'"]
        sp4["status = ACTIVE"]
        sp5["logoUrl = 'cdn.criczone.in/sponsors/sportzone.png'"]
    end

    tourney --> reg1
    tourney --> reg2
    tourney --> reg3
    tourney --> pt1
    tourney --> sponsorship
```

---

## OD-3: Offer Redemption in Progress (Store & Fan Snapshot)

```mermaid
flowchart LR
    subgraph store_obj ["store:Store"]
        s1["storeId = 'STR-001'"]
        s2["name = 'Sachin Sports Hub'"]
        s3["city = 'Pune'"]
        s4["rating = 4.7"]
        s5["latitude = 18.5204"]
        s6["longitude = 73.8567"]
    end

    subgraph offer_obj ["offer:Offer"]
        o1["offerId = 'OFF-202'"]
        o2["title = '20% off Kookaburra bats'"]
        o3["discountPercentage = 20.0"]
        o4["validUntil = 2024-03-31"]
        o5["maxRedemptions = 100"]
        o6["currentRedemptions = 37"]
        o7["status = ACTIVE"]
    end

    subgraph user_obj ["user:User (Fan)"]
        u1["userId = 'U-FAN-087'"]
        u2["name = 'Sneha Joshi'"]
        u3["city = 'Pune'"]
        u4["role = FAN"]
    end

    subgraph redemption_obj ["redemption:OfferRedemption"]
        r1["redemptionId = 'RDM-8821'"]
        r2["status = IN_PROGRESS"]
        r3["qrCode = 'CZ-RDM-OFF202-U087-8821'"]
        r4["redeemedAt = null (pending scan)"]
    end

    subgraph notif ["notification:Notification (sent)"]
        n1["type = OFFER_ALERT"]
        n2["channel = FCM_PUSH"]
        n3["message = '🏏 New offer at Sachin Sports Hub near you!'"]
        n4["isRead = true"]
    end

    store_obj --> offer_obj
    user_obj --> redemption_obj
    offer_obj --> redemption_obj
    user_obj --> notif
```
