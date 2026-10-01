# Matrimony Theme System

**All client-editable brand colors live in `src/styles/theme.css`.**

Change the tokens in that file to re-theme the entire application. Components should use semantic Tailwind tokens such as `bg-primary`, `text-foreground`, `bg-surface`, `text-muted`, `border-border`, `bg-primary-light`, `bg-accent`, `text-success`, and `text-danger`.

## Initial theme

The prototype uses a premium forest/emerald green with white surfaces, near-black typography and a restrained warm-gold accent.

## Changing the theme

For example, change only:

```css
--primary: #14532d;
--primary-deep: #0f3d22;
--primary-light: #dcf4e3;
```

Do not edit individual page components for a theme change.

## Level 2 rule

No React/TypeScript component should contain brand hex values. Theme values belong here; fixed black/white image overlays are permitted for photo readability.
