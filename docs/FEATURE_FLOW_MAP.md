# Validuct — Complete Feature & Code Flow Map

> Use this document to build an Obsidian canvas. Each `##` section is a **feature group** (canvas node cluster). Each `###` is a **feature** (canvas node). Indented flows show the **code path** (edge connections).

---

## 1. Authentication & User Management

### 1.1 OAuth Sign-In (Google / Twitter / GitHub)

**User Flow:** Landing or `/signin` → Click provider button → OAuth redirect → Callback → Home

**Frontend Flow:**
```
SignInForm.tsx
  → signIn(provider)                          [NextAuth client]
  → OAuth provider redirect & consent
  → NextAuth callback
      → auth.ts: jwt() callback
          → Extracts: email, username, profilePicture, provider
          → POST /api/v1/auth/oauth            [lib/api/auth.ts → client.ts]
          → Stores backendToken in JWT
      → auth.ts: session() callback
          → Populates session with user + backendToken
  → Redirect to /home
```

**Backend Flow:**
```
POST /api/v1/auth/oauth
  → rateLimiter: authLimiter (10 req/15min per IP)
  → validator: oauthSchema (Zod)
  → authController.oauth()
      → authService.oauthLogin(email, username, profilePicture, provider)
          → prisma.user.findUnique({ where: { email } })
          → IF exists → return user
          → IF new → generate unique username (append random suffix if taken)
                    → hash random password (bcrypt, 10 rounds)
                    → prisma.user.create(...)
          → authService.generateToken(userId)
              → jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE })
      → Response: 200 { success, data: { user, token } }
```

**Key Files:**
- `frontend/components/SignInForm.tsx`
- `frontend/auth.ts` (NextAuth config)
- `frontend/context/AuthContext.tsx`
- `backend/src/routes/authRoutes.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`

---

### 1.2 Session & Token Management

**Frontend Flow:**
```
SessionProvider (wraps entire app)
  → useSession() hook available everywhere
  → AuthContext.tsx: useAuth() hook
      → Exposes: user, loading, logout, isAuthenticated, backendToken

API Client (lib/api/client.ts):
  → Axios instance with base URL: ${API_URL}/v1
  → Request interceptor:
      → getSession() → attaches Authorization: Bearer {backendToken}
  → Response interceptor:
      → 401 → redirect to /signin
      → 429 → toast "Rate limit exceeded"
```

**Protected Routes (middleware.ts):**
```
Routes requiring auth: /home, /idea/new, /idea/[id]/edit
  → NextAuth authorized() callback
  → IF no session → redirect to /signin
```

**Backend Middleware:**
```
protect middleware:
  → Extract token from Authorization header
  → jwt.verify(token, JWT_SECRET)
  → Attach req.userId
  → 401 if missing/invalid

optionalProtect middleware:
  → Same as protect but continues without error if no token
  → Used for: GET /ideas, GET /ideas/:id, GET /ideas/:id/comments, GET /ideas/:id/signals
```

---

### 1.3 Get Current User

**Flow:**
```
Frontend: useAuth() → session.user
  OR
Frontend: GET /api/v1/auth/me        [lib/api/auth.ts]

Backend:
  GET /auth/me
    → protect middleware
    → authController.getCurrentUser()
        → prisma.user.findUnique({ where: { id: userId } })
        → Response: { id, username, email, profilePicture, bio, createdAt }
```

---

### 1.4 Update Profile

**User Flow:** Profile page → Edit button → `/[username]/edit` → Form → Save

**Frontend Flow:**
```
/[username]/edit/page.tsx
  → Form fields: username, bio, profilePicture
  → Submit → userApi.updateProfile(data)     [lib/api/users.ts]
      → PATCH /api/v1/users/me
  → On success → redirect to profile page
```

**Backend Flow:**
```
PATCH /api/v1/users/me
  → protect middleware
  → validator: updateUserSchema (username: 3-50 chars alphanumeric+underscore, bio: max 500, profilePicture: URL)
  → userController.updateProfile()
      → userService.updateProfile(userId, data)
          → IF username change → check uniqueness
          → prisma.user.update(...)
      → Response: 200 { success, data: user }
  → Errors: 400 (username taken), 401 (not authenticated)
```

---

### 1.5 View User Profile

**User Flow:** Click username anywhere → `/{username}` page

**Frontend Flow:**
```
/[username]/page.tsx
  → useParams() → username
  → userApi.getUserProfile(username)          [GET /users/:username]
  → userApi.getUserIdeas(username, page, limit, sort)  [GET /users/:username/ideas]
  → userApi.getValidationSummary(username)    [GET /users/:username/validation-summary]
  → Renders:
      → BuilderSnapshotHeader.tsx (avatar, bio, stats)
      → ValidationSummaryCard.tsx (signal summary)
      → ProfileIdeaCard.tsx list (ideas with signals)
      → Sort: newest / oldest / popular
      → Infinite scroll pagination
```

**Backend Flow (getUserProfile):**
```
GET /api/v1/users/:username
  → userController.getUserProfile()
      → prisma.user.findUnique({
            where: { username },
            include: { ideas: { count }, pinnedIdeas: { include: idea } }
        })
      → Response: { user, ideasCount, pinnedIdeas (max 5) }
```

---

## 2. Idea Management

### 2.1 Create Idea

**User Flow:** Click "Share Idea" FAB/button → `/idea/new` → Fill form → Submit

**Frontend Flow:**
```
IdeaShare.tsx (FAB on mobile / composer on desktop)
  → Click → router.push('/idea/new')

/idea/new/page.tsx
  → Form: heading (100 char max), description (500 char max),
           status dropdown (DRAFT/WIP/VALIDATED/LAUNCHED),
           launchedLink (optional, shown if LAUNCHED)
  → Submit → ideasApi.createIdea(data)        [lib/api/ideas.ts]
      → POST /api/v1/ideas
  → On success → router.push('/home')
  → On error → alert
```

**Backend Flow:**
```
POST /api/v1/ideas
  → protect middleware
  → createIdeaLimiter (20 req/1hr per user)
  → validator: createIdeaSchema
  → ideaController.createIdea()
      → ideaService.createIdea(userId, { heading, description, status?, launchedLink? })
          → prisma.idea.create({
                data: { userId, heading, description, status: DRAFT, ... },
                include: { user: { select: { username, profilePicture } } }
            })
      → Response: 201 { success, data: idea }
```

---

### 2.2 View Idea Detail

**User Flow:** Click idea card → `/idea/{id}`

**Frontend Flow:**
```
/idea/[id]/page.tsx
  → useParams() → id
  → ideasApi.getIdeaById(id)                  [GET /ideas/:id]
  → Renders:
      → Idea heading, description, status badge, launchedLink
      → VoteButtons.tsx (upvote/downvote)
      → ValidationSignals.tsx (4 signal toggles)
      → ShareButton.tsx (Twitter/LinkedIn/Reddit/Copy)
      → IdeaWaitlist.tsx (join waitlist form)
      → CommentSection.tsx (comments + reply form)
      → Edit/Delete buttons (if owner)
```

**Backend Flow:**
```
GET /api/v1/ideas/:id
  → optionalProtect middleware
  → ideaController.getIdeaById()
      → ideaService.getIdeaById(id, userId?)
          → prisma.idea.findUnique({
                where: { id },
                include: { user: { select: { username, profilePicture } } }
            })
          → IF authenticated → fetch user's vote on this idea
          → Response: { idea, userVote: 'upvote' | 'downvote' | null }
```

---

### 2.3 Edit Idea

**User Flow:** Idea detail → Edit button → `/idea/{id}/edit` → Form → Save

**Frontend Flow:**
```
/idea/[id]/edit/page.tsx
  → Fetch existing idea data
  → Pre-filled form (same as create)
  → Submit → ideasApi.updateIdea(id, data)    [PATCH /ideas/:id]
  → On success → redirect to idea detail
```

**Backend Flow:**
```
PATCH /api/v1/ideas/:id
  → protect middleware
  → validator: updateIdeaSchema (all fields optional)
  → ideaController.updateIdea()
      → ideaService.updateIdea(id, userId, data)
          → Verify idea exists (404)
          → Verify ownership (403)
          → prisma.idea.update(...)
      → Response: 200 { success, data: idea }
```

---

### 2.4 Delete Idea

**User Flow:** Idea detail → Delete button → Confirmation dialog → Confirm

**Frontend Flow:**
```
Idea detail page
  → AlertDialog confirmation
  → ideasApi.deleteIdea(id)                    [DELETE /ideas/:id]
  → On success → redirect to /home
```

**Backend Flow:**
```
DELETE /api/v1/ideas/:id
  → protect middleware
  → ideaController.deleteIdea()
      → ideaService.deleteIdea(id, userId)
          → Verify idea exists (404)
          → Verify ownership (403)
          → Cascade delete: votes, comments, signals, waitlist, notifications
          → prisma.idea.delete(...)
      → Response: 200 { success, message: "Idea deleted" }
```

---

### 2.5 Timeline / Feed

**User Flow:** `/home` → Browse ideas → Tab: New / Trending / Top

**Frontend Flow:**
```
/home/page.tsx
  → Timeline.tsx
      → State: ideas[], page, hasMore, activeTimeline (new|trending|top)
      → TimelineToggle: tab switcher
      → Fetch: ideasApi.getIdeas(timeline, page, limit)  [GET /ideas]
      → Renders: IdeaCard.tsx list
      → Infinite scroll: IntersectionObserver → load next page
      → Deduplication: filters duplicate idea IDs
```

**Backend Flow:**
```
GET /api/v1/ideas?timeline=new&page=1&limit=20
  → optionalProtect middleware
  → generalLimiter (100 req/1min)
  → ideaController.getIdeas()
      → ideaService.getIdeas(timeline, page, limit, userId?)
          → Query based on timeline:
              'new'      → ORDER BY createdAt DESC
              'trending' → WHERE createdAt > 24h ago, ORDER BY upvotesCount DESC
              'top'      → ORDER BY upvotesCount DESC
          → Include user info
          → IF authenticated → batch fetch user's votes
          → Paginate: skip = (page-1)*limit, take = limit
      → Response: { data: ideas[], meta: { page, limit, total, total_pages } }
```

---

### 2.6 Pin/Unpin Idea

**User Flow:** Idea card/detail → Pin button → Toggles pin state

**Frontend Flow:**
```
PinButton.tsx
  → Click → ideasApi.pinIdea(id) OR ideasApi.unpinIdea(id)
  → POST /ideas/:id/pin  OR  DELETE /ideas/:id/pin
  → Optimistic UI update
```

**Backend Flow:**
```
POST /api/v1/ideas/:id/pin
  → protect middleware
  → userController.pinIdea()
      → userService.pinIdea(userId, ideaId)
          → Verify idea exists & belongs to user
          → Check pin count < 5 (max limit)
          → Check not already pinned
          → prisma.pinnedIdea.create({ userId, ideaId, pinOrder: count+1 })
      → Response: 200 { success }

DELETE /api/v1/ideas/:id/pin
  → protect middleware
  → userController.unpinIdea()
      → userService.unpinIdea(userId, ideaId)
          → prisma.pinnedIdea.delete({ userId_ideaId })
      → Response: 200 { success }
```

---

## 3. Voting System

### 3.1 Upvote / Downvote

**User Flow:** Idea card or detail → Click upvote/downvote arrow

**Frontend Flow:**
```
VoteButtons.tsx
  → Props: ideaId, initialUpvotes, initialDownvotes, initialUserVote
  → State: upvotes, downvotes, userVote, isAnimating
  → Click handler:
      → Optimistic update (immediate UI change with rolling number animation)
      → votesApi.voteOnIdea(ideaId, voteType)  [POST /ideas/:id/vote]
      → On error → revert state
  → Display: animated rolling number counters
```

**Backend Flow:**
```
POST /api/v1/ideas/:id/vote
  → protect middleware
  → voteLimiter (60 req/1hr per user)
  → validator: voteSchema { vote_type: 'upvote' | 'downvote' }
  → voteController.voteOnIdea()
      → voteService.voteOnIdea(userId, ideaId, voteType)
          → Verify idea exists (404)
          → Check existing vote:
              → No existing vote → CREATE vote + increment count
              → Same vote type → DELETE vote (toggle off) + decrement count
              → Different vote type → UPDATE vote + adjust both counts
          → All in prisma.$transaction for consistency
          → IF new upvote:
              → notificationTriggers.onIdeaUpvote(idea, voter)
                  → Check preferences (inAppUpVotes)
                  → Create in-app notification
                  → Check milestones (10, 25, 50, 100, 250, 500, 1000)
                      → IF milestone hit → notificationTriggers.onMilestoneReached()
      → Response: 200 { voteType, upvotesCount, downvotesCount }
```

**Milestone Thresholds:** 10, 25, 50, 100, 250, 500, 1000 upvotes

---

## 4. Validation Signals

### 4.1 Toggle Signal

**User Flow:** Idea detail → Click one of 4 signal buttons

**Signal Types:**
- PROBLEM_REAL — "The problem is real"
- WOULD_PAY — "I would pay for this"
- READY_TO_BUILD — "Ready to build"
- NEEDS_CLARITY — "Needs more clarity"

**Frontend Flow:**
```
ValidationSignals.tsx
  → Fetch: signalsApi.getIdeaSignals(ideaId)   [GET /ideas/:id/signals]
  → State: counts per type + user's active signals
  → Click signal button:
      → Optimistic toggle (immediate UI update)
      → signalsApi.toggleSignal(ideaId, signalType)  [POST /ideas/:id/signals]
      → On error → revert
  → Display: 4 toggle buttons with counts
```

**Backend Flow:**
```
POST /api/v1/ideas/:id/signals
  → protect middleware
  → commentLimiter (30 req/1hr — shared with comments)
  → validator: toggleSignalSchema { signalType }
  → signalController.toggleSignal()
      → signalService.toggleSignal(ideaId, userId, signalType)
          → Check existing: prisma.ideaSignal.findUnique({ userId_ideaId_signalType })
          → IF exists → DELETE (toggle off)
          → IF not exists → CREATE
              → notificationTriggers.onValidationSignal(idea, user, signalType)
                  → Check preferences (inAppUpSignals, emailSignals)
                  → Create in-app notification
                  → Check first feedback (commentsCount + signalsCount === 1)
                      → IF first → queue HIGH priority email
                  → Queue signal notification email
      → Response: 200 { signalType, action: 'added' | 'removed' }

GET /api/v1/ideas/:id/signals
  → optionalProtect middleware
  → signalController.getIdeaSignals()
      → signalService.getIdeaSignals(ideaId, userId?)
          → Count signals grouped by type
          → IF authenticated → fetch user's signals
      → Response: { counts: { PROBLEM_REAL, WOULD_PAY, READY_TO_BUILD, NEEDS_CLARITY }, userSignals: [], total }
```

---

### 4.2 Validation Summary (Profile)

**Frontend Flow:**
```
/[username]/page.tsx
  → userApi.getValidationSummary(username)     [GET /users/:username/validation-summary]
  → ValidationSummaryCard.tsx renders:
      → Signal counts per type
      → Signal strength indicators (STRONG/MIXED/WEAK/NONE/EARLY)
      → Next action recommendation
      → Ideas grouped by validation state
```

**Backend Flow:**
```
GET /api/v1/users/:username/validation-summary
  → userController.getValidationSummary()
      → userService.getValidationSummary(username)
          → Fetch all user's ideas
          → For each idea → count signals by type
          → Compute per-idea validation state:
              VALIDATED    → strong signals across multiple dimensions
              READY_TO_BUILD → strong READY_TO_BUILD + WOULD_PAY
              NEEDS_ACTION → low signals, needs more feedback
              NEUTRAL      → insufficient data
          → Compute signal strength per category:
              STRONG / MIXED / WEAK / NONE / EARLY
          → Compute next action recommendation:
              CLARIFY_PROBLEM  → many NEEDS_CLARITY signals
              TEST_PRICING     → few WOULD_PAY signals
              GATHER_FEEDBACK  → insufficient signals overall
              READY_TO_BUILD   → strong signals across board
              ADD_FIRST_IDEA   → no ideas yet
      → Response: { totalIdeas, signalCounts, strengths, nextAction, ideaStates }
```

---

## 5. Comments System

### 5.1 Create Comment

**User Flow:** Idea detail → Select category → Type comment → Submit

**Comment Categories:**
- PROBLEM_CLARITY
- TARGET_USERS
- WILLINGNESS_TO_PAY
- TECHNICAL_FEASIBILITY
- FEATURE_SUGGESTION
- GENERAL (default)

**Frontend Flow:**
```
CommentSection.tsx
  → Category selector dropdown
  → Textarea for content
  → Submit → commentsApi.createComment(ideaId, { content, category })
      → POST /api/v1/ideas/:id/comments
  → On success → prepend comment to list
```

**Backend Flow:**
```
POST /api/v1/ideas/:id/comments
  → protect middleware
  → commentLimiter (30 req/1hr per user)
  → validator: createCommentSchema { content, category?, parentCommentId? }
  → commentController.createComment()
      → commentService.createComment(userId, ideaId, data)
          → Verify idea exists (404)
          → IF parentCommentId → verify parent exists & belongs to same idea
          → prisma.comment.create(...)
          → Increment idea.commentsCount
          → notificationTriggers:
              IF reply → onReply(comment)
                  → Notify parent comment author
                  → Check preferences (inAppUpReplies, emailReplies)
                  → Queue email if enabled
              IF top-level → onComment(comment)
                  → Notify idea owner
                  → Check preferences (inAppUpComments, emailComments)
                  → Check first feedback
                  → Queue email if enabled
      → Response: 201 { success, data: comment }
```

---

### 5.2 View Comments (Threaded)

**Frontend Flow:**
```
CommentSection.tsx
  → Fetch: commentsApi.getIdeaComments(ideaId, page, limit)
      → GET /api/v1/ideas/:id/comments
  → Renders: CommentItem.tsx list (threaded/nested)
  → Infinite scroll for pagination
  → Each CommentItem.tsx:
      → Username, avatar, timestamp, category badge
      → Content text
      → Helpful button (toggle)
      → Reply button (opens nested form)
      → Edit/Delete (if owner) with AlertDialog confirmation
```

**Backend Flow:**
```
GET /api/v1/ideas/:id/comments?page=1&limit=50
  → optionalProtect middleware
  → commentController.getIdeaComments()
      → commentService.getIdeaComments(ideaId, page, limit, userId?)
          → Fetch flat array of comments with user info
          → Build nested tree: parentCommentId → replies[]
          → IF authenticated → mark isHelpful on each comment
      → Response: { data: commentTree[], meta: pagination }
```

---

### 5.3 Edit Comment

**Frontend Flow:**
```
CommentItem.tsx → Edit button → inline edit mode
  → commentsApi.updateComment(commentId, { content })
      → PATCH /api/v1/comments/:id
  → On success → update in place
```

**Backend Flow:**
```
PATCH /api/v1/comments/:id
  → protect middleware
  → validator: updateCommentSchema { content }
  → commentController.updateComment()
      → commentService.updateComment(commentId, userId, content)
          → Verify comment exists (404)
          → Verify ownership (403)
          → prisma.comment.update(...)
      → Response: 200 { success, data: comment }
```

---

### 5.4 Delete Comment

**Frontend Flow:**
```
CommentItem.tsx → Delete button → AlertDialog confirmation
  → commentsApi.deleteComment(commentId)
      → DELETE /api/v1/comments/:id
  → On success → remove from list
```

**Backend Flow:**
```
DELETE /api/v1/comments/:id
  → protect middleware
  → commentController.deleteComment()
      → commentService.deleteComment(commentId, userId)
          → Verify comment exists (404)
          → Verify ownership (403)
          → Cascade delete all replies
          → Decrement idea.commentsCount (by 1 + reply count)
          → prisma.comment.delete(...)
      → Response: 200 { success }
```

---

### 5.5 Toggle Helpful

**User Flow:** Comment → Click "Helpful" button

**Frontend Flow:**
```
CommentItem.tsx → Helpful button
  → Optimistic toggle
  → commentsApi.toggleHelpful(commentId)
      → POST /api/v1/comments/:id/helpful
  → Updates helpfulCount + isHelpful state
```

**Backend Flow:**
```
POST /api/v1/comments/:id/helpful
  → protect middleware
  → commentController.toggleHelpful()
      → commentService.toggleHelpful(commentId, userId)
          → Check existing: prisma.commentHelpful.findUnique({ userId_commentId })
          → IF exists → DELETE + decrement helpfulCount
          → IF not exists → CREATE + increment helpfulCount
      → Response: 200 { isHelpful, helpfulCount }
```

---

## 6. Notification System

### 6.1 Notification Bell & Polling

**Frontend Flow:**
```
NotificationBell.tsx (in Navbar)
  → State: unreadCount
  → useEffect: poll every 30 seconds
      → notificationsApi.getUnreadCount()     [GET /notifications/unread-count]
  → Display: bell icon + badge with count
  → Click → NotificationDropdown.tsx
      → Shows 10 latest notifications
      → "View all" → /notifications
```

---

### 6.2 Notifications Page

**Frontend Flow:**
```
/notifications/page.tsx
  → NotificationsList.tsx
      → Fetch: notificationsApi.getNotifications(page, limit)
          → GET /api/v1/notifications
      → Infinite scroll pagination
      → Each notification:
          → Icon based on type (UPVOTE/SIGNAL/COMMENT/REPLY/MILESTONE)
          → Title, message, timestamp
          → Read/unread styling
          → Click → mark as read + navigate to actionUrl
      → "Mark all as read" button
          → notificationsApi.markAllAsRead()   [POST /notifications/mark-all-read]
```

**Backend Flow:**
```
GET /api/v1/notifications?page=1&limit=20
  → protect middleware
  → notificationController.getNotifications()
      → notificationService.getNotifications(userId, page, limit)
          → prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { triggeredBy: { select: username, profilePicture } }
            })
      → Response: { data: notifications[], meta: pagination }
```

---

### 6.3 Notification Creation Triggers

**Trigger Map:**
```
User upvotes idea
  → notificationTriggers.onIdeaUpvote()
      → IF preference inAppUpVotes → create notification (type: UPVOTE, priority: LOW)
      → Check milestone thresholds (10, 25, 50, 100, 250, 500, 1000)
          → IF hit → create milestone notification (type: MILESTONE, priority: HIGH)
                    → Queue milestone email

User adds signal
  → notificationTriggers.onValidationSignal()
      → IF preference inAppUpSignals → create notification (type: SIGNAL, priority: MEDIUM)
      → IF preference emailSignals → queue email
      → Check first feedback → IF first → queue HIGH priority email

User posts comment
  → notificationTriggers.onComment()
      → IF preference inAppUpComments → create notification (type: COMMENT, priority: MEDIUM)
      → IF preference emailComments → queue email
      → Check first feedback → IF first → queue HIGH priority email

User replies to comment
  → notificationTriggers.onReply()
      → IF preference inAppUpReplies → create notification (type: REPLY, priority: MEDIUM)
      → IF preference emailReplies → queue email
```

---

### 6.4 Mark As Read

**Frontend Flow:**
```
Click notification → notificationsApi.markAsRead(id)
  → PATCH /api/v1/notifications/:id/read

"Mark all" button → notificationsApi.markAllAsRead()
  → POST /api/v1/notifications/mark-all-read
```

**Backend Flow:**
```
PATCH /api/v1/notifications/:id/read
  → protect middleware
  → notificationController.markAsRead()
      → prisma.notification.update({ where: { id, userId }, data: { read: true, readAt: now } })

POST /api/v1/notifications/mark-all-read
  → protect middleware
  → notificationController.markAllAsRead()
      → prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: now } })
```

---

### 6.5 Delete Notification

```
DELETE /api/v1/notifications/:id
  → protect middleware
  → notificationController.deleteNotification()
      → Verify ownership
      → prisma.notification.delete(...)
```

---

### 6.6 Notification Preferences

**User Flow:** Settings → Notification preferences → Toggle checkboxes

**Frontend Flow:**
```
/settings/notifications/page.tsx
  → NotificationSettingsPage.tsx
      → Fetch: notificationsApi.getPreferences()   [GET /notifications/preferences]
      → Renders toggle switches for each preference
      → On change → notificationsApi.updatePreferences(data)
          → PATCH /api/v1/notifications/preferences
```

**Backend Flow:**
```
GET /api/v1/notifications/preferences
  → protect middleware
  → notificationController.getPreferences()
      → Find or create default preferences for user
      → Response: { preferences }

PATCH /api/v1/notifications/preferences
  → protect middleware
  → validator: updatePreferencesSchema (all booleans optional)
  → notificationController.updatePreferences()
      → prisma.notificationPreferences.upsert(...)
      → Response: 200 { success, data: preferences }
```

**Preference Fields:**
| Field | Type | Default | Controls |
|-------|------|---------|----------|
| emailFirstFeedback | bool | true | First comment/signal email |
| emailDailySummary | bool | true | Daily activity digest |
| emailSignals | bool | true | Signal notification emails |
| emailComments | bool | true | Comment notification emails |
| emailReplies | bool | true | Reply notification emails |
| emailMilestones | bool | true | Milestone celebration emails |
| inAppUpVotes | bool | true | In-app upvote notifications |
| inAppUpSignals | bool | true | In-app signal notifications |
| inAppUpComments | bool | true | In-app comment notifications |
| inAppUpReplies | bool | true | In-app reply notifications |

---

## 7. Email System (Background)

### 7.1 Email Queue & Worker

**Architecture:**
```
Notification Triggers
  → notificationService.queueEmail(userId, type, priority, email, subject, html)
      → prisma.emailQueue.create({ status: PENDING, ... })

EmailWorkerService (runs every 30 seconds):
  → Find PENDING emails where nextRetryAt <= now
  → Sort by: priority DESC (HIGH first), createdAt ASC
  → Batch: 10 emails per run
  → For each email:
      → resend.emails.send({ from, to, subject, html })
      → On success → status = SENT, sentAt = now
      → On failure:
          → IF retryCount < maxRetries (3)
              → retryCount++
              → nextRetryAt = now + exponential delay (5min, 15min, 45min)
          → ELSE → status = FAILED, failedAt = now
```

**Email States:** `PENDING → SENT | FAILED`

---

### 7.2 Daily Summary Email

**Flow:**
```
SchedulerService (checks every 1 minute):
  → IF 9:00 UTC && not already run today:
      → dailySummaryService.sendDailySummaries()
          → Find users with emailDailySummary = true
          → For each user:
              → Get all their ideas
              → Count yesterday's activity:
                  → upvotes, comments, waitlist signups
              → IF activity > 0:
                  → Generate HTML from notificationEmailTemplate (daily_summary)
                  → notificationService.queueEmail(...)
                  → → Processed by EmailWorkerService later
```

---

### 7.3 Email Templates

**Template Types:**
```
backend/src/templates/
  ├── notificationEmailTemplate.ts
  │     → first_feedback: "Your idea just got its first feedback!"
  │     → signal_notification: "{user} thinks {signalType} about your idea"
  │     → comment_notification: "{user} commented on your idea"
  │     → reply_notification: "{user} replied to your comment"
  │     → milestone_notification: "Your idea reached {count} upvotes!"
  │     → daily_summary: "Here's your daily activity summary"
  │
  └── waitlistEmailTemplate.ts
        → "Welcome to the Validuct waitlist!"
```

**Email Provider:** Resend
- From: `Validuct <notifications@validuct.com>`
- Direct send for waitlist confirmation (not queued)
- Queued send for all notification emails

---

## 8. Idea Waitlist

### 8.1 Join Idea Waitlist

**User Flow:** Idea detail → Waitlist section → Enter email → Join

**Frontend Flow:**
```
IdeaWaitlist.tsx
  → Email input + Join button
  → Submit → ideaWaitlistApi.joinWaitlist(ideaId, email)
      → POST /api/v1/ideas/:ideaId/waitlist
  → Shows: current waitlist count
  → On success → confirmation message
```

**Backend Flow:**
```
POST /api/v1/ideas/:ideaId/waitlist
  → ideaWaitlistLimiter (10 req/1hr per IP)
  → validator: ideaWaitlistSchema { email }
  → ideaWaitlistController.joinWaitlist()
      → ideaWaitlistService.joinWaitlist(ideaId, email)
          → Verify idea exists (404)
          → Check duplicate (ideaId + email unique constraint)
          → IF no waitlistAccessToken on idea → generate UUID token
          → prisma.ideaWaitlist.create(...)
      → Response: 201 { success, data: { id } }
```

---

### 8.2 View Waitlist (Owner Only)

**User Flow:** `/idea/{id}/waitlist/{token}` → Paginated email list

**Frontend Flow:**
```
/idea/[id]/waitlist/[token]/page.tsx
  → ideaWaitlistApi.getWaitlistByToken(ideaId, token, page, limit)
      → GET /api/v1/ideas/:ideaId/waitlist/:token
  → Renders: paginated list of emails with timestamps
  → Export button → ideaWaitlistApi.exportEmails(ideaId, token)
      → GET /api/v1/ideas/:ideaId/waitlist/:token/export
      → Returns all emails for copy/download
```

**Backend Flow:**
```
GET /api/v1/ideas/:ideaId/waitlist/:accessToken
  → protect middleware
  → ideaWaitlistController.getWaitlistByToken()
      → Verify idea exists, token matches, user is owner
      → Paginated query (max limit: 50)
      → Response: { data: entries[], meta: pagination }

GET /api/v1/ideas/:ideaId/waitlist/:accessToken/export
  → protect middleware
  → ideaWaitlistController.getAllWaitlistEmails()
      → Verify ownership + token
      → Return all emails (no pagination)
      → Response: { data: emails[] }
```

---

### 8.3 Waitlist Stats

**Frontend Flow:**
```
IdeaWaitlist.tsx
  → ideaWaitlistApi.getWaitlistStats(ideaId)
      → GET /api/v1/ideas/:ideaId/waitlist
  → Shows: total count + access token (if owner)
```

**Backend Flow:**
```
GET /api/v1/ideas/:ideaId/waitlist
  → optionalProtect middleware
  → ideaWaitlistController.getWaitlistStats()
      → Count waitlist entries for idea
      → IF authenticated && owner → include accessToken
      → Response: { count, accessToken? }
```

---

## 9. Analytics Dashboard

### 9.1 Validation Analytics

**User Flow:** Own profile → Analytics button → `/{username}/analytics`

**Frontend Flow:**
```
/[username]/analytics/page.tsx
  → ValidationAnalyticsDashboard.tsx
      → Fetch: userApi.getValidationAnalytics(username)
          → GET /api/v1/users/:username/validation-analytics
      → IdeaFilterSelect.tsx (dropdown to filter by specific idea)
      → Renders:
          → AnalyticsSummaryCards.tsx
              → KPI cards: total ideas, total signals, avg signals/idea
          → SignalDistributionChart.tsx
              → Pie/donut chart: signal type distribution
          → ValidationStateChart.tsx
              → Bar chart: ideas by validation state
          → SignalTrendChart.tsx
              → Line chart: signals over time (30 days)
          → TopIdeasTable.tsx
              → Table: top 5 ideas ranked by signal count
```

**Backend Flow:**
```
GET /api/v1/users/:username/validation-analytics
  → protect middleware (owner only)
  → userController.getValidationAnalytics()
      → userService.getValidationAnalytics(username)
          → Verify user exists
          → Verify requesting user is owner (403)
          → Fetch all user's ideas with signals
          → Compute:
              signalDistribution: [{ type, count, percentage }]
              validationStateBreakdown: { NEEDS_ACTION: n, READY_TO_BUILD: n, VALIDATED: n }
              dailyTrends: [{ date, PROBLEM_REAL, WOULD_PAY, READY_TO_BUILD, NEEDS_CLARITY }]
              topIdeas: [{ idea, signalCount }] (top 5)
              totals: { totalSignals, totalIdeas, avgSignalsPerIdea }
              perIdeaAnalytics: [{ idea, signalDistribution, dailyTrends, state }]
      → Response: { success, data: analytics }
```

**Charts Library:** Recharts (PieChart, BarChart, LineChart, ResponsiveContainer)

---

## 10. Social Sharing

### 10.1 Share Idea

**User Flow:** Idea detail → Share button → Choose platform

**Frontend Flow:**
```
ShareButton.tsx
  → Dropdown menu:
      → Twitter/X → getTwitterShareUrl(text, url)    [lib/share.ts]
          → Opens: https://twitter.com/intent/tweet?text=...&url=...
      → LinkedIn → getLinkedInShareUrl(url, title)
          → Opens: https://www.linkedin.com/sharing/share-offsite/?url=...
      → Reddit → getRedditShareUrl(url, title)
          → Opens: https://reddit.com/submit?url=...&title=...
      → Copy Link → copyToClipboard(url)             [lib/share.ts]
          → navigator.clipboard.writeText() with fallback
          → Toast: "Link copied!"

  → All external links open via openShareWindow(url)  [new tab]
  → formatShareContent(idea) prepares text for sharing
```

**No backend involvement** — purely client-side URL construction.

---

## 11. Platform Waitlist (Landing Page)

### 11.1 Join Platform Waitlist

**User Flow:** Landing page → Waitlist section → Enter email → Join

**Frontend Flow:**
```
landing/WaitlistSection.tsx OR Waitlist.tsx
  → Email input + submit
  → waitlistApi.joinWaitlist(email)            [lib/api/waitlist.ts]
      → POST /api/v1/waitlist/join
  → On success → confirmation message
```

**Backend Flow:**
```
POST /api/v1/waitlist/join
  → waitlistLimiter (5 req/1hr per IP)
  → validator: waitlistSchema { email }
  → waitlistController.joinWaitlist()
      → waitlistService.joinWaitlist(email)
          → Check duplicate (email unique constraint)
          → prisma.waitlist.create(...)
          → waitlistService.sendWaitlistEmail(email)
              → resend.emails.send() (direct, not queued)
              → Template: waitlistEmailTemplate
      → Response: 201 { success }
```

---

## 12. Landing Page

### 12.1 Landing Page Sections

**Route:** `/` (page.tsx)

**Section Components (in order):**
```
1. Navbar (fixed top)
   → Logo + "Start Validating" button
   → IF logged in → /home
   → IF not → /signin

2. HeroSection.tsx
   → Headline: "Opinions won't tell you if people will pay"
   → CTA: "Test Your Idea Free" + "See How It Works"
   → Interactive demo: clickable validation signals with live counts

3. StatsSection.tsx
   → Social proof metrics (users, ideas validated, etc.)

4. ProblemSection.tsx
   → Pain points in idea validation

5. SolutionSection.tsx
   → Feature highlights

6. HowItWorksSection.tsx
   → Step-by-step process (3-4 steps)

7. CTASection.tsx
   → Mid-page call-to-action

8. WaitlistSection.tsx
   → Email signup form → POST /api/v1/waitlist/join

9. RoadmapSection.tsx
   → Product roadmap / upcoming features

10. Footer.tsx
    → Links, copyright, social icons
```

---

## 13. Theme & UI

### 13.1 Dark/Light Mode

**Frontend Flow:**
```
ThemeProvider.tsx (wraps app)
  → next-themes library
  → System preference detection

ThemeToggle.tsx (in Navbar)
  → Click → toggles between light/dark
  → Persists in localStorage
```

---

### 13.2 Navbar

**Frontend Flow:**
```
Navbar.tsx (server + client components)
  → Logo (link to / or /home)
  → IF authenticated:
      → NotificationBell.tsx (with unread count polling)
      → User avatar dropdown:
          → Profile link (/{username})
          → Settings link (/settings)
          → Sign out
  → IF not authenticated:
      → Sign In button
  → ThemeToggle.tsx
```

---

## 14. Settings

### 14.1 Settings Page

**Route:** `/settings`

**Frontend Flow:**
```
/settings/page.tsx
  → SettingsSidebar.tsx (navigation)
      → Notification Settings → /settings/notifications
  → Main content area
```

---

## 15. Error Handling & Edge Cases

### 15.1 Frontend Error Handling

```
API Client (lib/api/client.ts):
  → 401 responses → auto redirect to /signin
  → 429 responses → toast "Too many requests"
  → Network errors → toast or alert

Forms:
  → Client-side validation (maxlength, required)
  → Server error display (alert or toast)

Optimistic Updates (VoteButtons, ValidationSignals, Helpful):
  → Immediate UI update
  → API call in background
  → On error → revert UI state
```

### 15.2 Backend Error Handling

```
errorHandler middleware:
  → AppError → { success: false, error: message } with statusCode
  → ZodError → { success: false, error: "Validation Error", details: [...] } with 400
  → PrismaClientKnownRequestError → { success: false, error: "Database Error" } with 400
  → Unknown → { success: false, error: "Internal Server Error" } with 500
  → Stack trace: included in development only
```

---

## 16. Rate Limiting Summary

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| POST /auth/oauth | 10 | 15 min | IP |
| POST /ideas | 20 | 1 hour | User/IP |
| POST /ideas/:id/vote | 60 | 1 hour | User/IP |
| POST /ideas/:id/comments | 30 | 1 hour | User/IP |
| POST /ideas/:id/signals | 30 | 1 hour | User/IP |
| POST /waitlist/join | 5 | 1 hour | IP |
| POST /ideas/:id/waitlist | 10 | 1 hour | IP |
| GET /* (general) | 100 | 1 min | IP |

---

## 17. Database Schema (Entity Relationships)

```
User (1) ──→ (N) Idea
User (1) ──→ (N) Vote
User (1) ──→ (N) Comment
User (1) ──→ (N) IdeaSignal
User (1) ──→ (N) PinnedIdea (max 5)
User (1) ──→ (N) Notification
User (1) ──→ (1) NotificationPreferences
User (1) ──→ (N) CommentHelpful
User (1) ──→ (N) EmailQueue

Idea (1) ──→ (N) Vote
Idea (1) ──→ (N) Comment
Idea (1) ──→ (N) IdeaSignal
Idea (1) ──→ (N) PinnedIdea
Idea (1) ──→ (N) IdeaWaitlist
Idea (1) ──→ (N) Notification

Comment (1) ──→ (N) Comment (self-referencing replies)
Comment (1) ──→ (N) CommentHelpful

Vote: unique(userId, ideaId)
IdeaSignal: unique(userId, ideaId, signalType)
CommentHelpful: unique(userId, commentId)
PinnedIdea: unique(userId, ideaId), unique(userId, pinOrder)
IdeaWaitlist: unique(ideaId, email)
Waitlist: unique(email)
```

---

## 18. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 16.1 (App Router) |
| Frontend Language | TypeScript |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Auth (Frontend) | NextAuth.js v5 |
| HTTP Client | Axios |
| Toasts | react-toastify |
| Icons | react-icons |
| Date Formatting | date-fns |
| Backend Framework | Express 5 |
| Backend Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7.2 |
| Cache/Rate Limit | Redis (ioredis) |
| Email | Resend |
| Auth (Backend) | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Validation | Zod |
| Fonts | DM Serif Display, Instrument Sans, JetBrains Mono |

---

## 19. Background Services Summary

| Service | Interval | Purpose |
|---------|----------|---------|
| EmailWorkerService | 30 seconds | Process email queue, send via Resend, retry on failure |
| SchedulerService | 1 minute check | Trigger daily summary at 9:00 UTC |
| DailySummaryService | Daily (9 UTC) | Generate & queue daily activity digest emails |
| NotificationBell polling | 30 seconds | Frontend polls unread notification count |

---

## 20. File Structure Reference

```
Validuct/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout + providers
│   │   ├── not-found.tsx                     # 404 page
│   │   ├── (auth)/signin/page.tsx            # Sign-in
│   │   ├── home/page.tsx                     # Timeline feed
│   │   ├── idea/
│   │   │   ├── new/page.tsx                  # Create idea
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  # Idea detail
│   │   │       ├── edit/page.tsx             # Edit idea
│   │   │       └── waitlist/[token]/page.tsx # Waitlist viewer
│   │   ├── [username]/
│   │   │   ├── page.tsx                      # User profile
│   │   │   ├── edit/page.tsx                 # Edit profile
│   │   │   └── analytics/page.tsx            # Analytics dashboard
│   │   ├── notifications/page.tsx            # Notifications
│   │   ├── settings/
│   │   │   ├── page.tsx                      # Settings main
│   │   │   └── notifications/page.tsx        # Notification prefs
│   │   └── api/auth/[...nextauth]/route.ts   # NextAuth handler
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Timeline.tsx
│   │   ├── IdeaCard.tsx
│   │   ├── ProfileIdeaCard.tsx
│   │   ├── IdeaShare.tsx
│   │   ├── IdeaWaitlist.tsx
│   │   ├── VoteButtons.tsx
│   │   ├── ValidationSignals.tsx
│   │   ├── ValidationSummaryCard.tsx
│   │   ├── CommentSection.tsx
│   │   ├── CommentItem.tsx
│   │   ├── PinButton.tsx
│   │   ├── ShareButton.tsx
│   │   ├── SignInForm.tsx
│   │   ├── RegistrationForm.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── NotificationsList.tsx
│   │   ├── NotificationSettingsPage.tsx
│   │   ├── NotificationSettingsDialog.tsx
│   │   ├── BuilderSnapshotHeader.tsx
│   │   ├── SettingsSidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AnimatedLogo.tsx
│   │   ├── Waitlist.tsx
│   │   ├── CTA.tsx
│   │   ├── analytics/
│   │   │   ├── ValidationAnalyticsDashboard.tsx
│   │   │   ├── AnalyticsSummaryCards.tsx
│   │   │   ├── SignalDistributionChart.tsx
│   │   │   ├── SignalTrendChart.tsx
│   │   │   ├── ValidationStateChart.tsx
│   │   │   ├── TopIdeasTable.tsx
│   │   │   └── IdeaFilterSelect.tsx
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   ├── ProblemSection.tsx
│   │   │   ├── SolutionSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── WaitlistSection.tsx
│   │   │   ├── RoadmapSection.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/  (shadcn components)
│   │   └── providers/
│   │       ├── SessionProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── ideas.ts
│   │   │   ├── votes.ts
│   │   │   ├── comments.ts
│   │   │   ├── signals.ts
│   │   │   ├── users.ts
│   │   │   ├── notifications.ts
│   │   │   ├── waitlist.ts
│   │   │   └── ideaWaitlist.ts
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── share.ts
│   ├── types/
│   │   └── index.ts
│   └── auth.ts
│
├── backend/
│   ├── src/
│   │   ├── index.ts                          # Entry point, startup
│   │   ├── config/
│   │   │   ├── env.ts                        # Environment config
│   │   │   ├── database.ts                   # Prisma client
│   │   │   └── redis.ts                      # Redis client
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── ideaRoutes.ts
│   │   │   ├── voteRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   ├── signalRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   ├── ideaWaitlistRoutes.ts
│   │   │   └── waitlistRoutes.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── ideaController.ts
│   │   │   ├── voteController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── signalController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── ideaWaitlistController.ts
│   │   │   └── waitlistController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── ideaService.ts
│   │   │   ├── voteService.ts
│   │   │   ├── commentService.ts
│   │   │   ├── signalService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── notificationTriggers.ts
│   │   │   ├── ideaWaitlistService.ts
│   │   │   ├── waitlistService.ts
│   │   │   ├── emailWorkerService.ts
│   │   │   ├── schedulerService.ts
│   │   │   └── dailySummaryService.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validator.ts
│   │   │   └── rateLimiter.ts
│   │   ├── templates/
│   │   │   ├── notificationEmailTemplate.ts
│   │   │   └── waitlistEmailTemplate.ts
│   │   └── utils/
│   │       └── password.ts
│   ├── prisma/
│   │   ├── schema.prisma                     # Database schema
│   │   ├── migrations/                       # DB migrations
│   │   ├── seed.ts                           # Seed data
│   │   └── verify-seed.ts                    # Seed verification
│   └── tests/
│       ├── jest.config.js
│       ├── setup.ts
│       ├── ideas.test.ts
│       └── testUtils.ts
│
└── docs/
    └── FEATURE_FLOW_MAP.md                   # This file
```
