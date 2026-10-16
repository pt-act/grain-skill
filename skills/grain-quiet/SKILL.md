---
name: grain-quiet
description: Grain Quiet — a calm, polished direction for product UI, studios and apps: soft contrast, generous whitespace, spring motion. Use this when the brief asks for restraint, premium minimalism, or an interface rather than a public page: dashboards, app screens, account areas, product surfaces where the work happens rather than the page that sells it. Not for landing pages or marketing sites (use grain-frontend).
---

# Grain Quiet

The same craft as Grain, turned down: fewer parts, softer steps, motion with a
spring. Where the public-facing skill deals a direction and fails ornament, Quiet
starts from restraint and fails fuss.

## The direction, fixed

No draw. The direction is the brief:

- **Ground:** one warm near-white. **Ink:** a soft near-black, never pure black.
  **Accent:** one desaturated hue — a blue or a green, rarely a red — used on the
  focused, the selected and the action, at most.
- **Type:** one grotesk family, two weights (400, 600), four sizes at most:
  32–40 display, 16–18 text, 13–15 caption, one micro-size 11–12 reserved for
  timestamps and metadata. Tabular numerals for anything numeric.
- **Space:** the margins are generous (24–32px), the rhythm slow (24, 48, 96),
  the corners square or fully round — decided once and kept.
- **Surfaces:** separated by tone steps of 4–6%, occasionally a hairline where a
  real table or list carries it. Nothing floats: no shadows at rest, one soft
  shadow only on what genuinely overlays (a menu, a dialog, a toast).
- **Motion:** spring (`cubic-bezier(0.34, 1.3, 0.4, 1)`), 200–350ms, small
  travel (8–12px), on state changes and entrances only. Nothing loops except a
  load indicator.

## The run

1. **Map the surface.** List what this interface does, screen by screen. Write
   the one thing each screen is for, in one line. Delete screens that have no
   line.
2. **Build still, as the main skill builds:** tokens first, then the primary
   screen at two widths, then each screen with real content at full density.
   A calm screen is not an empty screen; it is a screen whose content fills its
   space with fewer, larger things.
3. **Calm is earned by density.** Every label names its thing; every number is a
   real number; every empty state says what will be there and when. Quiet
   without content is just blank.
4. **Gate it.** The main skill's `lint.mjs` and `inspect.mjs` still run; the
   house rules hold except where this skill names an exception (one shadow on
   overlays, hairlines inside real tables). Pass `--allow` only for a stated
   brand reason, and say so in the report.
5. **Look at it.** Screenshots at two widths, judged by the fourteen passes in
   `../grain/references/critique.md` (the main skill's references).
   A calm interface fails when it is vague: everything quiet and nothing clear.

## The tells of fake quiet

| Tell | Instead |
| --- | --- |
| Everything grey, nothing dark | A true ink for running text; grey for notes only |
| Everything centred, nothing aligned | Left edges, one grid, aligned numbers |
| Whitespace standing in for missing content | The full content, set small and clear |
| One weight of grey for all type | Weight and size as hierarchy |
| Motion on everything, always | Motion on change; stillness at rest |

## Report

Same as the main skill: the direction (this one), the idea of the surface, the
gate results, the score and what falls short.
