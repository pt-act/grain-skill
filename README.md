# Grain Skill

Agent skills that give coding agents an art direction and a way to check their own
work in a real browser — instead of the average landing page.

A page built by a model looks like the average of every page the model has seen: a
centred headline over three lines, a label above it, a row of icon cards, a soft
gradient, a few thin rules and a monospace caption. **Nothing in it is wrong and
nothing in it was decided.** Grain replaces those defaults with decisions.

[![tests](https://github.com/pt-act/grain-skill/actions/workflows/test.yml/badge.svg)](https://github.com/pt-act/grain-skill/actions/workflows/test.yml)

## Install

```bash
npx skills add https://github.com/pt-act/grain-skill
```

Or symlink from a clone so `git pull` updates in place:

```bash
./install.sh            # symlinks the skills into Claude Code's skill folder
./install.sh --codex    # ... or Codex
./install.sh --all
./install.sh --list     # every install name
```

## The skills

| Skill | Install name | What it does |
| --- | --- | --- |
| **grain** | `grain-frontend` | The default. Art direction for landing pages, marketing sites, portfolios, product pages and event pages, in any stack. Deals a direction, finds real pictures in open archives, checks the result in a real browser. |
| **grain-redesign** | `grain-redesign` | An existing page: measure it with the gate first, critique its screenshots, then fix layout, spacing, hierarchy and styling — keeping the real content and working behaviour. |
| **grain-quiet** | `grain-quiet` | Calm, polished product UI: soft contrast, generous whitespace, spring motion. For interfaces rather than public pages. |

## Examples

Three pages built by the skill itself, in [`examples/`](examples/):

- [The Ledger](examples/wine-bar/) — a wine bar (The Ledger direction, kraft palette)
- [The Atlas Hut](examples/mountain-hut/) — a mountain refuge (The Atlas direction)
- [The Blueprint Studio](examples/studio/) — a ceramics studio (The Blueprint direction)

Each was built from one brief, one dealt direction, real pictures from open
archives, and the full gate. Run `node skills/grain/scripts/lint.mjs examples/wine-bar`
to check one.

## How the default skill runs

1. **Read the brief** and inventory the subject — the eight to twelve things that
   belong to this client and no competitor. The idea comes from that list.
2. **Write the argument** — the page as claims with their proof, one per section.
3. **Draw the direction** — `scripts/draw.mjs` deals three of twelve researched
   directions; you choose the one that carries this subject's idea.
4. **Find the idea** — one sentence tying the subject's own material to the
   direction, plus one live thing the visitor can do.
5. **Write the words** — the whole page as a copy deck, every headline two lines
   or fewer at every width.
6. **Build it, still** — tokens, hero, sections from their blueprints, real
   pictures of the subject's world (found and credited, or drawn in code).
7. **Gate it** — `scripts/lint.mjs` scans the source; `scripts/inspect.mjs` opens
   the page in a real browser at 1440, 768 and 390 pixels and fails the banned
   devices. Screenshots land in `.grain/inspect/`.
8. **Look** — critique the screenshots with the fourteen passes; fix the top
   three; look again.
9. **Move** — the motion layer: a signature move, staggered entrances, control
   feedback, one moving picture. `prefers-reduced-motion` throughout.
10. **Report** — direction, idea, scores, credits, sample content to confirm.

The scripts need Node 22+ and install nothing. `inspect.mjs` drives an installed
Chrome, Edge, Chromium or Brave over the DevTools protocol with no dependencies.
`assets.mjs` searches Openverse and Wikimedia Commons with no API key; it keeps
only public-domain, CC0, CC BY and CC BY-SA files by default and records their
credits for the footer.

## The house rules

No gradients, no shadows at rest, no glass, no eyebrows, no monospace outside
real code, no index numbering, no thin rules, no tiny uppercase letter-spaced
labels, no icon-topped cards, no assistant palette. Two typefaces at most.
Headlines two lines or fewer at every width. Running text in the full ink.
One ground, one ink, one accent. Real pictures, credited, at least four.

## Files

```
skills/grain/          the default skill
  SKILL.md            the run
  scripts/            draw.mjs · assets.mjs · lint.mjs · inspect.mjs
  references/         copy · type · colour · layout · imagery · motion · critique · tells
  assets/             base.css · base.js (neutral foundation, no look of its own)
  library/            directions · palettes · heroes · sections · type systems · motions · sectors · studied sites
skills/grain-redesign/
skills/grain-quiet/
install.sh
```

## License

MIT. Do what you want; the skill improves when you argue with it.
