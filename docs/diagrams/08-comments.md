# Comments Flow

```mermaid
flowchart TD
  A[View idea] --> B[Load comments]
  B --> C[GET comments]
  C --> D[Fetch DB]
  D --> E[Build tree]
  E --> F[Render comments]

  A --> G[Add comment]
  G --> H{Authenticated?}
  H -- No --> I[Login]
  H -- Yes --> J[POST comment]
  J --> K[Save DB]
  K --> L[Update UI]
