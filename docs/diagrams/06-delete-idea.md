# Delete Idea Flow

```mermaid
flowchart TD
  A[Click Delete] --> B[Show confirmation]
  B --> C{Confirm?}
  C -- No --> D[Cancel]
  C -- Yes --> E[DELETE /api/v1/ideas/:id]
  E --> F[Verify ownership]
  F --> G[Delete from DB]
  G --> H[Success]
  H --> I[Redirect to profile]
