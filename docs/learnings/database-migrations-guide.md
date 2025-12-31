# Database Migrations: A Critical Guide

## What are Migrations?

**Migrations** are version-controlled database schema changes. Think of them like Git commits, but for your database structure.

```
Migration 1: Create users table
Migration 2: Create ideas table
Migration 3: Add is_private column to ideas ❌ (the problematic one)
```

Each migration file contains SQL that transforms your database schema from one state to another.

## The Incident: What Happened

We had a **schema mismatch**:
- **Migration file** said: "ideas table has `is_private` column"
- **Prisma schema** said: "ideas table has NO `is_private` column"
- **Generated Prisma Client** was looking for `is_private` based on the migration
- **Result**: Tests failed with "column `is_private` does not exist"

## Why Data Was Lost

`prisma migrate reset --force` is a **nuclear option** that:
1. **DROPS the entire database** (deletes everything)
2. Creates a fresh database
3. Re-runs all migrations from scratch
4. Seeds the database (if configured)

It's designed for **development only** when you want a clean slate.

⚠️ **NEVER USE IN PRODUCTION**

## What We Should Have Done Instead (Non-Destructive Options)

### **Option 1: Create a Rollback Migration (SAFEST for production)**

```bash
# 1. Remove the field from schema.prisma
# Edit prisma/schema.prisma and remove the isPrivate field

# 2. Create a new migration that removes the column
npx prisma migrate dev --name remove_is_private

# Prisma detects the schema change and generates SQL:
# ALTER TABLE "ideas" DROP COLUMN "is_private";
```

**Benefits:**
- ✅ Keeps all your data
- ✅ Just removes the unwanted column
- ✅ Is reversible
- ✅ Maintains migration history
- ✅ Safe for production

### **Option 2: Manual SQL Migration**

```bash
# 1. Connect to database
psql $DATABASE_URL

# 2. Remove the column manually
ALTER TABLE ideas DROP COLUMN is_private;
\q

# 3. Delete the migration folder
rm -rf prisma/migrations/20251227205012_add_is_private_to_ideas

# 4. Mark the database as in sync
npx prisma migrate resolve --applied 20251227205012_add_is_private_to_ideas

# 5. Regenerate Prisma client
npx prisma generate
```

**Benefits:**
- ✅ Keeps all your data
- ✅ More manual control
- ✅ Good for emergency fixes

**Drawbacks:**
- ⚠️ Requires direct database access
- ⚠️ Can cause migration history inconsistencies if not careful

### **Option 3: Update Schema to Match Database**

Instead of deleting the migration, we could have:

```typescript
// Add to prisma/schema.prisma
model Idea {
  // ... other fields
  isPrivate Boolean @default(false) @map("is_private")
}
```

Then:
```bash
npx prisma generate
```

**Benefits:**
- ✅ Keeps all your data
- ✅ Keeps the feature
- ✅ No migration changes needed

**When to use:**
- When you actually want the feature
- When the migration is already in production

## The Correct Workflow for Removing a Field

```bash
# ❌ NEVER do this in production
npx prisma migrate reset --force

# ✅ Safe way to remove a field

# Step 1: Remove field from schema.prisma
# Edit the file manually

# Step 2: Create migration (development)
npx prisma migrate dev --name remove_unwanted_field
# Prisma generates the DROP COLUMN SQL automatically

# Step 3: Review the generated migration SQL
cat prisma/migrations/XXXXXX_remove_unwanted_field/migration.sql

# Step 4: Apply to production
npx prisma migrate deploy
```

## Prevention: Development vs Production Setup

### Separate Database URLs

```bash
# .env.local (development)
DATABASE_URL="postgresql://localhost:5432/validuct_dev"

# .env.production (production)
DATABASE_URL="postgresql://prod-server/validuct_prod"

# .env.test (testing)
DATABASE_URL="postgresql://localhost:5432/validuct_test"
```

### Never Commit Production Credentials

```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

Only commit `.env.example`:
```bash
# .env.example
DATABASE_URL="postgresql://localhost:5432/validuct_dev"
```

### Safety Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Require confirmation for dangerous Prisma commands
alias prisma-reset='echo "⚠️  WARNING: This deletes ALL data!" && echo "Current DATABASE_URL: $DATABASE_URL" && read -p "Type database name to confirm: " db && npx prisma migrate reset'

# Show current database before any command
alias prisma='echo "📊 Database: $DATABASE_URL" && npx prisma'
```

## Command Reference

### Safe Commands (Production-Safe)

```bash
# Generate Prisma Client (no database changes)
npx prisma generate

# Create new migration (development)
npx prisma migrate dev

# Apply pending migrations (production)
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Open Prisma Studio (read-only viewer)
npx prisma studio
```

### Dangerous Commands (NEVER in Production)

```bash
# ❌ Deletes ALL data
npx prisma migrate reset

# ❌ Forces operation without prompts
npx prisma migrate reset --force

# ❌ Pushes schema without migrations (can lose data)
npx prisma db push --accept-data-loss
```

## Recovery Options

### If You Have Backups

#### PostgreSQL Hosting Providers

**AWS RDS:**
```bash
# Check available backups in AWS Console
# Restore to point-in-time or from snapshot
```

**DigitalOcean:**
```bash
# Go to Databases → Your Database → Backups tab
# Restore from backup
```

**Heroku:**
```bash
# List backups
heroku pg:backups --app your-app-name

# Restore latest backup
heroku pg:backups:restore --app your-app-name
```

**Railway/Render:**
- Check dashboard for backup options

#### Manual Backups

```bash
# Restore from SQL dump
psql $DATABASE_URL < backup_file.sql

# Or with pg_restore for custom format
pg_restore -d database_name backup_file.dump
```

### If You Don't Have Backups

Unfortunately, **data is unrecoverable** without backups. Key lessons:

1. **Set up automated backups immediately**
2. **Test backup restoration regularly**
3. **Never use production database for testing**
4. **Always use separate environments**

## Setting Up Automated Backups

### PostgreSQL Native

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Keep only last 30 days
find . -name "backup_*.sql" -mtime +30 -delete
```

### With Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### Cloud Provider Automated Backups

Most managed database services offer automated backups:
- **AWS RDS**: Automatic backups (retention: 1-35 days)
- **DigitalOcean**: Daily backups (last 7 days)
- **Heroku**: Automated backups with pg:backups
- **Railway**: Point-in-time recovery available

**Always enable and configure these!**

## Best Practices Summary

### DO ✅

- Use separate databases for dev/test/production
- Always review migration SQL before applying
- Test migrations on staging before production
- Enable automated backups
- Use `.env` files, never hardcode credentials
- Add `.env` to `.gitignore`
- Use `prisma migrate deploy` in production
- Keep migration history intact

### DON'T ❌

- Never use `--force` flag in production
- Never use `migrate reset` in production
- Never use `db push` in production
- Never commit `.env` files
- Never test on production database
- Never skip migration review
- Never delete migration folders manually (usually)

## Key Takeaways

1. **Migrations are schema version control** - they track database structure changes over time
2. **`migrate reset` is destructive** - it deletes everything and starts fresh
3. **Always have backups** - automated, tested, and verified
4. **Separate environments** - dev, test, staging, production databases
5. **Review before applying** - always check generated SQL
6. **Use proper commands** - `migrate dev` for development, `migrate deploy` for production

## Additional Resources

- [Prisma Migrations Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Database Migration Best Practices](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate)

---

**Date of Incident:** December 30, 2025
**Impact:** Full production database loss due to `prisma migrate reset --force`
**Root Cause:** Schema mismatch between Prisma schema and migrations
**Lesson Learned:** Never use destructive commands without verified backups
