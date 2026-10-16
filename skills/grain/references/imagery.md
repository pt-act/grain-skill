# Imagery

Finding, choosing and treating real pictures. The floor: at least four real pictures, usually six to twelve. Drawings do not count toward the floor.

## §1 The order of preference

1. **The project's own photographs** — of the place, the people, the work. These outrank everything.
2. **Generated images**, if the project has an image tool.
3. **Real pictures from the open collections** — found with `scripts/assets.mjs`, credited on the page. Better than anything drawn, when an honest one exists.
4. **Drawn in code from the subject itself** — for what no honest picture exists of: its objects, its tiles, its windows, its interface. One consistent flat graphic language, in the palette's real colours.
5. **Honestly generic photographs** — the sea for a sea house, the grain for a bakery — never standing in for the subject itself.
6. **Type and colour alone.**

Models skip pictures and footage because finding them is work. The page fails without them. Do not skip them.

## §2 Searching the open collections

```bash
node <skill>/scripts/assets.mjs "<query>"
node <skill>/scripts/assets.mjs --video "<query>"
node <skill>/scripts/assets.mjs --get <ref>
node <skill>/scripts/assets.mjs --credits
```

Sources: Openverse (which aggregates Flickr, Wikimedia Commons mirrors, Europeana, the Met, the Art Institute of Chicago and more) and Wikimedia Commons directly. Only public-domain, CC0, CC BY and CC BY-SA files are kept by default; `--all` includes the rest, and `--video` searches for a moving clip. No API key. The script caches nothing about licences beyond what the APIs report — a found picture shows the world around the client and is never presented as the client's own product, room, dish, person or team.

Search the **inventory, not the category**. Category searches return the category's postcard; inventory searches return the subject's world:

- its street in old postcards, an old map of the neighbourhood
- its material up close: the leather, the clay, the wood grain, the glaze
- its trade in engravings: the oven, the loom, the press, the still
- a museum object of its kind: the tool, the vessel, the machine
- a botanical plate, a star chart, a timetable, a ticket

Look at each picture before choosing. A technically-available picture of the wrong place is worse than no picture.

## §3 Crops and treatments

- Same crop ratios across a set of plates, same treatment. The eye reads consistency as intent.
- Square or near-square corners unless the direction says otherwise; no rounded "card" corners, no frames-within-frames, no borders.
- One treatment only: colour as found, or one consistent duotone derived from the palette. Not both.
- A neutral scrim under text on a photograph is the one legal gradient, and it is a scrim — it goes under the text and nowhere else.

## §4 Using them

One dominant image beats six small ones. Use a found picture large and with intent: an archival photograph as the hero; an engraving enlarged into the page's motif; the real map of the street as the contact section. Small pictures in rows read as decoration; large pictures read as places.

Never lie on top of a headline or a statement — the inspector fails it. Text on a picture gets a scrim, or sits on the ground beside it.

## §5 Credits

Every found picture is downloaded into the project's `assets/` folder, credited in the footer at the smallest type on the page, and listed in the report. `assets.mjs --credits` prints the lines. The credit carries: title, creator, licence, source page. Not the client's own pictures — those belong to the client and need no credit, but say so in the report.

## §6 Video

One moving picture wherever an honest clip exists: a muted loop with a poster frame (a still from the clip or a found photograph), `playsinline`, `autoplay` muted. Never autoplaying with sound. The poster frame must be as composed as a still — a video whose first frame is a black void is a broken picture.

## §7 Interface fragments

A real interface — the product's own — is the honest picture for software. Cropped fragments of it count toward the floor. A fragment whose root carries `data-ui` keeps its own borders and menus; the house rules leave it alone. A fake dashboard of grey bars is banned.

## §8 Drawing in code

What no honest picture exists of, draw: the subject's object in cross-section, its tiles as a pattern, its windows as a motif, its label as type. One graphic language, in the palette's real colours, at real scale. A careful drawing of the subject is better than a generic photograph; a generic photograph is better than a careless drawing.
