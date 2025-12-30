
---

## 📄 `11-update-profile.md`

```md
# Update Profile Flow

```mermaid
flowchart TD
  A[Edit profile] --> B{Owner?}
  B -- No --> C[403]
  B -- Yes --> D[Load data]
  D --> E[Edit form]
  E --> F[PATCH /users/me]
  F --> G[Validate]
  G --> H{Username taken?}
  H -- Yes --> I[Conflict error]
  H -- No --> J[Update DB]
  J --> K[Redirect profile]
