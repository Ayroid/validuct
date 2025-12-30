# View Idea Flow

```mermaid
flowchart TD
  A[Click idea] --> B[Navigate to /idea/:id]
  B --> C[GET /api/v1/ideas/:id]
  C --> D[Fetch idea]
  D --> E[Join user data]
  E --> F[Include vote counts]
  F --> G{Authenticated?}
  G -- Yes --> H[Include user vote]
  G -- No --> I[Return idea]
  H --> I
  I --> J[Render idea page]
  J --> K[Vote buttons]
  J --> L[Pin button]
  J --> M[Comments section]
