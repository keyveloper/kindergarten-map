# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Kindergarten Adventure Map
**Generated:** 2026-07-19 13:11:52
**Category:** Parent-facing kindergarten finder and editorial guide
**Design Dials:** Variance 6/10 (Balanced / Modern) | Motion 4/10 (Standard) | Density 5/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#246B45` | `--color-primary` |
| On Primary | `#FFFDF2` | `--color-on-primary` |
| Secondary | `#2F6F91` | `--color-secondary` |
| Accent/CTA | `#D86B4A` | `--color-accent` |
| Background | `#F7EFD8` | `--color-background` |
| Foreground | `#2E382A` | `--color-foreground` |
| Muted | `#6A685A` | `--color-muted` |
| Border | `#BCA77A` | `--color-border` |
| Destructive | `#EF4444` | `--color-destructive` |
| Ring | `#246B45` | `--color-ring` |

**Color Notes:** Sunlit forest village: warm paper, leaf green, clear sky, wood, and a small amount of quest gold. Never use neon or generic AI gradients.

### Typography

- **Heading Font:** system Korean rounded sans (`Pretendard`, `Apple SD Gothic Neo`, sans-serif)
- **Body Font:** system Korean sans (`Pretendard`, `Apple SD Gothic Neo`, sans-serif)
- **Mood:** storybook adventure, friendly, warm, readable, dependable
- **Loading:** no remote font dependency; use the platform stack for speed and stable Korean rendering

**CSS Import:**
```css
font-family: Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
```

### Spacing Variables

*Density: 5/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #246B45;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #246B45;
  border: 2px solid #246B45;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FFFDF3;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #246B45;
  outline: none;
  box-shadow: 0 0 0 3px rgba(36, 107, 69, 0.2);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Hand-painted 2D adventure interface

**Keywords:** storybook RPG, village map, quest board, field guide, painted paper, chunky outline, sprite-like detail, playful but trustworthy

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** layered paper and wood borders, small map-path details, restrained 150-250ms hover feedback, stable content layouts

### Page Pattern

**Pattern Name:** Conversion-Optimized + Feature-Rich

- **CTA Placement:** Above fold
- **Section Order:** Hero > Features > CTA

---

## Motion

**Motion rule** — use CSS only for small state feedback; no scroll choreography library.

```js
.interactive-card:hover { transform: translateY(-2px); }
```

Use no more than one or two moving decorative elements in a viewport. Remove them under `prefers-reduced-motion`.

---

## Anti-Patterns (Do NOT Use)

- ❌ Excessive decoration
- ❌ Direct imitation of an existing game's characters, logo, maps, or interface
- ❌ Purple-blue gradients, glass cards, floating blobs, and excessive pills
- ❌ Decorative English labels that make Korean navigation less direct

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
