# Google OAuth Setup Guide for FoodHood

## 🚨 Current Issue
You're getting: `Unable to exchange external code` - This is a configuration mismatch between Google Console and Supabase.

## 📋 Step-by-Step Fix

### 1. Identify Your URLs
Based on your repository, your URLs should be:
- **Production**: `https://foodhood-rush.vercel.app` (or your actual Vercel domain)
- **Development**: `http://localhost:5173` (or your local dev server)

### 2. Google Console Configuration

#### A. Create/Update OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Set name: `FoodHood App`

#### B. Configure Redirect URIs
Add these **exact** URLs to **Authorized redirect URIs**:
```
https://ndnusvniivdzbgogafng.supabase.co/auth/v1/callback
https://foodhood-rush.vercel.app/auth/callback
http://localhost:5173/auth/callback
```

⚠️ **Critical**: The first URL is your **Supabase auth callback** - this is what handles the OAuth flow!

#### C. Get Credentials
- Copy your **Client ID** and **Client Secret**

### 3. Supabase Configuration

#### A. Add Google OAuth Provider
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `ndnusvniivdzbgogafng`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Configure**
5. Enable Google provider
6. Add your **Client ID** and **Client Secret** from Google Console
7. Click **Save**

#### B. Configure Site URLs
1. Still in Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://foodhood-rush.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://foodhood-rush.vercel.app/**
   http://localhost:5173/**
   https://foodhood-rush.vercel.app/auth/callback
   http://localhost:5173/auth/callback
   ```

### 4. Verify Configuration

#### A. Check URLs Match
- Google Console redirect URIs ✅
- Supabase callback URL ✅  
- Your app redirect URL ✅

#### B. Test Flow
1. Try Google sign-in from your app
2. Check browser network tab for OAuth calls
3. Look for any URL mismatches

## 🔍 Common Issues

### Issue 1: Wrong Supabase Callback URL
**Wrong**: `https://foodhood-rush.vercel.app/auth/callback`  
**Correct**: `https://ndnusvniivdzbgogafng.supabase.co/auth/v1/callback`

### Issue 2: Missing Localhost in Development
Make sure to add `http://localhost:5173/auth/callback` for local development.

### Issue 3: Case Sensitivity
URLs are case-sensitive! Make sure they match exactly.

## 🛠️ Debugging

If still not working:

1. **Check Console Logs**: Look for OAuth redirect URL being used
2. **Network Tab**: Check the actual OAuth request URLs
3. **Supabase Logs**: Go to Supabase → Logs → Auth logs
4. **Error Details**: The new callback page will show specific error information

## 📞 Need Help?

If you're still getting errors after following this guide:
1. Share the exact error message from the callback page
2. Verify your actual Vercel deployment URL
3. Double-check the Supabase project ID matches: `ndnusvniivdzbgogafng`

## 🎯 Quick Checklist

- [ ] Google OAuth client created with correct redirect URIs
- [ ] Supabase Google provider enabled with client credentials
- [ ] Supabase site URLs configured
- [ ] All URLs match exactly (no typos!)
- [ ] Tested from your actual deployment URL