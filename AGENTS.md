# Repository guidance

Build this project as a trustworthy parent-facing information service with the visual language of an original Korean 2D fantasy adventure game.

## Design rules

- Keep information hierarchy, readability, and map usability ahead of decoration.
- Use original storybook-RPG motifs: village maps, quest boards, field guides, wooden signposts, paper panels, and small sprite-like accents. Do not imitate any existing game's logo, characters, UI, maps, or assets.
- Avoid common AI-design tells: purple-to-blue gradients, glassmorphism, random floating blobs, excessive pills, oversized empty hero copy, repetitive three-card grids, emoji icons, and decorative English labels.
- Prefer warm ivory, forest green, sky blue, leaf green, wood brown, and restrained gold. Use semantic CSS tokens rather than raw colors in components.
- Use one consistent inline SVG icon language. Every interactive control needs a visible focus state and a 44px touch target where practical.
- Motion must explain interaction, use transform/opacity, stay around 150-300ms, and respect `prefers-reduced-motion`.

## Code rules

- Keep React Server Components as the default. Add `use client` only for real browser interaction.
- Reuse the existing `Button`, `Container`, and shared visual primitives instead of duplicating markup.
- Keep component props explicit and local; avoid speculative abstractions and one-off wrapper components.
- Use `next/image` with dimensions and responsive `sizes` for content images.
- Do not add a dependency when a small local component or CSS solution is enough.
- Keep Korean interface copy direct and natural. Avoid ornamental English microcopy unless it is a real user-facing term.

## Validation

Before handoff, run:

```bash
npx tsc --noEmit --pretty false
git diff --check
npm run build
```

Check the main pages at 375px, 768px, 1024px, and 1440px. The map must remain draggable and the page must not horizontally scroll.
