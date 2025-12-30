# Authentication Flow

```mermaid
flowchart TD
  A[User visits app] --> B{Check session?}
  B -- No --> C[Click Google Login]
  B -- Yes --> D[GET /api/v1/auth/me]

  C --> E[NextAuth OAuth]
  E --> F[POST /api/v1/auth/oauth]
  F --> G[Validate Google token]
  G --> H{User exists?}
  H -- No --> I[Create new user]
  H -- Yes --> J[Return user data]
  I --> J
  J --> K[Store session]
  K --> L[Redirect to home]

  D --> M[Verify JWT]
  M --> N[Fetch user from DB]
  N --> O[Return user profile]
