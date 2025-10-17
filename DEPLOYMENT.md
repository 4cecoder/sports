# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Local Development Complete

- [ ] All features working locally
- [ ] Database migrations tested
- [ ] Forms validated (create, edit, delete)
- [ ] Search and filters working
- [ ] Authentication tested (sign up, login, logout)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)

### ✅ Environment Setup

- [ ] Supabase project created
- [ ] Database tables created (ran SQL migration)
- [ ] RLS policies enabled
- [ ] Supabase Auth configured
- [ ] (Optional) Google OAuth configured

### ✅ Code Ready

- [ ] All changes committed to git
- [ ] `.env.local` not committed (check .gitignore)
- [ ] README.md updated
- [ ] Dependencies up to date

## Deployment Steps

### Step 1: Push to GitHub

```bash
cd /Users/fource/bytecats/sports

# Initialize git if not done
git init
git add .
git commit -m "Initial commit: Fastbreak Event Dashboard

- Next.js 15 with App Router
- Supabase authentication
- Drizzle ORM with PostgreSQL
- Full CRUD for events and venues
- Search and filter functionality
- Type-safe server actions
- Shadcn UI components
- Comprehensive documentation"

# Add remote and push
git remote add origin https://github.com/4cecoder/sports.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js
5. **Important**: Add environment variables before deploying

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Step 3: Configure Environment Variables

In Vercel Project Settings > Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxxx...
DATABASE_URL=postgresql://postgres:xxxxx@db.xxxxx.supabase.co:5432/postgres
```

**Optional (if using Google OAuth):**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### Step 4: Update OAuth Redirect URLs

#### Supabase Auth Settings

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add Site URL: `https://your-app.vercel.app`
3. Add Redirect URLs:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

#### Google OAuth (if enabled)

1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add Authorized Redirect URI:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

### Step 5: Deploy

Click "Deploy" in Vercel dashboard or run `vercel --prod`

### Step 6: Verify Deployment

- [ ] Site loads without errors
- [ ] Can sign up for account
- [ ] Email confirmation works
- [ ] Can log in
- [ ] Dashboard displays correctly
- [ ] Can create event
- [ ] Can add multiple venues
- [ ] Can edit event
- [ ] Can delete event
- [ ] Search works
- [ ] Filter works
- [ ] Can log out

## Post-Deployment

### Monitor

- Check Vercel Analytics for errors
- Monitor Supabase logs
- Watch for any RLS policy issues

### Custom Domain (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs with new domain

### Performance

Check Vercel deployment logs for:
- Build time
- Bundle size
- Any warnings

Optimize if needed:
```bash
# Analyze bundle
npm run build
```

## Troubleshooting

### Build Fails

**Check**:
- TypeScript errors: `npm run build` locally
- Missing environment variables
- Import errors

**Fix**:
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

**Check**:
- DATABASE_URL is correct
- Supabase project not paused
- Connection string includes password

**Fix**:
- Regenerate database password in Supabase
- Update DATABASE_URL in Vercel
- Redeploy

### Authentication Not Working

**Check**:
- NEXT_PUBLIC_SUPABASE_URL is correct
- Publishable key is correct
- Redirect URLs match exactly
- Email confirmation enabled/disabled

**Fix**:
- Double-check all auth environment variables
- Verify Supabase redirect URLs
- Check browser console for auth errors

### RLS Errors

**Symptom**: "Row level security policy violation"

**Fix**:
- Verify SQL migration ran completely
- Check policies exist in Supabase
- Ensure auth.uid() is set correctly

### Google OAuth Not Working

**Check**:
- Client ID and Secret are correct
- Redirect URIs match exactly
- Google OAuth is enabled in Supabase

**Fix**:
- Re-create credentials in Google Cloud
- Update in both Supabase and Vercel
- Clear browser cookies and retry

## Rollback Procedure

If deployment has critical issues:

1. Go to Vercel Deployments
2. Find last working deployment
3. Click "..." > "Promote to Production"
4. Fix issues locally
5. Redeploy when ready

## Maintenance

### Weekly

- [ ] Check for dependency updates
- [ ] Review Vercel analytics
- [ ] Check Supabase usage

### Monthly

- [ ] Update dependencies: `npm update`
- [ ] Review and rotate secrets if needed
- [ ] Check for Next.js updates

### Updates

```bash
# Update dependencies
npm update

# Test locally
npm run dev
npm run build

# Commit and deploy
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

## Scaling

### Database

If you hit Supabase limits:
- Upgrade Supabase plan
- Add database indexes
- Implement pagination

### API Limits

If you hit rate limits:
- Implement caching
- Add request debouncing
- Upgrade Vercel plan

### Storage

If you add file uploads later:
- Use Supabase Storage
- Implement file size limits
- Add image optimization

## Security

### Regular Checks

- [ ] Review RLS policies
- [ ] Check for exposed secrets
- [ ] Monitor for unusual activity
- [ ] Keep dependencies updated

### Best Practices

- Never commit `.env.local`
- Rotate secrets periodically
- Use environment-specific configs
- Enable 2FA on all services

## Backup

### Database

Supabase automatically backs up daily.

Manual backup:
```bash
# Install Supabase CLI
npm i -g supabase

# Dump database
supabase db dump > backup.sql
```

### Code

- GitHub is your primary backup
- Keep local clone updated
- Tag releases: `git tag v1.0.0`

## Success Criteria

Your deployment is successful when:

✅ All features work in production
✅ No errors in Vercel logs
✅ Authentication flows complete
✅ Database operations succeed
✅ Search and filters work
✅ UI is responsive
✅ Loading states display
✅ Error handling works
✅ Toast notifications appear

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console
3. Review Supabase logs
4. Consult documentation
5. Open GitHub issue

---

Happy deploying! 🚀
