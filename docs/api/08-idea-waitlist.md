# Idea Waitlist API

Base path: `/api/v1`

---

## POST `/api/v1/ideas/:ideaId/waitlist`

**Join Idea Waitlist**

| Property   | Value                                            |
| ---------- | ------------------------------------------------ |
| Auth       | None (public endpoint)                            |
| Rate Limit | `ideaWaitlistLimiter` — 10 req / hr per IP       |
| Validator  | `ideaWaitlistSchema`                             |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: POST /api/v1/ideas/:ideaId/waitlist
    RL-->>RL: Check IP rate (10/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many waitlist requests
    end
    RL->>V: Forward request
    V-->>V: Validate body against ideaWaitlistSchema
    alt Validation fails
        V-->>C: 400 Validation Error
    end
    V->>Ctrl: IdeaWaitlistController.joinWaitlist(req)
    Ctrl->>Svc: IdeaWaitlistService.joinWaitlist(ideaId, email)

    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: ideaWaitlist.findUnique({ where: { ideaId_email } })
    DB-->>Svc: Existing entry | null
    alt Email already registered
        Svc-->>C: 400 Email already registered for this waitlist
    end

    Svc->>DB: ideaWaitlist.create({ ideaId, email })
    DB-->>Svc: New entry

    opt Idea has no waitlistAccessToken
        Svc->>DB: idea.update({ waitlistAccessToken: randomUUID() })
        DB-->>Svc: Updated
    end

    Svc-->>Ctrl: { id, joined: true }
    Ctrl-->>C: 201 { success: true, data: { id, joined: true }, message: "Successfully joined the waitlist" }
```

### Request

**Path Parameters**

| Param  | Type | Description |
| ------ | ---- | ----------- |
| ideaId | uuid | Idea ID     |

**Body**

| Field | Type   | Constraints        | Required |
| ----- | ------ | ------------------ | -------- |
| email | string | Valid email address | Yes      |

### Response

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "joined": true
  },
  "message": "Successfully joined the waitlist"
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": "Email already registered for this waitlist"
}
```

### Notes

- Public endpoint — no authentication required.
- A `waitlistAccessToken` is auto-generated for the idea on first waitlist join (used for owner access).
- Unique constraint on `ideaId + email` prevents duplicate entries.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| IdeaWaitlist | `frontend/components/IdeaWaitlist.tsx` — joins waitlist via `ideaWaitlistApi.joinWaitlist()` |

---

## GET `/api/v1/ideas/:ideaId/waitlist`

**Get Waitlist Stats**

| Property   | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Auth       | `optionalProtect` — includes accessToken if owner      |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET)         |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as OptionalAuth
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:ideaId/waitlist
    RL->>Auth: Forward request
    Auth-->>Auth: Try extract Bearer token (optional)
    Auth->>Ctrl: IdeaWaitlistController.getWaitlistStats(req)
    Ctrl->>Svc: IdeaWaitlistService.getWaitlistStats(ideaId, userId?)

    Svc->>DB: idea.findUnique({ where: { id }, select: { id, userId, waitlistAccessToken } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: ideaWaitlist.count({ where: { ideaId } })
    DB-->>Svc: Count

    Svc-->>Svc: Check if userId = idea.userId (owner check)

    Svc-->>Ctrl: { count, accessToken (owner only), isOwner }
    Ctrl-->>C: 200 { success: true, data: { count, accessToken, isOwner } }
```

### Request

**Path Parameters**

| Param  | Type | Description |
| ------ | ---- | ----------- |
| ideaId | uuid | Idea ID     |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "count": 42,
    "accessToken": "uuid (only for owner, null otherwise)",
    "isOwner": true
  }
}
```

### Notes

- The `accessToken` is only returned to the idea owner (authenticated and matching `userId`).
- Non-owners and unauthenticated users see `accessToken: null`.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| IdeaWaitlist | `frontend/components/IdeaWaitlist.tsx` — fetches waitlist stats via `ideaWaitlistApi.getWaitlistStats()` |

---

## GET `/api/v1/ideas/:ideaId/waitlist/entries`

**Get Waitlist Entries (Session Auth)**

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Auth       | `protect` — Bearer token required (owner only) |
| Rate Limit | `generalLimiter` — 100 req / min per IP  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:ideaId/waitlist/entries?page=1&limit=20
    RL->>Auth: Forward request
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: IdeaWaitlistController.getWaitlistEntries(req)
    Ctrl->>Svc: IdeaWaitlistService.getWaitlistEntries(ideaId, userId, page, limit)

    Svc->>DB: idea.findUnique({ where: { id }, select: { id, userId, heading } })
    DB-->>Svc: Idea | null
    alt Not found or userId ≠ idea.userId
        Svc-->>C: 404 Not found
    end

    Svc->>DB: ideaWaitlist.count({ where: { ideaId } })
    Svc->>DB: ideaWaitlist.findMany({ where: { ideaId }, orderBy: createdAt desc, skip, take })
    DB-->>Svc: Entries + count

    Svc-->>Ctrl: { ideaId, ideaHeading, totalCount, entries, pagination }
    Ctrl-->>C: 200 { success: true, data: { ... } }
```

### Request

**Path Parameters**

| Param  | Type | Description |
| ------ | ---- | ----------- |
| ideaId | uuid | Idea ID     |

**Query Parameters**

| Param | Type   | Default | Constraints | Description       |
| ----- | ------ | ------- | ----------- | ----------------- |
| page  | number | 1       | ≥ 1         | Page number       |
| limit | number | 20      | max 50      | Entries per page  |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "string",
    "totalCount": 42,
    "entries": [
      { "id": "uuid", "email": "user@example.com", "createdAt": "ISO 8601" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "total_pages": 3
    }
  }
}
```

### Notes

- Owner-only: verifies `userId` matches `idea.userId`.
- Entries are sorted by `createdAt` descending (newest first).
- Limit is capped at 50.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Waitlist Page | `frontend/app/(app)/idea/[id]/waitlist/page.tsx` — fetches entries via `ideaWaitlistApi.getWaitlistEntries()` |

---

## GET `/api/v1/ideas/:ideaId/waitlist/export`

**Export Waitlist Emails (Session Auth)**

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Auth       | `protect` — Bearer token required (owner only) |
| Rate Limit | `generalLimiter` — 100 req / min per IP  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:ideaId/waitlist/export
    RL->>Auth: Forward request
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: IdeaWaitlistController.exportWaitlistEmails(req)
    Ctrl->>Svc: IdeaWaitlistService.exportWaitlistEmails(ideaId, userId)

    Svc->>DB: idea.findUnique (verify ownership)
    alt Not found or not owner
        Svc-->>C: 404 Not found
    end

    Svc->>DB: ideaWaitlist.findMany({ where: { ideaId }, select: { email, createdAt } })
    DB-->>Svc: All entries

    Svc-->>Ctrl: { ideaId, ideaHeading, totalCount, entries }
    Ctrl-->>C: 200 { success: true, data: { ... } }
```

### Request

**Path Parameters**

| Param  | Type | Description |
| ------ | ---- | ----------- |
| ideaId | uuid | Idea ID     |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "string",
    "totalCount": 42,
    "entries": [
      { "email": "user@example.com", "createdAt": "ISO 8601" }
    ]
  }
}
```

### Notes

- Returns ALL waitlist emails (no pagination) for export/download.
- Owner-only: verifies `userId` matches `idea.userId`.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Waitlist Page | `frontend/app/(app)/idea/[id]/waitlist/page.tsx` — exports emails via `ideaWaitlistApi.exportWaitlistEmails()` |

---

## GET `/api/v1/ideas/:ideaId/waitlist/:accessToken`

**Get Waitlist by Access Token**

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Auth       | `protect` — Bearer token required (owner only) |
| Rate Limit | `generalLimiter` — 100 req / min per IP  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:ideaId/waitlist/:accessToken?page=1&limit=20
    RL->>Auth: Forward request
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: IdeaWaitlistController.getWaitlistByToken(req)
    Ctrl->>Svc: IdeaWaitlistService.getWaitlistByToken(ideaId, accessToken, userId, page, limit)

    Svc->>DB: idea.findUnique({ where: { id } })
    DB-->>Svc: Idea | null
    alt Not found or userId ≠ idea.userId or accessToken mismatch
        Svc-->>C: 404 Not found
    end

    Svc->>DB: ideaWaitlist.count + ideaWaitlist.findMany (paginated)
    DB-->>Svc: Entries + count

    Svc-->>Ctrl: { ideaId, ideaHeading, totalCount, entries, pagination }
    Ctrl-->>C: 200 { success: true, data: { ... } }
```

### Request

**Path Parameters**

| Param       | Type   | Description                |
| ----------- | ------ | -------------------------- |
| ideaId      | uuid   | Idea ID                    |
| accessToken | string | Waitlist access token (UUID) |

**Query Parameters**

| Param | Type   | Default | Constraints | Description       |
| ----- | ------ | ------- | ----------- | ----------------- |
| page  | number | 1       | ≥ 1         | Page number       |
| limit | number | 20      | max 50      | Entries per page  |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "string",
    "totalCount": 42,
    "entries": [
      { "id": "uuid", "email": "user@example.com", "createdAt": "ISO 8601" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "total_pages": 3
    }
  }
}
```

### Notes

- Triple verification: bearer token authentication + ownership check + access token match.
- Returns 404 for any verification failure (does not reveal whether the idea exists).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| — | Not currently used by any frontend component. |

---

## GET `/api/v1/ideas/:ideaId/waitlist/:accessToken/export`

**Export All Waitlist Emails by Access Token**

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Auth       | `protect` — Bearer token required (owner only) |
| Rate Limit | `generalLimiter` — 100 req / min per IP  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Ctrl as IdeaWaitlistController
    participant Svc as IdeaWaitlistService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:ideaId/waitlist/:accessToken/export
    RL->>Auth: Forward request
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: IdeaWaitlistController.getAllWaitlistEmails(req)
    Ctrl->>Svc: IdeaWaitlistService.getAllWaitlistEmails(ideaId, accessToken, userId)

    Svc->>DB: idea.findUnique (verify ownership + access token)
    alt Not found or not authorized
        Svc-->>C: 404 Not found
    end

    Svc->>DB: ideaWaitlist.findMany({ where: { ideaId }, select: { email, createdAt } })
    DB-->>Svc: All entries

    Svc-->>Ctrl: { ideaId, ideaHeading, totalCount, entries }
    Ctrl-->>C: 200 { success: true, data: { ... } }
```

### Request

**Path Parameters**

| Param       | Type   | Description                |
| ----------- | ------ | -------------------------- |
| ideaId      | uuid   | Idea ID                    |
| accessToken | string | Waitlist access token (UUID) |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "string",
    "totalCount": 42,
    "entries": [
      { "email": "user@example.com", "createdAt": "ISO 8601" }
    ]
  }
}
```

### Notes

- Returns ALL emails (no pagination) for bulk export.
- Same triple verification as the paginated access token endpoint.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| — | Not currently used by any frontend component. |
