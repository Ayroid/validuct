# Validation Signals API

Base path: `/api/v1`

---

## POST `/api/v1/ideas/:id/signals`

**Toggle Validation Signal**

| Property   | Value                                     |
| ---------- | ----------------------------------------- |
| Auth       | `protect` — Bearer token required          |
| Rate Limit | `commentLimiter` — 30 req / hr per user   |
| Validator  | `toggleSignalSchema`                      |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as SignalController
    participant Svc as SignalService
    participant DB as PostgreSQL
    participant NT as NotificationTriggers

    C->>Auth: POST /api/v1/ideas/:id/signals
    Auth-->>Auth: Verify Bearer token → userId
    alt Unauthorized
        Auth-->>C: 401 Not authorized
    end
    Auth->>RL: Forward request
    RL-->>RL: Check user rate (30/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many requests
    end
    RL->>V: Forward request
    V-->>V: Validate body against toggleSignalSchema
    V->>Ctrl: SignalController.toggleSignal(req)
    Ctrl->>Svc: SignalService.toggleSignal(ideaId, userId, signalType)

    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: ideaSignal.findUnique({ where: { userId_ideaId_signalType } })
    DB-->>Svc: Existing signal | null

    alt Signal exists (toggle off)
        Svc->>DB: ideaSignal.delete({ where: { id } })
        DB-->>Svc: Deleted
        Svc-->>Ctrl: { hasSignal: false, signalType }
    else No signal (toggle on)
        Svc->>DB: ideaSignal.create({ userId, ideaId, signalType })
        DB-->>Svc: Created
        Svc->>NT: onValidationSignal(ideaId, signalType, userId) [async]
        Svc-->>Ctrl: { hasSignal: true, signalType }
    end

    Ctrl-->>C: 200 { success: true, data: { hasSignal, signalType } }
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

| Field      | Type | Constraints                                                              | Required |
| ---------- | ---- | ------------------------------------------------------------------------ | -------- |
| signalType | enum | `"PROBLEM_REAL"` \| `"WOULD_PAY"` \| `"READY_TO_BUILD"` \| `"NEEDS_CLARITY"` | Yes      |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "hasSignal": true,
    "signalType": "PROBLEM_REAL"
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": "Idea not found"
}
```

### Notes

- **Toggle behavior**: If the user already gave the same signal type on the same idea, it is removed. Otherwise, it is added.
- A user can have multiple *different* signal types on the same idea (e.g., both `PROBLEM_REAL` and `WOULD_PAY`), but only one of each type (unique constraint on `userId + ideaId + signalType`).
- Notifications are triggered only when a signal is added (not removed).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| ValidationSignals | `frontend/components/ValidationSignals.tsx` — toggles signals via `signalsApi.toggleSignal()` |

---

## GET `/api/v1/ideas/:id/signals`

**Get Signals for Idea**

| Property   | Value                                                   |
| ---------- | ------------------------------------------------------- |
| Auth       | `optionalProtect` — includes user signals if authed      |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET)           |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as OptionalAuth
    participant Ctrl as SignalController
    participant Svc as SignalService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:id/signals
    RL->>Auth: Forward request
    Auth-->>Auth: Try extract Bearer token (optional)
    Auth->>Ctrl: SignalController.getIdeaSignals(req)
    Ctrl->>Svc: SignalService.getIdeaSignals(ideaId, userId?)

    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: ideaSignal.groupBy({ by: [signalType], where: { ideaId }, _count: true })
    DB-->>Svc: Signal counts grouped by type

    opt userId present
        Svc->>DB: ideaSignal.findMany({ where: { ideaId, userId }, select: signalType })
        DB-->>Svc: User's signal types
    end

    Svc-->>Ctrl: { counts, userSignals, total }
    Ctrl-->>C: 200 { success: true, data: { counts, userSignals, total } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "counts": {
      "PROBLEM_REAL": 5,
      "WOULD_PAY": 3,
      "READY_TO_BUILD": 2,
      "NEEDS_CLARITY": 1
    },
    "userSignals": ["PROBLEM_REAL", "WOULD_PAY"],
    "total": 11
  }
}
```

- `userSignals` is an empty array for unauthenticated requests.

### Notes

- Signal counts are aggregated using `groupBy` on `signalType`.
- The `total` field is the sum of all signal counts across all types.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| ValidationSignals | `frontend/components/ValidationSignals.tsx` — fetches signals via `signalsApi.getIdeaSignals()` |
