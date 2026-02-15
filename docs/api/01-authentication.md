# Authentication API

Base path: `/api/v1/auth`

---

## POST `/api/v1/auth/oauth`

**OAuth Login / Registration**

| Property   | Value                                  |
| ---------- | -------------------------------------- |
| Auth       | None                                   |
| Rate Limit | `authLimiter` — 10 req / 15 min per IP |
| Validator  | `oauthSchema`                          |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant V as Validator
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL

    C->>RL: POST /api/v1/auth/oauth
    RL-->>RL: Check IP rate (10/15min)
    alt Rate limit exceeded
        RL-->>C: 429 RATE_LIMIT_EXCEEDED
    end
    RL->>V: Forward request
    V-->>V: Validate body against oauthSchema
    alt Validation fails
        V-->>C: 400 Validation Error (ZodError details)
    end
    V->>Ctrl: AuthController.oauth(req, res, next)
    Ctrl->>Svc: AuthService.oauth({ email, username, profilePicture, provider })
    Svc->>DB: user.findUnique({ where: { email } })
    DB-->>Svc: User | null
    alt User does not exist
        Svc->>DB: user.findUnique({ where: { username } })
        DB-->>Svc: Check uniqueness (up to 10 attempts)
        Svc->>Svc: hashPassword(randomPassword)
        Svc->>DB: user.create({ email, username, passwordHash, profilePicture })
        DB-->>Svc: New User
    end
    Svc->>Svc: generateToken(user.id)
    Svc-->>Ctrl: { user, token }
    Ctrl-->>C: 200 { success: true, data: { user, token } }
```

### Request

**Headers**

| Header       | Value            | Required |
| ------------ | ---------------- | -------- |
| Content-Type | application/json | Yes      |

**Body**

| Field          | Type   | Constraints                                      | Required |
| -------------- | ------ | ------------------------------------------------ | -------- |
| email          | string | Valid email address                               | Yes      |
| username       | string | min 1 character                                   | Yes      |
| profilePicture | string | Valid URL                                         | No       |
| provider       | enum   | `"google"` \| `"github"` \| `"facebook"` \| `"twitter"` | Yes      |

### Response

**200 OK** — Login or registration successful

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "profilePicture": "string | null",
      "createdAt": "ISO 8601"
    },
    "token": "JWT string"
  }
}
```

**400 Bad Request** — Validation error or unable to generate unique username

```json
{
  "success": false,
  "error": "Validation Error",
  "details": [{ "path": ["email"], "message": "Invalid email address" }]
}
```

**429 Too Many Requests**

```json
{
  "success": false,
  "error": {
    "message": "Too many authentication attempts, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

### Frontend Usage

| Component | Path |
| --------- | ---- |
| NextAuth JWT Callback | `frontend/auth.ts` — called via `handleOAuthBackend()` during Google, Twitter, and GitHub sign-in flows |
| SignInForm | `frontend/components/SignInForm.tsx` — triggers OAuth via `signIn()` from NextAuth |
| RegistrationForm | `frontend/components/RegistrationForm.tsx` — triggers OAuth via `signIn()` from NextAuth |

### Notes

- If a user with the given email already exists, the existing user is returned with a new JWT — no new account is created.
- For new users, a random password hash is generated (OAuth users never use it).
- If the requested username is taken, the service appends a random number suffix (up to 10 attempts).

---

## GET `/api/v1/auth/me`

**Get Current User**

| Property   | Value                                     |
| ---------- | ----------------------------------------- |
| Auth       | `protect` — Bearer token required          |
| Rate Limit | `generalLimiter` — 100 req / min per IP (GET) |

### Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant Auth as Auth Middleware
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL

    C->>RL: GET /api/v1/auth/me
    RL-->>RL: Check IP rate (100/min, GET only)
    RL->>Auth: Forward request
    Auth-->>Auth: Extract Bearer token
    alt No token or invalid token
        Auth-->>C: 401 Not authorized to access this route
    end
    Auth-->>Auth: verifyToken → { userId }
    Auth->>Ctrl: AuthController.getCurrentUser(req)
    Ctrl->>Svc: AuthService.getCurrentUser(userId)
    Svc->>DB: user.findUnique({ where: { id: userId } })
    DB-->>Svc: User | null
    alt User not found
        Svc-->>Ctrl: throw AppError(404)
        Ctrl-->>C: 404 User not found
    end
    Svc-->>Ctrl: User
    Ctrl-->>C: 200 { success: true, data: { user } }
```

### Request

**Headers**

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer `<token>` | Yes      |

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "profilePicture": "string | null",
      "bio": "string | null",
      "createdAt": "ISO 8601"
    }
  }
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": "User not found"
}
```

### Frontend Usage

| Component | Path |
| --------- | ---- |
| — | Not directly imported by any component. Auth state is managed through NextAuth session callbacks in `frontend/auth.ts`. |
