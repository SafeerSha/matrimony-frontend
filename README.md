# Matrimony Web Foundation — Level 2

A client-ready, production-oriented frontend prototype for a modern matrimonial platform.

## Included

- Next.js App Router + TypeScript + Tailwind CSS
- Centralized theme tokens in `src/styles/theme.css`
- Responsive landing, login and authenticated application shell
- Dashboard with activity, recommendations and profile-strength states
- Discover with search, location, age filters, sorting foundation and empty state
- Rich profile detail with compatibility, about, preferences, safety and interest flow
- My Profile management with completeness, sections, privacy and preferences
- Interests: received, sent and accepted states
- Messages: conversation list, message composer, unread state and privacy guidance
- Notifications center
- Settings: account, privacy, notifications, subscription and danger-zone foundation
- Reusable Button, Card, Badge, Avatar, SectionHeader, ProfileCard and layout components
- Auth/session, API client, validation and security-header foundation
- Loading, error and not-found states
- Security checklist and theme documentation

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Theme

Edit only `src/styles/theme.css` for client theme changes. See `THEME.md`.

## Important

This is Level 2: a polished, realistic frontend prototype and architecture foundation. Backend authentication, PostgreSQL, real matchmaking, FCM delivery, realtime chat, payments, moderation and production infrastructure are intentionally separate implementation phases.
