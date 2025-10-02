# GitHub & Vercel Auto-Deployment Setup Guide

This guide will help you set up automatic deployment to Vercel whenever you push to the master branch on GitHub.

---

## Current Status

✅ **GitHub repository created**: https://github.com/hungson175/research-dashboard
✅ **Git remote configured**: `git@github.com:hungson175/research-dashboard.git`
⏳ **Push to GitHub**: Needs to be completed manually due to network connectivity
⏳ **Vercel integration**: Needs to be configured

---

## Step 1: Push Code to GitHub

Since the automated push is experiencing network issues, please complete this manually:

### Option A: Try Push Again (Recommended)

```bash
# Navigate to project directory
cd /Users/sonph36/dev/deep_research_mrW/research-dashboard

# Check git status
git status

# Push to GitHub
git push -u origin master
```

### Option B: If Push Still Fails

If the push continues to fail, you can:

1. **Check your internet connection** - Ensure GitHub is accessible
2. **Try using HTTPS instead of SSH**:
   ```bash
   git remote set-url origin https://github.com/hungson175/research-dashboard.git
   git push -u origin master
   ```

3. **Or push from your terminal/IDE** - Sometimes the IDE has better network handling

---

## Step 2: Connect Vercel to GitHub Repository

Once the code is pushed to GitHub, follow these steps to enable auto-deployment:

### A. Remove Existing Vercel Project (Optional but Recommended)

Since we deployed directly via CLI, we should connect it to GitHub instead:

1. Go to: https://vercel.com/hung-son-phams-projects/research-dashboard
2. Click **Settings** in the top navigation
3. Scroll down to **Danger Zone**
4. Click **Delete Project** (don't worry, we'll recreate it)

### B. Import from GitHub

1. **Go to Vercel Dashboard**: https://vercel.com/new
2. **Click "Import Project"**
3. **Select "Import Git Repository"**
4. **Find your repository**:
   - If you don't see it, click "Adjust GitHub App Permissions"
   - Give Vercel access to `hungson175/research-dashboard`
5. **Click "Import"**

### C. Configure Project Settings

On the import screen:

1. **Project Name**: `research-dashboard` (or your preferred name)
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `./` (leave as is)
4. **Build Command**: `pnpm build` (should auto-detect)
5. **Output Directory**: `.next` (should auto-detect)
6. **Install Command**: `pnpm install` (should auto-detect)

### D. Add Environment Variables

**Important**: Add these environment variables before deploying:

```
NEXT_PUBLIC_SUPABASE_URL=https://xvaunweueluikscwkzlx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YXVud2V1ZWx1aWtzY3dremx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDU3NDQsImV4cCI6MjA3NDg4MTc0NH0.dkGJJKvZ4RqNT7ZLr56Vn3MRMcNq9demj7FJJ-pfKaI
```

**How to add them:**
1. On the import screen, click **"Environment Variables"**
2. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xvaunweueluikscwkzlx.supabase.co`
   - Click "Add"
3. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### E. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, you'll get a production URL

---

## Step 3: Configure Auto-Deployment from Master Branch

Once the project is imported from GitHub, Vercel automatically sets up auto-deployment:

### Default Behavior (Already Configured)

✅ **Production Deployments**: Every push to `master` branch
✅ **Preview Deployments**: Every push to other branches
✅ **Pull Request Deployments**: Automatic preview for every PR

### Verify Auto-Deployment Settings

1. Go to your project: https://vercel.com/hung-son-phams-projects/research-dashboard
2. Click **Settings**
3. Go to **Git** section
4. Verify:
   - **Production Branch**: `master`
   - **Automatic Deployments from GitHub**: Enabled

### Test Auto-Deployment

Make a small change and push:

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deployment"
git push origin master
```

You should see a new deployment automatically start in Vercel dashboard.

---

## Step 4: Clean Up (Optional)

### Remove `vercel.json` (Optional)

Since environment variables are now managed in Vercel dashboard, you can remove `vercel.json`:

```bash
git rm vercel.json
git commit -m "Remove vercel.json - using Vercel dashboard for env vars"
git push origin master
```

**Note**: Only do this after confirming the Vercel dashboard has all environment variables configured.

---

## Workflow After Setup

Once everything is configured, your workflow will be:

1. **Make changes locally**
   ```bash
   # Edit files
   git add .
   git commit -m "Your commit message"
   ```

2. **Push to GitHub**
   ```bash
   git push origin master
   ```

3. **Automatic Deployment**
   - Vercel detects the push
   - Automatically builds and deploys
   - Updates production site at your custom domain

4. **Monitor Deployment**
   - Go to https://vercel.com/hung-son-phams-projects/research-dashboard
   - View deployment logs and status
   - Get notified via email/Slack if you set up integrations

---

## Troubleshooting

### Push to GitHub Fails

**Error**: `Connection timed out` or `Could not read from remote repository`

**Solutions**:
1. Check internet connection
2. Try HTTPS instead of SSH:
   ```bash
   git remote set-url origin https://github.com/hungson175/research-dashboard.git
   git push -u origin master
   ```
3. Use GitHub Desktop or your IDE's Git integration

### Vercel Deployment Fails

**Error**: Missing environment variables

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy from Deployments tab

### Build Fails on Vercel

**Error**: TypeScript or ESLint errors

**Note**: These are already configured to be ignored in `next.config.mjs`, so this shouldn't happen. But if it does:

1. Check the build logs in Vercel
2. Verify `next.config.mjs` has:
   ```js
   typescript: { ignoreBuildErrors: true }
   eslint: { ignoreDuringBuilds: true }
   ```

---

## Summary

**Current Status**:
- ✅ GitHub repo created: https://github.com/hungson175/research-dashboard
- ⏳ Need to push code manually
- ⏳ Need to import project to Vercel from GitHub

**Next Steps**:
1. Push code to GitHub: `git push -u origin master`
2. Import project to Vercel from GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy and verify
5. Test auto-deployment with a small commit

**Result**:
Every time you push to the `master` branch on GitHub, Vercel will automatically build and deploy your application to production.

**Production URL** (after setup): https://research-dashboard-nine.vercel.app (or your custom domain)

---

## Additional Resources

- **Vercel Git Integration Docs**: https://vercel.com/docs/deployments/git
- **GitHub SSH Setup**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
