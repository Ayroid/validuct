# Social Media Automation with n8n

Automated multi-platform posting: 2-3 posts per day across Twitter/X, LinkedIn, and more.

---

## Overview

**Flow:**
```
Google Sheets (Content Library) → n8n (Scheduler) → Multi-Platform Posting
                                      ↓
                              Twitter, LinkedIn, Threads, BlueSky
```

**Schedule:**
- 2-3 posts per day
- Spread across peak hours
- Different content for different platforms

---

## Part 1: Setup Google Sheets

### 1.1 Move Excel to Google Sheets

1. Open [Google Sheets](https://sheets.google.com)
2. File → Import → Upload `validuct_marketing_posts.xlsx`
3. Name it: "Validuct Content Library"

### 1.2 Sheet Structure

| Column | Description |
|--------|-------------|
| A: ID | Unique post ID |
| B: Category | Content category |
| C: POV | Product or Founder |
| D: Platforms | Target platforms (comma-separated) |
| E: Content | The actual post |
| F: Status | Pending / Scheduled / Posted |
| G: Posted Date | When it was posted |
| H: Engagement Notes | Performance tracking |

### 1.3 Add Helper Columns

Add these columns for automation:

| Column | Description |
|--------|-------------|
| I: Twitter Content | Platform-specific version |
| J: LinkedIn Content | Platform-specific version |
| K: Last Used | Timestamp of last use |
| L: Use Count | How many times posted |

---

## Part 2: n8n Workflow - Daily Content Scheduler

### 2.1 Workflow Overview

```
[Schedule Trigger] → [Google Sheets: Get Posts] → [Filter Available] → [Random Select] → [Post to Platforms] → [Update Sheet]
```

### 2.2 Node Configuration

#### Node 1: Schedule Trigger

Posts 3 times per day at peak hours:

```json
{
  "rule": {
    "interval": [
      { "hour": 9, "minute": 0 },
      { "hour": 13, "minute": 0 },
      { "hour": 18, "minute": 0 }
    ]
  }
}
```

**Alternative: Cron Expression**
```
0 9,13,18 * * 1-5
```
(9am, 1pm, 6pm on weekdays)

#### Node 2: Google Sheets - Get Available Posts

- **Operation**: Read rows
- **Document ID**: Your sheet ID
- **Sheet**: "All Posts"
- **Filters**: Status = "Pending"

#### Node 3: Code - Select Random Post

```javascript
// Get all available posts
const posts = $input.all();

if (posts.length === 0) {
  throw new Error('No pending posts available!');
}

// Determine current posting slot
const hour = new Date().getHours();
let postType;

if (hour < 11) {
  // Morning: Educational or Tips
  postType = ['Educational', 'Tips', 'Thought Leadership'];
} else if (hour < 15) {
  // Midday: Engagement or Relatable
  postType = ['Engagement', 'Relatable', 'Story'];
} else {
  // Evening: Founder Story or Build in Public
  postType = ['Founder Story', 'Build in Public', 'Motivation'];
}

// Filter by category preference (with fallback to any)
let filtered = posts.filter(p => postType.includes(p.json.Category));
if (filtered.length === 0) {
  filtered = posts;
}

// Random selection
const selected = filtered[Math.floor(Math.random() * filtered.length)];

// Determine which platforms to post to
const platforms = selected.json.Platforms.split(',').map(p => p.trim());

return [{
  json: {
    ...selected.json,
    platforms: platforms,
    postTime: new Date().toISOString()
  }
}];
```

#### Node 4: Switch - Route by Platform

Create branches for each platform:

- **Twitter**: If platforms contains "Twitter"
- **LinkedIn**: If platforms contains "LinkedIn"

#### Node 5a: Twitter - Post Tweet

```json
{
  "text": "={{ $json.Content }}",
  "additionalFields": {}
}
```

**Character limit handling:**
```javascript
// In a Code node before Twitter
let content = $json.Content;

// Twitter limit: 280 characters
if (content.length > 280) {
  // Truncate at last space before limit
  content = content.substring(0, 277);
  content = content.substring(0, content.lastIndexOf(' ')) + '...';
}

return [{ json: { ...$.json, twitterContent: content } }];
```

#### Node 5b: LinkedIn - Post Update

```json
{
  "text": "={{ $json.Content }}",
  "visibility": "PUBLIC"
}
```

#### Node 6: Google Sheets - Update Status

- **Operation**: Update row
- **Row Number**: `={{ $json.ID + 1 }}` (accounting for header)
- **Updates**:
  - Status: "Posted"
  - Posted Date: `={{ $now.toISOString() }}`

---

## Part 3: Platform-Specific Workflows

### 3.1 Twitter/X Workflow

```
[Schedule: 9am, 1pm, 6pm]
    → [Sheets: Get Twitter Posts]
    → [Code: Select & Format]
    → [Twitter: Post]
    → [Sheets: Update]
```

**Best practices:**
- Max 280 characters
- Use line breaks for readability
- Include link at end (not middle)
- Avoid too many hashtags (0-2 max)

### 3.2 LinkedIn Workflow

```
[Schedule: 10am, 2pm]
    → [Sheets: Get LinkedIn Posts]
    → [Code: Format for LinkedIn]
    → [LinkedIn: Post]
    → [Sheets: Update]
```

**Best practices:**
- Can be longer (up to 3000 chars)
- Use more professional tone
- Add relevant hashtags (3-5)
- Include call-to-action

### 3.3 Threads Workflow

```
[Schedule: 11am, 5pm]
    → [Sheets: Get Posts]
    → [Code: Format for Threads]
    → [HTTP Request: Threads API]
    → [Sheets: Update]
```

**Note:** Threads uses Meta's API. You'll need:
- Meta Developer Account
- Access token
- App review for posting permissions

### 3.4 BlueSky Workflow

```
[Schedule: 10am, 4pm]
    → [Sheets: Get Posts]
    → [Code: Format]
    → [HTTP Request: BlueSky API]
    → [Sheets: Update]
```

**BlueSky API Example:**
```javascript
// HTTP Request node configuration
const post = {
  "repo": "your-handle.bsky.social",
  "collection": "app.bsky.feed.post",
  "record": {
    "text": $json.Content,
    "createdAt": new Date().toISOString()
  }
};
```

---

## Part 4: Complete Workflow JSON

Import this into n8n:

```json
{
  "name": "Validuct Social Media Scheduler",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            { "field": "cronExpression", "expression": "0 9 * * 1-5" }
          ]
        }
      },
      "name": "Morning Post",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 200]
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            { "field": "cronExpression", "expression": "0 13 * * 1-5" }
          ]
        }
      },
      "name": "Midday Post",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 350]
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            { "field": "cronExpression", "expression": "0 18 * * 1-5" }
          ]
        }
      },
      "name": "Evening Post",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 500]
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": { "value": "YOUR_SHEET_ID" },
        "sheetName": "All Posts"
      },
      "name": "Get Posts",
      "type": "n8n-nodes-base.googleSheets",
      "position": [450, 350],
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "Google Sheets"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const posts = $input.all().filter(p => p.json.Status === 'Pending');\n\nif (posts.length === 0) {\n  throw new Error('No pending posts!');\n}\n\nconst hour = new Date().getHours();\nlet preferredCategories;\n\nif (hour < 11) {\n  preferredCategories = ['Educational', 'Tips', 'Thought Leadership'];\n} else if (hour < 15) {\n  preferredCategories = ['Engagement', 'Relatable', 'Story'];\n} else {\n  preferredCategories = ['Founder Story', 'Build in Public', 'Motivation'];\n}\n\nlet filtered = posts.filter(p => preferredCategories.includes(p.json.Category));\nif (filtered.length === 0) filtered = posts;\n\nconst selected = filtered[Math.floor(Math.random() * filtered.length)];\nconst platforms = selected.json.Platforms.split(',').map(p => p.trim());\n\nreturn [{\n  json: {\n    ...selected.json,\n    platforms,\n    postTime: new Date().toISOString()\n  }\n}];"
      },
      "name": "Select Post",
      "type": "n8n-nodes-base.code",
      "position": [650, 350]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.Platforms }}",
              "operation": "contains",
              "value2": "Twitter"
            }
          ]
        }
      },
      "name": "Is Twitter?",
      "type": "n8n-nodes-base.if",
      "position": [850, 250]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.Platforms }}",
              "operation": "contains",
              "value2": "LinkedIn"
            }
          ]
        }
      },
      "name": "Is LinkedIn?",
      "type": "n8n-nodes-base.if",
      "position": [850, 450]
    },
    {
      "parameters": {
        "text": "={{ $json.Content.length > 280 ? $json.Content.substring(0, 277).substring(0, $json.Content.substring(0, 277).lastIndexOf(' ')) + '...' : $json.Content }}"
      },
      "name": "Post to Twitter",
      "type": "n8n-nodes-base.twitter",
      "position": [1050, 250],
      "credentials": {
        "twitterOAuth2Api": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "Twitter"
        }
      }
    },
    {
      "parameters": {
        "text": "={{ $json.Content }}",
        "visibility": "PUBLIC"
      },
      "name": "Post to LinkedIn",
      "type": "n8n-nodes-base.linkedIn",
      "position": [1050, 450],
      "credentials": {
        "linkedInOAuth2Api": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "LinkedIn"
        }
      }
    },
    {
      "parameters": {
        "operation": "update",
        "documentId": { "value": "YOUR_SHEET_ID" },
        "sheetName": "All Posts",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Status": "Posted",
            "Posted Date": "={{ $now.toISOString() }}"
          }
        }
      },
      "name": "Update Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "position": [1250, 350]
    }
  ],
  "connections": {
    "Morning Post": { "main": [[{ "node": "Get Posts", "type": "main", "index": 0 }]] },
    "Midday Post": { "main": [[{ "node": "Get Posts", "type": "main", "index": 0 }]] },
    "Evening Post": { "main": [[{ "node": "Get Posts", "type": "main", "index": 0 }]] },
    "Get Posts": { "main": [[{ "node": "Select Post", "type": "main", "index": 0 }]] },
    "Select Post": { "main": [[{ "node": "Is Twitter?", "type": "main", "index": 0 }, { "node": "Is LinkedIn?", "type": "main", "index": 0 }]] },
    "Is Twitter?": { "main": [[{ "node": "Post to Twitter", "type": "main", "index": 0 }], []] },
    "Is LinkedIn?": { "main": [[{ "node": "Post to LinkedIn", "type": "main", "index": 0 }], []] },
    "Post to Twitter": { "main": [[{ "node": "Update Sheet", "type": "main", "index": 0 }]] },
    "Post to LinkedIn": { "main": [[{ "node": "Update Sheet", "type": "main", "index": 0 }]] }
  }
}
```

---

## Part 5: Credentials Setup

### 5.1 Google Sheets

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. In n8n: Add Google Sheets credential with OAuth2

### 5.2 Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a project and app
3. Enable OAuth 2.0
4. Get: Client ID, Client Secret
5. Set callback URL: `http://localhost:5678/rest/oauth2-credential/callback`
6. In n8n: Add Twitter OAuth2 credential

### 5.3 LinkedIn

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Create an app
3. Request `w_member_social` permission
4. Get: Client ID, Client Secret
5. In n8n: Add LinkedIn OAuth2 credential

### 5.4 Threads (via Meta)

1. Go to [Meta Developer Portal](https://developers.facebook.com)
2. Create app → Add Threads API
3. Complete app review for `threads_content_publish`
4. Use HTTP Request node with Bearer token

### 5.5 BlueSky

1. Go to [BlueSky](https://bsky.app) → Settings → App Passwords
2. Create app password
3. Use HTTP Request node with authentication

---

## Part 6: Posting Schedule Strategy

### Recommended Schedule

| Time | Platform | Content Type |
|------|----------|--------------|
| 9:00 AM | Twitter | Educational / Tips |
| 10:00 AM | LinkedIn | Thought Leadership |
| 1:00 PM | Twitter | Engagement / Questions |
| 2:00 PM | LinkedIn | Founder Story |
| 6:00 PM | Twitter | Relatable / Build in Public |

### Platform-Specific Best Times

**Twitter/X:**
- Best: 9am, 12pm, 5-6pm (weekdays)
- Engagement peaks: Tuesday-Thursday

**LinkedIn:**
- Best: 7-8am, 10-11am, 5-6pm
- Engagement peaks: Tuesday-Wednesday

**Threads:**
- Best: 11am, 1pm, 7-9pm
- More casual, evening content works

---

## Part 7: Content Rotation Strategy

### Prevent Repetition

```javascript
// In the Select Post code node, add recency check
const posts = $input.all().filter(p => {
  // Only pending posts
  if (p.json.Status !== 'Pending') return false;

  // Skip if used in last 30 days
  if (p.json['Last Used']) {
    const lastUsed = new Date(p.json['Last Used']);
    const daysSince = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) return false;
  }

  return true;
});
```

### Category Balancing

```javascript
// Track category distribution
const categoryCounts = {};
const recentPosts = allPosts.filter(p => {
  if (!p.json['Posted Date']) return false;
  const posted = new Date(p.json['Posted Date']);
  const daysSince = (Date.now() - posted) / (1000 * 60 * 60 * 24);
  return daysSince < 7; // Last 7 days
});

recentPosts.forEach(p => {
  categoryCounts[p.json.Category] = (categoryCounts[p.json.Category] || 0) + 1;
});

// Prefer categories with fewer recent posts
const leastUsedCategories = Object.entries(categoryCounts)
  .sort((a, b) => a[1] - b[1])
  .slice(0, 3)
  .map(([cat]) => cat);
```

---

## Part 8: Error Handling

### Retry Logic

```javascript
// Wrap API calls in retry logic
async function postWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Error Notifications

Add a Slack/Discord node for failures:

```json
{
  "parameters": {
    "channel": "#social-media-alerts",
    "text": "Failed to post: {{ $json.Content.substring(0, 50) }}...\nError: {{ $json.error }}"
  },
  "name": "Alert on Failure",
  "type": "n8n-nodes-base.slack"
}
```

---

## Part 9: Analytics Tracking

### Track Engagement

Create a separate workflow that runs daily:

```
[Schedule: Daily 10pm]
    → [Twitter: Get Tweet Metrics]
    → [LinkedIn: Get Post Metrics]
    → [Sheets: Update Engagement]
```

### Metrics to Track

| Metric | Twitter | LinkedIn |
|--------|---------|----------|
| Views | Impressions | Views |
| Engagement | Likes + RTs + Replies | Reactions + Comments |
| Clicks | Link clicks | Click-through rate |

---

## Checklist

- [ ] Upload Excel to Google Sheets
- [ ] Set up Google Sheets API credentials
- [ ] Set up Twitter API credentials
- [ ] Set up LinkedIn API credentials
- [ ] Import workflow JSON into n8n
- [ ] Update sheet ID in workflow
- [ ] Test each platform connection
- [ ] Run test post manually
- [ ] Activate scheduled triggers
- [ ] Set up error notifications

---

## File Locations

| File | Path |
|------|------|
| Excel Generator | `marketing/generate-posts.js` |
| Excel Output | `marketing/validuct_marketing_posts.xlsx` |
| This Doc | `docs/strategies/SOCIAL_MEDIA_AUTOMATION.md` |

---

*Created: January 2026*
