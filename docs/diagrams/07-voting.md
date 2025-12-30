
---

## 📄 `07-voting.md`

```md
# Voting Flow

```mermaid
flowchart TD
  A[Click vote] --> B{Authenticated?}
  B -- No --> C[Redirect to login]
  B -- Yes --> D{Same vote?}

  D -- No --> E[POST vote]
  E --> F[Update or create vote]
  F --> G[Recalculate counts]
  G --> H[Update UI]

  D -- Yes --> I[DELETE vote]
  I --> J[Remove vote]
  J --> K[Recalculate counts]
  K --> H
