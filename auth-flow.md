# Authentication Flow Documentation

This document describes the authentication architecture and flow implemented in the NodeNest platform. The system uses Supabase Auth with the PKCE (Proof Key for Code Exchange) flow for secure authentication.

## Architecture Overview

The authentication system is built using:
- **Supabase Auth**: Backend authentication provider
- **React Router**: Client-side routing management
- **Vite Environment Variables**: Configuration management

## Configuration

The authentication flow relies on precise URL configuration to handle redirects correctly across different environments (local development vs. production).

### Environment Variables
The application determines the base URL using the following priority:
1. `VITE_SITE_URL`: The canonical URL of the application (Primary)
2. `VITE_REDIRECT_URL`: Legacy configuration variable (Secondary)
3. `window.location.origin`: Fallback for client-side execution

### Supabase Setup
- **Flow Type**: PKCE (`pkce`) is enabled in the Supabase client configuration.
- **Redirect URLs**: The Supabase project must be configured to allow the callback URL: `${BASE_URL}/auth/callback`.

### Hosting Configuration (SPA Routing)
Since NodeNest is a Single Page Application (SPA), all routing is handled client-side. To support deep links like `/auth/callback` on static hosts (e.g., Vercel), a rewrite rule is required to direct all traffic to `index.html`.

**`vercel.json`**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Without this, navigating directly to `/auth/callback` would result in a 404 error because the physical file does not exist on the server.

## Authentication Flow

### 1. Initiation
The flow begins in the **Auth Component** (`src/components/Auth.tsx`).
- When a user selects a provider (e.g., Google), the application constructs a redirect URL targeting the `/auth/callback` route.
- A call is made to `supabase.auth.signInWithOAuth` with:
  - `provider`: The selected provider (e.g., 'google')
  - `redirectTo`: `${BASE_URL}/auth/callback`
  - `skipBrowserRedirect`: `false` (to allow automatic redirection)

### 2. Provider Authentication
- The user is redirected to the identity provider (Google).
- Upon successful authentication, the provider redirects the user back to the application's `/auth/callback` route, appending an authorization code to the URL.

### 3. Callback Handling
The **AuthCallback Component** (`src/components/AuthCallback.tsx`) handles the reentry flow.
- This component is mounted at the `/auth/callback` route.
- On mount, it triggers `supabase.auth.getSession()`.
- The Supabase client library automatically detects the authorization code in the URL and performs the exchange for a session token.
- Once the session is established (or if an error occurs), the component navigates the user to the root route (`/`).

### 4. Session State Management
The **App Component** (`src/App.tsx`) and **useAuth Hook** (`src/hooks/useAuth.ts`) manage the application state based on the session.
- `App.tsx` utilizes `react-router-dom` to define routes.
- The root route (`/`) is protected. It conditionally renders the main application layout if a user session exists.
- If no session exists, it renders the `Auth` component to restart the cycle.
- The `useAuth` hook listens for `onAuthStateChange` events to keep the local user state synchronized with Supabase.

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `lib/supabase.ts` | `src/lib/supabase.ts` | Configures Supabase client and URL detection logic. |
| `Auth.tsx` | `src/components/Auth.tsx` | UI for login/signup and initiates OAuth flow. |
| `AuthCallback.tsx` | `src/components/AuthCallback.tsx` | dedicated route handler for processing OAuth redirects. |
| `App.tsx` | `src/App.tsx` | Defines routing structure and protects authenticated routes. |
| `useAuth.ts` | `src/hooks/useAuth.ts` | React hook for accessing user state and subscribing to auth changes. |

## strategic Decision: Client-Side Auth vs. Middleware

This implementation deliberately avoids using server-side Middleware for route protection, unlike full-stack frameworks like Next.js.

### Rationale
1.  **SPA Architecture**: NodeNest is built as a Single Page Application (SPA) using Vite. In a standard SPA, routing happens entirely on the client side after the initial HTML load.
2.  **No Edge Runtime**: Since the application is static and served directly to the browser, there is no intermediate server or edge runtime to intercept requests before they reach the client code.
3.  **Simplicity**: Implementing route guards via React Router (`(!user && !isAuthenticated) ? <Auth /> : <App />`) is native to the React ecosystem and sufficient for securing the UI view layer.
4.  **Supabase Security**: Real data security is handled by Row Level Security (RLS) policies on the Supabase backend, not by the frontend router. Even if a user bypassed the client-side route guard, they would not be able to fetch protected data.
