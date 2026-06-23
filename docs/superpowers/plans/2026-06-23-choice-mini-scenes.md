# Choice Mini-Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic choice artwork with a semantic inline SVG scene for every existing art key.

**Architecture:** `js/choice-illustrations.js` owns a complete art-key map and returns decorative SVG markup. `js/app.js` renders that SVG inside each native button, while the existing data module retains ownership of labels and scoring.

**Tech Stack:** ES modules, inline SVG, Node test runner.

## Global Constraints

- Do not change question wording, scores, result profiles, or network behaviour.
- Do not use emoji, external images, or SVG URLs.
- Every art key present in `questions` must have a mapped SVG scene.

### Task 1: Test and implement illustration coverage

**Files:**
- Create: `js/choice-illustrations.js`
- Modify: `tests/quiz-engine.test.js`

- [ ] Add a failing test that compares all distinct `questions.flatMap(({ choices }) => choices.map(({ art }) => art))` values to `Object.keys(illustrations)`.
- [ ] Run `rtk npm test`; expect failure because the illustration module is absent.
- [ ] Implement `illustrations` and `renderChoiceIllustration(art)`, returning a complete `viewBox="0 0 120 90"` SVG made from ink outlines, filled objects, and action marks for each art key.
- [ ] Run `rtk npm test`; expect all tests to pass.

### Task 2: Render mini scenes in cards

**Files:**
- Modify: `js/app.js`
- Modify: `style.css`

- [ ] Replace the empty `.choice-art` span with `renderChoiceIllustration(choice.art)`.
- [ ] Size the SVG to the upper portion of each card and retain the Thai caption below it.
- [ ] Run `rtk npm test` and `rtk node --check js/app.js`; expect success.
