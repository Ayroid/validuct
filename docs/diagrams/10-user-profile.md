
---

## 📄 `10-user-profile.md`

```md
# User Profile Flow

```mermaid
flowchart TD
  A[Visit profile] --> B[Parse username]
  B --> C[GET user]
  C --> D{Exists?}
  D -- No --> E[404]
  D -- Yes --> F[Fetch ideas & pins]
  F --> G[Render profile]
  G --> H[Ideas timeline]
