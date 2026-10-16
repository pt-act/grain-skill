---
name: grain-redesign
description: Redesign an existing page: run the gate on it first (lint + browser inspector), critique its screenshots against the juror's rubric, then fix layout, spacing, hierarchy and styling — keeping the page's real content and working behaviour. Use this for a page that already exists and is underperforming, looks generic, or is in the way of its own content. Also draw a fresh direction with the grain scripts when the redesign is a restyle rather than a repair.
---

# Grain Redesign

`<grain-skill>` below means the folder of the `grain` skill installed alongside
this one (`../grain/`), which carries the scripts and references.

A redesign begins with measurement, not taste. A page that exists has evidence in it:
the inspector's numbers, the screenshots, the working behaviour. Read them before
changing anything.

## The run

### 1. Measure what is

From the project root:

```bash
node <grain-skill>/scripts/lint.mjs <the page's source or folder>
node <grain-skill>/scripts/inspect.mjs <url or path/to/index.html>
```

Open every screenshot in `.grain/inspect/` — desktop, tablet, phone — and critique
them with `<grain-skill>/references/critique.md`: the fourteen passes, the score,
the caps. Write the critique down in `.grain/critique.md` before touching code.

List what the page has that must survive: real content, working behaviour (booking,
search, cart, forms), SEO facts (title, headings, links), anything the client named.
A redesign may move these; it may not lose them.

### 2. Diagnose before designing

Most underperforming pages have one of five causes. Find which one yours is:

1. **No idea.** The first screen is a template. Fix with the idea sentence and a
   hero rebuilt to the blueprint — draw a direction with the grain scripts.
2. **Stock sections after a good hero.** The idea stops at the fold. Carry it into
   every section, pricing and footer included.
3. **Thin content.** Sections promise and do not deliver. Write the full copy deck
   first, then rebuild the section around it.
4. **Ornament without substance.** Tells everywhere (see `references/tells.md`).
   Remove them and fill the space with scale, content, colour and pictures.
5. **Nothing wrong, everything small.** Type too small, gaps too tight, phone a
   squeeze. Fix the scale: display larger, margins honest, sections breathing.

Often it is two. Fix the one that blocks the other first.

### 3. Keep or restyle?

- **Repair** (cause 3, 4, 5): keep the structure and the direction, change the
  composition, the content and the styling. Faster, and keeps what works.
- **Restyle** (cause 1, 2): draw a direction with
  `node <grain-skill>/scripts/draw.mjs --sector … --brief … --sections …` and
  rebuild the first screen and one or two sections from the sheet. Keep the real
  content and working behaviour.

State which you chose and why, in one line, in your notes and the report.

### 4. Rebuild and re-measure

Run the grain pipeline from step 5 of the main skill (build still, gate, look,
move) on the sections you changed. Do not re-lints the unchanged parts with a
fresh eye and find last year's decisions wanting — the gate is on the whole
page; fix new FAILs, defend WARNs you already knew about.

### 5. Report

Say what the gate and the eye found before, what you changed and why, the score
and what still falls short, and anything the client must confirm or wire up
(sample content, image replacements, unconnected checkout). Do not claim a
check you did not run.
