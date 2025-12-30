
---

## 📄 `03-create-idea.md`

```md
# Create Idea Flow

```mermaid
flowchart LR
  A[Click New Idea] --> B{Authenticated?}
  B -- No --> C[Redirect to login]
  B -- Yes --> D[Show idea form]
  D --> E[Fill form]
  E --> F[Validate input]
  F --> G[POST /api/v1/ideas]
  G --> H[Validate schema]
  H --> I[Create in DB]
  I --> J[Return new idea]
  J --> K[Redirect to idea page]
