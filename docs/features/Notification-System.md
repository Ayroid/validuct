# Validuct Notification System

## Overview

A production-ready notification system with:
- **In-app notifications** (bell icon in navbar with unread count)
- **Email notifications** (using Resend integration)
- **Queue-based architecture** (for reliability and performance)
- **User preferences** (control what notifications they receive)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Action   │────▶│  Notification   │────▶│   In-App DB     │
│  (upvote, etc)  │     │    Service      │     │  (Notification) │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Email Queue    │
                       │ (EmailQueue)    │
                       └────────┬────────┘
                                │
                                ▼ (every 30s)
                       ┌─────────────────┐
                       │ Email Worker    │────▶ Resend API
                       └─────────────────┘
```

---

## Database Schema

### New Models (Prisma)

#### NotificationType Enum
```prisma
enum NotificationType {
  UPVOTE
  SIGNAL
  COMMENT
  REPLY
  MILESTONE
}
```

#### NotificationPriority Enum
```prisma
enum NotificationPriority {
  LOW
  MEDIUM
  HIGH
}
```

#### EmailStatus Enum
```prisma
enum EmailStatus {
  PENDING
  SENT
  FAILED
}
```

#### Notification Model
Stores in-app notifications displayed in the bell dropdown.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User receiving the notification |
| type | NotificationType | Type of notification |
| priority | NotificationPriority | Priority level (default: MEDIUM) |
| title | String | Notification title |
| message | String | Notification message |
| actionUrl | String? | URL to navigate when clicked |
| ideaId | String? | Related idea ID |
| commentId | String? | Related comment ID |
| triggeredById | String? | User who triggered the notification |
| read | Boolean | Whether notification is read |
| readAt | DateTime? | When notification was read |
| createdAt | DateTime | Creation timestamp |

#### EmailQueue Model
Queue for background email processing.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User receiving the email |
| type | NotificationType | Type of notification |
| priority | NotificationPriority | Priority level |
| recipientEmail | String | Email address |
| subject | String | Email subject |
| htmlBody | String | HTML email content |
| status | EmailStatus | PENDING, SENT, or FAILED |
| sentAt | DateTime? | When email was sent |
| failedAt | DateTime? | When email failed |
| errorMessage | String? | Error message if failed |
| retryCount | Int | Number of retry attempts |
| maxRetries | Int | Maximum retries (default: 3) |
| nextRetryAt | DateTime? | Next retry timestamp |
| createdAt | DateTime | Creation timestamp |

#### NotificationPreferences Model
User preferences for notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| userId | String | User ID (unique) |
| emailSignals | Boolean | Email for signals (default: true) |
| emailComments | Boolean | Email for comments (default: true) |
| emailReplies | Boolean | Email for replies (default: true) |
| emailMilestones | Boolean | Email for milestones (default: true) |
| inAppUpVotes | Boolean | In-app for upvotes (default: true) |
| inAppUpSignals | Boolean | In-app for signals (default: true) |
| inAppUpComments | Boolean | In-app for comments (default: true) |
| inAppUpReplies | Boolean | In-app for replies (default: true) |

---

## Backend Files

### New Files Created

| File | Purpose |
|------|---------|
| `src/services/notificationService.ts` | Core notification logic (create, read, update, delete) |
| `src/services/emailWorkerService.ts` | Background email queue processor |
| `src/services/notificationTriggers.ts` | Triggers for upvotes, signals, comments, replies, milestones |
| `src/controllers/notificationController.ts` | API request handlers |
| `src/routes/notificationRoutes.ts` | REST API route definitions |
| `src/templates/notificationEmailTemplate.ts` | HTML email template |

### Modified Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added 3 models + 3 enums + User/Idea relations |
| `src/app.ts` | Added notification routes import and mount |
| `src/server.ts` | Added email worker startup/shutdown |
| `src/utils/validation.ts` | Added `updatePreferencesSchema` |
| `src/services/voteService.ts` | Added upvote notification trigger |
| `src/services/signalService.ts` | Added signal notification trigger |
| `src/services/commentService.ts` | Added comment/reply notification triggers |

---

## API Endpoints

All endpoints require authentication (`protect` middleware).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get paginated notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread notification count |
| PATCH | `/api/v1/notifications/:id/read` | Mark single notification as read |
| POST | `/api/v1/notifications/mark-all-read` | Mark all notifications as read |
| DELETE | `/api/v1/notifications/:id` | Delete a notification |
| GET | `/api/v1/notifications/preferences` | Get user preferences |
| PATCH | `/api/v1/notifications/preferences` | Update user preferences |

### Response Examples

#### GET /api/v1/notifications
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "UPVOTE",
        "title": "New upvote!",
        "message": "Someone upvoted \"Your Idea\"",
        "actionUrl": "/idea/uuid",
        "read": false,
        "createdAt": "2024-01-17T00:00:00.000Z",
        "triggeredBy": {
          "id": "uuid",
          "username": "johndoe",
          "profilePicture": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### GET /api/v1/notifications/unread-count
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## Frontend Files

### New Files Created

| File | Purpose |
|------|---------|
| `lib/api/notifications.ts` | API client functions |
| `components/NotificationBell.tsx` | Bell icon with unread badge (Client Component) |
| `components/NotificationDropdown.tsx` | Dropdown notification list |
| `components/NotificationsList.tsx` | Full notifications page list (Client Component) |
| `app/notifications/page.tsx` | Notifications page (Server Component) |

### Modified Files

| File | Changes |
|------|---------|
| `components/Navbar.tsx` | Added NotificationBell component |
| `types/index.ts` | Added Notification and NotificationPreferences types |

---

## Notification Types & Triggers

| Type | Trigger | In-App | Email | Priority |
|------|---------|--------|-------|----------|
| UPVOTE | User upvotes an idea | Yes (configurable) | No | MEDIUM |
| SIGNAL | User adds validation signal | Yes (configurable) | Yes (configurable) | HIGH |
| COMMENT | User comments on idea | Yes (configurable) | Yes (configurable) | MEDIUM |
| REPLY | User replies to comment | Yes (configurable) | Yes (configurable) | MEDIUM |
| MILESTONE | Idea reaches 10/25/50/100/250/500/1000 upvotes | Always | Yes (configurable) | HIGH |

---

## Email Worker

The email worker runs as a background process:

- **Interval**: Every 30 seconds
- **Batch size**: 10 emails per cycle
- **Retry logic**: Exponential backoff (5min → 15min → 45min)
- **Max retries**: 3 attempts before marking as FAILED

### Startup
```typescript
// In server.ts
EmailWorkerService.start(30); // Process every 30 seconds
```

### Shutdown
```typescript
// Graceful shutdown
EmailWorkerService.stop();
```

---

## Key Features

### Self-notification Prevention
Users are never notified about their own actions.

### Preference Respect
All notifications check user preferences before creating.

### Queue-based Emails
- API responds instantly (5ms DB write)
- Emails sent asynchronously in background
- Automatic retry on failure
- Permanent failure tracking

### Polling
Frontend polls for unread count every 30 seconds.

---

## Testing Checklist

| Step | Action |
|------|--------|
| Database | Run `npx prisma db push` - verify tables created |
| API | Test `GET /api/v1/notifications` returns empty array |
| Trigger | Upvote an idea → check notification appears in DB |
| Email queue | Check `EmailQueue` table has pending email |
| Worker | Wait 30s → check email marked as SENT |
| Frontend | Bell shows unread count, clicking shows notifications |
| Preferences | Update preference → verify notification respects it |
| Navigation | Click notification → navigates to `/idea/{id}` |

---

## Environment Variables

Ensure these are set in `.env`:

```env
RESEND_API_KEY=your_resend_api_key
APP_URL=https://validuct.com
```

---

## Future Improvements

- [ ] WebSocket support for real-time notifications
- [ ] Push notifications (mobile/browser)
- [ ] Notification batching (daily digest emails)
- [ ] Notification settings page in frontend
- [ ] Admin dashboard for email queue monitoring
