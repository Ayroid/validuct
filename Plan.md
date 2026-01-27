# Validuct Notification System - Learning-Focused Implementation Guide

- **Teaching style:** Detailed explanations (explain each concept thoroughly)
- **Scope:** All notification types (upvotes, signals, comments, replies, milestones)
- **Email provider:** Resend (reuse existing integration)

---

## What We're Building

A production-ready notification system with:

- **In-app notifications** (bell icon in navbar with unread count)
- **Email notifications** (using your existing Resend integration)
- **Queue-based architecture** (for reliability and performance)
- **User preferences** (control what notifications they receive)

---

## Why Queue-Based? (The Teaching Part)

### The Problem with Direct Sending

```
User clicks upvote → API waits for email to send (500ms) → Returns response
```

**Issues:**

- User waits 500ms just because we're sending an email
- If Resend is down, the API fails
- If server crashes mid-send, email is lost forever

### The Queue Solution

```
User clicks upvote → Save email to DB (5ms) → Returns response
                            ↓
              Background worker picks it up later → Sends via Resend
```

**Benefits:**

- API responds in 60ms (instant feel)
- If Resend is down, emails wait and retry later
- If server crashes, emails are safe in the database
- You can see pending/failed emails in your database (debuggable!)

---

## Architecture Overview

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

## Phase 1: Database Schema

### Learning: Why These Tables?

| Table                    | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `Notification`           | What users see in their notification dropdown   |
| `EmailQueue`             | Pending emails waiting to be sent (the "queue") |
| `NotificationPreference` | User settings (email me for comments? signals?) |

### Files to Modify

**`schema.prisma`** - Add these models:

```prisma
// Notification types
enum NotificationType {
  UPVOTE
  SIGNAL
  COMMENT
  REPLY
  MILESTONE

  @@map("notification_type")
}

enum NotificationPriority {
  LOW
  MEDIUM
  HIGH

  @@map("notification_priority")
}

enum EmailStatus {
  PENDING
  SENT
  FAILED

  @@map("email_status")
}

// In-app notifications (what users see in the bell dropdown)
model Notification {
  id              String               @id @default(uuid())
  userId          String               @map("user_id")
  type            NotificationType
  priority        NotificationPriority @default(MEDIUM)
  title           String               @db.VarChar(200)
  message         String               @db.Text
  actionUrl       String?              @map("action_url") @db.VarChar(500)
  ideaId          String?              @map("idea_id")
  commentId       String?              @map("comment_id")
  triggeredById   String?              @map("triggered_by_id")
  read            Boolean              @default(false)
  readAt          DateTime?            @map("read_at")
  createdAt       DateTime             @default(now()) @map("created_at")

  // Relations
  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  triggeredBy User? @relation("TriggeredNotifications", fields: [triggeredById], references: [id], onDelete: SetNull)
  idea        Idea? @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  @@index([userId, read, createdAt])
  @@index([userId, createdAt])
  @@map("notifications")
}

// Email queue (background processing)
model EmailQueue {
  id             String       @id @default(uuid())
  userId         String       @map("user_id")
  type           NotificationType
  priority       NotificationPriority @default(MEDIUM)
  recipientEmail String       @map("recipient_email") @db.VarChar(255)
  subject        String       @db.VarChar(500)
  htmlBody       String       @map("html_body") @db.Text
  status         EmailStatus  @default(PENDING)
  sentAt         DateTime?    @map("sent_at")
  failedAt       DateTime?    @map("failed_at")
  errorMessage   String?      @map("error_message") @db.Text
  retryCount     Int          @default(0) @map("retry_count")
  maxRetries     Int          @default(3) @map("max_retries")
  nextRetryAt    DateTime?    @map("next_retry_at")
  createdAt      DateTime     @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status, priority, createdAt])
  @@index([status, nextRetryAt])
  @@map("email_queue")
}

// User notification preferences
model NotificationPreference {
  id             String  @id @default(uuid())
  userId         String  @unique @map("user_id")

  // Email preferences
  emailSignals   Boolean @default(true) @map("email_signals")
  emailComments  Boolean @default(true) @map("email_comments")
  emailReplies   Boolean @default(true) @map("email_replies")
  emailMilestones Boolean @default(true) @map("email_milestones")

  // In-app preferences
  inappUpvotes   Boolean @default(true) @map("inapp_upvotes")
  inappSignals   Boolean @default(true) @map("inapp_signals")
  inappComments  Boolean @default(true) @map("inapp_comments")
  inappReplies   Boolean @default(true) @map("inapp_replies")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

**Also update User model** to add relations:

```prisma
model User {
  // ... existing fields ...

  // Add these relations
  notifications           Notification[]
  triggeredNotifications  Notification[] @relation("TriggeredNotifications")
  emailQueue              EmailQueue[]
  notificationPreference  NotificationPreference?
}
```

**And Idea model:**

```prisma
model Idea {
  // ... existing fields ...
  notifications Notification[]
}
```

---

## Phase 2: Backend Services

### Learning: Service Architecture

Your codebase uses static class services - all methods are `static async`. This pattern:

- No instance state to manage
- Easy to call: `NotificationService.createNotification(...)`
- Follows your existing `WaitlistService`, `IdeaService` patterns

### Files to Create

### 2.1 Notification Service

**Create:** `backend/src/services/notificationService.ts`

```typescript
import { prisma } from "../config/database.js";
import { NotificationType, NotificationPriority } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  ideaId?: string;
  commentId?: string;
  triggeredById?: string;
  priority?: NotificationPriority;
}

export class NotificationService {
  // Create in-app notification + queue email (FAST - just DB writes)
  static async createNotification(params: CreateNotificationParams) {
    const { userId, type, triggeredById } = params;

    // Don't notify yourself
    if (userId === triggeredById) return null;

    // Get user preferences (creates defaults if not exists)
    const prefs = await this.getOrCreatePreferences(userId);

    // Check if user wants this type of in-app notification
    if (!this.shouldSendInApp(type, prefs)) return null;

    // Create the in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        priority: params.priority || "MEDIUM",
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        ideaId: params.ideaId,
        commentId: params.commentId,
        triggeredById: params.triggeredById,
      },
      include: {
        triggeredBy: {
          select: { id: true, username: true, profilePicture: true },
        },
      },
    });

    return notification;
  }

  // Queue an email for background sending
  static async queueEmail(params: {
    userId: string;
    type: NotificationType;
    recipientEmail: string;
    subject: string;
    htmlBody: string;
    priority?: NotificationPriority;
  }) {
    return prisma.emailQueue.create({
      data: {
        userId: params.userId,
        type: params.type,
        priority: params.priority || "MEDIUM",
        recipientEmail: params.recipientEmail,
        subject: params.subject,
        htmlBody: params.htmlBody,
      },
    });
  }

  // Get user's notifications with pagination
  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          triggeredBy: {
            select: { id: true, username: true, profilePicture: true },
          },
          idea: {
            select: { id: true, heading: true },
          },
        },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get unread count (for the badge)
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  // Mark single notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== userId) {
      throw new AppError("Not authorized", 403);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  // Mark all as read
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== userId) {
      throw new AppError("Not authorized", 403);
    }

    return prisma.notification.delete({ where: { id: notificationId } });
  }

  // Get or create user preferences with defaults
  static async getOrCreatePreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  }

  // Update preferences
  static async updatePreferences(
    userId: string,
    data: Partial<{
      emailSignals: boolean;
      emailComments: boolean;
      emailReplies: boolean;
      emailMilestones: boolean;
      inappUpvotes: boolean;
      inappSignals: boolean;
      inappComments: boolean;
      inappReplies: boolean;
    }>,
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // Check if user wants in-app notification for this type
  private static shouldSendInApp(type: NotificationType, prefs: any): boolean {
    switch (type) {
      case "UPVOTE":
        return prefs.inappUpvotes;
      case "SIGNAL":
        return prefs.inappSignals;
      case "COMMENT":
        return prefs.inappComments;
      case "REPLY":
        return prefs.inappReplies;
      case "MILESTONE":
        return true; // Always show milestones
      default:
        return true;
    }
  }

  // Check if user wants email for this type
  static shouldSendEmail(type: NotificationType, prefs: any): boolean {
    switch (type) {
      case "UPVOTE":
        return false; // Don't email for upvotes (too spammy)
      case "SIGNAL":
        return prefs.emailSignals;
      case "COMMENT":
        return prefs.emailComments;
      case "REPLY":
        return prefs.emailReplies;
      case "MILESTONE":
        return prefs.emailMilestones;
      default:
        return false;
    }
  }
}
```

### 2.2 Email Worker Service

**Create:** `backend/src/services/emailWorkerService.ts`

This is the background worker - the heart of the queue system.

```typescript
import { prisma } from "../config/database.js";
import { Resend } from "resend";

export class EmailWorkerService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  // Start the background worker
  static start(intervalSeconds = 30) {
    console.log(`📧 Email worker starting (every ${intervalSeconds}s)`);

    this.intervalId = setInterval(async () => {
      await this.processQueue();
    }, intervalSeconds * 1000);

    // Also run immediately on start
    this.processQueue();
  }

  // Stop the worker (for graceful shutdown)
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("📧 Email worker stopped");
    }
  }

  // Process pending emails
  static async processQueue(batchSize = 10) {
    // Prevent concurrent processing
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();

      // Get pending emails that are ready to send
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: "PENDING",
          OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
        },
        orderBy: [
          { priority: "desc" }, // HIGH first
          { createdAt: "asc" }, // Oldest first
        ],
        take: batchSize,
      });

      if (pendingEmails.length === 0) return;

      console.log(`📧 Processing ${pendingEmails.length} emails`);

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("RESEND_API_KEY not configured");
        return;
      }

      const resend = new Resend(resendApiKey);

      for (const email of pendingEmails) {
        try {
          // Send the email
          const { error } = await resend.emails.send({
            from: "Validuct <notifications@validuct.com>",
            to: [email.recipientEmail],
            subject: email.subject,
            html: email.htmlBody,
          });

          if (error) throw error;

          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: "SENT", sentAt: new Date() },
          });

          console.log(`✅ Email sent: ${email.id}`);
        } catch (error: any) {
          // Handle failure with retry logic
          const shouldRetry = email.retryCount < email.maxRetries;

          if (shouldRetry) {
            // Exponential backoff: 5min, 15min, 45min
            const delayMinutes = Math.pow(3, email.retryCount + 1) * 5;
            const nextRetry = new Date(now.getTime() + delayMinutes * 60000);

            await prisma.emailQueue.update({
              where: { id: email.id },
              data: {
                retryCount: email.retryCount + 1,
                nextRetryAt: nextRetry,
                errorMessage: error.message || "Unknown error",
              },
            });

            console.log(
              `⚠️ Email ${email.id} failed, retry in ${delayMinutes}min`,
            );
          } else {
            // Max retries reached - mark as failed
            await prisma.emailQueue.update({
              where: { id: email.id },
              data: {
                status: "FAILED",
                failedAt: new Date(),
                errorMessage: error.message || "Unknown error",
              },
            });

            console.log(`❌ Email ${email.id} permanently failed`);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Get queue stats (for monitoring)
  static async getStats() {
    const [pending, sent, failed] = await Promise.all([
      prisma.emailQueue.count({ where: { status: "PENDING" } }),
      prisma.emailQueue.count({ where: { status: "SENT" } }),
      prisma.emailQueue.count({ where: { status: "FAILED" } }),
    ]);

    return { pending, sent, failed, total: pending + sent + failed };
  }
}
```

### 2.3 Notification Triggers Service

**Create:** `backend/src/services/notificationTriggers.ts`

This connects your existing actions to the notification system.

```typescript
import { prisma } from "../config/database.js";
import { NotificationService } from "./notificationService.js";
import { notificationEmailTemplate } from "../templates/notificationEmailTemplate.js";

export class NotificationTriggers {
  // When someone upvotes an idea
  static async onIdeaUpvote(ideaId: string, upvotedByUserId: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!idea) return;

    // Create in-app notification
    await NotificationService.createNotification({
      userId: idea.userId,
      type: "UPVOTE",
      title: "New upvote!",
      message: `Someone upvoted "${idea.heading}"`,
      actionUrl: `/ideas/${ideaId}`,
      ideaId,
      triggeredById: upvotedByUserId,
    });

    // Check for milestones
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    if (milestones.includes(idea.upvotesCount)) {
      await this.onMilestoneReached(idea, idea.upvotesCount);
    }
  }

  // When someone adds a validation signal
  static async onValidationSignal(
    ideaId: string,
    signalType: string,
    signaledByUserId: string,
  ) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!idea) return;

    const signalNames: Record<string, string> = {
      PROBLEM_REAL: "Problem is Real",
      WOULD_PAY: "Would Pay",
      READY_TO_BUILD: "Ready to Build",
      NEEDS_CLARITY: "Needs Clarity",
    };

    const triggeredBy = await prisma.user.findUnique({
      where: { id: signaledByUserId },
      select: { username: true },
    });

    // Create in-app notification
    await NotificationService.createNotification({
      userId: idea.userId,
      type: "SIGNAL",
      title: `New "${signalNames[signalType] || signalType}" signal!`,
      message: `@${triggeredBy?.username || "Someone"} signaled on "${idea.heading}"`,
      actionUrl: `/ideas/${ideaId}`,
      ideaId,
      triggeredById: signaledByUserId,
      priority: "HIGH", // Signals are important
    });

    // Queue email notification
    const prefs = await NotificationService.getOrCreatePreferences(idea.userId);
    if (NotificationService.shouldSendEmail("SIGNAL", prefs)) {
      await NotificationService.queueEmail({
        userId: idea.userId,
        type: "SIGNAL",
        recipientEmail: idea.user.email,
        subject: `🎯 New validation signal on "${idea.heading}"`,
        htmlBody: notificationEmailTemplate({
          type: "signal",
          ideaTitle: idea.heading,
          signalType: signalNames[signalType] || signalType,
          triggeredByUsername: triggeredBy?.username,
          actionUrl: `${process.env.APP_URL}/ideas/${ideaId}`,
        }),
        priority: "HIGH",
      });
    }
  }

  // When someone comments on an idea
  static async onComment(commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        idea: {
          include: {
            user: { select: { id: true, email: true, username: true } },
          },
        },
        user: { select: { id: true, username: true } },
      },
    });

    if (!comment) return;

    // Notify idea owner
    await NotificationService.createNotification({
      userId: comment.idea.userId,
      type: "COMMENT",
      title: "New comment!",
      message: `@${comment.user.username} commented on "${comment.idea.heading}"`,
      actionUrl: `/ideas/${comment.ideaId}`,
      ideaId: comment.ideaId,
      commentId: comment.id,
      triggeredById: comment.userId,
    });

    // Queue email
    const prefs = await NotificationService.getOrCreatePreferences(
      comment.idea.userId,
    );
    if (NotificationService.shouldSendEmail("COMMENT", prefs)) {
      await NotificationService.queueEmail({
        userId: comment.idea.userId,
        type: "COMMENT",
        recipientEmail: comment.idea.user.email,
        subject: `💬 New comment on "${comment.idea.heading}"`,
        htmlBody: notificationEmailTemplate({
          type: "comment",
          ideaTitle: comment.idea.heading,
          commentPreview: comment.content.substring(0, 150),
          triggeredByUsername: comment.user.username,
          actionUrl: `${process.env.APP_URL}/ideas/${comment.ideaId}`,
        }),
      });
    }
  }

  // When someone replies to a comment
  static async onReply(replyId: string) {
    const reply = await prisma.comment.findUnique({
      where: { id: replyId },
      include: {
        parentComment: {
          include: {
            user: { select: { id: true, email: true, username: true } },
          },
        },
        idea: { select: { id: true, heading: true } },
        user: { select: { id: true, username: true } },
      },
    });

    if (!reply?.parentComment) return;

    // Notify parent comment author
    await NotificationService.createNotification({
      userId: reply.parentComment.userId,
      type: "REPLY",
      title: "New reply!",
      message: `@${reply.user.username} replied to your comment`,
      actionUrl: `/ideas/${reply.ideaId}`,
      ideaId: reply.ideaId,
      commentId: reply.id,
      triggeredById: reply.userId,
    });

    // Queue email
    const prefs = await NotificationService.getOrCreatePreferences(
      reply.parentComment.userId,
    );
    if (NotificationService.shouldSendEmail("REPLY", prefs)) {
      await NotificationService.queueEmail({
        userId: reply.parentComment.userId,
        type: "REPLY",
        recipientEmail: reply.parentComment.user.email,
        subject: `↩️ New reply to your comment`,
        htmlBody: notificationEmailTemplate({
          type: "reply",
          ideaTitle: reply.idea.heading,
          commentPreview: reply.content.substring(0, 150),
          triggeredByUsername: reply.user.username,
          actionUrl: `${process.env.APP_URL}/ideas/${reply.ideaId}`,
        }),
      });
    }
  }

  // When idea reaches a milestone
  private static async onMilestoneReached(idea: any, count: number) {
    await NotificationService.createNotification({
      userId: idea.userId,
      type: "MILESTONE",
      title: `🎉 ${count} upvotes!`,
      message: `"${idea.heading}" reached ${count} upvotes!`,
      actionUrl: `/ideas/${idea.id}`,
      ideaId: idea.id,
      priority: "HIGH",
    });

    // Queue celebratory email
    const prefs = await NotificationService.getOrCreatePreferences(idea.userId);
    if (NotificationService.shouldSendEmail("MILESTONE", prefs)) {
      await NotificationService.queueEmail({
        userId: idea.userId,
        type: "MILESTONE",
        recipientEmail: idea.user.email,
        subject: `🎉 "${idea.heading}" hit ${count} upvotes!`,
        htmlBody: notificationEmailTemplate({
          type: "milestone",
          ideaTitle: idea.heading,
          milestoneCount: count,
          actionUrl: `${process.env.APP_URL}/ideas/${idea.id}`,
        }),
        priority: "HIGH",
      });
    }
  }
}
```

---

## Phase 3: Email Templates

### Learning: Reuse Your Existing Pattern

Your `waitlistEmailTemplate.ts` is a great reference. We'll create a flexible notification template that handles multiple types.

**Create:** `backend/src/templates/notificationEmailTemplate.ts`

Follow the same pattern as your waitlist template - a function returning `{ from, subject, html }`.

---

## Phase 4: Routes & Controllers

### Learning: Following Your Existing Patterns

Your routes use:

- `protect` middleware for auth
- `validate(schema)` for input validation
- Static controller classes

**Create:** `backend/src/routes/notificationRoutes.ts`

```typescript
import { Router } from "express";
import { NotificationController } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";
import { updatePreferencesSchema } from "../utils/validation.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.get("/", NotificationController.getNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch("/:id/read", NotificationController.markAsRead);
router.post("/mark-all-read", NotificationController.markAllAsRead);
router.delete("/:id", NotificationController.deleteNotification);

// Preferences
router.get("/preferences", NotificationController.getPreferences);
router.patch(
  "/preferences",
  validate(updatePreferencesSchema),
  NotificationController.updatePreferences,
);

export default router;
```

**Create:** `backend/src/controllers/notificationController.ts`

---

## Phase 5: Start Email Worker

**Modify:** `backend/src/server.ts`

Add the email worker startup:

```typescript
import { EmailWorkerService } from "./services/emailWorkerService.js";

// After server starts
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start email background worker
  EmailWorkerService.start(30); // Process every 30 seconds
});

// Graceful shutdown
process.on("SIGTERM", () => {
  EmailWorkerService.stop();
  // ... rest of shutdown
});
```

---

## Phase 6: Integration with Existing Routes

Modify existing routes to trigger notifications:

**`backend/src/routes/voteRoutes.ts`** - After upvote:

```typescript
await NotificationTriggers.onIdeaUpvote(ideaId, userId);
```

**`backend/src/routes/signalRoutes.ts`** - After signal:

```typescript
await NotificationTriggers.onValidationSignal(ideaId, signalType, userId);
```

**`backend/src/routes/commentRoutes.ts`** - After comment:

```typescript
if (parentCommentId) {
  await NotificationTriggers.onReply(comment.id);
} else {
  await NotificationTriggers.onComment(comment.id);
}
```

---

## Phase 7: Frontend

### Files to Create/Modify

| File                                           | Purpose                                   |
| ---------------------------------------------- | ----------------------------------------- |
| `frontend/lib/api/notifications.ts`            | API client module                         |
| `frontend/components/NotificationBell.tsx`     | Bell icon with badge (client component)   |
| `frontend/components/NotificationDropdown.tsx` | Notification list                         |
| `frontend/components/Navbar.tsx`               | Add bell between theme toggle and profile |
| `frontend/types/index.ts`                      | Add notification types                    |

### Frontend Polling Pattern

Since you don't have WebSockets, we'll use polling (same as most apps):

```typescript
useEffect(() => {
  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
  return () => clearInterval(interval);
}, []);
```

---

## Implementation Order (Recommended)

1. **Database schema** - Add models, run migration
2. **Backend services** - NotificationService, EmailWorkerService
3. **Email templates** - Create notification email template
4. **Routes & controllers** - Notification API endpoints
5. **Start worker** - Modify server.ts
6. **Integrate triggers** - Add to vote/signal/comment routes
7. **Frontend API** - notifications.ts
8. **Frontend components** - Bell, dropdown
9. **Navbar integration** - Add bell to navbar
10. **Test end-to-end**

---

## Verification Steps

| Step        | Action                                                |
| ----------- | ----------------------------------------------------- |
| Database    | Run `npx prisma migrate dev` - verify tables created  |
| API         | Test `GET /api/v1/notifications` returns empty array  |
| Trigger     | Upvote an idea → check notification appears in DB     |
| Email queue | Check `EmailQueue` table has pending email            |
| Worker      | Wait 30s → check email marked as SENT                 |
| Frontend    | Bell shows unread count, clicking shows notifications |
| Preferences | Update preference → verify notification respects it   |

---

## Key Learning Points Summary

| Concept               | Explanation                                     |
| --------------------- | ----------------------------------------------- |
| **Queue Pattern**     | Don't block user requests for background tasks  |
| **Retry Logic**       | Exponential backoff (5min → 15min → 45min)      |
| **Preferences**       | Always check before sending                     |
| **Self-notification** | Never notify users about their own actions      |
| **Milestones**        | Track meaningful achievements (10, 25, 50, 100) |
| **Polling**           | 30s intervals balance freshness vs server load  |
| **Static Services**   | Match your existing codebase patterns           |

---

## Teaching Approach (How We'll Implement)

Since you chose detailed explanations, here's how we'll work through each phase:

### Phase 1: Database Schema

**Concepts we'll learn:**

- Why we separate in-app notifications from email queue
- How indexes work and why they matter for notification queries
- The difference between `@map` and `@@map` in Prisma
- Why we use enums vs strings for notification types

### Phase 2: Backend Services

**Concepts we'll learn:**

- The service layer pattern and why it exists
- How background workers work (`setInterval` vs job queues)
- Exponential backoff and why it prevents thundering herd problems
- Transaction safety and when to use `prisma.$transaction`

### Phase 3: Email Templates

**Concepts we'll learn:**

- Why email HTML is different from web HTML
- Template functions vs template strings
- Making emails responsive across email clients

### Phase 4: Routes & Controllers

**Concepts we'll learn:**

- RESTful API design for notifications
- Why we separate controllers from services
- Input validation patterns with Zod

### Phase 5: Frontend

**Concepts we'll learn:**

- Polling vs WebSockets (and when to choose each)
- Optimistic UI updates for better UX
- Managing dropdown state and focus

---

## Files We'll Create/Modify

### Backend (New Files)

- `backend/src/services/notificationService.ts`
- `backend/src/services/emailWorkerService.ts`
- `backend/src/services/notificationTriggers.ts`
- `backend/src/controllers/notificationController.ts`
- `backend/src/routes/notificationRoutes.ts`
- `backend/src/templates/notificationEmailTemplate.ts`

### Backend (Modify)

- `backend/prisma/schema.prisma` - Add 3 new models
- `backend/src/server.ts` - Start email worker
- `backend/src/app.ts` - Mount notification routes
- `backend/src/utils/validation.ts` - Add notification schemas
- `backend/src/routes/voteRoutes.ts` - Add trigger
- `backend/src/routes/signalRoutes.ts` - Add trigger
- `backend/src/routes/commentRoutes.ts` - Add trigger

### Frontend (New Files)

- `frontend/lib/api/notifications.ts`
- `frontend/components/NotificationBell.tsx`
- `frontend/components/NotificationDropdown.tsx`
- `frontend/app/(protected)/settings/notifications/page.tsx`

### Frontend (Modify)

- `frontend/components/Navbar.tsx` - Add bell icon
- `frontend/types/index.ts` - Add notification types
