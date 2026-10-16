# Type

Set type for the direction sheet's system. Short form; the laws in SKILL.md are the summary.

## §1 The scale

Three sizes do the visible work. A typical strong page:

| Role | Desktop | Phone | Use |
| --- | --- | --- | --- |
| display | 64–110px, leading 0.95–1.05, tracking -0.02 to -0.05em | 40–56px | the headline, and only the headline |
| statement | 28–36px, leading 1.2, tracking normal | 22–24px | one supporting sentence |
| text | 16–20px, leading 1.45–1.6 | 15–17px | everything else |
| caption | 13–15px, leading 1.4 | same | captions, credits, marginal notes |

Five sizes is the ceiling. If a fourth role appears, merge it into one of the above with weight or case, not size. Nothing between 20 and 28px — that dead zone is where hierarchy goes to die.

Running text at 15px minimum on a phone, 16px on desktop. Below that the inspector fails. Grey is for captions; running text is in the full ink.

## §2 Measure and leading

- Display: leading 0.85–1.05. Large type with airy leading looks like a poster with a bug.
- Text: leading 1.45–1.6, measure 45–75 characters. At 18px that is 520–700px of measure.
- Captions: leading 1.4, may run narrower.

## §3 Alignment

Left-aligned by default. Centred at most one moment on the page (a title, a closing). Centring more than that makes a page a pamphlet.

Numbers that align — prices, dates, figures — get tabular numerals (`font-variant-numeric: tabular-nums`) in the text face or the dealt mono (technical-grotesk only).

## §4 Pairing

One family is normal. Two is the limit: one for display, one for text. A second display face is a third voice and the page starts arguing with itself. The dealt type systems in `library/type-systems.js` are the approved combinations.

## §5 Loading fonts

Load from the URL the sheet gives. One request, the weights actually used:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…">
```

Display faces at weights 300–700 are usually enough; do not load the full axis. If the page must work offline, self-host the weights used. `document.fonts.status` must be `loaded` before the inspector measures — it fails a page still loading fonts.

## §6 Faces and places

A face carries a date. Didone says 1920s Milan; old style says the monastery; grotesk says the transit map; the heavy condensed grotesk says the factory notice. The sheet deals a system whose date matches the subject's. If the subject's own shopfront has lettering, it outranks any dealt face: set the headline in a face close to it, and say so in the report.
