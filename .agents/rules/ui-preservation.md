---
name: ui-preservation
description: Preserves UI layout, visual design, responsiveness, and theme tokens when implementing or modifying features.
---

# UI Theme & Layout Preservation Rule

## Mission
When implementing new features, fixing bugs, or refactoring existing functionality, preserve all existing visual themes, design tokens, component styling, responsive layouts, and UX patterns. Feature work must never introduce visual regressions or break existing UI structure.

## Core Invariants

### 1. Zero Layout & Responsive Regressions
- **Preserve Shell & Grid Containers**: Do not alter global layout wrappers, page grids, flex containers, padding, margins, or responsive breakpoints (`sm:`, `md:`, `lg:`).
- **Match Viewport Responsiveness**: Always test and ensure new additions adapt seamlessly across mobile, tablet, and desktop views without causing overflow, horizontal scrolling, or layout shifting.

### 2. Design System & Theme Token Consistency
- **No Hardcoded Hex Colors**: Respect project theme architecture (`THEME.md` / `src/styles/theme.css`). Do NOT write hardcoded hex values (e.g. `#14532d`, `#ff0000`) inside React/TypeScript components.
- **Use Semantic Tokens**: Always use established semantic design tokens (e.g., `bg-primary`, `text-foreground`, `bg-surface`, `text-muted`, `border-border`, `bg-primary-light`, `bg-accent`, `text-success`, `text-danger`).
- **Typography & Font Hierarchy**: Use the project's existing typography hierarchy, font families, and weight classes (`font-medium`, `font-semibold`, `text-sm`, `text-base`). Never inject arbitrary one-off font sizes.

### 3. Component Integrity & Visual Cohesion
- **Re-use Existing UI Components**: Prioritize using existing primitives (buttons, inputs, modals, cards, badges) before creating new ones.
- **Match Interaction States**: New interactive elements must replicate existing hover, active, focus-visible, and disabled transitions, border-radius (`rounded-*`), and shadow patterns.
- **Backwards Compatibility**: When extending existing components with new props or state, ensure all existing instances and parent DOM structures remain unaltered.

### 4. Style Isolation
- **Scope Style Modifications**: Confine styles strictly to new elements. Never modify global stylesheets (`globals.css`, reset files) unless specifically instructed.
- **Prevent CSS Collisions**: Avoid aggressive selector overrides, un-scoped CSS, or `!important` declarations that could inadvertently alter adjacent components.
