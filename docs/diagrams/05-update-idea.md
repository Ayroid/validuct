# Update Idea Flow

```mermaid
flowchart TD
  A[Click Edit] --> B{Owner?}
  B -- No --> C[Show error]
  B -- Yes --> D[Edit page]
  D --> E[Pre-fill form]
  E --> F[Modify fields]
  F --> G[PATCH /api/v1/ideas/:id]
  G --> H[Verify ownership]
  H --> I[Validate schema]
  I --> J[Update DB]
  J --> K[Redirect to idea]
