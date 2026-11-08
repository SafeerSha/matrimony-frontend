# Docker Deployment Guide for IshtamChat Matrimony Frontend

This guide covers deploying the Next.js frontend application (`matrimony-frontend`) to a Bluehost VPS running **Coolify** using the **Docker** build pack.

---

## 1. How the Docker Build Works

The deployment uses a production-optimized, multi-stage Dockerfile based on Node.js 22 Alpine (`node:22-alpine`):

```
┌────────────────────────────────────────────────────────┐
│ 1. base (node:22-alpine + libc6-compat)               │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│ 2. deps                   │   │ 3. builder                │
│ - Copies package*.json    │   │ - Copies deps             │
│ - Runs `npm ci`           │   │ - Injects Build Args      │
└───────────────────────────┘   │ - Runs `npm run build`    │
                                │ - Generates standalone    │
                                └───────────────────────────┘
                                               │
                                               ▼
                                ┌───────────────────────────┐
                                │ 4. runner                 │
                                │ - Non-root user (nextjs)  │
                                │ - Minimal footprint       │
                                │ - Runs `node server.js`   │
                                └───────────────────────────┘
```

- **Stage 1 (`base`)**: Initializes `node:22-alpine` and installs `libc6-compat` for glibc compatibility on Alpine.
- **Stage 2 (`deps`)**: Performs clean dependency installation via `npm ci` respecting `package-lock.json`.
- **Stage 3 (`builder`)**: Injects build-time public arguments (`NEXT_PUBLIC_*`), compiles the application using Turbopack with `output: 'standalone'` enabled in `next.config.ts`.
- **Stage 4 (`runner`)**: Creates an unprivileged `nextjs:nodejs` system user (UID/GID 1001), copies only the standalone output, static assets, and public directory. Listens on `0.0.0.0:3000`.

---

## 2. Coolify Configuration Settings

When setting up or updating the application in the Coolify UI:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Build Pack** | `Dockerfile` | Do not use Nixpacks. |
| **Dockerfile Location** | `/Dockerfile` | Path relative to repository root. |
| **Base Directory** | `/` (or repo root) | Where `package.json` is located. |
| **Ports Exposes** | `3000` | Coolify maps internal port 3000 to public HTTPS. |
| **Port Mappings** | `3000:3000` | Or proxy via Traefik / Caddy (default Coolify proxy). |

---

## 3. Environment Variables & Build Arguments

Next.js differentiates between **Build-Time (Client)** variables and **Runtime (Server)** variables.

### A. Build Arguments (Must be set in Coolify Build Settings)

Variables prefixed with `NEXT_PUBLIC_` are embedded into the client JavaScript bundle during the build phase. In Coolify, configure them under **Environment Variables** with **Build Variable** toggled ON (or as Docker Build Arguments):

| Variable / Build Arg | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.ishtammatrimony.com/api/v1` | Public backend API endpoint accessed by browsers. |
| `NEXT_PUBLIC_APP_URL` | Recommended | `https://ishtammatrimony.com` | Canonical frontend domain for CSRF/origin validation. |
| `NEXT_PUBLIC_ENABLE_FREE_TRIAL` | Optional | `true` | Set `'true'` for 1-click free trial mode, or `'false'` for paid gateway. |
| `NEXT_PUBLIC_AUTH_METHOD` | Optional | `EMAIL` | Auth mode: `'EMAIL'` (Gmail OTP) or `'PHONE'` (Mobile SMS OTP). |
| `NEXT_PUBLIC_SOCKET_URL` | Optional | `https://api.ishtammatrimony.com` | WebSocket gateway URL. If omitted, derived from `NEXT_PUBLIC_API_URL`. |
| `BACKEND_API_URL` | Optional | `http://matrimony-backend:4000` | Optional internal proxy target for Next.js rewrites. |

> [!IMPORTANT]
> Because `NEXT_PUBLIC_*` values are baked into the compiled JavaScript chunks during `npm run build`, changing any of these variables requires triggering a new deployment/rebuild in Coolify.

### B. Runtime Environment Variables (Configured in Coolify Container Runtime)

These are read by Node.js at container startup and on each request. **Never** pass private secrets as Docker build arguments.

| Environment Variable | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `AUTH_SECRET` | **Yes** | `64_char_hex_or_base64_secret` | Shared JWT secret used by Next.js middleware and session helper to verify user cookies. |
| `JWT_ACCESS_SECRET` | Alternative | `64_char_hex_secret` | Fallback matching backend JWT secret if `AUTH_SECRET` is not set. |
| `NODE_ENV` | Yes | `production` | Enables production optimizations in Node.js. |
| `PORT` | Optional | `3000` | Default listening port (defaults to `3000`). |
| `HOSTNAME` | Optional | `0.0.0.0` | Container bind address (defaults to `0.0.0.0`). |

> [!CAUTION]
> Keep `AUTH_SECRET` / `JWT_ACCESS_SECRET` strictly in Runtime Environment Variables. Do **not** expose them with a `NEXT_PUBLIC_` prefix, as that would leak session secrets to end-user browsers.

---

## 4. How to Deploy and Verify

### Step 1: Push Repository Changes
Commit and push the following files to your remote branch:
- `next.config.ts` (contains `output: 'standalone'`)
- `Dockerfile`
- `.dockerignore`
- `DOCKER_DEPLOYMENT.md`

### Step 2: Configure Application in Coolify
1. Navigate to your Project & Environment in Coolify.
2. Select or create the frontend resource connected to `matrimony-frontend` (branch `main` or `Development`).
3. Under **General Configuration**:
   - Set **Build Pack** to `Dockerfile`.
   - Ensure Dockerfile path is `/Dockerfile`.
   - Set **Port** to `3000`.
4. Under **Environment Variables**:
   - Add public build arguments with **Build Variable** enabled (`NEXT_PUBLIC_API_URL`, etc.).
   - Add server runtime secrets with **Build Variable** disabled (`AUTH_SECRET` or `JWT_ACCESS_SECRET`).

### Step 3: Deploy
1. Click **Deploy** in Coolify.
2. Monitor the build logs to confirm:
   - `npm ci` completes successfully.
   - `next build` runs Turbopack and generates static pages.
   - Output traces standalone server files.
   - Container starts and outputs: `Listening on 0.0.0.0:3000`.

### Step 4: Verification Checks
1. **Health Check**:
   ```bash
   curl -I https://<your-domain>/api/health
   # Expected response: HTTP/1.1 200 OK
   ```
2. **Container Status on VPS**:
   ```bash
   docker ps | grep ishtam
   docker logs <frontend-container-id> --tail 50
   ```
3. **Verify Non-Root Execution**:
   ```bash
   docker exec -it <frontend-container-id> id
   # Expected output: uid=1001(nextjs) gid=1001(nodejs)
   ```
4. **Browser Verification**:
   - Visit `https://<your-domain>/` and inspect console to confirm no CSP errors.
   - Verify API requests target the correct `NEXT_PUBLIC_API_URL`.

---

## 5. Common Troubleshooting Steps

### 1. API Requests Fail with 404 or CORS Errors
- **Cause**: `NEXT_PUBLIC_API_URL` was not passed as a build argument or lacks `/api/v1`.
- **Fix**: Verify Coolify build argument `NEXT_PUBLIC_API_URL` is set to e.g. `https://api.ishtammatrimony.com/api/v1`. Trigger a full rebuild.

### 2. "Session Verification Failed" or Immediate Redirect to Login
- **Cause**: Frontend `AUTH_SECRET` / `JWT_ACCESS_SECRET` does not match the secret configured in the backend NestJS service.
- **Fix**: Ensure the runtime `AUTH_SECRET` (or `JWT_ACCESS_SECRET`) in Coolify matches `JWT_ACCESS_SECRET` in `matrimony-backend-prod-v2`.

### 3. Container Exits Immediately with Code 1
- **Cause**: Port binding or permissions issue on `.next/cache`.
- **Fix**: Check `docker logs <container-id>`. The Dockerfile already configures `mkdir -p .next/cache && chown -R nextjs:nodejs .next` and binds to `0.0.0.0`.

### 4. Images or Avatars Fail to Load
- **Cause**: Content-Security-Policy (CSP) `img-src` restricts unlisted origins.
- **Fix**: `next.config.ts` automatically extracts the origin from `NEXT_PUBLIC_API_URL` and includes `data:`, `blob:`, `https:`, `pravatar.cc`, and `images.unsplash.com`. If using an external S3/Wasabi/Cloudflare R2 bucket for uploads, add that origin to `imgOrigins` in `next.config.ts`.

