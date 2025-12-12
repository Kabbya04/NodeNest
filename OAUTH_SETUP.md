# OAuth Redirect URL Configuration Guide

This guide explains how to properly configure OAuth redirect URLs for Node Nest to work correctly in both development and production environments.

## Problem

When using Google OAuth with Supabase, the application was redirecting to `localhost:3000` after authentication instead of the deployed URL, and was exposing access tokens in the URL.

## Solution

The application now automatically detects the environment and uses the correct redirect URL. However, you need to configure these URLs in both Supabase and Google Cloud Console.

---

## Step 1: Configure Supabase Redirect URLs

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs to **Redirect URLs**:

   **For Development:**
   ```
   http://localhost:5173
   http://localhost:5173/
   http://127.0.0.1:5173
   http://127.0.0.1:5173/
   ```

   **For Production (replace with your actual deployed URL):**
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/
   https://your-custom-domain.com
   https://your-custom-domain.com/
   ```

5. Set the **Site URL** to your primary production URL (e.g., `https://your-app.vercel.app`)

6. Click **Save**

---

## Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (or create a new one)
5. Click on the client ID to edit it

### Authorized JavaScript Origins

Add the following origins:

**For Development:**
```
http://localhost:5173
http://127.0.0.1:5173
```

**For Production (replace with your actual deployed URL):**
```
https://your-app.vercel.app
https://your-custom-domain.com
```

### Authorized Redirect URIs

Add the following redirect URIs:

**For Development:**
```
http://localhost:5173/auth/callback
https://uytmytfqytpuvhfecidd.supabase.co/auth/v1/callback
```

**For Production:**
```
https://your-app.vercel.app/auth/callback
https://uytmytfqytpuvhfecidd.supabase.co/auth/v1/callback
```

> **Note:** Replace `uytmytfqytpuvhfecidd.supabase.co` with your actual Supabase project URL.

6. Click **Save**

---

## Step 3: Update Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

For production deployment (Vercel, Netlify, etc.), add these same environment variables in your deployment platform's settings.

---

## Step 4: Test the Configuration

### Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Click "Continue with Google"
4. After authentication, you should be redirected back to `http://localhost:5173` (not `localhost:3000`)
5. The URL should be clean without any `access_token` in the hash

### Testing in Production

1. Deploy your application
2. Navigate to your deployed URL
3. Click "Continue with Google"
4. After authentication, you should be redirected back to your deployed URL
5. The URL should be clean without any `access_token` in the hash

---

## Security Improvements

The updated code includes the following security improvements:

1. **PKCE Flow**: Uses Proof Key for Code Exchange (PKCE) for OAuth, which is more secure than the implicit flow
2. **Token Cleanup**: Automatically removes access tokens from the URL after authentication
3. **Environment Detection**: Automatically uses the correct redirect URL based on the current environment
4. **No Token Exposure**: Access tokens are no longer visible in the URL

---

## Troubleshooting

### Still redirecting to localhost in production

- Double-check that you've added your production URL to both Supabase and Google Cloud Console
- Make sure you've saved the changes in both platforms
- Clear your browser cache and cookies
- Try in an incognito/private window

### "Redirect URI mismatch" error

- Verify that the redirect URIs in Google Cloud Console exactly match the format shown above
- Make sure you've included the Supabase callback URL: `https://your-project.supabase.co/auth/v1/callback`
- Check for typos in the URLs

### Tokens still visible in URL

- Make sure you've deployed the latest code changes
- Clear your browser cache
- The token cleanup happens automatically, but it may take a moment

### Authentication not working at all

- Verify your Supabase credentials in the `.env` file
- Check that Google OAuth is enabled in Supabase (Authentication → Providers → Google)
- Ensure your Google OAuth client ID and secret are correctly configured in Supabase

---

## Additional Notes

- The application now uses PKCE flow by default, which is more secure and doesn't expose tokens in the URL
- The redirect URL is automatically detected based on `window.location.origin`, so it works in any environment
- You can add multiple redirect URLs for different environments (staging, production, etc.)
- Make sure to update the redirect URLs whenever you change your domain or deployment platform

---

## Need Help?

If you're still experiencing issues:

1. Check the browser console for error messages
2. Check the Supabase logs (Dashboard → Logs)
3. Verify that all URLs are using HTTPS in production (not HTTP)
4. Ensure your Google OAuth consent screen is properly configured
