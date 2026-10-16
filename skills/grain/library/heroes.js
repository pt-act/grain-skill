export const HEROES = [
  {
    id: 'full-bleed',
    name: 'Full Bleed',
    build: [
      'One photograph covers the whole first screen; nothing else is on the ground.',
      'The title sits over it, bottom-left, with a neutral scrim only where the photograph is busy.',
      'The title runs to two lines at most; everything else on the screen is the picture.',
    ],
    image: 'one photograph, full-bleed',
    motionNote: 'The photograph may hold a slow drift; the title does not move on entry.',
  },
  {
    id: 'split',
    name: 'Split',
    build: [
      'The screen is divided by a hard vertical edge: type on one side, image on the other.',
      'The type side is flat ground at full size; the image side runs to both edges.',
      'The edge never sits at 50%: 40/60 or 60/40, chosen by which side carries the weight.',
    ],
    image: 'one photograph, hard-cropped to its half',
    motionNote: 'The image wipes in from the edge; the title rises after it lands.',
  },
  {
    id: 'object-centre',
    name: 'Object Centre',
    build: [
      'One thing — the subject, its product, its tool — is set huge on a flat ground, dead centre.',
      'The title sits beneath or beside it at the page\'s largest size; nothing competes.',
      'The object is a real photograph or a careful drawing, never an icon or an abstract shape.',
    ],
    image: 'one object, large, on flat ground',
    motionNote: 'The object enters by scale; the title is already there and does not move.',
  },
  {
    id: 'window',
    name: 'Window',
    build: [
      'The page\'s content sits inside one large frame — a window, an arch, a doorway — set on a field of flat colour.',
      'The frame is built from the geometry of the subject\'s own place: its door, its window, its sign.',
      'Outside the frame, the ground carries only the wordmark and the one action.',
    ],
    image: 'the subject\'s architecture, as a frame',
    motionNote: 'The frame holds still; the content inside it rises once.',
  },
  {
    id: 'overlay-mix',
    name: 'Overlay Mix',
    build: [
      'The title is set directly over the photograph and mixes with it — difference or exclusion blend, or the type knocked out of the image.',
      'Legibility is earned by contrast of scale and tone, never by a box behind the words.',
      'Used once per page, on the hero only.',
    ],
    image: 'one photograph, with the title inside it',
    motionNote: 'Still. A mixing hero that moves is a page that cannot be read.',
  },
  {
    id: 'columns',
    name: 'Columns',
    build: [
      'The hero is set as three or four columns of running text beneath one full-width headline.',
      'The columns are separated by space, not rules; the headline spans all of them.',
      'One column may be set in the accent to carry the essential fact — the date, the place, the price.',
    ],
    image: 'none in the hero; plates begin in the first section',
    motionNote: 'Columns rise one after another, left to right.',
  },
  {
    id: 'margin',
    name: 'Margin',
    build: [
      'A wide left or right margin carries the small matter — captions, figures, a note — while the main content holds the other two-thirds.',
      'The margin is not a sidebar of boxes; it is one continuous column of small set type.',
      'The alignment between margin and content is exact: they share a baseline grid.',
    ],
    image: 'photographs set within the content column, full-width of it',
    motionNote: 'Content rises; the margin fades in after.',
  },
  {
    id: 'spread',
    name: 'Spread',
    build: [
      'The hero looks like an open book: a hard centre fold, two facing pages, each with its own composition.',
      'The left page holds the title and the statement; the right holds the one image.',
      'On a phone the spread becomes a stack, left page first.',
    ],
    image: 'one photograph on the right page',
    motionNote: 'The spread opens: the left page settles, the right page turns in after.',
  },
  {
    id: 'stack',
    name: 'Stack',
    build: [
      'Type stacked above a full-width image, each block at its own size, all sharing one left edge.',
      'The stack is the whole hero: wordmark, headline, statement, action, then the picture.',
      'The image runs edge to edge beneath the stack.',
    ],
    image: 'one photograph, full-width, below the type',
    motionNote: 'The stack sets line by line; the image rises beneath it last.',
  },
  {
    id: 'triptych',
    name: 'Triptych',
    build: [
      'Three vertical panels, each a different view of the same subject, hard edges between them.',
      'The centre panel carries the title; the outer panels carry photographs.',
      'All three are cropped from the same world — same light, same season, same material.',
    ],
    image: 'three photographs, hard side by side',
    motionNote: 'The outer panels slide in from their sides; the centre is still.',
  },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));
