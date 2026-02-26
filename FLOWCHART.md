# Flowcharts — CricZone: Local Cricket Community Platform

> Four decision flowcharts covering the most critical automated decision engines in CricZone.

---

## FC-1: Match Result Decision Engine

```mermaid
flowchart TD
    START([Ball Event Recorded]) --> CHECK_WICKET{Is it a Wicket?}
    CHECK_WICKET -->|Yes| UPDATE_WICKETS[Increment Wicket Count\nUpdate Fall of Wicket]
    CHECK_WICKET -->|No| UPDATE_RUNS[Add Runs to Scorecard\nUpdate Batting Card]
    UPDATE_WICKETS --> ALL_OUT{All Out?\n10 Wickets}
    UPDATE_RUNS --> OVER_LIMIT{All Overs\nComplete?}
    ALL_OUT -->|Yes| INNINGS_END[End Innings]
    ALL_OUT -->|No| CONTINUE_BALL[Continue Scoring]
    OVER_LIMIT -->|Yes| INNINGS_END
    OVER_LIMIT -->|No| CHECK_SECOND{Second Innings?}
    CHECK_SECOND -->|No| CONTINUE_BALL
    CHECK_SECOND -->|Yes| TARGET_CHECK{Target Chased?}
    TARGET_CHECK -->|Yes| WIN_CHASE[Batting Team Wins\nby X Wickets]
    TARGET_CHECK -->|No| CONTINUE_BALL
    INNINGS_END --> IS_SECOND{Is This 2nd Innings?}
    IS_SECOND -->|No| SET_TARGET[Set Target\nPublish Target to Fans]
    IS_SECOND -->|Yes| COMPARE[Compare 1st & 2nd Innings]
    SET_TARGET --> CONTINUE_BALL
    COMPARE --> HIGHER{1st Innings\nTotal > 2nd?}
    HIGHER -->|Yes| WIN_BOWL[1st Innings Team Wins\nby X Runs]
    HIGHER -->|No| TIE_CHECK{Equal?}
    TIE_CHECK -->|Yes| SUPER_OVER[Super Over!\nNotify All Fans]
    TIE_CHECK -->|No| WIN_CHASE
    WIN_CHASE & WIN_BOWL & SUPER_OVER --> LOCK[Lock Scorecard\nPublish MatchCompleted]
    LOCK --> DONE([Match Result Published])
```

---

## FC-2: Player Performance Score (PPS) Calculation

```mermaid
flowchart TD
    START([MatchCompleted Event]) --> BATTING[Calculate Batting Component\nMax: 40 pts]
    BATTING --> AVG{Batting Average > 30?}
    AVG -->|Yes| B1[+15 pts]
    AVG -->|No| B2[+0-14 pts proportional]
    B1 & B2 --> SR{Strike Rate > 120?}
    SR -->|Yes| B3[+15 pts]
    SR -->|No| B4[+0-14 pts proportional]
    B3 & B4 --> MILESTONES[+10 pts for 50s/100s\nweighted by frequency]
    MILESTONES --> BATTING_DONE[Batting Score: X/40]

    BATTING_DONE --> BOWLING[Calculate Bowling Component\nMax: 40 pts]
    BOWLING --> ECON{Economy < 7?}
    ECON -->|Yes| BW1[+15 pts]
    ECON -->|No| BW2[+0-14 pts proportional]
    BW1 & BW2 --> BWA{Bowling Avg < 25?}
    BWA -->|Yes| BW3[+15 pts]
    BWA -->|No| BW4[+0-14 pts proportional]
    BW3 & BW4 --> BBI[+10 pts for\nBest Bowling Figures]
    BBI --> BOWLING_DONE[Bowling Score: Y/40]

    BOWLING_DONE --> FIELDING[Calculate Fielding Component\nMax: 20 pts]
    FIELDING --> CATCHES[+7 pts per catch\ncapped at 14]
    CATCHES --> STUMP[+5 pts per stumping]
    STUMP --> RO[+3 pts per run-out]
    RO --> FIELDING_DONE[Fielding Score: Z/20]

    FIELDING_DONE --> TOTAL[PPS = X + Y + Z\nMax: 100]
    TOTAL --> GRADE{PPS Grade Assignment}
    GRADE -->|85-100| ELITE[Elite ⭐⭐⭐\nStar Player Badge]
    GRADE -->|65-84| GOOD[Good ⭐⭐]
    GRADE -->|40-64| AVE[Average ⭐]
    GRADE -->|0-39| DEV[Developing]
    ELITE & GOOD & AVE & DEV --> SAVE[Save PPS to DB\nGenerate Stat Card]
    SAVE --> DONE([PPS Updated])
```

---

## FC-3: Sponsor Matching Decision Logic

```mermaid
flowchart TD
    START([SponsorshipRequirementPosted]) --> LOAD[Load All Active Sponsors\nin Same City / Metro Region]
    LOAD --> SPONSORS_FOUND{Sponsors Found\nin Region?}
    SPONSORS_FOUND -->|No| EXPAND_REGION[Expand to State-wide Search]
    EXPAND_REGION --> SPONSORS_FOUND2{Sponsors Found?}
    SPONSORS_FOUND2 -->|No| NO_MATCH[No Match Found\nPost to Marketplace]
    SPONSORS_FOUND2 -->|Yes| SCORE

    SPONSORS_FOUND -->|Yes| SCORE[Score Each Sponsor]
    SCORE --> GEO[+30: Location Match\nSame City = 30, Same State = 15]
    GEO --> CATEGORY[+25: Category Match\nje. Sports Brand = 25, General = 10]
    CATEGORY --> BUDGET[+25: Estimated Budget\nvs Tournament Tier]
    BUDGET --> AUDIENCE[+20: Audience Demographic\nMatch Score]
    AUDIENCE --> RANK[Rank Sponsors by Total Score]
    RANK --> TOP3{Top 3 Matches\nScore > 50?}
    TOP3 -->|Yes| NOTIFY[Notify Top 3 Sponsors\nwith Tournament Proposal]
    TOP3 -->|No - All Below 50| LOW[Notify Top Match\nwith Low-Confidence Flag]
    NOTIFY & LOW --> AWAIT[Await Sponsor Response]
    AWAIT --> ACCEPTED{Sponsor Accepted?}
    ACCEPTED -->|Yes| ACTIVATE[Activate Deal\nGenerate Contract]
    ACCEPTED -->|No - All Rejected| NO_MATCH
    ACTIVATE --> DONE([Deal Active 🤝])
    NO_MATCH --> DONE2([Marketplace Listed])
```

---

## FC-4: Notification Routing Decision

```mermaid
flowchart TD
    START([Event Triggered]) --> TYPE{Event Type}

    TYPE -->|WicketFallen| URGENT[Priority: URGENT]
    TYPE -->|MatchStarted| HIGH[Priority: HIGH]
    TYPE -->|MatchCompleted| HIGH
    TYPE -->|OfferPublished| MEDIUM[Priority: MEDIUM]
    TYPE -->|FixtureReleased| MEDIUM
    TYPE -->|SponsorMatchFound| LOW[Priority: LOW]
    TYPE -->|PPS Updated| LOW

    URGENT & HIGH & MEDIUM & LOW --> CHANNEL{Select Delivery Channel}

    URGENT -->|Check preference| PUSH_FIRST{Push Enabled?}
    PUSH_FIRST -->|Yes| FCM[Send FCM Push Notification]
    PUSH_FIRST -->|No| WHATSAPP[Send WhatsApp Message]
    FCM --> DELIVERED{Delivered?}
    DELIVERED -->|Yes| LOG[Log: Delivered]
    DELIVERED -->|No - App not installed| WHATSAPP
    WHATSAPP --> DELIVERED2{Delivered?}
    DELIVERED2 -->|Yes| LOG
    DELIVERED2 -->|No| SMS[Send SMS via MSG91]
    SMS --> LOG

    HIGH --> FCM
    MEDIUM --> FCM
    LOW --> IN_APP[In-App Notification Only\nRed Bell Badge]
    IN_APP --> LOG

    LOG --> DONE([Notification Complete])
```
