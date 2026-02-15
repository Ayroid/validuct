# Global Waitlist API

Base path: `/api/v1/waitlist`

---

## POST `/api/v1/waitlist/join`

**Join Product Waitlist**

| Property   | Value                                       |
| ---------- | ------------------------------------------- |
| Auth       | None (public endpoint)                       |
| Rate Limit | `waitlistLimiter` — 5 req / hr per IP       |
| Validator  | `waitlistSchema`                            |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as WaitlistController
    participant Svc as WaitlistService
    participant DB as PostgreSQL
    participant Email as Resend (Email)

    C->>RL: POST /api/v1/waitlist/join
    RL-->>RL: Check IP rate (5/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many waitlist requests
    end
    RL->>V: Forward request
    V-->>V: Validate body against waitlistSchema
    alt Validation fails
        V-->>C: 400 Validation Error
    end
    V->>Ctrl: WaitlistController.joinWaitlist(req)
    Ctrl->>Svc: WaitlistService.addToWaitlist({ email })

    Svc-->>Svc: Parse + validate email (waitlistSchema)
    Svc->>DB: waitlist.findUnique({ where: { email } })
    DB-->>Svc: Existing entry | null
    alt Email already on waitlist
        Svc-->>C: 400 Email is already on the waitlist
    end

    Svc->>DB: waitlist.create({ data: { email } })
    DB-->>Svc: New entry { id, email, createdAt }

    Svc->>Email: sendWaitlistEmail(email)
    Email-->>Svc: Email sent

    Svc-->>Ctrl: { id, email, createdAt }
    Ctrl-->>C: 200 { success: true, message: "Successfully joined the waitlist" }
```

### Request

**Headers**

| Header       | Value            | Required |
| ------------ | ---------------- | -------- |
| Content-Type | application/json | Yes      |

**Body**

| Field | Type   | Constraints        | Required |
| ----- | ------ | ------------------ | -------- |
| email | string | Valid email address | Yes      |

### Response

**200 OK**

```json
{
  "success": true,
  "message": "Successfully joined the waitlist"
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": "Email is already on the waitlist"
}
```

**429 Too Many Requests**

```json
{
  "success": false,
  "error": {
    "message": "Too many waitlist requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 3600
  }
}
```

### Notes

- Public endpoint — no authentication required.
- After successfully adding the email, a confirmation email is sent via Resend.
- Unique constraint on `email` prevents duplicate entries.
- The rate limiter is stricter (5 per hour) compared to other endpoints since this is a public, unauthenticated endpoint.
- The `Waitlist` model is for the global product waitlist (pre-launch), separate from per-idea waitlists.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Waitlist | `frontend/components/Waitlist.tsx` — joins waitlist via `waitlistApi.joinWaitlist()` |
