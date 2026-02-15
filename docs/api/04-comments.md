# Comments API

Base path: `/api/v1`

---

## POST `/api/v1/ideas/:id/comments`

**Create Comment or Reply**

| Property   | Value                                        |
| ---------- | -------------------------------------------- |
| Auth       | `protect` — Bearer token required             |
| Rate Limit | `commentLimiter` — 30 req / hr per user      |
| Validator  | `createCommentSchema`                        |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL
    participant NT as NotificationTriggers

    C->>Auth: POST /api/v1/ideas/:id/comments
    Auth-->>Auth: Verify Bearer token → userId
    alt Unauthorized
        Auth-->>C: 401 Not authorized
    end
    Auth->>RL: Forward request
    RL-->>RL: Check user rate (30/hr)
    alt Rate limit exceeded
        RL-->>C: 429 Too many comments
    end
    RL->>V: Forward request
    V-->>V: Validate body against createCommentSchema
    V->>Ctrl: CommentController.createComment(req)

    Ctrl->>Svc: CommentService.createComment(userId, ideaId, { content, parentCommentId?, category })
    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    opt parentCommentId provided
        Svc->>DB: comment.findUnique({ where: { id: parentCommentId } })
        DB-->>Svc: Parent comment | null
        alt Parent not found
            Svc-->>C: 404 Parent comment not found
        end
        alt Parent belongs to different idea
            Svc-->>C: 400 Parent comment does not belong to this idea
        end
    end

    Svc->>DB: comment.create({ userId, ideaId, content, parentCommentId, category })
    DB-->>Svc: New Comment (with user relation)
    Svc->>DB: idea.update({ commentsCount: increment 1 })
    DB-->>Svc: Updated

    alt Has parentCommentId (reply)
        Svc->>NT: onReply(commentId) [async]
    else Top-level comment
        Svc->>NT: onComment(commentId) [async]
    end

    Svc-->>Ctrl: Comment
    Ctrl-->>C: 201 { success: true, data: { comment } }
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

| Field           | Type   | Constraints                                                                                                                  | Required |
| --------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| content         | string | min 1 character                                                                                                              | Yes      |
| parentCommentId | uuid   | Must reference an existing comment on the same idea                                                                          | No       |
| category        | enum   | `"PROBLEM_CLARITY"` \| `"TARGET_USERS"` \| `"WILLINGNESS_TO_PAY"` \| `"TECHNICAL_FEASIBILITY"` \| `"FEATURE_SUGGESTION"` \| `"GENERAL"` | No (default: `GENERAL`) |

### Response

**201 Created**

```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "content": "string",
      "userId": "uuid",
      "ideaId": "uuid",
      "parentCommentId": "uuid | null",
      "category": "GENERAL",
      "helpfulCount": 0,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "user": {
        "id": "uuid",
        "username": "string",
        "profilePicture": "string | null"
      }
    }
  }
}
```

### Notes

- Top-level comments: omit `parentCommentId`.
- Replies: include `parentCommentId`. The parent must belong to the same idea.
- The idea's `commentsCount` is incremented by 1.
- Notifications are triggered asynchronously (fire-and-forget).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| CommentSection | `frontend/components/CommentSection.tsx` — creates comments via `commentsApi.createComment()` |

---

## GET `/api/v1/ideas/:id/comments`

**Get Comments for Idea**

| Property   | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Auth       | `optionalProtect` — includes `isHelpful` per comment if authed |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET)            |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as OptionalAuth
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/ideas/:id/comments?page=1&limit=50
    RL->>Auth: Forward request
    Auth-->>Auth: Try extract Bearer token (optional)
    Auth->>Ctrl: CommentController.getIdeaComments(req)
    Ctrl->>Svc: CommentService.getIdeaComments({ ideaId, userId?, page, limit })

    Svc->>DB: idea.findUnique({ where: { id: ideaId } })
    DB-->>Svc: Idea | null
    alt Idea not found
        Svc-->>C: 404 Idea not found
    end

    Svc->>DB: comment.findMany({ where: { ideaId }, include: { user, helpfulVotes? }, orderBy: createdAt asc })
    DB-->>Svc: All comments (flat list)
    Svc-->>Svc: Map isHelpful flag from helpfulVotes
    Svc-->>Svc: buildCommentTree (recursive nesting)
    Svc-->>Svc: Sort top-level by createdAt desc, paginate

    Svc-->>Ctrl: { comments (nested tree), pagination }
    Ctrl-->>C: 200 { success: true, data: { comments, pagination } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Idea ID     |

**Query Parameters**

| Param | Type   | Default | Description              |
| ----- | ------ | ------- | ------------------------ |
| page  | number | 1       | Page of top-level comments |
| limit | number | 50      | Top-level comments per page |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "string",
        "userId": "uuid",
        "ideaId": "uuid",
        "parentCommentId": null,
        "category": "GENERAL",
        "helpfulCount": 3,
        "isHelpful": false,
        "createdAt": "ISO 8601",
        "updatedAt": "ISO 8601",
        "user": {
          "id": "uuid",
          "username": "string",
          "profilePicture": "string | null"
        },
        "replies": [
          {
            "id": "uuid",
            "content": "string",
            "parentCommentId": "parent-uuid",
            "replies": []
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### Notes

- Comments are returned as a nested tree structure with recursive `replies`.
- Pagination applies only to top-level comments; all replies to paginated comments are included.
- `isHelpful` is included only when the user is authenticated.

### Frontend Usage

| Component | Path |
| --------- | ---- |
| CommentSection | `frontend/components/CommentSection.tsx` — fetches comments via `commentsApi.getIdeaComments()` |

---

## GET `/api/v1/comments/:id`

**Get Single Comment**

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Auth       | None                                      |
| Rate Limit | `generalLimiter` — 100 req / min per IP  |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/comments/:id
    RL->>Ctrl: CommentController.getComment(req)
    Ctrl->>Svc: CommentService.getCommentById(commentId)
    Svc->>DB: comment.findUnique({ where: { id }, include: { user, replies: { include: user } } })
    DB-->>Svc: Comment | null
    alt Comment not found
        Svc-->>C: 404 Comment not found
    end
    Svc-->>Ctrl: Comment with direct replies
    Ctrl-->>C: 200 { success: true, data: { comment } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Comment ID  |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "content": "string",
      "userId": "uuid",
      "ideaId": "uuid",
      "parentCommentId": "uuid | null",
      "category": "GENERAL",
      "helpfulCount": 0,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601",
      "user": {
        "id": "uuid",
        "username": "string",
        "profilePicture": "string | null"
      },
      "replies": [
        {
          "id": "uuid",
          "content": "string",
          "user": { "id": "uuid", "username": "string", "profilePicture": "string | null" }
        }
      ]
    }
  }
}
```

### Notes

- Returns only direct replies (one level deep), not a fully nested tree.
- Replies are sorted by `createdAt` ascending (oldest first).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| — | Not currently used by any frontend component. |

---

## PATCH `/api/v1/comments/:id`

**Update Comment**

| Property  | Value                            |
| --------- | -------------------------------- |
| Auth      | `protect` — Bearer token required |
| Validator | `updateCommentSchema`            |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant V as Validator
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL

    C->>Auth: PATCH /api/v1/comments/:id
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>V: Forward request
    V-->>V: Validate body against updateCommentSchema
    V->>Ctrl: CommentController.updateComment(req)
    Ctrl->>Svc: CommentService.updateComment(commentId, userId, { content })

    Svc->>DB: comment.findUnique({ where: { id } })
    DB-->>Svc: Comment | null
    alt Comment not found
        Svc-->>C: 404 Comment not found
    end
    alt userId ≠ comment.userId
        Svc-->>C: 403 You are not authorized to update this comment
    end

    Svc->>DB: comment.update({ data: { content } })
    DB-->>Svc: Updated Comment (with user)
    Svc-->>Ctrl: Comment
    Ctrl-->>C: 200 { success: true, data: { comment } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Comment ID  |

**Body**

| Field   | Type   | Constraints     | Required |
| ------- | ------ | --------------- | -------- |
| content | string | min 1 character | Yes      |

### Response

**200 OK** — Returns the updated comment (same shape as Create Comment response).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| CommentSection | `frontend/components/CommentSection.tsx` — updates comments via `commentsApi.updateComment()` |

---

## DELETE `/api/v1/comments/:id`

**Delete Comment**

| Property | Value                            |
| -------- | -------------------------------- |
| Auth     | `protect` — Bearer token required |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL

    C->>Auth: DELETE /api/v1/comments/:id
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: CommentController.deleteComment(req)
    Ctrl->>Svc: CommentService.deleteComment(commentId, userId)

    Svc->>DB: comment.findUnique({ where: { id }, include: { replies } })
    DB-->>Svc: Comment | null
    alt Comment not found
        Svc-->>C: 404 Comment not found
    end
    alt userId ≠ comment.userId
        Svc-->>C: 403 You are not authorized to delete this comment
    end

    Svc-->>Svc: countCommentTree(commentId) — recursive count
    Svc->>DB: comment.delete({ where: { id } }) — cascade deletes replies
    DB-->>Svc: Deleted
    Svc->>DB: idea.update({ commentsCount: decrement totalDeleted })
    DB-->>Svc: Updated

    Svc-->>Ctrl: { message: "Comment deleted successfully" }
    Ctrl-->>C: 204 No Content
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Comment ID  |

### Response

**204 No Content** — Comment and all nested replies deleted.

### Notes

- Cascade deletes all nested replies.
- The idea's `commentsCount` is decremented by the total number of deleted comments (parent + all nested replies).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| CommentSection | `frontend/components/CommentSection.tsx` — deletes comments via `commentsApi.deleteComment()` |

---

## POST `/api/v1/comments/:id/helpful`

**Toggle Helpful on Comment**

| Property | Value                            |
| -------- | -------------------------------- |
| Auth     | `protect` — Bearer token required |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as Auth Middleware
    participant Ctrl as CommentController
    participant Svc as CommentService
    participant DB as PostgreSQL

    C->>Auth: POST /api/v1/comments/:id/helpful
    Auth-->>Auth: Verify Bearer token → userId
    Auth->>Ctrl: CommentController.toggleHelpful(req)
    Ctrl->>Svc: CommentService.toggleHelpful(commentId, userId)

    Svc->>DB: comment.findUnique({ where: { id } })
    DB-->>Svc: Comment | null
    alt Comment not found
        Svc-->>C: 404 Comment not found
    end

    Svc->>DB: commentHelpful.findUnique({ where: { userId_commentId } })
    DB-->>Svc: Existing vote | null

    alt Already marked helpful (toggle off)
        Svc->>DB: $transaction: commentHelpful.delete + comment.update({ helpfulCount: decrement 1 })
        DB-->>Svc: Removed
        Svc->>DB: comment.findUnique({ select: helpfulCount })
        DB-->>Svc: Updated count
        Svc-->>Ctrl: { isHelpful: false, helpfulCount }
    else Not marked (toggle on)
        Svc->>DB: $transaction: commentHelpful.create + comment.update({ helpfulCount: increment 1 })
        DB-->>Svc: Created
        Svc->>DB: comment.findUnique({ select: helpfulCount })
        DB-->>Svc: Updated count
        Svc-->>Ctrl: { isHelpful: true, helpfulCount }
    end

    Ctrl-->>C: 200 { success: true, data: { isHelpful, helpfulCount } }
```

### Request

**Path Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| id    | uuid | Comment ID  |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "isHelpful": true,
    "helpfulCount": 5
  }
}
```

### Notes

- Toggle behavior: calling again removes the helpful vote.
- The `helpfulCount` on the comment is a denormalized counter maintained via transactions.
- Each user can mark a comment as helpful only once (unique constraint on `userId + commentId`).

### Frontend Usage

| Component | Path |
| --------- | ---- |
| CommentItem | `frontend/components/CommentItem.tsx` — toggles helpful via `commentsApi.toggleHelpful()` |
