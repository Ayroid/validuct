# Ideas Timeline Flow

```mermaid
flowchart TD
  A[View homepage] --> B[Select timeline]
  B --> C{New / Trending / Top?}
  C --> D[GET /api/v1/ideas]
  D --> E[Apply query params]
  E --> F[Fetch from DB]
  F --> G[Calculate scores]
  G --> H{Authenticated?}
  H -- Yes --> I[Join votes table]
  H -- No --> J[Return ideas]
  I --> J
  J --> K[Render IdeaCards]
  K --> L[Show vote buttons]
  K --> M[Show comments count]
