
---

## 📄 `09-pin-unpin.md`

```md
# Pin / Unpin Flow

```mermaid
flowchart LR
  A[View own idea] --> B[Check pin status]
  B --> C{Pinned?}

  C -- No --> D[POST pin]
  D --> E[Check limit]
  E --> F[Save pin]
  F --> G[Update UI]

  C -- Yes --> H[DELETE pin]
  H --> I[Remove pin]
  I --> G
