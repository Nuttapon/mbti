# Choice Mini-Scene Illustration Design

## Goal

Make every quiz choice understandable from its illustration before a player reads its Thai caption.

## Scope

- Replace the generic CSS glyph inside each choice card with a semantic inline SVG mini scene.
- Reuse the existing `art` key in every question choice as the illustration identifier.
- Create `js/choice-illustrations.js`, exporting one renderer that returns the SVG markup for an `art` key.
- Keep existing question copy, answer values, MBTI scoring, result copy, and share-card flow unchanged.
- Keep SVG decorative (`aria-hidden="true"`); the existing Thai button label remains the accessible name.

## Visual Contract

Each scene contains an immediately recognisable object and action using the existing dark ink outline, flat pastel fills, and rounded shapes. Examples: `megaphone` shows a character using a megaphone, `cave` shows a character retreating into a cave, `grill` shows a tabletop grill, and `calendar` shows a dated planner. The illustration occupies the upper half of the choice card; the caption remains visibly separated beneath it.

No emoji, image asset, SVG URL, or network request is used. Unknown illustration keys render a neutral labelled fallback only during development; the test suite prevents one from reaching a released question.

## Verification

- Add a test that the set of `art` values used by `questions` is fully covered by the illustration map.
- Run `npm test`.
- Check one E/I, S/N, T/F, and J/P question at phone width to confirm scenes are recognisable, captions stay readable, and cards remain a 2 by 2 grid.
