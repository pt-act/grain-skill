export const MOTIONS = [
  {
    id: 'rise-stagger',
    name: 'Rise, Staggered',
    recipe: 'Each block enters in order — heading, then text, then picture — rising 16–24px with opacity, 60–90ms apart, once, as the section crosses 85% of the viewport.',
    css: 'transform: translateY(18px); opacity: 0; transition: transform .6s cubic-bezier(.2,.6,.2,1), opacity .6s;',
    reduced: 'Everything visible; travel dropped.',
  },
  {
    id: 'clip-reveal',
    name: 'Clip Reveal',
    recipe: 'Each piece is revealed by a clip-path inset that opens from the direction the content "hangs" — from the top for a wall, from the left for a bench. 500ms, ease-out.',
    css: 'clip-path: inset(0 0 100% 0); transition: clip-path .5s cubic-bezier(.2,.6,.2,1);',
    reduced: 'Everything visible.',
  },
  {
    id: 'slow-drift',
    name: 'Slow Drift',
    recipe: 'The hero or a plate holds a barely perceptible scale (1 → 1.06) over 12–20s, or translates a few pixels against scroll. One plate per screen at most.',
    css: 'animation: drift 18s ease-in-out infinite alternate; @keyframes drift { to { transform: scale(1.06); } }',
    reduced: 'No animation; the plate at rest.',
  },
  {
    id: 'draw-on',
    name: 'Draw On',
    recipe: 'A line drawing extends: stroke-dashoffset animates from full to zero as its section enters. The drawing must be one consistent line weight.',
    css: 'stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.2s ease-out;',
    reduced: 'The drawn state, at rest.',
  },
  {
    id: 'spot-follow',
    name: 'Spot Follow',
    recipe: 'The lit object dims to half as the next lights. Implemented as a scroll-linked opacity crossfade between the current and next section\'s lit element, over 300ms.',
    css: 'opacity crossfade, scroll-driven, 300ms ease',
    reduced: 'All elements at full opacity.',
  },
  {
    id: 'march',
    name: 'The March',
    recipe: 'A short line of type or a row of small things moves a fixed distance on loop — a ticker of the subject\'s own words: its words, its cities, its dates. Slow, one direction, one line.',
    css: 'marquee loop, 24–40s linear, one direction',
    reduced: 'The first frame, static.',
  },
  {
    id: 'settle',
    name: 'The Settle',
    recipe: 'The hero\'s title is set: each line rises and its ink goes from 40% to 100% as the previous line settles. The page\'s largest typographic moment, on load only.',
    css: 'opacity .4 → 1 with translateY 12px → 0, lines staggered 120ms',
    reduced: 'The title at rest.',
  },
  {
    id: 'turn',
    name: 'The Turn',
    recipe: 'A facing page or a card turns in 3D as its section enters — 8deg rotateY, 600ms. One per page, on the showcase only.',
    css: 'transform: perspective(1200px) rotateY(8deg); → rotateY(0); .6s ease-out',
    reduced: 'The turned state, flat.',
  },
];

export const MOTION_BY_ID = Object.fromEntries(MOTIONS.map((m) => [m.id, m]));
