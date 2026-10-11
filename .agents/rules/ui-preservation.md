---
name: frontend-preservation
description: Enforces UI preservation, secure API integration, responsive design, accessibility, and production-quality Next.js development without breaking existing features.
---

# Frontend Preservation and Secure Development Rule

## Mission

Implement frontend features safely while preserving the existing application architecture, design system, business behavior, API integrations, authentication flow, and responsive layouts.

All changes must be minimal, maintainable, accessible, secure, and consistent with the existing project.

Preserve existing functionality by default. Modify only what is necessary to implement the requested feature.

## 1. Repository Boundaries

- Treat the current frontend repository as the source of truth for frontend implementation.
- Modify only files required for the requested functionality.
- Do not assume backend source code, configuration, or environment variables are available in this repository.
- Do not modify backend behavior or invent backend endpoints to accommodate frontend assumptions.
- Verify API contracts using available API clients, TypeScript types, OpenAPI specifications, documentation, or existing integration code.
- If a required backend contract is unavailable or ambiguous, identify the uncertainty before making assumptions.
- Never overwrite unrelated user changes or discard existing work.
- Do not introduce unrelated refactoring, formatting changes, or new dependencies without justification.

## 2. Mandatory Pre-Implementation Analysis

Before changing code:

- Inspect the relevant routes, layouts, components, hooks, API services, state management, styles, and tests.
- Trace the existing user flow and identify affected pages and shared components.
- Understand the existing authentication, authorization-dependent rendering, validation, and error-handling patterns.
- Inspect existing design tokens, CSS variables, Tailwind configuration, fonts, breakpoints, and component variants.
- Reuse existing components and utilities whenever practical.
- Identify potential regressions and integration dependencies before implementation.
- For significant changes, provide a concise impact analysis before proceeding.

Do not assume that functionality, validation, or a shared component is missing without inspecting the existing implementation.

## 3. Design System and UI Preservation

- Preserve the existing visual identity, color palette, typography, spacing, border radii, shadows, and component hierarchy.
- Reuse established design tokens, CSS variables, Tailwind utilities, and shared components.
- Do not introduce arbitrary colors, inconsistent font sizes, random spacing values, or unnecessary inline styles.
- Match existing hover, focus, active, disabled, loading, and transition states.
- Scope styling changes to the relevant component whenever possible.
- Do not modify global CSS, root layouts, shared wrappers, or theme configuration unless necessary.
- Before modifying a shared component, identify its existing consumers and assess the impact.
- Do not redesign existing pages unless explicitly requested.
- Avoid unnecessary whitespace, inconsistent alignment, overlapping content, and layout shifts.
- Keep the existing application visually consistent across new and existing pages.

## 4. Responsive and Mobile-First Design

- Preserve the existing responsive strategy and breakpoints.
- Support mobile, tablet, laptop, and desktop viewports.
- Ensure forms, navigation, cards, dialogs, tables, menus, and action buttons remain usable on small screens.
- Prevent horizontal overflow, clipped content, overlapping elements, and unusable controls.
- Use responsive layouts instead of inflexible fixed widths where appropriate.
- Account for long names, validation messages, dynamic content, and different text lengths.
- Maintain adequate touch targets and readable text on mobile devices.
- Respect safe areas on supported mobile devices.
- Do not claim that a page is responsive without checking the relevant viewport sizes.

## 5. API Contract and Integration Safety

- Follow the actual backend API endpoints, HTTP methods, request DTOs, response structures, status codes, and error formats.
- Reuse the existing API client and service-layer conventions.
- Maintain accurate TypeScript types that reflect the actual API contract.
- Never invent endpoints, fields, permissions, response envelopes, or business rules.
- Do not rename or remove response properties in frontend code without verifying the contract and all affected consumers.
- Handle loading, success, empty, validation-error, unauthorized, forbidden, rate-limit, network-error, and server-error states appropriately.
- Never show a successful result before the backend confirms that the operation succeeded.
- Prevent accidental duplicate submissions and unnecessary repeated requests.
- Handle stale responses and obsolete requests where appropriate.
- Preserve existing pagination, filtering, sorting, and data-refresh behavior.
- If the backend contract needs to change, identify the dependency and request the appropriate coordinated change instead of silently working around it.

## 6. Authentication and Session Security

- Follow the application's established authentication and session-management architecture.
- Never hardcode credentials, secrets, private API keys, or privileged service tokens in frontend code.
- Never place private credentials in variables exposed to browser bundles, including public environment variables.
- Do not store authentication tokens or session credentials in localStorage or sessionStorage unless an explicitly reviewed architecture requires it.
- When using cookie-based authentication, preserve secure cookie settings and the application's CSRF protections.
- Avoid exposing tokens or sensitive data in URLs, browser history, analytics events, error messages, or debug logs.
- Treat client-side route guards, hidden buttons, and role-based rendering as user-experience controls, not security boundaries.
- Backend authorization must protect every sensitive operation.
- Handle expired sessions and unauthorized responses consistently without creating redirect loops.
- Never bypass authentication to fix a navigation or integration issue.

## 7. Matrimony Privacy and User Safety

- Display phone numbers, private addresses, private photographs, identity documents, and other sensitive profile information only when access is authorized.
- Do not fetch restricted profile data merely because the UI hides it.
- Respect backend-enforced profile visibility, consent, blocking, reporting, and account-status restrictions.
- Do not assume an authenticated user can access every profile.
- Avoid leaking private data through client-side caches, hydration payloads, browser logs, analytics, or error messages.
- Clear or invalidate user-specific cached data when accounts switch, sessions change, or permissions are revoked.
- Do not use permanently public media URLs for restricted photographs or documents when the application's storage policy requires private access.
- Keep notification previews and messages consistent with the application's privacy requirements.
- Never rely on masking a field in the UI to protect sensitive information.

## 8. Next.js and React Architecture

- Follow the existing Next.js routing, rendering, data-fetching, and component conventions.
- Prefer Server Components where appropriate and use Client Components only when client-side interaction or browser APIs require them.
- Do not convert an entire page into a Client Component merely to support one interactive element.
- Preserve existing SSR, ISR, CSR, caching, and revalidation behavior unless a change is required and reviewed.
- Never expose private profile information through publicly cached pages or shared caches.
- Ensure authenticated and user-specific responses use appropriate caching behavior.
- Follow the existing server/client boundary and avoid importing server-only modules into client components.
- Use explicit TypeScript types and avoid unnecessary `any`, unsafe assertions, and suppression of type errors.
- Keep components focused and reusable.
- Reuse established hooks, API services, form components, and utilities.
- Avoid unnecessary global state and duplicated business logic.
- Clean up event listeners, subscriptions, timers, and effects where appropriate.
- Do not mutate React state directly.

## 9. Forms and Input Handling

- Reuse the existing form library and validation conventions.
- Provide clear labels, appropriate input types, required indicators, and useful validation messages.
- Validate input on the client for usability while relying on the backend for authoritative validation.
- Preserve entered values after recoverable submission failures where practical.
- Prevent duplicate submissions while requests are pending.
- Provide appropriate loading, success, and error feedback.
- Do not clear forms or show success before the server confirms the operation.
- Use confirmation steps for destructive actions.
- Handle network failures and rate-limit responses gracefully.
- Never treat client-side validation as a security control.

## 10. Safe Rendering and Content Handling

- Treat user-generated content, profile descriptions, names, messages, uploaded content, and API responses as untrusted.
- Use normal React text rendering instead of injecting raw HTML.
- Never use dangerouslySetInnerHTML with untrusted content.
- If HTML rendering is genuinely required, use an appropriate maintained sanitizer and a clearly defined allow-list.
- Do not construct unsafe URLs from untrusted input.
- Validate permitted link protocols and destinations when rendering user-provided links.
- Avoid unsafe dynamic code execution and unnecessary use of `eval`.
- Preserve appropriate content escaping and output encoding.

## 11. Loading, Error, and Interaction States

- Use existing loading indicators, skeletons, toast notifications, and dialogs.
- Provide meaningful empty states and clear next actions.
- Display actionable error messages without exposing stack traces, secrets, or internal implementation details.
- Prevent duplicate notifications for a single action.
- Preserve useful content during recoverable failures where appropriate.
- Ensure disabled controls, retry actions, and progress indicators behave correctly.
- Avoid unnecessary layout shifts during loading.
- Use subtle, purposeful animations and respect reduced-motion preferences.
- Do not create inert buttons or interactions that appear functional but have no implemented action.

## 12. Accessibility

- Use semantic HTML and appropriate labels.
- Maintain visible keyboard focus indicators.
- Support keyboard navigation for dialogs, menus, dropdowns, and interactive controls.
- Ensure dialogs manage focus appropriately.
- Provide meaningful alternative text for informative images.
- Give icon-only buttons accessible names.
- Do not rely exclusively on color to convey errors, selection, or status.
- Maintain readable contrast and scalable text.
- Ensure form errors are accessible to assistive technologies.
- Avoid keyboard traps and hover-only interactions.
- Follow existing accessibility conventions and applicable WCAG guidance.

## 13. Performance and Asset Optimization

- Avoid unnecessary client-side JavaScript, large dependencies, and excessive hydration.
- Reuse existing image optimization and asset-loading mechanisms.
- Lazy-load suitable noncritical and below-the-fold resources.
- Avoid duplicate requests, expensive computations during rendering, and unnecessary re-renders.
- Use memoization only when justified by actual behavior or measurement.
- Prevent layout shifts and preserve stable image dimensions.
- Avoid downloading full-resolution assets when smaller versions are sufficient.
- Review bundle-size and rendering implications when adding dependencies.
- Keep cache invalidation consistent with authentication and privacy.
- Do not introduce complex optimization mechanisms without a demonstrated need.

## 14. Testing and Regression Prevention

- Add or update tests for new components, interactions, validation, and business logic.
- Test loading, success, empty, and failure states.
- Test authentication-dependent rendering and privacy-dependent UI behavior.
- Verify that unauthorized actions are rejected by the backend.
- Check mobile and desktop layouts for affected pages.
- Test shared components against their existing consumers when practical.
- Verify keyboard navigation and important accessibility behaviors.
- Run relevant project lint, type-check, test, and production-build commands.
- Use existing test infrastructure and avoid introducing unnecessary testing dependencies.
- Do not delete or weaken existing tests to make a change pass.
- Never claim that tests or visual checks passed unless they were actually executed.

## 15. Change Control and Completion

- Keep changes limited to the requested feature and necessary supporting files.
- Do not replace established libraries, routing patterns, state management, or styling approaches without justification.
- Do not introduce dependencies without explaining why they are needed.
- Do not perform unrelated refactoring or broad formatting changes.
- Do not modify shared global styles unless required.
- Explain significant compatibility, security, or architectural risks before proceeding.
- Obtain approval before making risky changes that affect unrelated functionality or established contracts.

Before completing a task, report:

1. What changed and why.
2. Which pages, components, routes, and API integrations were affected.
3. Whether existing design and responsive behavior were preserved.
4. Whether privacy and authentication boundaries were respected.
5. Which tests, linting, type checks, and builds were actually executed.
6. Any remaining risks, limitations, or required follow-up work.

## Final Invariant

Preserve the existing application experience by default. Never sacrifice security, privacy, accessibility, maintainability, or responsive behavior for implementation convenience.