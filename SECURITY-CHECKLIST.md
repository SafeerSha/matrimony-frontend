# Production security checklist

## Before launch
- [ ] Connect real authentication/identity service.
- [ ] Validate authorization server-side for every profile, interest, chat, admin and subscription operation.
- [ ] Keep all access/refresh/session secrets out of `NEXT_PUBLIC_*`.
- [ ] Issue `__Host-matrimony_session` as Secure + HttpOnly + SameSite + Path=/.
- [ ] Use HTTPS everywhere; redirect HTTP to HTTPS at the edge.
- [ ] Add backend rate limits for login, OTP, search, interest, chat and file operations.
- [ ] Add bot/abuse controls where appropriate.
- [ ] Validate and sanitize all API input on the server with an allow-list approach.
- [ ] Validate image MIME type, size and dimensions server-side; never trust browser file metadata.
- [ ] Store private profile media behind signed URLs/private buckets.
- [ ] Add malware scanning for user uploads if uploads are enabled.
- [ ] Enforce subscription/entitlement checks on the backend, not the UI.
- [ ] Use parameterized queries/ORM protections in the backend.
- [ ] Configure database least-privilege credentials.
- [ ] Configure structured logging without passwords, tokens, OTPs or private profile data.
- [ ] Add error monitoring with PII scrubbing.
- [ ] Run dependency/security audits in CI.
- [ ] Pin/lock dependency versions and review security advisories.
- [ ] Add automated E2E tests for auth, authorization, privacy and subscription boundaries.
- [ ] Review CSP after integrating analytics, payments, maps or external media.
- [ ] Configure a strict CORS allow-list on the backend.
- [ ] Add CSRF protection if cookie-authenticated cross-site state-changing requests are possible.
- [ ] Add account enumeration protections for authentication/recovery flows.
- [ ] Add audit logs for sensitive account/privacy/admin actions.

## Architecture rule

The frontend is a presentation and request boundary. It is never the final authority for:
- identity
- permissions
- subscription status
- profile visibility
- chat entitlement
- admin actions
- private media access
- payment state
