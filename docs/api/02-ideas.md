# Ideas API

Base path: `/api/v1/ideas`

---

## GET `/api/v1/ideas`

**Get Ideas (Timeline)**

| Property   | Value                                          |
| ---------- | ---------------------------------------------- |
| Auth       | `optionalProtect` — includes userVote if authed |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET)  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as OptionalAuth
    participant Ctrl as IdeaController
    participant Svc as IdeaService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas?timeline=new&page=1&limit=20
    RL-->>RL: Check IP rate (100/min, GET only)
    RL->>Auth: Forward request
    Auth-->>Auth: Try extract Bearer token (optional)
    Auth->>Ctrl: IdeaController.getIdeas(req)
    Ctrl-->>Ctrl: Validate timeline param ∈ {new, trending, top}
    alt Invalid or missing timeline
        Ctrl-->>C: 400 Invalid or missing timeline parameter
    end

    alt timeline = "trending"
        Ctrl->>Svc: IdeaService.getIdeas({ timeline: "trending", page, limit, userId })
        Svc->>DB: vote.groupBy({ by: [ideaId], where: { createdAt ≥ 24h ago, voteType: UPVOTE } })
        DB-->>Svc: Recent upvote counts per idea
        Svc-->>Svc: Sort by recent upvote count desc, paginate
        Svc->>DB: idea.findMany({ where: { id in trendingIds } })
        DB-->>Svc: Trending ideas
    else timeline = "new" or "top"
        Ctrl->>Svc: IdeaService.getIdeas({ timeline, page, limit, userId })
        Svc->>DB: idea.findMany + idea.count (parallel)
        DB-->>Svc: Ideas + total count
    end

    opt userId present
        Svc->>DB: vote.findMany({ where: { userId, ideaId in [...] } })
        DB-->>Svc: User's votes
        Svc-->>Svc: Map userVote onto each idea
    end

    Svc-->>Ctrl: { ideas, pagination }
    Ctrl-->>C: 200 { success: true, data: { ideas, pagination } }
```

### Request

**Query Parameters**

| Param    | Type   | Constraints                    | Default | Required |
| -------- | ------ | ------------------------------ | ------- | -------- |
| timeline | string | `"new"` \| `"trending"` \| `"top"` | —       | Yes      |
| page     | number | ≥ 1                            | 1       | No       |
| limit    | number | ≥ 1                            | 20      | No       |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "id": "uuid",
        "userId": "uuid",
        "heading": "string",
        "description": "string",
        "status": "DRAFT | VALIDATED | WIP | LAUNCHED",
        "launchedLink": "string | null",
        "upvotesCount": 0,
        "downvotesCount": 0,
        "commentsCount": 0,
        "createdAt": "ISO 8601",
        "updatedAt": "ISO 8601",
        "user": {
          "username": "string",
          "profilePicture": "string | null"
        },
        "userVote": "upvote | downvote | null"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### Notes

- **new**: Sorted by `createdAt` desc, then `id` desc.
- **trending**: Groups upvotes from the last 24 hours, sorted by recent upvote count desc. Ideas created at any time can trend if they received recent upvotes.
- **top**: Sorted by `upvotesCount` desc, then `createdAt` desc, then `id` desc.
- `userVote` is `null` for unauthenticated requests.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Timeline | `frontend/components/Timeline.tsx` — fetches ideas via `ideasApi.getIdeas()` |

---

## GET `/api/v1/ideas/:id`

**Get Idea by ID**

| Property   | Value                                          |
| ---------- | ---------------------------------------------- |
| Auth       | `optionalProtect` — includes userVote if authed |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET)  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as OptionalAuth
    participant Ctrl as IdeaController
    participant Svc as IdeaService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:id
    RL->>Auth: Forward request
    Auth-->>Auth: Try extract Bearer token (optional)
    Auth->>Ctrl: IdeaController.getIdeaById(req)
    Ctrl->>Svc: IdeaService.getIdeaById(id, userId?)
    Svc->>DB: idea.findUnique({ where: { id }, include: { user } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>Ctrl: throw AppError(404)
        Ctrl-->>C: 404 Idea not found
    end
    opt userId present
        Svc->>DB: vote.findUnique({ where: { userId_ideaId } })
        DB-->>Svc: Vote | null
    end
    Svc-->>Ctrl: { ...idea, userVote }
    Ctrl-->>C: 200 { success: true, data: { idea } }
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
    "idea": {
      "id": "uuid",
      "userId": "uuid",
      "heading": "string",
      "description": "string",
      "status": "DRAFT | VALIDATED | WIP | LAUNCHED",
      "launchedLink": "string | null",
      "upvotesCount": 0,
      "downvotesCount": 0,
      "commentsCount": 0,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "user": {
        "username": "string",
        "profilePicture": "string | null"
      },
      "userVote": "upvote | downvote | null"
    }
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

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Idea Detail Page | `frontend/app/(app)/idea/[id]/page.tsx` — fetches idea via `ideasApi.getIdeaById()` |
| Idea Edit Page | `frontend/app/(app)/idea/[id]/edit/page.tsx` — fetches idea for editing via `ideasApi.getIdeaById()` |

---

## POST `/api/v1/ideas`

**Create Idea**

| Property   | Value                                       |
| ---------- | ------------------------------------------- |
| Auth       | `protect` — Bearer token required            |
| Rate Limit | `createIdeaLimiter` — 20 req / hr per user  |
| Validator  | `createIdeaSchema`                          |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant V as Validator
    participant Ctrl as IdeaController
    participant Svc as IdeaService
    participant DB as PostgreSQL

    C->>Auth: POST /api/v1/ideas
    Auth-->>Auth: Verify Bearer token → userId
    alt Unauthorized
        Auth-->>C: 401 Not authorized
    end
    Auth->>RL: Forward request
    RL-->>RL: Check user rate (20/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many ideas created
    end
    RL->>V: Forward request
    V-->>V: Validate body against createIdeaSchema
    alt Validation fails
        V-->>C: 400 Validation Error
    end
    V->>Ctrl: IdeaController.createIdea(req)
    Ctrl->>Svc: IdeaService.createIdea(userId, { heading, description, status?, launchedLink? })
    Svc->>DB: idea.create({ userId, heading, description, status, launchedLink })
    DB-->>Svc: New Idea (with user relation)
    Svc-->>Ctrl: Idea
    Ctrl-->>C: 201 { success: true, data: { idea } }
```

### Request

**Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer `<token>` | Yes      |
| Content-Type  | application/json | Yes      |

**Body**

| Field        | Type   | Constraints                                        | Required |
| ------------ | ------ | -------------------------------------------------- | -------- |
| heading      | string | min 1, max 200 characters                          | Yes      |
| description  | string | min 1 character                                    | Yes      |
| status       | enum   | `"DRAFT"` \| `"VALIDATED"` \| `"WIP"` \| `"LAUNCHED"` | No (default: `DRAFT`) |
| launchedLink | string | Valid URL                                          | No       |

### Response

**201 Created**

```json
{
  "success": true,
  "data": {
    "idea": {
      "id": "uuid",
      "userId": "uuid",
      "heading": "string",
      "description": "string",
      "status": "DRAFT",
      "launchedLink": null,
      "upvotesCount": 0,
      "downvotesCount": 0,
      "commentsCount": 0,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "user": {
        "username": "string",
        "profilePicture": "string | null"
      }
    }
  }
}
```

### Frontend Usage

| Component | Path |
| --------- | ---- |
| New Idea Page | `frontend/app/(app)/idea/new/page.tsx` — creates idea via `ideasApi.createIdea()` |

---

## PATCH `/api/v1/ideas/:id`

**Update Idea**

| Property   | Value                            |
| ---------- | -------------------------------- |
| Auth       | `protect` — Bearer token required |
| Validator  | `updateIdeaSchema`               |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant V as Validator
    participant Ctrl as IdeaController
    participant Svc as IdeaService
    participant DB as PostgreSQL

    C->>Auth: PATCH /api/v1/ideas/:id
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>V: Forward request
    V-->>V: Validate body against updateIdeaSchema
    V->>Ctrl: IdeaController.updateIdea(req)
    Ctrl->>Svc: IdeaService.updateIdea(id, userId, data)
    Svc->>DB: idea.findUnique({ where: { id } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end
    alt userId ≠ idea.userId
        Svc-->>C: 403 Not authorized to update this idea
    end
    Svc->>DB: idea.update({ where: { id }, data: { ...changes } })
    DB-->>Svc: Updated Idea
    Svc-->>Ctrl: Idea
    Ctrl-->>C: 200 { success: true, data: { idea } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

**Body** (all fields optional)

| Field        | Type   | Constraints                                        |
| ------------ | ------ | -------------------------------------------------- |
| heading      | string | min 1, max 200 characters                          |
| description  | string | min 1 character                                    |
| status       | enum   | `"DRAFT"` \| `"VALIDATED"` \| `"WIP"` \| `"LAUNCHED"` |
| launchedLink | string | Valid URL                                          |

### Response

**200 OK** — Returns the updated idea (same shape as Create Idea response).

**403 Forbidden**

```json
{
  "success": false,
  "error": "Not authorized to update this idea"
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

- Only the owner of the idea can update it.
- Only provided fields are updated; omitted fields remain unchanged.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Idea Edit Page | `frontend/app/(app)/idea/[id]/edit/page.tsx` — updates idea via `ideasApi.updateIdea()` |

---

## DELETE `/api/v1/ideas/:id`

**Delete Idea**

| Property | Value                            |
| -------- | -------------------------------- |
| Auth     | `protect` — Bearer token required |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant Ctrl as IdeaController
    participant Svc as IdeaService
    participant DB as PostgreSQL

    C->>Auth: DELETE /api/v1/ideas/:id
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: IdeaController.deleteIdea(req)
    Ctrl->>Svc: IdeaService.deleteIdea(id, userId)
    Svc->>DB: idea.findUnique({ where: { id } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end
    alt userId ≠ idea.userId
        Svc-->>C: 403 Not authorized to delete this idea
    end
    Svc->>DB: idea.delete({ where: { id } })
    DB-->>Svc: Deleted
    Svc-->>Ctrl: void
    Ctrl-->>C: 204 No Content
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

### Response

**204 No Content** — Idea successfully deleted.

**403 Forbidden**

```json
{
  "success": false,
  "error": "Not authorized to delete this idea"
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

- Only the owner can delete the idea.
- Cascade deletes all associated votes, comments, signals, waitlist entries, and notifications.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| Idea Edit Page | `frontend/app/(app)/idea/[id]/edit/page.tsx` — deletes idea via `ideasApi.deleteIdea()` |

---

## POST `/api/v1/ideas/:id/pin`

**Pin Idea to Profile**

| Property | Value                            |
| -------- | -------------------------------- |
| Auth     | `protect` — Bearer token required |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant Ctrl as UserController
    participant Svc as UserService
    participant DB as PostgreSQL

    C->>Auth: POST /api/v1/ideas/:id/pin
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: UserController.pinIdea(req)
    Ctrl->>Svc: UserService.pinIdea(userId, ideaId)
    Svc->>DB: idea.findUnique({ where: { id } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 400 Idea not found
    end
    Svc->>DB: pinnedIdea.count({ where: { userId } })
    DB-->>Svc: Count
    alt Count ≥ 5
        Svc-->>C: 400 Maximum 5 ideas can be pinned
    end
    Svc->>DB: pinnedIdea.findUnique({ where: { userId_ideaId } })
    DB-->>Svc: Existing pin | null
    alt Already pinned
        Svc-->>C: 400 Idea already pinned
    end
    Svc->>DB: pinnedIdea.findFirst({ orderBy: pinOrder desc })
    DB-->>Svc: Max pin order
    Svc->>DB: pinnedIdea.create({ userId, ideaId, pinOrder })
    DB-->>Svc: Created
    Svc-->>Ctrl: { pinned: true }
    Ctrl-->>C: 200 { success: true, data: { pinned: true } }
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
  "data": { "pinned": true }
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": "Maximum 5 ideas can be pinned"
}
```

### Notes

- Maximum 5 pinned ideas per user.
- Pin order auto-increments based on the current highest pin order.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| PinButton | `frontend/components/PinButton.tsx` — pins idea via `ideasApi.pinIdea()` |

---

## DELETE `/api/v1/ideas/:id/pin`

**Unpin Idea from Profile**

| Property | Value                            |
| -------- | -------------------------------- |
| Auth     | `protect` — Bearer token required |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant Ctrl as UserController
    participant Svc as UserService
    participant DB as PostgreSQL

    C->>Auth: DELETE /api/v1/ideas/:id/pin
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: UserController.unpinIdea(req)
    Ctrl->>Svc: UserService.unpinIdea(userId, ideaId)
    Svc->>DB: pinnedIdea.findUnique({ where: { userId_ideaId } })
    DB-->>Svc: Pin | null
    alt Not pinned
        Svc-->>C: 400 Idea is not pinned
    end
    Svc->>DB: pinnedIdea.delete({ where: { userId_ideaId } })
    DB-->>Svc: Deleted
    Svc->>DB: $transaction: reorder remaining pins (sequential pinOrder 1,2,3...)
    DB-->>Svc: Reordered
    Svc-->>Ctrl: { pinned: false }
    Ctrl-->>C: 204 No Content
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

### Response

**204 No Content** — Idea successfully unpinned.

**400 Bad Request**

```json
{
  "success": false,
  "error": "Idea is not pinned"
}
```

### Notes

- After unpinning, remaining pinned ideas are automatically reordered to maintain sequential pin order values (1, 2, 3, ...).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| PinButton | `frontend/components/PinButton.tsx` — unpins idea via `ideasApi.unpinIdea()` |
