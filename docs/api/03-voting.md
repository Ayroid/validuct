# Voting API

Base path: `/api/v1`

---

## POST `/api/v1/ideas/:id/vote`

**Vote on Idea (Upvote / Downvote with Toggle)**

| Property   | Value                                     |
| ---------- | ----------------------------------------- |
| Auth       | `protect` — Bearer token required          |
| Rate Limit | `voteLimiter` — 60 req / hr per user      |
| Validator  | `voteSchema`                              |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as VoteController
    participant Svc as VoteService
    participant DB as PostgreSQL
    participant NT as NotificationTriggers

    C->>Auth: POST /api/v1/ideas/:id/vote
    Auth-->>Auth: Verify Bearer token → userId
    alt Unauthorized
        Auth-->>C: 401 Not authorized
    end
    Auth->>RL: Forward request
    RL-->>RL: Check user rate (60/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many votes
    end
    RL->>V: Forward request
    V-->>V: Validate body against voteSchema
    alt Validation fails
        V-->>C: 400 Validation Error
    end
    V->>Ctrl: VoteController.voteOnIdea(req)
    Ctrl->>Svc: VoteService.voteOnIdea(userId, ideaId, voteType)

    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: vote.findUnique({ where: { userId_ideaId } })
    DB-->>Svc: Existing vote | null

    alt Existing vote with SAME type (toggle off)
        Svc->>DB: $transaction: vote.delete + idea.update (decrement count)
        DB-->>Svc: Vote removed
    else Existing vote with DIFFERENT type (switch)
        Svc->>DB: $transaction: vote.update + idea.update (swap counts)
        DB-->>Svc: Vote switched
    else No existing vote (new vote)
        Svc->>DB: $transaction: vote.create + idea.update (increment count)
        DB-->>Svc: Vote created
        opt voteType = UPVOTE
            Svc->>NT: onIdeaUpvote(ideaId, userId) [async, fire-and-forget]
        end
    end

    Svc->>DB: idea.findUnique({ select: upvotesCount, downvotesCount })
    DB-->>Svc: Updated counts

    Svc-->>Ctrl: { voteType, upvotesCount, downvotesCount }
    Ctrl-->>C: 200 { success, data: { vote, upvotes_count, downvotes_count } }
```

### Request

**Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer `<token>` | Yes      |
| Content-Type  | application/json | Yes      |

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

**Body**

| Field     | Type | Constraints                    | Required |
| --------- | ---- | ------------------------------ | -------- |
| vote_type | enum | `"upvote"` \| `"downvote"` | Yes      |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "vote": {
      "vote_type": "upvote | downvote | null"
    },
    "upvotes_count": 10,
    "downvotes_count": 2
  }
}
```

- `vote.vote_type` is `null` when the vote was toggled off (removed).

**404 Not Found**

```json
{
  "success": false,
  "error": "Idea not found"
}
```

### Notes

- **Toggle behavior**: Voting the same type again removes the vote. Voting a different type switches the vote.
- All vote + count updates are wrapped in a database transaction for consistency.
- Upvote notifications are triggered only for *new* upvotes (not switches or toggles).
- The `upvotes_count` and `downvotes_count` on the `Idea` model are denormalized counters maintained by transactions.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| VoteButtons | `frontend/components/VoteButtons.tsx` — votes via `votesApi.voteOnIdea()` |
