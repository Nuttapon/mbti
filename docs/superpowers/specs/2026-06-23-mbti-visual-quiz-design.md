# MBTI Visual Quiz Design

## Goal

Create a mobile-first, standalone Thai interactive personality quiz. It produces one of the 16 MBTI types, but presents the outcome as a playful, creative, non-clinical entertainment experience. Players answer 24 image-led questions and can share a vertical result card.

## Scope

- Build with plain HTML, CSS, and JavaScript; no build step or external dependency is required.
- Use 24 questions, with six questions contributing to each MBTI axis: E/I, S/N, T/F, and J/P.
- Show one question at a time with four illustrated choices arranged in a 2 by 2 grid.
- Use CSS illustrations and decorative shapes rather than external image assets.
- Generate all 16 MBTI outcomes, with Thai creative names, an MBTI label, and humorous descriptions.
- Provide native sharing where `navigator.share` is available, with PNG download as the fallback.

## Out of Scope

- Psychological diagnosis, a claim of scientific accuracy, accounts, analytics, server storage, or persistence after page refresh.
- A question editor, configurable score model, localization, or more than one quiz.

## Experience and Visual Direction

The landing screen introduces the quiz with the message "MBTI ไม่แม่น แต่แซวแม่น" and a clear start button. It states that there are no right or wrong choices.

The quiz uses everyday comic scenarios rather than formal personality-test phrasing. Every answer is a colourful, tappable card with a compact caption and a CSS-made illustration. Selection gives immediate visual acknowledgement and transitions to the next question. A progress indicator, question count, and back button keep completion predictable.

The visual theme is a summer notebook-sticker collage: warm cream background, lime yellow, coral pink, sea blue, and dark ink outlines. The type system must support Thai clearly. The composition prioritises a comfortable 2 by 2 touch grid on a portrait phone and adapts to wider screens without changing the interaction model.

## Result Experience

The answer totals map to an MBTI code. The result screen presents a playful Thai archetype name, such as "นักวางแผนสายป่วน (ENTJ)", then short sections for defining traits, energy-draining moments, party skill, and a light-hearted warning. Copy avoids presenting the result as factual assessment.

The result is also rendered as a 9:16 portrait share card. A Share button uses the Web Share API for supported browsers. A download button saves a PNG share card otherwise. Restart resets all answers and returns the player to the opening screen.

## Implementation Structure

### `index.html`

Contains the three application states (intro, question, result), semantic controls, and a canvas reserved for result-card rendering.

### `style.css`

Defines the mobile-first layout, palette variables, responsive 2 by 2 choice grid, CSS illustrations, interaction motion, focus styling, and `prefers-reduced-motion` behaviour.

### `app.js`

Holds question and outcome data. It tracks answers in memory, updates the four axis scores, calculates the final MBTI code, renders state changes, creates the share image, and invokes native share or download.

## Data and Scoring

Each question belongs to one of the four MBTI axes. Its four options contribute weighted values to the paired traits. The question wording and option ordering do not reveal the intended trait. A selected option is stored by question index; navigating backward replaces its previous contribution rather than adding another score. A deterministic tie-breaker produces one of the 16 types for every completed quiz.

No personal data is collected or transmitted. All state exists only in the current page session.

## Accessibility and Compatibility

- Choice cards are native buttons with usable keyboard focus and labels.
- Colour is not the sole indication of selection.
- Text and controls maintain readable contrast.
- Decorative illustrations are hidden from assistive technology.
- Non-essential animations respect `prefers-reduced-motion`.
- The sharing path degrades gracefully to PNG download when native sharing is unavailable.

## Verification

- Use controlled answer sets to confirm each of the 16 MBTI codes can be produced.
- Confirm selecting an answer, going back, and changing it does not double-count scores.
- Check portrait mobile layouts and responsive desktop layouts for the intro, question, and result screens.
- Check keyboard navigation, visible focus, and reduced-motion behaviour.
- Test both native-share availability and PNG-download fallback.

## Acceptance Criteria

1. A player can complete 24 Thai, image-led questions on a phone without needing to read long instructions.
2. Each question has four prominent visual choices in a 2 by 2 grid.
3. Completion always shows one creative Thai result corresponding to an MBTI code.
4. The result can be shared through native sharing or downloaded as a 9:16 image.
5. The experience is responsive, accessible, has no network dependency, and is clearly framed as entertainment.
