---
name: grain-frontend
description: Grain, the anti-slop frontend skill. Art direction for public-facing websites, dealt from a library of twelve directions and a working shelf of studied sites; real pictures found in open archives; a real-browser inspector that fails the page on the house rules. Use this whenever you build, design, redesign or review a landing page, marketing site, portfolio, product page, one-pager, event page or any public-facing web page, in any stack — also when the user says a page looks generic, templated, "AI-made" or sloppy, or asks to make it look designed, premium or less like every other site. Not for dashboards or app screens.
---

# Grain

A page built by a model looks like the average of every page the model has seen: a centred
headline over three lines, a label above it, a row of icon cards, a soft gradient, a few
thin rules and a monospace caption. Nothing in it is wrong and nothing in it was decided.

Grain replaces those defaults with decisions, in four ways:

1. **A script deals the direction, you choose among them.** Asked to invent a look, a model
   picks the category default every time. `scripts/draw.mjs` deals three of twelve directions;
   you choose the one that carries this subject's idea, and the script deals its type system,
   palette, hero and section compositions from a library built by looking closely at what
   award-level sites actually do.
2. **The idea comes from the subject.** What separates a page that sticks from one that
   slides past is a concept taken from the thing itself, not the styling.
3. **A house style with no ornaments,** measured in a real browser by `scripts/inspect.mjs`,
   so the rules are checked rather than hoped for.
4. **You look at what you made.** Screenshots at three widths, a juror's rubric, fix, look
   again.

One warning learned in testing. Taking the ornaments away is only half the job. A page that
has lost its labels, rules and cards and gained nothing in their place reads as thin — and
blind reviewers rightly prefer a richer page with tells over an empty one without them. The
other half is substance: type set larger, whole fields of colour, real pictures of this
subject's world (found or drawn), every section carrying its full content. Do not trade it
for restraint.

In the commands below `<skill>` is this skill's folder. Run them from the project's root, so
working files land in `.grain/` there. The scripts need Node 22+ and install nothing.
`inspect.mjs` needs an installed Chrome, Edge, Chromium or Brave; `assets.mjs` needs network
access and uses no API keys. Every script that produces durable output records it in
`.grain/build-state.json` — the report and the doctor read it later.

### 0. Preflight

Before anything else, in the project's root:

```bash
node <skill>/scripts/preflight.mjs
```

It reports what this machine can do. If something is missing, follow the ladder — each
row names the fallback and what the report must say:

| Missing | Do | And the report says |
| --- | --- | --- |
| Chrome / Edge / Chromium | Run `lint.mjs`; take screenshots with whatever browser tool you exist; critique those | "The inspector could not run; screenshots were taken with X." |
| Network (Openverse / Wikimedia unreachable) | Draw the pictures in code; use the project's own photographs | "The open collections could not be searched; pictures are drawn." |
| Node 22 (Node 18+) | Run `lint.mjs` only; the inspector does not run | "Only the source gate ran." |
| All of the above | Read `library/` through the draw, apply the house rules by hand, and say the build was ungated | "No scripts ran; the build is unverified." |

A missing capability is a branch, not a stop. Say what you could not check — never claim
a check you did not run. At any point `node <skill>/scripts/doctor.mjs` tells you where
the build stands; `doctor.mjs --strict` exits 1 while anything required is missing.

## The run

Do these in order. Steps 1–5 take a few minutes and decide whether the page is any good.

### 1. Read the brief and the project

Find out what is real: the subject, the audience, the one thing the page must get someone to
do, the stack, any existing brand (colours, fonts, logo), and above all **what imagery truly
exists**: the project's own photographs or product shots, a real interface that can be shown,
an image generation tool you can call, or nothing. Do not plan around pictures you do not
have. Nothing of its own is rarely nothing at all: the subject's city, street, materials and
history are in open archives and museums, free to use with a credit (step 6,
`scripts/assets.mjs`).

If the request is vague, decide and state your reading in one line instead of asking. Ask
only when a missing fact blocks the work (no product name, no date for an event).

Then **inventory the subject**: eight to twelve things that belong to this client and to no
competitor. Look for its name and what the name means; its address, street and neighbourhood,
and what that place looks like (its tiles, signs, paint colours, typefaces on its shop
fronts, its light, its weather); the numbers in the brief (seats, rooms, minutes to the sea,
the price, the year); the constraint it lives with (one batch a month, closed in winter, by
appointment); its materials and colours; its rituals and hours (the oven lit at five, the
ferry at seven); the printed things of its world (a timetable, a label, a ticket, a sign).
This list is where the idea comes from in step 4. The pages that win blind tests are built
from an item on such a list; the pages that lose have a good composition with a category
idea. The list is also your picture search: each place, material and printed thing on it is
a query for step 6.

### 2. Write the argument

Before any design, list the page as claims with their proof, one line per section, the way
`references/copy.md` §1 shows. The claims decide which sections exist and in what order.
Delete any section that has no claim. This is how you avoid the stock sequence of hero,
logos, three features, testimonial, pricing, call to action.

### 3. Draw the direction

```bash
node <skill>/scripts/draw.mjs --sector <sector> --brief "<one line about the subject>" \
  --sections <roles in the order of your argument> [--tone <tone>] [--have <assets>] \
  [--keep palette,type] --options 3
```

This deals three directions and prints a short summary of each. Hold each one against your
inventory: which way of composing can carry something only this client has? Choose that one,
not the most familiar, and write one line in your notes on why. A random direction that does
not suit the subject is the commonest cause of a weak page. Then deal the full sheet:

```bash
node <skill>/scripts/draw.mjs <the same arguments> --direction <chosen id>
```

- `--sector`: `node <skill>/scripts/draw.mjs --list sectors`. Pick the closest.
- `--sections`: roles from `--list roles` (intro, features, showcase, how-it-works,
  testimonial, proof, stats, list, pricing, faq, cta, contact, about, work, gallery, footer).
  The hero is implied.
- `--tone` (optional): quiet, bold, warm, technical, playful, luxury, editorial. Only pass it
  when the brief clearly asks for one.
- `--have`: assets that really exist, comma-separated: `photography` (the project's own
  photographs of the place, people or work), `product-photo` (photographs of the specific
  product, or an image tool that can make them), `product-ui` (real screenshots),
  `illustration`, `video`. Leave it out if you have none: the draw then says how to fill
  picture slots honestly (a product with no photographs is drawn and set among real pictures
  of its world, never a fake product shot). Pictures you will find in the open collections
  are not the project's own; leave them out of `--have`.
- `--keep palette,type`: when the brand already fixes colours or typefaces. The draw then
  deals only composition, and you map the brand's values onto the roles.

The command prints a **direction sheet**. It is the art direction for this build:

- **Adopt it.** Do not blend it with the layout you would have made anyway. If it feels
  unfamiliar, good: the familiar layout is the one this skill exists to prevent.
- Redraw one slot (`--redraw hero | type | palette | section:<role>=<alt>`) only
  for a reason you can state: it contradicts a stated brand constraint, or needs an asset
  that does not exist. Never redraw to get something more comfortable. Record every redraw
  in your report.
- When a dealt section cannot hold the real content (it compares three plans and there is
  one price; it wants five quotations and there are none), do not bend the content to fit.
  List the others with `--alternatives <role>`, pick the one whose assumptions match the
  content, and take it with `--redraw section:<role>=<alt>`.
- **Check the palette against the subject.** A dealt palette is a set of proportions (one
  ground, one ink, one accent, fields) as much as a set of colours. If its colours fight the
  subject's own material (candy pastels for a peat whisky, neon for a mountain hut), redraw
  the palette once; if the subject has unmistakable colours of its own (its material, the
  paint of its street, the landscape outside its windows), keep the dealt proportions and
  take the colours from the subject instead, and say so in the report.
- Reprint it any time with `node <skill>/scripts/draw.mjs --show`. In a long session,
  re-read it before each section you build.

### 4. Find the idea

The direction is a way of composing. The idea is what makes the page belong to this subject
and no other. Write this sentence in your notes and do not start building until both blanks
are filled from the subject itself:

> On this page, **[something that belongs to the subject]** becomes **[the device the direction calls for]**.

Places to look for the first blank:

- **Its output.** What does the thing produce? Put the real output on the page as material.
- **Its object or shape.** What does it physically look like, in cross-section, in
  silhouette? Enlarge it, crop it, make it the frame or the one motif.
- **Its name.** Can the letters hold a photograph, stack into a wall, split to two corners?
- **Its place.** Is there one view that makes someone want to be there?
- **Its ritual.** Is there a sequence the page can perform as it scrolls?
- **Its artefact.** What printed thing already exists in its world: ticket, menu, label,
  receipt, invitation, folder, manual?
- **Its opposite.** Which other category owns the feeling this one lacks?

Fill the first blank from your inventory (step 1), not from the category. **The competitor
test:** put the nearest real competitor in the sentence. If the sentence still works, the
idea belongs to the category: a loaf of bread is every bakery; the seven doors of the street
this one is named after are only this one. "Clean and modern" is not an idea.

**One live thing.** Give the page one thing the visitor can do, or that is different for each
visit, made from the idea: pick a wood and see the chair in it; set the loan and read the
real monthly figure; choose a vintage and see it beside the current release; see whether the
hut's stove is lit right now and how long until the last ferry. Every winning page in blind
tests had one and reviewers named it first. Rules: it uses the subject's real content, it
works on a phone with a thumb, it has a plain fallback without script, it never blocks
reading, and it is one thing, not a playground. It is built in step 6 as part of the page,
not added as motion in step 9.

### 5. Write the words

Write the whole page as a copy deck (plain text) before markup, following
`references/copy.md`:

- **Every headline fits in two lines or fewer at every width.** Do the arithmetic in
  copy.md §2 before committing to a sentence: about 32 characters is safe everywhere at a
  confident size.
- One supporting sentence. One primary action, named for what it does, as a real button on
  the first screen.
- **The first screen answers the visitor's first question in large type.** For an event:
  what it is, when and where (the dates belong in the headline or at the second size, never
  only in small text). For a product: what it is and what it costs or does. For a person:
  who and what they do. Every section the visitor came for (the line-up, the menu, the
  rooms, the price) has its own heading and its own place in the navigation.
- **Write the full content.** Every section the brief asks for delivers its information
  completely: the whole menu with prices, each room with its own details, every speaker and
  talk, the price with what it includes, an answer for each real question. Thin sections
  are the commonest reason a clean page loses to a busier one.
- Sample details are expected where the brief leaves gaps (dish names, room names and
  rates, project titles) so the design is seen at full density; list them in the report for
  the client to confirm. Proof is never invented: no customers, quotes, reviews, press,
  logos or business statistics.

### 6. Build it, still

Build the page with motion switched off in your head; a page that needs animation to look
finished is not finished. Order of work:

1. **Tokens.** Colour and type roles from the sheet as CSS custom properties. Everything
   downstream references tokens only. `<skill>/assets/base.css` is a neutral foundation you
   may start from (reset, token names, fluid type steps, grid, focus and selection styles,
   the motion helpers); it has no look of its own.
2. **The hero, exactly as the blueprint describes it,** at desktop and at phone width. Get
   the big thing big and the small things small before anything else exists.
3. **Each section from its blueprint,** with this project's content. Keep the geometry,
   change the subject. Neighbouring sections must not share a layout. **Carry the idea into
   every section,** pricing, FAQ and footer included: the commonest failure, even on good
   pages, is a distinctive first screen followed by stock blocks.
4. **Imagery,** in this order of preference:
   1. the project's own;
   2. generated, if you have an image tool;
   3. **real pictures of the subject's world from the open collections,** whenever an honest
      one exists. Search them with `node <skill>/scripts/assets.mjs "<query>"` (Openverse
      and Wikimedia Commons; only licences that allow commercial use, by default). Search the
      inventory, not the category: its street in old postcards, an old map of the
      neighbourhood, its material up close, its trade in engravings, a museum object of its
      kind, a botanical plate, a star chart. Use them large and with intent: one archival
      photograph as the hero, an engraving enlarged into the page's motif, the real map of the
      street as the contact section. Look at each before choosing; `--get <ref>` downloads it
      into `assets/` and records its source and licence, and `--credits` prints the credit
      line for the footer. A found picture shows the world around the client and is never
      presented as the client's own product, room, dish, person or team;
   4. **drawn in code from the subject itself,** for what no honest picture exists of (its
      objects, its tiles, its windows, its product's interface, made as one consistent flat
      graphic language in the palette's real colours);
   5. the photographs dealt on the sheet, only where an honestly generic picture fits (the
      sea for a sea house), never as a stand-in for the subject;
   6. type and colour alone.

   **The floor, which the inspector checks:** at least four real pictures on the page,
   usually six to twelve (photographs, archival images, maps, engravings, footage, raster
   artwork; for software, its cropped interface fragments count too). SVG drawings do not
   count toward the floor: draw what no picture exists of, and still carry real pictures.
   Add one moving picture wherever an honest clip exists: search it with
   `assets.mjs --video "<query>"` and use it as a muted loop with a poster frame. Models
   skip pictures and footage because finding them is work; the page fails without them.

   `references/imagery.md` covers searching, licences and credits, video, drawing, crops and
   treatments.
5. **The live thing** from step 4, built into the section where it proves the claim (often
   the hero or the booking), with real content, a thumb-sized phone version and a plain
   fallback.
6. **Fullness.** Look at each desktop screen as a poster: one dominant thing and the content
   it carries. A screen that is mostly empty ground is an underbuilt section, not a rest;
   one deliberate rest per page is the limit, and the inspector warns on a page with two or
   more near-empty screens. Running text is in the full ink at 15px or more; grey is for
   secondary notes.
7. **States and semantics.** Real links and buttons, visible focus, alt text, a phone
   layout that is its own composition.

Read `references/type.md`, `references/colour.md` and `references/layout.md` when you need
the detail behind a decision; the laws below are the short form.

### 7. Gate

```bash
node <skill>/scripts/lint.mjs <source files or folder>
node <skill>/scripts/inspect.mjs <url or path/to/index.html>
```

`lint.mjs` scans source for banned patterns and stock phrases. `inspect.mjs` opens the page
in a real browser at 1440, 768 and 390 pixels, measures it (headline line counts, type
sizes, fonts actually loaded, colours, gradients, shadows, overflow, how many elements
really move, images loaded) and saves screenshots to `.grain/inspect/`. Fix every `FAIL`.
Treat each `WARN` as wrong unless you can defend it to a designer in one sentence. Re-run
until there are no `FAIL`s. Do not argue with the meter and do not hide things from it. If
the page must also open straight from the file system, open `index.html` that way once
before you finish. Every run is recorded in the build state; `doctor.mjs` shows the last
result. When the sheet's palette and type system are dealt, `node <skill>/scripts/tokens.mjs`
emits the `:root` tokens and font links verbatim — paste them, do not copy hexes by hand.

### 8. Look

Passing the gate means nothing banned was measured. It does not mean the page is good. Open
the screenshots the inspector lists (every viewport, with your image viewer or Read tool)
and critique them with `references/critique.md`: the fourteen passes, the score, the caps.
Write the critique down in its format, fix the top three problems, run the inspector again,
look again. Three rounds at most.

Judge only the pictures. If a problem is visible in a screenshot, it is real, whatever the
code says.

### 9. Move

Now build the motion layer. It is required, and it is more than one fade: the inspector
counts the elements that really move while the page loads and is scrolled, and fails a page
under eight (it warns under sixteen). The layer has four parts:

1. **The signature move** named on the sheet: one, done well.
2. **An entrance for the parts of every section:** the heading, then the text, then the
   picture, staggered by 60–90ms, rising 16–24px with opacity, triggered once as the
   section enters. Not one fade for the whole block, and never content that stays hidden if
   the script fails.
3. **Feedback on every control:** press, hover and focus on buttons, links, cards and the
   live thing.
4. **One moving picture:** a found clip as a muted loop, a slow scale or drift on a
   photograph, or a scroll-linked move on the hero picture.

Transform and opacity only; every move has a `prefers-reduced-motion` fallback that keeps
the content and drops the travel. A move that changes the colour or the layout of whole
screens (colour by chapter, a pinned story) is part of the composition, so build it in
step 6 and let every look round see it. `references/motion.md` has the tokens and tested
recipes. Then run the inspector once more and check every screenshot for content that
failed to appear.

### 10. Report

Draft it from the build state first — it sources the direction, redraws, pictures,
credits and gate results, so the report cannot claim a check that never ran:

```bash
node <skill>/scripts/report.mjs --idea "<the idea sentence>" --live "<the live thing>" \
  --section <each role as built> --score <n/10> [--held-back "…"] --sample "<content to confirm>"
```

Record those as you go, not at the end. `report.mjs` alone prints the draft; edit it and
give it to the user: the direction dealt and any redraws with reasons; the idea sentence
and the live thing; the final scores from your last critique round and what still falls
short; every found picture and clip with its title, creator, licence and source page and
where its credit sits on the page; which bundled photographs and which drawings stand in
for photography (so they can be replaced); and any sample content that must be swapped
before launch. Do not claim a check you did not run.

## House rules

These hold on every build, whatever the direction. `inspect.mjs` measures most of them;
`lint.mjs` catches the rest in source.

| Rule | Instead |
| --- | --- |
| **Headlines: two lines or fewer, at every width.** Every `h1`–`h6`, and the main line of the first screen whatever its tag. | Cut words. Then widen the measure. Size last. |
| **Statements are paragraphs.** An intro sentence or a quotation set large is marked up as `<p>` or `<blockquote>`, stays at statement size (36px or less on desktop, 24px on a phone) and runs to about 25 words, three lines. | Larger than that it is a headline and the two-line rule applies. |
| **No eyebrows.** No small label above a heading, no pill badge above the headline, no "New ·" chip. | Put the information in the heading or the first sentence, or drop it. |
| **No monospace** outside real code blocks. | The text face. Tabular figures where numbers align. |
| **No index numbering.** No 01 / 02 / 03, no (001), no "Step 2". | Order shown by position, size, or the words. A real `<ol>` if order matters. |
| **No thin rules.** No hairline dividers, no 1px outlined boxes, no grid lines, crosshairs or crop marks. | Space. A step in background tone. A change of scale. A filled shape. |
| **No gradients.** Not as backgrounds, not on buttons, not in text. | Flat colour, or a real photograph. A neutral scrim under text on a photo is the one exception. |
| **No shadows on things at rest.** No glows. | A tone step between surfaces. Shadows only on what truly floats: a menu, a dialog. |
| **No assistant palette.** No yellow-cream ground with terracotta or rust; no violet or indigo. | The dealt palette. |
| **No tiny uppercase letter-spaced labels.** | Sentence case at a readable size. |
| **No icon-topped feature cards, no rows of identical cards.** | The dealt section blueprint. |
| **No glass.** No backdrop blur panels, no floating pill navigation. | A plain bar: wordmark, a few links, one action. |
| **No emoji, no gradient blobs, no decorative shapes, no fake dashboards of grey bars.** | A real picture, a real interface fragment, or nothing. |
| **No styled accent word** in a headline (italic, serif, coloured, underlined). | One face, one colour. The words carry the emphasis. |
| **Two typefaces at most,** usually one. | The dealt type system. |

Three places keep their own conventions and are left alone by the inspector: real code in
`<pre>`/`<code>` (monospace is correct there), real tables and form fields (they may have
lines), and a real interface fragment whose root carries the attribute `data-ui` (the
product's own borders and menus; see `references/imagery.md` §7).

Why these, honestly. Some are what looking at awarded work repeatedly shows: the pages
people stop at are the ones with fewer repeating parts, larger type, and one clear ground.
Others are taste, and taste can be argued but not measured: monospace labels, index
numbers and hairline grids are *more* common on award sites than on weak ones, which is
exactly why generators imitate them and why they now read as costume. They are banned here
without exception. `references/tells.md` keeps the dated registry.

Removing ornament leaves space. Never fill it with another ornament. Fill it with scale
(make the main thing larger), with the full content, with a picture made for this subject,
or with a field of flat colour. Leave it empty on purpose once per page at most.

## Laws of the craft

Short form. These are house style — decisions this skill's author keeps making, offered as
defaults to argue with, not measurements.

**Type**
- Two or three sizes do the visible work: one very large, one small, nothing in between.
  The strongest pages set display type far larger than the average site dares.
- Display type: tracking -0.02 to -0.05em, leading 0.85–1.05. Text: 15–20px, leading
  1.45–1.6, 45–75 characters per line.
- Five sizes on a page is the ceiling. One family is normal; two is the limit.
- Left-aligned by default. Centre at most one moment.

**Space**
- One grid, one pair of tight margins (16–32px), used everywhere; large things run to the
  edges. Text blocks share two or three left edges on the whole page.
- The gap between sections is clearly larger than any gap inside one: 120–220px on
  desktop.
- Each section has a different composition from its neighbours; none is a card grid.

**Colour**
- One ground, one ink, one accent. The accent appears on the action and perhaps one other
  thing.
- Running text in the full ink. A page set in soft grey reads unfinished.
- Surfaces are separated by a small step in tone, never by a line or a shadow.
- A section may change the whole field colour. Nothing fades into anything.

**Imagery**
- One dominant image beats six small ones. On strong pages the hero media covers at least
  half the first screen most of the time.
- Same crop ratios, same treatment, square corners unless the direction says otherwise.
- No image is better than a placeholder, an icon, or an abstract shape. A picture drawn for
  this subject, in its colours and with care, is better than either. A real picture of its
  world, found and credited, is better still.
- Every found picture is downloaded into the project, credited on the page and listed in
  the report. None is presented as the client's own.
- Nothing ever lies on top of a headline or a statement (the inspector fails it).

**Components**
- Buttons: flat, one fill colour, either square-cornered or fully round, decided once.
- Navigation: wordmark, three to five plain links, one action. No bar chrome.
- The footer is a designed close, not a sitemap: on most strong sites the name returns at
  full width.

## Special cases

**An existing brand or design system.** Pass `--keep palette,type`, map the brand's colours
and faces onto the roles, and take only composition from the draw. The house rules still
apply; if the brand itself requires a banned device (its logo sits in a gradient, its accent
is violet), keep the brand asset, say so in the report, and pass `--allow <rule>` to the
inspector for that rule only.

**Redesign or review of an existing page.** Run `lint.mjs` and `inspect.mjs` on it first
and report what they find, then critique the screenshots with `references/critique.md`.
For a redesign, draw a direction and proceed from step 2, keeping the page's real content
and working behaviour.

**A component or a single section, not a page.** Skip the draw unless there is no direction
to follow. Match the surrounding design, apply the house rules and the laws, and still
inspect the result.

**No checkout, no form backend.** The primary button goes to the real destination when the
brief names one. Otherwise it opens an email with a written subject and body (`mailto:` with
the visitor's choices filled in), or, for a shop, it points at `#checkout` and the report
says it must be wired before launch. Never fake a payment form.

**No Chrome or Node 22.** Run `lint.mjs` (Node 18+), take screenshots with whatever browser
tool you have, and critique those. Say in the report that the inspector could not run.

**No network.** If `assets.mjs` reaches no source, draw the pictures and say in the report
that the open collections could not be searched.

## Files

| File | Read it when |
| --- | --- |
| `references/copy.md` | Writing the argument and the copy deck (steps 2 and 5). The two-line arithmetic. |
| `references/type.md` | Setting type: scales, tracking, measure, loading fonts, pairing. |
| `references/colour.md` | Applying the palette: roles, proportions, tone steps, dark pages, contrast. |
| `references/layout.md` | Grid, margins, rhythm, section variety, navigation, footer, the phone composition. |
| `references/imagery.md` | Choosing, finding, crediting, cropping and treating pictures; what to do with none. |
| `references/motion.md` | Step 9. Budget, tokens, recipes, reduced motion. |
| `references/critique.md` | Step 8. How to look, how to score, what to fix first. |
| `references/tells.md` | The dated registry of generated-page tells and what each is replaced by. |
| `scripts/draw.mjs` | Deals and reprints the direction; `--redraw <slot> --reason "…"` swaps a slot; `--photos`, `--site <id>` for more references. |
| `scripts/assets.mjs` | Step 6: searches open collections for real pictures of the subject's world; `--get` downloads with the credit, `--credits` prints them. |
| `scripts/lint.mjs` · `scripts/inspect.mjs` | The gate. |
| `scripts/preflight.mjs` | Step 0: what can this machine run, and which ladder to follow. |
| `scripts/tokens.mjs` | Emits the `:root` tokens and font links from the dealt sheet. |
| `scripts/report.mjs` · `scripts/doctor.mjs` | Step 10: the drafted report; and where any build stands. |
| `scripts/state.mjs` · `scripts/env.mjs` | The build-state store and environment probing the scripts share. |
| `assets/base.css` · `assets/base.js` | An optional neutral foundation to build on. |
| `library/` | The data the draw reads: directions, palettes, heroes, sections, type systems, motions, sectors, studied sites. Do not read it whole; use the script. |
