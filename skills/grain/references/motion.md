# Motion

Step 9. Motion is required — the inspector counts the elements that really move while the page loads and is scrolled, and fails a page under eight. But motion is the last layer, not the first idea.

## §1 The budget

- One signature move per page (the sheet names it).
- An entrance for every section's parts.
- Feedback on every control.
- One moving picture.

That is the whole budget. A page with twenty simultaneous effects is a page with no effect.

## §2 The rules

- **Transform and opacity only.** Nothing else animates: no colour shifts, no layout thrash, no width/height. The exception is a scroll-linked drift on one plate, which moves transform only.
- **Once.** Entrances fire once, as the section crosses 85% of the viewport, and never reset. Content that stays hidden if the script fails is banned — everything must be visible without script.
- **60–90ms stagger** between parts of a section: heading, then text, then picture. 16–24px of travel, opacity to 1. Not one fade for the whole block.
- **`prefers-reduced-motion`**: every move's fallback keeps the content and drops the travel. The inspector emulates reduced motion and fails a page whose content disappears.
- **Feedback**: press, hover and focus on every button, link, card and the live thing. A control with no feedback is a dead end.

## §3 The recipes

Tested recipes live in `library/motions.js` (`draw.mjs` prints the sheet's). The ones that survive contact:

- **Rise, staggered** — the default entrance. `translateY(18px)` + opacity, `.6s cubic-bezier(.2,.6,.2,1)`, parts 60–90ms apart.
- **Clip reveal** — a clip-path opens from the direction the content hangs (top for a wall, left for a bench). 500ms, ease-out. For a hang of objects.
- **Slow drift** — a plate holds `scale(1) → scale(1.06)` over 18s, alternating, or translates a few pixels against scroll. One plate per screen at most. The photograph moves; the type does not.
- **Draw on** — a line drawing extends: `stroke-dashoffset` from full to zero as its section enters, 1.2s. One consistent line weight. For plans, silhouettes, motifs.
- **Spot follow** — the lit object dims as the next lights, a scroll-linked crossfade over 300ms. For the stage direction.
- **The march** — a short line of the subject's own words moves on a loop, one direction, 24–40s linear. The words are content (its cities, its dates), not decoration.
- **The settle** — the hero's title is set line by line, each line's ink going 40% → 100% as the previous settles. On load only.
- **The turn** — a facing page turns in, 8deg rotateY over 600ms. One per page, on the showcase.

## §4 What is not motion

A move that changes the colour or the layout of whole screens (colour by chapter, a pinned story) is composition — build it in step 6, and let every look round see it. Motion decorates the composition; it does not replace it.

## §5 Looking again

After the motion layer, run the inspector once more and open every screenshot at every width. Check: content that failed to appear, elements stuck mid-entrance, a motion that reads as an error. A move the reviewer cannot explain in one sentence is cut.
