const XLSX = require('xlsx');

// ============================================
// VALIDUCT MARKETING CONTENT LIBRARY
// 100+ Posts - Product & Founder POV
// ============================================

const posts = [
  // ==========================================
  // CATEGORY: FOUNDER STORY / BUILD IN PUBLIC
  // ==========================================

  // Founder POV - Origin Story
  { id: 1, category: 'Founder Story', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `I kept building things nobody wanted.

3 failed projects. Months of work. Zero users.

The problem wasn't my coding skills. It was validation.

So I built Validuct — because guessing what to build shouldn't be the default.` },

  { id: 2, category: 'Founder Story', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `The startup graveyard is full of "great ideas."

I've contributed to it. Multiple times.

That's why I built a place where ideas get validated before they become failed products.

validuct.com` },

  { id: 3, category: 'Founder Story', pov: 'Founder', platform: 'Twitter', content: `I used to ask friends "what do you think of this idea?"

They'd say "sounds cool!"

6 months later: 0 paying customers.

Built Validuct so builders get real signals, not polite lies.` },

  { id: 4, category: 'Founder Story', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `The honest truth about my startup journey:

- 2021: Built a productivity app. No one cared.
- 2022: Built a SaaS tool. 3 users (including my mom).
- 2023: Built a marketplace. Crickets.

2024: Finally asked "how do I know what's worth building?"

That question became Validuct.` },

  { id: 5, category: 'Founder Story', pov: 'Founder', platform: 'Twitter', content: `Every founder I know has a folder of abandoned projects.

Mine has 7.

Validuct exists because I got tired of adding to that folder.` },

  { id: 6, category: 'Build in Public', pov: 'Founder', platform: 'Twitter', content: `Building Validuct in public.

Today's update: Just shipped nested replies on comments.

Small feature. Big impact on discussions.

Builders can now have real back-and-forth about ideas.` },

  { id: 7, category: 'Build in Public', pov: 'Founder', platform: 'Twitter', content: `Week 12 of building Validuct:

- 47 ideas submitted
- 200+ validation signals given
- 0 marketing spend

Organic growth is slow but real.

The best marketing is a product people actually want to use.` },

  { id: 8, category: 'Build in Public', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `Lessons from building Validuct:

1. Ship fast, iterate faster
2. Talk to users daily
3. Your first version will embarrass you (ship anyway)
4. Features users ask for ≠ features users need

Building in public keeps me accountable.` },

  { id: 9, category: 'Build in Public', pov: 'Founder', platform: 'Twitter', content: `Just pushed a new feature at 2am because a user DMed me about it.

Is this healthy? Probably not.
Does it feel right? Absolutely.

Early stage is all about speed and listening.` },

  { id: 10, category: 'Build in Public', pov: 'Founder', platform: 'Twitter', content: `Transparent update on Validuct:

What's working:
- Organic Twitter growth
- Word of mouth from early users

What's not:
- Reddit (got flagged as spam)
- Cold outreach (0% response rate)

Doubling down on what works.` },

  // ==========================================
  // CATEGORY: EDUCATIONAL / VALUE-FIRST
  // ==========================================

  { id: 11, category: 'Educational', pov: 'Product', platform: 'Twitter,LinkedIn', content: `How to validate a startup idea (without building anything):

1. Write a one-sentence pitch
2. Share it with your target users
3. Ask: "Would you pay for this?"
4. If <50% say yes → pivot

Most founders skip step 3. Don't be most founders.` },

  { id: 12, category: 'Educational', pov: 'Product', platform: 'Twitter', content: `The difference between validation and opinions:

Opinion: "Cool idea!"
Validation: "I'd pay $20/month for this."

One feeds your ego. The other feeds your startup.` },

  { id: 13, category: 'Educational', pov: 'Product', platform: 'Twitter,LinkedIn', content: `5 signs your startup idea needs more validation:

1. Only your friends think it's good
2. You can't explain it in one sentence
3. You don't know who'd pay for it
4. The "problem" is based on your assumption
5. You've never talked to potential users

Fix these before you code.` },

  { id: 14, category: 'Educational', pov: 'Founder', platform: 'Twitter', content: `Unpopular opinion: Most MVPs are still too big.

Before building an MVP, validate:
- Is the problem real?
- Would people pay?
- Is now the right time?

An idea that fails these tests doesn't deserve an MVP.` },

  { id: 15, category: 'Educational', pov: 'Product', platform: 'Twitter,LinkedIn', content: `The validation framework I wish I had earlier:

1. Problem validation → Is this pain real?
2. Solution validation → Does my solution fix it?
3. Willingness to pay → Will people pay money?
4. Market timing → Is now the right time?

Nail all 4 before building.` },

  { id: 16, category: 'Educational', pov: 'Product', platform: 'Twitter', content: `"Build it and they will come" is a lie.

The cemetery of startups is filled with great products no one asked for.

Validate first. Build second.` },

  { id: 17, category: 'Educational', pov: 'Product', platform: 'LinkedIn', content: `I analyzed 50 failed startups. Here's what they had in common:

- 72% never talked to users before building
- 64% couldn't articulate who their customer was
- 58% built features no one requested

The pattern is clear: they built before validating.

Don't make the same mistake.` },

  { id: 18, category: 'Educational', pov: 'Product', platform: 'Twitter', content: `Quick validation checklist:

□ Can you explain the problem in 1 sentence?
□ Have you talked to 10+ potential users?
□ Would 5+ of them pay for a solution?
□ Does a solution exist? Why is yours better?

All checked? Now you can build.` },

  { id: 19, category: 'Educational', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `The best founders I know do this differently:

They don't fall in love with their solution.
They fall in love with the problem.

Solutions change. Problems don't.

Validate the problem first.` },

  { id: 20, category: 'Educational', pov: 'Product', platform: 'Twitter', content: `Startup math:

Idea + No Validation = Expensive Experiment
Idea + Validation = Informed Bet

The difference? Talking to users before writing code.` },

  // ==========================================
  // CATEGORY: PRODUCT FEATURES
  // ==========================================

  { id: 21, category: 'Product Feature', pov: 'Product', platform: 'Twitter,LinkedIn', content: `Introducing Validation Signals on Validuct:

🎯 Would Pay — Real demand indicator
✅ Problem Real — The pain point exists
🚀 Ready to Build — Clear enough to execute
❓ Needs Clarity — More detail needed

Not opinions. Signals.

validuct.com` },

  { id: 22, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `Why Validuct uses structured feedback categories:

- Problem Clarity
- Target Users
- Willingness to Pay
- Technical Feasibility
- Feature Suggestions

Random comments don't help. Organized feedback does.` },

  { id: 23, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `Track your idea from concept to launch:

Draft → Validated → WIP → Launched

Validuct isn't just for validation. It's for the entire journey.` },

  { id: 24, category: 'Product Feature', pov: 'Product', platform: 'Twitter,LinkedIn', content: `The difference between Validuct and other platforms:

Product Hunt: "Here's my thing" → applause or silence
Reddit: "What do you think?" → random opinions
Validuct: "Is this worth building?" → Would Pay: 47, Problem Real: 82

Data, not opinions.` },

  { id: 25, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `New on Validuct: Pin your favorite ideas.

Save up to 5 ideas you want to track.

Because sometimes you see an idea and think "I want to watch this one."` },

  { id: 26, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `Validuct timelines:

📰 NEW — Latest ideas submitted
🔥 TRENDING — Most upvoted (last 24h)
⭐ TOP — All-time best

Find ideas worth validating. Or submit your own.` },

  { id: 27, category: 'Product Feature', pov: 'Product', platform: 'LinkedIn', content: `Why we built category-based comments on Validuct:

Generic feedback like "nice idea" doesn't help anyone.

So we categorize every comment:
- Problem Clarity
- Target Users
- Willingness to Pay
- Technical Feasibility
- Feature Suggestions
- General

Structured feedback = actionable insights.` },

  { id: 28, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `Your Validuct profile shows:

- All your ideas in one place
- Validation summary across all ideas
- Journey from Draft to Launched

It's your builder portfolio.` },

  { id: 29, category: 'Product Feature', pov: 'Founder', platform: 'Twitter', content: `Shipping soon on Validuct:

- AI-powered competitor analysis
- Waitlist collection for your ideas
- Validation analytics dashboard

What would you want to see?` },

  { id: 30, category: 'Product Feature', pov: 'Product', platform: 'Twitter', content: `The "Helpful" vote on comments.

Not all feedback is equal.

Upvote the comments that actually help. Surface the best insights.` },

  // ==========================================
  // CATEGORY: THOUGHT LEADERSHIP / HOT TAKES
  // ==========================================

  { id: 31, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `Hot take: Most startup advice is survivorship bias.

The founders who "didn't validate and succeeded" got lucky.

For every 1 that succeeded, 1000 failed the same way.

Validation isn't optional. Luck is.` },

  { id: 32, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `The biggest lie in tech:

"If you build a great product, people will find it."

No. They won't.

Great products fail every day because:
1. Wrong problem
2. Wrong audience
3. Wrong timing

Validate before you build.` },

  { id: 33, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `Controversial opinion:

The "fail fast" mentality is broken.

Why fail at all if you can validate first?

Failing fast still costs time, money, and morale.

Validate fast > Fail fast.` },

  { id: 34, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `Your friends are the worst validators.

They'll say "great idea!" because they like you.

Strangers who'd actually pay? They'll tell you the truth.` },

  { id: 35, category: 'Thought Leadership', pov: 'Founder', platform: 'LinkedIn', content: `After talking to 100+ founders, I've noticed a pattern:

The ones who succeed treat validation as a continuous process, not a one-time checkbox.

They validate:
- Before building
- While building
- After launching

Validation never stops.` },

  { id: 36, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `The best startup idea isn't the most innovative one.

It's the one where:
- The problem is painful
- People will pay to solve it
- You can actually build it

Innovation without validation = expensive hobby.` },

  { id: 37, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `Unpopular opinion:

You don't need a unique idea.

You need a validated problem + better execution.

The idea itself is worth almost nothing.` },

  { id: 38, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `Why most side projects die:

1. Built for yourself, not a market
2. No validation, just vibes
3. Features over problem-solving
4. Gave up after 2 weeks

The fix? Validate before you build. Then commit.` },

  { id: 39, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `The 4-hour validation test:

1. Write your idea in one sentence (30 min)
2. Find 10 people who have the problem (1 hour)
3. Ask if they'd pay for a solution (2 hours)
4. Analyze responses (30 min)

If you can't do this, don't build.` },

  { id: 40, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `Building a startup is hard.

Building the wrong startup is tragic.

Validate first.` },

  // ==========================================
  // CATEGORY: ENGAGEMENT / QUESTIONS
  // ==========================================

  { id: 41, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `What's your current side project?

Drop it below and I'll give you honest feedback.

No "great idea!" fluff. Real validation.` },

  { id: 42, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `How do you currently validate your startup ideas?

A) Ask friends/family
B) Post on Reddit
C) Build and see what happens
D) Other (comment below)

Curious what works for you.` },

  { id: 43, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `Be honest:

How many projects have you abandoned because no one used them?

I'll start: 7.` },

  { id: 44, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `What's stopping you from building your idea right now?

- Not sure if it's good enough?
- Don't know if people would pay?
- Stuck on technical decisions?

Let's discuss.` },

  { id: 45, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `Quick poll:

What's more important when validating an idea?

🔁 RT = "Would people pay?"
❤️ Like = "Is the problem real?"` },

  { id: 46, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `Founders: What's your biggest validation mistake?

I'll start: I once spent 4 months building a tool my "target users" said they wanted.

0 signups on launch day.

Turns out they wanted it for free. Big difference.` },

  { id: 47, category: 'Engagement', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `If you could only ask ONE question to validate a startup idea, what would it be?

Mine: "Would you pay $X for this today?"

Not "would you use it." Would you PAY.` },

  { id: 48, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `Hot take time:

What's one popular startup that you think didn't validate properly?

(I'll go first in the replies)` },

  { id: 49, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `I want to feature builders on Validuct.

If you're working on something interesting, reply with:

1. One-sentence pitch
2. Biggest validation challenge

Best ones get featured.` },

  { id: 50, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `What would make you actually use an idea validation platform?

Building Validuct and genuinely want to know.

No wrong answers.` },

  // ==========================================
  // CATEGORY: SOCIAL PROOF / TESTIMONIALS
  // ==========================================

  { id: 51, category: 'Social Proof', pov: 'Product', platform: 'Twitter,LinkedIn', content: `"I was about to spend 3 months building an app. Posted on Validuct first. Got 2 'Would Pay' signals out of 50.

Saved myself 3 months."

— Early Validuct user

This is why validation matters.` },

  { id: 52, category: 'Social Proof', pov: 'Product', platform: 'Twitter', content: `Interesting data from Validuct:

Ideas with "Problem Real" signals >20 are 3x more likely to get "Would Pay" signals.

Validate the problem first. Solution second.` },

  { id: 53, category: 'Social Proof', pov: 'Founder', platform: 'Twitter', content: `A builder just messaged me:

"Validuct feedback made me realize my target market was wrong. Pivoted the idea. Now getting real interest."

This is why I built this.` },

  { id: 54, category: 'Social Proof', pov: 'Product', platform: 'Twitter', content: `50 ideas validated on Validuct this week.

Some got strong signals. Some didn't.

The ones that didn't? Those builders saved months of building the wrong thing.

That's validation working.` },

  { id: 55, category: 'Social Proof', pov: 'Founder', platform: 'Twitter', content: `Best feedback I got today:

"Validuct gave me the confidence to actually start building."

Sometimes validation isn't about killing ideas. It's about confirming good ones.` },

  // ==========================================
  // CATEGORY: PAIN POINTS / PROBLEM AGITATION
  // ==========================================

  { id: 56, category: 'Pain Point', pov: 'Product', platform: 'Twitter', content: `The worst feeling as a builder:

Spending months on a project.
Launching to crickets.
Realizing no one wanted it.

Don't let that be you.` },

  { id: 57, category: 'Pain Point', pov: 'Product', platform: 'Twitter,LinkedIn', content: `Every builder knows this pain:

"I built it. I launched it. Nobody came."

The problem wasn't the product.

It was building before validating.` },

  { id: 58, category: 'Pain Point', pov: 'Founder', platform: 'Twitter', content: `I've been there:

- 2am coding sessions
- "This will be huge"
- Launch day: 3 users
- All of them are friends

The fix? Validate the idea before the coding sessions start.` },

  { id: 59, category: 'Pain Point', pov: 'Product', platform: 'Twitter', content: `Reddit for validation:

✗ Gets flagged as self-promotion
✗ Random, unstructured feedback
✗ Comments disappear into the void
✗ No way to track signals

There has to be a better way.` },

  { id: 60, category: 'Pain Point', pov: 'Product', platform: 'Twitter', content: `Asking friends about your startup idea:

"That's such a cool idea!"
"You should definitely build it!"
"I'd use that for sure!"

Translation: They're being nice. Not honest.` },

  // ==========================================
  // CATEGORY: COMPARISONS
  // ==========================================

  { id: 61, category: 'Comparison', pov: 'Product', platform: 'Twitter,LinkedIn', content: `Where builders currently validate ideas:

Product Hunt → Post-launch, not pre-launch
Reddit → Hostile to self-promotion
Twitter → Shallow engagement, no structure
Indie Hackers → Stories, not validation

Validuct → Pre-launch validation with real signals` },

  { id: 62, category: 'Comparison', pov: 'Product', platform: 'Twitter', content: `Product Hunt: "Look what I built"
Validuct: "Should I build this?"

Different stage. Different purpose.

Use both. But in the right order.` },

  { id: 63, category: 'Comparison', pov: 'Product', platform: 'Twitter', content: `How validation platforms compare:

Asking friends: Biased
Reddit: Hostile
Twitter: Shallow
Product Hunt: Post-launch only

Validuct: Pre-launch, structured, honest

Know where to validate.` },

  // ==========================================
  // CATEGORY: TIPS / QUICK WINS
  // ==========================================

  { id: 64, category: 'Tips', pov: 'Product', platform: 'Twitter', content: `Quick tip: Before building, answer these 3 questions:

1. Who has this problem?
2. How painful is it (1-10)?
3. Would they pay $X to solve it?

Can't answer? Don't build yet.` },

  { id: 65, category: 'Tips', pov: 'Founder', platform: 'Twitter', content: `My validation process:

1. Write idea in one sentence
2. Post on Validuct
3. Wait for signals (not opinions)
4. If >30% "Would Pay" → Build
5. If <30% → Iterate or kill

Simple. Effective.` },

  { id: 66, category: 'Tips', pov: 'Product', platform: 'Twitter,LinkedIn', content: `The one-sentence test:

If you can't explain your idea in one sentence, you don't understand it well enough.

"[Product] helps [audience] [solve problem] by [how]."

Fill in the blanks before building.` },

  { id: 67, category: 'Tips', pov: 'Founder', platform: 'Twitter', content: `Validation hack:

Don't ask "Would you use this?"

Ask "Would you pay $X for this TODAY?"

The word "today" forces honesty.` },

  { id: 68, category: 'Tips', pov: 'Product', platform: 'Twitter', content: `3 questions that kill bad ideas fast:

1. "Who specifically has this problem?"
2. "How are they solving it now?"
3. "Why would they switch to you?"

Can't answer? The idea needs work.` },

  { id: 69, category: 'Tips', pov: 'Founder', platform: 'Twitter', content: `The "mom test" for validation:

Don't ask if your idea is good.
Ask about their problem.
Ask about their current solution.
Ask about their budget.

Let them sell you on why they need it.` },

  { id: 70, category: 'Tips', pov: 'Product', platform: 'Twitter,LinkedIn', content: `Validation red flags:

🚩 "Interesting idea" (polite rejection)
🚩 "I might use it" (they won't)
🚩 "Send me the link when it's ready" (they'll forget)

Green flags:

✅ "How much?" (they want it)
✅ "When can I use it?" (urgency)
✅ "Can I pay now?" (demand)` },

  // ==========================================
  // CATEGORY: MOTIVATION / INSPIRATION
  // ==========================================

  { id: 71, category: 'Motivation', pov: 'Founder', platform: 'Twitter', content: `Reminder:

Every successful product started as an unvalidated idea.

The difference? Those founders validated before betting everything on it.

Your idea deserves validation too.` },

  { id: 72, category: 'Motivation', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `It's not about having perfect ideas.

It's about knowing which imperfect ideas are worth pursuing.

Validate. Learn. Iterate. Ship.` },

  { id: 73, category: 'Motivation', pov: 'Founder', platform: 'Twitter', content: `You don't need:
- VC funding
- A technical cofounder
- The "perfect" idea

You need:
- A real problem
- People willing to pay
- The courage to start

Start with validation.` },

  { id: 74, category: 'Motivation', pov: 'Founder', platform: 'Twitter', content: `Kill your bad ideas fast so you can find your good ones faster.

Validation isn't about saying "no."

It's about finding the "hell yes."` },

  { id: 75, category: 'Motivation', pov: 'Founder', platform: 'Twitter', content: `The best founders I know aren't attached to their ideas.

They're attached to solving problems.

When validation says "wrong solution," they pivot.

When it says "wrong problem," they move on.

That's how you win.` },

  // ==========================================
  // CATEGORY: STORIES / CASE STUDIES
  // ==========================================

  { id: 76, category: 'Story', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `Story time:

A builder posted an idea on Validuct last week.

The idea: "AI tool for X"
The feedback: "Problem isn't clear"

Instead of defending, they listened. Rewrote the pitch.

Second post: 3x more "Would Pay" signals.

Validation works when you listen.` },

  { id: 77, category: 'Story', pov: 'Founder', platform: 'Twitter', content: `True story:

2022: Had an idea for a note-taking app.
Asked friends: "Great idea!"
Built it for 4 months.
Launched: 2 users.

2024: Had an idea for Validuct.
Validated first.
Built only after seeing demand.

The difference? I stopped trusting opinions.` },

  { id: 78, category: 'Story', pov: 'Founder', platform: 'Twitter', content: `My most expensive lesson:

I once spent $5,000 on a landing page, ads, and development for an idea I "knew" was good.

Total revenue: $0

The lesson: Confidence ≠ Validation

Now I validate first. Always.` },

  { id: 79, category: 'Story', pov: 'Founder', platform: 'LinkedIn', content: `The validation that changed my approach:

I posted an idea I loved on Validuct.

Results:
- "Would Pay": 3
- "Problem Real": 8
- "Needs Clarity": 22

The message was clear: great solution, wrong problem.

I pivoted. That pivot became my current project.

Sometimes validation saves you from yourself.` },

  { id: 80, category: 'Story', pov: 'Founder', platform: 'Twitter', content: `How Validuct started:

I was frustrated.
I had ideas.
No way to know which were good.

So I built the tool I wished existed.

Turns out others wanted it too.

Sometimes the best products come from your own pain.` },

  // ==========================================
  // CATEGORY: MEMES / RELATABLE
  // ==========================================

  { id: 81, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `Developer: "I'll just build a quick MVP"

*6 months later*

Developer: "Just a few more features and it'll be perfect"

*No users*

Developer: "Maybe I should have validated first"` },

  { id: 82, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `Stages of a side project:

1. "This idea is genius!"
2. "Let me build it real quick"
3. "Just one more feature"
4. "Why is no one using this?"
5. "Maybe the next idea..."

Add step 0: Validate.` },

  { id: 83, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `Me explaining my startup idea to friends: 🗣️💡

Friends: "Wow, that's amazing! You should build it!"

Me explaining my startup idea to strangers who'd actually pay: 🗣️💡

Strangers: "What problem does this solve?"

🥲` },

  { id: 84, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `Founder brain at 3am:

"What if I built an app that..."
"This could be huge"
"No one's doing this"
"I'll validate tomorrow"

*Tomorrow never comes*

Relate?` },

  { id: 85, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `The startup idea lifecycle:

Day 1: "This is revolutionary!"
Day 7: "Let me build an MVP"
Day 30: "Almost ready to launch"
Day 60: "Why isn't anyone signing up?"
Day 90: "New idea!"

Break the cycle. Validate first.` },

  // ==========================================
  // CATEGORY: LINKEDIN SPECIFIC
  // ==========================================

  { id: 86, category: 'LinkedIn', pov: 'Founder', platform: 'LinkedIn', content: `I spent 3 years building products nobody wanted.

Here's what I learned:

1. Your friends will lie to you (to be nice)
2. "Interesting idea" = polite rejection
3. The market doesn't care about your vision
4. Validation is a skill, not a checkbox
5. Data beats intuition

Now I validate before I build.

If you're building something, get real feedback first.

It'll save you months (maybe years) of wasted effort.` },

  { id: 87, category: 'LinkedIn', pov: 'Founder', platform: 'LinkedIn', content: `The #1 mistake I see founders make:

Building in isolation.

They code for months.
Perfect every pixel.
Craft every feature.

Then launch to... nothing.

The fix is simple but uncomfortable:

Share your idea before it's ready.
Get feedback before you're confident.
Validate before you invest.

The best founders I know treat validation as a daily habit, not a one-time event.

What's your validation process?` },

  { id: 88, category: 'LinkedIn', pov: 'Founder', platform: 'LinkedIn', content: `Why I built Validuct:

Every platform told founders to "just ship it."

Product Hunt: Ship and see
Twitter: Ship in public
Reddit: Ship and get roasted

But what about BEFORE you ship?

What about when you have an idea but don't know if it's worth building?

That's the gap I'm filling.

Validuct is for the stage before shipping — when you need validation, not applause.` },

  { id: 89, category: 'LinkedIn', pov: 'Product', platform: 'LinkedIn', content: `How to tell if your startup idea is worth pursuing:

✅ You can explain the problem in one sentence
✅ You've talked to 10+ people who have this problem
✅ At least 50% would pay for a solution
✅ You understand why existing solutions fail
✅ You have a unique insight or advantage

If you can't check all 5, you're not ready to build.

Validation isn't about killing dreams. It's about building on solid ground.` },

  { id: 90, category: 'LinkedIn', pov: 'Founder', platform: 'LinkedIn', content: `Fundraising advice from a bootstrapped founder:

Investors want to see traction.

But what if you don't have a product yet?

Show validation.

"50 potential customers said they'd pay" beats "I think this is a good idea" every time.

Validation isn't just for building. It's for convincing.` },

  // ==========================================
  // CATEGORY: CALL TO ACTION
  // ==========================================

  { id: 91, category: 'CTA', pov: 'Product', platform: 'Twitter', content: `Got an idea? Don't ask your friends.

Post it on Validuct.

Get real signals from builders who've been there.

validuct.com` },

  { id: 92, category: 'CTA', pov: 'Product', platform: 'Twitter', content: `Stop building in the dark.

→ Share your idea
→ Get structured feedback
→ See real demand signals

That's Validuct.

validuct.com` },

  { id: 93, category: 'CTA', pov: 'Product', platform: 'Twitter,LinkedIn', content: `Validuct is free.

Building the wrong thing for 6 months isn't.

Validate first → validuct.com` },

  { id: 94, category: 'CTA', pov: 'Founder', platform: 'Twitter', content: `I built Validuct because I needed it.

If you've ever built something nobody wanted, you need it too.

No more guessing → validuct.com` },

  { id: 95, category: 'CTA', pov: 'Product', platform: 'Twitter', content: `Your next startup idea:

Option A: Build for 6 months, hope for the best
Option B: Validate in 1 week, build with confidence

Choose B → validuct.com` },

  // ==========================================
  // CATEGORY: TRENDS / TIMELY
  // ==========================================

  { id: 96, category: 'Timely', pov: 'Founder', platform: 'Twitter', content: `AI makes it easier than ever to build.

That means more products.
More competition.
More noise.

The ones that win? The ones that validated first.

Building is cheap. Validation is what matters.` },

  { id: 97, category: 'Timely', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `In 2024, anyone can ship a product in a weekend.

The bottleneck isn't building anymore.

It's knowing what to build.

Validation is the new competitive advantage.` },

  { id: 98, category: 'Timely', pov: 'Founder', platform: 'Twitter', content: `With AI coding assistants, building is 10x faster.

But if you build the wrong thing 10x faster... you just fail faster.

The answer isn't more speed.

It's better validation.` },

  { id: 99, category: 'Timely', pov: 'Founder', platform: 'Twitter', content: `The vibe coding era:

Ship fast. Iterate. See what sticks.

The problem?

You can vibe code a product.
You can't vibe code product-market fit.

Validation still matters.` },

  { id: 100, category: 'Timely', pov: 'Founder', platform: 'Twitter', content: `Every week there's a new "I built X in 24 hours" post.

Impressive. But here's the thing:

Building fast ≠ Building right.

The best builders validate in 24 hours BEFORE building.` },

  // ==========================================
  // BONUS: ADDITIONAL POSTS (101-115)
  // ==========================================

  { id: 101, category: 'Founder Story', pov: 'Founder', platform: 'Twitter', content: `My calendar before Validuct:

- Build random idea
- Launch
- Wonder why no one cares
- Repeat

My calendar after:

- Validate idea
- Kill or proceed
- Build with confidence
- Ship to people who actually want it` },

  { id: 102, category: 'Educational', pov: 'Product', platform: 'Twitter', content: `The validation hierarchy:

1. "I have this problem" (you)
2. "Others have this problem" (interviews)
3. "Others would pay to solve it" (validation)
4. "Others ARE paying to solve it" (traction)

Most founders stop at level 1.` },

  { id: 103, category: 'Engagement', pov: 'Founder', platform: 'Twitter', content: `Drop your startup idea in one sentence.

I'll tell you the first thing I'd validate.

(Brutal honesty only)` },

  { id: 104, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `The most dangerous phrase in startups:

"I just know this will work."

No. You don't.

That's not confidence. That's ego.

Validate or don't. But don't pretend you know.` },

  { id: 105, category: 'Tips', pov: 'Product', platform: 'Twitter', content: `Before you build, ask:

"If this existed today, would I buy it?"

Be honest with yourself.

If you hesitate, so will your customers.` },

  { id: 106, category: 'Pain Point', pov: 'Product', platform: 'Twitter', content: `The loneliest moment in a founder's journey:

Launching to your Twitter followers.
Refreshing the signup page.
0... 0... still 0.

This doesn't have to be you.

Validate first.` },

  { id: 107, category: 'Motivation', pov: 'Founder', platform: 'Twitter', content: `Every "no" in validation is a gift.

It's the universe telling you "not this one" before you waste 6 months.

Embrace the no. Find the yes.` },

  { id: 108, category: 'Build in Public', pov: 'Founder', platform: 'Twitter', content: `Month 3 of Validuct:

What I expected: Viral growth
What happened: Slow, steady signups

What I'm learning: Real growth is boring.

No hockey sticks. Just consistency.` },

  { id: 109, category: 'Relatable', pov: 'Founder', platform: 'Twitter', content: `"I'll start marketing after I add this one feature."

*Adds feature*

"Okay, just one more feature."

*Never markets*

Sound familiar?

Ship what you have. Validate before you build more.` },

  { id: 110, category: 'CTA', pov: 'Product', platform: 'Twitter', content: `The best time to validate was before you started building.

The second best time is now.

validuct.com` },

  { id: 111, category: 'Comparison', pov: 'Product', platform: 'Twitter', content: `Validation in 2020: "Let me ask my network"

Validation in 2024: Get structured signals from a community of builders

The tools have evolved. Your process should too.` },

  { id: 112, category: 'Story', pov: 'Founder', platform: 'Twitter', content: `Last month, I almost built a feature nobody asked for.

Then I posted it on Validuct first.

8 "Needs Clarity" signals.
2 "Would Pay" signals.

Message received. Feature scrapped.

Even founders need validation.` },

  { id: 113, category: 'Educational', pov: 'Product', platform: 'LinkedIn', content: `The 3 types of feedback you'll get on startup ideas:

1. **Nice feedback**: "Cool idea!" (useless)
2. **Mean feedback**: "This will never work" (demoralizing)
3. **Useful feedback**: "I'd pay for this if it did X" (actionable)

Structure your validation to get type 3.` },

  { id: 114, category: 'Thought Leadership', pov: 'Founder', platform: 'Twitter', content: `The best founders I've met have one thing in common:

They're not attached to being right.

They're attached to finding out what's right.

Validation is just finding out faster.` },

  { id: 115, category: 'Founder Story', pov: 'Founder', platform: 'Twitter,LinkedIn', content: `I've shipped 12 products in my career.

3 succeeded. 9 failed.

The difference?

The 3 that succeeded were validated first.

The 9 that failed? "I just knew they were good ideas."

Trust data, not gut.` },
];

// ============================================
// GENERATE EXCEL FILE
// ============================================

// Create workbook
const wb = XLSX.utils.book_new();

// Main posts sheet
const wsData = [
  ['ID', 'Category', 'POV', 'Platforms', 'Content', 'Status', 'Posted Date', 'Engagement Notes'],
  ...posts.map(p => [p.id, p.category, p.pov, p.platform, p.content, 'Pending', '', ''])
];
const ws = XLSX.utils.aoa_to_sheet(wsData);

// Set column widths
ws['!cols'] = [
  { wch: 5 },   // ID
  { wch: 18 },  // Category
  { wch: 10 },  // POV
  { wch: 20 },  // Platforms
  { wch: 80 },  // Content
  { wch: 10 },  // Status
  { wch: 15 },  // Posted Date
  { wch: 30 },  // Engagement Notes
];

XLSX.utils.book_append_sheet(wb, ws, 'All Posts');

// Category summary sheet
const categories = [...new Set(posts.map(p => p.category))];
const summaryData = [
  ['Category', 'Count', 'Description'],
  ...categories.map(cat => [
    cat,
    posts.filter(p => p.category === cat).length,
    getCategoryDescription(cat)
  ])
];
const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
summaryWs['!cols'] = [
  { wch: 20 },
  { wch: 10 },
  { wch: 50 },
];
XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

// Schedule template sheet
const scheduleData = [
  ['Day', 'Date', 'Post ID', 'Platform', 'Time', 'Status'],
  ['Monday', '', '', 'Twitter', '9:00 AM', ''],
  ['Monday', '', '', 'LinkedIn', '10:00 AM', ''],
  ['Tuesday', '', '', 'Twitter', '12:00 PM', ''],
  ['Wednesday', '', '', 'Twitter', '9:00 AM', ''],
  ['Wednesday', '', '', 'LinkedIn', '10:00 AM', ''],
  ['Thursday', '', '', 'Twitter', '3:00 PM', ''],
  ['Friday', '', '', 'Twitter', '9:00 AM', ''],
  ['Friday', '', '', 'LinkedIn', '11:00 AM', ''],
];
const scheduleWs = XLSX.utils.aoa_to_sheet(scheduleData);
scheduleWs['!cols'] = [
  { wch: 12 },
  { wch: 12 },
  { wch: 10 },
  { wch: 12 },
  { wch: 12 },
  { wch: 10 },
];
XLSX.utils.book_append_sheet(wb, scheduleWs, 'Weekly Schedule');

// Write file
XLSX.writeFile(wb, 'validuct_marketing_posts.xlsx');

console.log('✅ Generated validuct_marketing_posts.xlsx');
console.log(`📊 Total posts: ${posts.length}`);
console.log('\nBy category:');
categories.forEach(cat => {
  console.log(`  - ${cat}: ${posts.filter(p => p.category === cat).length} posts`);
});

function getCategoryDescription(category) {
  const descriptions = {
    'Founder Story': 'Personal journey and origin story content',
    'Build in Public': 'Updates on building Validuct, transparent progress',
    'Educational': 'Value-first content teaching validation frameworks',
    'Product Feature': 'Highlighting Validuct features and benefits',
    'Thought Leadership': 'Hot takes and industry perspectives',
    'Engagement': 'Questions and polls to drive interaction',
    'Social Proof': 'Testimonials and user success stories',
    'Pain Point': 'Agitating problems builders face',
    'Comparison': 'Comparing Validuct to alternatives',
    'Tips': 'Quick, actionable validation tips',
    'Motivation': 'Inspiring content for builders',
    'Story': 'Case studies and anecdotes',
    'Relatable': 'Memes and relatable builder content',
    'LinkedIn': 'Long-form LinkedIn-specific posts',
    'CTA': 'Direct calls to action',
    'Timely': 'Trend-based and current event content',
  };
  return descriptions[category] || '';
}
